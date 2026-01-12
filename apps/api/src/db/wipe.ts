import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync, unlinkSync, rmSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get the database file path from environment or default location
 */
function getDbPath(): string {
  const dbUrl = process.env.DATABASE_URL;
  
  if (dbUrl && dbUrl.startsWith("file:")) {
    // Extract path from file: URL
    return dbUrl.replace("file:", "");
  }
  
  if (dbUrl) {
    // If it's not a file: URL, assume it's already a path
    return dbUrl;
  }
  
  // Default location
  const apiRoot = join(__dirname, "..", "..");
  return join(apiRoot, ".data", "dev.db");
}

/**
 * Wipe the database file
 */
export function wipeDatabase(): void {
  const dbPath = getDbPath();
  
  if (existsSync(dbPath)) {
    unlinkSync(dbPath);
    console.log(`✓ Database file deleted: ${dbPath}`);
  } else {
    console.log(`ℹ Database file not found: ${dbPath}`);
  }
  
  // Also clean up any WAL/SHM files that SQLite might create
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;
  
  if (existsSync(walPath)) {
    unlinkSync(walPath);
    console.log(`✓ WAL file deleted: ${walPath}`);
  }
  
  if (existsSync(shmPath)) {
    unlinkSync(shmPath);
    console.log(`✓ SHM file deleted: ${shmPath}`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  wipeDatabase();
}
