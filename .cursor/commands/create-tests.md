# Create tests

## Overview

Create consistent behavioral tests following company best practices for testing.

## Steps

1. Determine if the file received as input is a javascript/typescript file. If not, explain to the user that this command only generates tests for React or Typescript/JavaScript frontend applications or APIs. It supports Nextjs-based projects.

2. Determine if the file received as input is a React component or an backend API. Follow the [API Tests Principles](#api-tests-principles) or the [React Tests Principles](#react-tests-principles) and implement the tests requested.

3. Explore the codebase package.json to understand how to: launch the tests, calculate code coverage, run typecheck and run linter.

4. Use the previous scripts/commands to launch the created tests and check all are passing, with 100% of code coverage, without linting errors and without type errors.

5. Show to the user a summary of tests created and achieved code coverage. The final message with the summary MUST include ONLY: the test cases (tests' names), the code coverage achieved, the linter status and the typecheck status. Don't explain the patterns applied. Be accurate in the response.

## API Tests Principles

### 1. File structure & imports

- Create a co-located `*.test.tsx` per component.
- Follow TypeScript and RTL best practices. Code must be in English.

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "./api-handler";

// Mock external dependencies first
jest.mock("@external/webapp-constants", () => ({
  Stage: { TEST: "TEST" },
  stageFromString: () => "TEST",
  CompanyHeader: {
    CUSTOM-HEADER: "a-token",
  },
}));

// then local dependencies
jest.mock("@/utils/webapp-metrics", () => ({
  webappMetricsLogger: {
    logApiError: jest.fn(),
    logApiSuccess: jest.fn(),
  },
}));
```

### 2. Response mock factory

- Create a reusable response factory for consistent testing:

```typescript
function createRes() {
  const res: Partial<NextApiResponse> & {
    statusCode?: number;
    body?: unknown;
  } = {};
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res as NextApiResponse;
  });
  res.json = jest.fn().mockImplementation((payload: unknown) => {
    res.body = payload;
    return res as NextApiResponse;
  });
  res.setHeader = jest.fn();
  return res as NextApiResponse & { body: unknown };
}
```

### 3. Test organization with nested describes

- First-level describe has the endpoint path. Describe the scenario-response in the tests.

Example:

```typescript
describe("/api/endpoint", () => {
  describe("when the event id query parameter is invalid", () => {
    it("returns 400 (Bad Request) if the event id is an array", async () => {
      // test implementation
    });

    it("returns 400 (Bad Request) if the event id is a non-numeric string", async () => {
      // test implementation
    });

    it("returns 400 (Bad Request) if the event id is zero", async () => {
      // test implementation
    });

    it("returns 400 (Bad Request) if the event id is negative", async () => {
      // test implementation
    });
  });

  describe("when the event id query parameter is valid", () => {
    it("returns 200 (OK) with data when service succeeds", async () => {
      // test implementation
    });

    it("returns 404 (Not Found) when resource does not exist", async () => {
      // test implementation
    });

    it("returns 503 (Service Unavailable) when upstream service fails", async () => {
      // test implementation
    });
  });
});
```

### 4. AAA Pattern with Visual Separation

- Arrange: set up the scenario (input data, mocks/stubs, component render, initial state).
- Act: perform the action that triggers the behavior (user click, form submit, function call).
- Assert: verify the externally observable result (text on screen, returned value, URL change, etc.), avoiding internal details.

```typescript
it("returns 200 (OK) with mapped events if related events are found and hydrated successfully", async () => {
  // Arrange
  searchClient.getRelatedEvents.mockResolvedValue({
    events: [{ id: "456", name: "Related Event" }],
  });
  hydrationClient.hydrateEvents.mockResolvedValue({
    events: [
      {
        id: "456",
        name: "Related Event",
        url: "https://example.com/event/456",
        imageUrl: "https://example.com/image.jpg",
        startDate: "2024-01-01",
        startTime: "10:00",
        timezone: "UTC",
        isFree: false,
        isOnlineEvent: false,
        formattedPriceString: "$10.00",
        venue: { name: "Test Venue" },
        urgencySignals: [],
        specialDiscounts: [],
      },
    ],
    unrecoverableEventIds: [],
  });
  const req = {
    method: "GET",
    query: { eventId: "123" },
    headers: { "cp-soa-token": "test-token", "cp-user-id": "user-123" },
  } as unknown as NextApiRequest;
  const res = createRes();

  // Act
  await handler(req, res);

  // Assert
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.body).toEqual({
    events: [
      {
        id: "456",
        name: "Related Event",
        url: "https://example.com/event/456",
        imageUrl: "https://example.com/image.jpg",
        startDate: "2024-01-01",
        startTime: "10:00",
        timezone: "UTC",
        isFree: false,
        isOnlineEvent: false,
        formattedPriceString: "$10.00",
        venue: { name: "Test Venue" },
        urgencySignals: [],
        specialDiscounts: [],
        isPromoted: false,
      },
    ],
    unrecoverableEventIds: [],
  });
});
```

**AAA Pattern Rules:**

- No blank lines within sections
- One blank line between sections
- Arrange: Setup mocks, create request/response objects, prepare test data
- Act: Call the handler function
- Assert: Verify response status, body, and service calls

### 5. Naming Conventions

- **Never use "should"** - use present tense descriptions
- **Include HTTP status codes** - "returns 400 (Bad Request)". Use this approach to name all tests.
- **Be specific about conditions** - "when the event id query parameter is invalid"
- **Describe the expected outcome** - "with empty events if no related events are found"
- **Talk in product-behavior terms** - Avoid using technical language in the tests description. Example: instead of saying "when all values are true", say "when event search filters are present". We don't want to couple the tests names to the concrete implementation, express the "what" instead of the "how".

```typescript
// ✅ Good
it("returns 400 (Bad Request) if the event id is an array", () => {});
it("returns 200 (OK) with empty events if no related events are found", () => {});
it("returns 503 (Service Unavailable) if the search service throws an error", () => {});

