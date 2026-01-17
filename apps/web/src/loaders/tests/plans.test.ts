import { describe, it, expect, vi, beforeEach } from 'vitest'
import { plansLoader, searchPlansLoader, customizePlanLoader, welcomeLoader } from '../plans'
import { providersLoader } from '../providers'

// Mock providersLoader
vi.mock('../providers', () => ({
  providersLoader: vi.fn(),
}))

describe('plans loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('plansLoader', () => {
    it('should fetch plans for a provider', async () => {
      const mockPlans = [
        {
          id: 'plan_1',
          provider_id: 'prov_1',
          name: 'Test Plan',
          description: 'Test',
          base_price_cents: 10000,
          currency: 'USD',
          approval_type: 'none',
          min_participants: 10,
          lead_time_days: 7,
          options: [],
          addons: [],
        },
      ]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: mockPlans }),
      })

      const result = await plansLoader('prov_1')

      expect(global.fetch).toHaveBeenCalledWith('/api/plans?provider_id=prov_1')
      expect(result).toEqual(mockPlans)
    })

    it('should throw Response error when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })

      await expect(plansLoader('invalid')).rejects.toThrow()
    })
  })

  describe('searchPlansLoader', () => {
    it('should search plans with filters', async () => {
      const mockProviders = [
        { id: 'prov_1', name: 'Test Provider', location: 'New York' },
      ]

      const mockPlans = [
        {
          id: 'plan_1',
          provider_id: 'prov_1',
          name: 'Test Plan',
          description: 'Test',
          base_price_cents: 10000,
          currency: 'USD',
          approval_type: 'none',
          min_participants: 10,
          lead_time_days: 7,
          options: [],
          addons: [],
        },
      ]

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockProviders }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockPlans }),
        })

      const request = new Request('http://localhost:3000/welcome?city=New%20York&budget=10000&people=50')
      const result = await searchPlansLoader({ request })

      expect(result.plans).toHaveLength(1)
      expect(result.plans[0].plan).toEqual(mockPlans[0])
      expect(result.plans[0].providerName).toBe('Test Provider')
      expect(result.plans[0].providerLocation).toBe('New York')
    })

    it('should handle empty search results', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      })

      const request = new Request('http://localhost:3000/welcome?city=Unknown')
      const result = await searchPlansLoader({ request })

      expect(result.plans).toEqual([])
      expect(result.providers).toEqual([])
    })
  })

  describe('customizePlanLoader', () => {
    it('should fetch plan and provider details', async () => {
      const mockPlan = {
        id: 'plan_1',
        provider_id: 'prov_1',
        name: 'Test Plan',
        description: 'Test',
        base_price_cents: 10000,
        currency: 'USD',
        approval_type: 'none',
        min_participants: 10,
        lead_time_days: 7,
        options: [],
        addons: [],
      }

      const mockProviders = [
        { id: 'prov_1', name: 'Test Provider', location: 'New York', logo_url: null },
      ]

      // First fetch: providers, then fetch: plans for prov_1
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockProviders }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [mockPlan] }),
        })

      const request = new Request('http://localhost:3000/customize-plan?plan_id=plan_1')
      const result = await customizePlanLoader({ request })

      expect(result).toEqual({ plan: mockPlan, providerId: 'prov_1' })
    })

    it('should throw error when plan not found', async () => {
      const mockProviders = [
        { id: 'prov_1', name: 'Test Provider', location: 'New York', logo_url: null },
      ]

      // Mock providers fetch, then plans fetch returns empty
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: mockProviders }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }),
        })

      const request = new Request('http://localhost:3000/customize-plan?plan_id=invalid')
      
      await expect(customizePlanLoader({ request })).rejects.toThrow()
    })
  })

  describe('welcomeLoader', () => {
    it('should return providers only when no search params', async () => {
      const mockProviders = [
        { id: 'prov_1', name: 'Provider 1', location: 'NYC', logo_url: null },
      ]

      vi.mocked(providersLoader).mockResolvedValue(mockProviders)

      const request = new Request('http://localhost:3000/welcome')
      const result = await welcomeLoader({ request })

      expect(result).toEqual({
        providers: mockProviders,
        searchResults: null,
      })
    })

    it('should load plans when search params exist', async () => {
      const mockProviders = [
        { id: 'prov_1', name: 'Provider 1', location: 'NYC', logo_url: null },
      ]

      const mockPlans = [
        {
          id: 'plan_1',
          provider_id: 'prov_1',
          name: 'Test Plan',
          description: 'Test',
          base_price_cents: 10000,
          currency: 'USD',
          approval_type: 'none',
          min_participants: 10,
          lead_time_days: 7,
          options: [],
          addons: [],
          providerLocation: 'NYC',
        },
      ]

      vi.mocked(providersLoader).mockResolvedValue(mockProviders)
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: mockPlans }),
      })

      const request = new Request('http://localhost:3000/welcome?city=NYC')
      const result = await welcomeLoader({ request })

      expect(result.providers).toEqual(mockProviders)
      expect(result.searchResults).toBeDefined()
      expect(result.searchResults?.plans).toBeDefined()
    })
  })
})
