import React from 'react'
import { cn } from '../lib/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lime' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none focus:outline-none'

    const variants = {
      primary:
        'bg-pink text-black font-semibold hover:brightness-110 shadow-[0_0_20px_rgba(255,45,168,0.25)] focus:ring-2 focus:ring-pink/50',
      lime:
        'bg-lime text-black font-semibold hover:brightness-105 shadow-[0_0_20px_rgba(212,255,63,0.25)] focus:ring-2 focus:ring-lime/50',
      secondary:
        'bg-surface-2 text-text hover:bg-surface-3 border border-line focus:ring-2 focus:ring-white/10',
      ghost:
        'text-muted hover:text-text hover:bg-surface-2 focus:ring-1 focus:ring-white/10',
      danger:
        'bg-danger text-white font-medium hover:brightness-110 focus:ring-2 focus:ring-danger/50',
      outline:
        'border border-line text-text hover:border-pink/40 hover:bg-pink/5 focus:ring-2 focus:ring-pink/30',
    }

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-6 py-2.5 h-12 gap-2.5',
      icon: 'h-10 w-10 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
