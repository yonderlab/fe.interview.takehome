import { db } from "../db/index.js";
import { eventPlan, planAddon, planOptionValue, planOptionGroup } from "../db/schema.js";
import { eq, inArray, and } from "drizzle-orm";

export interface PricingResult {
  base: number;
  addons: number;
  total: number;
  currency: string;
}

export interface EstimateSelections {
  addons: string[];
  [key: string]: string | string[]; // Other option values like seating_type: "open"
}

/**
 * Compute pricing for an estimate based on plan, selected add-ons, and option values.
 */
export async function computePricing(
  planId: string,
  selections: EstimateSelections
): Promise<PricingResult> {
  // Get plan
  const [plan] = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.id, planId))
    .limit(1);

  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  let total = plan.basePriceCents;
  const currency = plan.currency;

  // Add add-on prices
  let addonsTotal = 0;
  if (selections.addons && selections.addons.length > 0) {
    const validAddonIds = selections.addons.filter((id): id is string => typeof id === "string");
    const addons = await db
      .select()
      .from(planAddon)
      .where(
        and(
          eq(planAddon.planId, planId),
          inArray(planAddon.id, validAddonIds)
        )
      );

    addonsTotal = addons.reduce((sum: number, addon) => sum + addon.priceCents, 0);
    total += addonsTotal;
  }

  // Add option value price deltas
  // Get all option groups for this plan
  const optionGroups = await db
    .select()
    .from(planOptionGroup)
    .where(eq(planOptionGroup.planId, planId));

  for (const group of optionGroups) {
    const selectedValue = selections[group.code];
    if (selectedValue && typeof selectedValue === "string") {
      // Find the option value and add its price delta if present
      const [optionValue] = await db
        .select()
        .from(planOptionValue)
        .where(
          and(
            eq(planOptionValue.optionGroupId, group.id),
            eq(planOptionValue.value, selectedValue)
          )
        )
        .limit(1);

      if (optionValue?.priceCents) {
        total += optionValue.priceCents;
      }
    }
  }

  return {
    base: plan.basePriceCents,
    addons: addonsTotal,
    total,
    currency,
  };
}
