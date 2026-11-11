import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Sparkles,
  Plus,
  Link2,
  ArrowRight,
  Compass,
} from 'lucide-react'
import { useMe } from '../auth/useAuth'
import { useWorkspaces } from './useWorkspaces'
import { useUIStore } from '../../shared/stores/ui.store'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Avatar } from '../../shared/ui/Avatar'

export const HomeDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const { data: workspaces = [] } = useWorkspaces()
  const setCreateWorkspaceOpen = useUIStore((state) => state.setCreateWorkspaceOpen)

  const [inviteInput, setInviteInput] = useState('')

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteInput.trim()) return

    // Extract code if user pasted a full URL like http://.../invite/code-123
    let code = inviteInput.trim()
    if (code.includes('/invite/')) {
      const parts = code.split('/invite/')
      code = parts[parts.length - 1].split('?')[0].split('#')[0]
    }

    if (code) {
      navigate(`/invite/${code}`)
    }
  }

  const displayName = me?.username || me?.email?.split('@')[0] || 'User'

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-ink p-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-white/10 bg-gradient-to-br from-pink/10 via-surface-1 to-lime/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-pink/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={me?.avatar || (me?.id ? `/api/v1/users/${me.id}/avatar` : undefined)}
              fallback={displayName}
              size="lg"
            />
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink/10 border border-pink/30 text-pink text-[11px] font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Dashboard</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-text">
                Welcome back, {displayName}
              </h1>
              <p className="text-xs text-muted max-w-md">
                {workspaces.length === 0
                  ? 'You are not a member of any workspaces yet. You can create one or join with an invite code.'
                  : `You have access to ${workspaces.length} workspace${
                      workspaces.length > 1 ? 's' : ''
                    }.`}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => setCreateWorkspaceOpen(true)}
            className="shadow-[0_0_24px_rgba(255,45,168,0.3)] shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
        </div>
      </div>

      {/* Main Grid: Join via Code & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Join Workspace with Link/Code */}
        <div className="p-6 rounded-2xl bg-surface-1 border border-line space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink/10 border border-pink/20 flex items-center justify-center text-pink">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-text">
                Have an Invite Link or Code?
              </h3>
              <p className="text-xs text-muted">
                Paste an invite code or link sent by your team to request access.
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinByCode} className="flex items-center gap-2 pt-2">
            <Input
              placeholder="e.g. workspace-code-123 or paste URL"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              className="text-xs font-mono h-10"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={!inviteInput.trim()}
              className="h-10 px-4 shrink-0 text-xs gap-1.5"
            >
              <span>Go</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>

        {/* Card 2: Workspace Discovery / Status */}
        <div className="p-6 rounded-2xl bg-surface-1 border border-line space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-lime/10 border border-lime/20 flex items-center justify-center text-lime">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-text">
                Your Workspace Status
              </h3>
              <p className="text-xs text-muted">
                {workspaces.length === 0
                  ? 'No active workspace memberships found'
                  : `Active member of ${workspaces.length} team${
                      workspaces.length > 1 ? 's' : ''
                    }`}
              </p>
            </div>
          </div>

          {workspaces.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-2 border border-line text-xs text-muted space-y-1">
              <p className="font-medium text-text">Tip for newcomers:</p>
              <p>
                Ask your workspace admin for an invite link. Once submitted, they will
                approve your request and you will see your workspace in the left rail.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  to={`/workspace/${ws.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 transition-colors border border-line group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-pink/20 text-pink text-xs font-bold font-display flex items-center justify-center shrink-0">
                      {ws.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-text truncate group-hover:text-pink transition-colors">
                      {ws.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-text transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
