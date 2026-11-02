import type { User } from '../types'

export function requireUser(users: User[], id: string): User {
  const user = users.find((item) => item.id === id)
  if (!user) throw new Error(`Missing user ${id}`)
  return user
}
