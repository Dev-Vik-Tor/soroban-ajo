import React from 'react'
import { DISCOVERY_CATEGORIES } from '@/hooks/useGroupDiscovery'

interface FilterBarProps {
  filters: any
  onUpdate: (newFilters: any) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onUpdate }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onUpdate({ category: e.target.value })}
          className="w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {DISCOVERY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range ($)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => onUpdate({ minAmount: Number(e.target.value) })}
            placeholder="Min"
            className="w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => onUpdate({ maxAmount: Number(e.target.value) })}
            placeholder="Max"
            className="w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minDuration}
            onChange={(e) => onUpdate({ minDuration: Number(e.target.value) })}
            placeholder="Min"
            className="w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={filters.maxDuration}
            onChange={(e) => onUpdate({ maxDuration: Number(e.target.value) })}
            placeholder="Max"
            className="w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  )
}
