'use client'

import Image from 'next/image'

import { api } from '@/trpc/client'
import { X } from 'lucide-react'

import { PokemonDetailSkeleton } from './LoadingSkeleton'
import { Button } from './ui/button'

interface PokemonDetailModalProps {
  pokemonName: string
  isOpen: boolean
  onClose: () => void
}

export default function PokemonDetailModal({
  pokemonName,
  isOpen,
  onClose
}: PokemonDetailModalProps) {
  const {
    data: pokemon,
    isLoading,
    error
  } = api.pokemon.getByName.useQuery(
    { nameOrId: pokemonName },
    { enabled: isOpen && !!pokemonName }
  )

  if (!isOpen) return null

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
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
    return colors[type] || 'bg-gray-400'
  }

  const getStatColor = (statName: string) => {
    const colors: Record<string, string> = {
      hp: 'bg-green-500',
      attack: 'bg-red-500',
      defense: 'bg-blue-500',
      'special-attack': 'bg-orange-500',
      'special-defense': 'bg-yellow-500',
      speed: 'bg-purple-500'
    }
    return colors[statName] || 'bg-gray-400'
  }

  const formatStatName = (statName: string) => {
    const names: Record<string, string> = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Attack',
      'special-defense': 'Sp. Defense',
      speed: 'Speed'
    }
    return names[statName] || statName
  }

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          {isLoading && <PokemonDetailSkeleton />}

          {error && (
            <div className="text-center">
              <p className="text-red-600">Failed to load Pokémon details</p>
              <Button
                onClick={onClose}
                className="mt-4"
                variant="outline"
              >
                Close
              </Button>
            </div>
          )}

          {pokemon && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="relative mx-auto h-48 w-48">
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    fill
                    sizes="(max-width: 768px) 192px, 192px"
                    className="object-contain"
                    priority
                  />
                </div>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 capitalize">{pokemon.name}</h1>
                <p className="text-sm text-gray-500">#{pokemon.id.toString().padStart(3, '0')}</p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="text-lg font-semibold">{pokemon.height / 10} m</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-lg font-semibold">{pokemon.weight / 10} kg</p>
                </div>
              </div>

              {/* Types */}
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Types</h3>
                <div className="flex gap-2">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`rounded-full px-3 py-1 text-sm font-medium text-white ${getTypeColor(type)}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Abilities */}
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Abilities</h3>
                <div className="space-y-1">
                  {pokemon.abilities.map((ability, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="capitalize">{ability.name.replace('-', ' ')}</span>
                      {ability.isHidden && (
                        <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">
                          Hidden
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Base Experience */}
              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="mb-1 text-lg font-semibold text-gray-900">Base Experience</h3>
                <p className="text-2xl font-bold text-blue-600">{pokemon.baseExperience}</p>
              </div>

              {/* Stats */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Base Stats</h3>
                <div className="space-y-3">
                  {pokemon.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-24 text-sm font-medium text-gray-700">
                        {formatStatName(stat.name)}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${getStatColor(stat.name)}`}
                            style={{
                              width: `${Math.min((stat.baseStat / 255) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-sm font-medium text-gray-900">{stat.baseStat}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total: {pokemon.stats.reduce((sum, stat) => sum + stat.baseStat, 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
