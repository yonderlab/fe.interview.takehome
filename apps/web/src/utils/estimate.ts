import type { EstimateResponse } from '@actions/estimate'

export function parseErrorsFromBlockingReasons(blockingReasons: string[]): Record<string, string> {
  const errors: Record<string, string> = {}
  blockingReasons.forEach(reason => {
    const match = reason.match(/Missing required field: (\w+)/i)
    if (match) {
      errors[match[1]] = reason
    } else {
      errors._general = reason
    }
  })
  return errors
}

export async function updateEstimate(planId: string, selections: Record<string, string | string[]>): Promise<EstimateResponse> {
  const response = await fetch('/api/estimate', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_id: planId, selections }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to update estimate')
  }

  return data as EstimateResponse
}
