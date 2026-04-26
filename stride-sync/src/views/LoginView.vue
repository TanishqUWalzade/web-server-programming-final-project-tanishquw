<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

// Validate login and redirect to dashboard if successful, otherwise show error message
async function handleLogin() {
  const success = await authStore.login(username.value.trim(), password.value)

  if (success) {
    errorMessage.value = ''
    router.push('/dashboard')
    return
  }

  errorMessage.value = authStore.errorMessage || 'Incorrect username or password'
}
// Clear all the login form fields and any error messages
function clearLoginForm() {
  username.value = ''
  password.value = ''
  errorMessage.value = ''
}
</script>

<template>
  <div class="auth-shell">
    <div class="auth-card">
      <div class="auth-brand">
        <h1 class="auth-brand-title">StrideSync</h1>
        <p class="auth-brand-subtitle">Sign in to your healthy journey</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <input
              v-model="username"
              class="input"
              type="text"
              placeholder="Enter username"
              required
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input
              v-model="password"
              class="input"
              type="password"
              placeholder="Enter password"
              required
            />
          </div>
        </div>

        <p v-if="errorMessage" class="help is-danger mb-3">{{ errorMessage }}</p>

        <div class="field is-grouped">
          <div class="control">
            <button class="button is-primary" type="submit">
              Log In
            </button>
          </div>

          <div class="control">
            <button class="button is-light" type="button" @click="clearLoginForm">
              Clear
            </button>
          </div>
        </div>
      </form>

      <div class="soft-divider"></div>

      <div class="content is-small">
        <p>Trial users:</p>
        <p>Admin: <code>tanishq</code> / <code>tanishq9988</code></p>
        <p>Admin: <code>coolprofessor</code> / <code>coolprofessor9988</code></p>
        <p>User: <code>kash</code> / <code>kash9988</code></p>
        <p>User: <code>kamala</code> / <code>kamala9988</code></p>
      </div>
    </div>
  </div>
</template>
