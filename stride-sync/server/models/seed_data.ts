import { config } from "dotenv"
config()

import { connect } from "./supabase"
import { create as createUser, getByUsername } from "./users"

// This file adds starter demo data for the project .
// It checks existing records first, so running it again should not create duplicates.

type SeedUser = {
    firstName: string
    lastName: string
    username: string
    password: string
    role: "admin" | "user"
}

type SeedExerciseType = {
    name: string
    description: string
}

type SeedActivity = {
    username: string
    exerciseTypeName: string
    duration: number
    calories: number
    date: string
    notes: string
}

// These are the demo users used for testing login, admin access, and friends feed.
const seedUsers: SeedUser[] = [
    {
        firstName: "Tanishq",
        lastName: "Walzade",
        username: "tanishq",
        password: "tanishq9988",
        role: "admin",
    },
    {
        firstName: "Cool",
        lastName: "Professor",
        username: "coolprofessor",
        password: "coolprofessor9988",
        role: "admin",
    },
    {
        firstName: "Kash",
        lastName: "Patel",
        username: "kash",
        password: "kash9988",
        role: "user",
    },
    {
        firstName: "Kamala",
        lastName: "Harris",
        username: "kamala",
        password: "kamala9988",
        role: "user",
    },
]

// These are the activity types used in the Add Activity dropdown.
const seedExerciseTypes: SeedExerciseType[] = [
    {
        name: "Pickleball",
        description: "Pickleball games and court activities",
    },
    {
        name: "Running",
        description: "Outdoor or treadmill running workouts",
    },
    {
        name: "Walking",
        description: "Casual walks or step-based activity",
    },
    {
        name: "Cycling",
        description: "Outdoor or indoor cycling workouts",
    },
    {
        name: "Gym",
        description: "Strength training and gym workouts",
    },
    {
        name: "Yoga",
        description: "Yoga, stretching, and mobility sessions",
    },
    {
        name: "Swimming",
        description: "Pool or open-water swimming workouts",
    },
    {
        name: "Hiking",
        description: "Trail, mountain, or outdoor hiking activities",
    },
]

// These demo activities make the dashboard and friends feed show data right away.
const seedActivities: SeedActivity[] = [
    {
        username: "tanishq",
        exerciseTypeName: "Running",
        duration: 30,
        calories: 250,
        date: "2026-04-26",
        notes: "Easy running workout",
    },
    {
        username: "tanishq",
        exerciseTypeName: "Gym",
        duration: 40,
        calories: 300,
        date: "2026-04-26",
        notes: "Strength workout test",
    },
    {
        username: "kash",
        exerciseTypeName: "Gym",
        duration: 45,
        calories: 300,
        date: "2026-04-26",
        notes: "Gym workout after class",
    },
    {
        username: "kamala",
        exerciseTypeName: "Walking",
        duration: 25,
        calories: 120,
        date: "2026-04-25",
        notes: "Evening walk around campus",
    },
]

// These friendships connect users so the Friends Feed has activity data to show.
const seedFriendships = [
    {
        username: "tanishq",
        friendUsername: "kash",
    },
    {
        username: "tanishq",
        friendUsername: "kamala",
    },
]

async function getOrCreateUser(user: SeedUser) {
    const existingUser = await getByUsername(user.username)

    if (existingUser) {
        console.log(`User already exists: ${user.username}`)
        return existingUser
    }

    const newUser = await createUser(user)
    console.log(`Created user: ${newUser.username}`)
    return newUser
}

async function getOrCreateExerciseType(exerciseType: SeedExerciseType) {
    const db = connect()

    const { data: existing, error: existingError } = await db
        .from("exercise_types")
        .select("*")
        .eq("name", exerciseType.name)
        .maybeSingle()

    if (existingError) throw existingError

    if (existing) {
        console.log(`Exercise type already exists: ${exerciseType.name}`)
        return existing
    }

    const { data, error } = await db
        .from("exercise_types")
        .insert({
            name: exerciseType.name,
            description: exerciseType.description,
        })
        .select()
        .single()

    if (error) throw error

    console.log(`Created exercise type: ${exerciseType.name}`)
    return data
}

async function getUserIdByUsername(username: string) {
    const db = connect()

    const { data, error } = await db
        .from("users")
        .select("id")
        .eq("username", username)
        .single()

    if (error) throw error

    return data.id as number
}

async function getExerciseTypeIdByName(name: string) {
    const db = connect()

    const { data, error } = await db
        .from("exercise_types")
        .select("id")
        .eq("name", name)
        .single()

    if (error) throw error

    return data.id as number
}

async function seedActivity(activity: SeedActivity) {
    const db = connect()

    const userId = await getUserIdByUsername(activity.username)
    const exerciseTypeId = await getExerciseTypeIdByName(activity.exerciseTypeName)

    // Avoid inserting the same demo activity again if the seed command is run multiple times.
    const { data: existing, error: existingError } = await db
        .from("activities")
        .select("id")
        .eq("user_id", userId)
        .eq("exercise_type_id", exerciseTypeId)
        .eq("activity_date", activity.date)
        .eq("notes", activity.notes)
        .maybeSingle()

    if (existingError) throw existingError

    if (existing) {
        console.log(
            `Activity already exists: ${activity.username} - ${activity.exerciseTypeName}`,
        )
        return existing
    }

    const { data, error } = await db
        .from("activities")
        .insert({
            user_id: userId,
            exercise_type_id: exerciseTypeId,
            duration: activity.duration,
            calories: activity.calories,
            activity_date: activity.date,
            notes: activity.notes,
        })
        .select()
        .single()

    if (error) throw error

    console.log(`Created activity: ${activity.username} - ${activity.exerciseTypeName}`)
    return data
}

async function seedFriendship(username: string, friendUsername: string) {
    const db = connect()

    const userId = await getUserIdByUsername(username)
    const friendId = await getUserIdByUsername(friendUsername)

    const { data: existing, error: existingError } = await db
        .from("friendships")
        .select("id")
        .eq("user_id", userId)
        .eq("friend_id", friendId)
        .maybeSingle()

    if (existingError) throw existingError

    if (existing) {
        console.log(`Friendship already exists: ${username} -> ${friendUsername}`)
        return existing
    }

    const { data, error } = await db
        .from("friendships")
        .insert({
            user_id: userId,
            friend_id: friendId,
        })
        .select()
        .single()

    if (error) throw error

    console.log(`Created friendship: ${username} -> ${friendUsername}`)
    return data
}

async function seedDatabase() {
    console.log("Starting StrideSync seed...")

    for (const user of seedUsers) {
        await getOrCreateUser(user)
    }

    for (const exerciseType of seedExerciseTypes) {
        await getOrCreateExerciseType(exerciseType)
    }

    for (const activity of seedActivities) {
        await seedActivity(activity)
    }

    for (const friendship of seedFriendships) {
        await seedFriendship(friendship.username, friendship.friendUsername)
    }

    console.log("Seeding complete")
}

seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error seeding database:", error)
        process.exit(1)
    })