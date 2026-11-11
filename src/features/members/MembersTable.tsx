import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  UserPlus,
  Search,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Users,
  Inbox,
  UserMinus,
  LogOut,
} from 'lucide-react'
import {
  useMembers,
  usePromoteMember,
  useDemoteMember,
  useRemoveMember,
  usePendingJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
  type Member,
  type JoinRequest,
} from './useMembers'
import { useMe } from '../auth/useAuth'
import { useUIStore } from '../../shared/stores/ui.store'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Avatar } from '../../shared/ui/Avatar'
import { RoleBadge } from '../../shared/ui/Badge'
import { can, type Role } from '../../shared/lib/permissions'

export const MembersTable: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const setAddMemberOpen = useUIStore((state) => state.setAddMemberOpen)

  const { data: members = [], isLoading } = useMembers(slug)
  const { data: pendingRequests = [], isLoading: isLoadingRequests } = usePendingJoinRequests(slug)
  const { data: me } = useMe()

  const { mutateAsync: promoteMember, isPending: isPromoting } = usePromoteMember(slug)
  const { mutateAsync: demoteMember, isPending: isDemoting } = useDemoteMember(slug)
  const { mutateAsync: removeMember, isPending: isRemoving } = useRemoveMember(slug)
  const { mutateAsync: approveRequest, isPending: isApproving } = useApproveJoinRequest(slug)
  const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectJoinRequest(slug)

  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members')
  const [filterQuery, setFilterQuery] = useState('')
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null)

  // Determine current user's role in this workspace
  const myMemberEntry = members.find((m) => m.userId === me?.id)
  const myRole: Role = (myMemberEntry?.role as Role) || 'member'

  const isManager = can(myRole, 'member:add')

  const filteredMembers = members.filter((m) =>
    m.userId.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const handlePromote = async (member: Member) => {
    try {
      await promoteMember({ userId: member.userId })
      toast.success('Member promoted to Admin successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Error promoting member')
    }
  }

  const handleDemote = async (member: Member) => {
    try {
      await demoteMember({ userId: member.userId })
      toast.success('Admin demoted to Member successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Error demoting member')
    }
  }

  const handleRemove = async (member: Member) => {
    const isSelf = member.userId === me?.id
    const confirmMsg = isSelf
      ? 'Are you sure you want to leave this workspace?'
      : `Are you sure you want to remove ${member.userId} from this workspace?`
    if (!window.confirm(confirmMsg)) return

    try {
      setActionInProgressId(member.userId)
      await removeMember({ userId: member.userId, role: member.role })
      toast.success(isSelf ? 'You have left the workspace' : 'Member removed successfully')
      if (isSelf) {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      toast.error(err.message || 'Error removing member')
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleApprove = async (req: JoinRequest) => {
    try {
      setActionInProgressId(req.id)
      await approveRequest(req.id)
      toast.success('Join request approved! Member added.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve join request')
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleReject = async (req: JoinRequest) => {
    try {
      setActionInProgressId(req.id)
      await rejectRequest(req.id)
      toast.success('Join request rejected.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject join request')
    } finally {
      setActionInProgressId(null)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-ink p-8">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-text">
            Workspace Members
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage teammates, invites, and pending join requests in{' '}
            <span className="font-mono text-pink">{slug}</span>
          </p>
        </div>

        {isManager && (
          <Button
            variant="primary"
            onClick={() => setAddMemberOpen(true)}
            className="shadow-[0_0_24px_rgba(255,45,168,0.3)]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add / Invite Member
          </Button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-6 mt-6 border-b border-line">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'members'
              ? 'border-pink text-pink'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Members</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-surface-2 text-muted font-mono">
            {members.length}
          </span>
        </button>

        {isManager && (
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'requests'
                ? 'border-pink text-pink'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Pending Requests</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-pink/20 text-pink font-mono font-bold animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        )}
      </div>

      {activeTab === 'members' ? (
        <>
          {/* Filter and Stats Bar */}
          <div className="flex items-center justify-between py-4">
            <div className="relative w-72">
              <Input
                placeholder="Filter members..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="text-xs font-mono text-muted">
              Total Members: <span className="text-text font-bold">{members.length}</span>
            </div>
          </div>

          {/* Members Table Card */}
          <div className="rounded-xl border border-line bg-surface-1 overflow-hidden shadow-xl mt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-[11px] font-mono tracking-wider text-muted uppercase">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted text-xs">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted text-xs">
                      No members found matching &quot;{filterQuery}&quot;
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isMe = member.userId === me?.id
                    const formattedDate = member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recent'

                    return (
                      <tr
                        key={member.userId}
                        className="hover:bg-surface-2/40 transition-colors group"
                      >
                        {/* Member Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={member.avatar}
                              fallback={member.userId}
                              size="md"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-text flex items-center gap-1.5">
                                {member.userId}
                                {isMe && (
                                  <span className="text-[10px] text-pink font-mono bg-pink/10 px-1.5 py-0.2 rounded">
                                    you
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3 px-4">
                          <RoleBadge role={member.role} />
                        </td>

                        {/* Joined Date */}
                        <td className="py-3 px-4 font-mono text-xs text-muted">
                          {formattedDate}
                        </td>

                        {/* Actions Menu */}
                        <td className="py-3 px-4 text-right">
                          {!isMe && member.role !== 'owner' && (
                            <div className="flex items-center justify-end gap-2">
                              {member.role === 'member' && can(myRole, 'member:promote') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePromote(member)}
                                  isLoading={isPromoting}
                                  className="text-xs h-7 gap-1"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-lime" />
                                  Promote
                                </Button>
                              )}

                              {member.role === 'admin' && can(myRole, 'member:demote') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDemote(member)}
                                  isLoading={isDemoting}
                                  className="text-xs h-7 gap-1 text-danger hover:bg-danger/10"
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  Demote
                                </Button>
                              )}

                              {/* Remove button — managers can remove non-owners (but not other admins if requester is also admin) */}
                              {can(myRole, 'member:add') && !(myRole === 'admin' && member.role === 'admin') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemove(member)}
                                  isLoading={isRemoving && actionInProgressId === member.userId}
                                  className="text-xs h-7 gap-1 text-danger hover:bg-danger/10"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Leave button — only visible on your own row, only if you're not the owner */}
                          {isMe && myRole !== 'owner' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemove(member)}
                              isLoading={isRemoving && actionInProgressId === member.userId}
                              className="text-xs h-7 gap-1 text-muted hover:text-danger hover:bg-danger/10"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              Leave
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Pending Requests View */
        <div className="mt-6">
          <div className="rounded-xl border border-line bg-surface-1 overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-[11px] font-mono tracking-wider text-muted uppercase">
                  <th className="py-3 px-4">Requesting User</th>
                  <th className="py-3 px-4">Invite Code Used</th>
                  <th className="py-3 px-4">Requested At</th>
                  <th className="py-3 px-4 text-right">Decide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoadingRequests ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted text-xs">
                      Loading pending join requests...
                    </td>
                  </tr>
                ) : pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted text-xs">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <Inbox className="w-6 h-6 text-muted/50 mb-1" />
                        <span>No pending join requests</span>
                        <span className="text-[11px] text-muted/60">
                          When users request to join via an invite link, they will appear here.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((req) => {
                    const formattedDate = req.createdAt
                      ? new Date(req.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recently'

                    const isBusy =
                      actionInProgressId === req.id && (isApproving || isRejecting)

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-surface-2/40 transition-colors group"
                      >
                        {/* User Avatar + ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={req.avatar}
                              fallback={req.userId}
                              size="md"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-xs text-text font-mono">
                                {req.userId}
                              </span>
                              <span className="text-[10px] text-pink">
                                Awaiting approval
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Invite Code */}
                        <td className="py-3 px-4 font-mono text-xs text-muted truncate max-w-xs">
                          {req.inviteCode}
                        </td>

                        {/* Time */}
                        <td className="py-3 px-4 font-mono text-xs text-muted">
                          {formattedDate}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(req)}
                              isLoading={isBusy && isApproving}
                              disabled={isBusy}
                              className="text-xs h-7 gap-1 border-lime/40 hover:bg-lime/10 text-lime"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(req)}
                              isLoading={isBusy && isRejecting}
                              disabled={isBusy}
                              className="text-xs h-7 gap-1 text-danger hover:bg-danger/10"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
