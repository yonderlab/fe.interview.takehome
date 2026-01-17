import { providersLoader } from './providers'

export interface PlanOption {
  code: string
  description: string | null
  required: boolean
  values: string[]
}

export interface PlanAddon {
  id: string
  name: string
  price_cents: number
  currency: string
}

export interface Plan {
  id: string
  provider_id: string
  name: string
  description: string
  base_price_cents: number
  currency: string
  approval_type: string
  min_participants: number
  lead_time_days: number
  options: PlanOption[]
  addons: PlanAddon[]
}

interface PlansResponse {
  items: Plan[]
}

export async function plansLoader(providerId: string) {
  const response = await fetch(`/api/plans?provider_id=${encodeURIComponent(providerId)}`)
  if (!response.ok) {
    throw new Response('Failed to fetch plans', { status: response.status })
  }
  const data: PlansResponse = await response.json()
  return data.items
}

export interface SearchPlansParams {
  city?: string
  budget?: number
  people?: number
}

export async function searchPlansLoader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const city = url.searchParams.get('city')
  const budget = url.searchParams.get('budget')
  const people = url.searchParams.get('people')

  // Load providers
  const providersResponse = await fetch('/api/providers')
  if (!providersResponse.ok) {
    throw new Response('Failed to fetch providers', { status: providersResponse.status })
  }
  const providersData: { items: Array<{ id: string; name: string; location: string; logo_url: string | null }> } = await providersResponse.json()

  // Filter providers by city
  let filteredProviders = providersData.items
  if (city) {
    filteredProviders = filteredProviders.filter(p => p.location === city)
  }

  if (filteredProviders.length === 0) {
    return { plans: [], providers: [] }
  }

  // Load plans for each provider
  const allPlans: Array<{ plan: Plan; providerId: string; providerName: string; providerLocation: string | null; providerLogoUrl: string | null }> = []

  for (const provider of filteredProviders) {
    try {
      const plans = await plansLoader(provider.id)
      
      // Filter plans by budget and people
      let filteredPlans = plans
      
      if (budget) {
        const budgetCents = parseFloat(budget) * 100
        if (!isNaN(budgetCents)) {
          filteredPlans = filteredPlans.filter(
            plan => plan.base_price_cents <= budgetCents
          )
        }
      }
      
      if (people) {
        const peopleCount = parseInt(people, 10)
        if (!isNaN(peopleCount)) {
          filteredPlans = filteredPlans.filter(
            plan => plan.min_participants <= peopleCount
          )
        }
      }
      
      const providerData = providersData.items.find(p => p.id === provider.id)
      filteredPlans.forEach(plan => {
        allPlans.push({
          plan,
          providerId: provider.id,
          providerName: providerData?.name || provider.id,
          providerLocation: providerData?.location || null,
          providerLogoUrl: providerData?.logo_url || null
        })
      })
    } catch (error) {
      console.error(`Failed to load plans for ${provider.id}:`, error)
    }
  }

  return {
    plans: allPlans,
    providers: filteredProviders
  }
}

export async function customizePlanLoader({ request }: { request: Request }) {
  const url = new URL(request.url)
  const planId = url.searchParams.get('plan_id')

  if (!planId) {
    throw new Response('Plan ID is required', { status: 400 })
  }

  // We need to find which provider this plan belongs to
  // For now, we'll need to search through providers
  const providersResponse = await fetch('/api/providers')
  if (!providersResponse.ok) {
    throw new Response('Failed to fetch providers', { status: providersResponse.status })
  }
  const providersData: { items: Array<{ id: string }> } = await providersResponse.json()

  // Try to find the plan by searching through all providers
  for (const provider of providersData.items) {
    try {
      const plans = await plansLoader(provider.id)
      const plan = plans.find(p => p.id === planId)
      if (plan) {
        return { plan, providerId: provider.id }
      }
    } catch (error) {
      // Continue to next provider
    }
  }

  throw new Response('Plan not found', { status: 404 })
}

export async function welcomeLoader({ request }: { request: Request }) {
  const providers = await providersLoader()
  const url = new URL(request.url)
  
  // Load plans if:
  // 1. Form was submitted (search flag is set) - even if all filters are empty
  // 2. Any search filters are present (city, budget, people)
  // 3. plan_id is selected
  if (url.searchParams.has('show') || url.searchParams.has('city') || url.searchParams.has('budget') || url.searchParams.has('people') || url.searchParams.has('plan_id')) {
    const searchResults = await searchPlansLoader({ request })
    return {
      providers,
      searchResults,
    }
  }
  
  // Initial page load - no search params, don't load plans
  return {
    providers,
    searchResults: null,
  }
}
