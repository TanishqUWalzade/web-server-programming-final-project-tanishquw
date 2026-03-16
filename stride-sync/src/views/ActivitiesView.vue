<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useActivitiesStore } from '@/stores/activities'
import type { Activity } from '@/types'

const authStore = useAuthStore()
const activitiesStore = useActivitiesStore()

const editingId = ref<number | null>(null)

const form = ref({
  type: 'Pickleball',
  duration: null as number | null,
  calories: null as number | null,
  date: '',
  notes: '',
})

const currentUser = computed(() => authStore.currentUser)

// Shows only the activities of the currently logged in user
const userActivities = computed(() => {
  if (!currentUser.value) return []

  return activitiesStore.activities.filter(
    (activity) => activity.userId === currentUser.value!.id,
  )
})

// Resets the form fields after add or update or clear is clicked
function resetForm() {
  form.value = {
    type: 'Pickleball',
    duration: null,
    calories: null,
    date: '',
    notes: '',
  }

  editingId.value = null
}

// Using the same form for both adding and editing activities
function handleSubmit() {
  if (!currentUser.value) return

  if (editingId.value !== null) {
    const updatedActivity: Activity = {
      id: editingId.value,
      userId: currentUser.value!.id,
      type: form.value.type,
      duration: form.value.duration!,
      calories: form.value.calories!,
      date: form.value.date,
      notes: form.value.notes.trim(),
    }

    activitiesStore.updateActivity(updatedActivity)
    resetForm()
    return
  }

  activitiesStore.addActivity({
    userId: currentUser.value!.id,
    type: form.value.type,
    duration: form.value.duration!,
    calories: form.value.calories!,
    date: form.value.date,
    notes: form.value.notes.trim(),
  })

  resetForm()
}

// Fill the form with existing activity data for editing
function editActivity(activity: Activity) {
  editingId.value = activity.id

  form.value = {
    type: activity.type,
    duration: activity.duration,
    calories: activity.calories,
    date: activity.date,
    notes: activity.notes,
  }
}

// Delete the selected activity and reset the form if needed
function removeActivity(activityId: number) {
  activitiesStore.deleteActivity(activityId)

  if (editingId.value === activityId) {
    resetForm()
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Activities</h1>
      <p class="page-subtitle">Manage your activity log</p>
    </div>

    <div class="columns">
      <div class="column is-8">
        <div class="box activities-table-card">
          <h2 class="title is-4">My Activities</h2>

          <table v-if="userActivities.length > 0" class="table is-fullwidth">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Calories</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in userActivities" :key="activity.id">
                <td>{{ activity.date }}</td>
                <td>{{ activity.type }}</td>
                <td>{{ activity.duration }} min</td>
                <td>{{ activity.calories }}</td>
                <td>{{ activity.notes }}</td>
                <td>
                  <div class="table-action-buttons">
                    <button class="button is-info is-small" type="button" @click="editActivity(activity)">
                      Edit
                    </button>
                    <button class="button is-danger is-small" type="button" @click="removeActivity(activity.id)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>No activities added yet.</p>
        </div>
      </div>

      <div class="column is-4">
        <form class="box activities-form-card" @submit.prevent="handleSubmit">
          <h2 class="title is-4">
            {{ editingId !== null ? 'Edit Activity' : 'Add Activity' }}
          </h2>

          <div class="field">
            <label class="label">Type</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="form.type" required>
                  <option>Pickleball</option>
                  <option>Running</option>
                  <option>Walking</option>
                  <option>Gym</option>
                  <option>Cycling</option>
                  <option>Yoga</option>
                  <option>Swimming</option>
                  <option>Hiking</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">Duration (minutes)</label>
            <div class="control">
              <input
                v-model.number="form.duration"
                class="input"
                type="number"
                min="1"
                placeholder="Max-effort minutes"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Calories</label>
            <div class="control">
              <input
                v-model.number="form.calories"
                class="input"
                type="number"
                min="1"
                placeholder="Calories burned"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Date</label>
            <div class="control">
              <input
                v-model="form.date"
                class="input"
                type="date"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Notes</label>
            <div class="control">
              <textarea
                v-model="form.notes"
                class="textarea"
                rows="4"
                placeholder="Example: Chased after my dog this morning, which turned into an unexpectedly active start to the day."
              ></textarea>
            </div>
          </div>

          <div class="field is-grouped">
            <div class="control">
              <button class="button is-primary" type="submit">
                {{ editingId !== null ? 'Update Activity' : 'Add Activity' }}
              </button>
            </div>

            <div class="control">
              <button class="button is-light" type="button" @click="resetForm">
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>