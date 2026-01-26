import { test, expect } from '@playwright/test'

test.describe('Error Handling', () => {
  test('should display error page for invalid plan_id', async ({ page }) => {
    // Navigate to customize-plan with invalid plan_id
    await page.goto('/customize-plan?plan_id=invalid_plan_id')
    
    // Wait for error to be handled
    await page.waitForLoadState('networkidle')
    
    // Check for error message
    const errorMessage = page.getByText(/oops|error|not found/i)
    await expect(errorMessage.first()).toBeVisible()
  })

  test('should display error icon on error page', async ({ page }) => {
    await page.goto('/customize-plan?plan_id=invalid_plan_id')
    await page.waitForLoadState('networkidle')
    
    // Check for warning icon (SVG)
    const warningIcon = page.locator('svg').first()
    await expect(warningIcon).toBeVisible()
  })

  test('should have go back button on error page', async ({ page }) => {
    await page.goto('/customize-plan?plan_id=invalid_plan_id')
    await page.waitForLoadState('networkidle')
    
    const goBackButton = page.getByRole('button', { name: /go back|back/i })
    await expect(goBackButton).toBeVisible()
  })

  test('should navigate to welcome when clicking go back on error page', async ({ page }) => {
    await page.goto('/customize-plan?plan_id=invalid_plan_id')
    await page.waitForLoadState('networkidle')
    
    const goBackButton = page.getByRole('button', { name: /go back|back/i })
    await goBackButton.click()
    
    await page.waitForURL(/\/welcome/)
    await expect(page).toHaveURL(/\/welcome/)
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and fail API requests
    await page.route('**/api/**', route => route.abort())
    
    await page.goto('/welcome')
    await page.waitForLoadState('networkidle')
    
    // Page should still render (even if without data)
    await expect(page.locator('body')).toBeVisible()
  })

  test('should redirect root path to welcome', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL(/\/welcome/)
    await expect(page).toHaveURL(/\/welcome/)
  })
})
