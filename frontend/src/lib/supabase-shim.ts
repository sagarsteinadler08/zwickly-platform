// src/lib/supabase-shim.ts
// Minimal shim that mimics minimal supabase usage the Lovable UI expects.
// It routes calls to local API endpoints implemented in /api/*
// Dev-only: not secure for production.

type ChainableQuery = {
  eq: (col: string, val: any) => ChainableQuery
  gte: (col: string, val: any) => ChainableQuery
  lte: (col: string, val: any) => ChainableQuery
  in: (col: string, values: any[]) => ChainableQuery
  order: (col: string, opts?: { ascending?: boolean }) => ChainableQuery
  limit: (count: number) => ChainableQuery
  single: () => Promise<{ data: any | null; error: any }>
  then: <TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ) => Promise<TResult1 | TResult2>
  catch: <TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null
  ) => Promise<any>
}

type ChainableUpdate = {
  eq: (col: string, val: any) => Promise<{ data: any; error: any }>
  in: (col: string, values: any[]) => Promise<{ data: any; error: any }>
}

type FromObject = {
  select: (cols?: string, options?: any) => ChainableQuery
  insert: (payload: any) => Promise<{ data: any; error: any }>
  update?: (payload: any) => ChainableUpdate
  delete?: () => ChainableQuery
}

// Backend API URL - change this if your backend runs on different port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function baseFetch(path: string, opts: RequestInit = {}) {
  try {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      ...opts,
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      return { data: null, error: { message: `Request ${path} failed: ${res.status} ${res.statusText} ${t}` } }
    }
    try {
      const data = await res.json()
      return { data, error: null }
    } catch {
      return { data: null, error: null }
    }
  } catch (error: any) {
    return { data: null, error: { message: error.message || 'Network error' } }
  }
}

function createQueryBuilder(tableName: string, initialState: {
  filters?: Array<{ type: string; col: string; val: any }>
  orderBy?: { column: string; ascending: boolean }
  limit?: number
  method?: 'GET' | 'DELETE'
}): ChainableQuery {
  // Create a new state copy for each query
  const state = {
    filters: [...(initialState.filters || [])],
    orderBy: initialState.orderBy,
    limit: initialState.limit,
    method: initialState.method,
  }

  const applyFilters = (baseUrl: string) => {
    const url = new URL(baseUrl, API_BASE_URL)

    // Apply filters
    state.filters.forEach(filter => {
      if (filter.type === 'eq') {
        url.searchParams.append(filter.col, String(filter.val))
      } else if (filter.type === 'gte') {
        url.searchParams.append(`${filter.col}_gte`, String(filter.val))
      } else if (filter.type === 'lte') {
        url.searchParams.append(`${filter.col}_lte`, String(filter.val))
      } else if (filter.type === 'in') {
        url.searchParams.append(`${filter.col}_in`, JSON.stringify(filter.val))
      }
    })

    // Apply ordering
    if (state.orderBy) {
      url.searchParams.append('order', state.orderBy.column)
      url.searchParams.append('orderAsc', String(state.orderBy.ascending))
    }

    // Apply limit
    if (state.limit) {
      url.searchParams.append('limit', String(state.limit))
    }

    return url.toString().replace(API_BASE_URL, '')
  }

  const execute = async () => {
    const path = applyFilters(`/api/${tableName.toLowerCase()}`)
    const method = state.method || 'GET'
    return baseFetch(path, { method })
  }

  const promise = execute() as any

  // Add chainable methods - create new state for chaining
  promise.eq = (col: string, val: any) => {
    return createQueryBuilder(tableName, {
      ...state,
      filters: [...state.filters, { type: 'eq', col, val }]
    })
  }

  promise.gte = (col: string, val: any) => {
    return createQueryBuilder(tableName, {
      ...state,
      filters: [...state.filters, { type: 'gte', col, val }]
    })
  }

  promise.lte = (col: string, val: any) => {
    return createQueryBuilder(tableName, {
      ...state,
      filters: [...state.filters, { type: 'lte', col, val }]
    })
  }

  promise.order = (col: string, opts?: { ascending?: boolean }) => {
    return createQueryBuilder(tableName, {
      ...state,
      orderBy: { column: col, ascending: opts?.ascending !== false }
    })
  }

  promise.limit = (count: number) => {
    return createQueryBuilder(tableName, {
      ...state,
      limit: count
    })
  }

  promise.in = (col: string, values: any[]) => {
    return createQueryBuilder(tableName, {
      ...state,
      filters: [...state.filters, { type: 'in', col, val: values }]
    })
  }

  promise.single = async () => {
    const result = await execute()
    if (result.error) return result
    // Return first item or null if array is empty
    const data = Array.isArray(result.data) ? (result.data[0] || null) : result.data
    return { data, error: null }
  }

  return promise as ChainableQuery
}

