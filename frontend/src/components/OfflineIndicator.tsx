'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { useOfflineContext } from '@/context/OfflineContext'

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingCount } = useOfflineContext()
  const [visible, setVisible] = useState(false)
  const [justCameOnline, setJustCameOnline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setVisible(true)
      setJustCameOnline(false)
    } else if (isSyncing) {
      setVisible(true)
      setJustCameOnline(false)
    } else if (justCameOnline) {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(t)
    }
  }, [isOnline, isSyncing, justCameOnline])

  // Track transition from offline → online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      setJustCameOnline(true)
    }
  }, [isOnline, isSyncing])

  if (!visible) return null

  const isSyncingState = isSyncing && isOnline
  const isBackOnline = isOnline && !isSyncing && justCameOnline

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all animate-slide-down ${
        isSyncingState
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
          : isBackOnline
          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
          : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100'
      }`}
    >
      {isSyncingState ? (
        <>
          <RefreshCw className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span className="font-medium">Syncing</span>
          {pendingCount > 0 && (
            <span className="text-sm">({pendingCount} pending)</span>
          )}
        </>
      ) : isBackOnline ? (
        <>
          <Wifi className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">You're offline</span>
          {pendingCount > 0 && (
            <span className="text-sm ml-1">· {pendingCount} pending</span>
          )}
        </>
      )}
    </div>
  )
}
