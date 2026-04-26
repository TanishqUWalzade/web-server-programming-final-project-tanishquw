// Standard response format used by the backend.
// This keeps API responses consistent for the frontend.
export type DataEnvelope<T> = {
    data: T
    isSuccess: boolean
    message?: string
}

// Response format for API routes that return a list of items.
// Total is useful for paging and showing how many records exist.
export type DataListEnvelope<T> = DataEnvelope<T[]> & {
    total: number
}

// Common query options used for list routes.
// These are used for paging, searching, and sorting.
export type PagingRequest = {
    page?: number
    pageSize?: number
    search?: string
    sortBy?: string
    descending?: boolean
}