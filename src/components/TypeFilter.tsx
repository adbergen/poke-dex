'use client'

import { api } from '@/trpc/client'
import { ChevronDown, Filter } from 'lucide-react'

interface TypeFilterProps {
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  className?: string
}

export default function TypeFilter({
  selectedType,
  onTypeChange,
  className = ''
}: TypeFilterProps) {
  const { data: typesData, isLoading, error } = api.pokemon.types.useQuery()

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading types...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-red-500">Failed to load types</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <select
          value={selectedType || ''}
          onChange={(e) => onTypeChange(e.target.value || null)}
          className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pr-8 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All Types</option>
          {typesData?.types.map((type) => (
            <option
              key={type.name}
              value={type.name}
            >
              {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )
}
