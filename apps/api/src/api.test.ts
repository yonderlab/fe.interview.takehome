import { describe, it, expect, beforeAll } from "vitest";

const API_URL = process.env.API_URL || "http://localhost:3002";

// Type helpers for API responses
interface Provider {
  id: string;
  name: string;
  location: string;
  logo_url: string | null;
}

interface ProvidersResponse {
  items: Provider[];
}

interface PlanOption {
  code: string;
  description?: string;
  required: boolean;
  values: string[];
}

interface PlanAddon {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
}

interface Plan {
  id: string;
  name: string;
  base_price_cents: number;
  options: PlanOption[];
  addons: PlanAddon[];
}

interface PlansResponse {
  items: Plan[];
}

interface Estimate {
  id: string;
  status: string;
  plan: { id: string; name: string };
  selections: Record<string, unknown>;
  pricing: {
    base: number;
    addons: number;
    total: number;
    currency: string;
  };
  blocking_reasons: string[];
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

interface FinaliseResponse {
  id: string;
  status: string;
}

describe("API Integration Tests", () => {
  beforeAll(async () => {
    // Wait for server to be ready (if not already running, start it manually)
    let attempts = 0;
    while (attempts < 30) {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          return;
        }
      } catch {
        // Server not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      attempts++;
    }
    throw new Error("Server is not running. Start it with: npm run dev");
  });

  describe("GET /providers", () => {
    it("should return list of providers", async () => {
      const response = await fetch(`${API_URL}/providers`);
      expect(response.status).toBe(200);

      const data = (await response.json()) as ProvidersResponse;
      expect(data).toHaveProperty("items");
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.items.length).toBeGreaterThan(0);

      const provider = data.items[0];
      expect(provider).toHaveProperty("id");
      expect(provider).toHaveProperty("name");
      expect(provider).toHaveProperty("location");
    });

    it("should return providers with correct structure", async () => {
      const response = await fetch(`${API_URL}/providers`);
      const data = (await response.json()) as ProvidersResponse;

      data.items.forEach((provider) => {
        expect(typeof provider.id).toBe("string");
        expect(typeof provider.name).toBe("string");
        expect(typeof provider.location).toBe("string");
        expect(provider.logo_url === null || typeof provider.logo_url === "string").toBe(true);
      });
    });
  });

