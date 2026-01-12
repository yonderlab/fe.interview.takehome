import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// Event Provider table
export const eventProvider = sqliteTable("event_provider", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  logoUrl: text("logo_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Event Plan table
export const eventPlan = sqliteTable("event_plan", {
  id: text("id").primaryKey(),
  providerId: text("provider_id")
    .notNull()
    .references(() => eventProvider.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  basePriceCents: integer("base_price_cents").notNull(),
  currency: text("currency").notNull(),
  approvalType: text("approval_type").notNull(), // 'none' | 'manager_review'
  minParticipants: integer("min_participants").notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Plan Addon table
export const planAddon = sqliteTable("plan_addon", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => eventPlan.id),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull(),
});

// Plan Option Group table
export const planOptionGroup = sqliteTable("plan_option_group", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => eventPlan.id),
  code: text("code").notNull(), // e.g. "seating_type", "food_package"
  description: text("description"),
  required: integer("required", { mode: "boolean" }).notNull(),
});

// Plan Option Value table
export const planOptionValue = sqliteTable("plan_option_value", {
  id: text("id").primaryKey(),
  optionGroupId: text("option_group_id")
    .notNull()
    .references(() => planOptionGroup.id),
  value: text("value").notNull(), // e.g. "open", "reserved", "full"
  priceCents: integer("price_cents"), // optional price delta
  currency: text("currency"),
});

// Event Estimate table
export const eventEstimate = sqliteTable("event_estimate", {
  id: text("id").primaryKey(),
  employerId: text("employer_id").notNull(),
  planId: text("plan_id")
    .notNull()
    .references(() => eventPlan.id),
  status: text("status").notNull(), // 'draft' | 'submitted' | 'quote_available' | 'pending_approval' | 'finalised' | 'rejected' | 'expired'
  selections: text("selections", { mode: "json" }).notNull(), // chosen option values (business-level)
  pricing: text("pricing", { mode: "json" }).notNull(), // subtotal/addons/total
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
  finalisedAt: integer("finalised_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Estimate Blocker table
export const estimateBlocker = sqliteTable("estimate_blocker", {
  id: text("id").primaryKey(),
  estimateId: text("estimate_id")
    .notNull()
    .references(() => eventEstimate.id),
  reason: text("reason").notNull(),
});

// Relations
export const eventProviderRelations = relations(eventProvider, ({ many }) => ({
  plans: many(eventPlan),
}));

export const eventPlanRelations = relations(eventPlan, ({ one, many }) => ({
  provider: one(eventProvider, {
    fields: [eventPlan.providerId],
    references: [eventProvider.id],
  }),
  addons: many(planAddon),
  optionGroups: many(planOptionGroup),
  estimates: many(eventEstimate),
}));

export const planAddonRelations = relations(planAddon, ({ one }) => ({
  plan: one(eventPlan, {
    fields: [planAddon.planId],
    references: [eventPlan.id],
  }),
}));

export const planOptionGroupRelations = relations(
  planOptionGroup,
  ({ one, many }) => ({
    plan: one(eventPlan, {
      fields: [planOptionGroup.planId],
      references: [eventPlan.id],
    }),
    values: many(planOptionValue),
  })
);

export const planOptionValueRelations = relations(planOptionValue, ({ one }) => ({
  optionGroup: one(planOptionGroup, {
    fields: [planOptionValue.optionGroupId],
    references: [planOptionGroup.id],
  }),
}));

export const eventEstimateRelations = relations(eventEstimate, ({ one, many }) => ({
  plan: one(eventPlan, {
    fields: [eventEstimate.planId],
    references: [eventPlan.id],
  }),
  blockers: many(estimateBlocker),
}));

export const estimateBlockerRelations = relations(estimateBlocker, ({ one }) => ({
  estimate: one(eventEstimate, {
    fields: [estimateBlocker.estimateId],
    references: [eventEstimate.id],
  }),
}));
