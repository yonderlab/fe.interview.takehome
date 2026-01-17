import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  className?: string
  error?: string
}

function Input({ className = '', type, onKeyDown, error, id, ...props }: InputProps) {
  const sizeClasses = 'h-8 px-2 py-0 text-sm'
  
  const baseClasses = `w-full bg-white shadow-sm text-gray-700 placeholder:text-gray-400 rounded-lg font-medium border border-white focus:outline-none focus-violet-inset ${sizeClasses}`
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If type is number, prevent non-numeric characters
    if (type === 'number') {
      const key = e.key
      // Allow: backspace, delete, tab, escape, enter, decimal point, and numbers
      if (
        key === 'Backspace' ||
        key === 'Delete' ||
        key === 'Tab' ||
        key === 'Escape' ||
        key === 'Enter' ||
        key === '.' ||
        key === '-' ||
        (key >= '0' && key <= '9') ||
        // Allow Ctrl/Cmd + A, C, V, X, Z
        (e.ctrlKey || e.metaKey) && (key === 'a' || key === 'c' || key === 'v' || key === 'x' || key === 'z') ||
        // Allow arrow keys
        key.startsWith('Arrow') ||
        key === 'Home' ||
        key === 'End'
      ) {
        return
      }
      e.preventDefault()
    }
    
    // Call original onKeyDown if provided
    if (onKeyDown) {
      onKeyDown(e)
    }
  }
  
  const errorId = id && error ? `${id}-error` : undefined
  const ariaDescribedBy = errorId ? errorId : undefined
  
  return (
    <div className="w-full">
      <input
        type={type}
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={ariaDescribedBy}
        className={clsx(baseClasses, error && 'border-red-500', className)}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
