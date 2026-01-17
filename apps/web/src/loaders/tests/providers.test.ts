import { describe, it, expect, vi, beforeEach } from 'vitest'
import { providersLoader } from '../providers'

describe('providersLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should fetch providers', async () => {
    const mockProviders = [
      { id: 'prov_1', name: 'Provider 1', location: 'NYC', logo_url: null },
      { id: 'prov_2', name: 'Provider 2', location: 'LA', logo_url: 'https://example.com/logo.png' },
    ]

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockProviders }),
    })

    const result = await providersLoader()

    expect(global.fetch).toHaveBeenCalledWith('/api/providers')
    expect(result).toEqual(mockProviders)
  })

  it('should throw Response error when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(providersLoader()).rejects.toThrow()
  })
})
