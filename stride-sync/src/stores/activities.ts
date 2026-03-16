import { defineStore } from 'pinia'
import { ref } from 'vue'
import activitiesData from '@/data/activities.json'
import type { Activity } from '@/types'

export const useActivitiesStore = defineStore('activities', () => {
  // Loading initial activity data from activities.json file
  const activities = ref<Activity[]>(activitiesData.activities as Activity[])

  function addActivity(activity: Omit<Activity, 'id'>) {
    // Generate a next id based on current highest id in the list
    const newId =
      activities.value.length > 0
        ? Math.max(...activities.value.map((a) => a.id)) + 1
        : 1

    activities.value.push({
      id: newId,
      ...activity,
    })
  }

  function updateActivity(updatedActivity: Activity) {
    const index = activities.value.findIndex((activity) => activity.id === updatedActivity.id)
    // Replace the old activity with the updated one in the list
    if (index !== -1) {
      activities.value[index] = { ...updatedActivity }
    }
  }

  function deleteActivity(activityId: number) {
    // Remove the selected activity from the list
    activities.value = activities.value.filter((activity) => activity.id !== activityId)
  }

  return {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
  }
})