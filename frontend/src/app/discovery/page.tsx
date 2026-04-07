'use client'

import React from 'react'
import { DiscoveryFeed } from '@/components/DiscoveryFeed'
import { AppLayout } from '@/components/AppLayout'

export default function DiscoveryPage() {
  return (
    <AppLayout title="Discover Groups">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Discovery Feed
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Personalized recommendations based on your activity and preferences.
          </p>
        </div>
        
        <DiscoveryFeed />
      </div>
    </AppLayout>
  )
}
