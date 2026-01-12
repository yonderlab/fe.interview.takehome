import { createRoute, z } from "@hono/zod-openapi";
import { db } from "../db/index.js";
import { eventPlan, planAddon, planOptionGroup, planOptionValue } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { PlansResponseSchema, ErrorSchema } from "../domain/schemas.js";
import type { Context } from "hono";

export const getPlansRoute = createRoute({
  method: "get",
  path: "/plans",
  tags: ["Plans"],
  summary: "List plans for a provider",
  description: "Returns plans for a specific provider with their options and add-ons",
  request: {
    query: z.object({
      provider_id: z.string().min(1).openapi({
        param: {
          name: "provider_id",
          in: "query",
        },
        example: "prov_a",
        description: "Provider ID",
      }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: PlansResponseSchema,
        },
      },
      description: "List of plans",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
      description: "Validation error",
    },
  },
});

export async function getPlans(c: Context) {
  const providerId = (c.req.valid("query" as never) as { provider_id: string }).provider_id;

  // Get plans for this provider
  const plans = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.providerId, providerId));

  // For each plan, fetch options and add-ons
  const plansWithConfig = await Promise.all(
    plans.map(async (plan) => {
      // Get option groups
      const optionGroups = await db
        .select()
        .from(planOptionGroup)
        .where(eq(planOptionGroup.planId, plan.id));

      // Get option values for each group
      const options = await Promise.all(
        optionGroups.map(async (group) => {
          const values = await db
            .select()
            .from(planOptionValue)
            .where(eq(planOptionValue.optionGroupId, group.id));

          return {
            code: group.code,
            description: group.description || undefined,
            required: group.required,
            values: values.map((v) => v.value),
          };
        })
      );

      // Get add-ons
      const addons = await db
        .select()
        .from(planAddon)
        .where(eq(planAddon.planId, plan.id));

      return {
        id: plan.id,
        provider_id: plan.providerId,
        name: plan.name,
        description: plan.description,
        base_price_cents: plan.basePriceCents,
        currency: plan.currency,
        approval_type: plan.approvalType,
        min_participants: plan.minParticipants,
        lead_time_days: plan.leadTimeDays,
        options,
        addons: addons.map((a) => ({
          id: a.id,
          name: a.name,
          price_cents: a.priceCents,
          currency: a.currency,
        })),
      };
    })
  );

  return c.json({
    items: plansWithConfig,
  });
}
