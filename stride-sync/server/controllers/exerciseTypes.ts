import { Router } from "express"
import { create, get, getAll, remove, update } from "../models/exerciseTypes"
import { requireAdmin, requireAuth } from "../tools/auth"
import type { DataEnvelope, DataListEnvelope, ExerciseType } from "../types"

const app = Router()

// Any logged-in user can read the exercise types for the activity dropdown.
app.get("/", requireAuth, async (req, res) => {
    const { list, count } = await getAll(req.query)

    const response: DataListEnvelope<ExerciseType> = {
        data: list,
        isSuccess: true,
        total: count,
    }

    res.send(response)
})

app.get("/:id", requireAuth, async (req, res) => {
    const response: DataEnvelope<ExerciseType> = {
        data: await get(Number(req.params.id)),
        isSuccess: true,
    }

    res.send(response)
})

// Only admins can create new exercise types so the dropdown stays controlled.
app.post("/", requireAuth, requireAdmin, async (req, res) => {
    const newType = await create(req.body)

    const response: DataEnvelope<ExerciseType> = {
        data: newType,
        isSuccess: true,
    }

    res.send(response)
})

// Updating exercise types is admin-only because it affects all users.
app.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
    const updatedType = await update(Number(req.params.id), req.body)

    const response: DataEnvelope<ExerciseType> = {
        data: updatedType,
        isSuccess: true,
    }

    res.send(response)
})

app.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    const deletedType = await remove(Number(req.params.id))

    const response: DataEnvelope<ExerciseType> = {
        data: deletedType,
        isSuccess: true,
        message: `Exercise type ${deletedType.name} has been removed.`,
    }

    res.send(response)
})

export default app