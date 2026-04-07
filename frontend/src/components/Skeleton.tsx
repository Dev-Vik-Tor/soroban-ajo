import React from 'react'

interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-32 w-full' }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  )
}
