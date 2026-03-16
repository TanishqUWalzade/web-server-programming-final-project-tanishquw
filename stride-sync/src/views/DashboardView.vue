<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useActivitiesStore } from '@/stores/activities'

const authStore = useAuthStore()
const activitiesStore = useActivitiesStore()

const currentUser = computed(() => authStore.currentUser)

// Shows only the activities of the logged in user on the dashboard
const userActivities = computed(() => {
  if (!currentUser.value) return []

  return activitiesStore.activities.filter(
    (activity) => activity.userId === currentUser.value!.id,
  )
})

// Count total activities logged by the user
const totalActivities = computed(() => userActivities.value.length)

// Calculate total duration of all activities for the user
const totalDuration = computed(() =>
  userActivities.value.reduce((sum, activity) => sum + activity.duration, 0),
)

// Calculate total calories burned
const totalCalories = computed(() =>
  userActivities.value.reduce((sum, activity) => sum + activity.calories, 0),
)

// Find the activity that appears most frequently in the user's activity log 
const mostCommonActivity = computed(() => {
  if (userActivities.value.length === 0) return 'No activities yet'

  const counts: Record<string, number> = {}

  for (const activity of userActivities.value) {
    counts[activity.type] = (counts[activity.type] || 0) + 1
  }

  let topActivity = ''
  let topCount = 0

  for (const [type, count] of Object.entries(counts)) {
    if (count > topCount) {
      topActivity = type
      topCount = count
    }
  }

  return topActivity
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p v-if="currentUser" class="page-subtitle">
        Welcome, <strong>{{ currentUser.role === 'admin' ? 'Admin' : 'User' }}</strong> {{ currentUser.firstName }} {{ currentUser.lastName }}
      </p>
    </div>

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