import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { computePricing, type EstimateSelections } from "./pricing.js";
import { migrateOnStartup } from "../db/migrate.js";
import { seedOnStartup } from "../db/seed.js";

describe("computePricing", () => {
  beforeAll(async () => {
    // Use test database
    process.env.DATABASE_URL = "file:.data/test.db";
    await migrateOnStartup();
    await seedOnStartup();
  });

  afterAll(async () => {
    // Clean up test database
    const { wipeDatabase } = await import("../db/wipe.js");
    process.env.DATABASE_URL = "file:.data/test.db";
    wipeDatabase();
  });

  it("should compute base price only", async () => {
    const selections: EstimateSelections = { addons: [] };
    const result = await computePricing("plan_a_standard", selections);

    expect(result.base).toBe(50000);
    expect(result.addons).toBe(0);
    expect(result.total).toBe(50000);
    expect(result.currency).toBe("EUR");
  });

  it("should include addon prices", async () => {
    const selections: EstimateSelections = {
      addons: ["addon_av"],
    };
    const result = await computePricing("plan_a_premium", selections);

    expect(result.base).toBe(70000);
    expect(result.addons).toBe(15000);
    expect(result.total).toBe(85000);
    expect(result.currency).toBe("EUR");
  });

  it("should include multiple addon prices", async () => {
    const selections: EstimateSelections = {
      addons: ["addon_av", "addon_photo"],
    };
    const result = await computePricing("plan_a_premium", selections);

    expect(result.base).toBe(70000);
    expect(result.addons).toBe(23000); // 15000 + 8000
    expect(result.total).toBe(93000);
  });

  it("should include option value price deltas", async () => {
    const selections: EstimateSelections = {
      addons: [],
      seating_type: "reserved",
      food_package: "full",
    };
    const result = await computePricing("plan_a_premium", selections);

    expect(result.base).toBe(70000);
    expect(result.addons).toBe(0);
    // reserved seating: +5000, full food: +20000
    expect(result.total).toBe(95000);
  });

  it("should combine base, addons, and option deltas", async () => {
    const selections: EstimateSelections = {
      addons: ["addon_av"],
      seating_type: "reserved",
      food_package: "full",
    };
    const result = await computePricing("plan_a_premium", selections);

    expect(result.base).toBe(70000);
    expect(result.addons).toBe(15000);
    // base + addons + reserved (+5000) + full food (+20000)
    expect(result.total).toBe(110000);
  });

  it("should handle plan with no options or addons", async () => {
    const selections: EstimateSelections = { addons: [] };
    const result = await computePricing("plan_a_standard", selections);

    expect(result.total).toBe(50000);
  });

  it("should throw error for non-existent plan", async () => {
    const selections: EstimateSelections = { addons: [] };
    await expect(computePricing("nonexistent_plan", selections)).rejects.toThrow(
      "Plan nonexistent_plan not found"
    );
  });
});
