import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

// I hash passwords before saving them so plain passwords are not stored in the database.
// I found this implementation in the bcryptjs documentation and it seems to be the standard way to do it.
export async function hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS)
}

// This compares the password entered during login with the saved password hash.
export async function comparePassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash)
}