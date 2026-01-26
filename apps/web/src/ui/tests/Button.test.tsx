import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import Button from '../Button'

describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should apply light color by default', () => {
    render(<Button>Light Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-white')
    expect(button).toHaveClass('hover:bg-gray-100')
  })

  it('should apply dark color when specified', () => {
    render(<Button color="dark">Dark Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-800')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should render as link when as="link"', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <Button as="link" to="/test">
            Link Button
          </Button>
        ),
      },
    ])
    
    render(<RouterProvider router={router} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveTextContent('Link Button')
  })

  it('should pass through button attributes', () => {
    render(<Button type="submit" aria-label="Submit form">Submit</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })
})
