import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, Hash, ChevronDown } from 'lucide-react'
import { useWorkspaces } from './useWorkspaces'
import { cn } from '../../shared/lib/cn'

export const WorkspaceSidebar: React.FC = () => {
  const { slug } = useParams()
  const { data: workspaces = [] } = useWorkspaces()

  const currentWorkspace = workspaces.find((ws) => ws.slug === slug)

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      to: `/workspace/${slug}`,
      end: true,
    },
    {
      label: 'Members',
      icon: Users,
      to: `/workspace/${slug}/members`,
    },
    {
      label: 'Settings',
      icon: Settings,
      to: `/workspace/${slug}/settings`,
    },
  ]

  return (
    <div className="w-60 h-screen bg-surface-1 border-r border-line flex flex-col shrink-0 select-none">
      {/* Workspace Header Dropdown */}
      <div className="h-14 border-b border-line flex items-center justify-between px-4 hover:bg-surface-2/50 transition-colors cursor-pointer">
        <div className="flex flex-col min-w-0">
          <span className="font-display font-bold text-sm tracking-tight text-text truncate">
            {currentWorkspace?.name || 'Workspace'}
          </span>
          <span className="font-mono text-[11px] text-muted truncate">
            {slug}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-muted shrink-0" />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-pink/10 text-pink font-semibold border border-pink/20 shadow-[0_0_12px_rgba(255,45,168,0.1)]'
                      : 'text-muted hover:text-text hover:bg-surface-2'
                  )
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        {/* Channels Section (Disabled / Coming Soon as per Claude's design) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold font-mono tracking-wider text-muted/60 uppercase">
              CHANNELS (SOON)
            </span>
          </div>
          <div className="space-y-1 opacity-50 pointer-events-none">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-muted">
              <Hash className="w-3.5 h-3.5" />
              <span>general</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-muted">
              <Hash className="w-3.5 h-3.5" />
              <span>announcements</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-muted">
              <Hash className="w-3.5 h-3.5" />
              <span>dev-chat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
