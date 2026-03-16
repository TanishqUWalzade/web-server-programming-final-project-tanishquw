import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useUsersStore } from './users'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const usersStore = useUsersStore()
  const currentUser = ref<User | null>(null)

  // Checks whether entered credientials match any existing user
  function login(username: string, password: string): boolean {
    const foundUser = usersStore.users.find(
      (user) => user.username === username && user.password === password,
    )

    if (foundUser) {
      currentUser.value = foundUser
      return true
    }

    return false
  }

  // Clears the current user after logging out
  function logout() {
    currentUser.value = null
  }

  // Useful to easily check if user is logged in or has admin role
  const isLoggedIn = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  return {
    currentUser,
    login,
    logout,
    isLoggedIn,
    isAdmin,
  }
})