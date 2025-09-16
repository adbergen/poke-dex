import { useState } from 'react'

import Image from 'next/image'

import FavoriteButton from './FavoriteButton'
import LoginPrompt from './LoginPrompt'
import { Card, CardContent } from './ui/card'

interface PokemonCardProps {
  pokemon: {
    id: number
    name: string
    sprite: string
    types: string[]
  }
  onClick?: () => void
  priority?: boolean
  showFavoriteButton?: boolean
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300'
}

export default function PokemonCard({
  pokemon,
  onClick,
  priority = false,
  showFavoriteButton = true
}: PokemonCardProps) {
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
  }

  const handleAuthRequired = () => {
    setLoginPromptOpen(true)
  }

  return (
    <>
      <Card
        className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-50">
            <Image
              src={pokemon.sprite}
              alt={pokemon.name}
              fill
              className="object-contain p-2 transition-transform duration-200 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/pokeball-placeholder.png'
              }}
            />

            {/* Favorite Button - Always visible */}
            {showFavoriteButton && (
              <div
                className="absolute top-2 right-2"
                onClick={handleFavoriteClick}
              >
                <FavoriteButton
                  pokemonId={pokemon.id.toString()}
                  pokemonName={pokemon.name}
                  pokemonSprite={pokemon.sprite}
                  onAuthRequired={handleAuthRequired}
                  size="sm"
                />
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="mb-1 text-sm text-gray-500">#{pokemon.id.toString().padStart(3, '0')}</p>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{capitalizedName}</h3>

            <div className="flex flex-wrap justify-center gap-1">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`rounded-full px-2 py-1 text-xs font-medium text-white ${
                    typeColors[type] || 'bg-gray-400'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Prompt */}
      <LoginPrompt
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        message="Log in to save your favorite Pokémon!"
      />
    </>
  )
}
