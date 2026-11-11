import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'
import type { Role } from '../../shared/lib/permissions'

export interface Member {
  userId: string
  avatar: string
  role: Role
  joinedAt: string
}

interface MembersResponse {
  success: boolean
  data: Member[]
  message?: string
}

export interface SearchedUser {
  id: string
  username: string
  email: string
  avatarUrl: string
}

interface UserSearchResponse {
  users: SearchedUser[]
}

export interface JoinRequest {
  id: string
  inviteCode: string
  userId: string
  avatar: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export interface WorkspaceInvite {
  id: string
  code: string
  createdby: string
  maxApprovedJoins: number
  approvedCount: number
  createdAt: string
  expiresAt: string
}

export interface InvitePreview {
  workspaceName: string
  slug: string
  description?: string
  memberCount: number
  expiresAt: string
  isExpired: boolean
  isExhausted: boolean
  alreadyMember: boolean
  requestStatus: string
}

export function useMembers(slug?: string) {
  return useQuery({
    queryKey: queryKeys.members(slug || ''),
    queryFn: async () => {
      if (!slug) return []
      const res = await api<MembersResponse>(`/workspace/${slug}/members`)
      return res.data || []
    },
    enabled: !!slug,
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.userSearch(query),
    queryFn: async () => {
      if (query.trim().length < 2) return []
      const res = await api<UserSearchResponse>(`/users/search?q=${encodeURIComponent(query.trim())}`)
      return res.users || []
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 30,
  })
}

export function useAddMember(slug?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { email: string; role: Role }) =>
      api<{ message: string }>(`/workspace/${slug}/addMember`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.members(slug) })
      }
    },
  })
}

export function usePromoteMember(slug?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: string }) =>
      api<{ message: string }>(`/workspace/${slug}/members/promote`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.members(slug) })
      }
    },
  })
}

export function useDemoteMember(slug?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: string }) =>
      api<{ message: string }>(`/workspace/${slug}/members/demote`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.members(slug) })
      }
    },
  })
}

export function useRemoveMember(slug?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: string; role?: Role }) =>
      api<{ message: string }>(`/workspace/${slug}/removeMember`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.members(slug) })
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces })
      }
    },
  })
}

export function usePendingJoinRequests(slug?: string) {
  return useQuery({
    queryKey: queryKeys.joinRequests(slug || ''),
    queryFn: async () => {
      if (!slug) return []
      const res = await api<{ data: JoinRequest[] }>(`/workspace/${slug}/request`)
      return res.data || []
    },
    enabled: !!slug,
    refetchInterval: 10000,
  })
}

export function useApproveJoinRequest(slug?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) =>
      api<{ message: string }>(`/workspace/${slug}/request/${requestId}/approve`, {
        method: 'POST',
      }),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(slug) })
        queryClient.invalidateQueries({ queryKey: queryKeys.members(slug) })
      }
    },
  })
}

export function useRejectJoinRequest(slug?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) =>
      api<{ message: string }>(`/workspace/${slug}/request/${requestId}/reject`, {
        method: 'POST',
      }),
    onSuccess: () => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.joinRequests(slug) })
      }
    },
  })
}

export function useCreateInvite(slug?: string) {
  return useMutation({
    mutationFn: (payload: { expiresInHours?: number; maxApprovedJoins?: number }) =>
      api<{ data: WorkspaceInvite; message: string }>(`/workspace/${slug}/invites`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  })
}

export function useInvitePreview(code?: string) {
  return useQuery({
    queryKey: queryKeys.invitePreview(code || ''),
    queryFn: async () => {
      if (!code) return null
      const res = await api<{ data: InvitePreview }>(`/workspace/invites/${code}`)
      return res.data
    },
    enabled: !!code,
  })
}

export function useSubmitJoinRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) =>
      api<{ message: string }>(`/workspace/invites/${code}/request`, {
        method: 'POST',
      }),
    onSuccess: (_, code) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitePreview(code) })
    },
  })
}
