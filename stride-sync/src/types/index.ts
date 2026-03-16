// Supported user roles in the application
export type UserRole = 'admin' | 'user'

// Structure for user record
export type User = {
  id: number
  firstName: string
  lastName: string
  username: string
  password: string
  role: UserRole
  friends: number[]
}

// Predefined activity types in the application
export type ActivityType =
  | 'Pickleball'
  | 'Running'
  | 'Walking'
  | 'Cycling'
  | 'Gym'
  | 'Yoga'
  | 'Swimming'
  | 'Hiking'

// Structure for activity record
export type Activity = {
  id: number
  userId: number
  type: string
  duration: number
  calories: number
  date: string
  notes: string
}