  describe("GET /plans", () => {
    it("should return error when provider_id is missing", async () => {
      const response = await fetch(`${API_URL}/plans`);
      expect(response.status).toBe(400);

      const data = (await response.json()) as { success?: boolean; error?: unknown };
      // OpenAPI validation returns ZodError format
      expect(data).toHaveProperty("success", false);
      expect(data).toHaveProperty("error");
    });

    it("should return plans for valid provider", async () => {
      const response = await fetch(`${API_URL}/plans?provider_id=prov_a`);
      expect(response.status).toBe(200);

      const data = (await response.json()) as PlansResponse;
      expect(data).toHaveProperty("items");
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.items.length).toBeGreaterThan(0);

      const plan = data.items[0];
      expect(plan).toBeDefined();
      if (plan) {
        expect(plan).toHaveProperty("id");
        expect(plan).toHaveProperty("name");
        expect(plan).toHaveProperty("base_price_cents");
        expect(plan).toHaveProperty("options");
        expect(plan).toHaveProperty("addons");
        expect(Array.isArray(plan.options)).toBe(true);
        expect(Array.isArray(plan.addons)).toBe(true);
      }
    });

    it("should return plans with options and addons", async () => {
      const response = await fetch(`${API_URL}/plans?provider_id=prov_a`);
      const data = (await response.json()) as PlansResponse;

      const premiumPlan = data.items.find((p) => p.id === "plan_a_premium");
      expect(premiumPlan).toBeDefined();

      if (premiumPlan) {
        expect(premiumPlan.options.length).toBeGreaterThan(0);
        expect(premiumPlan.addons.length).toBeGreaterThan(0);

        const option = premiumPlan.options[0];
        if (option) {
          expect(option).toHaveProperty("code");
          expect(option).toHaveProperty("required");
          expect(option).toHaveProperty("values");
          expect(Array.isArray(option.values)).toBe(true);
        }

        const addon = premiumPlan.addons[0];
        if (addon) {
          expect(addon).toHaveProperty("id");
          expect(addon).toHaveProperty("name");
          expect(addon).toHaveProperty("price_cents");
        }
      }
    });
  });

  describe("GET /estimate", () => {
    it("should return current estimate", async () => {
      const response = await fetch(`${API_URL}/estimate`);
      expect(response.status).toBe(200);

      const data = (await response.json()) as Estimate;
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("plan");
      expect(data).toHaveProperty("selections");
      expect(data).toHaveProperty("pricing");
      expect(data).toHaveProperty("blocking_reasons");
    });

    it("should return estimate with correct structure", async () => {
      const response = await fetch(`${API_URL}/estimate`);
      const data = (await response.json()) as Estimate;

      expect(typeof data.id).toBe("string");
      expect(["draft", "submitted", "pending_approval", "finalised"]).toContain(data.status);
      expect(data.plan).toHaveProperty("id");
      expect(data.plan).toHaveProperty("name");
      expect(data.pricing).toHaveProperty("base");
      expect(data.pricing).toHaveProperty("addons");
      expect(data.pricing).toHaveProperty("total");
      expect(data.pricing).toHaveProperty("currency");
      expect(Array.isArray(data.blocking_reasons)).toBe(true);
    });
  });

  describe("PUT /estimate", () => {
    it("should update estimate with valid selections", async () => {
      const response = await fetch(`${API_URL}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_a_premium",
          selections: {
            seating_type: "reserved",
            food_package: "full",
            addons: ["addon_av"],
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Estimate;

      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("pricing");
      expect(data.pricing.total).toBe(110000); // base + addon + option deltas
      expect(data.blocking_reasons).toEqual([]);
    });

    it("should return blockers for missing required field", async () => {
      const response = await fetch(`${API_URL}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_a_premium",
          selections: {
            food_package: "full",
            addons: [],
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Estimate;

      expect(data.blocking_reasons.length).toBeGreaterThan(0);
      expect(data.blocking_reasons.some((b) => b.includes("seating_type"))).toBe(true);
    });

    it("should return blockers for invalid addon", async () => {
      const response = await fetch(`${API_URL}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_a_premium",
          selections: {
            seating_type: "open",
            addons: ["invalid_addon"],
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Estimate;

      expect(data.blocking_reasons.length).toBeGreaterThan(0);
      expect(data.blocking_reasons.some((b) => b.includes("Invalid add-on"))).toBe(true);
    });

    it("should compute pricing correctly", async () => {
      const response = await fetch(`${API_URL}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_b_flex",
          selections: {
            seating_type: "open",
            date_flex_window_days: "30",
            addons: [],
          },
        }),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as Estimate;

      expect(data.pricing.base).toBe(55000);
      expect(data.pricing.total).toBe(60000); // base + 30-day flex (+5000)
    });
  });

  describe("POST /estimate/finalise", () => {
    it("should block finalisation when blockers exist", async () => {
      // First create an estimate with blockers
      await fetch(`${API_URL}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_a_premium",
          selections: {
            food_package: "full",
            addons: [],
          },
        }),
      });

      const response = await fetch(`${API_URL}/estimate/finalise`, {
        method: "POST",
      });

      expect(response.status).toBe(400);
      const data = (await response.json()) as ErrorResponse;

      expect(data).toHaveProperty("error");
      expect(data.error.code).toBe("validation_error");
    });

    it("should finalise estimate without approval requirement", async () => {
      // Set up valid estimate
      await fetch(`${API_URL}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_b_essentials",
          selections: {
            seating_type: "open",
            addons: [],
          },
        }),
      });

      const response = await fetch(`${API_URL}/estimate/finalise`, {
        method: "POST",
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as FinaliseResponse;

      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("status", "finalised");
    });

    it("should set pending_approval for plans requiring approval", async () => {
      // Set up valid estimate with approval requirement
      await fetch(`${API_URL}/estimate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_a_premium",
          selections: {
            seating_type: "open",
            food_package: "none",
            addons: [],
          },
        }),
      });

      const response = await fetch(`${API_URL}/estimate/finalise`, {
        method: "POST",
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as FinaliseResponse;

      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("status", "pending_approval");
    });
  });
});
