import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

interface AgentMessageProps {
  text: string
  onTypingComplete?: () => void
}

const TYPING_SPEED = 30

function AgentMessage({ text, onTypingComplete }: AgentMessageProps) {
  const [showAvatar, setShowAvatar] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  // Step 1: Show avatar first
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowAvatar(true)
    }, 100)
    return () => clearTimeout(timeout)
  }, [])

  // Step 2: Show bubble after avatar
  useEffect(() => {
    if (showAvatar && !showBubble) {
      const timeout = setTimeout(() => {
        setShowBubble(true)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [showAvatar, showBubble])

  // Step 3: Start typing after bubble appears
  useEffect(() => {
    if (showBubble && displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1))
      }, TYPING_SPEED)
      return () => clearTimeout(timeout)
    } else if (showBubble && displayedText.length === text.length) {
      // Typing completed
      if (onTypingComplete) {
        onTypingComplete()
      }
    }
  }, [showBubble, displayedText, text, onTypingComplete])

  return (
    <div className="flex items-start gap-3 w-full">
      <div className={clsx(
        'w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 ease-out',
        showAvatar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        ✶
      </div>

      <div className={clsx(
        'bg-gray-800 rounded-lg p-3 transition-all duration-300 ease-out',
        showBubble ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        <p className="text-white">
          {displayedText}
        </p>
      </div>
    </div>
  )
}

export default AgentMessage
