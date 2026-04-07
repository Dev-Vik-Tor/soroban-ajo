import React from 'react'
import { GroupCard } from './GroupCard'
import { FilterBar } from './FilterBar'
import { InfiniteScroll } from './InfiniteScroll'
import { Skeleton } from './Skeleton'
import { useGroupDiscovery } from '@/hooks/useGroupDiscovery'

export function DiscoveryFeed() {
  const { 
    groups, 
    loading, 
    hasMore, 
    loadMore, 
    filters, 
    updateFilters,
    toggleBookmark 
  } = useGroupDiscovery()

  const handleShare = (groupName: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${groupName} on Soroban Ajo`,
        text: `Check out this savings group: ${groupName}`,
        url: window.location.href,
      }).catch(console.error)
    } else {
      alert(`Sharing link for ${groupName} copied to clipboard! (Simulated)`)
    }
  }

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} onUpdate={updateFilters} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfiniteScroll
          dataLength={groups.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[280px]" />
              ))}
            </div>
          }
        >
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              groupId={group.id}
              groupName={group.name}
              category={group.category}
              memberCount={group.currentMembers}
              maxMembers={group.maxMembers}
              totalContributions={group.contributionAmount}
              nextPayout={group.nextPayoutDate}
              status={group.status as any}
              isBookmarked={group.isBookmarked}
              onBookmark={() => toggleBookmark(group.id)}
              onShare={() => handleShare(group.name)}
              onClick={() => window.open(`/groups/${group.id}`, '_self')}
            />
          ))}
        </InfiniteScroll>
      </div>

      {!loading && groups.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No groups matched your discovery filters.</p>
          <button 
            onClick={() => updateFilters({ category: 'All' })}
            className="mt-4 text-primary-600 font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
