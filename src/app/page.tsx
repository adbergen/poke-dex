'use client'

import { useState } from 'react'

import FilterControls from '@/components/FilterControls'
import PokemonDetailModal from '@/components/PokemonDetailModal'
import PokemonFilteredResults from '@/components/PokemonFilteredResults'
import PokemonGrid from '@/components/PokemonGrid'

export default function Home() {
  const [selectedPokemon, setSelectedPokemon] = useState<{ id: number; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handlePokemonClick = (pokemon: { id: number; name: string }) => {
    setSelectedPokemon(pokemon)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedPokemon(null)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query.trim())
  }

  const handleTypeChange = (type: string | null) => {
    setSelectedType(type)
  }

  const handleReset = () => {
    setSearchQuery('')
    setSelectedType(null)
  }

  const hasActiveFilters = searchQuery.length > 0 || selectedType !== null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Pokédex</h1>
        <p className="text-gray-600">Discover and explore the world of Pokémon</p>
      </div>

      {/* Filter Controls */}
      <div className="mb-8">
        <FilterControls
          searchQuery={searchQuery}
          selectedType={selectedType}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
          onReset={handleReset}
        />
      </div>

      {/* Content - either filtered results or main grid */}
      {hasActiveFilters ? (
        <PokemonFilteredResults
          searchQuery={searchQuery}
          selectedType={selectedType}
          onPokemonClick={handlePokemonClick}
        />
      ) : (
        <PokemonGrid onPokemonClick={handlePokemonClick} />
      )}

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <PokemonDetailModal
          pokemonName={selectedPokemon.name}
          isOpen={modalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
