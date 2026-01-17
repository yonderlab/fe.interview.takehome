import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '../Input'

describe('Input', () => {
  it('should render input', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should display error message when error prop is provided', () => {
    render(<Input id="test-input" error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })

  it('should have aria-invalid when error exists', () => {
    render(<Input id="test-input" error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('should have aria-describedby linking to error message', () => {
    render(<Input id="test-input" error="Error message" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('should apply error border class when error exists', () => {
    render(<Input error="Error" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('should prevent non-numeric input when type is number', async () => {
    const user = userEvent.setup()
    render(<Input type="number" />)
    const input = screen.getByRole('spinbutton')
    
    await user.type(input, 'abc123')
    // Only numeric chars should be in the value (123), non-numeric chars (abc) should be prevented
    expect(input).toHaveValue(123)
  })

  it('should allow numeric input when type is number', async () => {
    const user = userEvent.setup()
    render(<Input type="number" />)
    const input = screen.getByRole('spinbutton')
    
    await user.type(input, '123')
    expect(input).toHaveValue(123)
  })

  it('should allow control keys in number input', async () => {
    const user = userEvent.setup()
    render(<Input type="number" defaultValue="123" />)
    const input = screen.getByRole('spinbutton')
    
    input.focus()
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('456')
    expect(input).toHaveValue(456)
  })

  it('should call custom onKeyDown handler', async () => {
    const handleKeyDown = vi.fn()
    const user = userEvent.setup()
    render(<Input onKeyDown={handleKeyDown} />)
    
    await user.type(screen.getByRole('textbox'), 'a')
    expect(handleKeyDown).toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })
})
