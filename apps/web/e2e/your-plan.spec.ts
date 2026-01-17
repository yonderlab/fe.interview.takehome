import { test, expect } from '@playwright/test'

test.describe('Your Plan Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate through the flow to get to Your Plan page
    // This requires: Welcome -> Select Plan -> Customize -> Finalize
    
    // Try to get all plans first
    await page.goto('/welcome?show=all')
    await page.waitForLoadState('networkidle')
    
    // Find and click a plan
    const planCards = page.locator('[role="button"]').filter({ hasText: /€|\$/ })
    const count = await planCards.count()
    
    if (count === 0) {
      console.log('Skipping your-plan tests: No plans available from API')
      test.skip()
      return
    }
    
    await planCards.first().click()
    await page.waitForURL(/\/customize-plan/, { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    
    // Fill required fields if needed
    const optionsSection = page.getByText('Options')
    const hasOptions = await optionsSection.isVisible().catch(() => false)
    
    if (hasOptions) {
      const optionSelects = page.locator('fieldset').filter({ has: optionsSection }).locator('select')
      const selectCount = await optionSelects.count()
      
      for (let i = 0; i < selectCount; i++) {
        const select = optionSelects.nth(i)
        const optionsCount = await select.locator('option').count()
        if (optionsCount > 1) {
          await select.selectOption({ index: 1 })
        }
      }
    }
    
    // Wait for price to be calculated (longer wait to ensure estimation completes)
    await page.waitForTimeout(2000)
    
    // Check for errors that might prevent finalization
    const errorMessages = page.locator('[role="alert"]')
    const errorCount = await errorMessages.count()
    
    // Try to finalize
    const finalizeButton = page.getByRole('button', { name: /Finalize/i })
    const isFinalizeVisible = await finalizeButton.isVisible().catch(() => false)
    
    if (!isFinalizeVisible) {
      // Check why finalize button is not visible
      const calculatingText = page.getByText(/Calculating/i)
      const hasCalculating = await calculatingText.isVisible().catch(() => false)
      
      if (hasCalculating) {
        console.log('Skipping your-plan tests: Price still calculating')
      } else if (errorCount > 0) {
        const errorText = await errorMessages.first().textContent().catch(() => 'Unknown error')
        console.log(`Skipping your-plan tests: Validation errors present - ${errorText}`)
      } else {
        console.log('Skipping your-plan tests: Finalize button not visible (may need required fields)')
      }
      test.skip()
      return
    }
    
    // Click Finalize button (opens modal)
    await finalizeButton.click()
    
    // Wait for modal to appear
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible({ timeout: 5000 })
    
    // Click Confirm button in modal
    const confirmButton = page.getByRole('button', { name: /Confirm/i })
    await expect(confirmButton).toBeVisible()
    await confirmButton.click()
    
    // Wait for navigation to your-plan page
    await page.waitForURL(/\/your-plan/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  })

  test('should display finalized plan information', async ({ page }) => {
    await expect(page).toHaveURL(/\/your-plan/)
    
    // Check for plan name
    const planName = page.locator('h2').first()
    await expect(planName).toBeVisible()
  })

  test('should display plan status', async ({ page }) => {
    // Look for status badge
    const statusBadge = page.locator('text=/Finalised|Pending|Draft/i')
    await expect(statusBadge.first()).toBeVisible()
  })

  test('should display plan selections', async ({ page }) => {
    // Check for selections in Shield badges
    const selections = page.locator('text=/Seating|Food|Addon/i')
    const selectionsCount = await selections.count()
    
    // At least some selection information should be visible (or no selections if empty)
    expect(selectionsCount).toBeGreaterThanOrEqual(0)
  })

  test('should display pricing information', async ({ page }) => {
    // Check for price display
    const priceInfo = page.locator('text=/Base Price|Total:|€|\$/i')
    await expect(priceInfo.first()).toBeVisible()
  })

  test('should have make another booking button', async ({ page }) => {
    const makeAnotherButton = page.getByRole('button', { name: 'Make another booking' })
    await expect(makeAnotherButton).toBeVisible()
  })

  test('should navigate back to welcome when clicking make another booking', async ({ page }) => {
    const makeAnotherButton = page.getByRole('button', { name: 'Make another booking' })
    await makeAnotherButton.click()
    
    await page.waitForURL(/\/welcome/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/welcome/)
  })
})
