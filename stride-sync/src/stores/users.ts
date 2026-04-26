import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, UserRole } from '@/types'
import * as userService from '@/services/userService'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  async function loadUsers() {
    try {
      isLoading.value = true
      
      // Users are loaded from the backend now instead of users.json.
      users.value = await userService.getUsers()
      errorMessage.value = ''
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Unable to load users'
    } finally {
      isLoading.value = false
    }
  }

  async function addUser(user: {
    firstName: string
    lastName: string
    username: string
    password: string
    role: UserRole
  }) {
    // After creating the user in the backend, add it to the local list.
    const newUser = await userService.createUser(user)
    users.value.push(newUser)
    return newUser
  }

  async function updateUser(
    id: number,
    user: Partial<{
      firstName: string
      lastName: string
      username: string
      password: string
      role: UserRole
    }>,
  ) {
    // Update the user in the backend first.
    const updatedUser = await userService.updateUser(id, user)
    
    // Then replace the old user in the local state. 
    const index = users.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      users.value[index] = updatedUser
    }

    return updatedUser
  }

  async function deleteUser(userId: number) {
    // Delete the user from the backend, then remove from the local list.
    const deletedUser = await userService.deleteUser(userId)
    users.value = users.value.filter((user) => user.id !== userId)
    return deletedUser
  }

  function getUserById(userId: number) {
    // Used by the edit form to find the selected user.
    return users.value.find((user) => user.id === userId) || null
  }

  return {
    users,
    isLoading,
    errorMessage,
    loadUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
  }
})