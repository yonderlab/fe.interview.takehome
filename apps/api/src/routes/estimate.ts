import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { db } from "../db/index.js";
import { eventEstimate, estimateBlocker, eventPlan } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import {
  updateEstimateSchema,
  EstimateSchema,
  FinaliseEstimateResponseSchema,
  EstimatesResponseSchema,
  CreateEstimateResponseSchema,
  ErrorSchema,
} from "../domain/schemas.js";
import { computePricing, EstimateSelections } from "../domain/pricing.js";
import { validateEstimate, saveBlockers } from "../domain/validation.js";
import { sql } from "drizzle-orm";
import type { Context } from "hono";

const DEMO_EMPLOYER_ID = "employer_demo";

export const getEstimateRoute = createRoute({
  method: "get",
  path: "/estimate",
  tags: ["Estimates"],
  summary: "Get current estimate",
  description:
    "Returns the current estimate or creates a default one if none exists",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EstimateSchema,
        },
      },
      description: "Current estimate",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal error",
    },
  },
});

export const updateEstimateRoute = createRoute({
  method: "put",
  path: "/estimate",
  tags: ["Estimates"],
  summary: "Update estimate",
  description: "Updates the current estimate with a new plan and selections",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateEstimateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EstimateSchema,
        },
      },
      description: "Updated estimate",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Validation error",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal error",
    },
  },
});

export const finaliseEstimateRoute = createRoute({
  method: "post",
  path: "/estimate/finalise",
  tags: ["Estimates"],
  summary: "Finalise estimate",
  description:
    "Finalises the current estimate. If the plan requires approval, status will be set to pending_approval, otherwise finalised",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: FinaliseEstimateResponseSchema,
        },
      },
      description: "Finalised estimate",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Validation error - estimate has blockers",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Estimate not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal error",
    },
  },
});

/**
 * Get the current estimate (or create a default one if none exists).
 */
export async function getEstimate(c: Context) {
  // Get or create estimate for demo employer
  let estimate = await db
    .select()
    .from(eventEstimate)
    .where(eq(eventEstimate.employerId, DEMO_EMPLOYER_ID))
    .limit(1)
    .then((rows) => rows[0]);

  // If no estimate exists, create a default one
  if (!estimate) {
    // Get first plan as default
    const [defaultPlan] = await db.select().from(eventPlan).limit(1);
    if (!defaultPlan) {
      return c.json(
        {
          error: {
            code: "internal_error",
            message: "No plans available",
          },
        },
        500
      );
    }

    const defaultPricing = await computePricing(defaultPlan.id, { addons: [] });

    estimate = await db
      .insert(eventEstimate)
      .values({
        id: `est_${Date.now()}`,
        employerId: DEMO_EMPLOYER_ID,
        planId: defaultPlan.id,
        status: "draft",
        selections: { addons: [] },
        pricing: defaultPricing,
      })
      .returning()
      .then((rows) => rows[0]);
  }

  if (!estimate) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Failed to create estimate",
        },
      },
      500
    );
  }

  // Get plan info
  const [plan] = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.id, estimate.planId))
    .limit(1);

  if (!plan) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Plan not found",
        },
      },
      500
    );
  }

  // Get blockers
  const blockers = await db
    .select()
    .from(estimateBlocker)
    .where(eq(estimateBlocker.estimateId, estimate.id));

  return c.json({
    id: estimate.id,
    status: estimate.status,
    plan: {
      id: plan.id,
      name: plan.name,
    },
    selections: estimate.selections as Record<string, unknown>,
    pricing: estimate.pricing as {
      base: number;
      addons: number;
      total: number;
      currency: string;
    },
    blocking_reasons: blockers.map((b) => b.reason),
  });
}

/**
 * Update the current estimate.
 */
