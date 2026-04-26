import { Router } from "express"
import { create, get, getAll, remove, update } from "../models/activities"
import { requireAuth } from "../tools/auth"
import type { Activity, DataEnvelope, DataListEnvelope } from "../types"

const app = Router()

// All activity routes require login first.
app.use(requireAuth)

app.get("/", async (req, res) => {
    const { list, count } = await getAll(req.user!.id, req.query)

    const response: DataListEnvelope<Activity> = {
        data: list,
        isSuccess: true,
        total: count,
    }

    res.send(response)
})

app.get("/:id", async (req, res) => {
    const response: DataEnvelope<Activity> = {
        data: await get(req.user!.id, Number(req.params.id)),
        isSuccess: true,
    }

    res.send(response)
})

// The user id is taken from req.user after JWT verification.
app.post("/", async (req, res) => {
    const newActivity = await create(req.user!.id, req.body)

    const response: DataEnvelope<Activity> = {
        data: newActivity,
        isSuccess: true,
    }

    res.send(response)
})

app.patch("/:id", async (req, res) => {
    const updatedActivity = await update(
        req.user!.id,
        Number(req.params.id),
        req.body,
    )

    const response: DataEnvelope<Activity> = {
        data: updatedActivity,
        isSuccess: true,
    }

    res.send(response)
})

app.delete("/:id", async (req, res) => {
    const deletedActivity = await remove(req.user!.id, Number(req.params.id))

    const response: DataEnvelope<Activity> = {
        data: deletedActivity,
        isSuccess: true,
        message: "Activity has been deleted.",
    }

    res.send(response)
})

export default app