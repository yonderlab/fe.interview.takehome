# Frontend Implementation Details

This document describes the implementation of the Event Package Builder frontend application.

## Tech Stack

- **Vite**, **React Router v7**, **Tailwind CSS**
- **Vitest + React Testing Library** - Unit testing
- **Playwright** - End-to-end testing

## Application Overview

The application consists of **four steps**, implemented as a single-page flow.

### 1. Plan Selection (`/welcome`)

Users define a few initial parameters and pick a base plan from the resulting list.

- All selections are reflected in **URL parameters**, which act as the single source of truth.
- When navigating back to this step, the app preserves the existing configuration as long as the same plan is selected.
- Selecting a different plan resets any plan-specific options.

### 2. Customize Plan (`/customize-plan`)

Users configure the selected plan by choosing available options and add-ons.

- All configuration state is managed via **URL parameters**
- Invalid or unsupported parameters are automatically removed from the URL

#### Pricing behavior

- The price estimate updates automatically in response to user input
- Requests are sent only when the configuration is valid
- The estimate remains synchronized with the server via polling

#### Customization rules

- Options with only one possible value are not shown in the UI and are automatically included in the request
- Add-ons with a price of zero are always visible and selected

This way, free add-ons are presented as a gift rather than a decision point.

### 3. Finalize Plan

Clicking **Finalize** opens a review modal with the full plan summary.

The data in the modal remains live and up to date, allowing the user to double-check the configuration before confirming or returning to previous steps.

### 4. **Your Plan** (`/your-plan`)

This page displays the finalized plan along with its current status.

The price is fixed at this stage. From here, the user can return to the main flow and start over if needed.

## Testing

- **Unit tests** - Component and utility function tests
- **E2E tests** - Full user flow tests with Playwright

## Architecture Notes & Trade-offs

### URL-driven state

The application relies on **URL parameters as the primary source of state** across all steps.

This approach increases the complexity of synchronizing URL parameters with local component state. However, it also makes the application fully shareable, allows users to navigate freely between steps, and helps prevent invalid or inconsistent configurations – a fair trade-off in this context.

### Live estimate update

Given that price has to stay in sync with the server anyway, the estimate is updated live as the configuration changes.

From a technical perspective, price synchronization is already handled via polling, so keeping the estimate live comes almost for free. At the same time, this provides immediate feedback to the user and makes changes easier to reason about as they happen.

To avoid unnecessary requests, estimate calls are triggered only when the configuration is complete and valid. Incomplete or invalid states are handled through clear, user-facing messaging.

### Plan search triggering on the Welcome step

On the Welcome step, fetching available plans is triggered via an explicit **Search** action.

Auto-fetching on every input change would require additional synchronization and request management, which would be overkill within the time constraints of this exercise. Using an explicit trigger keeps the logic simple and predictable.

Switching to live fetching could be a good follow-up to explore, potentially reusing request and validation logic from later steps and resulting in a smoother user experience.
