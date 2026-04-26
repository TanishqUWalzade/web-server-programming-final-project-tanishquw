import { apiFetch } from './api'
import type { Activity, User } from '@/types'

// Friend activities include the normal activity fields plus the friend's display name.
export type FriendActivity = Activity & {
  friendName: string
}

export function getFriends() {
  // Gets the current user's saved friends.
  return apiFetch<User[]>('/friends')
}

export function getAvailableUsers() {
  // Gets users who are not already friends, so they can be added.
  return apiFetch<User[]>('/friends/available-users')
}

export function getFriendActivities() {
  // Gets the activity feed from the current user's friends.
  return apiFetch<FriendActivity[]>('/friends/activities')
}

export function addFriend(friendId: number) {
  // Adds the selected user as a friend.
  return apiFetch('/friends/' + friendId, {
    method: 'POST',
  })
}

export function removeFriend(friendId: number) {
  // Removes the selected user from the current user's friends list.
  return apiFetch('/friends/' + friendId, {
    method: 'DELETE',
  })
}