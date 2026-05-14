import { Router } from "express"
import {
    addFriend,
    getAvailableUsers,
    getFriendActivities,
    getFriends,
    removeFriend,
} from "../models/friends"
import { requireAuth } from "../tools/auth"
import type { Activity, DataEnvelope, DataListEnvelope, User } from "../types"

const app = Router()

// All friend routes need the logged-in user from the JWT.
app.use(requireAuth)

function getPaginationParams(req: any) {
    const limit = Math.min(Number(req.query.limit) || 10, 25)
    const offset = Math.max(Number(req.query.offset) || 0, 0)

    return { limit, offset }
}

app.get("/", async (req, res) => {
    // Get the current user's saved friends.
    const friends = await getFriends(req.user!.id)

    const response: DataListEnvelope<User> = {
        data: friends,
        isSuccess: true,
        total: friends.length,
    }

    res.send(response)
})

app.get("/available-users", async (req, res) => {
    // Show users who are not already friends, so they can be added.
    const users = await getAvailableUsers(req.user!.id)

    const response: DataListEnvelope<User> = {
        data: users,
        isSuccess: true,
        total: users.length,
    }

    res.send(response)
})

app.get("/activities", async (req, res) => {
    const { limit, offset } = getPaginationParams(req)

    // Load activity feed only from the logged-in user's friends.
    // This endpoint is paginated so the browser does not download the whole feed at once.
    const result = await getFriendActivities(req.user!.id, limit, offset)

    const response: DataListEnvelope<Activity & { friendName: string }> & {
        limit: number
        offset: number
        hasMore: boolean
    } = {
        data: result.data,
        isSuccess: true,
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.data.length < result.total,
    }

    res.send(response)
})

app.post("/:friendId", async (req, res) => {
    // Add a friendship from the logged-in user to the selected user.
    const friendship = await addFriend(req.user!.id, Number(req.params.friendId))

    const response: DataEnvelope<typeof friendship> = {
        data: friendship,
        isSuccess: true,
        message: "Friend added successfully.",
    }

    res.send(response)
})

app.delete("/:friendId", async (req, res) => {
    // Remove only the friendship owned by the logged-in user.
    const friendship = await removeFriend(req.user!.id, Number(req.params.friendId))

    const response: DataEnvelope<typeof friendship> = {
        data: friendship,
        isSuccess: true,
        message: "Friend removed successfully.",
    }

    res.send(response)
})

export default app