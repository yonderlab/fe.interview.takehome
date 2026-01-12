# Event Ticketing System - Take Home Assessment

A Turborepo monorepo containing the backend API for an event ticketing system. This repository is designed for frontend take-home assessments where candidates build a frontend against the provided backend API.

## Overview

This monorepo contains a complete backend API implementation for an event ticketing system. The API manages providers, plans, options, add-ons, and estimates with dynamic configuration capabilities.

## What's Inside

### Apps

- **`apps/api`** - Event Ticketing Backend API
  - Built with [Hono](https://hono.dev/) and Node.js
  - SQLite database with [Drizzle ORM](https://orm.drizzle.team/)
  - [Zod](https://zod.dev/) validation and [OpenAPI](https://www.openapis.org/) documentation
  - Swagger UI for interactive API exploration
  - Comprehensive test suite (unit + integration tests)

### Documentation

- **`design-doc.md`** - Backend API/DB design guide and specification
- **`fe-interview-brief.md`** - Frontend take-home assessment brief

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 10.9.2

### Installation

```bash
npm install
```

### Development

Start the API server:

```bash
npm run dev
```

Or start a specific app:

```bash
npm run dev --filter=api
```

The API will be available at `http://localhost:3002`.

### API Documentation

- **Swagger UI**: `http://localhost:3002/ui` - Interactive API documentation
- **OpenAPI JSON**: `http://localhost:3002/doc` - Raw OpenAPI 3.0 specification

## Available Scripts

From the root directory:

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps and packages
- `npm run lint` - Run ESLint on all packages
- `npm run check-types` - Type check all packages
- `npm run test` - Run all tests
- `npm run format` - Format code with Prettier

### API-Specific Scripts

See [`apps/api/README.md`](apps/api/README.md) for detailed API documentation and scripts.

## Project Structure

```
take-home/
├── apps/
│   └── api/              # Event Ticketing Backend API
│       ├── src/
│       │   ├── db/       # Database schema, migrations, seeding
│       │   ├── domain/   # Business logic (pricing, validation)
│       │   ├── routes/   # API route handlers
│       │   └── *.test.ts # Test files
│       └── drizzle/      # Database migrations
├── design-doc.md         # Backend design specification
├── fe-interview-brief.md # Frontend assessment brief
└── turbo.json           # Turborepo configuration
```

## API Overview

The Event Ticketing API provides endpoints for:

- **Providers** - List event providers (venues)
- **Plans** - List plans for a provider with options and add-ons
- **Estimates** - Create, update, and finalize event estimates
  - Dynamic plan options (seating types, food packages, date flexibility)
  - Add-ons (AV equipment, photography, VIP hosting)
  - Validation and blocker management
  - Approval workflow support

### Key Features

- **Dynamic Configuration** - Plans expose business-level options without UI schema
- **Server-Side Pricing** - All pricing calculations handled by the backend
- **Validation** - Comprehensive validation with blocking reasons
- **Approval Workflows** - Support for plans requiring manager approval
- **OpenAPI Documentation** - Auto-generated from Zod schemas

## Testing

The API includes comprehensive test coverage:

- **Unit Tests** - Domain logic (pricing, validation)
- **Integration Tests** - Full API endpoint testing

Run tests:

```bash
npm run test
```

See [`apps/api/README.md`](apps/api/README.md) for detailed testing instructions.

## Database

The API uses SQLite with automatic migrations and seeding:

- Database file: `apps/api/.data/dev.db` (created automatically)
- Migrations run automatically on server startup
- Seed data includes 3 providers, 5 plans with varied options/add-ons

## Technology Stack

- **Runtime**: Node.js
- **Framework**: [Hono](https://hono.dev/)
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/) v4
- **API Docs**: OpenAPI 3.0 + Swagger UI
- **Testing**: [Vitest](https://vitest.dev/)
- **Monorepo**: [Turborepo](https://turbo.build/repo)

## For Frontend Candidates

This backend is ready to use for frontend development. See [`fe-interview-brief.md`](fe-interview-brief.md) for the assessment requirements.

The API is fully documented and can be explored via Swagger UI at `http://localhost:3002/ui` once the server is running.

## Learn More

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [OpenAPI Specification](https://www.openapis.org/)
