import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api/client'
import { queryKeys } from '../../shared/api/queryKeys'

export interface User {
  id: string
  email: string
  username?: string
  avatar?: string
}

interface AuthResponse {
  user: User
  message?: string
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const res = await api<AuthResponse>('/users/me')
      return res.user
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api<AuthResponse>('/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces })
    },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api<AuthResponse>('/users/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.me, data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api<{ message: string }>('/users/logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.clear()
      window.location.assign('/login')
    },
  })
}
