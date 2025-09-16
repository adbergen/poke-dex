import { favoritesRouter } from './routers/favorites'
import { pokemonRouter } from './routers/pokemon'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  pokemon: pokemonRouter,
  favorites: favoritesRouter
})

export type AppRouter = typeof appRouter
