import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Shield, UserPlus, Sparkles } from 'lucide-react'
import { useWorkspaces } from './useWorkspaces'
import { useMembers } from '../members/useMembers'
import { useMe } from '../auth/useAuth'
import { useUIStore } from '../../shared/stores/ui.store'
import { Button } from '../../shared/ui/Button'
import { RoleBadge } from '../../shared/ui/Badge'
import { can, type Role } from '../../shared/lib/permissions'

export const WorkspaceDashboard: React.FC = () => {
  const { slug } = useParams()
  const { data: workspaces = [] } = useWorkspaces()
  const { data: members = [] } = useMembers(slug)
  const { data: me } = useMe()
  const setAddMemberOpen = useUIStore((state) => state.setAddMemberOpen)

  const currentWorkspace = workspaces.find((w) => w.slug === slug)
  const myMemberEntry = members.find((m) => m.userId === me?.id)
  const myRole: Role = (myMemberEntry?.role as Role) || 'member'

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-ink p-8 space-y-8">
      {/* Welcome Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink/10 border border-pink/20 text-pink text-xs font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active Workspace</span>
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-text">
          {currentWorkspace?.name || slug}
        </h1>
        {currentWorkspace?.description && (
          <p className="text-sm text-muted max-w-xl">
            {currentWorkspace.description}
          </p>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Members Count Card */}
        <div className="p-5 rounded-2xl bg-surface-1 border border-line space-y-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">Total Members</span>
            <Users className="w-4 h-4 text-pink" />
          </div>
          <div className="text-3xl font-bold font-display text-text">
            {members.length}
          </div>
          <Link
            to={`/workspace/${slug}/members`}
            className="text-xs text-pink hover:underline inline-block font-medium"
          >
            View all members &rarr;
          </Link>
        </div>

        {/* Your Role Card */}
        <div className="p-5 rounded-2xl bg-surface-1 border border-line space-y-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">Your Permission Level</span>
            <Shield className="w-4 h-4 text-lime" />
          </div>
          <div className="pt-1">
            <RoleBadge role={myRole} />
          </div>
          <p className="text-xs text-muted">
            {myRole === 'owner'
              ? 'You have full administrative authority over this workspace.'
              : myRole === 'admin'
              ? 'You can add members and manage team configurations.'
              : 'You are a collaborator in this workspace.'}
          </p>
        </div>

        {/* Workspace URL Slug Card */}
        <div className="p-5 rounded-2xl bg-surface-1 border border-line space-y-3">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium">Workspace Slug</span>
            <span className="text-xs font-mono text-muted/60">ID</span>
          </div>
          <div className="text-sm font-mono text-pink bg-surface-2 p-2 rounded-lg border border-line truncate">
            {slug}
          </div>
          <p className="text-xs text-muted">
            Share this identifier to help team members find your workspace.
          </p>
        </div>
      </div>

      {/* Invite Your Team Action Banner (Admins & Owners) */}
      {can(myRole, 'member:add') && (
        <div className="p-6 rounded-2xl glass-panel border border-pink/20 bg-gradient-to-r from-pink/5 via-transparent to-lime/5 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-text">
              Invite your teammates
            </h3>
            <p className="text-xs text-muted max-w-lg">
              Collaborate in real time. Add registered DotConnect users by email to start collaborating in this workspace.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setAddMemberOpen(true)}
            className="shrink-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      )}
    </div>
  )
}
