# Event Ticketing Take-Home (Frontend)

## Summary
Build a multi-step "Event Package Builder" for employers to configure a company event package. Plans differ by venue and expose different **business options** (add-ons, seating types, food packages, date flexibility). The UI must adapt to these dynamic options, show pricing updates, and handle estimate status transitions.

You are given an API (or mock data) backed by **SQLite**. Plans and providers are **seeded and read-only**. Focus on product thinking and clarity as much as engineering quality.

---

## Goals
- Help an employer select a provider and plan, configure options, and submit to finalize.
- Adapt to plan-specific configuration fields delivered by the API.
- Make constraints and required inputs obvious and easy to complete.

---

## Scope
Implement the following screens (or equivalent flow):
1. Provider + plan selection
2. Plan configuration (dynamic **options**)
3. Review + submit
4. Status states (submitted, pending_approval, finalised)

---

## API Inputs (High Level)
You will receive endpoints similar to:
- `GET /providers`
- `GET /plans?provider_id=...`
- `GET /estimate`
- `PUT /estimate`
- `POST /estimate/finalise`

Plans include **options** and **add-ons** (business-level). There is **no UI schema**; you decide how to render the available choices.

---

## Required UI Behaviors
- Render plan-specific **options** and add-ons (how you render is your choice).
- Reset or warn when switching plans if selections become incompatible.
- Display "required" vs "optional" clearly.
- Show pricing updates as selections change.
- Show a clean "pending approval" state for plans that require approval.
- Handle empty, loading, and error states gracefully.

---

## Edge Cases to Handle
- No providers returned
- Provider has no plans
- Estimate not found (or status mismatch)
- Validation errors on `PUT /estimate`
- Unknown option codes (handle defensively)

---

## Deliverables
- A working UI (app or SPA) that demonstrates the flow
- A short README describing decisions, tradeoffs, and next steps
- Optional: tests if you have time (explain if not)

---

## Timebox
Suggested 4-6 hours. Prioritize product clarity and dynamic config handling over pixel perfection.

---

## Evaluation (High Level)
- Product sense: clear hierarchy, good defaults, and thoughtful flow
- Engineering: component structure, state management, and robustness
- Design: layout, readability, and polish
- Accessibility: focus states, semantics, and keyboard usability

---

## Optional Enhancements (if time allows)
- Plan comparison view
- Autosave or optimistic updates on configuration
- Loading skeletons for plan details
- "Why is this required?" helper copy based on rules

---

## Technical Context (SQLite + Validation)
- The backend uses **SQLite**. Enum-like fields are stored as text and validated server-side.
- Expect the API to return only business options and add-ons (no UI schema).
- Plans are **seeded**; you cannot create or edit plans in the UI.
