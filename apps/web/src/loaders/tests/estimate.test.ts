import { describe, it, expect, vi, beforeEach } from 'vitest'
import { estimateLoader } from '../estimate'

describe('estimateLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should fetch current estimate', async () => {
    const mockEstimate = {
      id: 'est_123',
      status: 'draft',
      plan: { id: 'plan_1', name: 'Test Plan' },
      selections: { seating_type: 'open' },
      pricing: {
        base: 10000,
        addons: 5000,
        total: 15000,
        currency: 'USD',
      },
      blocking_reasons: [],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockEstimate,
    })

    const result = await estimateLoader()

    expect(global.fetch).toHaveBeenCalledWith('/api/estimate')
    expect(result).toEqual(mockEstimate)
  })

  it('should throw Response error when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    await expect(estimateLoader()).rejects.toThrow()
  })
})
