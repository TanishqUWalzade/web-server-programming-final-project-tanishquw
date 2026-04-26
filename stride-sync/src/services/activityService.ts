import { apiFetch } from './api'
import type { Activity } from '@/types'

export type ActivityInput = {
  exerciseTypeId: number
  duration: number
  calories: number
  date: string
  notes: string
}

// This type is used when creating or updating from the form.
export function getActivities() {
  // Gets only the logged-in user's activities because the backend checks the JWT.
  return apiFetch<Activity[]>('/activities')
}

export function createActivity(activity: ActivityInput) {
  // Sends the new activity to the backend tp be saved in Supabase.
  return apiFetch<Activity>('/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  })
}

export function updateActivity(id: number, activity: Partial<ActivityInput>) {
  // Updates the selected activity through the backend.
    return apiFetch<Activity>(`/activities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(activity),
  })
}

export function deleteActivity(id: number) {
  // Deletes the selected activity through the backend.
  return apiFetch<Activity>(`/activities/${id}`, {
    method: 'DELETE',
  })
}