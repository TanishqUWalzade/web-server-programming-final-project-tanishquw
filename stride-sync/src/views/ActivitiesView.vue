<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import * as exerciseTypeService from '@/services/exerciseTypeService'
import type { Activity, ExerciseType } from '@/types'

const activitiesStore = useActivitiesStore()

const editingId = ref<number | null>(null)
const errorMessage = ref('')
const isLoading = ref(false)

const exerciseTypes = ref<ExerciseType[]>([])

// This form is used for both adding and editing activities.
const form = ref({
  exerciseTypeId: null as number | null,
  duration: null as number | null,
  calories: null as number | null,
  date: '',
  notes: '',
})

onMounted(async () => {
  try {
    isLoading.value = true

    // Load the user's activities and the activity type dropdown values from the backend.
    await activitiesStore.loadActivities()
    exerciseTypes.value = await exerciseTypeService.getExerciseTypes()

    const firstExerciseType = exerciseTypes.value[0]

    if (firstExerciseType) {
      form.value.exerciseTypeId = firstExerciseType.id
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to load activities'
  } finally {
    isLoading.value = false
  }
})

// The backend already returns only the logged-in user's activities.
const userActivities = computed(() => activitiesStore.activities)

function resetForm() {
  const firstExerciseType = exerciseTypes.value[0]

  form.value = {
    exerciseTypeId: firstExerciseType ? firstExerciseType.id : null,
    duration: null,
    calories: null,
    date: '',
    notes: '',
  }

  editingId.value = null
  errorMessage.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.value.exerciseTypeId) {
    errorMessage.value = 'Please select an activity type'
    return
  }

  if (!form.value.duration || form.value.calories === null || !form.value.date) {
    errorMessage.value = 'Type, duration, calories, and date are required'
    return
  }

  try {
    const activityInput = {
      exerciseTypeId: form.value.exerciseTypeId,
      duration: form.value.duration,
      calories: form.value.calories,
      date: form.value.date,
      notes: form.value.notes.trim(),
    }

    // If editing id has a value, update the existing activity.
    if (editingId.value !== null) {
      await activitiesStore.updateActivity(editingId.value, activityInput)
      resetForm()
      return
    }
    // Otherwise create a new activity.
    await activitiesStore.addActivity(activityInput)
    resetForm()
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to save activity'
  }
}

function editActivity(activity: Activity) {
  // Fill the form with the selected activity data.
  editingId.value = activity.id

  form.value = {
    exerciseTypeId: activity.exerciseTypeId,
    duration: activity.duration,
    calories: activity.calories,
    date: activity.date,
    notes: activity.notes,
  }
}

async function removeActivity(activityId: number) {
  try {
    await activitiesStore.deleteActivity(activityId)

    if (editingId.value === activityId) {
      resetForm()
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Unable to delete activity'
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Activities</h1>
      <p class="page-subtitle">Manage your activity log</p>
    </div>

    <p v-if="isLoading">Loading activities...</p>
    <p v-if="errorMessage" class="help is-danger mb-3">{{ errorMessage }}</p>

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
                    <button
                      class="button is-info is-small"
                      type="button"
                      @click="editActivity(activity)"
                    >
                      Edit
                    </button>

                    <button
                      class="button is-danger is-small"
                      type="button"
                      @click="removeActivity(activity.id)"
                    >
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
                <select v-model.number="form.exerciseTypeId" required>
                  <option
                    v-for="exerciseType in exerciseTypes"
                    :key="exerciseType.id"
                    :value="exerciseType.id"
                  >
                    {{ exerciseType.name }}
                  </option>
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
                min="0"
                placeholder="Calories burned"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Date</label>
            <div class="control">
              <input v-model="form.date" class="input" type="date" required />
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