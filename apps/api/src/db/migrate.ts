import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run migrations on startup.
 * This function resolves the migrations folder relative to the current file location,
 * so it works in both dev (tsx) and prod (node dist) environments.
 */
export async function migrateOnStartup(): Promise<void> {
  // Resolve migrations folder relative to apps/api directory
  // From src/db/migrate.ts -> apps/api/drizzle
  const apiRoot = join(__dirname, "..", "..");
  const migrationsFolder = join(apiRoot, "drizzle");

  try {
    await migrate(db, { migrationsFolder });
    console.log("Database migrations applied successfully");
  } catch (error) {
    console.error("Failed to apply database migrations:", error);
    throw error;
  }
}
