import { useState } from 'react'
import { useLoaderData, useSearchParams, useNavigation, useNavigate } from 'react-router'
import { clsx } from 'clsx'
import { ArrowsClockwise, WarningCircle } from '@phosphor-icons/react'
import type { Plan } from '@loaders/plans'
import type { Provider } from '@loaders/providers'
import Button from '@ui/Button'
import Input from '@ui/Input'
import Dropdown from '@ui/Dropdown'
import AgentMessage from '@ui/AgentMessage'

export default function WelcomePage() {
  const { providers, searchResults } = useLoaderData() as {
    providers: Provider[]
    searchResults: { plans: Array<{ plan: Plan; providerId: string; providerName: string; providerLocation: string | null; providerLogoUrl: string | null }>; providers: Provider[] } | null
  }
  const [searchParams] = useSearchParams()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const [focusedPlanId, setFocusedPlanId] = useState<string | null>(null)
  
  const isLoading = navigation.state === 'loading'

  const isNonEmpty = (value: string | null | undefined): value is string => {
    return value !== null && value !== undefined && value.trim() !== ''
  }

  const buildUrlParams = (values: { city?: string | null; budget?: string | null; people?: string | null; plan_id?: string | null }) => {
    const params = new URLSearchParams()
    
    const paramMap: Array<[string, string | null | undefined]> = [
      ['city', values.city],
      ['budget', values.budget],
      ['people', values.people],
      ['plan_id', values.plan_id],
    ]
    
    paramMap.forEach(([key, value]) => {
      if (isNonEmpty(value)) {
        params.set(key, value)
      }
    })
    
    return params
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const params = buildUrlParams({
      city: formData.get('city') as string,
      budget: formData.get('budget') as string,
      people: formData.get('people') as string,
      plan_id: searchParams.get('plan_id'), // Preserve plan_id if it exists
    })
    
    // Add 'show=all' only if all other params are empty (form submitted with no filters)
    // Remove it if there are any other params
    if (params.toString() === '') {
      params.set('show', 'all')
    } else {
      params.delete('show')
    }
    
    navigate(`/welcome?${params.toString()}`)
  }
  
  const handlePlanClick = (planId: string) => {
    // Build params with only non-empty search filters + plan_id
    const params = buildUrlParams({
      city: searchParams.get('city'),
      budget: searchParams.get('budget'),
      people: searchParams.get('people'),
      plan_id: planId,
    })
    
    navigate(`/customize-plan?${params.toString()}`)
  }
  
  // Get unique cities from providers
  const cities = Array.from(new Set(providers.map(p => p.location).filter(Boolean)))
  const cityOptions = [
    { value: '', label: 'Select a city' },
    ...cities.map(city => ({ value: city, label: city }))
  ]
  
  const currentCity = searchParams.get('city') || ''
  const currentBudget = searchParams.get('budget') || ''
  const currentPeople = searchParams.get('people') || ''
  const selectedPlanId = searchParams.get('plan_id') || ''
  
  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(cents / 100)
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="space-y-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <AgentMessage text="Welcome to the Package Builder! Tell us about your event 🎟️" />
     

        <div className="bg-gray-50 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 items-end" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
              <Dropdown
                id="city"
                name="city"
                label="City"
                options={cityOptions}
                defaultValue={currentCity}
              />
              <div>
                <label htmlFor="budget" className="ml-2 block text-sm font-medium text-gray-600 mb-1">
                  Budget
                </label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter your budget (€)"
                  min="0"
                  step="0.01"
                  defaultValue={currentBudget}
                />
              </div>
              <div>
                <label htmlFor="people" className="ml-2 block text-sm font-medium text-gray-600 mb-1">
                  Group size
                </label>
                <Input
                  id="people"
                  name="people"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="How many people?"
                  min="1"
                  defaultValue={currentPeople}
                />
              </div>
              <Button type="submit" color="dark" disabled={isLoading} className="w-24 flex justify-center items-center">
                {isLoading ? (
                  <ArrowsClockwise size={16} className="animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>
     
          </form>
        </div>

        {searchResults && (
          <>
            {searchResults.plans.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">
                  Available Plans ({searchResults.plans.length})
                </h2>
                {searchResults.plans.map(({ plan, providerLocation, providerLogoUrl, providerName }) => {
                  const isSelected = selectedPlanId === plan.id
                  const isFocused = focusedPlanId === plan.id
                  return (
                    <div
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePlanClick(plan.id)}
                      onFocus={() => setFocusedPlanId(plan.id)}
                      onBlur={() => setFocusedPlanId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handlePlanClick(plan.id)
                        }
                      }}
                      className={clsx(
                        'bg-white border-2 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-4',
                        'focus:outline-none focus:ring-2 focus:ring-violet-light focus:ring-opacity-50',
                        {
                          'border-gray-200': isFocused || (!isSelected && !isFocused),
                          'border-violet-light ring-2 ring-violet-light ring-opacity-30': isSelected && !isFocused,
                        }
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            {providerLogoUrl && (
                              <img
                                src={providerLogoUrl}
                                alt={`${providerName} logo`}
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                  // Hide image if it fails to load
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <h3 className="text-xl font-semibold text-gray-900">
                              {plan.name}
                            </h3>
                          </div>
                          {providerLocation && <p className="text-sm text-gray-600 mb-2">
                            {providerLocation}
                          </p>}
                          <p className="text-gray-700">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(plan.base_price_cents, plan.currency)}
                          </div>
                          <div className="text-sm text-gray-600">base price</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                        <span>Min participants: {plan.min_participants}</span>
                        <span>Lead time: {plan.lead_time_days} days</span>
                        <span>Approval: {plan.approval_type}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <WarningCircle size={96} className="text-gray-200 mb-4" />
                <p className="text-lg text-gray-700 mb-2">
                  No plans found matching your requirements
                </p>
                <p className="text-gray-600">
                  Try adjusting your search criteria to find available plans.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
