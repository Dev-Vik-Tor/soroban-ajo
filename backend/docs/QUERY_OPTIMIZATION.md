# Query Optimization Guide

## Overview

This document covers database query optimization strategies applied to the Ajo backend, including indexing decisions, N+1 resolution patterns, and query analysis tooling.

---

## Indexes Added

### `Group`
| Index | Columns | Reason |
|-------|---------|--------|
| `isActive_createdAt` | `isActive, createdAt DESC` | Paginated listing of active groups (most common query) |
| `name` | `name` | Group search by name |

### `GroupMember`
| Index | Columns | Reason |
|-------|---------|--------|
| `groupId` | `groupId` | Fetch all members of a group |
| `userId` | `userId` | Fetch all groups a user belongs to |

### `Goal`
| Index | Columns | Reason |
|-------|---------|--------|
| `userId_status` | `userId, status` | Filter user goals by status (most common) |
| `isPublic_status` | `isPublic, status` | Public goal discovery |
| `deadline` | `deadline` | Upcoming deadline queries |

### Pre-existing indexes (already present)
- `Contribution`: `[groupId, round]`, `txHash` (unique)
- `AnalyticsEvent`: `[eventType, timestamp]`, `[userId, timestamp]`, `[groupId, timestamp]`
- `UserMetrics`: `predictedChurn`, `churnScore`
- `GroupMetrics`: `predictedSuccess`, `riskScore`
- `UserGamification`: `points DESC`, `level`, `userId`
- `ActivityFeed`: `[userId, createdAt DESC]`
- `ChatMessage`: `[roomId, createdAt DESC]`, `[userId, createdAt DESC]`
- `Reward`: `[userId, status]`, `type`, `[source, sourceId]`, `expiresAt`
- `LeaderboardCache`: `[leaderboardType, period, rank]`

---

## N+1 Problem Resolution

### Pattern: Use `include` instead of sequential queries

**Before (N+1):**
```ts
const members = await prisma.groupMember.findMany({ where: { groupId } })
// N additional queries:
for (const m of members) {
  const user = await prisma.user.findUnique({ where: { id: m.userId } })
}
```

**After (single query):**
```ts
const members = await prisma.groupMember.findMany({
  where: { groupId },
  include: { user: { select: { walletAddress: true, createdAt: true } } },
})
```

### Pattern: Select only needed fields

```ts
// Instead of fetching entire User record:
const groups = await prisma.group.findMany({
  select: {
    id: true,
    name: true,
    contributionAmount: true,
    isActive: true,
    _count: { select: { members: true } },
  },
  where: { isActive: true },
})
```

### Pattern: Batch lookups with `findMany` + `in`

```ts
// Instead of N individual findUnique calls:
const users = await prisma.user.findMany({
  where: { walletAddress: { in: walletAddresses } },
})
const userMap = new Map(users.map(u => [u.walletAddress, u]))
```

---

## Pagination

All list endpoints use cursor-based or offset pagination. Always apply `take` + `skip`:

```ts
const results = await prisma.contribution.findMany({
  where: { groupId },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
})
```

---

## Query Analysis

Run the analysis script to identify slow queries:

```bash
npx tsx backend/scripts/analyze-queries.ts
```

The script connects to the database, runs `EXPLAIN ANALYZE` on common query patterns, and reports missing indexes and sequential scans.

---

## Prisma Query Logging

Enable in development by setting `DATABASE_LOG=true` in `.env`:

```ts
const prisma = new PrismaClient({
  log: process.env.DATABASE_LOG === 'true' ? ['query', 'warn', 'error'] : ['error'],
})
```
