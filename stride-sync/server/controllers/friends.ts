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
    // Load activity feed only from the logged-in user's friends.
    const activities = await getFriendActivities(req.user!.id)

    const response: DataListEnvelope<Activity & { friendName: string }> = {
        data: activities,
        isSuccess: true,
        total: activities.length,
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