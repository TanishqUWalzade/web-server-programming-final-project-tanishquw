import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '@/types'
import * as authService from '@/services/authService'

// This store keeps track of the logged-in user and token.
export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('strideSyncToken'))
  const errorMessage = ref('')

// Login is checked by the backend, not by local JSON data anymore.
  async function login(username: string, password: string): Promise<boolean> {
    try {
      const response = await authService.login(username, password)

      currentUser.value = response.user
      token.value = response.token
      // Save the token so the user stays logged in after refresh.
      localStorage.setItem('strideSyncToken', response.token)
      errorMessage.value = ''

      return true
    } catch (error) {
      currentUser.value = null
      token.value = null
      localStorage.removeItem('strideSyncToken')
      errorMessage.value =
        error instanceof Error ? error.message : 'Login failed'

      return false
    }
  }
  // This reloads the current user using the saved token.
  async function loadCurrentUser() {
    if (!token.value) return

    try {
      currentUser.value = await authService.getMe()
    } catch {
      logout()
    }
  }

  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('strideSyncToken')
  }

  const isLoggedIn = computed(() => currentUser.value !== null)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  return {
    currentUser,
    token,
    errorMessage,
    login,
    loadCurrentUser,
    logout,
    isLoggedIn,
    isAdmin,
  }
})