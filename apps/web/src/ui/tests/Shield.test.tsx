import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Shield from '../Shield'

describe('Shield', () => {
  it('should render children', () => {
    render(<Shield>Test Content</Shield>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should apply default styling', () => {
    render(<Shield>Default</Shield>)
    const shield = screen.getByText('Default')
    expect(shield).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('should apply custom className', () => {
    render(<Shield className="bg-violet-500 text-white">Custom</Shield>)
    const shield = screen.getByText('Custom')
    expect(shield).toHaveClass('bg-violet-500', 'text-white')
  })

  it('should render as inline element', () => {
    render(<Shield>Inline</Shield>)
    const shield = screen.getByText('Inline')
    expect(shield.tagName).toBe('SPAN')
  })
})
