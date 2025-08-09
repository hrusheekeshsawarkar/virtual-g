export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'
export const API_BASE_ORIGIN = (() => {
  try { return new URL(API_BASE_URL).origin } catch { return 'http://localhost:8000' }
})()

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('vg_token')
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiPost<T>(path: string, body: any, isFormData = false): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (!isFormData) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: isFormData ? body : JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function apiDelete<T>(path: string): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function login(email: string, password: string): Promise<void> {
  const formData = new URLSearchParams()
  formData.set('username', email)
  formData.set('password', password)
  const res = await fetch(`${API_BASE_URL}/login`, { method: 'POST', body: formData })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  if (typeof window !== 'undefined') localStorage.setItem('vg_token', data.access_token)
}

export async function register(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  if (typeof window !== 'undefined') localStorage.setItem('vg_token', data.access_token)
}

export function toApiAbsoluteUrl(pathOrUrl: string): string {
  try {
    const u = new URL(pathOrUrl)
    return u.toString()
  } catch {
    return new URL(pathOrUrl, API_BASE_ORIGIN).toString()
  }
}


