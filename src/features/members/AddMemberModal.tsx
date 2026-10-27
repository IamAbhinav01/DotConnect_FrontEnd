import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, Check } from 'lucide-react'
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
import { useMembers, useUserSearch, useAddMember, type SearchedUser } from './useMembers'
import type { Role } from '../../shared/lib/permissions'

export const AddMemberModal: React.FC = () => {
  const { slug } = useParams()
  const { addMemberOpen, setAddMemberOpen } = useUIStore()
  const { data: currentMembers = [] } = useMembers(slug)
  const { mutateAsync: addMember, isPending } = useAddMember(slug)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null)
  const [role, setRole] = useState<Role>('member')

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

  return (
    <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Search for registered DotConnect users by email or username to add them to this workspace.
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  )
}
