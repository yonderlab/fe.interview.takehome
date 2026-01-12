# Event Ticketing API

A Hono API application running on Node.js with SQLite database (Drizzle ORM) and Zod validation.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3002`.

**Note:** The SQLite database file will be automatically created at `apps/api/.data/dev.db` and migrations will be applied automatically on startup. Seed data will also be loaded automatically if the database is empty.

## Database

This API uses SQLite with Drizzle ORM. The database file is stored locally at `apps/api/.data/dev.db` by default. You can override the database location by setting the `DATABASE_URL` environment variable (e.g., `DATABASE_URL=file:./custom.db`).

Migrations are automatically applied when the server starts, so the database will always be up-to-date.

## API Endpoints

### List Providers

```
GET /providers
```

Returns a list of all event providers.

**Response:**
```json
{
  "items": [
    {
      "id": "prov_a",
      "name": "Venue A",
      "location": "Berlin",
      "logo_url": "https://example.com/logos/venue-a.svg"
    }
  ]
}
```

### List Plans

```
GET /plans?provider_id=prov_a
```

Returns plans for a specific provider. The `provider_id` query parameter is required.

**Response:**
```json
{
  "items": [
    {
      "id": "plan_a_standard",
      "provider_id": "prov_a",
      "name": "Venue A - Standard",
      "description": "Simple package with no options or add-ons",
      "base_price_cents": 50000,
      "currency": "EUR",
      "approval_type": "none",
      "min_participants": 25,
      "lead_time_days": 14,
      "options": [
        {
          "code": "seating_type",
          "description": "Choose your seating arrangement",
          "required": true,
          "values": ["open", "reserved"]
        }
      ],
      "addons": [
        {
          "id": "addon_av",
          "name": "Extra AV",
          "price_cents": 15000,
          "currency": "EUR"
        }
      ]
    }
  ]
}
```

**Error Response (400):**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Missing required query parameter: provider_id"
  }
}
```

### Get Estimate

```
GET /estimate
```

Returns the current estimate (or creates a default one if none exists).

**Response:**
```json
{
  "id": "est_demo",
  "status": "draft",
  "plan": {
    "id": "plan_a_standard",
    "name": "Venue A - Standard"
  },
  "selections": {
    "addons": [],
    "seating_type": "open"
  },
  "pricing": {
    "base": 50000,
    "addons": 0,
    "total": 50000,
    "currency": "EUR"
  },
  "blocking_reasons": []
}
```

### Update Estimate

```
PUT /estimate
```

Updates the current estimate with a new plan and selections.

**Request Body:**
```json
{
  "plan_id": "plan_a_premium",
  "selections": {
    "seating_type": "reserved",
    "food_package": "full",
    "addons": ["addon_av", "addon_photo"]
  }
}
```

**Response:**
```json
{
  "id": "est_demo",
  "status": "draft",
  "selections": {
    "seating_type": "reserved",
    "food_package": "full",
    "addons": ["addon_av", "addon_photo"]
  },
  "pricing": {
    "base": 70000,
    "addons": 23000,
    "total": 93000,
    "currency": "EUR"
  },
  "blocking_reasons": []
}
```

**Error Response (400):**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Missing required field: seating_type"
  }
}
```

### Finalise Estimate

```
POST /estimate/finalise
```

Finalises the current estimate. If the plan requires approval, the status will be set to `pending_approval`. Otherwise, it will be set to `finalised`.

**Response:**
```json
{
  "id": "est_demo",
  "status": "pending_approval"
}
```

**Error Response (400):**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Cannot finalise estimate: Missing required field: seating_type"
  }
}
```

## Error Format

All errors follow this format:

```json
{
  "error": {
    "code": "validation_error" | "not_found" | "internal_error",
    "message": "Human-readable error message"
  }
}
```

## Testing

The project uses [Vitest](https://vitest.dev/) for testing. Tests are located in `src/**/*.test.ts`.

### Running Tests

- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI for interactive testing
- `npm run test:coverage` - Run tests with coverage report

### Test Types

1. **Unit Tests** (`src/domain/*.test.ts`):
   - Test domain logic (pricing computation, validation)
   - Use a separate test database (`.data/test.db`)
   - Automatically set up and tear down test data

2. **Integration Tests** (`src/api.test.ts`):
   - Test API endpoints against a running server
   - Requires the server to be running (`npm run dev`)
   - Tests all endpoints with real HTTP requests

### Running Integration Tests

Integration tests require the server to be running:

```bash
# Terminal 1: Start the server
npm run dev

# Terminal 2: Run integration tests
npm run test -- src/api.test.ts
```

Or run all tests (unit + integration) with the server running:

```bash
npm run test
```

## Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run check-types` - Type check the application
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Run tests with coverage
- `npm run db:generate` - Generate database migrations from schema changes
- `npm run db:migrate` - Apply pending migrations manually (usually not needed - migrations run automatically on startup)
- `npm run db:studio` - Open Drizzle Studio to browse the database
- `npm run db:wipe` - Delete the database file (useful for testing or starting fresh)
- `npm run db:reset` - Wipe the database and recreate it with migrations (clean slate)

## CORS

CORS is enabled for all routes to allow local frontend development. The API accepts requests from any origin.

## OpenAPI Documentation

The API includes automatic OpenAPI/Swagger documentation generated from Zod schemas.

### Swagger UI

Interactive API documentation is available at:

```
GET /ui
```

Visit `http://localhost:3002/ui` in your browser to explore the API with Swagger UI. You can test endpoints directly from the browser.

### OpenAPI JSON

The raw OpenAPI 3.0 specification in JSON format is available at:

```
GET /doc
```

This endpoint returns the OpenAPI specification that can be used with tools like:
- [Scalar](https://scalar.com/)
- [Postman](https://www.postman.com/) (import OpenAPI spec)
- Other OpenAPI-compatible tools

Example: View the JSON spec at `http://localhost:3002/doc`

## Seed Data

The database is automatically seeded on startup with:

- 3 providers (Venue A, Venue B, Venue C)
- 5 plans with varying options and add-ons
- A default draft estimate

Seed data uses human-readable IDs (e.g., `prov_a`, `plan_a_standard`) for easier debugging during take-home assessments.