// ❌ Bad
it("should return 400 if event id is array", () => {});
it("should return 200 with empty events", () => {});
it("should handle service errors", () => {});
```

### 6. Common test patterns

#### Input Validation Tests

```typescript
describe("when the event id query parameter is invalid", () => {
  it("returns 400 (Bad Request) if the event id is an array", async () => {
    const req = {
      method: "GET",
      query: { eventId: ["1", "2"] },
      headers: { "cp-soa-token": "test-token", "cp-user-id": "user-123" },
    } as unknown as NextApiRequest;
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({ error: "Invalid event id" });
  });

  it("returns 400 (Bad Request) if the event id is a non-numeric string", async () => {
    const req = {
      method: "GET",
      query: { eventId: "abc" },
      headers: { "cp-soa-token": "test-token", "cp-user-id": "user-123" },
    } as unknown as NextApiRequest;
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body).toEqual({ error: "Invalid event id" });
  });
});
```

#### Success Response Tests

```typescript
it("returns 200 (OK) with active urgency signals if the event exists and has active urgency signals", async () => {
  api.getUrgencySignalsEventBatch.mockResolvedValue({
    results: [
      { id: "123", signals: { new: true, popular: false, fewTickets: true } },
    ],
    notFoundEventIds: [],
  });
  const req = {
    method: "GET",
    query: { eventId: "123" },
  } as unknown as NextApiRequest;
  const res = createRes();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.body).toEqual(expect.arrayContaining(["new", "fewTickets"]));
});
```

#### Error Handling Tests

```typescript
it("returns 503 (Service Unavailable) if the search service throws an error", async () => {
  searchClient.getRelatedEvents.mockRejectedValue({
    error: { message: "Search service error" },
  });
  const req = {
    method: "GET",
    query: { eventId: "123" },
    headers: {
      "company-soa-token": "test-token",
      "company-user-id": "user-123",
    },
  } as unknown as NextApiRequest;
  const res = createRes();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(503);
  expect(res.body).toEqual({ error: "Unknown error" });
});
```

#### Not Found Tests

```typescript
it("returns 404 (Not Found) if the event id is informed as not found", async () => {
  api.getUrgencySignalsEventBatch.mockResolvedValue({
    results: [],
    notFoundEventIds: ["123"],
  });
  const req = {
    method: "GET",
    query: { eventId: "123" },
  } as unknown as NextApiRequest;
  const res = createRes();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.body).toEqual({ error: "Event not found", eventId: "123" });
});
```

#### Service Integration Tests

- Check that the external dependencies are called with the right data, at the right time, in the right order, and following right paralellism/sequence.

```typescript
it("calls search service with correct parameters", async () => {
  searchClient.getRelatedEvents.mockResolvedValue({
    events: [],
  });
  const req = {
    method: "GET",
    query: { eventId: "123" },
    headers: {
      "company-soa-token": "test-token",
      "company-user-id": "user-123",
    },
  } as unknown as NextApiRequest;
  const res = createRes();

  await handler(req, res);

  expect(searchClient.getRelatedEvents).toHaveBeenCalledWith({
    body: {
      event_id: "123",
      page_size: 4, // DEFAULT_MAX_EVENTS
    },
    context: {
      auth_token: "test-token",
    },
  });
});
```

#### Caching Tests

- Test the caching behavior.

```typescript
it("caches the response for 5 minutes fresh, 5 minutes stale while revalidating, 5 minutes stale if error", async () => {
  searchClient.getRelatedEvents.mockResolvedValue({
    events: [],
  });
  const req = {
    method: "GET",
    query: { eventId: "123" },
    headers: {
      "company-soa-token": "test-token",
      "company-user-id": "user-123",
    },
  } as unknown as NextApiRequest;
  const res = createRes();

  await handler(req, res);

  expect(res.setHeader).toHaveBeenCalledWith(
    "Cache-Control",
    "public, max-age=300, stale-while-revalidate=300, stale-if-error=300",
  );
});
```

#### Circuit Breaker Tests

```typescript
it("calls Urgency Signals through the circuit breaker", async () => {
  api.getUrgencySignalsEventBatch.mockResolvedValue({
    results: [{ id: "123", signals: { new: true } }],
    notFoundEventIds: [],
  });
  const req = {
    method: "GET",
    query: { eventId: "123" },
  } as unknown as NextApiRequest;
  const res = createRes();
  const { executeMock } = jest.requireMock("cockatiel");

  await handler(req, res);

  expect(executeMock).toHaveBeenCalledTimes(1);
  expect(api.getUrgencySignalsEventBatch).toHaveBeenCalledWith({
    eventIds: "123",
  });
  expect(res.status).toHaveBeenCalledWith(200);
});
```

### 7. Mock Strategy for External Services

#### Service Client Mocks

```typescript
const searchClient = { getRelatedEvents: jest.fn() };
const hydrationClient = { hydrateEvents: jest.fn() };

