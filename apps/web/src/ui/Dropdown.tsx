import { SelectHTMLAttributes, useState } from 'react'
import { clsx } from 'clsx'

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

export default function Dropdown({ label, error, options, className = '', id, value, defaultValue, onChange, ...props }: DropdownProps) {
  const errorId = id && error ? `${id}-error` : undefined
  const ariaDescribedBy = errorId ? errorId : undefined
  
  // Track the actual selected value for visual state
  const initialValue = value ?? defaultValue ?? ''
  const [selectedValue, setSelectedValue] = useState<string>(String(initialValue))
  const isEmpty = !selectedValue || selectedValue === ''
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value)
    onChange?.(e)
  }
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1 ml-2">
          {label}
        </label>
      )}
      <select
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={ariaDescribedBy}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={clsx(
          'w-full h-8 px-2 py-0 text-sm bg-white rounded-lg shadow-sm font-medium border',
          'focus:outline-none focus-violet-inset',
          error ? 'border-red-500' : 'border-white',
          isEmpty ? 'text-gray-400' : 'text-gray-800',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className={clsx(option.value === '' ? 'text-gray-400' : 'text-gray-800')}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
