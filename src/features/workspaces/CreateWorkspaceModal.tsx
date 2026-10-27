import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../shared/ui/Dialog'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { useUIStore } from '../../shared/stores/ui.store'
import { useCreateWorkspace } from './useWorkspaces'

export const CreateWorkspaceModal: React.FC = () => {
  const navigate = useNavigate()
  const { createWorkspaceOpen, setCreateWorkspaceOpen } = useUIStore()
  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  // Real-time auto-slug generator preview matching backend logic
  const slugPreview = name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'workspace-slug'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      const res = await createWorkspace({
        name: name.trim(),
        description: description.trim() || undefined,
      })
      toast.success('Workspace created successfully!')
      setCreateWorkspaceOpen(false)
      setName('')
      setDescription('')
      navigate(`/workspace/${res.data.slug}`)
    } catch (err: any) {
      toast.error(err.message || 'Error creating workspace')
    }
  }

  return (
    <Dialog open={createWorkspaceOpen} onOpenChange={setCreateWorkspaceOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new workspace</DialogTitle>
          <DialogDescription>
            Workspaces are where your team collaborates on channels and shared topics.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="ws-name"
            label="Workspace Name"
            placeholder="e.g. Acme Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          {/* Auto-slug preview */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">URL Slug Preview</span>
            <div className="h-9 px-3 rounded-lg bg-surface-3 border border-line flex items-center font-mono text-xs text-pink/80 select-all">
              dotconnect.app/workspace/{slugPreview}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="ws-desc" className="text-xs font-medium text-muted">
              Description (optional)
            </label>
            <textarea
              id="ws-desc"
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-2 border border-line text-sm text-text placeholder:text-muted/60 focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink/50 resize-none"
              placeholder="What is this workspace about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateWorkspaceOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending} disabled={!name.trim()}>
              Create Workspace
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
