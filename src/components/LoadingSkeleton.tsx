interface LoadingSkeletonProps {
  className?: string
}

export default function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
}

export function PokemonDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <LoadingSkeleton className="mx-auto h-48 w-48 rounded-lg" />
        <LoadingSkeleton className="mx-auto mt-4 h-8 w-32" />
        <LoadingSkeleton className="mx-auto mt-2 h-4 w-24" />
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-16" />
          <LoadingSkeleton className="h-6 w-20" />
        </div>
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-16" />
          <LoadingSkeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Types */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-12" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
          <LoadingSkeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Abilities */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-16" />
        <div className="space-y-1">
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-4 w-28" />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-12" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3"
            >
              <LoadingSkeleton className="h-4 w-20" />
              <LoadingSkeleton className="h-2 flex-1" />
              <LoadingSkeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
