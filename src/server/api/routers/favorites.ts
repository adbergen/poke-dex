import { favorite } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const favoritesRouter = createTRPCRouter({
  // Toggle favorite (add/remove)
  toggle: protectedProcedure
    .input(
      z.object({
        pokemonId: z.string(),
        pokemonName: z.string(),
        pokemonSprite: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if already favorited
        const existingFavorite = await ctx.db
          .select()
          .from(favorite)
          .where(and(eq(favorite.userId, ctx.userId), eq(favorite.pokemonId, input.pokemonId)))
          .limit(1)

        if (existingFavorite.length > 0) {
          // Remove from favorites
          await ctx.db
            .delete(favorite)
            .where(and(eq(favorite.userId, ctx.userId), eq(favorite.pokemonId, input.pokemonId)))

          return {
            isFavorited: false,
            action: 'removed'
          }
        } else {
          // Add to favorites
          await ctx.db.insert(favorite).values({
            id: crypto.randomUUID(),
            userId: ctx.userId,
            pokemonId: input.pokemonId,
            pokemonName: input.pokemonName,
            pokemonSprite: input.pokemonSprite
          })

          return {
            isFavorited: true,
            action: 'added'
          }
        }
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        throw new Error('Failed to toggle favorite')
      }
    }),

  // Get user's favorites list
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const favorites = await ctx.db
        .select()
        .from(favorite)
        .where(eq(favorite.userId, ctx.userId))
        .orderBy(favorite.createdAt)

      return {
        favorites: favorites.map((fav) => ({
          id: fav.pokemonId,
          name: fav.pokemonName,
          sprite: fav.pokemonSprite || '/pokeball-placeholder.png',
          createdAt: fav.createdAt
        })),
        count: favorites.length
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      throw new Error('Failed to fetch favorites')
    }
  }),

  // Check if a Pokemon is favorited
  check: protectedProcedure
    .input(z.object({ pokemonId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const existingFavorite = await ctx.db
          .select()
          .from(favorite)
          .where(and(eq(favorite.userId, ctx.userId), eq(favorite.pokemonId, input.pokemonId)))
          .limit(1)

        return {
          isFavorited: existingFavorite.length > 0
        }
      } catch (error) {
        console.error('Failed to check favorite status:', error)
        throw new Error('Failed to check favorite status')
      }
    }),

  // Check multiple Pokemon favorite status (for lists)
  checkMultiple: protectedProcedure
    .input(z.object({ pokemonIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      try {
        const favorites = await ctx.db
          .select({ pokemonId: favorite.pokemonId })
          .from(favorite)
          .where(eq(favorite.userId, ctx.userId))

        const favoritedIds = new Set(favorites.map((fav) => fav.pokemonId))

        return input.pokemonIds.reduce(
          (acc, pokemonId) => {
            acc[pokemonId] = favoritedIds.has(pokemonId)
            return acc
          },
          {} as Record<string, boolean>
        )
      } catch (error) {
        console.error('Failed to check multiple favorites:', error)
        throw new Error('Failed to check favorite status')
      }
    }),

  // Public endpoint to get favorite count for a Pokemon (optional feature)
  getCount: publicProcedure
    .input(z.object({ pokemonId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const count = await ctx.db
          .select({ count: favorite.pokemonId })
          .from(favorite)
          .where(eq(favorite.pokemonId, input.pokemonId))

        return {
          count: count.length
        }
      } catch (error) {
        console.error('Failed to get favorite count:', error)
        return { count: 0 }
      }
    })
})
