import { apiFetch } from './api'

// This is the summary data shown on the Dashboard page.
export type DashboardSummary = {
  totalActivities: number
  totalDuration: number
  totalCalories: number
  mostCommonActivity: string
}

export function getSummary() {
  // Gets dashboard totals calculated by the backend for the logged-in user.
  return apiFetch<DashboardSummary>('/dashboard/summary')
}