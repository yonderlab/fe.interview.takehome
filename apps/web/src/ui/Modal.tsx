import React, { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement

      // Save current overflow style
      const originalOverflow = document.body.style.overflow
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden'

      // Focus the first focusable element when modal opens
      const focusFirstElement = () => {
        if (!modalRef.current) return
        
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        
        // If no focusable elements, focus the modal container
        if (firstElement) {
          firstElement.focus()
        } else {
          modalRef.current.focus()
        }
      }

      const timer = setTimeout(focusFirstElement, 0)

      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      document.addEventListener('keydown', handleEscape)

      // Trap focus within modal
      const handleTab = (e: KeyboardEvent) => {
        if (!modalRef.current) return
        if (e.key !== 'Tab') return

        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => {
          const isDisabled = 'disabled' in el && (el as HTMLButtonElement | HTMLInputElement).disabled
          return !isDisabled && el.offsetParent !== null // Filter out disabled and hidden elements
        })

        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]
        const activeElement = document.activeElement as HTMLElement

        // Check if active element is within the modal
        const isActiveElementInModal = modalRef.current.contains(activeElement)

        if (!isActiveElementInModal) {
          // If focus is outside modal, move to first element
          e.preventDefault()
          firstElement.focus()
          return
        }

        // Find current index
        const currentIndex = focusableElements.indexOf(activeElement)

        if (e.shiftKey) {
          // Shift + Tab (backwards)
          if (currentIndex <= 0) {
            e.preventDefault()
            e.stopPropagation()
            lastElement.focus()
          }
        } else {
          // Tab (forwards)
          if (currentIndex >= focusableElements.length - 1) {
            e.preventDefault()
            e.stopPropagation()
            firstElement.focus()
          }
        }
      }
      document.addEventListener('keydown', handleTab, true) // Use capture phase to catch event early

      // Cleanup
      return () => {
        clearTimeout(timer)
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTab)
        document.body.style.overflow = originalOverflow

        // Return focus to the previously focused element
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus()
        }
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="p-6">
          <h2 id="modal-title" className="text-2xl font-semibold text-gray-900 mb-4">
            {title}
          </h2>
          
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
