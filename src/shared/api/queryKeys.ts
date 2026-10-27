export const queryKeys = {
  me: ['users', 'me'] as const,
  workspaces: ['workspaces'] as const,
  workspace: (slug: string) => ['workspaces', slug] as const,
  members: (slug: string) => ['workspaces', slug, 'members'] as const,
  userSearch: (query: string) => ['users', 'search', query] as const,
}
