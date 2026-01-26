import { useState, useEffect, useRef, useCallback } from 'react'
import { useLoaderData, useNavigate, useSearchParams } from 'react-router'
import { clsx } from 'clsx'
import { ArrowsClockwise } from '@phosphor-icons/react'
import { customizePlanLoader, type Plan } from '@loaders/plans'
import type { EstimateResponse } from '@actions/estimate'
import { finalizeEstimateAction } from '@actions/estimate'
import Button from '@ui/Button'
import Dropdown from '@ui/Dropdown'
import AgentMessage from '@ui/AgentMessage'
import Shield from '@ui/Shield'
import Modal from '@ui/Modal'
import { useModal } from '@ui/useModal'
import { updateEstimate, parseErrorsFromBlockingReasons } from '../utils/estimate'
import { formatPrice, formatLabel } from '../utils/format'

const DEBOUNCE_DELAY = 500

// Helper: Get free addon IDs
function getFreeAddonIds(plan: Plan): string[] {
  return plan.addons.filter(addon => addon.price_cents === 0).map(addon => addon.id)
}

// Helper: Read selections from URL params
function selectionsFromUrlParams(searchParams: URLSearchParams, plan: Plan): Record<string, string | string[]> {
  const freeAddonIds = getFreeAddonIds(plan)
  const selections: Record<string, string | string[]> = {
    addons: freeAddonIds,
  }
  
  const addonsParam = searchParams.get('addons')
  if (addonsParam) {
    const urlAddons = addonsParam.split(',').filter(Boolean)
    selections.addons = [...new Set([...freeAddonIds, ...urlAddons])]
  }
  
  plan.options.forEach(option => {
    if (option.values.length === 1) {
      selections[option.code] = option.values[0]
    } else {
      const value = searchParams.get(option.code)
      selections[option.code] = value ?? ''
    }
  })
  
  return selections
}

// Helper: Validate selections against plan
function validateSelections(selections: Record<string, string | string[]>, plan: Plan): Record<string, string | string[]> {
  const freeAddonIds = getFreeAddonIds(plan)
  const validated: Record<string, string | string[]> = {
    addons: freeAddonIds,
  }
  
  const addons = Array.isArray(selections.addons) ? selections.addons : []
  const validAddonIds = new Set(plan.addons.map(a => a.id))
  const validAddons = addons.filter(id => validAddonIds.has(id))
  validated.addons = [...new Set([...freeAddonIds, ...validAddons])]
  
  plan.options.forEach(option => {
    if (option.values.length === 1) {
      validated[option.code] = option.values[0]
    } else {
      const value = selections[option.code]
      if (value && typeof value === 'string' && value.trim() !== '' && option.values.includes(value)) {
        validated[option.code] = value
      }
    }
  })
  
  return validated
}

// Helper: Check if all required fields are filled
function hasAllRequiredFields(plan: Plan, selections: Record<string, string | string[]>): boolean {
  return plan.options.every(option => {
    if (!option.required) return true
    const value = selections[option.code]
    return value && (typeof value !== 'string' || value.trim() !== '')
  })
}

// Helper: Update URL params with selections (preserves non-selection params like city, budget, people)
function updateUrlParams(searchParams: URLSearchParams, selections: Record<string, string | string[]>, plan: Plan): URLSearchParams {
  const validatedSelections = validateSelections(selections, plan)
  const newParams = new URLSearchParams(searchParams)
  const freeAddonIds = new Set(getFreeAddonIds(plan))
  
  // Remove all selection-related params first (we'll add back only valid ones)
  newParams.delete('addons')
  plan.options.forEach(option => newParams.delete(option.code))
  
  // Add back valid selection params
  const addons = Array.isArray(validatedSelections.addons) ? validatedSelections.addons : []
  const nonFreeAddons = addons.filter(id => !freeAddonIds.has(id))
  
  if (nonFreeAddons.length > 0) {
    newParams.set('addons', nonFreeAddons.join(','))
  }
  
  plan.options.forEach(option => {
    if (option.values.length > 1) {
      const value = validatedSelections[option.code]
      if (value && typeof value === 'string' && value.trim() !== '') {
        newParams.set(option.code, value)
      }
    }
  })
  
  return newParams
}

