import { db } from "./index.js";
import {
  eventProvider,
  eventPlan,
  planAddon,
  planOptionGroup,
  planOptionValue,
  eventEstimate,
} from "./schema.js";

const DEMO_EMPLOYER_ID = "employer_demo";

/**
 * Seed the database with providers, plans, options, add-ons, and a starter estimate.
 * Only seeds if tables are empty (idempotent).
 */
export async function seedOnStartup(): Promise<void> {
  try {
    // Check if providers already exist
    const existingProviders = await db.select().from(eventProvider).limit(1);
    if (existingProviders.length > 0) {
      console.log("Database already seeded, skipping seed");
      return;
    }

    console.log("Seeding database...");

    // Providers
    await db.insert(eventProvider).values([
      {
        id: "prov_a",
        name: "Venue A",
        location: "Berlin",
        logoUrl: "https://example.com/logos/venue-a.svg",
      },
      {
        id: "prov_b",
        name: "Venue B",
        location: "Munich",
        logoUrl: "https://example.com/logos/venue-b.svg",
      },
      {
        id: "prov_c",
        name: "Venue C",
        location: "Hamburg",
        logoUrl: "https://example.com/logos/venue-c.svg",
      },
      {
        id: "prov_legacy",
        name: "Legacy Events Ltd",
        location: "",
        logoUrl: null,
      },
    ]);

    // Plans
    await db.insert(eventPlan).values([
      // Venue A - Standard (simplest flow)
      {
        id: "plan_a_standard",
        providerId: "prov_a",
        name: "Venue A - Standard",
        description: "Simple package with no options or add-ons",
        basePriceCents: 50000,
        currency: "EUR",
        approvalType: "none",
        minParticipants: 25,
        leadTimeDays: 14,
      },
      // Venue A - Premium (approvals + addons)
      {
        id: "plan_a_premium",
        providerId: "prov_a",
        name: "Venue A - Premium",
        description: "Premium package with seating and food options, plus add-ons",
        basePriceCents: 70000,
        currency: "EUR",
        approvalType: "manager_review",
        minParticipants: 30,
        leadTimeDays: 21,
      },
      // Venue B - Essentials (required option)
      {
        id: "plan_b_essentials",
        providerId: "prov_b",
        name: "Venue B - Essentials",
        description: "Essential package with required seating type selection",
        basePriceCents: 45000,
        currency: "EUR",
        approvalType: "none",
        minParticipants: 20,
        leadTimeDays: 10,
      },
      // Venue B - Flex (date flexibility)
      {
        id: "plan_b_flex",
        providerId: "prov_b",
        name: "Venue B - Flex",
        description: "Flexible package with seating and date flexibility options",
        basePriceCents: 55000,
        currency: "EUR",
        approvalType: "none",
        minParticipants: 25,
        leadTimeDays: 7,
      },
      // Venue C - Corporate (richer config)
      {
        id: "plan_c_corporate",
        providerId: "prov_c",
        name: "Venue C - Corporate",
        description: "Corporate package with food options and premium add-ons",
        basePriceCents: 80000,
        currency: "EUR",
        approvalType: "manager_review",
        minParticipants: 40,
        leadTimeDays: 28,
      },
      // Legacy Events - Basic (edge cases for testing)
      {
        id: "plan_legacy_basic",
        providerId: "prov_legacy",
        name: "Legacy Basic Package",
        description: "Basic package with legacy configuration options",
        basePriceCents: 35000,
        currency: "EUR",
        approvalType: "none",
        minParticipants: 15,
        leadTimeDays: 5,
      },
    ]);

    // Option Groups and Values
    // Venue A Premium - seating_type (required)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_a_prem_seating",
      planId: "plan_a_premium",
      code: "seating_type",
      description: "Choose your seating arrangement",
      required: true,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_a_prem_seating_open",
        optionGroupId: "opt_grp_a_prem_seating",
        value: "open",
        priceCents: null,
        currency: null,
      },
      {
        id: "opt_val_a_prem_seating_reserved",
        optionGroupId: "opt_grp_a_prem_seating",
        value: "reserved",
        priceCents: 5000,
        currency: "EUR",
      },
    ]);

    // Venue A Premium - food_package (optional)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_a_prem_food",
      planId: "plan_a_premium",
      code: "food_package",
      description: "Select food package",
      required: false,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_a_prem_food_none",
        optionGroupId: "opt_grp_a_prem_food",
        value: "none",
        priceCents: null,
        currency: null,
      },
      {
        id: "opt_val_a_prem_food_light",
        optionGroupId: "opt_grp_a_prem_food",
        value: "light",
        priceCents: 10000,
        currency: "EUR",
      },
      {
        id: "opt_val_a_prem_food_full",
        optionGroupId: "opt_grp_a_prem_food",
        value: "full",
        priceCents: 20000,
        currency: "EUR",
      },
    ]);

    // Venue B Essentials - seating_type (required)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_b_ess_seating",
      planId: "plan_b_essentials",
      code: "seating_type",
      description: "Choose your seating arrangement",
      required: true,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_b_ess_seating_open",
        optionGroupId: "opt_grp_b_ess_seating",
        value: "open",
        priceCents: null,
        currency: null,
      },
      {
        id: "opt_val_b_ess_seating_reserved",
        optionGroupId: "opt_grp_b_ess_seating",
        value: "reserved",
        priceCents: 3000,
        currency: "EUR",
      },
    ]);

    // Venue B Flex - seating_type (required)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_b_flex_seating",
      planId: "plan_b_flex",
      code: "seating_type",
      description: "Choose your seating arrangement",
      required: true,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_b_flex_seating_open",
        optionGroupId: "opt_grp_b_flex_seating",
        value: "open",
        priceCents: null,
        currency: null,
      },
      {
        id: "opt_val_b_flex_seating_reserved",
        optionGroupId: "opt_grp_b_flex_seating",
        value: "reserved",
        priceCents: 4000,
        currency: "EUR",
      },
    ]);

    // Venue B Flex - date_flex_window_days (optional)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_b_flex_date",
      planId: "plan_b_flex",
      code: "date_flex_window_days",
      description: "Date flexibility window",
      required: false,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_b_flex_date_0",
        optionGroupId: "opt_grp_b_flex_date",
        value: "0",
        priceCents: null,
        currency: null,
      },
      {
        id: "opt_val_b_flex_date_7",
        optionGroupId: "opt_grp_b_flex_date",
        value: "7",
        priceCents: 2000,
        currency: "EUR",
      },
      {
        id: "opt_val_b_flex_date_30",
        optionGroupId: "opt_grp_b_flex_date",
        value: "30",
        priceCents: 5000,
        currency: "EUR",
      },
    ]);

    // Venue C Corporate - food_package (optional)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_c_corp_food",
      planId: "plan_c_corporate",
      code: "food_package",
      description: "Select food package",
      required: false,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_c_corp_food_none",
        optionGroupId: "opt_grp_c_corp_food",
        value: "none",
        priceCents: null,
        currency: null,
      },
      {
        id: "opt_val_c_corp_food_light",
        optionGroupId: "opt_grp_c_corp_food",
        value: "light",
        priceCents: 12000,
        currency: "EUR",
      },
      {
        id: "opt_val_c_corp_food_full",
        optionGroupId: "opt_grp_c_corp_food",
        value: "full",
        priceCents: 25000,
        currency: "EUR",
      },
    ]);

    // Venue C Corporate - priority_level (optional, string-number values)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_c_priority",
      planId: "plan_c_corporate",
      code: "priority_level",
      description: "Service priority level",
      required: false,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_c_priority_1",
        optionGroupId: "opt_grp_c_priority",
        value: "1",
        priceCents: null,
        currency: null,
      },
      {
        id: "opt_val_c_priority_2",
        optionGroupId: "opt_grp_c_priority",
        value: "2",
        priceCents: 5000,
        currency: "EUR",
      },
      {
        id: "opt_val_c_priority_3",
        optionGroupId: "opt_grp_c_priority",
        value: "3",
        priceCents: 10000,
        currency: "EUR",
      },
    ]);

    // Legacy Basic - catering_license_tier (required, unknown option code, single value)
    await db.insert(planOptionGroup).values({
      id: "opt_grp_legacy_license",
      planId: "plan_legacy_basic",
      code: "catering_license_tier",
      description: null,
      required: true,
    });
    await db.insert(planOptionValue).values([
      {
        id: "opt_val_legacy_license_t3",
        optionGroupId: "opt_grp_legacy_license",
        value: "tier_3",
        priceCents: null,
        currency: null,
      },
    ]);

    // Add-ons
    await db.insert(planAddon).values([
      // Venue A Premium add-ons
      {
        id: "addon_av",
        planId: "plan_a_premium",
        name: "Extra AV",
        priceCents: 15000,
        currency: "EUR",
      },
      {
        id: "addon_photo",
        planId: "plan_a_premium",
        name: "Photography",
        priceCents: 8000,
        currency: "EUR",
      },
      // Venue B Flex add-on
      {
        id: "addon_host",
        planId: "plan_b_flex",
        name: "VIP host",
        priceCents: 5000,
        currency: "EUR",
      },
      // Venue C Corporate add-ons
      {
        id: "addon_av_corp",
        planId: "plan_c_corporate",
        name: "Extra AV",
        priceCents: 18000,
        currency: "EUR",
      },
      {
        id: "addon_host_corp",
        planId: "plan_c_corporate",
        name: "VIP host",
        priceCents: 10000,
        currency: "EUR",
      },
      // Legacy Basic add-on (free)
      {
        id: "addon_free_wifi",
        planId: "plan_legacy_basic",
        name: "Complimentary WiFi",
        priceCents: 0,
        currency: "EUR",
      },
    ]);

    // Create a starter draft estimate pointing to plan_a_standard
    await db.insert(eventEstimate).values({
      id: "est_demo",
      employerId: DEMO_EMPLOYER_ID,
      planId: "plan_a_standard",
      status: "draft",
      selections: {
        addons: [],
      },
      pricing: {
        base: 50000,
        addons: 0,
        total: 50000,
        currency: "EUR",
      },
    });

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  }
}
