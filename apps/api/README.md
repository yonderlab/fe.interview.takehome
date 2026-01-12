# API

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

**Note:** The SQLite database file will be automatically created at `apps/api/.data/dev.db` and migrations will be applied automatically on startup. No additional setup is required!

## Database

This API uses SQLite with Drizzle ORM. The database file is stored locally at `apps/api/.data/dev.db` by default. You can override the database location by setting the `DATABASE_URL` environment variable (e.g., `DATABASE_URL=file:./custom.db`).

Migrations are automatically applied when the server starts, so the database will always be up-to-date.

## Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run check-types` - Type check the application
- `npm run db:generate` - Generate database migrations from schema changes
- `npm run db:migrate` - Apply pending migrations manually (usually not needed - migrations run automatically on startup)
- `npm run db:studio` - Open Drizzle Studio to browse the database
- `npm run db:wipe` - Delete the database file (useful for testing or starting fresh)
- `npm run db:reset` - Wipe the database and recreate it with migrations (clean slate)
