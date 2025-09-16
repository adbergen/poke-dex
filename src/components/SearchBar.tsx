'use client'

import { useEffect, useState } from 'react'

import { Search, X } from 'lucide-react'

import { Button } from './ui/button'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search Pokémon...',
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce the search query by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  // Call onSearch when debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 bg-white px-10 py-2 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
