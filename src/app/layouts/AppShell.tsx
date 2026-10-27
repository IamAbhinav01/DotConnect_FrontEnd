import React, { useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { WorkspaceRail } from '../../features/workspaces/WorkspaceRail'
import { WorkspaceSidebar } from '../../features/workspaces/WorkspaceSidebar'
import { CreateWorkspaceModal } from '../../features/workspaces/CreateWorkspaceModal'
import { AddMemberModal } from '../../features/members/AddMemberModal'
import { useWorkspaces } from '../../features/workspaces/useWorkspaces'
import { useUIStore } from '../../shared/stores/ui.store'
import { Button } from '../../shared/ui/Button'
import { Plus } from 'lucide-react'

export const AppShell: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: workspaces = [], isLoading } = useWorkspaces()
  const setCreateWorkspaceOpen = useUIStore((state) => state.setCreateWorkspaceOpen)

  // Redirect to first workspace if at root and workspaces exist
  useEffect(() => {
    if (!slug && workspaces.length > 0) {
      navigate(`/workspace/${workspaces[0].slug}`, { replace: true })
    }
  }, [slug, workspaces, navigate])

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-ink flex items-center justify-center text-xs font-mono text-muted">
        Loading DotConnect...
      </div>
    )
  }

  // Empty state: User has no workspaces yet
  if (workspaces.length === 0) {
    return (
      <div className="h-screen w-full bg-ink flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl glass-panel p-8 text-center space-y-4 border border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-pink/10 border border-pink/30 text-pink flex items-center justify-center text-xl mx-auto font-bold shadow-[0_0_24px_rgba(255,45,168,0.2)]">
            ●
          </div>
          <h2 className="text-xl font-bold font-display text-text">
            Welcome to DotConnect
          </h2>
          <p className="text-xs text-muted">
            You are not part of any workspaces yet. Create your first workspace to get started!
          </p>
          <Button
            variant="primary"
            onClick={() => setCreateWorkspaceOpen(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
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
