import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseErrorsFromBlockingReasons, updateEstimate } from '../estimate'

describe('estimate', () => {
  describe('parseErrorsFromBlockingReasons', () => {
    it('should parse missing required field errors', () => {
      const reasons = ['Missing required field: seating_type']
      const errors = parseErrorsFromBlockingReasons(reasons)
      
      expect(errors).toEqual({
        seating_type: 'Missing required field: seating_type',
      })
    })

    it('should parse multiple missing fields', () => {
      const reasons = [
        'Missing required field: seating_type',
        'Missing required field: food_package',
      ]
      const errors = parseErrorsFromBlockingReasons(reasons)
      
      expect(errors).toEqual({
        seating_type: 'Missing required field: seating_type',
        food_package: 'Missing required field: food_package',
      })
    })

    it('should handle general errors', () => {
      const reasons = ['Invalid add-on: addon_invalid']
      const errors = parseErrorsFromBlockingReasons(reasons)
      
      expect(errors).toEqual({
        _general: 'Invalid add-on: addon_invalid',
      })
    })

    it('should handle mixed errors', () => {
      const reasons = [
        'Missing required field: seating_type',
        'Invalid add-on: addon_invalid',
      ]
      const errors = parseErrorsFromBlockingReasons(reasons)
      
      expect(errors).toEqual({
        seating_type: 'Missing required field: seating_type',
        _general: 'Invalid add-on: addon_invalid',
      })
    })

    it('should handle empty array', () => {
      const errors = parseErrorsFromBlockingReasons([])
      expect(errors).toEqual({})
    })
  })

  describe('updateEstimate', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should call API and return estimate', async () => {
      const mockEstimate = {
        id: 'est_123',
        status: 'draft',
        plan: { id: 'plan_1', name: 'Test Plan' },
        selections: { seating_type: 'open' },
        pricing: { base: 10000, addons: 5000, total: 15000, currency: 'USD' },
        blocking_reasons: [],
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockEstimate,
      })

      const result = await updateEstimate('plan_1', { seating_type: 'open' })

      expect(global.fetch).toHaveBeenCalledWith('/api/estimate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: 'plan_1',
          selections: { seating_type: 'open' },
        }),
      })
      expect(result).toEqual(mockEstimate)
    })

    it('should throw error when API returns error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { message: 'Plan not found' },
        }),
      })

      await expect(
        updateEstimate('invalid_plan', {})
      ).rejects.toThrow('Plan not found')
    })

    it('should throw generic error when error message is missing', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      await expect(
        updateEstimate('plan_1', {})
      ).rejects.toThrow('Failed to update estimate')
    })
  })
})
