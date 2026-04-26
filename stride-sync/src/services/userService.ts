import { apiFetch } from './api'
import type { User, UserRole } from '@/types'

// This type is used when an admin creates or updates a user.
export type UserInput = {
  firstName: string
  lastName: string
  username: string
  password: string
  role: UserRole
}

export function getUsers() {
  // Gets all users for the Manage Users page.
  // The backend only allows admins to access this route.
  return apiFetch<User[]>('/users')
}

export function createUser(user: UserInput) {
  // Creates a new user from the admin page.
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  })
}

export function updateUser(id: number, user: Partial<UserInput>) {
  // Updates the selected user's information.
  return apiFetch<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(user),
  })
}

export function deleteUser(id: number) {
  // Deletes the selected user.
  return apiFetch<User>(`/users/${id}`, {
    method: 'DELETE',
  })
}