'use client'

import { api } from '@/trpc/client'
import { Loader2, Search } from 'lucide-react'

import { PokemonSummary } from '@/lib/pokeapi'

import PokemonCard from './PokemonCard'
import { Button } from './ui/button'

interface PokemonSearchResultsProps {
  query: string
  onPokemonClick?: (pokemon: { id: number; name: string }) => void
}

export default function PokemonSearchResults({ query, onPokemonClick }: PokemonSearchResultsProps) {
  const { data, isLoading, error, refetch } = api.pokemon.search.useQuery(
    { query, limit: 20 },
    { enabled: query.length > 0 }
  )

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-600">Search for Pokémon</h3>
        <p className="text-sm text-gray-500">Enter a Pokémon name to start searching</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Searching for &ldquo;{query}&rdquo;...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to search Pokémon</p>
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
        <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-600">No Pokémon found</h3>
        <p className="text-sm text-gray-500">
          No Pokémon match your search for &ldquo;{query}&rdquo;. Try a different name.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found {data?.count} result{data?.count !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
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
