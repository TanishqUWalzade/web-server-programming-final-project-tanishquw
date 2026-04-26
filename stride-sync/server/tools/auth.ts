import jwt from "jsonwebtoken"
import type { Request, Response, NextFunction } from "express"
import type { User } from "../types"

export type JwtUser = User

declare global {
    namespace Express {
        interface Request {
            user?: JwtUser
        }
    }
}

// After login succeeds, this creates a JWT token for the user.
export function createToken(user: User) {
    const secret = process.env.JWT_SECRET || ""

    if (!secret) {
        throw new Error("JWT_SECRET is missing")
    }

    return jwt.sign(user, secret, { expiresIn: "7d" })
}

// This middleware checks if the request has a valid JWT token.
// If valid, it saves the user information on req.user.
export function requireAuth(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
        const error = new Error("Authorization token is required") as Error & {
            status?: number
        }
        error.status = 401
        throw error
    }

    const token = authHeader.replace("Bearer ", "")
    const secret = process.env.JWT_SECRET || ""

    try {
        req.user = jwt.verify(token, secret) as JwtUser
        next()
    } catch {
        const error = new Error("Invalid or expired token") as Error & {
            status?: number
        }
        error.status = 401
        throw error
    }
}

// This middleware is used for routes that only admins should access.
export function requireAdmin(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    if (req.user?.role !== "admin") {
        const error = new Error("Admin access is required") as Error & {
            status?: number
        }
        error.status = 403
        throw error
    }

    next()
}