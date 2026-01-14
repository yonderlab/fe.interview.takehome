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

## Timebox
Suggested **1-2 hours** if you are using AI first to generate the code. If you are not using AI please don't spend more than 2 hours working on this. **We expect senior candidates to demonstrate depth over breadth. It's better to implement fewer features with robust error handling, accessibility, and clear reasoning than to cover everything superficially.**

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

## Ambiguous Scenarios (Document Your Decisions)

The following scenarios are intentionally underspecified. There is no single "right" answer—we want to see your product thinking:

1. **Stale pricing**: The user configures an estimate, steps away, and returns. Meanwhile, server-side prices have changed. When they resume, the displayed price differs from what the server returns. How do you handle price drift?

2. **Partial selection preservation on plan switch**: User selects Plan A and chooses `seating_type: reserved`. They then switch to Plan B, which also has a `seating_type` option but with different allowed values (e.g., `open`, `theater`, `banquet`). Should you:
   - Clear all selections?
   - Preserve compatible selections?
   - Show a warning before switching?

3. **Single-value options**: Some option groups have only one allowed value. Is this really a "choice"? How should the UI represent it?

4. **Unknown option codes**: The API may return option codes your UI doesn't have a friendly label for. How do you render these gracefully?

Document your decisions and reasoning in your README.

---

## API Edge Cases

The seed data includes intentional quirks to test defensive coding:

- A provider with an **empty location** field
- A provider with a **null logo URL**
- An option group with **only one allowed value**
- An option code your UI **won't recognize** (`catering_license_tier`)
- An add-on with **zero price** (free)
- Option values that look like numbers but are strings (`"1"`, `"2"`, `"3"`)

Your UI should handle all of these gracefully without crashing or displaying broken states.

---

## Deliverables
- A working UI (app or SPA) that demonstrates the flow
- A short README describing decisions, tradeoffs, and next steps
- Optional: tests if you have time (explain if not)

---

## Evaluation Criteria

| Dimension | What We're Looking For |
|-----------|------------------------|
| **Product Sense** | Clear hierarchy, thoughtful defaults, constraint visibility, informed decision-making on ambiguous cases |
| **Engineering** | Component structure, state management, error handling, defensive coding against API quirks |
| **Accessibility** | Keyboard navigation, focus management, ARIA usage, screen reader compatibility |
| **Robustness** | Graceful handling of edge cases, empty states, loading states, and errors |
| **Communication** | Clear README documenting decisions, tradeoffs, and reasoning |

---

## Product Reasoning (Required)

Your README must include a section addressing:

1. **Information hierarchy**: How did you decide what information to emphasize vs. de-emphasize? Why?

2. **Constraint communication**: Plans have different constraints (approval required, minimum participants, lead time). How do you surface these so users can make informed choices *before* selecting?

3. **Error recovery**: When something goes wrong (network error, validation failure), what is the user's path forward? How do you preserve their work?

4. **One decision you'd revisit**: What's one UX or technical decision you made that you'd reconsider with more time? Why?

We value clear reasoning over perfect execution.

---

## Accessibility Requirements

Accessibility is a first-class requirement, not a nice-to-have:

- **Keyboard navigation**: All interactive elements must be reachable and operable via keyboard (Tab, Enter, Space, Arrow keys where appropriate)
- **Focus management**: When views change (e.g., moving between steps, opening modals), focus must move logically
- **Screen reader support**: Dynamic content updates (pricing changes, validation errors) must be announced via ARIA live regions
- **Form semantics**: Proper labels, fieldsets, and error associations

**Deliverable**: Include a brief accessibility summary in your README noting:
- Tools used for testing (e.g., axe, Lighthouse, VoiceOver)
- Any known accessibility gaps and why they remain

---

## Optional Enhancements (if time allows)
- Plan comparison view
- Autosave or optimistic updates on configuration
- Loading skeletons for plan details
- "Why is this required?" helper copy based on rules

---
