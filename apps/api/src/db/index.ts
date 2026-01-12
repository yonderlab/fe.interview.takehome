import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Compute stable default DB URL relative to apps/api directory
// This works regardless of where the process is started from
const getDefaultDbUrl = (): string => {
  // Go up from src/db/index.ts to apps/api
  const apiRoot = join(__dirname, "..", "..");
  const dataDir = join(apiRoot, ".data");
  mkdirSync(dataDir, { recursive: true });
  return `file:${join(dataDir, "dev.db")}`;
};

const dbUrl = process.env.DATABASE_URL ?? getDefaultDbUrl();

const client = createClient({
  url: dbUrl,
});

export const db = drizzle(client);
