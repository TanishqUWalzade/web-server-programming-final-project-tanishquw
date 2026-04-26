import { config } from "dotenv"
config()

import express from "express"
import usersController from "./controllers/users"
import exerciseTypesController from "./controllers/exerciseTypes"
import activitiesController from "./controllers/activities"
import dashboardController from "./controllers/dashboard"
import friendsController from "./controllers/friends"
import { DataEnvelope } from "./types"

const PORT = process.env.PORT ?? 3000
const SERVER = process.env.SERVER ?? "localhost"
const STATIC_DIR = process.env.STATIC_DIR ?? "dist"

const app = express()

// This middleware allows the frontend to call the backend.
// OPTIONS is included because requests with Authorization headers need a browser preflight check.
// Recognized this OPTIONS issue when error "Request header field Authorization is not allowed by Access-Control-Allow-Headers" appeared in the browser console during development.
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS",
    )
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

    if (req.method === "OPTIONS") {
        res.sendStatus(204)
        return
    }

    next()
}).use(express.json())

// Serve the built Vue app in production.
app.use(express.static(STATIC_DIR))

// Simple route to test if the backend server is running.
app.get("/api/v1/health", (_req, res) => {
    const response: DataEnvelope<{ status: string }> = {
        data: { status: "StrideSync server is running" },
        isSuccess: true,
    }

    res.send(response)
})

// Main API routes for StrideSync app.
app.use("/api/v1/users", usersController)
app.use("/api/v1/exercise-types", exerciseTypesController)
app.use("/api/v1/activities", activitiesController)
app.use("/api/v1/dashboard", dashboardController)
app.use("/api/v1/friends", friendsController)

// Central error handler so controllers/models can throw errors in one standard format.
app.use(
    (
        err: Error,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
    ) => {
        console.error(err)

        const response: DataEnvelope<null> = {
            data: null,
            isSuccess: false,
            message: err.message ?? "An error occurred",
        }

        res.status((err as any).status ?? 500).send(response)
    },
)

app.listen(PORT, () => {
    console.log(`Server is running on http://${SERVER}:${PORT}`)
})