export async function updateEstimate(c: Context) {
  const body = c.req.valid("json" as never) as {
    plan_id: string;
    selections: Record<string, unknown>;
  };
  const { plan_id, selections: rawSelections } = body;

  // Convert selections to proper type (passthrough returns unknown values)
  const addons = Array.isArray(rawSelections.addons)
    ? rawSelections.addons
    : [];
  const selections: EstimateSelections = {
    addons: addons.filter((id): id is string => typeof id === "string"),
    ...Object.fromEntries(
      Object.entries(rawSelections)
        .filter(([key]) => key !== "addons")
        .map(([key, value]) => [
          key,
          typeof value === "string" || Array.isArray(value)
            ? value
            : String(value),
        ])
    ),
  };

  // Get or create estimate first (to get the ID)
  let estimate = await db
    .select()
    .from(eventEstimate)
    .where(eq(eventEstimate.employerId, DEMO_EMPLOYER_ID))
    .limit(1)
    .then((rows) => rows[0]);

  const estimateId = estimate?.id || `est_${Date.now()}`;

  // Validate selections
  const validation = await validateEstimate(plan_id, selections);
  await saveBlockers(estimateId, validation.blockers);

  // Compute pricing
  const pricing = await computePricing(plan_id, selections);

  if (!estimate) {
    const inserted = await db
      .insert(eventEstimate)
      .values({
        id: estimateId,
        employerId: DEMO_EMPLOYER_ID,
        planId: plan_id,
        status: "draft",
        selections,
        pricing,
      })
      .returning();
    estimate = inserted[0];
  } else {
    // Update existing estimate
    const updated = await db
      .update(eventEstimate)
      .set({
        planId: plan_id,
        selections,
        pricing,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(eventEstimate.id, estimate.id))
      .returning();
    estimate = updated[0];
  }

  if (!estimate) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Failed to update estimate",
        },
      },
      500
    );
  }

  // Get plan info
  const [plan] = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.id, estimate.planId))
    .limit(1);

  if (!plan) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Plan not found",
        },
      },
      500
    );
  }

  // Refresh blockers
  const blockers = await db
    .select()
    .from(estimateBlocker)
    .where(eq(estimateBlocker.estimateId, estimate.id));

  return c.json({
    id: estimate.id,
    status: estimate.status,
    plan: {
      id: plan.id,
      name: plan.name,
    },
    selections: estimate.selections as Record<string, unknown>,
    pricing: estimate.pricing as {
      base: number;
      addons: number;
      total: number;
      currency: string;
    },
    blocking_reasons: blockers.map((b) => b.reason),
  });
}

/**
 * Finalise the current estimate.
 */
export async function finaliseEstimate(c: Context) {
  // Get current estimate
  const estimate = await db
    .select()
    .from(eventEstimate)
    .where(eq(eventEstimate.employerId, DEMO_EMPLOYER_ID))
    .limit(1)
    .then((rows) => rows[0]);

  if (!estimate) {
    return c.json(
      {
        error: {
          code: "not_found",
          message: "No estimate found",
        },
      },
      404
    );
  }

  // Check for blockers
  const blockers = await db
    .select()
    .from(estimateBlocker)
    .where(eq(estimateBlocker.estimateId, estimate.id));

  if (blockers.length > 0) {
    return c.json(
      {
        error: {
          code: "validation_error",
          message: `Cannot finalise estimate: ${blockers.map((b) => b.reason).join("; ")}`,
        },
      },
      400
    );
  }

  // Get plan to check approval type
  const [plan] = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.id, estimate.planId))
    .limit(1);

  if (!plan) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Plan not found",
        },
      },
      500
    );
  }

  // Determine new status
  const newStatus =
    plan.approvalType === "manager_review" ? "pending_approval" : "finalised";

  // Update estimate
  const updated = await db
    .update(eventEstimate)
    .set({
      status: newStatus,
      submittedAt: sql`(unixepoch())`,
      finalisedAt: newStatus === "finalised" ? sql`(unixepoch())` : null,
      updatedAt: sql`(unixepoch())`,
    })
    .where(eq(eventEstimate.id, estimate.id))
    .returning();

  const updatedEstimate = updated[0];
  if (!updatedEstimate) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Failed to finalise estimate",
        },
      },
      500
    );
  }

  return c.json({
    id: updatedEstimate.id,
    status: updatedEstimate.status,
  });
}

export const listEstimatesRoute = createRoute({
  method: "get",
  path: "/estimates",
  tags: ["Estimates"],
  summary: "List all estimates",
  description: "Returns all estimates for the demo employer",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EstimatesResponseSchema,
        },
      },
      description: "List of estimates",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal error",
    },
  },
});

export const createEstimateRoute = createRoute({
  method: "post",
  path: "/estimates",
  tags: ["Estimates"],
  summary: "Create a new estimate",
  description: "Creates a new estimate with default values",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CreateEstimateResponseSchema,
        },
      },
      description: "Created estimate",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal error",
    },
  },
});

export const getEstimateByIdRoute = createRoute({
  method: "get",
  path: "/estimates/{id}",
  tags: ["Estimates"],
  summary: "Get estimate by ID",
  description: "Returns a specific estimate by its ID",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "est_123" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: EstimateSchema,
        },
      },
      description: "Estimate found",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Estimate not found",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal error",
    },
  },
});

/**
 * List all estimates for the demo employer.
 */
export async function listEstimates(c: Context) {
  const estimates = await db
    .select()
    .from(eventEstimate)
    .where(eq(eventEstimate.employerId, DEMO_EMPLOYER_ID))
    .orderBy(desc(eventEstimate.updatedAt));

  // Get plan info and blockers for each estimate
  const estimatesWithDetails = await Promise.all(
    estimates.map(async (estimate) => {
      const [plan] = await db
        .select()
        .from(eventPlan)
        .where(eq(eventPlan.id, estimate.planId))
        .limit(1);

      if (!plan) {
        return null;
      }

      const blockers = await db
        .select()
        .from(estimateBlocker)
        .where(eq(estimateBlocker.estimateId, estimate.id));

      return {
        id: estimate.id,
        status: estimate.status,
        plan: {
          id: plan.id,
          name: plan.name,
        },
        selections: estimate.selections as Record<string, unknown>,
        pricing: estimate.pricing as {
          base: number;
          addons: number;
          total: number;
          currency: string;
        },
        blocking_reasons: blockers.map((b) => b.reason),
      };
    })
  );

  const validEstimates = estimatesWithDetails.filter(
    (e): e is NonNullable<typeof e> => e !== null
  );

  return c.json({
    items: validEstimates,
  });
}

