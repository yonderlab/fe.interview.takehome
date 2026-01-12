# Event Ticketing Backend API/DB Design Guide

This guide outlines a minimal backend and data model to power the Event Ticketing take-home. The emphasis is on representing **business options** in the database (not UI fields) and estimate lifecycle management.

---

## Decision Context & Rationale

These decisions are intentional and should be shared with candidates and reviewers:

- **Plans are seeded, read-only.**  
  We want to evaluate how candidates handle *dynamic plan variability* in a purchasing flow, not how they build CRUD/admin tooling.

- **Options are modeled as business capabilities.**  
  The API returns what options exist and which values are allowed, but does **not** prescribe how to render them. This tests product thinking + UI adaptability.

- **Estimate lifecycle mirrors real-world ticketing.**  
  Draft → submitted → pending approval → finalised reflects typical procurement/approval steps for corporate events.

- **Pricing is owned by the backend.**  
  The frontend renders pricing but does not compute final totals (option/add-on deltas may exist).

- **No UI schema.**  
  Candidates decide how to present choices (selects, radios, cards, etc). We want to see how they communicate the available options.

---

## Core Concepts
- **Provider**: Venue or event provider
- **Plan**: Package offered by a provider
- **Options**: Business-level configurable choices (e.g., add-ons, seating types, food packages)
- **Estimate**: Draft configuration with status transitions

---

## Enums

```sql
CREATE TYPE estimate_status AS ENUM (
  'draft',
  'submitted',
  'quote_available',
  'pending_approval',
  'finalised',
  'rejected',
  'expired'
);

CREATE TYPE approval_type AS ENUM (
  'none',
  'manager_review'
);
```

**SQLite note:** SQLite does not enforce enums. Store these as TEXT columns and validate on read/write using Zod (or equivalent).

---

## Tables (Schema Sketch)

```sql
event_provider (
  id uuid pk,
  name text,
  location text,
  logo_url text,
  created_at timestamptz
);

event_plan (
  id uuid pk,
  provider_id uuid fk -> event_provider.id,
  name text,
  description text,
  base_price_cents int,
  currency text,
  approval_type text, -- validate with Zod
  min_participants int,
  lead_time_days int,
  created_at timestamptz
);

plan_addon (
  id uuid pk,
  plan_id uuid fk -> event_plan.id,
  name text,
  price_cents int,
  currency text
);

plan_option_group (
  id uuid pk,
  plan_id uuid fk -> event_plan.id,
  code text, -- e.g. "seating_type", "food_package", "date_flex_window_days"
  description text,
  required bool
);

plan_option_value (
  id uuid pk,
  option_group_id uuid fk -> plan_option_group.id,
  value text, -- e.g. "open", "reserved", "full"
  price_cents int null, -- optional price delta
  currency text null
);

event_estimate (
  id uuid pk,
  employer_id uuid,
  plan_id uuid fk -> event_plan.id,
  status text, -- validate with Zod
  selections jsonb, -- chosen option values (business-level)
  pricing jsonb, -- subtotal/addons/total
  submitted_at timestamptz,
  finalised_at timestamptz,
  updated_at timestamptz
);

estimate_blocker (
  id uuid pk,
  estimate_id uuid fk -> event_estimate.id,
  reason text
);
```

---

## Relations
- `event_provider` 1 -- N `event_plan`
- `event_plan` 1 -- N `plan_addon`
- `event_plan` 1 -- N `plan_option_group`
- `plan_option_group` 1 -- N `plan_option_value`
- `event_plan` 1 -- N `event_estimate`
- `event_estimate` 1 -- N `estimate_blocker`

---

## Options Model (No UI Field Schema)

The backend exposes **business options** and allowed values, not UI field schemas. The candidate decides how to render them.

Example response fragment for a plan **with** add-ons and seating/food options:
```json
{
  "options": [
    {
      "code": "seating_type",
      "required": true,
      "values": ["open", "reserved"]
    },
    {
      "code": "food_package",
      "required": false,
      "values": ["none", "light", "full"]
    },
    {
      "code": "date_flex_window_days",
      "required": false,
      "values": ["0", "7", "30"]
    }
  ],
  "addons": [
    { "id": "addon_av", "name": "Extra AV", "price_cents": 15000, "currency": "EUR" }
  ]
}
```

Example response fragment for a plan **without** add-ons or optional packages:
```json
{
  "options": [],
  "addons": []
}
```

---

## API Endpoints

