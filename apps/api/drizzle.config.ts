import { defineConfig } from "drizzle-kit";

// Default database URL (relative to apps/api directory)
// The .data directory will be created automatically by the runtime code
const defaultDbUrl = "file:.data/dev.db";
const dbUrl = process.env.DATABASE_URL ?? defaultDbUrl;

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl,
  },
});
