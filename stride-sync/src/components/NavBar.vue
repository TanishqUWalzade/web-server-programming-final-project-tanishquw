<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const isActive = ref(false)
const authStore = useAuthStore()
const router = useRouter()

// For showing logged-in user's full name in navbar
const fullName = computed(() => {
  const user = authStore.currentUser
  return user ? `${user.firstName} ${user.lastName}` : ''
})

// Clears session and going back to login page
function handleLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <nav class="navbar app-navbar mb-5" role="navigation" aria-label="main navigation">
    <div class="container is-fluid">
      <div class="navbar-brand">
        <RouterLink to="/dashboard" class="navbar-item app-brand">
          StrideSync
        </RouterLink>

        <a
          role="button"
          class="navbar-burger"
          :class="{ 'is-active': isActive }"
          aria-label="menu"
          aria-expanded="false"
          @click="isActive = !isActive"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isActive }">
        <div class="navbar-start">
          <RouterLink to="/dashboard" class="navbar-item nav-link">
            <span class="icon-text">
              <span class="icon"><i class="fas fa-table-columns"></i></span>
              <span>Dashboard</span>
            </span>
          </RouterLink>

          <RouterLink to="/activities" class="navbar-item nav-link">
            <span class="icon-text">
              <span class="icon"><i class="fas fa-dumbbell"></i></span>
              <span>Activities</span>
            </span>
          </RouterLink>

          <RouterLink to="/friends" class="navbar-item nav-link">
            <span class="icon-text">
              <span class="icon"><i class="fas fa-user-group"></i></span>
              <span>Friends Feed</span>
            </span>
          </RouterLink>

          <RouterLink v-if="authStore.isAdmin" to="/admin/users" class="navbar-item nav-link">
            <span class="icon-text">
              <span class="icon"><i class="fas fa-users-gear"></i></span>
              <span>Manage Users</span>
            </span>
          </RouterLink>
        </div>

        <div class="navbar-end">
          <div class="navbar-item user-section">
            <span class="user-name">{{ fullName }}</span>
            <button class="button is-light is-small" @click="handleLogout">Log Out</button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>

/* Keeps the navbar fixed at top while scrolling */
.app-navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #dbe4ee;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.app-navbar .container.is-fluid {
  padding-left: 1rem;
  padding-right: 1rem;
}

.app-brand {
  color: #1e293b;
  font-size: 1.15rem;
  font-weight: 700;
}

.app-brand:hover {
  color: #1e293b;
  background-color: transparent;
}

.nav-link {
  color: #1e293b;
  font-weight: 500;
}

.nav-link:hover {
  color: #1e293b;
  background-color: #eff6ff;
}

.nav-link .icon {
  margin-right: 0.35rem;
}

/* Align the logged-in user's name and logout button neatly */
.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name {
  color: #1e293b;
  font-weight: 600;
}

.navbar-burger {
  color: #1e293b;
}
</style>