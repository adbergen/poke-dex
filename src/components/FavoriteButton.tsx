'use client'

import { useState } from 'react'

import { api } from '@/trpc/client'
import { Heart, Loader2 } from 'lucide-react'

import { Button } from './ui/button'

interface FavoriteButtonProps {
  pokemonId: string
  pokemonName: string
  pokemonSprite?: string
  onAuthRequired?: () => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'full'
  className?: string
}

export default function FavoriteButton({
  pokemonId,
  pokemonName,
  pokemonSprite,
  onAuthRequired,
  size = 'md',
  variant = 'icon',
  className = ''
}: FavoriteButtonProps) {
  const [optimisticFavorited, setOptimisticFavorited] = useState<boolean | null>(null)
  const utils = api.useUtils()

  // Check if favorited
  const { data: checkData, isLoading: isCheckingFavorite } = api.favorites.check.useQuery(
    { pokemonId },
    {
      retry: false,
      refetchOnWindowFocus: false
    }
  )

  // Toggle favorite mutation
  const toggleFavorite = api.favorites.toggle.useMutation({
    onMutate: async () => {
      // Cancel any outgoing refetches
      await utils.favorites.check.cancel({ pokemonId })

      // Snapshot the previous value
      const previousData = utils.favorites.check.getData({ pokemonId })

      // Optimistically update the UI
      const currentFavorited = optimisticFavorited ?? previousData?.isFavorited ?? false
      setOptimisticFavorited(!currentFavorited)

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      setOptimisticFavorited(context?.previousData?.isFavorited ?? null)
    },
    onSuccess: (data) => {
      // Update the optimistic state with the actual result
      setOptimisticFavorited(data.isFavorited)
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.favorites.check.invalidate({ pokemonId })
      utils.favorites.list.invalidate()
    }
  })

  const handleToggle = async () => {
    // Check if user is authenticated by trying the mutation
    try {
      await toggleFavorite.mutateAsync({
        pokemonId,
        pokemonName,
        pokemonSprite
      })
    } catch (error: unknown) {
      // If unauthorized, call the auth required callback
      if (
        error &&
        typeof error === 'object' &&
        'data' in error &&
        error.data &&
        typeof error.data === 'object' &&
        'code' in error.data &&
        error.data.code === 'UNAUTHORIZED' &&
        onAuthRequired
      ) {
        onAuthRequired()
      }
    }
  }

  // Determine the current favorite status
  const isFavorited = optimisticFavorited ?? checkData?.isFavorited ?? false
  const isLoading = isCheckingFavorite || toggleFavorite.isPending

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  if (variant === 'full') {
    return (
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant={isFavorited ? 'default' : 'outline'}
        size="sm"
        className={`flex items-center space-x-2 ${className}`}
      >
        {isLoading ? (
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        ) : (
          <Heart
            className={`${iconSizes[size]} ${
              isFavorited ? 'fill-current text-red-500' : 'text-gray-500'
            }`}
          />
        )}
        <span>{isFavorited ? 'Favorited' : 'Add to Favorites'}</span>
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className={`${sizeClasses[size]} p-0 ${className}`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin text-gray-500`} />
      ) : (
        <Heart
          className={`${iconSizes[size]} transition-colors ${
            isFavorited
              ? 'fill-current text-red-500 hover:text-red-600'
              : 'text-gray-400 hover:text-red-500'
          }`}
        />
      )}
    </Button>
  )
}
