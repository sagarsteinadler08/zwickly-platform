// src/lib/supabase-shim.ts
// Minimal shim that mimics minimal supabase usage the Lovable UI expects.
// It routes calls to local API endpoints implemented in /api/*
// Dev-only: not secure for production.

type FromObject = {
  select: (cols?: string) => Promise<any[]>
  insert: (payload: any) => Promise<any>
  update?: (payload: any) => Promise<any>
  delete?: () => Promise<any>
  eq?: (col: string, val: any) => FromObject
}

async function baseFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opts,
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`Request ${path} failed: ${res.status} ${res.statusText} ${t}`)
  }
  try { return await res.json() } catch { return null }
}

export default {
  from(tableName: string): FromObject {
    const state: { filters: Array<[string, any]> } = { filters: [] }
    const applyFilters = (url: string) => {
      if (state.filters.length === 0) return url
      const params = new URLSearchParams()
      state.filters.forEach(([c, v]) => params.append(c, String(v)))
      return `${url}?${params.toString()}`
    }

    const obj: FromObject = {
      select: async (_cols?: string) => {
        const url = applyFilters(`/api/${tableName.toLowerCase()}`)
        return baseFetch(url, { method: 'GET' })
      },
      insert: async (payload: any) => {
        return baseFetch(`/api/${tableName.toLowerCase()}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      },
      update: async (payload: any) => {
        return baseFetch(`/api/${tableName.toLowerCase()}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      },
      delete: async () => {
        return baseFetch(`/api/${tableName.toLowerCase()}`, { method: 'DELETE' })
      },
      eq(col: string, val: any) {
        state.filters.push([col, val])
        return obj
      },
    }
    return obj
  },

  functions: {
    async invoke(name: string, options?: { body?: any }) {
      const res = await baseFetch(`/api/functions/${encodeURIComponent(name)}`, {
        method: 'POST',
        body: JSON.stringify(options?.body ?? {}),
      })
      return { data: res }
    },
  },

  auth: {
    async signUp({ email, password }: { email: string; password: string }) {
      return baseFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) })
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      return baseFetch('/api/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) })
    },
    async signOut() { return true }
  }
}
