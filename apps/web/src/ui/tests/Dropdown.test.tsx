import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dropdown from '../Dropdown'

describe('Dropdown', () => {
  const options = [
    { value: '', label: 'Select an option' },
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ]

  it('should render dropdown with options', () => {
    render(<Dropdown options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Select an option')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should display label when provided', () => {
    render(<Dropdown label="City" options={options} id="city" />)
    expect(screen.getByLabelText('City')).toBeInTheDocument()
  })

  it('should display error message when error prop is provided', () => {
    render(<Dropdown id="test" error="This field is required" options={options} />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })

  it('should have aria-invalid when error exists', () => {
    render(<Dropdown id="test" error="Error" options={options} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-invalid', 'true')
  })

  it('should have aria-describedby linking to error message', () => {
    render(<Dropdown id="test-input" error="Error message" options={options} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('should apply error border class when error exists', () => {
    render(<Dropdown error="Error" options={options} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('border-red-500')
  })

  it('should handle value change', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<Dropdown options={options} onChange={handleChange} />)
    
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'option1')
    
    expect(handleChange).toHaveBeenCalled()
    expect(select).toHaveValue('option1')
  })

  it('should display selected value', () => {
    const handleChange = vi.fn()
    render(<Dropdown options={options} value="option1" onChange={handleChange} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('option1')
  })

  it('should apply custom className', () => {
    render(<Dropdown className="custom-class" options={options} />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('custom-class')
  })
})
