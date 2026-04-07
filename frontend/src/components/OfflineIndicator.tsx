'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi, Clock } from 'lucide-react'
import { getPendingActionCount } from '../utils/syncManager'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    updatePendingCount()

    const handleOnline = async () => {
      setIsOnline(true)
      setShowNotification(true)
      await updatePendingCount()
      setTimeout(() => setShowNotification(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updatePendingCount = async () => {
    const count = await getPendingActionCount()
    setPendingCount(count)
  }

  if (!showNotification && isOnline) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-down ${
        isOnline
          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
          : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Back online</span>
          {pendingCount > 0 && (
            <span className="text-sm">({pendingCount} actions synced)</span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">You're offline</span>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{pendingCount} pending</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
