<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useInfiniteScroll } from '@vueuse/core'
import * as friendService from '@/services/friendService'
import type { FriendActivity } from '@/services/friendService'
import type { User } from '@/types'

const friendActivities = ref<FriendActivity[]>([])
const friends = ref<User[]>([])
const availableUsers = ref<User[]>([])

const isLoading = ref(false)
const isActivityLoading = ref(false)
const errorMessage = ref('')

const activityFeedContainer = ref<HTMLElement | null>(null)

const activityLimit = 10
const activityOffset = ref(0)
const totalActivities = ref(0)
const hasMoreActivities = ref(true)

const activityCountLabel = computed(() => {
  return `Showing ${friendActivities.value.length} of ${totalActivities.value}`
})

async function loadFriendLists() {
  const [friendsResult, availableUsersResult] = await Promise.all([
    friendService.getFriends(),
    friendService.getAvailableUsers(),
  ])

  friends.value = friendsResult
  availableUsers.value = availableUsersResult
}

function resetFriendActivities() {
  friendActivities.value = []
  activityOffset.value = 0
  totalActivities.value = 0
  hasMoreActivities.value = true
}

async function loadMoreFriendActivities() {
  if (isActivityLoading.value || !hasMoreActivities.value) return

  try {
    isActivityLoading.value = true
    errorMessage.value = ''

    const activitiesResult = await friendService.getFriendActivities(
      activityLimit,
      activityOffset.value,
    )

    const newActivities = Array.isArray(activitiesResult.data)
      ? activitiesResult.data
      : []

    // Append the next server chunk to the existing Vue state.
    friendActivities.value.push(...newActivities)

    totalActivities.value =
      activitiesResult.total ?? friendActivities.value.length

    activityOffset.value += newActivities.length

    // Keep loading until the number shown reaches the server's total count.
    hasMoreActivities.value =
      friendActivities.value.length < totalActivities.value
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load friend activities'
  } finally {
    isActivityLoading.value = false
  }
}

async function loadFriendsPage() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    await loadFriendLists()

    resetFriendActivities()
    await loadMoreFriendActivities()
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load friends'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadFriendsPage()
})

useInfiniteScroll(
  activityFeedContainer,
  async () => {
    await loadMoreFriendActivities()
  },
  {
    distance: 120,
    canLoadMore: () => hasMoreActivities.value && !isActivityLoading.value,
  },
)

async function addFriend(userId: number) {
  try {
    await friendService.addFriend(userId)
    await loadFriendsPage()
  } catch (error) {
    console.error(error)

    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to add friend'
  }
}

async function removeFriend(userId: number) {
  try {
    await friendService.removeFriend(userId)
    await loadFriendsPage()
  } catch (error) {
    console.error(error)

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
      <div class="level mb-3">
        <div class="level-left">
          <h2 class="title is-4 mb-0">Friend Activities</h2>
        </div>

        <div class="level-right">
          <span v-if="totalActivities > 0" class="tag is-info is-light">
            {{ activityCountLabel }}
          </span>
        </div>
      </div>

      <div ref="activityFeedContainer" class="friend-activities-scroll">
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

        <div v-if="isActivityLoading" class="box mt-3">
          <p class="has-text-grey mb-3">Loading more friend activities...</p>

          <div class="columns is-mobile mb-2">
            <div class="column">
              <div class="skeleton-lines"></div>
            </div>
            <div class="column">
              <div class="skeleton-lines"></div>
            </div>
            <div class="column">
              <div class="skeleton-lines"></div>
            </div>
          </div>

          <div class="columns is-mobile mb-2">
            <div class="column">
              <div class="skeleton-lines"></div>
            </div>
            <div class="column">
              <div class="skeleton-lines"></div>
            </div>
            <div class="column">
              <div class="skeleton-lines"></div>
            </div>
          </div>

          <div class="skeleton-block"></div>
        </div>

        <p
          v-if="!isActivityLoading && friendActivities.length === 0"
          class="has-text-grey"
        >
          No friend activities found.
        </p>

        <p
          v-if="!hasMoreActivities && friendActivities.length > 0"
          class="has-text-centered has-text-grey mt-4"
        >
          You have reached the end of the friends feed.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friend-activities-scroll {
  max-height: 420px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
</style>