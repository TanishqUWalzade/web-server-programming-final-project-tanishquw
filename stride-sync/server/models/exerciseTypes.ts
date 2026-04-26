import type { ExerciseType, PagingRequest } from "../types"
import { connect, toCamelCase, toSnakeCase } from "./supabase"

export const TABLE_NAME = "exercise_types"

type ItemType = ExerciseType

export async function getAll(params: PagingRequest) {
    const db = connect()
    
    // Exercise types are used in the Add Activity Dropdown. 
    let query = db.from(TABLE_NAME).select("*", { count: "estimated" })

    if (params?.search) {
        const search = String(params.search).toLowerCase()
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const sortBy = params?.sortBy ? String(params.sortBy) : "name"
    query = query.order(sortBy, { ascending: !params?.descending })

    const page = Number(params?.page) || 1
    const pageSize = Number(params?.pageSize) || 20
    const start = (page - 1) * pageSize

    const result = await query.range(start, start + pageSize - 1)

    if (result.error) throw result.error

    // Convert database field names back to camelCase before sending to controllers.
    const list = result.data?.map((row) => toCamelCase(row) as ItemType) ?? []
    const count = result.count ?? 0

    return { list, count }
}

export async function get(id: number): Promise<ItemType> {
    const db = connect()

    const { data, error } = await db
        .from(TABLE_NAME)
        .select("*")
        .eq("id", id)
        .single()

    if (error) throw error

    return toCamelCase(data) as ItemType
}

export async function create(item: Omit<ItemType, "id">): Promise<ItemType> {
    const db = connect()

    // Convert camelCase input to snakeCase before inserting into Supabase.
    const { data, error } = await db
        .from(TABLE_NAME)
        .insert(toSnakeCase(item))
        .select()
        .single()

    if (error) throw error

    return toCamelCase(data) as ItemType
}

export async function update(
    id: number,
    item: Partial<ItemType>,
): Promise<ItemType> {
    const db = connect()
    
    // Remove id from the update body so the primary key is not changed. 
    const { data, error } = await db
        .from(TABLE_NAME)
        .update(toSnakeCase({ ...item, id: undefined }))
        .eq("id", id)
        .select()
        .single()

    if (error) throw error

    return toCamelCase(data) as ItemType
}

export async function remove(id: number): Promise<ItemType> {
    const db = connect()
    // Delete the selected exercise type from the database.
    const { data, error } = await db
        .from(TABLE_NAME)
        .delete()
        .eq("id", id)
        .select()
        .single()

    if (error) throw error

    return toCamelCase(data) as ItemType
}