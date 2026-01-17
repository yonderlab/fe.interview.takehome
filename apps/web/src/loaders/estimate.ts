export interface EstimatePlan {
  id: string
  name: string
}

export interface EstimatePricing {
  base: number
  addons: number
  total: number
  currency: string
}

export interface Estimate {
  id: string
  status: string
  plan: EstimatePlan
  selections: Record<string, unknown>
  pricing: EstimatePricing
  blocking_reasons: string[]
}

export async function estimateLoader() {
  const response = await fetch('/api/estimate')
  if (!response.ok) {
    throw new Response('Failed to fetch estimate', { status: response.status })
  }
  const data: Estimate = await response.json()
  
  return data
}
