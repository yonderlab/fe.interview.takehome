export interface EstimateRequest {
  plan_id: string
  selections: {
    addons?: string[]
    [key: string]: string | string[] | undefined
  }
}

export interface EstimateResponse {
  id: string
  status: string
  selections: Record<string, unknown>
  pricing: {
    base: number
    addons: number
    total: number
    currency: string
  }
  blocking_reasons: string[]
}

export async function updateEstimateAction({ request }: { request: Request }) {
  const formData = await request.formData()
  const planId = formData.get('plan_id') as string
  const selectionsJson = formData.get('selections') as string

  if (!planId || !selectionsJson) {
    throw new Response('Missing required fields', { status: 400 })
  }

  let selections: EstimateRequest['selections']
  try {
    selections = JSON.parse(selectionsJson)
  } catch (e) {
    throw new Response('Invalid selections format', { status: 400 })
  }

  const requestBody: EstimateRequest = {
    plan_id: planId,
    selections,
  }

  const response = await fetch('/api/estimate', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Response(data.error?.message || 'Failed to update estimate', { status: response.status })
  }

  return data as EstimateResponse
}

export async function finalizeEstimateAction() {
  const response = await fetch('/api/estimate/finalise', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Response(data.error?.message || 'Failed to finalize estimate', { status: response.status })
  }

  return data as { id: string; status: string }
}
