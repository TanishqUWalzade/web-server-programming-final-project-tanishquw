import { defineStore } from 'pinia'
import { ref } from 'vue'
import usersData from '@/data/users.json'
import type { User } from '@/types'

export const useUsersStore = defineStore('users', () => {
  // Loading initial user data from users.json file
  const users = ref<User[]>(usersData.users as User[])

  function addUser(user: Omit<User, 'id'>) {
    // Generate a next id based on current highest id in the list
    const newId =
      users.value.length > 0 ? Math.max(...users.value.map((u) => u.id)) + 1 : 1

    users.value.push({
      id: newId,
      ...user,
    })
  }
  
  function updateUser(updatedUser: User) {
    const index = users.value.findIndex((user) => user.id === updatedUser.id)
    // Replace the existing user with the updated details
    if (index !== -1) {
      users.value[index] = { ...updatedUser }
    }
  }

  function deleteUser(userId: number) {
    // Remove the selected user from the list
    users.value = users.value.filter((user) => user.id !== userId)
  }

  function getUserById(userId: number) {
    // Find a user by id for edit and update operations
    return users.value.find((user) => user.id === userId) || null
  }

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
  }
})