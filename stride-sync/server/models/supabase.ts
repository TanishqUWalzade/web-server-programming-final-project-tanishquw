import { createClient } from "@supabase/supabase-js"

// This creates the Supabase connection using values from the .env file.
// Keeping it here lets all models use the same database connection.
export function connect() {
    const supabaseUrl = process.env.SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || ""

    return createClient(supabaseUrl, supabaseKey)
}

// This helper keeps only the fields that are allowed to be saved in the database.
export function filterKeys<T extends object>(
    obj: T,
    keys: (keyof T)[],
): Partial<T> {
    const filtered: Partial<T> = {}

    for (const key of keys) {
        if (key in obj) {
            filtered[key] = obj[key]
        }
    }

    return filtered
}

// Supabase/Postgres uses snake_case, but my TypeScript code uses camelCase.
// This converts database results into the format used by the frontend.
export function toCamelCase(
    obj: Record<string, unknown>,
): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_match, p1) =>
            p1.toUpperCase(),
        )
        result[camelKey] = obj[key]
    }

    return result
}

// This converts frontend/backend object keys into snake_case before saving to Supabase.
// Got this idea and proper implementation from stack overflow.
export function toSnakeCase(
    obj: Record<string, unknown>,
): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const key in obj) {
        const snakeKey = key.replace(
            /([A-Z])/g,
            (match) => `_${match.toLowerCase()}`,
        )
        result[snakeKey] = obj[key]
    }

    return result
}