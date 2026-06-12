import React from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftAddon, rightAddon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 text-gray-400">{leftAddon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white',
              'placeholder:text-gray-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-red-400 focus-visible:ring-red-400'
                : 'border-gray-300',
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightAddon && (
            <div className="absolute right-3 text-gray-400">{rightAddon}</div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
