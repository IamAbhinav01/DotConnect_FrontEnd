import React, { useEffect, useState } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { WorkspaceRail } from '../../features/workspaces/WorkspaceRail'
import { WorkspaceSidebar } from '../../features/workspaces/WorkspaceSidebar'
import { CreateWorkspaceModal } from '../../features/workspaces/CreateWorkspaceModal'
import { AddMemberModal } from '../../features/members/AddMemberModal'
import { useWorkspaces } from '../../features/workspaces/useWorkspaces'
import { useUIStore } from '../../shared/stores/ui.store'
import { Button } from '../../shared/ui/Button'
import { Plus, ArrowRight } from 'lucide-react'

export const AppShell: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: workspaces = [], isLoading } = useWorkspaces()
  const setCreateWorkspaceOpen = useUIStore((state) => state.setCreateWorkspaceOpen)

  const [hasSkipped, setHasSkipped] = useState<boolean>(() => {
    return sessionStorage.getItem('dotconnect_skip_workspace_prompt') === 'true'
  })

  const handleSkip = () => {
    sessionStorage.setItem('dotconnect_skip_workspace_prompt', 'true')
    setHasSkipped(true)
    navigate('/', { replace: true })
  }

  // Redirect to first workspace if at root and workspaces exist
  useEffect(() => {
    if (!slug && workspaces.length > 0) {
      navigate(`/workspace/${workspaces[0].slug}`, { replace: true })
    }
  }, [slug, workspaces, navigate])

  // Only block the entire screen with loader on cold start if the user hasn't skipped and isn't on a direct route
  if (isLoading && !hasSkipped) {
    return (
      <div className="h-screen w-full bg-ink flex items-center justify-center text-xs font-mono text-muted">
        Loading DotConnect...
      </div>
    )
  }

  // Initial prompt when user has 0 workspaces (can be skipped)
  if (workspaces.length === 0 && !hasSkipped) {
    return (
      <div className="h-screen w-full bg-ink flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl glass-panel p-8 text-center space-y-4 border border-white/10 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-pink/10 border border-pink/30 text-pink flex items-center justify-center text-xl mx-auto font-bold shadow-[0_0_24px_rgba(255,45,168,0.2)]">
            ●
          </div>
          <h2 className="text-xl font-bold font-display text-text">
            Welcome to DotConnect
          </h2>
          <p className="text-xs text-muted leading-relaxed">
            You are not part of any workspaces yet. You can create your own workspace or skip directly to your dashboard.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              variant="primary"
              onClick={() => setCreateWorkspaceOpen(true)}
              className="w-full shadow-[0_0_20px_rgba(255,45,168,0.3)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </Button>
            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-full text-xs text-muted hover:text-text gap-1.5"
            >
              <span>Skip to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <CreateWorkspaceModal />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ink select-none">
      {/* 1. Leftmost 72px Workspace Icon Rail */}
      <WorkspaceRail />

      {/* 2. 240px Workspace Sidebar */}
      {slug && <WorkspaceSidebar />}

      {/* 3. Main Outlet Page Area */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>

      {/* Global Modals */}
      <CreateWorkspaceModal />
      <AddMemberModal />
    </div>
  )
}