/**
 * Get estimate by ID.
 */
export async function getEstimateById(c: Context) {
  const { id } = c.req.valid("param" as never) as { id: string };

  const estimate = await db
    .select()
    .from(eventEstimate)
    .where(eq(eventEstimate.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!estimate) {
    return c.json(
      {
        error: {
          code: "not_found",
          message: "Estimate not found",
        },
      },
      404
    );
  }

  // Check if estimate belongs to demo employer
  if (estimate.employerId !== DEMO_EMPLOYER_ID) {
    return c.json(
      {
        error: {
          code: "forbidden",
          message: "Access denied",
        },
      },
      403
    );
  }

  // Get plan info
  const [plan] = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.id, estimate.planId))
    .limit(1);

  if (!plan) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Plan not found",
        },
      },
      500
    );
  }

  // Get blockers
  const blockers = await db
    .select()
    .from(estimateBlocker)
    .where(eq(estimateBlocker.estimateId, estimate.id));

  return c.json({
    id: estimate.id,
    status: estimate.status,
    plan: {
      id: plan.id,
      name: plan.name,
    },
    selections: estimate.selections as Record<string, unknown>,
    pricing: estimate.pricing as {
      base: number;
      addons: number;
      total: number;
      currency: string;
    },
    blocking_reasons: blockers.map((b) => b.reason),
  });
}

/**
 * Create a new estimate.
 */
export async function createEstimate(c: Context) {
  // Get first plan as default
  const [defaultPlan] = await db.select().from(eventPlan).limit(1);
  if (!defaultPlan) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "No plans available",
        },
      },
      500
    );
  }

  const defaultPricing = await computePricing(defaultPlan.id, { addons: [] });

  const estimate = await db
    .insert(eventEstimate)
    .values({
      id: `est_${Date.now()}`,
      employerId: DEMO_EMPLOYER_ID,
      planId: defaultPlan.id,
      status: "draft",
      selections: { addons: [] },
      pricing: defaultPricing,
    })
    .returning()
    .then((rows) => rows[0]);

  if (!estimate) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Failed to create estimate",
        },
      },
      500
    );
  }

  // Get plan info
  const [plan] = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.id, estimate.planId))
    .limit(1);

  if (!plan) {
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Plan not found",
        },
      },
      500
    );
  }

  // Get blockers (should be empty for new estimate)
  const blockers = await db
    .select()
    .from(estimateBlocker)
    .where(eq(estimateBlocker.estimateId, estimate.id));

  return c.json({
    id: estimate.id,
    status: estimate.status,
    plan: {
      id: plan.id,
      name: plan.name,
    },
    selections: estimate.selections as Record<string, unknown>,
    pricing: estimate.pricing as {
      base: number;
      addons: number;
      total: number;
      currency: string;
    },
    blocking_reasons: blockers.map((b) => b.reason),
  });
}

export const deleteEstimateRoute = createRoute({
  method: "delete",
  path: "/estimates/{id}",
  tags: ["Estimates"],
  summary: "Delete estimate by ID",
  description: "Deletes a specific estimate by its ID",
  request: {
    params: z.object({
      id: z.string().openapi({ example: "est_123" }),
    }),
  },
  responses: {
    204: {
      description: "Estimate deleted successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Estimate not found",
    },
    403: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Access denied",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Internal error",
    },
  },
});

/**
 * Delete estimate by ID.
 */
export async function deleteEstimate(c: Context) {
  const { id } = c.req.valid("param" as never) as { id: string };

  // First check if estimate exists
  const estimate = await db
    .select()
    .from(eventEstimate)
    .where(eq(eventEstimate.id, id))
    .limit(1)
    .then((rows) => rows[0]);

  if (!estimate) {
    return c.json(
      {
        error: {
          code: "not_found",
          message: `Estimate with ID "${id}" not found`,
        },
      },
      404
    );
  }

  // Check if estimate belongs to demo employer
  if (estimate.employerId !== DEMO_EMPLOYER_ID) {
    return c.json(
      {
        error: {
          code: "forbidden",
          message: "Access denied",
        },
      },
      403
    );
  }

  // Delete blockers first (foreign key constraint)
  await db.delete(estimateBlocker).where(eq(estimateBlocker.estimateId, id));

  // Delete estimate
  await db.delete(eventEstimate).where(eq(eventEstimate.id, id));

  return c.body(null, 204);
}