### Plan Creation
Plan creation is **not** exposed to candidates. Plans are **seeded in the DB** and are read‑only for the take‑home.
The goal is to evaluate how candidates handle **dynamic plan options** and estimate flows, not admin tooling.

### List Providers
```
GET /providers
```
Response:
```json
{
  "items": [
    { "id": "prov_a", "name": "Venue A", "location": "Berlin", "logo_url": "..." }
  ]
}
```

### List Plans
```
GET /plans?provider_id=prov_a
```
Response:
```json
{
  "items": [
    {
      "id": "plan_a",
      "provider_id": "prov_a",
      "name": "Venue A - Standard",
      "description": "Simple package",
      "base_price_cents": 50000,
      "currency": "EUR",
      "approval_type": "none",
      "min_participants": 25,
      "lead_time_days": 14,
      "options": [],
      "addons": []
    }
  ]
}
```

### Get Estimate
```
GET /estimate
```
Response:
```json
{
  "id": "est_123",
  "status": "draft",
  "plan": { "id": "plan_a", "name": "Venue A - Standard" },
  "selections": { "seating_type": "open", "addons": [] },
  "pricing": { "base": 50000, "addons": 0, "total": 50000, "currency": "EUR" },
  "blocking_reasons": []
}
```

### Update Estimate
```
PUT /estimate
```
Body:
```json
{
  "plan_id": "plan_b",
  "selections": {
    "seating_type": "reserved",
    "food_package": "full",
    "addons": ["addon_av"]
  }
}
```
Response:
```json
{
  "id": "est_123",
  "status": "draft",
  "selections": { "...": "..." },
  "pricing": { "base": 70000, "addons": 15000, "total": 85000, "currency": "EUR" },
  "blocking_reasons": []
}
```

### Finalise Estimate
```
POST /estimate/finalise
```
Response (approval required):
```json
{
  "id": "est_123",
  "status": "pending_approval"
}
```

---

## Plan Seeding (Required)
- Seed 2–4 providers with multiple plans each.
- Ensure plans differ in option groups and add‑ons (some have none).
- Do **not** expose any create/update endpoints for plans or providers.
- Candidates should only:
  - list providers and plans
  - configure an estimate
  - finalise a purchase

---

## Seed Data Matrix (Example)

Use this as a starting point for seed data. The goal is to create visible differences across plans.

| Provider | Plan | Options | Add-ons | Approval | Notes |
|---|---|---|---|---|---|
| Venue A | Standard | none | none | none | simplest flow |
| Venue A | Premium | seating_type, food_package | AV, photography | manager_review | approvals + addons |
| Venue B | Essentials | seating_type | none | none | required option |
| Venue B | Flex | seating_type, date_flex_window_days | host | none | date flexibility |
| Venue C | Corporate | food_package | AV, VIP host | manager_review | richer config |

Example option groups:
- `seating_type`: values `open`, `reserved` (required)
- `food_package`: values `none`, `light`, `full`
- `date_flex_window_days`: values `0`, `7`, `30`

Example add-ons:
- `addon_av` (Extra AV)
- `addon_photo` (Photography)
- `addon_host` (VIP host)

---

## Validation Rules (Examples)
- `min_participants` must be met
- required options (by `option_group.required`) must be present
- For approval-required plans, `finalise` moves to `pending_approval`

### Zod Validation (Required for SQLite)
Use Zod to validate enum-like fields and payload shapes on read/write:

```ts
const estimateStatusSchema = z.enum([
  'draft',
  'submitted',
  'quote_available',
  'pending_approval',
  'finalised',
  'rejected',
  'expired',
]);

const approvalTypeSchema = z.enum(['none', 'manager_review']);
```

Validate:
- `event_estimate.status`
- `event_plan.approval_type`
- any option/add-on references in `selections`

---

## Error Shapes (Example)
```json
{
  "error": {
    "code": "validation_error",
    "message": "Missing required field: seating_type"
  }
}
```

---

## Exposed Endpoints (Final List)

These are the **only** endpoints exposed to candidates:

- `GET /providers`  
- `GET /plans?provider_id=...`  
- `GET /estimate`  
- `PUT /estimate`  
- `POST /estimate/finalise`  

---

## Notes for FE
- Treat options/addons as business capabilities, not UI fields.
- There is no UI schema. Candidate chooses how to render options.
- Always handle unknown option codes gracefully.
- Use `blocking_reasons` to explain why finalise is disabled.
