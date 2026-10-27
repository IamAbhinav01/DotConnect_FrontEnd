import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { UserPlus, Search, ShieldCheck, ShieldAlert } from 'lucide-react'
import { useMembers, usePromoteMember, useDemoteMember, type Member } from './useMembers'
import { useMe } from '../auth/useAuth'
import { useUIStore } from '../../shared/stores/ui.store'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { Avatar } from '../../shared/ui/Avatar'
import { RoleBadge } from '../../shared/ui/Badge'
import { can, type Role } from '../../shared/lib/permissions'

export const MembersTable: React.FC = () => {
  const { slug } = useParams()
  const setAddMemberOpen = useUIStore((state) => state.setAddMemberOpen)
  
  const { data: members = [], isLoading } = useMembers(slug)
  const { data: me } = useMe()

  const { mutateAsync: promoteMember, isPending: isPromoting } = usePromoteMember(slug)
  const { mutateAsync: demoteMember, isPending: isDemoting } = useDemoteMember(slug)

  const [filterQuery, setFilterQuery] = useState('')

  // Determine current user's role in this workspace
  const myMemberEntry = members.find((m) => m.userId === me?.id)
  const myRole: Role = (myMemberEntry?.role as Role) || 'member'

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

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-ink p-8">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-6 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-text">
            Workspace Members
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage teammates and configure roles in <span className="font-mono text-pink">{slug}</span>
          </p>
        </div>

        {can(myRole, 'member:add') && (
          <Button
            variant="primary"
            onClick={() => setAddMemberOpen(true)}
            className="shadow-[0_0_24px_rgba(255,45,168,0.3)]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

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
                          {/* Promote to Admin Button */}
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

                          {/* Demote to Member Button */}
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
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
