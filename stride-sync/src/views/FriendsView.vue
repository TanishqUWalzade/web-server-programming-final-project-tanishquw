<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as friendService from '@/services/friendService'
import type { FriendActivity } from '@/services/friendService'
import type { User } from '@/types'

const friendActivities = ref<FriendActivity[]>([])
const friends = ref<User[]>([])
const availableUsers = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

async function loadFriendsPage() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Load all friend page data together so the page stays in sync.
    const [friendsResult, availableUsersResult, activitiesResult] =
      await Promise.all([
        friendService.getFriends(),
        friendService.getAvailableUsers(),
        friendService.getFriendActivities(),
      ])

    friends.value = friendsResult
    availableUsers.value = availableUsersResult
    friendActivities.value = activitiesResult
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load friends'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Load friends, available users, and friend activities when the page opens.
  await loadFriendsPage()
})

async function addFriend(userId: number) {
  try {
    // Add the selected user as a friend, then reload the page data.
    await friendService.addFriend(userId)
    await loadFriendsPage()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to add friend'
  }
}

async function removeFriend(userId: number) {
  try {
    // Remove the selected friend, then reload the page data.
    await friendService.removeFriend(userId)
    await loadFriendsPage()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to remove friend'
  }
}
</script>

<template>
  <div>
    <h1 class="page-title">Friends Feed</h1>
    <p class="page-subtitle">Add friends and view their activities.</p>

    <p v-if="isLoading">Loading friends...</p>
    <p v-if="errorMessage" class="help is-danger mb-3">{{ errorMessage }}</p>

    <div class="columns">
      <div class="column is-6">
        <div class="box">
          <h2 class="title is-4">Current Friends</h2>

          <table v-if="friends.length > 0" class="table is-fullwidth">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="friend in friends" :key="friend.id">
                <td>{{ friend.firstName }} {{ friend.lastName }}</td>
                <td>{{ friend.username }}</td>
                <td>
                  <button
                    class="button is-danger is-small"
                    type="button"
                    @click="removeFriend(friend.id)"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>No friends added yet.</p>
        </div>
      </div>

      <div class="column is-6">
        <div class="box">
          <h2 class="title is-4">Available Users</h2>

          <table v-if="availableUsers.length > 0" class="table is-fullwidth">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in availableUsers" :key="user.id">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.username }}</td>
                <td>
                  <button
                    class="button is-primary is-small"
                    type="button"
                    @click="addFriend(user.id)"
                  >
                    Add Friend
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>No available users to add.</p>
        </div>
      </div>
    </div>

    <div class="box">
      <h2 class="title is-4">Friend Activities</h2>

      <table
        v-if="friendActivities.length > 0"
        class="table is-fullwidth is-striped is-hoverable"
      >
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