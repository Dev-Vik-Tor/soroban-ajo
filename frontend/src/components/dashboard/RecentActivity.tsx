import React from 'react'
import { Group } from '@/types'

interface RecentActivityProps {
  groups: Group[]
  isLoading?: boolean
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ groups, isLoading }) => {
  const recent = groups.slice(0, 5)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3 w-32 rounded bg-gray-200 dark:bg-slate-700 animate-pulse mb-1.5" />
              <div className="h-2.5 w-20 rounded bg-gray-100 dark:bg-slate-700/60 animate-pulse" />
            </div>
            <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-slate-700 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (recent.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No groups yet</p>
    )
  }

  return (
    <div className="space-y-2">
      {recent.map((group) => (
        <div
          key={group.id}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{group.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {group.currentMembers}/{group.maxMembers} members
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              group.status === 'active'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : group.status === 'paused'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
            }`}
          >
            {group.status}
          </span>
        </div>
      ))}
    </div>
  )
}
