import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Settings,
  Save,
  AlertTriangle,
  Trash2,
  LogOut,
  Building,
} from 'lucide-react'
import { useWorkspaces, useUpdateWorkspace, useDeleteWorkspace } from './useWorkspaces'
import { useMembers, useRemoveMember } from '../members/useMembers'
import { useMe } from '../auth/useAuth'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../shared/ui/Dialog'
import { type Role } from '../../shared/lib/permissions'

export const WorkspaceSettings: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  const { data: workspaces = [] } = useWorkspaces()
  const { data: members = [] } = useMembers(slug)
  const { data: me } = useMe()

  const currentWorkspace = workspaces.find((w) => w.slug === slug)
  const myMemberEntry = members.find((m) => m.userId === me?.id)
  const myRole: Role = (myMemberEntry?.role as Role) || 'member'

  const isOwner = myRole === 'owner'
  const isManager = myRole === 'owner' || myRole === 'admin'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [confirmSlugInput, setConfirmSlugInput] = useState('')

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name || '')
      setDescription(currentWorkspace.description || '')
    }
  }, [currentWorkspace])

  const { mutateAsync: updateWorkspace, isPending: isUpdating } = useUpdateWorkspace(slug)
  const { mutateAsync: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspace(slug)
  const { mutateAsync: removeMember, isPending: isLeaving } = useRemoveMember(slug)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Workspace name cannot be empty')
      return
    }

    try {
      await updateWorkspace({
        name: name.trim(),
        description: description.trim(),
      })
      toast.success('Workspace updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Error updating workspace')
    }
  }

  const handleDelete = async () => {
    if (confirmSlugInput !== slug) {
      toast.error('Please enter the exact workspace slug to confirm deletion')
      return
    }

    try {
      await deleteWorkspace()
      toast.success('Workspace deleted successfully')
      setDeleteConfirmOpen(false)
      navigate('/', { replace: true })
    } catch (err: any) {
      toast.error(err.message || 'Error deleting workspace')
    }
  }

  const handleLeave = async () => {
    if (!me?.id) return

    try {
      await removeMember({ userId: me.id, role: myRole })
      toast.success('You have left the workspace')
      setLeaveConfirmOpen(false)
      navigate('/', { replace: true })
    } catch (err: any) {
      toast.error(err.message || 'Error leaving workspace')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-ink p-8 space-y-8">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink/10 border border-pink/30 text-pink text-[11px] font-medium mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Workspace Settings</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-text">
            {currentWorkspace?.name || slug} Settings
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage workspace information, permissions, and administrative operations.
          </p>
        </div>
      </div>

      {/* General Information Card */}
      <div className="max-w-2xl p-6 rounded-2xl bg-surface-1 border border-line space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink/10 border border-pink/20 flex items-center justify-center text-pink">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display text-text">
              General Information
            </h2>
            <p className="text-xs text-muted">
              Update the public display details of this workspace.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Workspace Slug (Read-only) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">
              Workspace Identifier (Slug)
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={slug || ''}
              className="w-full bg-surface-2 text-xs text-muted font-mono border border-line rounded-lg px-3 py-2 cursor-not-allowed select-all"
            />
            <p className="text-[11px] text-muted/60">
              Unique slug cannot be changed after creation.
            </p>
          </div>

          {/* Workspace Name */}
          <div className="space-y-1">
            <Input
              label="Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isManager}
              placeholder="e.g. Acme Corporation"
              className="text-xs"
            />
          </div>

          {/* Workspace Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isManager}
              placeholder="Tell your team what this workspace is about..."
              className="w-full bg-surface-2 text-xs text-text border border-line rounded-lg px-3 py-2 focus:outline-none focus:border-pink/50 transition-colors resize-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {isManager && (
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isUpdating}
                className="gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone Card */}
      <div className="max-w-2xl p-6 rounded-2xl bg-danger/5 border border-danger/20 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 text-danger font-display font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </div>

        {/* Leave Workspace (For non-owners) */}
        {!isOwner && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-1 border border-line">
            <div>
              <h4 className="text-xs font-bold text-text">Leave this workspace</h4>
              <p className="text-[11px] text-muted">
                You will lose access to all channels, members, and resources in this workspace.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveConfirmOpen(true)}
              className="text-xs border-danger/40 text-danger hover:bg-danger/10 gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Workspace</span>
            </Button>
          </div>
        )}

        {/* Delete Workspace (Only for Owners) */}
        {isOwner && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-1 border border-danger/30">
            <div>
              <h4 className="text-xs font-bold text-danger">Delete this workspace</h4>
              <p className="text-[11px] text-muted">
                Permanently delete this workspace and all its data. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="text-xs bg-danger hover:bg-danger/80 text-white gap-1.5 shrink-0 shadow-[0_0_12px_rgba(255,0,0,0.3)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Workspace</span>
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-danger flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Workspace</span>
            </DialogTitle>
            <DialogDescription>
              This will permanently delete <strong className="text-text">{currentWorkspace?.name}</strong> and remove all member data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted">
              To confirm, type <span className="font-mono text-pink select-all font-bold">{slug}</span> below:
            </p>
            <Input
              placeholder="Enter workspace slug to confirm"
              value={confirmSlugInput}
              onChange={(e) => setConfirmSlugInput(e.target.value)}
              className="text-xs font-mono"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteConfirmOpen(false)
                  setConfirmSlugInput('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isDeleting}
                disabled={confirmSlugInput !== slug}
                onClick={handleDelete}
                className="bg-danger hover:bg-danger/80 text-white"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <Dialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-danger" />
              <span>Leave Workspace</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to leave <strong className="text-text">{currentWorkspace?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted">
              You will need to be re-invited or submit a new join request to rejoin this workspace in the future.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setLeaveConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isLeaving}
                onClick={handleLeave}
                className="bg-danger hover:bg-danger/80 text-white"
              >
                Leave Workspace
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

