import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { migrateOnStartup } from "./db/migrate.js";
import { db } from "./db/index.js";
import { items } from "./db/schema.js";
import { eq } from "drizzle-orm";

const app = new Hono();

// Run migrations on startup
await migrateOnStartup();

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Example endpoint: Create an item
const createItemSchema = z.object({
  name: z.string().min(1).max(255),
});

app.post("/items", zValidator("json", createItemSchema), async (c) => {
  const { name } = c.req.valid("json");
  const result = await db.insert(items).values({ name }).returning();
  return c.json(result[0], 201);
});

// Example endpoint: List all items
app.get("/items", async (c) => {
  const allItems = await db.select().from(items);
  return c.json(allItems);
});

const port = Number(process.env.PORT) || 3002;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
