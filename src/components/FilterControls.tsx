'use client'

import { RotateCcw } from 'lucide-react'

import SearchBar from './SearchBar'
import TypeFilter from './TypeFilter'
import { Button } from './ui/button'

interface FilterControlsProps {
  searchQuery: string
  selectedType: string | null
  onSearchChange: (query: string) => void
  onTypeChange: (type: string | null) => void
  onReset: () => void
  className?: string
}

export default function FilterControls({
  searchQuery,
  selectedType,
  onSearchChange,
  onTypeChange,
  onReset,
  className = ''
}: FilterControlsProps) {
  const hasActiveFilters = searchQuery.length > 0 || selectedType !== null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Type Filter Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            onSearch={onSearchChange}
            placeholder="Search Pokémon..."
          />
        </div>

        <div className="w-full sm:w-48">
          <TypeFilter
            selectedType={selectedType}
            onTypeChange={onTypeChange}
          />
        </div>

        {hasActiveFilters && (
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>Active filters:</span>
          {searchQuery && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
              Search: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
          {selectedType && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
              Type: {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
