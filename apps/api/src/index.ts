import { serve } from "@hono/node-server";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { swaggerUI } from "@hono/swagger-ui";
import { migrateOnStartup } from "./db/migrate.js";
import { seedOnStartup } from "./db/seed.js";
import { getProvidersRoute, getProviders } from "./routes/providers.js";
import { getPlansRoute, getPlans } from "./routes/plans.js";
import { getEstimateRoute, getEstimate, updateEstimateRoute, updateEstimate, finaliseEstimateRoute, finaliseEstimate } from "./routes/estimate.js";

const app = new OpenAPIHono();

// Add CORS middleware for local frontend development
app.use("*", cors());

// Run migrations and seed on startup
await migrateOnStartup();
await seedOnStartup();

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// API endpoints with OpenAPI
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.openapi(getProvidersRoute, getProviders as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.openapi(getPlansRoute, getPlans as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.openapi(getEstimateRoute, getEstimate as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.openapi(updateEstimateRoute, updateEstimate as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.openapi(finaliseEstimateRoute, finaliseEstimate as any);

// OpenAPI documentation endpoint (JSON)
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Event Ticketing API",
    description: "API for managing event ticketing estimates with dynamic plan options and add-ons",
  },
  servers: [
    {
      url: "http://localhost:3002",
      description: "Development server",
    },
  ],
});

// Swagger UI endpoint
app.get("/ui", swaggerUI({ url: "/doc" }));

const port = Number(process.env.PORT) || 3002;

console.log(`Server is running on port ${port}`);
console.log(`OpenAPI documentation (JSON) available at http://localhost:${port}/doc`);
console.log(`Swagger UI available at http://localhost:${port}/ui`);

serve({
  fetch: app.fetch,
  port,
});
