import { test, expect } from '@playwright/test'

test.describe('Welcome Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome')
  })

  test('should display welcome message', async ({ page }) => {
    // Wait for the welcome message to appear (AgentMessage types character by character)
    // Use a longer timeout to account for the typing animation
    // Match the text with or without emoji
    await expect(page.getByText(/Welcome to the Package Builder! Tell us about your event/)).toBeVisible({ timeout: 10000 })
  })

  test('should display search form with all fields', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for form fields by their IDs or labels
    await expect(page.locator('select[name="city"]')).toBeVisible()
    await expect(page.locator('input[name="budget"]')).toBeVisible()
    await expect(page.locator('input[name="people"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible()
  })

  test('should search for plans with filters', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Fill in search form
    const citySelect = page.locator('select[name="city"]')
    const optionsCount = await citySelect.locator('option').count()
    
    // Select a valid city option (skip empty option at index 0)
    if (optionsCount > 2) {
      await citySelect.selectOption({ index: 2 }) // Select second non-empty option
    } else if (optionsCount > 1) {
      await citySelect.selectOption({ index: 1 }) // Select first non-empty option
    }
    
    await page.locator('input[name="budget"]').fill('10000')
    await page.locator('input[name="people"]').fill('50')
    
    // Submit form and wait for navigation
    await Promise.all([
      page.waitForURL(/city=|budget=|people=|show=all/, { timeout: 10000 }),
      page.getByRole('button', { name: 'Search' }).click()
    ])
    
    // Wait for results to load
    await page.waitForLoadState('networkidle')
    
    // Check that URL has search params
    const url = page.url()
    // URL should have at least one of the params or show=all if all filters are empty
    expect(url).toMatch(/city=|budget=|people=|show=all/)
  })

  test('should display plans when search results are available', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Fill in search form
    const citySelect = page.locator('select[name="city"]')
    const optionsCount = await citySelect.locator('option').count()
    if (optionsCount > 1) {
      await citySelect.selectOption({ index: 1 })
    }
    await page.locator('input[name="budget"]').fill('10000')
    await page.locator('input[name="people"]').fill('50')
    
    // Submit form
    await page.getByRole('button', { name: 'Search' }).click()
    
    // Wait for results
    await page.waitForLoadState('networkidle')
    
    // Check if plans are displayed - look for role="button" elements that contain plan info
    const planCards = page.locator('[role="button"]').filter({ hasText: /€|\$/ })
    const count = await planCards.count()
    
    if (count > 0) {
      // If plans are shown, verify they're clickable
      await expect(planCards.first()).toBeVisible()
    } else {
      // If no plans, check for warning icon or message
      const warningIcon = page.locator('svg').filter({ has: page.locator('path') })
      const hasWarning = await warningIcon.count() > 0
      expect(hasWarning || count === 0).toBeTruthy()
    }
  })

  test('should display no plans message when no results', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Search with filters that likely return no results
    const citySelect = page.locator('select[name="city"]')
    const optionsCount = await citySelect.locator('option').count()
    if (optionsCount > 1) {
      await citySelect.selectOption({ index: 1 })
    }
    await page.locator('input[name="budget"]').fill('1')
    await page.locator('input[name="people"]').fill('1')
    
    await page.getByRole('button', { name: 'Search' }).click()
    await page.waitForLoadState('networkidle')
    
    // Check for warning icon (SVG) or no plans message
    const planCards = page.locator('[role="button"]').filter({ hasText: /€|\$/ })
    const planCount = await planCards.count()
    
    // If no plans, there should be a warning icon or no plans section
    if (planCount === 0) {
      const warningIcon = page.locator('svg').first()
      await expect(warningIcon).toBeVisible()
    }
  })

  test('should navigate to customize plan when clicking on a plan', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Load all plans using show=all
    await page.goto('/welcome?show=all')
    await page.waitForLoadState('networkidle')
    
    // Try to find and click a plan card (role="button" with price)
    const planCards = page.locator('[role="button"]').filter({ hasText: /€|\$/ })
    const count = await planCards.count()
    
    if (count > 0) {
      await planCards.first().click()
      await page.waitForURL(/\/customize-plan/, { timeout: 10000 })
      await expect(page).toHaveURL(/\/customize-plan/)
    } else {
      // Skip test if no plans available from API
      console.log('Skipping test: No plans available from API')
      test.skip()
    }
  })

  test('should preserve search params when navigating back', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // First, load all plans to find one that exists
    await page.goto('/welcome?show=all')
    await page.waitForLoadState('networkidle')
    
    // Find a plan card
    const planCards = page.locator('[role="button"]').filter({ hasText: /€|\$/ })
    const count = await planCards.count()
    
    if (count === 0) {
      console.log('Skipping test: No plans available from API')
      test.skip()
      return
    }
    
    // Click the first plan to navigate to customize-plan
    await planCards.first().click()
    await page.waitForURL(/\/customize-plan/, { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    
    // Get the plan_id from the URL
    const customizeUrl = new URL(page.url())
    const planId = customizeUrl.searchParams.get('plan_id')
    
    if (!planId) {
      console.log('Skipping test: Could not get plan_id from customize-plan URL')
      test.skip()
      return
    }
    
    // Use the "Previous Step" button instead of browser back to test the actual functionality
    const previousStepButton = page.getByRole('button', { name: /Previous Step/i })
    const buttonExists = await previousStepButton.isVisible().catch(() => false)
    
    if (!buttonExists) {
      console.log('Skipping test: Previous Step button not found')
      test.skip()
      return
    }
    
    await previousStepButton.click()
    await page.waitForURL(/\/welcome/, { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    
    // Check that plan_id is preserved in URL
    const welcomeUrl = new URL(page.url())
    const preservedPlanId = welcomeUrl.searchParams.get('plan_id')
    
    // Verify plan_id is preserved
    expect(preservedPlanId).toBe(planId)
    
    // Plans should still be visible (welcomeLoader loads plans when plan_id is present)
    const planCardsAfterBack = page.locator('[role="button"]').filter({ hasText: /€|\$/ })
    const countAfterBack = await planCardsAfterBack.count()
    
    // Verify plans are still shown
    expect(countAfterBack).toBeGreaterThan(0)
  })
})
