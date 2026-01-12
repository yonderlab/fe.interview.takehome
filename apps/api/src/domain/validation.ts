import { db } from "../db/index.js";
import {
  eventPlan,
  planAddon,
  planOptionGroup,
  planOptionValue,
  estimateBlocker,
} from "../db/schema.js";
import { eq, inArray, and } from "drizzle-orm";
import { EstimateSelections } from "./pricing.js";

export interface ValidationResult {
  isValid: boolean;
  blockers: string[];
}

/**
 * Validate estimate selections and return blockers if any.
 */
export async function validateEstimate(
  planId: string,
  selections: EstimateSelections
): Promise<ValidationResult> {
  const blockers: string[] = [];

  // Check plan exists
  const [plan] = await db
    .select()
    .from(eventPlan)
    .where(eq(eventPlan.id, planId))
    .limit(1);

  if (!plan) {
    blockers.push(`Plan ${planId} not found`);
    return { isValid: false, blockers };
  }

  // Get all option groups for this plan
  const optionGroups = await db
    .select()
    .from(planOptionGroup)
    .where(eq(planOptionGroup.planId, planId));

  // Check required options are present
  for (const group of optionGroups) {
    if (group.required) {
      const selectedValue = selections[group.code];
      if (!selectedValue || typeof selectedValue !== "string") {
        blockers.push(`Missing required field: ${group.code}`);
        continue;
      }

      // Validate the selected value is allowed
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

      if (!optionValue) {
        blockers.push(`Invalid value "${selectedValue}" for ${group.code}`);
      }
    } else {
      // Optional: if provided, validate it's allowed
      const selectedValue = selections[group.code];
      if (selectedValue && typeof selectedValue === "string") {
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

        if (!optionValue) {
          blockers.push(`Invalid value "${selectedValue}" for ${group.code}`);
        }
      }
    }
  }

  // Validate add-ons belong to this plan
  if (selections.addons && Array.isArray(selections.addons)) {
    const validAddonIds = selections.addons.filter(
      (id): id is string => typeof id === "string"
    );

    if (validAddonIds.length > 0) {
      const planAddons = await db
        .select()
        .from(planAddon)
        .where(
          and(
            eq(planAddon.planId, planId),
            inArray(planAddon.id, validAddonIds)
          )
        );

      const validIds = new Set(planAddons.map((a: { id: string }) => a.id));
      const invalidIds = validAddonIds.filter((id) => !validIds.has(id));

      if (invalidIds.length > 0) {
        blockers.push(
          `Invalid add-on IDs for this plan: ${invalidIds.join(", ")}`
        );
      }
    }
  }

  return {
    isValid: blockers.length === 0,
    blockers,
  };
}

/**
 * Save blockers to the database for an estimate.
 */
export async function saveBlockers(
  estimateId: string,
  blockers: string[]
): Promise<void> {
  // Delete existing blockers
  await db
    .delete(estimateBlocker)
    .where(eq(estimateBlocker.estimateId, estimateId));

  // Insert new blockers
  if (blockers.length > 0) {
    await db.insert(estimateBlocker).values(
      blockers.map((reason, index) => ({
        id: `blocker_${estimateId}_${index}`,
        estimateId,
        reason,
      }))
    );
  }
}
