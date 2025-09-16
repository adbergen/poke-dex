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

  extractIdFromUrl(url: string): number {
    const matches = url.match(/\/(\d+)\/$/)
    return matches ? parseInt(matches[1], 10) : 0
  }
}

export const pokeAPI = new PokeAPIService()
