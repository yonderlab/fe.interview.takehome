import { describe, it, expect } from 'vitest'
import { formatPrice, formatLabel } from '../format'

describe('format', () => {
  describe('formatPrice', () => {
    it('should format price in cents to currency string', () => {
      expect(formatPrice(1000, 'USD')).toBe('$10.00')
      expect(formatPrice(5000, 'USD')).toBe('$50.00')
      expect(formatPrice(12345, 'USD')).toBe('$123.45')
    })

    it('should handle EUR currency', () => {
      expect(formatPrice(1000, 'EUR')).toBe('€10.00')
      expect(formatPrice(5000, 'EUR')).toBe('€50.00')
    })

    it('should handle zero cents', () => {
      expect(formatPrice(0, 'USD')).toBe('$0.00')
    })

    it('should handle large amounts', () => {
      expect(formatPrice(1000000, 'USD')).toBe('$10,000.00')
    })
  })

  describe('formatLabel', () => {
    it('should replace underscores with spaces and capitalize', () => {
      expect(formatLabel('seating_type')).toBe('Seating Type')
      expect(formatLabel('food_package')).toBe('Food Package')
    })

    it('should capitalize first letter of each word', () => {
      expect(formatLabel('date_flex_window_days')).toBe('Date Flex Window Days')
    })

    it('should handle single word', () => {
      expect(formatLabel('addons')).toBe('Addons')
    })

    it('should handle empty string', () => {
      expect(formatLabel('')).toBe('')
    })
  })
})
