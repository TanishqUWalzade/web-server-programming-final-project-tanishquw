import { Router } from "express"
import { comparePassword } from "../tools/password"
import { createToken, requireAdmin, requireAuth } from "../tools/auth"
import { create, get, getAll, getByUsername, remove, update } from "../models/users"
import type { DataEnvelope, DataListEnvelope, LoginResponse, User } from "../types"

const app = Router()

app.post("/login", async (req, res) => {
    const { username, password } = req.body

    // Find the user by username first, then check the hashed password.
    const user = await getByUsername(username)

    if (!user) {
        const error = new Error("Incorrect username or password") as Error & {
            status?: number
        }
        error.status = 401
        throw error
    }

    const isPasswordCorrect = await comparePassword(password, user.passwordHash)

    if (!isPasswordCorrect) {
        const error = new Error("Incorrect username or password") as Error & {
            status?: number
        }
        error.status = 401
        throw error
    }
    // Do not send password hash back to the frontend i.e. client.
    const safeUser: User = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
    }

    const response: DataEnvelope<LoginResponse> = {
        data: {
            user: safeUser,
            token: createToken(safeUser),
        },
        isSuccess: true,
    }

    res.send(response)
})

app.post("/register", async (req, res) => {
    // Public registration always creates a normal user account.
    const newUser = await create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: req.body.password,
        role: "user",
    })

    const response: DataEnvelope<User> = {
        data: newUser,
        isSuccess: true,
        message: "Account created successfully.",
    }

    res.send(response)
})

app.get("/me", requireAuth, async (req, res) => {
    // This returns the logged-in user from the verified JWT.
    const response: DataEnvelope<User> = {
        data: req.user!,
        isSuccess: true,
    }

    res.send(response)
})

app.get("/", requireAuth, requireAdmin, async (req, res) => {
    // Only admins can view the full user list.
    const { list, count } = await getAll(req.query)

    const response: DataListEnvelope<User> = {
        data: list,
        isSuccess: true,
        total: count,
    }

    res.send(response)
})

app.get("/:id", requireAuth, requireAdmin, async (req, res) => {
    const response: DataEnvelope<User> = {
        data: await get(Number(req.params.id)),
        isSuccess: true,
    }

    res.send(response)
})

app.post("/", requireAuth, requireAdmin, async (req, res) => {
    // Admin can create users and choose their role.
    const newUser = await create(req.body)

    const response: DataEnvelope<User> = {
        data: newUser,
        isSuccess: true,
    }

    res.send(response)
})

app.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
    // Admin can update user details from the Manage Users page.
    const updatedUser = await update(Number(req.params.id), req.body)

    const response: DataEnvelope<User> = {
        data: updatedUser,
        isSuccess: true,
    }

    res.send(response)
})

app.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    // Admin can remove a user from the system.
    const deletedUser = await remove(Number(req.params.id))

    const response: DataEnvelope<User> = {
        data: deletedUser,
        isSuccess: true,
        message: `User ${deletedUser.firstName} ${deletedUser.lastName} has been removed.`,
    }

    res.send(response)
})

export default app