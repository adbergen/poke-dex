'use client'

import { useState } from 'react'

import PokemonGrid from '@/components/PokemonGrid'
import PokemonSearchResults from '@/components/PokemonSearchResults'
import SearchBar from '@/components/SearchBar'

export default function Home() {
  const [selectedPokemon, setSelectedPokemon] = useState<{ id: number; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handlePokemonClick = (pokemon: { id: number; name: string }) => {
    setSelectedPokemon(pokemon)
    console.log('Selected Pokemon:', pokemon)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query.trim())
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Pokédex</h1>
        <p className="text-gray-600">Discover and explore the world of Pokémon</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar
          onSearch={handleSearch}
          className="mx-auto max-w-md"
        />
      </div>

      {/* Content - either search results or main grid */}
      {searchQuery ? (
        <PokemonSearchResults
          query={searchQuery}
          onPokemonClick={handlePokemonClick}
        />
      ) : (
        <PokemonGrid onPokemonClick={handlePokemonClick} />
      )}

      {selectedPokemon && (
        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <p className="text-blue-800">
            Selected: {selectedPokemon.name} (ID: {selectedPokemon.id})
          </p>
        </div>
      )}
    </div>
  )
}
