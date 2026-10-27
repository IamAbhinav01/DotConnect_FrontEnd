import React from 'react'
import { cn } from '../lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          className={cn(
            'w-full h-10 px-3.5 rounded-lg bg-surface-2 border border-line text-sm text-text placeholder:text-muted/60 transition-all duration-150',
            'focus:outline-none focus:border-pink focus:ring-1 focus:ring-pink/50 focus:shadow-[0_0_16px_rgba(255,45,168,0.15)]',
            error && 'border-danger focus:border-danger focus:ring-danger/40',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger font-medium mt-0.5">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