jest.mock("@external/search-service-client", () => ({
  buildSearchServiceClient: jest.fn(() => searchClient),
}));

jest.mock("./utils", () => ({
  createEventHydrationClient: jest.fn(() => hydrationClient),
}));
```

#### Circuit Breaker Mocks

```typescript
jest.mock("cockatiel", () => {
  const executeMock = jest.fn(async (fn: () => Promise<unknown>) => await fn());
  const circuitBreakerMock = jest.fn(() => ({ execute: executeMock }));
  return {
    circuitBreaker: circuitBreakerMock,
    handleAll: Symbol("handleAll"),
    SamplingBreaker: function () {},
    executeMock,
    circuitBreakerMock,
  };
});
```

### 8. Environment Setup

- Take into account the environment initialization and put it at the top "beforeEach".

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  process.env.STAGE = "TEST";
  process.env.API_KEY = "test-api-key";
  process.env.EVENT_HYDRATION_SERVICE_API_KEY = "test-api-key";
});
```

### 9. Best Practices Checklist

- [ ] Mock all external dependencies and service clients
- [ ] Use nested `describe` blocks for grouping related tests
- [ ] Follow AAA pattern with visual separation
- [ ] Never use "should" in test descriptions
- [ ] Include HTTP status codes in test names
- [ ] Test all input validation scenarios
- [ ] Test success and error responses
- [ ] Test service integration with correct parameters
- [ ] Test caching headers
- [ ] Test circuit breaker functionality
- [ ] Clear mocks in `beforeEach`
- [ ] Use consistent request/response factory functions
- [ ] Test both happy path and error scenarios
- [ ] Verify metrics logging calls
- [ ] Test different error types and messages

### 10. Common Assertions

```typescript
// Response status
expect(res.status).toHaveBeenCalledWith(200);
expect(res.status).toHaveBeenCalledWith(400);
expect(res.status).toHaveBeenCalledWith(404);
expect(res.status).toHaveBeenCalledWith(503);

// Response body
expect(res.body).toEqual({ error: "Invalid event id" });
expect(res.body).toEqual(expect.arrayContaining(["new", "fewTickets"]));
expect(res.body).toEqual({
  events: expect.arrayContaining([
    expect.objectContaining({
      id: "456",
      name: "Related Event",
    }),
  ]),
  unrecoverableEventIds: [],
});

// Service calls
expect(searchClient.getRelatedEvents).toHaveBeenCalledWith({
  body: { event_id: "123", page_size: 4 },
  context: { auth_token: "test-token" },
});
expect(searchClient.getRelatedEvents).toHaveBeenCalledTimes(1);
expect(searchClient.getRelatedEvents).not.toHaveBeenCalled();

// Headers
expect(res.setHeader).toHaveBeenCalledWith(
  "Cache-Control",
  "public, max-age=300, stale-while-revalidate=300, stale-if-error=300",
);

// Metrics logging
expect(webappMetricsLogger.logApiSuccess).toHaveBeenCalledWith(
  expect.any(String),
  expect.any(Object),
  expect.any(Number),
  "GET",
  200,
);
```

