const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE}/api/v1${path}`
  
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  if (res.status === 401) {
    // Only redirect if not already on login or signup
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
      window.location.assign('/login')
    }
  }

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const errorMsg = json.message || json.details || res.statusText || 'Request failed'
    throw new Error(errorMsg)
  }

  return json as T
}

export const avatarUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return `${BASE}${path}`
}
