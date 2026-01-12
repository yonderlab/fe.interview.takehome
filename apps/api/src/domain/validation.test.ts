import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { validateEstimate, saveBlockers } from "./validation.js";
import { estimateBlocker } from "../db/schema.js";
import { migrateOnStartup } from "../db/migrate.js";
import { seedOnStartup } from "../db/seed.js";
import type { EstimateSelections } from "./pricing.js";

describe("validateEstimate", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = "file:.data/test.db";
    await migrateOnStartup();
    await seedOnStartup();
  });

  afterAll(async () => {
    const { wipeDatabase } = await import("../db/wipe.js");
    process.env.DATABASE_URL = "file:.data/test.db";
    wipeDatabase();
  });

  it("should validate plan with no options", async () => {
    const selections: EstimateSelections = { addons: [] };
    const result = await validateEstimate("plan_a_standard", selections);

    expect(result.isValid).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("should require missing required option", async () => {
    const selections: EstimateSelections = {
      addons: [],
      food_package: "full",
    };
    const result = await validateEstimate("plan_a_premium", selections);

    expect(result.isValid).toBe(false);
    expect(result.blockers).toContain("Missing required field: seating_type");
  });

  it("should validate correct required option", async () => {
    const selections: EstimateSelections = {
      addons: [],
      seating_type: "open",
    };
    const result = await validateEstimate("plan_a_premium", selections);

    expect(result.isValid).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("should reject invalid option value", async () => {
    const selections: EstimateSelections = {
      addons: [],
      seating_type: "invalid_value",
    };
    const result = await validateEstimate("plan_a_premium", selections);

    expect(result.isValid).toBe(false);
    expect(result.blockers.some((b) => b.includes("Invalid value"))).toBe(true);
  });

  it("should validate optional options when provided", async () => {
    const selections: EstimateSelections = {
      addons: [],
      seating_type: "open",
      food_package: "light",
    };
    const result = await validateEstimate("plan_a_premium", selections);

    expect(result.isValid).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("should validate addons belong to plan", async () => {
    const selections: EstimateSelections = {
      addons: ["addon_av"],
      seating_type: "open",
    };
    const result = await validateEstimate("plan_a_premium", selections);

    expect(result.isValid).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("should reject addons that don't belong to plan", async () => {
    const selections: EstimateSelections = {
      addons: ["addon_host"], // This addon belongs to plan_b_flex, not plan_a_premium
      seating_type: "open",
    };
    const result = await validateEstimate("plan_a_premium", selections);

    expect(result.isValid).toBe(false);
    expect(result.blockers.some((b) => b.includes("Invalid add-on IDs"))).toBe(true);
  });

  it("should return error for non-existent plan", async () => {
    const selections: EstimateSelections = { addons: [] };
    const result = await validateEstimate("nonexistent_plan", selections);

    expect(result.isValid).toBe(false);
    expect(result.blockers).toContain("Plan nonexistent_plan not found");
  });
});

describe("saveBlockers", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = "file:.data/test.db";
    await migrateOnStartup();
    await seedOnStartup();
  });

  afterAll(async () => {
    const { wipeDatabase } = await import("../db/wipe.js");
    process.env.DATABASE_URL = "file:.data/test.db";
    wipeDatabase();
  });

  it("should save blockers to database", async () => {
    const estimateId = `test_estimate_1_${Date.now()}`;
    const blockers = ["Missing required field: seating_type", "Invalid add-on ID"];

    // Create estimate first
    const { db } = await import("../db/index.js");
    const { eventEstimate } = await import("../db/schema.js");
    const { eq } = await import("drizzle-orm");
    
    // Delete if exists
    await db.delete(eventEstimate).where(eq(eventEstimate.id, estimateId));
    
    await db.insert(eventEstimate).values({
      id: estimateId,
      employerId: "test_employer",
      planId: "plan_a_standard",
      status: "draft",
      selections: { addons: [] },
      pricing: { base: 50000, addons: 0, total: 50000, currency: "EUR" },
    });

    await saveBlockers(estimateId, blockers);

    const savedBlockers = await db
      .select()
      .from(estimateBlocker)
      .where(eq(estimateBlocker.estimateId, estimateId));

    expect(savedBlockers).toHaveLength(2);
    expect(savedBlockers.map((b) => b.reason)).toEqual(blockers);
  });

  it("should replace existing blockers", async () => {
    const estimateId = `test_estimate_2_${Date.now()}`;
    const initialBlockers = ["Old blocker"];
    const newBlockers = ["New blocker 1", "New blocker 2"];

    // Create estimate first
    const { db } = await import("../db/index.js");
    const { eventEstimate } = await import("../db/schema.js");
    const { eq } = await import("drizzle-orm");
    
    // Delete if exists
    await db.delete(eventEstimate).where(eq(eventEstimate.id, estimateId));
    
    await db.insert(eventEstimate).values({
      id: estimateId,
      employerId: "test_employer",
      planId: "plan_a_standard",
      status: "draft",
      selections: { addons: [] },
      pricing: { base: 50000, addons: 0, total: 50000, currency: "EUR" },
    });

    await saveBlockers(estimateId, initialBlockers);
    await saveBlockers(estimateId, newBlockers);

    const savedBlockers = await db
      .select()
      .from(estimateBlocker)
      .where(eq(estimateBlocker.estimateId, estimateId));

    expect(savedBlockers).toHaveLength(2);
    expect(savedBlockers.map((b) => b.reason)).toEqual(newBlockers);
  });

  it("should clear blockers when empty array provided", async () => {
    const estimateId = `test_estimate_3_${Date.now()}`;
    const blockers = ["Some blocker"];

    // Create estimate first
    const { db } = await import("../db/index.js");
    const { eventEstimate } = await import("../db/schema.js");
    const { eq } = await import("drizzle-orm");
    
    // Delete if exists
    await db.delete(eventEstimate).where(eq(eventEstimate.id, estimateId));
    
    await db.insert(eventEstimate).values({
      id: estimateId,
      employerId: "test_employer",
      planId: "plan_a_standard",
      status: "draft",
      selections: { addons: [] },
      pricing: { base: 50000, addons: 0, total: 50000, currency: "EUR" },
    });

    await saveBlockers(estimateId, blockers);
    await saveBlockers(estimateId, []);

    const savedBlockers = await db
      .select()
      .from(estimateBlocker)
      .where(eq(estimateBlocker.estimateId, estimateId));

    expect(savedBlockers).toHaveLength(0);
  });
});
