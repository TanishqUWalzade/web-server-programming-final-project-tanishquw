import type { Activity, PagingRequest } from "../types"
import { connect, toCamelCase, toSnakeCase } from "./supabase"

export const TABLE_NAME = "activities"

type ItemType = Activity

// This converts the activity row from Supabase into the Activity format used by my frontend.
function mapActivity(row: Record<string, unknown>): ItemType {
    const activity = toCamelCase(row) as any

    return {
        id: activity.id,
        userId: activity.userId,
        exerciseTypeId: activity.exerciseTypeId,
        type: activity.exerciseTypes?.name ?? activity.type,
        duration: activity.duration,
        calories: activity.calories,
        date: activity.activityDate,
        notes: activity.notes,
    }
}

// This gets only the activities for the logged-in user.
// The userId comes from the verified JWT, not from the client form.
export async function getAll(userId: number, params: PagingRequest) {
    const db = connect()

    let query = db
        .from(TABLE_NAME)
        .select("*, exercise_types(*)", { count: "estimated" })
        .eq("user_id", userId)

    if (params?.search) {
        const search = String(params.search).toLowerCase()
        query = query.ilike("notes", `%${search}%`)
    }

    const sortBy = params?.sortBy ? String(params.sortBy) : "activity_date"
    query = query.order(sortBy, { ascending: !!params?.descending ? false : true })

    const page = Number(params?.page) || 1
    const pageSize = Number(params?.pageSize) || 20
    const start = (page - 1) * pageSize

    const result = await query.range(start, start + pageSize - 1)

    if (result.error) throw result.error

    const list = result.data?.map((row) => mapActivity(row)) ?? []
    const count = result.count ?? 0

    return { list, count }
}

export async function get(userId: number, id: number): Promise<ItemType> {
    const db = connect()

    const { data, error } = await db
        .from(TABLE_NAME)
        .select("*, exercise_types(*)")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

    if (error) throw error

    return mapActivity(data)
}

export async function create(
    userId: number,
    item: {
        exerciseTypeId: number
        duration: number
        calories: number
        date: string
        notes: string
    },
): Promise<ItemType> {
    const db = connect()

    const row = toSnakeCase({
        userId,
        exerciseTypeId: item.exerciseTypeId,
        duration: item.duration,
        calories: item.calories,
        activityDate: item.date,
        notes: item.notes,
    })

    const { data, error } = await db
        .from(TABLE_NAME)
        .insert(row)
        .select("*, exercise_types(*)")
        .single()

    if (error) throw error

    return mapActivity(data)
}

// This update checks both the activity id and user id.
// That way, users cannot update another user's activity.
export async function update(
    userId: number,
    id: number,
    item: Partial<{
        exerciseTypeId: number
        duration: number
        calories: number
        date: string
        notes: string
    }>,
): Promise<ItemType> {
    const db = connect()

    const updateData: Record<string, unknown> = {}

    if (item.exerciseTypeId !== undefined) updateData.exerciseTypeId = item.exerciseTypeId
    if (item.duration !== undefined) updateData.duration = item.duration
    if (item.calories !== undefined) updateData.calories = item.calories
    if (item.date !== undefined) updateData.activityDate = item.date
    if (item.notes !== undefined) updateData.notes = item.notes

    const { data, error } = await db
        .from(TABLE_NAME)
        .update(toSnakeCase(updateData))
        .eq("id", id)
        .eq("user_id", userId)
        .select("*, exercise_types(*)")
        .single()

    if (error) throw error

    return mapActivity(data)
}

// This deletes only the activity that belongs to the logged-in user.
export async function remove(userId: number, id: number): Promise<ItemType> {
    const db = connect()

    const { data, error } = await db
        .from(TABLE_NAME)
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("*, exercise_types(*)")
        .single()

    if (error) throw error

    return mapActivity(data)
}