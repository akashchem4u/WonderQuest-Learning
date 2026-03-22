# WonderQuest Beta Staging Plan

WonderQuest should not jump directly from `test-ready alpha` to a broad
`final MVP` claim.

The right path is:

`Internal prototype -> Test-ready alpha -> Controlled beta -> MVP`

This document defines what `beta` means for WonderQuest after the current alpha
hardening work is finished.

## Current Position

As of the current build, WonderQuest is close to a `test-ready alpha` but is
not yet a full `beta`.

What is already materially in place:

- live child, parent, teacher, and owner routes
- Supabase-backed profile, session, and feedback flows
- early-learner voice + visual support patterns
- parent family visibility and selected-child context
- teacher skill drilldown
- owner triage and operational detail routes
- Render deployment and local smoke verification

What is still alpha-closing work:

- final route-level visual adoption from the design references
- stronger audience-specific backgrounds and palette separation
- tighter mobile and tablet QA
- final child reward / return overlays
- last parent simplification pass so the route feels product-like instead of form-first

## Beta Goal

`Controlled beta` means WonderQuest is ready for real-world guided testing with
selected families and trusted reviewers, without pretending the product is
complete.

Beta is not “ship everything.”
Beta is “stable enough, clear enough, and motivating enough for repeated real use.”

## Beta Scope

Beta should include:

- ages `2–5`, `K–1`, `2–3`, and `4–5` launch bands
- child access and returning-child flows
- parent setup, child linking, and family-center visibility
- early-learner play loop with voice support and recovery
- reward and return motivation states
- teacher route with overview and skill drilldown
- owner route with triage, route health, and content-health basics
- feedback capture and categorization
- responsive behavior across phone, tablet, and laptop

Beta should still exclude:

- peer-to-peer chat
- public leaderboards
- multiplayer / live room modes
- school roster import depth
- heavy analytics exports
- native iOS / Android builds
- large-scale adaptive factory coverage beyond the current seeded scope

## Beta Exit Criteria

WonderQuest reaches `controlled beta` only when all of these are true:

### 1. Child Experience Gate

- a child can enter or return with minimal friction
- early learners can complete short loops with visuals and voice, not reading dependency
- wrong answers feel supportive, not punishing
- reward moments are visible and motivating
- return moments make saved progress feel real

### 2. Parent Experience Gate

- a parent can link and switch children without confusion
- a parent can answer:
  - how is my child doing right now?
  - what changed recently?
  - what should I try next at home?
- parent language stays plain and calm
- family management and notification settings are understandable

### 3. Teacher / Owner Gate

- teacher route shows actionable support lanes and drilldown
- owner route supports issue triage and route/content visibility
- adult routes feel intentionally distinct from child routes

### 4. Reliability Gate

- `npm run lint` passes
- `npm run build` passes
- `npm run smoke:local` passes on a production build
- Render checks pass after deploy
- no obvious broken paths on phone, tablet, or laptop

### 5. Design Gate

- route shells are no longer reusing one generic background system
- child, parent, teacher, and owner feel visually distinct
- home feels like a launcher, not a leftover dashboard
- the product no longer looks like a mixed prototype state

## Immediate Post-Alpha Beta Work

Once alpha closes, the next beta work should happen in this order:

1. finalize route-level UI adoption from the `ui-agent` references
2. finish background / palette separation by audience
3. complete child reward and return overlays
4. complete parent family-center and skill-detail integration
5. tighten teacher and owner interaction details
6. run responsive QA and bug cleanup
7. do controlled family testing and capture findings

## Beta Test Shape

Recommended beta group:

- 1 to 3 families
- 1 or 2 children per band where possible
- owner-led observation, not broad public testing

Recommended beta feedback questions:

- did the child understand what to do without heavy adult translation?
- did the parent understand what happened afterward?
- did the child want to come back?
- what parts still felt prototype-like or confusing?

## Decision Rule

Do not call WonderQuest `MVP` just because the main routes exist.

Call it:

- `test-ready alpha` when the current gates pass for controlled owner testing
- `controlled beta` when selected real families can use it repeatedly without heavy rescue
- `MVP` only after the beta loop hardens the product into something repeatable and trustworthy
