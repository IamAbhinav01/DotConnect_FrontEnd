import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import type { Role } from '../../shared/lib/permissions'

export interface WorkspaceMemberSummary {
  userId: string
  avatar: string
  role: Role
  joinedAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  members?: WorkspaceMemberSummary[]
  createdAt?: string
  updatedAt?: string
}

interface WorkspaceListResponse {
  success: boolean
  data: Workspace[]
  message?: string
}

interface CreateWorkspaceResponse {
  success: boolean
  data: Workspace
  message?: string
}

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: async () => {
      const res = await api<WorkspaceListResponse>('/workspace')
      return res.data || []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; slug?: string }) =>
      api<CreateWorkspaceResponse>('/workspace', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}
