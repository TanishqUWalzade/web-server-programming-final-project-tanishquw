import type { AuthUser, PagingRequest, User, UserRole } from "../types"
import { hashPassword } from "../tools/password"
import { connect, toCamelCase, toSnakeCase } from "./supabase"

export const TABLE_NAME = "users"

// This removes passwordHash before returning user data to the controller/frontend.
function sanitizeUser(row: Record<string, unknown>): User {
    const user = toCamelCase(row) as unknown as AuthUser

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
    }
}

export async function getAll(params: PagingRequest) {
    const db = connect()
    
    // Admin user management uses this to load users without password hashes. 
    let query = db
        .from(TABLE_NAME)
        .select("id, first_name, last_name, username, role", {
            count: "estimated",
        })

    if (params?.search) {
        const search = String(params.search).toLowerCase()
        query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,username.ilike.%${search}%`,
        )
    }

    if (params?.sortBy) {
        query = query.order(String(params.sortBy), {
            ascending: !params.descending,
        })
    }

    const page = Number(params?.page) || 1
    const pageSize = Number(params?.pageSize) || 20
    const start = (page - 1) * pageSize

    const result = await query.range(start, start + pageSize - 1)

    if (result.error) throw result.error

    const list = result.data?.map((row) => sanitizeUser(row)) ?? []
    const count = result.count ?? 0

    return { list, count }
}

export async function get(id: number): Promise<User> {
    const db = connect()

    const { data, error } = await db
        .from(TABLE_NAME)
        .select("id, first_name, last_name, username, role")
        .eq("id", id)
        .single()

    if (error) throw error

    return sanitizeUser(data)
}

// Login uses this because it needs the passwordHash for password comparison.
export async function getByUsername(username: string): Promise<AuthUser | null> {
    const db = connect()

    const { data, error } = await db
        .from(TABLE_NAME)
        .select("id, first_name, last_name, username, role, password_hash")
        .eq("username", username)
        .maybeSingle()

    if (error) throw error
    if (!data) return null

    return toCamelCase(data) as unknown as AuthUser
}

export async function create(input: {
    firstName: string
    lastName: string
    username: string
    password: string
    role?: UserRole
}): Promise<User> {
    const db = connect()

    // Password is hashed before inserting the user into Supabase.
    const passwordHash = await hashPassword(input.password)

    const row = toSnakeCase({
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        passwordHash,
        role: input.role ?? "user",
    })

    const { data, error } = await db
        .from(TABLE_NAME)
        .insert(row)
        .select("id, first_name, last_name, username, role")
        .single()

    if (error) throw error

    return sanitizeUser(data)
}

export async function update(
    id: number,
    input: {
        firstName?: string
        lastName?: string
        username?: string
        password?: string
        role?: UserRole
    },
): Promise<User> {
    const db = connect()

    // Build the update object only from fields that were actually sent.
    const updateData: Record<string, unknown> = {}

    if (input.firstName !== undefined) updateData.firstName = input.firstName
    if (input.lastName !== undefined) updateData.lastName = input.lastName
    if (input.username !== undefined) updateData.username = input.username
    if (input.role !== undefined) updateData.role = input.role
    
    // If password is left blank while editing, keep the old password.
    if (input.password !== undefined && input.password.trim() !== "") {
        updateData.passwordHash = await hashPassword(input.password)
    }

    const { data, error } = await db
        .from(TABLE_NAME)
        .update(toSnakeCase(updateData))
        .eq("id", id)
        .select("id, first_name, last_name, username, role")
        .single()

    if (error) throw error

    return sanitizeUser(data)
}

export async function remove(id: number): Promise<User> {
    const db = connect()

    // Delete the selected user and return the deleted user without passwordHash. 
    const { data, error } = await db
        .from(TABLE_NAME)
        .delete()
        .eq("id", id)
        .select("id, first_name, last_name, username, role")
        .single()

    if (error) throw error

    return sanitizeUser(data)
}