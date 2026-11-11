import React from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { AppShell } from './layouts/AppShell'
import { LoginForm } from '../features/auth/LoginForm'
import { SignupForm } from '../features/auth/SignupForm'
import { WorkspaceDashboard } from '../features/workspaces/WorkspaceDashboard'
import { HomeDashboard } from '../features/workspaces/HomeDashboard'
import { MembersTable } from '../features/members/MembersTable'
import { InviteAcceptPage } from '../features/invites/InviteAcceptPage'
import { WorkspaceSettings } from '../features/workspaces/WorkspaceSettings'
import { useMe } from '../features/auth/useAuth'

// Auth Guard Wrapper
const ProtectedRoute: React.FC = () => {
  const { data: user, isLoading } = useMe()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-ink flex items-center justify-center font-mono text-xs text-muted">
        Authenticating session...
      </div>
    )
  }

  if (!user) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />
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
      // Standalone invite preview & accept page
      {
        path: '/invite/:code',
        element: <InviteAcceptPage />,
      },
      // App layout with workspace rail & sidebar
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <HomeDashboard />,
          },
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
            element: <WorkspaceSettings />,
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

