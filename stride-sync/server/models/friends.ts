import type { Activity, User } from "../types"
import { connect, toCamelCase } from "./supabase"

// This converts a user row from Supabase into the User format used by my app.
function mapUser(row: Record<string, unknown>): User {
    const user = toCamelCase(row) as unknown as User

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
    }
}

// This converts a friend's activity row into the format shown in the Friends Feed.
function mapFriendActivity(row: Record<string, unknown>): Activity & { friendName: string } {
    const activity = row as any

    return {
        id: activity.id,
        userId: activity.user_id,
        exerciseTypeId: activity.exercise_type_id,
        type: activity.exercise_types?.name ?? "Unknown",
        duration: activity.duration,
        calories: activity.calories,
        date: activity.activity_date,
        notes: activity.notes,
        friendName: activity.users
            ? `${activity.users.first_name} ${activity.users.last_name}`
            : "Unknown User",
    }
}
// This gets the current user's friends from the friendships table.
export async function getFriends(userId: number): Promise<User[]> {
    const db = connect()

    const { data, error } = await db
        .from("friendships")
        .select("users!friendships_friend_id_fkey(id, first_name, last_name, username, role)")
        .eq("user_id", userId)

    if (error) throw error

    return (
        data?.map((row: any) => mapUser(row.users)).filter(Boolean) ?? []
    )
}
// This removes users who are already friends so they do not show in the add-friend list.
export async function getAvailableUsers(userId: number): Promise<User[]> {
    const db = connect()

    const { data: friendships, error: friendshipError } = await db
        .from("friendships")
        .select("friend_id")
        .eq("user_id", userId)

    if (friendshipError) throw friendshipError

    const friendIds = friendships?.map((friendship) => friendship.friend_id) ?? []
    const excludedIds = [userId, ...friendIds]

    let query = db
        .from("users")
        .select("id, first_name, last_name, username, role")
        .order("first_name", { ascending: true })

    if (excludedIds.length > 0) {
        query = query.not("id", "in", `(${excludedIds.join(",")})`)
    }

    const { data, error } = await query

    if (error) throw error

    return data?.map((row) => mapUser(row)) ?? []
}
// This gets activities only from users who are friends with the logged-in user.
export async function getFriendActivities(userId: number) {
    const db = connect()

    const { data: friendships, error: friendshipError } = await db
        .from("friendships")
        .select("friend_id")
        .eq("user_id", userId)

    if (friendshipError) throw friendshipError

    const friendIds = friendships?.map((friendship) => friendship.friend_id) ?? []

    if (friendIds.length === 0) {
        return []
    }

    const { data, error } = await db
        .from("activities")
        .select("*, exercise_types(*), users(first_name, last_name)")
        .in("user_id", friendIds)
        .order("activity_date", { ascending: false })

    if (error) throw error

    return data?.map((row) => mapFriendActivity(row)) ?? []
}

// This adds another user as a friend of the logged-in user.
export async function addFriend(userId: number, friendId: number) {
    const db = connect()

    const { data, error } = await db
        .from("friendships")
        .insert({
            user_id: userId,
            friend_id: friendId,
        })
        .select()
        .single()

    if (error) throw error

    return data
}

// This removes a friend relationship for the logged-in user.
export async function removeFriend(userId: number, friendId: number) {
    const db = connect()

    const { data, error } = await db
        .from("friendships")
        .delete()
        .eq("user_id", userId)
        .eq("friend_id", friendId)
        .select()
        .single()

    if (error) throw error

    return data
}