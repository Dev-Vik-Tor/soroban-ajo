'use client'

import React from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Wallet, Calendar } from 'lucide-react'
import type { DashboardStats } from '@/hooks/useDashboard'

interface DashboardHeroProps {
  stats: DashboardStats
  isLoading: boolean
  address?: string
}

const statItems = (stats: DashboardStats) => [
  {
    label: 'Total Saved',
    value: `${stats.totalSavingsXLM.toLocaleString()} XLM`,
    icon: Wallet,
    color: 'text-emerald-300',
  },
  {
    label: 'Active Groups',
    value: stats.activeGroupsCount,
    icon: Users,
    color: 'text-blue-300',
  },
  {
    label: 'Next Payout',
    value: stats.upcomingPayouts[0] ? `${stats.upcomingPayouts[0].daysUntil}d` : 'None',
    icon: Calendar,
    color: 'text-amber-300',
  },
  {
    label: 'Contributions',
    value: stats.pendingContributionsCount,
    icon: TrendingUp,
    color: 'text-pink-300',
  },
]

export const DashboardHero: React.FC<DashboardHeroProps> = ({ stats, isLoading, address }) => {
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        {/* Left: greeting */}
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Welcome back{shortAddr ? ',' : ''}
          </h1>
          {shortAddr && (
            <p className="mt-1 text-white/60 font-mono text-sm">{shortAddr}</p>
          )}
          <p className="mt-2 text-white/70 text-sm max-w-sm">
            Track your savings groups, contributions, and payouts all in one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/groups/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-white/90 transition-colors shadow-sm"
            >
              + New Group
            </Link>
            <Link
              href="/groups"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white font-semibold text-sm rounded-xl hover:bg-white/25 transition-colors border border-white/20"
            >
              Browse Groups
            </Link>
          </div>
        </div>

        {/* Right: stat pills */}
        <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
          {statItems(stats).map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <p className="text-white/60 text-xs font-medium">{label}</p>
              </div>
              {isLoading ? (
                <div className="h-6 w-16 rounded bg-white/20 animate-pulse" />
              ) : (
                <p className="text-xl font-extrabold leading-none">{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
