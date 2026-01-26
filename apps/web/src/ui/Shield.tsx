import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface ShieldProps {
  children: ReactNode
  className?: string
}

export default function Shield({ children, className = 'bg-gray-100 text-gray-800' }: ShieldProps) {
  return (
    <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', className)}>
      {children}
    </span>
  )
}
