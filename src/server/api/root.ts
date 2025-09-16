import { pokemonRouter } from './routers/pokemon'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  pokemon: pokemonRouter
})

export type AppRouter = typeof appRouter
