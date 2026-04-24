'use client'

// Issue #595: Redesign Dashboard with Modern UI
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutGrid, List, Search, Plus, ArrowRight,
  TrendingUp, Users, Wallet, BarChart2, Bell, Settings,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { SavingsTrendChart } from '@/components/dashboard/SavingsTrendChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { SkeletonCard } from '@/components/skeletons'
import { lazyLoad } from '@/utils/lazyLoad'

const GroupsGrid = lazyLoad(
  () => import('@/components/GroupsGrid').then((m) => ({ default: m.GroupsGrid })),
  { loading: () => <SkeletonCard /> }
)
const GroupsList = lazyLoad(
  () => import('@/components/GroupsList').then((m) => ({ default: m.GroupsList })),
  { loading: () => <SkeletonCard /> }
)

const QUICK_ACTIONS = [
  { label: 'New Group', href: '/groups/create', icon: Plus, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Explore', href: '/groups', icon: Users, gradient: 'from-pink-500 to-rose-500' },
  { label: 'Transactions', href: '/transactions', icon: TrendingUp, gradient: 'from-amber-500 to-orange-500' },
  { label: 'Analytics', href: '/analytics', icon: BarChart2, gradient: 'from-teal-500 to-cyan-500' },
  { label: 'Notifications', href: '/notifications', icon: Bell, gradient: 'from-violet-500 to-purple-500' },
  { label: 'Settings', href: '/profile', icon: Settings, gradient: 'from-slate-500 to-gray-600' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { address } = useAuth()
  const {
    viewMode, setViewMode,
    filterStatus, setFilterStatus,
    searchQuery, setSearchQuery,
    sortField, sortDirection, toggleSort,
    currentPage, setCurrentPage,
    totalPages, groups, totalGroups,
    isLoading, stats,
  } = useDashboard(address || undefined)

  const handleGroupClick = (groupId: string) => router.push(`/groups/${groupId}`)
  const handleJoinGroup = (groupId: string) => console.log('Join group:', groupId)

  const metrics = [
    {
      label: 'Total Saved',
      value: isLoading ? null : `${stats.totalSavingsXLM.toLocaleString()} XLM`,
      icon: <Wallet className="w-5 h-5" />,
      gradient: 'from-emerald-500 to-teal-600',
      trend: { value: 'Lifetime total', positive: true },
    },
    {
      label: 'Active Groups',
      value: isLoading ? null : stats.activeGroupsCount,
      icon: <Users className="w-5 h-5" />,
      gradient: 'from-indigo-500 to-purple-600',
      trend: { value: 'All time', positive: true },
    },
    {
      label: 'Next Payout',
      value: isLoading ? null : (stats.upcomingPayouts[0] ? `${stats.upcomingPayouts[0].daysUntil} days` : 'None'),
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Contributions',
      value: isLoading ? null : stats.pendingContributionsCount,
      icon: <BarChart2 className="w-5 h-5" />,
      gradient: 'from-pink-500 to-rose-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* ── Hero ── */}
        <DashboardHero stats={stats} isLoading={isLoading} address={address ?? undefined} />

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <MetricCard
              key={m.label}
              label={m.label}
              value={m.value ?? '—'}
              icon={m.icon}
              gradient={m.gradient}
              trend={m.trend}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* ── Charts + Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Savings trend chart — 2/3 width */}
          <div className="lg:col-span-2">
            <SavingsTrendChart groups={groups ?? []} isLoading={isLoading} />
          </div>

          {/* Quick actions — 1/3 width */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map(({ label, href, icon: Icon, gradient }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br ${gradient} text-white text-xs font-semibold hover:opacity-90 hover:scale-[1.03] transition-all duration-200 shadow-sm aspect-square`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Activity + Upcoming Payouts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent groups activity */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Recent Groups</h3>
            <RecentActivity groups={groups ?? []} isLoading={isLoading} />
          </div>

          {/* Upcoming payouts */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Upcoming Payouts</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />
                ))}
              </div>
            ) : stats.upcomingPayouts.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming payouts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingPayouts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{p.groupName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.daysUntil === 0 ? 'Today' : `In ${p.daysUntil} days`}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {p.amountXLM} XLM
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Groups section ── */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Groups</h2>
              {!isLoading && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {totalGroups} group{totalGroups !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <Link
              href="/groups/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              New Group
            </Link>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'active', 'completed', 'paused'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filterStatus === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1 self-start">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Groups content */}
          {!isLoading && (groups ?? []).length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">No groups found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first savings group to get started'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Link
                  href="/groups/create"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Group
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <GroupsGrid groups={groups ?? []} isLoading={isLoading} onGroupClick={handleGroupClick} />
          ) : (
            <GroupsList
              groups={groups ?? []}
              isLoading={isLoading}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={toggleSort}
              onGroupClick={handleGroupClick}
              onJoinGroup={handleJoinGroup}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                ← Prev
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
