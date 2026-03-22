# WonderQuest UI Agent Requests

Use this file as the current engineering-facing request list. The goal is to
produce route-specific assets that can be ported into the live WonderQuest app
without re-inventing layouts in code.

## Working Rules

- Keep using `design-system.css` as the source of truth for tokens.
- Keep audience separation strong:
  - child = visual, playful, low-text
  - parent = calm, trustworthy, actionable
  - teacher = instructional, structured, insight-driven
  - owner = operational, product-focused
- Favor route deliverables over abstract concept boards.
- Give desktop and mobile versions for major routes.
- Keep everything child-safe and family-safe.
- Do not introduce peer chat, leaderboards, lobbies, or multiplayer mechanics.
- For ages `2–5`, avoid text-heavy patterns and assume limited independent
  reading ability.

## Priority 1: Child Setup Route

Need a dedicated route asset for `/child`, not just pieces embedded in other
renderings.

Please design:

- band selection screen
- avatar selection screen
- username + 4-digit PIN setup
- returning child PIN entry
- wrong PIN / recovery state
- welcome-back state

Important:

- this should feel more visual than textual
- use strong tap targets
- make the PIN flow feel like a game, not a form

Suggested deliverable:

- `child-setup.html`

## Priority 2: Early Learner Play States

The live app still needs stronger visual-first patterns for ages `2–5`.

Please design route/state assets for `/play` that cover:

- counting questions using visible objects
- letter recognition
- sound/phonics matching
- picture-word association
- correct answer celebration
- wrong answer gentle recovery
- explainer state
- no-audio fallback state
- session complete celebration

Important:

- minimal reading requirement
- visual prompt first, text second
- clear replay / listen-again affordances
- slower, calmer early-learner pacing

Suggested deliverable:

- `play-early-learner.html`

## Priority 3: Parent Route Completion

The current parent route is functional but not test-ready for a real parent.
The missing areas are specific and should be designed explicitly.

Please design:

- parent first-time access / linkage flow
- linked-child management center
  - child switcher
  - confirm linked child
  - wrong child / relink flow
- parent dashboard with:
  - time spent
  - effective time
  - strengths
  - support areas
  - recent activity
  - clear next recommended action
- progress-over-time section
- notification preferences/settings center
- empty states
- error states

Important:

- the design should answer:
  - how is my child doing?
  - what changed recently?
  - what should I do next?

Suggested deliverables:

- `parent-access.html`
- `parent-hub-v2.html`
- `parent-settings.html`

## Priority 4: Teacher Gate + Analytics Completion

Please extend the teacher route assets to include:

- teacher gate / code entry
- dashboard empty state
- class support queue
- skill drilldown pattern
- class filter states
- recent activity / intervention panel

Suggested deliverables:

- `teacher-gate.html`
- `teacher-analytics-v2.html`

## Priority 5: Owner Gate + Ops Completion

Please extend the owner route assets to include:

- owner gate / code entry
- feedback triage queue states
- route health view
- content health view
- adoption by band
- empty and alert states

Suggested deliverables:

- `owner-gate.html`
- `owner-console-v2.html`

## Priority 6: Landing / Home Route

Engineering is already porting a first visible landing refresh into the live
app, but we still need a stronger canonical route asset for `/`.

Please provide:

- landing page desktop
- landing page mobile
- route launcher cards for child / parent / teacher / owner
- trust/safety strip
- short live-status strip

Important:

- home should be a launcher, not a dashboard
- child CTA first, parent second, teacher third, owner last

Suggested deliverable:

- `landing-page.html`

## Delivery Format

For each new file:

- use the existing design token system
- include route-specific notes inline
- keep classes reusable where practical
- prefer implementation-friendly HTML/CSS over decorative concept-only output

## Current Engineering Reality

Already live in the app:

- child PIN entry
- parent/teacher/owner working routes
- early learner play improvements
- audience-specific adult shells

Still being improved live:

- home route redesign
- deeper parent route maturity
- richer child visual-first play states

The best next design work is the missing route and state coverage above.

## Update Protocol

Please use this same file for status updates so engineering can poll one place.

At the bottom of the file, append updates in this format:

```md
## Status Updates

### 2026-03-21 HH:MM
- completed:
- added files:
- current focus:
- blockers:
- notes for engineering:
```

Rules:

- append new updates rather than rewriting older ones
- mention exact file names you created or changed
- keep blockers concrete
- if a route is complete, say which states are covered
- if you changed design direction, explain why in one short note

## Status Updates

### 2026-03-21 22:14 CDT
- completed:
  - engineering shipped the returning-child access slice into the live app
  - child route now includes access-mode choice, returning PIN path, and gentle recovery messaging
  - current reference files now present in `ui-agent/` include:
    - `child-setup.html`
    - `play-early-learner.html`
    - `parent-access.html`
    - `parent-hub-v2.html`
    - `parent-settings.html`
    - `teacher-gate.html`
    - `teacher-analytics.html`
    - `owner-gate.html`
    - `owner-console-v2.html`
- added files:
  - no new engineering-request file needed; keep using this file as the single polling target
- current focus:
  - make `parent-hub-v2.html` the canonical parent dashboard asset
  - create a richer analytics follow-up asset named `teacher-analytics-v2.html`
  - confirm `owner-console-v2.html` covers feedback triage, route health, content health, and adoption-by-band states
- blockers:
  - `teacher-analytics-v2.html` does not exist yet; only `teacher-analytics.html` is currently in the folder
  - engineering does not want dashboard over-design before the child + parent alpha path is smooth
- notes for engineering:
  - treat `parent-hub-v2.html` as the parent hub source of truth and prefer it over `parent-hub.html`
  - home route is already getting ported live, so do not spend the next round on another home variation unless a major gap is discovered
  - for the next round, bias toward:
    1. parent hub depth
    2. teacher analytics v2
    3. owner console v2 polish
  - keep everything route-specific and implementation-friendly
