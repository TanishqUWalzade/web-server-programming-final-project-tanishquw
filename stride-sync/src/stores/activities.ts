import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Activity } from '@/types'
import * as activityService from '@/services/activityService'

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([])
  const errorMessage = ref('')
  const isLoading = ref(false)

  // Activities are now loaded from the backend instead of activities.json.
  async function loadActivities() {
    try {
      isLoading.value = true
      activities.value = await activityService.getActivities()
      errorMessage.value = ''
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'Unable to load activities'
    } finally {
      isLoading.value = false
    }
  }
  // After creating an activity in the backend, add it to the local list.
  async function addActivity(activity: {
    exerciseTypeId: number
    duration: number
    calories: number
    date: string
    notes: string
  }) {
    const newActivity = await activityService.createActivity(activity)
    activities.value.push(newActivity)
    return newActivity
  }
  // After updating in the backend, replace the old activity in the local list.
  async function updateActivity(
    id: number,
    activity: Partial<{
      exerciseTypeId: number
      duration: number
      calories: number
      date: string
      notes: string
    }>,
  ) {
    const updatedActivity = await activityService.updateActivity(id, activity)

    const index = activities.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      activities.value[index] = updatedActivity
    }

    return updatedActivity
  }

  // After deleting in the backend, remove it from the local list.
  async function deleteActivity(activityId: number) {
    const deletedActivity = await activityService.deleteActivity(activityId)
    activities.value = activities.value.filter((activity) => activity.id !== activityId)
    return deletedActivity
  }

  return {
    activities,
    errorMessage,
    isLoading,
    loadActivities,
    addActivity,
    updateActivity,
    deleteActivity,
  }
})