### 11. Test Data Patterns

#### Request Factory

```typescript
const createRequest = (overrides = {}) =>
  ({
    method: "GET",
    query: { eventId: "123" },
    headers: {
      "company-soa-token": "test-token",
      "company-user-id": "user-123",
    },
    ...overrides,
  }) as unknown as NextApiRequest;
```

#### Mock Response Data

```typescript
const mockSearchResponse = {
  events: [{ id: "456", name: "Related Event" }],
};

const mockHydrationResponse = {
  events: [
    {
      id: "456",
      name: "Related Event",
      url: "https://example.com/event/456",
      imageUrl: "https://example.com/image.jpg",
      startDate: "2024-01-01",
      startTime: "10:00",
      timezone: "UTC",
      isFree: false,
      isOnlineEvent: false,
      formattedPriceString: "$10.00",
      venue: { name: "Test Venue" },
      urgencySignals: [],
      specialDiscounts: [],
    },
  ],
  unrecoverableEventIds: [],
};
```

## React Tests Principles

### 1. File Structure & Imports: follow this order.

- Create a co-located `*.test.tsx` per component.
- Follow TypeScript and RTL best practices. Code must be in English.

```typescript
// 1. React Testing Library imports
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// 2. Component under test
import { ComponentName } from "./ComponentName";

// 3. Dependencies and utilities
import { someUtility } from "@/utils/someUtility";
import { someContext } from "@/components/_shared/contexts/SomeContext";

// 4. External libraries
import "@testing-library/jest-dom";
```

### 2. Mocking strategy

Always mock external dependencies, utilities, and child components when they are complex. Exception: @company/atoms-library components from the design system won't be mocked.

- Mock external libraries, complex child components, and utilities/contexts.
- Tests should not mention HTTP mocking explicitly.
- Clear/reset mocks between tests.

Examples:

```typescript
// Mock external libraries
jest.mock('react-intl', () => ({
  FormattedMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }) =>
    <span>{defaultMessage ?? id}</span>,
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) => defaultMessage,
  }),
}));

// Mock child components with meaningful test implementations
jest.mock('./ChildComponent/ChildComponent', () => ({
  ChildComponent: jest.fn((props) =>
    <div data-testid="child-component" data-props={JSON.stringify(props)} />
  ),
}));

// Mock utilities and contexts
jest.mock('@/utils/authentication', () => ({
  isUserAuthenticated: jest.fn(),
}));
```

### 3. Test organization with nested describes

- Use nested `describe` blocks to express scenarios and sub-scenarios.

Example:

```typescript
describe("Component name", () => {
  it("renders the ticket information", () => {
    // test implementation
  });

  describe("when user is authenticated", () => {
    beforeEach(() => {
      (isUserAuthenticated as jest.Mock).mockReturnValue(true);
    });

    it("creates the order when button is clicked", () => {
      // test implementation
    });
  });

  describe("when the API fails", () => {
    it("handles errors gracefully by showing the empty state", () => {
      // test implementation
    });
  });
});
```

### 4. AAA Pattern with visual separation

- Arrange: set up the scenario (input data, mocks/stubs, component render, initial state).
- Act: perform the action that triggers the behavior (user click, form submit, function call).
- Assert: verify the externally observable result (text on screen, returned value, URL change, etc.), avoiding internal details.

```typescript
it('creates the reminder and shows the confirmation modal', async () => {
  // Arrange
  (isUserAuthenticated as jest.Mock).mockReturnValue(true);
  (remind as jest.Mock).mockResolvedValue(undefined);
  render(<RemindMe />);

  // Act
  const button = screen.getByRole('button', { name: /remind me/i });
  fireEvent.click(button);

  // Assert
  await waitFor(() => {
    expect(remind).toHaveBeenCalledWith('event123');
  });
  await waitFor(() => {
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Reminder set!')).toBeInTheDocument();
  });
});
```

**Important note**: in the tests we MUST NOT add code comments with "//Arrange", "//Act" or "//Assert", added here for learning purpose.