export default {
  from(tableName: string): FromObject {
    return {
      select: (_cols?: string, options?: any) => {
        return createQueryBuilder(tableName, { filters: [] })
      },
      insert: async (payload: any) => {
        return baseFetch(`/api/${tableName.toLowerCase()}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      },
      update: (payload: any) => {
        // Create a chainable update object
        const executeUpdate = async (filters: Array<{ type: string; col: string; val: any }>) => {
          const url = new URL(`/api/${tableName.toLowerCase()}`, API_BASE_URL)
          filters.forEach(filter => {
            if (filter.type === 'eq') {
              url.searchParams.append(filter.col, String(filter.val))
            } else if (filter.type === 'in') {
              url.searchParams.append(`${filter.col}_in`, JSON.stringify(filter.val))
            }
          })

          return baseFetch(url.toString().replace(API_BASE_URL, ''), {
            method: 'PUT',
            body: JSON.stringify(payload),
          })
        }

        const chainableUpdate: any = {
          eq: (col: string, val: any) => executeUpdate([{ type: 'eq', col, val }]),
          in: (col: string, values: any[]) => executeUpdate([{ type: 'in', col, val: values }]),
        }

        return chainableUpdate as ChainableUpdate
      },
      delete: () => {
        return createQueryBuilder(tableName, { filters: [], method: 'DELETE' })
      },
    }
  },

  functions: {
    async invoke(name: string, options?: { body?: any }) {
      const result = await baseFetch(`/api/functions/${encodeURIComponent(name)}`, {
        method: 'POST',
        body: JSON.stringify(options?.body ?? {}),
      })
      // Handle the response format from chat-assistant
      if (result.data && result.data.text) {
        return { data: { message: result.data.text }, error: null }
      }
      return result
    },
  },

  auth: {
    onAuthStateChange(callback: (event: string, session: any) => void) {
      // Simulate auth state - return subscription object
      const mockSession = localStorage.getItem('mock_session') ? JSON.parse(localStorage.getItem('mock_session') || '{}') : null
      if (mockSession) {
        setTimeout(() => callback('SIGNED_IN', { user: mockSession }), 100)
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    },

    async getSession() {
      const session = localStorage.getItem('mock_session') ? JSON.parse(localStorage.getItem('mock_session') || '{}') : null
      return {
        data: { session: session ? { user: session } : null },
        error: null
      }
    },

    async getUser() {
      const user = localStorage.getItem('mock_session') ? JSON.parse(localStorage.getItem('mock_session') || '{}') : null
      return {
        data: { user },
        error: null
      }
    },

    async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
      // Mock signup - just create a mock user session
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        created_at: new Date().toISOString()
      }
      localStorage.setItem('mock_session', JSON.stringify(mockUser))
      return {
        data: { user: mockUser },
        error: null
      }
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      // Mock signin - create a mock user session
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        created_at: new Date().toISOString()
      }
      localStorage.setItem('mock_session', JSON.stringify(mockUser))
      return {
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      }
    },

    async signOut() {
      localStorage.removeItem('mock_session')
      return { error: null }
    }
  },

  // Add rpc method - called as supabase.rpc('function_name', params)
  rpc(name: string, params?: any) {
    console.log('Mock RPC:', name, params)
    // Mock RPC always succeeds
    return Promise.resolve({ data: null, error: null })
  },

  // Mock realtime channel - for local dev, this is a no-op
  channel(_name: string) {
    return {
      on(_event: string, _config: any, _callback: (payload: any) => void) {
        return this
      },
      subscribe(_callback?: (status: string, err?: Error) => void) {
        return {
          unsubscribe: () => {}
        }
      },
      unsubscribe: () => {}
    }
  },

  removeChannel(_channel: any) {
    // No-op for local dev
    return { status: 'ok' }
  }
}
