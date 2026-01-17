# Data Model

This document describes the complete data model of the corporate event management system, including all entities, relationships, and workflows.

---

## 📋 Table of Contents

1. [Main Entities](#main-entities)
2. [Relationships](#relationships)
3. [States and Enums](#states-and-enums)
4. [Workflow](#workflow)
5. [Key Concepts](#key-concepts)
6. [Examples](#examples)

---

## 🏗️ Main Entities

### 1. Event Provider

Represents a provider or venue that offers corporate events.

**Table:** `event_provider`

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Unique identifier of the provider |
| `name` | text | Provider name (e.g., "Venue A") |
| `location` | text | Provider location (e.g., "Berlin") |
| `logo_url` | text (nullable) | URL of the provider's logo |
| `created_at` | timestamp | Record creation date |

**Relationships:**
- **1:N** with `event_plan` - A provider can have multiple plans

**Example:**
```json
{
  "id": "prov_a",
  "name": "Venue A",
  "location": "Berlin",
  "logo_url": "https://example.com/logos/venue-a.svg",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### 2. Event Plan

Represents a package offered by a provider with base price and specific configuration.

**Table:** `event_plan`

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Unique identifier of the plan |
| `provider_id` | text (FK) | Reference to the provider |
| `name` | text | Plan name (e.g., "Venue A - Premium") |
| `description` | text | Detailed description of the plan |
| `base_price_cents` | integer | Base price in cents |
| `currency` | text | Currency (e.g., "EUR", "USD") |
| `approval_type` | text | Approval type: `"none"` or `"manager_review"` |
| `min_participants` | integer | Minimum number of participants required |
| `lead_time_days` | integer | Days in advance required to book |
| `created_at` | timestamp | Record creation date |

**Relationships:**
- **N:1** with `event_provider` - Belongs to a provider
- **1:N** with `plan_addon` - Can have multiple addons
- **1:N** with `plan_option_group` - Can have multiple option groups
- **1:N** with `event_estimate` - Can have multiple estimates

**Example:**
```json
{
  "id": "plan_a_premium",
  "provider_id": "prov_a",
  "name": "Venue A - Premium",
  "description": "Premium package with seating and food options",
  "base_price_cents": 70000,
  "currency": "EUR",
  "approval_type": "manager_review",
  "min_participants": 30,
  "lead_time_days": 21,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### 3. Plan Addon

Represents optional additional services that can be added to a plan.

**Table:** `plan_addon`

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Unique identifier of the addon |
| `plan_id` | text (FK) | Reference to the plan |
| `name` | text | Addon name (e.g., "Extra AV") |
| `price_cents` | integer | Addon price in cents |
| `currency` | text | Addon currency |

**Relationships:**
- **N:1** with `event_plan` - Belongs to a plan

**Addon examples:**
- `addon_av` - Extra AV Equipment
- `addon_photo` - Photography Service
- `addon_host` - VIP Host Service

**Example:**
```json
{
  "id": "addon_av",
  "plan_id": "plan_a_premium",
  "name": "Extra AV",
  "price_cents": 15000,
  "currency": "EUR"
}
```

---

### 4. Plan Option Group

Represents a group of configurable options for a plan (e.g., seating type, food package).

**Table:** `plan_option_group`

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Unique identifier of the group |
| `plan_id` | text (FK) | Reference to the plan |
| `code` | text | Group identifier code (e.g., `"seating_type"`) |
| `description` | text (nullable) | Description of the option group |
| `required` | boolean | Indicates if selecting a value is mandatory |

**Relationships:**
- **N:1** with `event_plan` - Belongs to a plan
- **1:N** with `plan_option_value` - Has multiple possible values

**Code examples:**
- `seating_type` - Seating type
- `food_package` - Food package
- `date_flex_window_days` - Date flexibility window

**Example:**
```json
{
  "id": "opt_group_seating",
  "plan_id": "plan_a_premium",
  "code": "seating_type",
  "description": "Choose your seating arrangement",
  "required": true
}
```

---

### 5. Plan Option Value

Represents the possible values within an option group.

**Table:** `plan_option_value`

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Unique identifier of the value |
| `option_group_id` | text (FK) | Reference to the option group |
| `value` | text | Specific value (e.g., `"open"`, `"reserved"`) |
| `price_cents` | integer (nullable) | Optional price delta in cents |
| `currency` | text (nullable) | Currency of the price delta |

**Relationships:**
- **N:1** with `plan_option_group` - Belongs to an option group

**Example:**
```json
{
  "id": "opt_val_open",
  "option_group_id": "opt_group_seating",
  "value": "open",
  "price_cents": null,
  "currency": null
}
```

**Example with price delta:**
```json
{
  "id": "opt_val_reserved",
  "option_group_id": "opt_group_seating",
  "value": "reserved",
  "price_cents": 5000,
  "currency": "EUR"
}
```

---

### 6. Event Estimate

Represents the configuration of an event in progress, with status and user selections.

**Table:** `event_estimate`

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Unique identifier of the estimate |
| `employer_id` | text | ID of the employer/client creating the estimate |
| `plan_id` | text (FK) | Reference to the selected plan |
| `status` | text | Current status of the estimate (see [States](#states-and-enums)) |
| `selections` | JSON | User selections (chosen options and addons) |
| `pricing` | JSON | Price calculation (base, addons, total) |
| `submitted_at` | timestamp (nullable) | Date when the estimate was submitted |
| `finalised_at` | timestamp (nullable) | Date when the estimate was finalised |
| `updated_at` | timestamp | Last update date |

**Relationships:**
- **N:1** with `event_plan` - Belongs to a plan
- **1:N** with `estimate_blocker` - Can have multiple blockers

**`selections` structure (JSON):**
```json
{
  "addons": ["addon_av", "addon_photo"],
  "seating_type": "reserved",
  "food_package": "full",
  "date_flex_window_days": "7"
}
```

**`pricing` structure (JSON):**
```json
{
  "base": 70000,
  "addons": 30000,
  "total": 100000,
  "currency": "EUR"
}
```

**Complete example:**
```json
{
  "id": "est_demo",
  "employer_id": "emp_123",
  "plan_id": "plan_a_premium",
  "status": "draft",
  "selections": {
    "addons": ["addon_av"],
    "seating_type": "reserved",
    "food_package": "full"
  },
  "pricing": {
    "base": 70000,
    "addons": 15000,
    "total": 85000,
    "currency": "EUR"
  },
  "submitted_at": null,
  "finalised_at": null,
  "updated_at": "2024-01-17T15:30:00Z"
}
```

---

### 7. Estimate Blocker

Represents reasons why an estimate cannot be finalised.

**Table:** `estimate_blocker`

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Unique identifier of the blocker |
| `estimate_id` | text (FK) | Reference to the blocked estimate |
| `reason` | text | Blocking reason |

**Relationships:**
- **N:1** with `event_estimate` - Belongs to an estimate

**Reason examples:**
- `"Missing required field: seating_type"`
- `"Minimum participants not met"`
- `"Invalid option value for food_package"`

**Example:**
```json
{
  "id": "blocker_001",
  "estimate_id": "est_demo",
  "reason": "Missing required field: seating_type"
}
```

---

## 🔗 Relationships

### Relationship Diagram

```
event_provider (1) ──< (N) event_plan (1) ──< (N) plan_addon
                                    │
                                    │ (1)
                                    │
                                    └──< (N) plan_option_group (1) ──< (N) plan_option_value
                                    │
                                    │ (1)
                                    │
                                    └──< (N) event_estimate (1) ──< (N) estimate_blocker
```

### Relationship Summary

| Entity | Relationship | Related Entity | Cardinality |
|--------|--------------|----------------|-------------|
| `event_provider` | has | `event_plan` | 1:N |
| `event_plan` | belongs to | `event_provider` | N:1 |
| `event_plan` | has | `plan_addon` | 1:N |
| `plan_addon` | belongs to | `event_plan` | N:1 |
| `event_plan` | has | `plan_option_group` | 1:N |
| `plan_option_group` | belongs to | `event_plan` | N:1 |
| `plan_option_group` | has | `plan_option_value` | 1:N |
| `plan_option_value` | belongs to | `plan_option_group` | N:1 |
| `event_plan` | has | `event_estimate` | 1:N |
| `event_estimate` | belongs to | `event_plan` | N:1 |
| `event_estimate` | has | `estimate_blocker` | 1:N |
| `estimate_blocker` | belongs to | `event_estimate` | N:1 |

---

## 📊 States and Enums

### Estimate States

The `status` field in `event_estimate` can have the following values:

| State | Description |
|-------|-------------|
| `draft` | The estimate is in draft, can be modified |
| `submitted` | The estimate has been submitted for processing |
| `quote_available` | A quote is available for review |
| `pending_approval` | The estimate is awaiting manager approval |
| `finalised` | The estimate has been finalised and approved |
| `rejected` | The estimate has been rejected |
| `expired` | The estimate has expired |

### Approval Type

The `approval_type` field in `event_plan` can have the following values:

| Type | Description |
|------|-------------|
| `none` | No approval required, can be finalised directly |
| `manager_review` | Requires manager approval before finalising |

---

## 🔄 Workflow

### Main Estimate Flow

```
┌─────────┐
│  Draft  │ ← Initial state when an estimate is created
└────┬────┘
     │ User updates plan/selections
     ▼
┌─────────────┐
│   Draft    │ ← Can return to this state multiple times
└─────┬───────┘
      │ User submits
      ▼
┌──────────────┐
│  Submitted  │ ← Estimate sent for processing
└──────┬───────┘
       │ Backend processing
       ▼
┌──────────────────┐
│ Quote Available  │ ← Quote generated
└────────┬─────────┘
         │ User finalises
         ▼
    ┌────────┐
    │ Requires│
    │ Approval?│
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   NO        YES
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────────┐
│Finalised│ │ Pending Approval │
└─────────┘ └────────┬──────────┘
                     │
                     │ Manager approves/rejects
                     ▼
            ┌────────┴────────┐
            │                │
            ▼                ▼
      ┌──────────┐    ┌──────────┐
      │Finalised │    │ Rejected │
      └──────────┘    └──────────┘
```

### Detailed Steps

1. **Provider Selection**
   - User lists all available providers
   - Selects a provider of interest

2. **Plan Visualization**
   - User lists plans available for the selected provider
   - Each plan shows:
     - Base price
     - Available options (option groups)
     - Available addons
     - Requirements (min_participants, lead_time_days)

3. **Estimate Configuration**
   - User selects a plan
   - Configures required and optional options
   - Selects desired addons
   - System automatically calculates pricing

4. **Draft State**
   - Estimate is created/updated in `draft` state
   - Can be modified multiple times
   - Basic validations are applied (required fields)

5. **Estimate Submission**
   - User submits the estimate
   - Status changes to `submitted`
   - Complete validations are executed

6. **Processing**
   - Backend processes the estimate
   - Status may change to `quote_available`

7. **Finalisation**
   - User attempts to finalise the estimate
   - If `approval_type` is `"none"`: status → `finalised`
   - If `approval_type` is `"manager_review"`: status → `pending_approval`

8. **Approval (if applicable)**
   - Manager reviews the estimate
   - Can approve: status → `finalised`
   - Can reject: status → `rejected`

---

## 🎯 Key Concepts

### 1. Plans are Read-Only

- Plans are **seeded** in the database
- **No CRUD endpoints** for creating/editing plans
- Goal is to evaluate how dynamic options are handled, not building admin tools

### 2. Options as Business Capabilities

- Backend exposes **business options** and allowed values
- **Does not prescribe how to render them** in the UI
- Frontend decides how to present options (selects, radios, cards, etc.)

### 3. Pricing Calculated in Backend

- Frontend **displays** prices but **does not calculate** final totals
- Option/addon price deltas may exist
- Backend is the source of truth for pricing calculations

### 4. Validation with Zod

- SQLite does not have native enums
- Enum-like fields are validated with **Zod** on read/write
- Examples: `estimateStatusSchema`, `approvalTypeSchema`

### 5. Estimate Lifecycle

- Reflects typical corporate approval steps
- Transitional states allow process tracking
- Blockers explain why finalisation is not possible

### 6. No UI Schema

- No definition of how options should be rendered
- Candidate decides the best UX to communicate available options
- Must gracefully handle unknown option codes

---

## 📝 Examples

### Example 1: Simple Plan (No Options or Addons)

```json
{
  "id": "plan_a_standard",
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
```

### Example 2: Complex Plan (With Options and Addons)

```json
{
  "id": "plan_a_premium",
  "provider_id": "prov_a",
  "name": "Venue A - Premium",
  "description": "Premium package with seating and food options",
  "base_price_cents": 70000,
  "currency": "EUR",
  "approval_type": "manager_review",
  "min_participants": 30,
  "lead_time_days": 21,
  "options": [
    {
      "code": "seating_type",
      "description": "Choose your seating arrangement",
      "required": true,
      "values": ["open", "reserved"]
    },
    {
      "code": "food_package",
      "description": "Select food package",
      "required": false,
      "values": ["none", "light", "full"]
    }
  ],
  "addons": [
    {
      "id": "addon_av",
      "name": "Extra AV",
      "price_cents": 15000,
      "currency": "EUR"
    },
    {
      "id": "addon_photo",
      "name": "Photography",
      "price_cents": 20000,
      "currency": "EUR"
    }
  ]
}
```

### Example 3: Complete Estimate

```json
{
  "id": "est_123",
  "status": "draft",
  "plan": {
    "id": "plan_a_premium",
    "name": "Venue A - Premium"
  },
  "selections": {
    "addons": ["addon_av"],
    "seating_type": "reserved",
    "food_package": "full"
  },
  "pricing": {
    "base": 70000,
    "addons": 15000,
    "total": 85000,
    "currency": "EUR"
  },
  "blocking_reasons": []
}
```

### Example 4: Estimate with Blockers

```json
{
  "id": "est_456",
  "status": "draft",
  "plan": {
    "id": "plan_b_essentials",
    "name": "Venue B - Essentials"
  },
  "selections": {
    "addons": []
  },
  "pricing": {
    "base": 60000,
    "addons": 0,
    "total": 60000,
    "currency": "EUR"
  },
  "blocking_reasons": [
    "Missing required field: seating_type"
  ]
}
```

---

## 🔍 Example Data Matrix (Seed Data)

| Provider | Plan | Options | Addons | Approval | Notes |
|----------|------|---------|--------|----------|-------|
| Venue A | Standard | none | none | none | Simplest flow |
| Venue A | Premium | seating_type, food_package | AV, photography | manager_review | Approvals + addons |
| Venue B | Essentials | seating_type | none | none | Required option |
| Venue B | Flex | seating_type, date_flex_window_days | host | none | Date flexibility |
| Venue C | Corporate | food_package | AV, VIP host | manager_review | Rich configuration |

### Common Option Groups

- **`seating_type`**: values `["open", "reserved"]` (required)
- **`food_package`**: values `["none", "light", "full"]` (optional)
- **`date_flex_window_days`**: values `["0", "7", "30"]` (optional)

### Common Addons

- **`addon_av`**: Extra AV Equipment
- **`addon_photo`**: Photography Service
- **`addon_host`**: VIP Host Service

---

## 📚 References

- [Design Document](./design-doc.md) - Complete system design document
- [API Schemas](./apps/api/src/domain/schemas.ts) - Zod schemas for validation
- [Database Schema](./apps/api/src/db/schema.ts) - Drizzle ORM database schema

---

**Last updated:** January 2024

