/**
 * analyze-queries.ts
 *
 * Runs EXPLAIN ANALYZE on common query patterns and reports
 * sequential scans, missing indexes, and slow queries.
 *
 * Usage: npx tsx backend/scripts/analyze-queries.ts
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '../src/utils/logger'

const prisma = new PrismaClient({ log: ['query'] })

interface QueryReport {
  query: string
  planningTime: number
  executionTime: number
  seqScans: string[]
  indexScans: string[]
}

async function explainQuery(label: string, sql: string): Promise<QueryReport> {
  const result: Array<{ 'QUERY PLAN': string }> = await prisma.$queryRawUnsafe(
    `EXPLAIN (ANALYZE, FORMAT JSON) ${sql}`
  )

  const plan = JSON.parse(JSON.stringify(result[0]['QUERY PLAN']))
  const planText = JSON.stringify(plan)

  const seqScans = [...planText.matchAll(/"Node Type":"Seq Scan","Relation Name":"(\w+)"/g)].map(
    (m) => m[1]
  )
  const indexScans = [
    ...planText.matchAll(/"Node Type":"Index Scan","Relation Name":"(\w+)"/g),
  ].map((m) => m[1])

  const planningTime = plan[0]?.['Planning Time'] ?? 0
  const executionTime = plan[0]?.['Execution Time'] ?? 0

  return { query: label, planningTime, executionTime, seqScans, indexScans }
}

async function main() {
  logger.info('Starting query analysis...\n')

  const queries: Array<{ label: string; sql: string }> = [
    {
      label: 'List active groups (paginated)',
      sql: `SELECT id, name, "contributionAmount", "isActive", "createdAt"
            FROM "Group" WHERE "isActive" = true
            ORDER BY "createdAt" DESC LIMIT 20 OFFSET 0`,
    },
    {
      label: 'Get group members',
      sql: `SELECT gm.*, u."walletAddress"
            FROM "GroupMember" gm
            JOIN "User" u ON u."walletAddress" = gm."userId"
            WHERE gm."groupId" = (SELECT id FROM "Group" LIMIT 1)`,
    },
    {
      label: 'Get contributions by group and round',
      sql: `SELECT * FROM "Contribution"
            WHERE "groupId" = (SELECT id FROM "Group" LIMIT 1)
            ORDER BY "createdAt" DESC LIMIT 20`,
    },
    {
      label: 'Get user goals by status',
      sql: `SELECT * FROM "Goal"
            WHERE "userId" = (SELECT "walletAddress" FROM "User" LIMIT 1)
            AND status = 'ACTIVE'
            ORDER BY "createdAt" DESC`,
    },
    {
      label: 'Get rewards by user and status',
      sql: `SELECT * FROM "Reward"
            WHERE "userId" = (SELECT "walletAddress" FROM "User" LIMIT 1)
            AND status = 'ACTIVE'
            ORDER BY "earnedAt" DESC`,
    },
    {
      label: 'Leaderboard lookup',
      sql: `SELECT * FROM "LeaderboardCache"
            WHERE "leaderboardType" = 'TOP_REFERRERS' AND period = 'MONTHLY'
            ORDER BY rank ASC LIMIT 10`,
    },
  ]

  const reports: QueryReport[] = []

  for (const q of queries) {
    try {
      const report = await explainQuery(q.label, q.sql)
      reports.push(report)
    } catch (err) {
      logger.warn(`Skipped "${q.label}": ${(err as Error).message}`)
    }
  }

  // Print report
  console.log('\n=== Query Analysis Report ===\n')
  for (const r of reports) {
    const slow = r.executionTime > 100
    const hasSeqScan = r.seqScans.length > 0

    console.log(`📊 ${r.query}`)
    console.log(`   Planning: ${r.planningTime.toFixed(2)}ms | Execution: ${r.executionTime.toFixed(2)}ms ${slow ? '⚠️  SLOW' : '✅'}`)
    if (hasSeqScan) {
      console.log(`   ⚠️  Sequential scans on: ${r.seqScans.join(', ')} — consider adding indexes`)
    }
    if (r.indexScans.length > 0) {
      console.log(`   ✅ Index scans on: ${r.indexScans.join(', ')}`)
    }
    console.log()
  }

  const slowQueries = reports.filter((r) => r.executionTime > 100)
  const seqScanQueries = reports.filter((r) => r.seqScans.length > 0)

  console.log(`Summary: ${reports.length} queries analyzed`)
  console.log(`  Slow (>100ms): ${slowQueries.length}`)
  console.log(`  Sequential scans: ${seqScanQueries.length}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  logger.error('Analysis failed', e)
  await prisma.$disconnect()
  process.exit(1)
})
