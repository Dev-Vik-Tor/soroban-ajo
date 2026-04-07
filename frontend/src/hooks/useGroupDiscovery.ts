import { useState, useEffect, useCallback } from 'react'
import { Group } from '@/types'

// Mock categories for discovery
export const DISCOVERY_CATEGORIES = [
  'All',
  'Startup',
  'Education',
  'Real Estate',
  'Emergency Fund',
  'Travel',
  'Festivals',
  'Farming',
]

interface DiscoveryFilters {
  category: string
  minAmount: number
  maxAmount: number
  minDuration: number
  maxDuration: number
}

export function useGroupDiscovery() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<DiscoveryFilters>({
    category: 'All',
    minAmount: 0,
    maxAmount: 10000,
    minDuration: 0,
    maxDuration: 12,
  })

  // Simulated fetch function
  const fetchGroups = useCallback(async (pageNum: number, currentFilters: DiscoveryFilters) => {
    setLoading(true)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock data generation
    const mockGroups: Group[] = Array.from({ length: 10 }).map((_, i) => {
      const id = `discovery-${pageNum}-${i}`
      const category = DISCOVERY_CATEGORIES[Math.floor(Math.random() * (DISCOVERY_CATEGORIES.length - 1)) + 1]
      return {
        id,
        name: `${category} Group ${pageNum}-${i}`,
        description: `This is a personalized recommendation for ${category} based on your interest.`,
        creator: 'G...abc',
        cycleLength: 7,
        contributionAmount: Math.floor(Math.random() * 500) + 10,
        maxMembers: 12,
        currentMembers: Math.floor(Math.random() * 10) + 1,
        totalContributions: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        nextPayoutDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        frequency: 'weekly',
        duration: Math.floor(Math.random() * 6) + 1,
        category,
        isBookmarked: false,
      }
    })

    // Apply client-side filtering for the mock
    const filtered = mockGroups.filter((g) => {
      const matchesCategory = currentFilters.category === 'All' || g.category === currentFilters.category
      const matchesAmount = g.contributionAmount >= currentFilters.minAmount && g.contributionAmount <= currentFilters.maxAmount
      const matchesDuration = (g.duration || 0) >= currentFilters.minDuration && (g.duration || 0) <= currentFilters.maxDuration
      return matchesCategory && matchesAmount && matchesDuration
    })

    setGroups((prev) => (pageNum === 1 ? filtered : [...prev, ...filtered]))
    setHasMore(pageNum < 5) // Limit to 5 pages for mock
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    fetchGroups(1, filters)
  }, [filters, fetchGroups])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchGroups(nextPage, filters)
    }
  }, [loading, hasMore, page, fetchGroups, filters])

  const updateFilters = (newFilters: Partial<DiscoveryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const toggleBookmark = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isBookmarked: !g.isBookmarked } : g))
    )
  }

  return {
    groups,
    loading,
    hasMore,
    loadMore,
    filters,
    updateFilters,
    toggleBookmark,
  }
}
