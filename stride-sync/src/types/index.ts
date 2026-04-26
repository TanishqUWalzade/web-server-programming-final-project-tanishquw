// Roles used in the frontend for showing/hiding admin features.
export type UserRole = 'admin' | 'user'

// Save user information returned from the backend.
// Passwords and password hashes are never stored in the frontend.
export type User = {
  id: number
  firstName: string
  lastName: string
  username: string
  role: UserRole
}

// Exercise types are used in the Add Activity dropdown.
export type ExerciseType = {
  id: number
  name: string
  description?: string
}

// Activity data shown on the Dashboard, Activities page and Friends page.
export type Activity = {
  id: number
  userId: number
  exerciseTypeId: number
  type: string
  duration: number
  calories: number
  date: string
  notes: string
}

// Summary numbers shown on the Dashboard page.
export type DashboardSummary = {
  totalActivities: number
  totalDuration: number
  totalCalories: number
  mostCommonActivity: string
}