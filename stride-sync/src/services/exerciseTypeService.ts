import { apiFetch } from './api'
import type { ExerciseType } from '@/types'

export function getExerciseTypes() {
  // Gets the activity types used in the Add Activity Dropdown.
  return apiFetch<ExerciseType[]>('/exercise-types')
}