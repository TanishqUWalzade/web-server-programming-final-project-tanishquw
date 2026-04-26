const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export type DataEnvelope<T> = {
  data: T
  isSuccess: boolean
  message?: string
}

export type DataListEnvelope<T> = DataEnvelope<T[]> & {
  total: number
}

// This is the main fetch helper for the frontend.
// All API calls go through this file so headers, tokens, and errors are handled in one place.
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
// If the user is logged in, send the JWT token with the request.
  const token = localStorage.getItem('strideSyncToken')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
// The backend sends responses inside a data envelope, so this unwraps the data part.
  const envelope = (await response.json()) as DataEnvelope<T>

  if (!response.ok || !envelope.isSuccess) {
    throw new Error(envelope.message || 'Request failed')
  }

  return envelope.data
}