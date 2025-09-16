'use client'

import PokemonGrid from '@/components/PokemonGrid'

export default function Home() {
  const handlePokemonClick = (pokemon: { id: number; name: string }) => {
    // TODO: Implement pokemon detail modal or navigation
    console.log('Clicked pokemon:', pokemon)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Pokédex</h1>
        <p className="text-gray-600">Discover and explore the world of Pokémon</p>
      </div>

      <PokemonGrid onPokemonClick={handlePokemonClick} />
    </div>
  )
}
