'use client'

import { api } from '@/trpc/client'
import { Filter, Loader2, Search } from 'lucide-react'

import { PokemonSummary } from '@/lib/pokeapi'

import PokemonCard from './PokemonCard'
import { Button } from './ui/button'

interface PokemonFilteredResultsProps {
  searchQuery: string
  selectedType: string | null
  onPokemonClick?: (pokemon: { id: number; name: string }) => void
}

export default function PokemonFilteredResults({
  searchQuery,
  selectedType,
  onPokemonClick
}: PokemonFilteredResultsProps) {
  // Choose the appropriate query based on what filters are active
  const hasSearch = searchQuery.length > 0
  const hasTypeFilter = selectedType !== null

  // Combined search + filter
  const combinedQuery = api.pokemon.searchAndFilter.useQuery(
    {
      query: searchQuery,
      type: selectedType,
      limit: 20
    },
    { enabled: hasSearch && hasTypeFilter }
  )

  // Search only
  const searchQuery2 = api.pokemon.search.useQuery(
    {
      query: searchQuery,
      limit: 20
    },
    { enabled: hasSearch && !hasTypeFilter }
  )

  // Type filter only
  const typeQuery = api.pokemon.filterByType.useQuery(
    {
      type: selectedType!,
      limit: 20
    },
    { enabled: !hasSearch && hasTypeFilter }
  )

  // Determine which query to use
  let data, isLoading, error, refetch

  if (hasSearch && hasTypeFilter) {
    data = combinedQuery.data
    isLoading = combinedQuery.isLoading
    error = combinedQuery.error
    refetch = combinedQuery.refetch
  } else if (hasSearch && !hasTypeFilter) {
    data = searchQuery2.data
    isLoading = searchQuery2.isLoading
    error = searchQuery2.error
    refetch = searchQuery2.refetch
  } else if (!hasSearch && hasTypeFilter) {
    data = typeQuery.data
    isLoading = typeQuery.isLoading
    error = typeQuery.error
    refetch = typeQuery.refetch
  } else {
    // No filters active - show empty state
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-600">Search or Filter Pokémon</h3>
        <p className="text-sm text-gray-500">Use the search bar or type filter to find Pokémon</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">
            {hasSearch && hasTypeFilter
              ? `Searching for "${searchQuery}" in ${selectedType} type...`
              : hasSearch
                ? `Searching for "${searchQuery}"...`
                : `Loading ${selectedType} type Pokémon...`}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to load Pokémon</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (data?.isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Filter className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-600">No Pokémon found</h3>
        <p className="text-sm text-gray-500">
          {hasSearch && hasTypeFilter
            ? `No ${selectedType} type Pokémon match "${searchQuery}"`
            : hasSearch
              ? `No Pokémon match "${searchQuery}"`
              : `No Pokémon found for ${selectedType} type`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found {data?.count} result{data?.count !== 1 ? 's' : ''}
          {hasSearch && ` for "${searchQuery}"`}
          {hasTypeFilter && ` in ${selectedType} type`}
        </p>
        {data?.hasMore && <p className="text-xs text-gray-500">Showing first 20 results</p>}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data?.pokemon.map((pokemon: PokemonSummary, index: number) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onClick={() => onPokemonClick?.(pokemon)}
            priority={index < 6}
          />
        ))}
      </div>
    </div>
  )
}
