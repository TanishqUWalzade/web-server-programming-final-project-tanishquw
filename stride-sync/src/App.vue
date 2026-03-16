<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <NavBar v-if="authStore.isLoggedIn" />

  <main class="section">
    <div class="container">
      <RouterView />
    </div>
  </main>
</template>

<style scoped></style>