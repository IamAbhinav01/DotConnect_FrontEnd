import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, Check, Link2, Copy, CheckCheck, UserPlus, Clock, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../shared/ui/Dialog'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Avatar } from '../../shared/ui/Avatar'
import { useUIStore } from '../../shared/stores/ui.store'
import {
  useMembers,
  useUserSearch,
  useAddMember,
  useCreateInvite,
  type SearchedUser,
  type WorkspaceInvite,
} from './useMembers'
import type { Role } from '../../shared/lib/permissions'

export const AddMemberModal: React.FC = () => {
  const { slug } = useParams()
  const { addMemberOpen, setAddMemberOpen } = useUIStore()
  const { data: currentMembers = [] } = useMembers(slug)
  const { mutateAsync: addMember, isPending } = useAddMember(slug)
  const { mutateAsync: createInvite, isPending: isCreatingInvite } = useCreateInvite(slug)

  const [activeTab, setActiveTab] = useState<'direct' | 'link'>('direct')

  // Direct Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null)
  const [role, setRole] = useState<Role>('member')

  // Invite Link state
  const [expiresInHours, setExpiresInHours] = useState<number>(24)
  const [maxApprovedJoins, setMaxApprovedJoins] = useState<number>(5)
  const [generatedInvite, setGeneratedInvite] = useState<WorkspaceInvite | null>(null)
  const [copied, setCopied] = useState(false)

  // 250ms Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: searchResults = [], isLoading: isSearching } = useUserSearch(debouncedQuery)

  const isAlreadyMember = (userId: string) => {
    return currentMembers.some((m) => m.userId === userId)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      await addMember({
        email: selectedUser.email,
        role,
      })
      toast.success(`${selectedUser.username || selectedUser.email} added to workspace!`)
      setAddMemberOpen(false)
      setSelectedUser(null)
      setSearchQuery('')
    } catch (err: any) {
      toast.error(err.message || 'Error adding member')
    }
  }

  const handleGenerateLink = async () => {
    try {
      const res = await createInvite({
        expiresInHours,
        maxApprovedJoins,
      })
      if (res.data) {
        setGeneratedInvite(res.data)
        toast.success('Invite link created!')
      } else {
        toast.success(res.message || 'Invite link created!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating invite link')
    }
  }

  const fullInviteUrl = generatedInvite
    ? `${window.location.origin}/invite/${generatedInvite.code}`
    : ''

  const handleCopyLink = () => {
    if (!fullInviteUrl) return
    navigator.clipboard.writeText(fullInviteUrl)
    setCopied(true)
    toast.success('Invite link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Workspace</DialogTitle>
          <DialogDescription>
            Invite teammates directly by email or generate a shareable join link.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-line mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'direct'
                ? 'border-pink text-pink'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Direct Add</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'link'
                ? 'border-pink text-pink'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Invite Link</span>
          </button>
        </div>

        {activeTab === 'direct' ? (
          <form onSubmit={handleAdd} className="space-y-4">
            {/* User Search Input */}
            <div className="relative">
              <Input
                id="search-user"
                label="Search user"
                placeholder="Search by email or username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (selectedUser) setSelectedUser(null)
                }}
                autoFocus
              />
              <Search className="w-4 h-4 text-muted absolute right-3 top-8 pointer-events-none" />
            </div>

            {/* Search Results Dropdown List */}
            {debouncedQuery.trim().length >= 2 && (
              <div className="max-h-52 overflow-y-auto space-y-1 rounded-xl bg-surface-2 border border-line p-1.5 shadow-inner">
                {isSearching ? (
                  <div className="text-center py-4 text-xs text-muted">Searching users...</div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-4 text-xs text-muted">No users found</div>
                ) : (
                  searchResults.map((user) => {
                    const alreadyMember = isAlreadyMember(user.id)
                    const isSelected = selectedUser?.id === user.id

                    return (
                      <button
                        key={user.id}
                        type="button"
                        disabled={alreadyMember}
                        onClick={() => setSelectedUser(user)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                          alreadyMember
                            ? 'opacity-40 cursor-not-allowed'
                            : isSelected
                            ? 'bg-pink/15 border border-pink/40 text-text'
                            : 'hover:bg-surface-3 text-muted hover:text-text'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            src={user.avatarUrl}
                            fallback={user.username || user.email}
                            size="sm"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-text truncate">
                              {user.username || user.email.split('@')[0]}
                            </span>
                            <span className="text-[11px] text-muted truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>

                        {alreadyMember ? (
                          <span className="text-[10px] text-muted font-medium bg-surface-3 px-2 py-0.5 rounded">
                            Already added
                          </span>
                        ) : isSelected ? (
                          <Check className="w-4 h-4 text-pink shrink-0" />
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            )}

            {/* Selected User Confirmation Pill */}
            {selectedUser && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-pink/10 border border-pink/30 text-xs">
                <span className="text-muted">
                  Adding: <strong className="text-text">{selectedUser.email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-pink hover:underline text-[11px]"
                >
                  Change
                </button>
              </div>
            )}

            {/* Role Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Assigned Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    role === 'member'
                      ? 'border-pink bg-pink/10 text-pink'
                      : 'border-line bg-surface-2 text-muted hover:text-text'
                  }`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    role === 'admin'
                      ? 'border-pink bg-pink/10 text-pink'
                      : 'border-line bg-surface-2 text-muted hover:text-text'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAddMemberOpen(false)
                  setSelectedUser(null)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isPending}
                disabled={!selectedUser}
              >
                Add to Workspace
              </Button>
            </div>
          </form>
        ) : (
          /* Invite Link Generator Tab */
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink" />
                  <span>Expires In</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '24 Hours', hours: 24 },
                    { label: '7 Days', hours: 168 },
                    { label: '30 Days', hours: 720 },
                  ].map((opt) => (
                    <button
                      key={opt.hours}
                      type="button"
                      onClick={() => setExpiresInHours(opt.hours)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        expiresInHours === opt.hours
                          ? 'border-pink bg-pink/10 text-pink'
                          : 'border-line bg-surface-2 text-muted hover:text-text'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-lime" />
                  <span>Max Approved Joins</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 25, 100].map((joins) => (
                    <button
                      key={joins}
                      type="button"
                      onClick={() => setMaxApprovedJoins(joins)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                        maxApprovedJoins === joins
                          ? 'border-pink bg-pink/10 text-pink'
                          : 'border-line bg-surface-2 text-muted hover:text-text'
                      }`}
                    >
                      {joins} uses
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full"
              isLoading={isCreatingInvite}
              onClick={handleGenerateLink}
            >
              Generate Invite Link
            </Button>

            {generatedInvite && (
              <div className="p-3.5 rounded-xl bg-surface-2 border border-pink/30 space-y-2 mt-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted font-medium">Your Shareable Link</span>
                  <span className="text-[10px] text-pink font-mono">
                    Limit: {generatedInvite.maxApprovedJoins} joins
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={fullInviteUrl}
                    className="flex-1 bg-surface-1 text-xs text-text border border-line rounded-lg px-2.5 py-2 font-mono truncate select-all focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCheck className="w-4 h-4 text-lime" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted" />
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-muted">
                  Anyone with this link can request access to this workspace.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAddMemberOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
