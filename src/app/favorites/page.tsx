'use client'

import { useState } from 'react'

import Link from 'next/link'

import { api } from '@/trpc/client'
import { Heart, Loader2 } from 'lucide-react'

import FavoriteButton from '@/components/FavoriteButton'
import LoginPrompt from '@/components/LoginPrompt'
import PokemonCard from '@/components/PokemonCard'
import PokemonDetailModal from '@/components/PokemonDetailModal'
import { Button } from '@/components/ui/button'

export default function FavoritesPage() {
  const [selectedPokemon, setSelectedPokemon] = useState<{ id: number; name: string } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)

  const {
    data: favorites,
    isLoading,
    error,
    refetch
  } = api.favorites.list.useQuery(undefined, {
    retry: (failureCount, error) => {
      // Don't retry if unauthorized
      if (error.data?.code === 'UNAUTHORIZED') {
        setLoginPromptOpen(true)
        return false
      }
      return failureCount < 3
    }
  })

  const handlePokemonClick = (pokemon: { id: number; name: string }) => {
    setSelectedPokemon(pokemon)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedPokemon(null)
  }

  const handleAuthRequired = () => {
    setLoginPromptOpen(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your favorite Pokémon collection</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error?.data?.code === 'UNAUTHORIZED') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your favorite Pokémon collection</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">Login Required</h2>
          <p className="mb-6 text-gray-600">
            Please log in to view your favorite Pokémon collection.
          </p>
          <Button onClick={() => setLoginPromptOpen(true)}>Log In to Continue</Button>
        </div>

        <LoginPrompt
          isOpen={loginPromptOpen}
          onClose={() => setLoginPromptOpen(false)}
          message="Log in to view and manage your favorite Pokémon!"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your favorite Pokémon collection</p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="mb-4 text-red-600">Failed to load your favorites</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!favorites?.favorites.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600">Your favorite Pokémon collection</p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">No favorites yet</h2>
          <p className="mb-6 text-gray-600">
            Start exploring Pokémon and add them to your favorites collection!
          </p>
          <Button asChild>
            <Link href="/">Explore Pokémon</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">My Favorites</h1>
        <p className="text-gray-600">{favorites.count} favorite Pokémon in your collection</p>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {favorites.favorites.map((pokemon) => {
          // Convert the favorite data to match PokemonCard expected format
          const pokemonData = {
            id: parseInt(pokemon.id),
            name: pokemon.name,
            sprite: pokemon.sprite,
            types: [] // We don't store types in favorites, so empty array
          }

          return (
            <div
              key={pokemon.id}
              className="relative"
            >
              <PokemonCard
                pokemon={pokemonData}
                onClick={() => handlePokemonClick(pokemonData)}
                priority={false}
              />
              {/* Favorite button overlay */}
              <div className="absolute top-2 right-2">
                <FavoriteButton
                  pokemonId={pokemon.id}
                  pokemonName={pokemon.name}
                  pokemonSprite={pokemon.sprite}
                  onAuthRequired={handleAuthRequired}
                  size="sm"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Pokemon Detail Modal */}
      {selectedPokemon && (
        <PokemonDetailModal
          pokemonName={selectedPokemon.name}
          isOpen={modalOpen}
          onClose={handleModalClose}
        />
      )}

      {/* Login Prompt */}
      <LoginPrompt
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        message="Log in to manage your favorite Pokémon!"
      />
    </div>
  )
}
