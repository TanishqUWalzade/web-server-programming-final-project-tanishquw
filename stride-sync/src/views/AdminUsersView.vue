<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import type { User, UserRole } from '@/types'

const usersStore = useUsersStore()

const firstName = ref('')
const lastName = ref('')
const username = ref('')
const password = ref('')
const role = ref<UserRole>('user')

const isEditing = ref(false)
const editingUserId = ref<number | null>(null)
const errorMessage = ref('')
const isSaving = ref(false)

onMounted(async () => {
  // Load users from the backend when the admin page opens.
  await usersStore.loadUsers()
})

function resetForm() {
  firstName.value = ''
  lastName.value = ''
  username.value = ''
  password.value = ''
  role.value = 'user'
  isEditing.value = false
  editingUserId.value = null
  errorMessage.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''

  const trimmedFirstName = firstName.value.trim()
  const trimmedLastName = lastName.value.trim()
  const trimmedUsername = username.value.trim()

  if (!trimmedFirstName || !trimmedLastName || !trimmedUsername) {
    errorMessage.value = 'First name, last name, and username are required'
    return
  }

  // Password is required only when creating a new user.
  if (!isEditing.value && !password.value) {
    errorMessage.value = 'Password is required for new users'
    return
  }

  if (trimmedUsername.length < 3) {
    errorMessage.value = 'Username must be at least 3 characters long'
    return
  }

  if (!isEditing.value && password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return
  }

  // This prevents duplicate usernames before sending the request.
  const duplicateUser = usersStore.users.find((user) => {
    const sameUsername = user.username.toLowerCase() === trimmedUsername.toLowerCase()

    if (isEditing.value && editingUserId.value !== null) {
      return sameUsername && user.id !== editingUserId.value
    }

    return sameUsername
  })

  if (duplicateUser) {
    errorMessage.value = 'Username already exists'
    return
  }

  try {
    isSaving.value = true

    if (isEditing.value && editingUserId.value !== null) {
      await updateUser()
      return
    }

    await addUser()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to save user'
  } finally {
    isSaving.value = false
  }
}

async function addUser() {
  // Admin-created users are saved through the backend.
  await usersStore.addUser({
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    username: username.value.trim(),
    password: password.value,
    role: role.value,
  })

  resetForm()
}

function startEdit(user: User) {
  // Fill the form with the selected user's current information.
  isEditing.value = true
  editingUserId.value = user.id
  firstName.value = user.firstName
  lastName.value = user.lastName
  username.value = user.username
  password.value = ''
  role.value = user.role
  errorMessage.value = ''
}

async function updateUser() {
  if (editingUserId.value === null) return

  const updateData: {
    firstName: string
    lastName: string
    username: string
    role: UserRole
    password?: string
  } = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    username: username.value.trim(),
    role: role.value,
  }
  // If password is blank while editing, the backend keeps the old password.
  if (password.value.trim() !== '') {
    updateData.password = password.value
  }

  await usersStore.updateUser(editingUserId.value, updateData)
  resetForm()
}

async function deleteUser(userId: number) {
  try {
    // Delete the selected user from the backend and local state.
    await usersStore.deleteUser(userId)

    if (editingUserId.value === userId) {
      resetForm()
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to delete user'
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Manage Users</h1>
      <p class="page-subtitle">Admin can add, edit, and remove users</p>
    </div>

    <p v-if="usersStore.isLoading">Loading users...</p>
    <p v-if="usersStore.errorMessage" class="help is-danger mb-3">
      {{ usersStore.errorMessage }}
    </p>

    <div class="columns">
      <div class="column is-8">
        <div class="box">
          <h2 class="title is-4">All Users</h2>

          <table v-if="usersStore.users.length > 0" class="table is-fullwidth">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in usersStore.users" :key="user.id">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <div class="table-action-buttons">
                    <button
                      class="button is-info is-small"
                      type="button"
                      @click="startEdit(user)"
                    >
                      Edit
                    </button>

                    <button
                      class="button is-danger is-small"
                      type="button"
                      @click="deleteUser(user.id)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else-if="!usersStore.isLoading">No users found.</p>
        </div>
      </div>

      <div class="column is-4">
        <form class="box" @submit.prevent="handleSubmit">
          <h2 class="title is-4">
            {{ isEditing ? 'Edit User' : 'Add User' }}
          </h2>

          <div class="field">
            <label class="label">First Name</label>
            <div class="control">
              <input
                v-model="firstName"
                class="input"
                type="text"
                placeholder="Enter first name"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Last Name</label>
            <div class="control">
              <input
                v-model="lastName"
                class="input"
                type="text"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Username</label>
            <div class="control">
              <input
                v-model="username"
                class="input"
                type="text"
                placeholder="Minimum 3 characters"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">
              Password
              <span v-if="isEditing" class="has-text-grey is-size-7">
                (leave blank to keep current password)
              </span>
            </label>
            <div class="control">
              <input
                v-model="password"
                class="input"
                type="password"
                placeholder="Minimum 6 characters"
                :required="!isEditing"
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Role</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="role">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="help is-danger mb-3">
            {{ errorMessage }}
          </p>

          <div class="field is-grouped">
            <div class="control">
              <button class="button is-primary" type="submit" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : isEditing ? 'Update User' : 'Add User' }}
              </button>
            </div>

            <div class="control">
              <button class="button is-light" type="button" @click="resetForm">
                {{ isEditing ? 'Cancel' : 'Clear' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>