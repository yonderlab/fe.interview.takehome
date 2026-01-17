import React from 'react'
import { Link } from 'react-router'

interface BaseButtonProps {
  color?: 'light' | 'dark'
  className?: string
  children: React.ReactNode
}

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className' | 'color'>, BaseButtonProps {
  as?: 'button'
}

interface ButtonLinkProps extends BaseButtonProps {
  as: 'link'
  to: string
}

type ButtonComponentProps = ButtonProps | ButtonLinkProps

function Button({ color = 'light', children, className = '', ...props }: ButtonComponentProps) {
  const sizeClasses = 'h-8 px-4 py-0 text-sm'
  
  const baseClasses = `transition-all text-center cursor-pointer rounded-lg border-0 focus:outline-none focus-violet-inset ${sizeClasses}`
  
  const colorClasses = color === 'light'
    ? 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm'
    : 'bg-gray-800 text-white hover:bg-gray-700'

  const combinedClassName = `${baseClasses} ${colorClasses} ${className}`

  if ('as' in props && props.as === 'link') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { as: _as, to } = props as ButtonLinkProps
    return (
      <Link
        to={to}
        className={combinedClassName}
      >
        {children}
      </Link>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { as: _as, ...buttonProps } = props as ButtonProps
  return (
    <button
      className={combinedClassName}
      {...buttonProps}
    >
      {children}
    </button>
  )
}

export default Button
