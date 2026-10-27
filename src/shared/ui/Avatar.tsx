import React, { useState } from 'react'
import { cn } from '../lib/cn'
import { avatarUrl } from '../api/client'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  isOnline?: boolean
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  showStatus = false,
  isOnline = false,
  className,
}) => {
  const [hasError, setHasError] = useState(false)

  const dimensions = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const statusDimensions = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }

  const resolvedSrc = src ? avatarUrl(src) : undefined

  return (
    <div className={cn('relative inline-block select-none shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-semibold bg-surface-3 border border-line text-muted',
          dimensions[size]
        )}
      >
        {resolvedSrc && !hasError ? (
          <img
            src={resolvedSrc}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
            loading="lazy"
          />
        ) : (
          <span>{fallback ? fallback.slice(0, 2).toUpperCase() : '?'}</span>
        )}
      </div>

      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-ink',
            statusDimensions[size],
            isOnline ? 'bg-lime shadow-[0_0_8px_#D4FF3F]' : 'bg-muted/40'
          )}
        />
      )}
    </div>
  )
}
