import { z } from "@hono/zod-openapi";

// Enum-like schemas for SQLite (stored as text, validated with Zod)
export const estimateStatusSchema = z.enum([
  "draft",
  "submitted",
  "quote_available",
  "pending_approval",
  "finalised",
  "rejected",
  "expired",
]);

export const approvalTypeSchema = z.enum(["none", "manager_review"]);

// Request/Response schemas
export const updateEstimateSchema = z.object({
  plan_id: z.string().min(1).openapi({
    example: "plan_a_premium",
  }),
  selections: z.object({
    addons: z.array(z.string()).default([]).openapi({
      example: ["addon_av"],
    }),
  }).passthrough().openapi({
    example: {
      addons: ["addon_av"],
      seating_type: "reserved",
      food_package: "full",
    },
  }),
});

// Response schemas
export const ProviderSchema = z.object({
  id: z.string().openapi({ example: "prov_a" }),
  name: z.string().openapi({ example: "Venue A" }),
  location: z.string().openapi({ example: "Berlin" }),
  logo_url: z.string().nullable().openapi({ example: "https://example.com/logos/venue-a.svg" }),
}).openapi("Provider");

export const ProvidersResponseSchema = z.object({
  items: z.array(ProviderSchema),
}).openapi("ProvidersResponse");

export const PlanOptionSchema = z.object({
  code: z.string().openapi({ example: "seating_type" }),
  description: z.string().nullable().openapi({ example: "Choose your seating arrangement" }),
  required: z.boolean().openapi({ example: true }),
  values: z.array(z.string()).openapi({ example: ["open", "reserved"] }),
}).openapi("PlanOption");

export const PlanAddonSchema = z.object({
  id: z.string().openapi({ example: "addon_av" }),
  name: z.string().openapi({ example: "Extra AV" }),
  price_cents: z.number().openapi({ example: 15000 }),
  currency: z.string().openapi({ example: "EUR" }),
}).openapi("PlanAddon");

export const PlanSchema = z.object({
  id: z.string().openapi({ example: "plan_a_premium" }),
  provider_id: z.string().openapi({ example: "prov_a" }),
  name: z.string().openapi({ example: "Venue A - Premium" }),
  description: z.string().openapi({ example: "Premium package with seating and food options" }),
  base_price_cents: z.number().openapi({ example: 70000 }),
  currency: z.string().openapi({ example: "EUR" }),
  approval_type: z.string().openapi({ example: "manager_review" }),
  min_participants: z.number().openapi({ example: 30 }),
  lead_time_days: z.number().openapi({ example: 21 }),
  options: z.array(PlanOptionSchema),
  addons: z.array(PlanAddonSchema),
}).openapi("Plan");

export const PlansResponseSchema = z.object({
  items: z.array(PlanSchema),
}).openapi("PlansResponse");

export const EstimatePlanSchema = z.object({
  id: z.string().openapi({ example: "plan_a_premium" }),
  name: z.string().openapi({ example: "Venue A - Premium" }),
}).openapi("EstimatePlan");

export const PricingSchema = z.object({
  base: z.number().openapi({ example: 70000 }),
  addons: z.number().openapi({ example: 15000 }),
  total: z.number().openapi({ example: 110000 }),
  currency: z.string().openapi({ example: "EUR" }),
}).openapi("Pricing");

export const EstimateSchema = z.object({
  id: z.string().openapi({ example: "est_demo" }),
  status: estimateStatusSchema.openapi({ example: "draft" }),
  plan: EstimatePlanSchema,
  selections: z.record(z.string(), z.union([z.string(), z.array(z.string())])).openapi({
    example: {
      addons: ["addon_av"],
      seating_type: "reserved",
      food_package: "full",
    },
  }),
  pricing: PricingSchema,
  blocking_reasons: z.array(z.string()).openapi({ example: [] }),
}).openapi({
  title: "Estimate",
});

export const FinaliseEstimateResponseSchema = z.object({
  id: z.string().openapi({ example: "est_demo" }),
  status: estimateStatusSchema.openapi({ example: "pending_approval" }),
}).openapi("FinaliseEstimateResponse");

export const ErrorSchema = z.object({
  error: z.object({
    code: z.string().openapi({ example: "validation_error" }),
    message: z.string().openapi({ example: "Missing required field: seating_type" }),
  }),
}).openapi("Error");

export type EstimateStatus = z.infer<typeof estimateStatusSchema>;
export type ApprovalType = z.infer<typeof approvalTypeSchema>;
export type UpdateEstimateInput = z.infer<typeof updateEstimateSchema>;
