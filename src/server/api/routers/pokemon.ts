import { z } from 'zod'

import { pokeAPI } from '@/lib/pokeapi'

import { createTRPCRouter, publicProcedure } from '../trpc'

export const pokemonRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0)
        })
        .optional()
        .default(() => ({ limit: 20, offset: 0 }))
    )
    .query(async ({ input }) => {
      try {
        const result = await pokeAPI.getPokemonWithDetails(input.limit, input.offset)

        const limit = input?.limit ?? 20
        const offset = input?.offset ?? 0

        return {
          pokemon: result.results,
          count: result.count,
          hasNext: result.next !== null,
          hasPrevious: result.previous !== null,
          nextOffset: result.next ? offset + limit : null,
          previousOffset: result.previous ? Math.max(0, offset - limit) : null
        }
      } catch (error) {
        console.error('Failed to fetch pokemon list:', error)
        throw new Error('Failed to fetch Pokémon data')
      }
    }),

  detail: publicProcedure.input(z.object({ nameOrId: z.string() })).query(async ({ input }) => {
    try {
      const pokemon = await pokeAPI.getPokemonDetail(input.nameOrId)
      return {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        baseExperience: pokemon.base_experience,
        sprite:
          pokemon.sprites.other?.['official-artwork']?.front_default ||
          pokemon.sprites.front_default ||
          '/pokeball-placeholder.png',
        types: pokemon.types.map((t) => t.type.name),
        sprites: pokemon.sprites
      }
    } catch (error) {
      console.error(`Failed to fetch pokemon ${input.nameOrId}:`, error)
      throw new Error(`Failed to fetch Pokémon ${input.nameOrId}`)
    }
  }),

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, 'Search query is required'),
        limit: z.number().min(1).max(50).default(20)
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await pokeAPI.searchPokemon(input.query, input.limit)

        return {
          pokemon: result.results,
          count: result.count,
          query: result.query,
          hasMore: result.hasMore,
          isEmpty: result.results.length === 0
        }
      } catch (error) {
        console.error('Failed to search pokemon:', error)
        throw new Error('Failed to search Pokémon')
      }
    })
})
