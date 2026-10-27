import React from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { AppShell } from './layouts/AppShell'
import { LoginForm } from '../features/auth/LoginForm'
import { SignupForm } from '../features/auth/SignupForm'
import { WorkspaceDashboard } from '../features/workspaces/WorkspaceDashboard'
import { MembersTable } from '../features/members/MembersTable'
import { useMe } from '../features/auth/useAuth'

// Auth Guard Wrapper
const ProtectedRoute: React.FC = () => {
  const { data: user, isLoading } = useMe()

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-ink flex items-center justify-center font-mono text-xs text-muted">
        Authenticating session...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

// Guest Guard Wrapper (redirect to app if already logged in)
const GuestRoute: React.FC = () => {
  const { data: user, isLoading } = useMe()

  if (isLoading) {
    return null
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  // Public Guest Auth Routes
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <LoginForm />,
          },
          {
            path: '/signup',
            element: <SignupForm />,
          },
        ],
      },
    ],
  },

  // Protected App Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            path: 'workspace/:slug',
            element: <WorkspaceDashboard />,
          },
          {
            path: 'workspace/:slug/members',
            element: <MembersTable />,
          },
          {
            path: 'workspace/:slug/settings',
            element: (
              <div className="p-8 text-muted text-sm font-mono">
                Workspace Settings (Coming Soon)
              </div>
            ),
          },
        ],
      },
    ],
  },

  // Catch-all 404
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
