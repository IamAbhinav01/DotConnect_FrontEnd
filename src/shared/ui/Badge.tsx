import React from 'react'
import { cn } from '../lib/cn'
import type { Role } from '../lib/permissions'

interface RoleBadgeProps {
  role: Role | string
  className?: string
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className }) => {
  const normalizedRole = role.toLowerCase()

  if (normalizedRole === 'owner') {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-lime text-black shadow-[0_0_12px_rgba(212,255,63,0.3)]',
          className
        )}
      >
        Owner
      </span>
    )
  }

  if (normalizedRole === 'admin') {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border border-pink/60 bg-pink/10 text-pink shadow-[0_0_12px_rgba(255,45,168,0.2)]',
          className
        )}
      >
        Admin
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase bg-surface-3 text-muted border border-line',
        className
      )}
    >
      Member
    </span>
  )
}
