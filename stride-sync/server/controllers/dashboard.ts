import { Router } from "express"
import { getSummary } from "../models/dashboard"
import { requireAuth } from "../tools/auth"
import type { DashboardSummary, DataEnvelope } from "../types"

const app = Router()

// Dashboard data should only be shown after the user is logged in.
app.use(requireAuth)

app.get("/summary", async (req, res) => {
    // Dashboard data should only be shown after the user is logged in.
    const summary = await getSummary(req.user!.id)

    const response: DataEnvelope<DashboardSummary> = {
        data: summary,
        isSuccess: true,
    }

    res.send(response)
})

export default app