<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useActivitiesStore } from '@/stores/activities'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const activitiesStore = useActivitiesStore()

const currentUser = computed(() => authStore.currentUser)

// Get only the activities of the users who are in the current user's friends list as mentioned in users.json
const friendActivities = computed(() => {
  if (!currentUser.value) return []

  const friendIds = currentUser.value.friends

  return activitiesStore.activities
    .filter((activity) => friendIds.includes(activity.userId))
    .map((activity) => {
      const friend = usersStore.users.find((user) => user.id === activity.userId)

      // Add the friend's full name so it can be displayed in the feed, if the friend is not found (which shouldn't happen) show "Unknown User"
      return {
        ...activity,
        friendName: friend ? `${friend.firstName} ${friend.lastName}` : 'Unknown User',
      }
    })
})
</script>

<template>
  <div>
    <h1 class="page-title">Friends Feed</h1>
    <p class="page-subtitle">View activities from your friends and compete hard!!</p>

    <div class="box">
      <table v-if="friendActivities.length > 0" class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Friend</th>
            <th>Date</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Calories</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="activity in friendActivities" :key="activity.id">
            <td>{{ activity.friendName }}</td>
            <td>{{ activity.date }}</td>
            <td>{{ activity.type }}</td>
            <td>{{ activity.duration }} min</td>
            <td>{{ activity.calories }}</td>
            <td>{{ activity.notes }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else>No friend activities found.</p>
    </div>
  </div>
</template>