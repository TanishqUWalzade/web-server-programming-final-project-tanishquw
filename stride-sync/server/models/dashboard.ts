import type { DashboardSummary } from "../types"
import { connect } from "./supabase"

// This creates the dashboard summary using the logged-in user's activities.
export async function getSummary(userId: number): Promise<DashboardSummary> {
    const db = connect()

    const { data, error } = await db
        .from("activities")
        .select("duration, calories, exercise_types(name)")
        .eq("user_id", userId)

    if (error) throw error

    const activities = data ?? []

    const totalActivities = activities.length
    const totalDuration = activities.reduce(
        (sum, activity) => sum + Number(activity.duration ?? 0),
        0,
    )
    const totalCalories = activities.reduce(
        (sum, activity) => sum + Number(activity.calories ?? 0),
        0,
    )
    // I count each activity type here to find the user's most common activity.
    const counts: Record<string, number> = {}

    for (const activity of activities as any[]) {
        const typeName = activity.exercise_types?.name ?? "Unknown"
        counts[typeName] = (counts[typeName] || 0) + 1
    }

    let mostCommonActivity = "No activities yet"
    let topCount = 0

    for (const [typeName, count] of Object.entries(counts)) {
        if (count > topCount) {
            mostCommonActivity = typeName
            topCount = count
        }
    }

    return {
        totalActivities,
        totalDuration,
        totalCalories,
        mostCommonActivity,
    }
}