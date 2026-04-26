import { apiFetch } from './api'
import type { User } from '@/types'

// This is what the backend returns after a successful login.
export type LoginResponse = {
  user: User
  token: string
}

export function login(username: string, password: string) {
  // Sends username and password to the backend for authentication.
  return apiFetch<LoginResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function getMe() {
  // Uses the saved JWT token to get the currently logged-in user.
  return apiFetch<User>('/users/me')
}