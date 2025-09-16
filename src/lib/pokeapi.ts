const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

export interface PokemonSprites {
  front_default: string | null
  front_shiny: string | null
  back_default: string | null
  back_shiny: string | null
  other?: {
    'official-artwork'?: {
      front_default: string | null
      front_shiny: string | null
    }
  }
}

export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonDetail {
  id: number
  name: string
  height: number
  weight: number
  sprites: PokemonSprites
  types: PokemonType[]
  base_experience: number
  order: number
}

export interface PokemonSummary {
  id: number
  name: string
  sprite: string
  types: string[]
}

export interface PokemonSearchResponse {
  results: PokemonSummary[]
  count: number
  query: string
  hasMore: boolean
}

export interface PokemonTypeInfo {
  name: string
  url: string
}

export interface PokemonTypesResponse {
  count: number
  results: PokemonTypeInfo[]
}

export interface PokemonFilterResponse {
  results: PokemonSummary[]
  count: number
  type: string | null
  hasMore: boolean
}

export class PokeAPIService {
  private cache = new Map<string, { data: unknown; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  private async fetchWithCache<T>(url: string): Promise<T> {
    const cached = this.cache.get(url)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`PokeAPI error: ${response.statusText}`)
    }

    const data = await response.json()
    this.cache.set(url, { data, timestamp: Date.now() })
    return data
  }

  async getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
    const url = `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    return this.fetchWithCache<PokemonListResponse>(url)
  }

  async getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
    const url = `${POKEAPI_BASE_URL}/pokemon/${nameOrId}`
    return this.fetchWithCache<PokemonDetail>(url)
  }

  async getPokemonWithDetails(limit: number = 20, offset: number = 0) {
    const list = await this.getPokemonList(limit, offset)

    const pokemonWithDetails = await Promise.all(
      list.results.map(async (pokemon) => {
        try {
          const detail = await this.getPokemonDetail(pokemon.name)
          return {
            id: detail.id,
            name: detail.name,
            sprite:
              detail.sprites.other?.['official-artwork']?.front_default ||
              detail.sprites.front_default ||
              '/pokeball-placeholder.png',
            types: detail.types.map((t) => t.type.name)
          }
        } catch (error) {
          console.error(`Failed to fetch details for ${pokemon.name}:`, error)
          return null
        }
      })
    )

    return {
      ...list,
      results: pokemonWithDetails.filter((p) => p !== null)
    }
  }

  async searchPokemon(query: string, limit: number = 20): Promise<PokemonSearchResponse> {
    // For search, we need to get the full list and filter client-side
    // since PokeAPI doesn't have a direct search endpoint
    const cacheKey = `search:${query.toLowerCase()}:${limit}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as PokemonSearchResponse
    }

    try {
      // Get a larger set of Pokemon to search through
      const searchLimit = Math.min(1000, limit * 10) // Get more results for better search
      const list = await this.getPokemonList(searchLimit, 0)

      // Filter Pokemon by name (case-insensitive)
      const filteredResults = list.results
        .filter((pokemon) => pokemon.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)

      // Get details for filtered results
      const pokemonWithDetails = await Promise.all(
        filteredResults.map(async (pokemon): Promise<PokemonSummary | null> => {
          try {
            const detail = await this.getPokemonDetail(pokemon.name)
            return {
              id: detail.id,
              name: detail.name,
              sprite:
                detail.sprites.other?.['official-artwork']?.front_default ||
                detail.sprites.front_default ||
                '/pokeball-placeholder.png',
              types: detail.types.map((t) => t.type.name)
            }
          } catch (error) {
            console.error(`Failed to fetch details for ${pokemon.name}:`, error)
            return null
          }
        })
      )

      const result: PokemonSearchResponse = {
        results: pokemonWithDetails.filter((p): p is PokemonSummary => p !== null),
        count: filteredResults.length,
        query,
        hasMore: filteredResults.length === limit // Might have more results
      }

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
      return result
    } catch (error) {
      console.error('Search failed:', error)
      throw error
    }
  }

  async getPokemonTypes(): Promise<PokemonTypesResponse> {
    const cacheKey = 'pokemon-types'
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as PokemonTypesResponse
    }

    const url = `${POKEAPI_BASE_URL}/type?limit=50`
    const data = await this.fetchWithCache<PokemonTypesResponse>(url)

    // Filter out some less common types that might not be useful for basic filtering
    const commonTypes = data.results.filter((type) => !['unknown', 'shadow'].includes(type.name))

    const result: PokemonTypesResponse = {
      count: commonTypes.length,
      results: commonTypes
    }

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
    return result
  }

  async filterPokemonByType(typeName: string, limit: number = 20): Promise<PokemonFilterResponse> {
    const cacheKey = `filter-type:${typeName.toLowerCase()}:${limit}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as PokemonFilterResponse
    }

    try {
      // Get the type details which includes pokemon list
      const typeUrl = `${POKEAPI_BASE_URL}/type/${typeName.toLowerCase()}`
      const typeData = await this.fetchWithCache<{
        pokemon: Array<{ pokemon: { name: string; url: string } }>
      }>(typeUrl)

      // Get first batch of pokemon for this type
      const pokemonToFetch = typeData.pokemon.slice(0, limit)

      // Get details for each pokemon
      const pokemonWithDetails = await Promise.all(
        pokemonToFetch.map(async (entry): Promise<PokemonSummary | null> => {
          try {
            const detail = await this.getPokemonDetail(entry.pokemon.name)
            return {
              id: detail.id,
              name: detail.name,
              sprite:
                detail.sprites.other?.['official-artwork']?.front_default ||
                detail.sprites.front_default ||
                '/pokeball-placeholder.png',
              types: detail.types.map((t) => t.type.name)
            }
          } catch (error) {
            console.error(`Failed to fetch details for ${entry.pokemon.name}:`, error)
            return null
          }
        })
      )

      const result: PokemonFilterResponse = {
        results: pokemonWithDetails.filter((p): p is PokemonSummary => p !== null),
        count: typeData.pokemon.length,
        type: typeName,
        hasMore: typeData.pokemon.length > limit
      }

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
      return result
    } catch (error) {
      console.error(`Failed to filter by type ${typeName}:`, error)
      throw error
    }
  }

  async searchAndFilterPokemon(
    query: string,
    typeName: string | null,
    limit: number = 20
  ): Promise<PokemonSearchResponse> {
    const cacheKey = `search-filter:${query.toLowerCase()}:${typeName || 'all'}:${limit}`
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as PokemonSearchResponse
    }

    try {
      let pokemonToSearch: PokemonSummary[] = []

      if (typeName) {
        // First filter by type, then search within those results
        const typeResults = await this.filterPokemonByType(typeName, 1000) // Get more for better search
        pokemonToSearch = typeResults.results
      } else {
        // Get general pokemon list to search through
        const searchLimit = Math.min(1000, limit * 10)
        const list = await this.getPokemonList(searchLimit, 0)

        // Convert to PokemonSummary format
        const pokemonWithDetails = await Promise.all(
          list.results.map(async (pokemon): Promise<PokemonSummary | null> => {
            try {
              const detail = await this.getPokemonDetail(pokemon.name)
              return {
                id: detail.id,
                name: detail.name,
                sprite:
                  detail.sprites.other?.['official-artwork']?.front_default ||
                  detail.sprites.front_default ||
                  '/pokeball-placeholder.png',
                types: detail.types.map((t) => t.type.name)
              }
            } catch (error) {
              console.error(`Failed to fetch details for ${pokemon.name}:`, error)
              return null
            }
          })
        )
        pokemonToSearch = pokemonWithDetails.filter((p): p is PokemonSummary => p !== null)
      }

      // Now filter by search query
      const filteredResults = pokemonToSearch
        .filter((pokemon) => pokemon.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)

      const result: PokemonSearchResponse = {
        results: filteredResults,
        count: filteredResults.length,
        query,
        hasMore: filteredResults.length === limit
      }

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() })
      return result
    } catch (error) {
      console.error('Combined search and filter failed:', error)
      throw error
    }
  }

  extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/)
    return matches ? parseInt(matches[1], 10) : 0
  }
}

export const pokeAPI = new PokeAPIService()
