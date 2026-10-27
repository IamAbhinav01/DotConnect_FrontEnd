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
