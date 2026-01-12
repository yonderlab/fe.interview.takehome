import { createRoute } from "@hono/zod-openapi";
import { db } from "../db/index.js";
import { eventProvider } from "../db/schema.js";
import { ProvidersResponseSchema } from "../domain/schemas.js";
import type { Context } from "hono";

export const getProvidersRoute = createRoute({
  method: "get",
  path: "/providers",
  tags: ["Providers"],
  summary: "List all providers",
  description: "Returns a list of all event providers",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ProvidersResponseSchema,
        },
      },
      description: "List of providers",
    },
  },
});

export async function getProviders(c: Context) {
  const providers = await db.select().from(eventProvider);

  return c.json({
    items: providers.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location,
      logo_url: p.logoUrl,
    })),
  });
}
