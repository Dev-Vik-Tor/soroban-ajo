'use client'

import React, { useMemo } from 'react'
import { AreaChart } from '@/components/charts/AreaChart'
import type { Group } from '@/types'

interface SavingsTrendChartProps {
  groups: Group[]
  isLoading?: boolean
}

/** Generate last-6-month mock trend from real group data totals */
function buildTrendData(groups: Group[]) {
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
  const total = groups.reduce((s, g) => s + g.totalContributions, 0)
  // Distribute total across months with a realistic growth curve
  const weights = [0.08, 0.12, 0.16, 0.20, 0.22, 0.22]
  return months.map((month, i) => ({
    month,
    savings: Math.round(total * weights[i]),
    contributions: Math.round(total * weights[i] * 0.6),
  }))
}

export const SavingsTrendChart: React.FC<SavingsTrendChartProps> = ({ groups, isLoading }) => {
  const data = useMemo(() => buildTrendData(groups), [groups])

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5">
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-slate-700 animate-pulse mb-4" />
        <div className="h-48 rounded bg-gray-100 dark:bg-slate-700/50 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Savings Trend</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last 6 months</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
          ↑ Growing
        </span>
      </div>
      <AreaChart
        data={data}
        xAxisKey="month"
        height={180}
        showLegend={false}
        series={[
          { dataKey: 'savings', name: 'Total Saved', color: '#6366f1', strokeWidth: 2 },
          { dataKey: 'contributions', name: 'Contributions', color: '#10b981', strokeWidth: 2 },
        ]}
        yAxisFormatter={(v) => `${v} XLM`}
      />
    </div>
  )
}