**AAA Pattern Rules:**

- No blank lines within sections
- One blank line between sections
- Arrange: Setup mocks, render component, prepare test data
- Act: Perform main user interaction or event trigger that we are testing in this test
- Assert: Verify outcomes with multiple specific expectations

### 5. Naming conventions

- **Never use "should"** - use present tense descriptions
- **Be specific and behavioral** - describe what the component does in product terms, a Product Manger should understand the behavior of the UI or what it's happening from behavior point of view.
- **Use descriptive action words** - "renders", "calls", "shows", "handles"

```typescript
// ✅ Good
it("renders the create remind button", () => {});
it("does NOT show the tickets if the event is private", () => {});
it("shows the loading spinner when reminder creation is in progress", () => {});

// ❌ Bad
it("should render the remind button", () => {});
it("should call the API", () => {});
it("should show loading", () => {});
```

### 6. Common test patterns

#### Mock Data Setup

```typescript
const mockBasicInfo = {
  organizer: { name: "Test Organizer", id: "org123" },
  id: "event123",
};

const baseProps = {
  venueName: "ACME Hall",
  venueMultilineAddress: ["123 Main St", "Springfield, USA"],
  location: { latitude: 40.4168, longitude: -3.7038 },
  gMapsApiKey: "abc123",
};
```

#### Conditional rendering tests

```typescript
it('renders the online location when the event is online', () => {
  render(<Location location={{ isOnlineEvent: true }} />);

  expect(screen.getByTestId('OnlineLocation')).toBeInTheDocument();
  expect(screen.queryByTestId('InPersonLocation')).not.toBeInTheDocument();
});
```

#### User Interaction Tests

```typescript
it('changes the active tab when a different tab is selected', async () => {
  const tabs = createTabs();
  render(<Content tabs={tabs} />);

  await userEvent.click(screen.getByRole('tab', { name: 'Day 2' }));

  expect(screen.getByTestId('slots').textContent).toContain('"title":"c"');
  expect(screen.getByTestId('slots').textContent).not.toContain('"title":"a"');
});
```

#### API Integration Tests

```typescript
it('creates the reminder and shows the confirmation modal when user is authenticated', async () => {
  (isUserAuthenticated as jest.Mock).mockReturnValue(true);
  render(<RemindMe />);

  const button = screen.getByRole('button', { name: /remind me/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(remind).toHaveBeenCalledWith('event123');
  });
  await waitFor(() => {
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });
});
```

#### Error handling tests

```typescript
describe('when the remind API fails', () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('handles API errors gracefully during remind and disables the create reminder button', async () => {
    (remind as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<RemindMe />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
```

### 7. Test data factories

- Provide small factory helpers for repetitive props/fixtures.

```typescript
const createTabs = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ name: `Tab ${i + 1}`, slots: [] }));

const createTabs = (): Tab[] => [
  { name: "Day 1", slots: [{ title: "a" }, { title: "b" }] },
  { name: "Day 2", slots: [{ title: "c" }] },
  { name: "Day 3", slots: [] },
];
```

### 8. Best Practices Checklist

- [ ] Mock all external dependencies and child components
- [ ] Use nested `describe` blocks for grouping related tests
- [ ] Follow AAA pattern with visual separation
- [ ] Never use "should" in test descriptions
- [ ] Use specific, behavioral test names
- [ ] Clear mocks in `beforeEach`
- [ ] Use `waitFor` for async operations
- [ ] Use `userEvent` for user interactions
- [ ] Write specific assertions, not generic ones
- [ ] Test both success and error scenarios
- [ ] Keep tests independent and isolated
- [ ] Use test data factories for complex objects

### 9. Common Assertions

```typescript
// Element presence
expect(screen.getByRole("button", { name: /remind me/i })).toBeInTheDocument();
expect(screen.queryByRole("button")).not.toBeInTheDocument();

// API calls
expect(remind).toHaveBeenCalledWith("event123");
expect(remind).toHaveBeenCalledTimes(1);
expect(remind).not.toHaveBeenCalled();

// Element attributes
expect(button).toHaveAttribute("aria-disabled", "true");
expect(link).toHaveAttribute("href", "https://example.com");
expect(link).toHaveAttribute("target", "_blank");

// Text content
expect(screen.getByText("Reminder set!")).toBeInTheDocument();
expect(screen.getByTestId("slots").textContent).toContain('"title":"c"');

// Element properties
expect(button).toHaveClass("primary");
expect(container.firstChild).toBeNull();
```
