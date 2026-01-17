import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import AgentMessage from '../AgentMessage'

describe('AgentMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should render text', () => {
    render(<AgentMessage text="Hello world" />)
    
    // Fast-forward through all delays (avatar delay + bubble delay + typing)
    act(() => {
      vi.advanceTimersByTime(100) // Avatar appears
    })
    act(() => {
      vi.advanceTimersByTime(300) // Bubble appears
    })
    // Advance through all typing delays
    for (let i = 0; i <= 'Hello world'.length; i++) {
      act(() => {
        vi.advanceTimersByTime(30)
      })
    }
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('should display text character by character', () => {
    render(<AgentMessage text="Hi" />)
    
    // Initially empty (before avatar appears)
    expect(screen.queryByText('H')).not.toBeInTheDocument()
    
    // Fast-forward through avatar delay
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    // Fast-forward through bubble delay
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Advance through first character typing
    act(() => {
      vi.advanceTimersByTime(30)
    })
    expect(screen.getByText('H')).toBeInTheDocument()
    
    // Advance through second character typing
    act(() => {
      vi.advanceTimersByTime(30)
    })
    expect(screen.getByText('Hi')).toBeInTheDocument()
  })

  it('should call onTypingComplete when done', () => {
    const onTypingComplete = vi.fn()
    render(<AgentMessage text="Test" onTypingComplete={onTypingComplete} />)
    
    // Fast-forward through all delays
    act(() => {
      vi.advanceTimersByTime(100) // Avatar appears
    })
    act(() => {
      vi.advanceTimersByTime(300) // Bubble appears
    })
    // Advance through all typing delays
    for (let i = 0; i <= 'Test'.length; i++) {
      act(() => {
        vi.advanceTimersByTime(30)
      })
    }
    
    expect(onTypingComplete).toHaveBeenCalled()
  })

  it('should display avatar', () => {
    render(<AgentMessage text="Test" />)
    
    // Flush any pending effects from initial render
    act(() => {
      // Empty act to flush effects
    })
    
    // Advance timer to trigger avatar appearance
    act(() => {
      vi.advanceTimersByTime(100) // Avatar appears
    })
    
    const avatar = screen.getByText('✶')
    expect(avatar).toBeInTheDocument()
  })
})
