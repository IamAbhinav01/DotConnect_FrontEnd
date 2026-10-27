export type Role = 'owner' | 'admin' | 'member'

const rules = {
  'member:add': ['owner', 'admin'],
  'member:promote': ['owner', 'admin'],
  'member:demote': ['owner'],
  'workspace:delete': ['owner'],
} as const

export type Action = keyof typeof rules

export function can(role: Role | undefined | null, action: Action): boolean {
  if (!role) return false
  return (rules[action] as readonly Role[]).includes(role)
}
