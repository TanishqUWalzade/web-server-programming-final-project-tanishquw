const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export type DataEnvelope<T> = {
  data: T
  isSuccess: boolean
  message?: string
}

export type DataListEnvelope<T> = DataEnvelope<T[]> & {
  total: number
}

export type PaginatedDataListEnvelope<T> = DataListEnvelope<T> & {
  limit: number
  offset: number
  hasMore: boolean
}

// This is the main fetch helper for the frontend.
// All API calls go through this file so headers, tokens, and errors are handled in one place.
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('strideSyncToken')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const envelope = (await response.json()) as DataEnvelope<T>

  if (!response.ok || !envelope.isSuccess) {
    throw new Error(envelope.message || 'Request failed')
  }

  return envelope.data
}

// This helper returns the full backend envelope.
// It is useful when we need metadata like total, limit, offset, and hasMore.
export async function apiFetchEnvelope<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('strideSyncToken')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const envelope = (await response.json()) as T & DataEnvelope<unknown>

  if (!response.ok || !envelope.isSuccess) {
    throw new Error(envelope.message || 'Request failed')
  }

  return envelope as T
}