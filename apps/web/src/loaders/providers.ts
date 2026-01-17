export interface Provider {
  id: string
  name: string
  location: string
  logo_url: string | null
}

interface ProvidersResponse {
  items: Provider[]
}

export async function providersLoader() {
  const response = await fetch('/api/providers')
  if (!response.ok) {
    throw new Response('Failed to fetch providers', { status: response.status })
  }
  const data: ProvidersResponse = await response.json()
  return data.items
}
