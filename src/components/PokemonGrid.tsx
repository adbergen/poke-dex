'use client'

import { useState } from 'react'

import { api } from '@/trpc/client'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import PokemonCard from './PokemonCard'
import { Button } from './ui/button'

interface PokemonGridProps {
  onPokemonClick?: (pokemon: { id: number; name: string }) => void
}

export default function PokemonGrid({ onPokemonClick }: PokemonGridProps) {
  const [currentOffset, setCurrentOffset] = useState(0)
  const limit = 20

  const { data, isLoading, error, refetch } = api.pokemon.list.useQuery({
    limit,
    offset: currentOffset
  })

  const handlePrevious = () => {
    if (data?.hasPrevious) {
      setCurrentOffset(data.previousOffset || 0)
    }
  }

  const handleNext = () => {
    if (data?.hasNext) {
      setCurrentOffset(data.nextOffset || currentOffset + limit)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading Pokémon...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="mb-4 text-red-600">Failed to load Pokémon data</p>
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

  if (!data?.pokemon.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">No Pokémon found</p>
      </div>
    )
  }

  const startIndex = currentOffset + 1
  const endIndex = Math.min(currentOffset + limit, data.count)

  return (
    <div className="space-y-6">
      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data.pokemon.map((pokemon, index) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onClick={() => onPokemonClick?.(pokemon)}
            priority={index < 6} // First 6 Pokemon cards get priority for LCP optimization
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startIndex}-{endIndex} of {data.count} Pokémon
        </p>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!data.hasPrevious}
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!data.hasNext}
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