function useDebouncedEstimate(plan: Plan, selections: Record<string, string | string[]>) {
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const performEstimate = useCallback(async () => {
    if (!plan.id || !hasAllRequiredFields(plan, selections)) {
      setEstimate(null)
      setErrors({})
      return
    }

    setIsEstimating(true)
    try {
      const estimateData = await updateEstimate(plan.id, selections)
      setEstimate(estimateData)
      setErrors(
        estimateData.blocking_reasons.length > 0
          ? parseErrorsFromBlockingReasons(estimateData.blocking_reasons)
          : {}
      )
    } catch (error) {
      setEstimate(null)
      setErrors({
        _general: error instanceof Error ? error.message : 'Failed to estimate',
      })
    } finally {
      setIsEstimating(false)
    }
  }, [plan, selections])

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(performEstimate, DEBOUNCE_DELAY)
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [performEstimate])

  return { estimate, isEstimating, errors }
}

export const loader = customizePlanLoader

export default function CustomizePlanPage() {
  const { plan } = useLoaderData() as { plan: Plan; providerId: string }
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [selections, setSelections] = useState<Record<string, string | string[]>>(() => 
    selectionsFromUrlParams(searchParams, plan)
  )
  
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)
  const { isOpen: showConfirmModal, open: openConfirmModal, close: closeConfirmModal } = useModal()

  const { estimate, isEstimating, errors } = useDebouncedEstimate(plan, selections)

  // Sync selections from URL when URL changes and remove invalid params
  useEffect(() => {
    const urlSelections = selectionsFromUrlParams(searchParams, plan)
    const validatedSelections = validateSelections(urlSelections, plan)
    
    // Update URL params to remove invalid ones
    const cleanedParams = updateUrlParams(searchParams, validatedSelections, plan)
    if (cleanedParams.toString() !== searchParams.toString()) {
      setSearchParams(cleanedParams, { replace: true })
    }
    
    setSelections(validatedSelections)
  }, [searchParams, plan, setSearchParams])

  // Handler to update selections and URL params
  const updateSelections = (updated: Record<string, string | string[]>) => {
    const validated = validateSelections(updated, plan)
    setSelections(validated)
    setSearchParams(updateUrlParams(searchParams, validated, plan), { replace: true })
  }

  const handleOptionChange = (optionCode: string, value: string) => {
    updateSelections({ ...selections, [optionCode]: value })
  }

  const handleAddonChange = (addonId: string, checked: boolean) => {
    const addon = plan.addons.find(a => a.id === addonId)
    if (!checked && addon?.price_cents === 0) return
    
    const currentAddons = Array.isArray(selections.addons) ? selections.addons : []
    const updatedAddons = checked
      ? [...currentAddons, addonId]
      : currentAddons.filter(id => id !== addonId)
    
    updateSelections({ ...selections, addons: updatedAddons })
  }

  const handleGoBack = () => {
    const params = new URLSearchParams()
    const filters = ['city', 'budget', 'people', 'plan_id'] as const
    filters.forEach(key => {
      const value = searchParams.get(key)
      if (value) params.set(key, value)
    })
    navigate(`/welcome${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const handleFinalize = () => {
    if (!estimate) {
      setFinalizeError('Please wait for the estimate to be calculated')
      return
    }
    if (estimate.blocking_reasons.length > 0) {
      setFinalizeError('Please fix all errors before finalizing')
      return
    }

    // Show confirmation modal
    openConfirmModal()
    setFinalizeError(null)
  }

  const confirmFinalize = async () => {
    if (!estimate) {
      setFinalizeError('Please wait for the estimate to be calculated')
      closeConfirmModal()
      return
    }

    // Remove invalid params after validation
    const validatedSelections = validateSelections(selections, plan)
    setSearchParams(updateUrlParams(searchParams, validatedSelections, plan), { replace: true })

    setIsFinalizing(true)
    setFinalizeError(null)
    
    try {
      await finalizeEstimateAction()
      closeConfirmModal()
      navigate('/your-plan')
    } catch (error) {
      setFinalizeError(error instanceof Error ? error.message : 'Failed to finalize estimate')
      setIsFinalizing(false)
      // Keep modal open on error so user can see the error message
    }
  }

  const handleCancelFinalize = () => {
    closeConfirmModal()
  }

  const handleAddonClick = (addonId: string, isSelected: boolean, isFree: boolean) => {
    if (!isFree) handleAddonChange(addonId, !isSelected)
  }

  const handleAddonKeyDown = (e: React.KeyboardEvent, addonId: string, isSelected: boolean, isFree: boolean) => {
    if (!isFree && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleAddonChange(addonId, !isSelected)
    }
  }

  const canFinalize = estimate && estimate.blocking_reasons.length === 0 && !isEstimating && Object.keys(errors).length === 0

  const visibleOptions = plan.options.filter(option => option.values.length > 1)

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <AgentMessage text={`Customize Plan: ${plan.name}`} />
        </div>

        {/* Plan Information */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Shield className='bg-violet-600 text-white'>
              Base Price: {formatPrice(plan.base_price_cents, plan.currency)}
            </Shield>
            <Shield className='bg-violet-600 text-white'>
              Min Participants: {plan.min_participants}
            </Shield>
            <Shield className='bg-violet-600 text-white'>
              Lead Time: {plan.lead_time_days} days
            </Shield>
            <Shield className='bg-violet-600 text-white'>
              Approval Type: {plan.approval_type}
            </Shield>
          </div>
        </div>

        {/* Options and Addons */}
        <div className="space-y-6">
          {/* Options */}
          {visibleOptions.length > 0 && (
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
            <fieldset>
              <legend className="text-2xl font-semibold mb-4">Options</legend>
              <div className="grid grid-cols-2 gap-4 items-start">
                {visibleOptions.map(option => (
                  <div key={option.code} className='space-y-2'>
                    <div className="flex items-center gap-2">
                      <label htmlFor={option.code} className="text-sm font-medium text-gray-700">
                        {option.description ?? formatLabel(option.code)}
                        {option.required && (
                          <span className="sr-only"> (required)</span>
                        )}
                      </label>
                      {option.required && (
                        <Shield className="bg-violet-200 text-violet-900" aria-label="required">required</Shield>
                      )}
                    </div>
                    <Dropdown
                      name={option.code}
                      id={option.code}
                      options={[
                        { value: '', label: 'Select an option' },
                        ...option.values.map(value => ({ value, label: value }))
                      ]}
                      value={selections[option.code] as string || ''}
                      onChange={(e) => handleOptionChange(option.code, e.target.value)}
                      error={errors[option.code]}
                      required={option.required}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
            </div>
          )}

          {/* Addons */}
          {plan.addons.length > 0 && (
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
            <fieldset>
              <legend className="text-2xl font-semibold mb-4">Add-ons</legend>
              <div className="grid grid-cols-2 gap-4 items-start" role="group" aria-label="Add-ons">
                {plan.addons.map(addon => {
                  const isSelected = Array.isArray(selections.addons) && selections.addons.includes(addon.id)
                  const isFree = addon.price_cents === 0
                  return (
                    <div
                      key={addon.id}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-disabled={isFree}
                      aria-label={`${addon.name}, ${formatPrice(addon.price_cents, addon.currency)}${isFree ? ', included' : ''}`}
                      tabIndex={isFree ? -1 : 0}
                      onClick={() => handleAddonClick(addon.id, isSelected, isFree)}
                      onKeyDown={(e) => handleAddonKeyDown(e, addon.id, isSelected, isFree)}
                      className={clsx(
                        'flex items-start p-4 border-2 rounded-lg transition-shadow',
                        {
                          'border-violet-light ring-2 ring-violet-light ring-opacity-30 cursor-default': isFree,
                          'border-violet-light ring-2 ring-violet-light focus:border-violet-dark ring-opacity-30 focus:outline-none focus:ring-2 focus:ring-violet-light focus:ring-opacity-50 hover:bg-gray-50 cursor-pointer': isSelected && !isFree,
                          'border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-light focus:ring-opacity-50 hover:bg-gray-50 cursor-pointer': !isSelected && !isFree,
                        }
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="sr-only"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{addon.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(addon.price_cents, addon.currency)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </fieldset>
            </div>
          )}

          {/* General Error */}
          {errors._general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="assertive">
              <p className="text-red-600">{errors._general}</p>
            </div>
          )}

          {/* Finalize Error */}
          {finalizeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="assertive">
              <p className="text-red-600">{finalizeError}</p>
            </div>
          )}

          {/* Estimated Price - only show if no errors */}
          {Object.keys(errors).length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Estimated Price</h2>
                {isEstimating ? (
                  <div className="h-14 flex items-center gap-2 text-gray-500" aria-live="polite" aria-atomic="true">
                    <ArrowsClockwise size={20} className="animate-spin" aria-hidden="true" />
                    <span>Calculating...</span>
                  </div>
                ) : estimate ? (
                  <div className="text-right h-14" aria-live="polite" aria-atomic="true">
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(estimate.pricing.total, estimate.pricing.currency)}
                    </div>
                    {estimate.pricing.addons > 0 && <div className="text-sm text-gray-600">
                      Base: {formatPrice(estimate.pricing.base, estimate.pricing.currency)} + 
                      Add-ons: {formatPrice(estimate.pricing.addons, estimate.pricing.currency)}
                    </div>}
                  </div>
                ) : (
                  <div className="text-gray-500 h-14 flex items-center" aria-live="polite">Fill in required fields to see price</div>
                )}
              </div>
              {/* Buttons section */}
              <div className="flex gap-4 justify-between">
                <Button
                  onClick={handleGoBack}
                  color="light"
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous Step
                </Button>
                {canFinalize && (
                  <Button
                    onClick={handleFinalize}
                    color="dark"
                    disabled={isFinalizing}
                    className="w-32 justify-center"
                  >
                    {isFinalizing ? (
                      <ArrowsClockwise size={16} className="animate-spin" />
                    ) : (
                      'Finalize'
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={handleCancelFinalize}
        title="Confirm Your Booking"
      >
        <div className="space-y-6">
          {/* Plan Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Details</h3>
            <div className="flex flex-wrap gap-2">
              <Shield className="bg-violet-600 text-white">
                Plan: {plan.name}
              </Shield>
              <Shield className="bg-violet-600 text-white">
                Base Price: {formatPrice(plan.base_price_cents, plan.currency)}
              </Shield>
              <Shield className="bg-violet-600 text-white">
                Min Participants: {plan.min_participants}
              </Shield>
              <Shield className="bg-violet-600 text-white">
                Lead Time: {plan.lead_time_days} days
              </Shield>
            </div>
          </div>

          {/* Selected Options */}
          {(() => {
            const selectedOptions = visibleOptions
              .map(option => {
                const selectedValue = selections[option.code] as string
                if (!selectedValue) return null
                return { option, value: selectedValue }
              })
              .filter((item): item is { option: typeof visibleOptions[0]; value: string } => item !== null)
            
            if (selectedOptions.length === 0) return null
            
            return (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Options</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedOptions.map(({ option, value }) => (
                    <Shield key={option.code} className="bg-gray-100 text-gray-800">
                      {formatLabel(option.code)}: {value}
                    </Shield>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Selected Addons */}
          {plan.addons.length > 0 && (() => {
            const selectedAddons = plan.addons.filter(addon => 
              Array.isArray(selections.addons) && selections.addons.includes(addon.id)
            )
            if (selectedAddons.length === 0) return null
            return (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Add-ons</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAddons.map(addon => (
                    <Shield key={addon.id} className="bg-gray-100 text-gray-800">
                      {addon.name}: {formatPrice(addon.price_cents, addon.currency)}
                    </Shield>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Pricing Summary */}
          {estimate && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Base Price:</span>
                  <span className="font-medium">{formatPrice(estimate.pricing.base, estimate.pricing.currency)}</span>
                </div>
                {estimate.pricing.addons > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Add-ons:</span>
                    <span className="font-medium">{formatPrice(estimate.pricing.addons, estimate.pricing.currency)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-xl font-semibold text-gray-900">Total:</span>
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(estimate.pricing.total, estimate.pricing.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isEstimating && (
            <div className="text-center text-gray-500">
              <ArrowsClockwise size={20} className="animate-spin mx-auto mb-2" />
              <p>Updating price...</p>
            </div>
          )}

          {/* Finalize Error in Modal */}
          {finalizeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="assertive">
              <p className="text-red-600">{finalizeError}</p>
            </div>
          )}

          {/* Modal Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button onClick={handleCancelFinalize} color="light">
              Go back to plan
            </Button>
            <Button
              onClick={confirmFinalize}
              color="dark"
              disabled={isFinalizing || !estimate}
              className={isFinalizing ? "w-32 justify-center" : ""}
            >
              {isFinalizing ? (
                <ArrowsClockwise size={16} className="animate-spin" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  )
}
