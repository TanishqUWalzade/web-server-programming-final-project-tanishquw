<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useActivitiesStore } from '@/stores/activities'
import * as dashboardService from '@/services/dashboardService'

const authStore = useAuthStore()
const activitiesStore = useActivitiesStore()

const currentUser = computed(() => authStore.currentUser)

// Default summary values are shown before the backend data loads.
const summary = ref({
  totalActivities: 0,
  totalDuration: 0,
  totalCalories: 0,
  mostCommonActivity: 'No activities yet',
})

const isLoading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    isLoading.value = true

    // Load recent activities and dashboard totals from the backend.
    await activitiesStore.loadActivities()
    summary.value = await dashboardService.getSummary()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load dashboard'
  } finally {
    isLoading.value = false
  }
})

// The backend already returns only the logged-in user's activities.
const userActivities = computed(() => activitiesStore.activities)

// These computed values make the template cleaner.
const totalActivities = computed(() => summary.value.totalActivities)
const totalDuration = computed(() => summary.value.totalDuration)
const totalCalories = computed(() => summary.value.totalCalories)
const mostCommonActivity = computed(() => summary.value.mostCommonActivity)
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p v-if="currentUser" class="page-subtitle">
        Welcome,
        <strong>{{ currentUser.role === 'admin' ? 'Admin' : 'User' }}</strong>
        {{ currentUser.firstName }} {{ currentUser.lastName }}
      </p>
    </div>

    <p v-if="isLoading">Loading dashboard...</p>
    <p v-if="errorMessage" class="help is-danger">{{ errorMessage }}</p>

    <div class="columns is-multiline">
      <div class="column is-3">
        <div class="box brand-stat-card">
          <p class="heading">Total Activities</p>
          <p class="title">{{ totalActivities }}</p>
        </div>
      </div>

      <div class="column is-3">
        <div class="box brand-stat-card">
          <p class="heading">Total Duration</p>
          <p class="title">{{ totalDuration }} min</p>
        </div>
      </div>

      <div class="column is-3">
        <div class="box brand-stat-card">
          <p class="heading">Total Calories</p>
          <p class="title">{{ totalCalories }}</p>
        </div>
      </div>

      <div class="column is-3">
        <div class="box brand-stat-card">
          <p class="heading">Most Frequent Activity</p>
          <p class="title is-4 frequent-activity-text">{{ mostCommonActivity }}</p>
        </div>
      </div>
    </div>

    <div class="box app-panel">
      <h2 class="title is-4">Recent Activities</h2>

      <table v-if="userActivities.length > 0" class="table is-fullwidth">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Calories</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in userActivities" :key="activity.id">
            <td>{{ activity.date }}</td>
            <td>{{ activity.type }}</td>
            <td>{{ activity.duration }} min</td>
            <td>{{ activity.calories }}</td>
            <td>{{ activity.notes }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else>No activities found.</p>
    </div>
  </div>
</template>

<style scoped>
.frequent-activity-text {
  font-size: 2rem;
  line-height: 1.2;
}
</style>