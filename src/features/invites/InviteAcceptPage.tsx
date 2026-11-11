import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
} from 'lucide-react'
import { useInvitePreview, useSubmitJoinRequest } from '../members/useMembers'
import { Button } from '../../shared/ui/Button'

export const InviteAcceptPage: React.FC = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

  const { data: preview, isLoading, error } = useInvitePreview(code)
  const { mutateAsync: submitJoinRequest, isPending: isSubmitting } = useSubmitJoinRequest()

  const handleJoin = async () => {
    if (!code) return

    try {
      await submitJoinRequest(code)
      toast.success('Join request submitted! Waiting for owner/admin approval.')
    } catch (err: any) {
      toast.error(err.message || 'Error submitting join request')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-muted font-mono text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-pink" />
          <span>Verifying invite link...</span>
        </div>
      </div>
    )
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl glass-panel border border-line text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center mx-auto text-danger">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-text">
            Invite Link Invalid
          </h2>
          <p className="text-xs text-muted">
            This invite link does not exist, has been revoked, or is malformed.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const isPendingReview = preview.requestStatus === 'pending'
  const isExpired = preview.isExpired
  const isExhausted = preview.isExhausted

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full p-8 rounded-2xl glass-panel border border-line space-y-6 relative z-10 shadow-2xl backdrop-blur-xl">
        {/* Top Tag */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink/10 border border-pink/20 text-pink text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Invitation</span>
          </div>
          <span className="text-[11px] font-mono text-muted/60 uppercase">DotConnect</span>
        </div>

        {/* Workspace Title & Description */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">
            {preview.workspaceName}
          </h1>
          <p className="text-xs font-mono text-pink">
            /workspace/{preview.slug}
          </p>
          {preview.description && (
            <p className="text-xs text-muted leading-relaxed pt-1">
              {preview.description}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-surface-1 border border-line space-y-1">
            <div className="flex items-center gap-2 text-muted text-xs">
              <Users className="w-4 h-4 text-pink" />
              <span>Members</span>
            </div>
            <div className="text-lg font-bold font-display text-text">
              {preview.memberCount}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-1 border border-line space-y-1">
            <div className="flex items-center gap-2 text-muted text-xs">
              <Clock className="w-4 h-4 text-lime" />
              <span>Status</span>
            </div>
            <div className="text-xs font-mono font-medium pt-1">
              {isExpired ? (
                <span className="text-danger">Expired</span>
              ) : isExhausted ? (
                <span className="text-danger">Full (Limit Reached)</span>
              ) : (
                <span className="text-lime">Active Link</span>
              )}
            </div>
          </div>
        </div>

        {/* Conditional Action States */}
        {preview.alreadyMember ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-lime/10 border border-lime/30 text-lime text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>You are already an active member of this workspace!</span>
            </div>
            <Link to={`/workspace/${preview.slug}`}>
              <Button variant="primary" className="w-full gap-2">
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : isPendingReview ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-pink/10 border border-pink/30 text-pink text-xs">
              <Clock className="w-4 h-4 shrink-0 animate-spin" />
              <span>
                Your request to join is pending approval by the workspace administrators.
              </span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        ) : isExpired ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                This invite link has expired. Please contact an admin for a new link.
              </span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        ) : isExhausted ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                This invite link has reached its maximum approved joins limit.
              </span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              className="w-full gap-2 shadow-[0_0_24px_rgba(255,45,168,0.4)]"
              isLoading={isSubmitting}
              onClick={handleJoin}
            >
              <span>Request to Join Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[11px] text-muted text-center">
              Your request will be submitted to the workspace owners for approval.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

