import React, { useEffect, useRef } from 'react'

interface InfiniteScrollProps {
  dataLength: number
  next: () => void
  hasMore: boolean
  loader: React.ReactNode
  children: React.ReactNode
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  dataLength,
  next,
  hasMore,
  loader,
  children,
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          next()
        }
      },
      { threshold: 1.0 }
    )

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [dataLength, hasMore, next])

  return (
    <>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="py-8 flex justify-center w-full min-h-[50px]">
          {loader}
        </div>
      )}
    </>
  )
}
