import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { motion } from 'motion/react'
import { useWorkspaces } from './useWorkspaces'
import { useMe, useLogout } from '../auth/useAuth'
import { useUIStore } from '../../shared/stores/ui.store'
import { Avatar } from '../../shared/ui/Avatar'
import { cn } from '../../shared/lib/cn'

export const WorkspaceRail: React.FC = () => {
  const { slug } = useParams()
  const { data: workspaces = [] } = useWorkspaces()
  const { data: me } = useMe()
  const { mutate: logout } = useLogout()
  const setCreateWorkspaceOpen = useUIStore((state) => state.setCreateWorkspaceOpen)

  return (
    <aside className="w-[72px] h-screen bg-ink border-r border-line flex flex-col items-center py-4 justify-between shrink-0 z-30 select-none">
      {/* Top Workspace Icons List */}
      <div className="flex flex-col items-center space-y-3 w-full">
        {/* Brand Dot */}
        <div className="w-10 h-10 rounded-2xl bg-pink/10 border border-pink/30 flex items-center justify-center text-pink font-bold text-lg mb-2">
          ●
        </div>

        <div className="w-8 h-[1px] bg-line my-1" />

        {/* Workspaces List */}
        <div className="flex flex-col items-center space-y-3 w-full overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
          {workspaces.map((ws) => {
            const isActive = slug === ws.slug
            const initials = ws.name.slice(0, 2).toUpperCase()

            return (
              <div key={ws.id} className="relative group flex items-center justify-center w-full">
                {/* Active Pink Pill Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeWorkspacePill"
                    className="absolute left-0 w-1 bg-pink rounded-r-full shadow-[0_0_12px_#FF2DA8]"
                    initial={{ height: 8 }}
                    animate={{ height: 32 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}

                {/* Morphing Avatar Button: Circle -> Squircle on hover */}
                <Link
                  to={`/workspace/${ws.slug}`}
                  title={ws.name}
                  className={cn(
                    'w-12 h-12 flex items-center justify-center font-display font-bold text-sm tracking-tight transition-all duration-200 cursor-pointer',
                    'rounded-full group-hover:rounded-2xl',
                    isActive
                      ? 'bg-pink text-black rounded-2xl shadow-[0_0_20px_rgba(255,45,168,0.3)]'
                      : 'bg-surface-2 text-text hover:bg-surface-3 hover:text-pink border border-line'
                  )}
                >
                  {initials}
                </Link>
              </div>
            )
          })}

          {/* Add Workspace Button */}
          <button
            onClick={() => setCreateWorkspaceOpen(true)}
            title="Create Workspace"
            className="w-12 h-12 rounded-full hover:rounded-2xl bg-surface-2 border border-line border-dashed hover:border-pink text-muted hover:text-pink flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Profile & Logout */}
      <div className="flex flex-col items-center space-y-3">
        {me && (
          <div className="relative group">
            <Avatar
              src={me.avatar || (me.id ? `/api/v1/users/${me.id}/avatar` : undefined)}
              fallback={me.username || me.email}
              size="md"
              showStatus
              isOnline
              className="cursor-pointer group-hover:ring-2 group-hover:ring-pink/50 transition-all"
            />
          </div>
        )}

        <button
          onClick={() => logout()}
          title="Sign out"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}
