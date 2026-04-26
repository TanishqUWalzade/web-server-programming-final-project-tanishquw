export type { DataEnvelope, DataListEnvelope, PagingRequest } from "./dataEnvelopes"

// Roles used for authorization.
// Admin users can access user management and exercise type management.
export type UserRole = "admin" | "user"

// Safe user type returned to the frontend without including passwordHash.
export type User = {
    id: number
    firstName: string
    lastName: string
    username: string
    role: UserRole
}

// Backend-only user type used during login.
// This includes the passwordHash so the server can compare passwords.
export type AuthUser = User & {
    passwordHash: string
}

// Login request body from the frontend.
export type LoginRequest = {
    username: string
    password: string
}

// Login response returned after successful authentication.
export type LoginResponse = {
    user: User
    token: string
}

// Exercise type used for the Add Activity dropdown.
export type ExerciseType = {
    id: number
    name: string
    description?: string
}

// Activity record used by the backend and frontend.
export type Activity = {
    id: number
    userId: number
    exerciseTypeId: number
    type?: string
    duration: number
    calories: number
    date: string
    notes: string
}

// Summary numbers are shown on the dashboard.
export type DashboardSummary = {
    totalActivities: number
    totalDuration: number
    totalCalories: number
    mostCommonActivity: string
}