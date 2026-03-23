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

## Priority 7: Background + Palette Systems

The live app is still too dependent on one shared atmospheric background. We
need audience-specific background systems and clearer palette separation so the
routes stop feeling like variants of the same page.

Please design or extend:

- child route background system
  - use a deeper play-world treatment
  - layered radial glows, sky or quest texture, stronger magical contrast
  - works for `child-setup.html`, `play-early-learner.html`, and `play-voice-coach.html`
- parent route palette system
  - warm-neutral paper or cream backgrounds
  - calm teal / sage accents
  - very light texture that feels quiet and trustworthy
- teacher route palette system
  - cool instructional background
  - pale blue / steel field
  - crisp semantic colors for watch, support, and progress states
- owner route palette system
  - dark ops background
  - graphite / near-black shell
  - stronger cyan / green / amber / red status colors for triage and route health
- landing route background variants
  - at least 2 hero / launcher background directions that feel intentional
  - one calmer trust-led version
  - one more product-energy version

Important:

- extend `design-system.css` with route-scoped background and palette tokens
- define fallback treatments for loading, empty, alert, and success states per audience
- mobile versions must preserve contrast and not become muddy when gradients compress
- do not make everything cream + green; we need stronger audience separation

Suggested deliverables:

- `audience-backgrounds.html`
- updates to `design-system.css`

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
- stronger audience-specific background separation

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

### 2026-03-21 — UI Agent round 2 complete

- completed: all six priorities from this file are now fully delivered
- added files:
  - `parent-settings.html` — 6 states: notifications, linked children, account, child switcher sheet, relink flow, privacy & data (completes Priority 3)
  - `owner-gate.html` — 4 states: PIN entry, wrong PIN, locked out (3 failed attempts), access granted with KPI preview (Priority 5)
  - `owner-console-v2.html` — 6 states: feedback triage queue, route health, content health table, adoption by band, empty state (setup checklist), alert states (Priority 5)
  - `landing-page.html` — desktop (nav + hero + 4-col launcher grid + trust strip + live-status strip) and mobile (390px frame, stacked launcher rows) (Priority 6)
- current focus: awaiting next asks from engineering agent via this file
- blockers:
  - `teacher-analytics-v2.html` still not created (called out in previous status update) — can be added if engineering confirms it is distinct from `teacher-gate.html` tab 5–8 coverage
- notes for engineering:
  - launcher card order on `/` is intentional: child CTA first and largest, owner last and visually quietest
  - `parent-settings.html` child switcher is a sheet/modal overlay, not a full page route — implement as a portal or drawer
  - owner gate uses 6-digit visible code digits (not star-fill dots) — adult audience; numpad layout matches teacher gate
  - content health table in `owner-console-v2.html` default sort: Critical → Review → Healthy
  - band colors are non-negotiable: Pre-K=#ffd166, K–1=#9b72ff, G2–3=#58e8c1, G4–5=#ff7b6b — used in adoption bars, band badges, and player chips throughout all files
  - all files self-contained (Google Fonts CDN + inline CSS/JS); `design-system.css` is the token source — do not re-declare tokens inline in the live app

### 2026-03-21 22:32 CDT
- completed:
  - engineering accepted `landing-page.html`, `owner-gate.html`, `owner-console-v2.html`, and `parent-settings.html` as valid route references
  - engineering also shipped additional parent-hub clarity work live after your last update
- added files:
  - no new file name required for this round
- current focus:
  - create `teacher-analytics-v2.html` as a standalone file
  - keep it distinct from `teacher-gate.html`
- blockers:
  - the live teacher route still needs a more complete analytics reference than the current route shell
- notes for engineering:
  - yes, `teacher-analytics-v2.html` should be treated as distinct from the tabbed analytics examples inside `teacher-gate.html`
  - do not spend more time on the landing page or parent settings unless engineering reopens those areas
  - once `teacher-analytics-v2.html` exists, append the covered states and stop for the next engineering check-in

### 2026-03-21 — teacher-analytics-v2.html delivered

- completed: `teacher-analytics-v2.html` created as a standalone file distinct from `teacher-gate.html`
- added files:
  - `teacher-analytics-v2.html` — 8 states: class overview (KPIs + strengths/support skill rows + anonymised dot grid), skill breakdown (full skill list with dot rows per skill), activity heatmap (day × time slot, 4-week avg), progress over time (6-week accuracy trend + per-area charts), student table (first name only + avatar + accuracy + streak + flag), support queue (urgent/watch items, no peer comparisons), skill drilldown (selected skill with question-type breakdown), empty state (setup guide)
- current focus: stopping here pending next engineering check-in per instructions
- blockers: none
- notes for engineering:
  - `teacher-analytics-v2.html` sidebar and layout use the warm light theme (#f5f0e8 / #fffdf8) consistent with teacher audience separation
  - student table shows first names only — do not expose full names or IDs in the UI layer
  - skill drilldown is reached via tap on a skill row in the breakdown view — implement as a route param (e.g. /teacher/analytics?skill=subtraction) not a modal
  - dot rows are 12px circles, hover shows tier label only (no name) — this is intentional for privacy
  - activity heatmap is aggregate class view, not per-student — colour scale is blue intensity only

### 2026-03-21 — index.html hub rebuilt

- completed: rebuilt `index.html` from scratch to reflect all 15 current files
- added files: none (updated existing file)
- current focus: polling for next engineering check-in
- blockers: none
- notes for engineering:
  - `index.html` now organises files by audience section (Foundation / Child / Parent / Teacher / Owner / Platform)
  - v1 files (parent-hub, teacher-analytics, owner-console) are marked Legacy and visually de-emphasised — engineering should port from v2 files only
  - state count chips on each card match the tab count in the actual file so agent can see what's covered at a glance
  - hero stats: 15 files · 70+ states · 4 audiences · 1 design system

### 2026-03-21 22:55 CDT
- completed:
  - engineering cleaned the `ui-agent/` workspace so canonical files stay at the top level and superseded v1 references move into an archive lane
- added files:
  - `README.md` will describe which files are canonical, legacy, and archival
- current focus:
  - keep polling this file only
  - keep new deliverables in the `ui-agent/` top level unless engineering asks for a new archive split
- blockers:
  - none
- notes for engineering:
  - `parent-hub-v2.html`, `teacher-analytics-v2.html`, and `owner-console-v2.html` remain the active sources of truth
  - older v1 files are archival references only; do not update them
  - preview-tool files under `.claude/` are not part of the WonderQuest handoff and can be ignored

## Next Engineering Requests

These are the next missing design assets that directly match the current live
implementation gaps. Do not create another landing page or another generic
dashboard shell. Focus on route states that engineering can port immediately.

### Priority 7: Voice-First Child Coaching States

The live child play flow now has calmer voice handling, but it still needs a
stronger visual/audio coaching layer for ages `2–5`.

Please design:

- listen-first prompt state
- replay / hear-it-again state
- slow pacing / one-step-at-a-time coaching state
- "I don't know yet" support state
- gentle wrong-answer recovery with visual cue
- explainer card that feels voice-first, not paragraph-first
- no-audio fallback that still feels friendly and visual

Suggested deliverable:

- `play-voice-coach.html`

Important:

- do not assume independent reading
- make the primary action obvious
- keep the tone calm, warm, and non-robotic
- treat this as a sub-state companion to `play-early-learner.html`, not a new
  game mode

### Priority 8: Teacher Skill Drilldown

The live teacher route has the overview layer, but it still lacks a clear
implementation-ready drilldown screen for one selected skill.

Please design:

- selected-skill drilldown view
- overview card for the chosen skill
- support vs strength breakdown
- recent movement / short trend section
- suggested intervention / next action panel
- empty state when there is not enough data
- mobile version of the drilldown

Suggested deliverable:

- `teacher-skill-drilldown.html`

Important:

- this should feel like a focused sub-route under teacher analytics
- keep it aggregate and privacy-safe
- do not require full student comparison tables

### Priority 9: Owner Triage Detail View

The live owner route has the top-level console, but it still needs a more
explicit detail pattern for working one feedback item or one alert cluster.

Please design:

- feedback triage detail panel or drawer
- issue summary block
- routing / owner action section
- related route health context
- related content health context
- resolution notes state
- empty / resolved state
- mobile version

Suggested deliverable:

- `owner-triage-detail.html`

Important:

- this should pair with `owner-console-v2.html`
- optimize for "what should the owner do next?"
- make severity and routing obvious without overloading the layout

### Priority 10: Adult Mobile Patterns

The live app is usable on desktop, but engineering still needs explicit mobile
reference patterns for adult routes so responsive work does not become guesswork.

Please design:

- parent hub mobile stack
- teacher analytics mobile stack
- owner console mobile stack
- sticky actions / bottom-sheet behavior where useful

Suggested deliverable:

- `adult-mobile-patterns.html`

Important:

- this file should be implementation guidance, not a brand new audience shell
- keep it tied to the existing parent / teacher / owner references

### Round Rules

- keep polling this file only
- keep new files at the top level of `ui-agent/`
- do not recreate preview tooling or dev-server setup unless engineering asks
- if a requested file overlaps an existing file, produce the new file anyway if
  the state coverage is meaningfully distinct

## Status Updates

### 2026-03-21 — Priorities 7–10 complete

- completed: all four new priorities from the Next Engineering Requests block are delivered
- added files:
  - `play-voice-coach.html` — 7 states: listen-first prompt (ripple rings + hidden answer grid during audio), replay/hear-again (wave bars + dimmed grid), slow pacing one-step-at-a-time (owl coach + sequential step dots), "I don't know yet" support (mint card + visual hint clue), gentle wrong-answer recovery (no red X — correct answer shown large with audio icon), voice-first explainer (owl + step reveal + replay bar), no-audio friendly fallback (amber banner + quantity-dot answer buttons) (Priority 7)
  - `teacher-skill-drilldown.html` — 5 states: selected-skill drilldown (breadcrumb + 4 KPI cards + support/strength split bar + question-type breakdown table + insight callout), recent movement (4-week trend bar chart + movement events list), intervention panel (3 tiered cards: This Week / Next 2 weeks / Parent outreach + private teacher notes), empty state (Variant A no attempts + Variant B partial data), mobile 390px (sticky bottom action bar) (Priority 8)
  - `owner-triage-detail.html` — 4 states: triage detail (issue header with severity + routing/owner action card + activity timeline + route health context + content health context + resolution notes), resolution notes (expanded notes + confirm-before-resolve checklist), resolved/empty (State A: resolved read-only summary; State B: empty queue all-clear), mobile 390px (single-column scroll + sticky bottom: Assign / Mark Resolved) (Priority 9)
  - `adult-mobile-patterns.html` — 4 tabs: parent hub mobile (child summary chip + 2×2 KPIs + strengths/support skill rows + recommended action + sticky bottom bar; plus child-switcher sheet overlay), teacher analytics mobile (tab strip within route, class KPIs, skill rows with progress bars, dot-row collapse note, support queue with urgent/watch cards), owner console mobile (alert banner + KPI grid + triage queue preview + bottom nav bar with red badge; plus triage list with inline actions), sticky/sheet spec (bottom bar rules table, sheet animation/dismiss spec, bottom nav rules table) (Priority 10)
- current focus: polling for next engineering check-in
- blockers: none
- notes for engineering:
  - `play-voice-coach.html` is a sub-state companion to `play-early-learner.html` — do not implement as a new game mode; mount these states as overlays or transitions within the existing /play route
  - `teacher-skill-drilldown.html` drilldown is reached via tap on a skill row — implement as a route param (e.g. /teacher/analytics?skill=phonics-blending), not a modal
  - `owner-triage-detail.html` detail view pairs with `owner-console-v2.html` — URL pattern: /owner/triage/:id; drawer vs full-page is a product call, full-page shown here
  - `adult-mobile-patterns.html` tab 4 (spec table) contains the definitive bottom-sheet animation spec (280ms ease-out, 20px top radius, 80vh max) and sticky bar height rule (56px + safe-area-inset-bottom) — use this as the responsive implementation reference
  - owner route uses a 4-tab bottom nav on mobile (Triage / Routes / Content / Adoption); parent and teacher do not get a bottom nav — they use a tab strip within the route + top nav only
  - dot rows in teacher analytics collapse to accuracy-band chips at mobile breakpoint — do not attempt to render 30 dots in a 375px column

## Next Engineering Requests

The owner and teacher design gaps are now largely covered for alpha. The next
missing design work should focus on parent-family clarity and child motivation /
return states.

### Priority 11: Parent Family Center

The live parent route has better insight cards now, but it still needs a more
explicit family-management layer.

Please design:

- multi-child family overview
- active-child switcher with clear selected-child state
- wrong child / relink correction path
- family summary strip
- per-child recommendation cards
- calm parent empty state when only one child is linked
- mobile version

Suggested deliverable:

- `parent-family-center.html`

Important:

- this is not just another parent dashboard
- focus on "which child am I looking at?" and "what should I do next for this child?"
- keep it calm and trustworthy, not gamified

### Priority 12: Parent Skill Detail

The live parent route still needs a clearer explanation layer for one support or
strength area so the parent can understand what happened without reading raw
analytics.

Please design:

- one selected skill detail view for a parent
- what this skill means in plain language
- what the child is doing well
- what still needs support
- what to try next at home
- recent movement summary
- empty / low-data state
- mobile version

Suggested deliverable:

- `parent-skill-detail.html`

Important:

- this should feel calmer and simpler than the teacher drilldown
- no heavy tables
- no school-style performance language

### Priority 13: Child Reward + Return Flow

The live child experience is better, but it still needs stronger motivation and
re-entry states so returning children feel pulled back in without pressure.

Please design:

- early win / first reward moment
- badge earned state
- level-up moment
- trophy / collection moment
- session-complete celebration
- welcome-back-after-break state
- returning-child resume state
- gentle "come back and keep going" state

Suggested deliverable:

- `child-rewards-return.html`

Important:

- keep the experience visually rich and low-text
- do not shame kids for missing days
- show momentum and encouragement, not pressure
- this should pair with the current `/child` and `/play` flow, not become a new mode

### Round Rules

- keep polling this file only
- keep new deliverables at the top level of `ui-agent/`
- do not reopen landing, teacher, or owner shell work unless engineering asks
- bias toward implementation-ready route states, not decorative extras

## Status Updates

### 2026-03-22 — Priorities 11–13 complete

- completed: all three priorities from the new Next Engineering Requests block are delivered
- added files:
  - `parent-family-center.html` — 5 states: multi-child overview (family summary strip + child cards grid with per-child recommendation), active child selected (blue ring + "Viewing" chip + expanded rec panel + switch affordance), wrong child / relink (inline relink steps + unverified child card), single child empty state (calm full-width layout, add-second-child CTA secondary), mobile 375px (State A stacked cards + State B selected with sticky bottom bar) (Priority 11)
  - `parent-skill-detail.html` — 4 states: skill detail (plain-language explanation + level bar + "going well" / "still learning" / "try at home" sections — no tables, no grade language), recent movement (5-week simple bar chart + week-by-week rows + reassurance callout), low-data empty (Variant A: too early / 2 sessions; Variant B: not yet started), mobile 375px (single column, "try at home" most prominent, share-with-teacher CTA) (Priority 12)
  - `child-rewards-return.html` — 8 states across 4 tabs: early win / badge earned / level-up with burst rings; trophy earned + full collection view (locked trophies desaturated, no spoilers); session complete great / session complete short — stars shown, no accuracy %; welcome back after break / resume quick pick-up / gentle come-back nudge — no missed-days count shown anywhere (Priority 13)
- current focus: polling for next engineering check-in
- blockers: none
- notes for engineering:
  - `parent-family-center.html` route: /parent/family — child switcher on mobile is sticky bottom bar + card tap; sheet variant derivable from adult-mobile-patterns.html if preferred
  - `parent-skill-detail.html` route: /parent/skills/:skill-id — reach via tap on skill row in parent-hub-v2 or parent-family-center; "Share with teacher" CTA is a stub for now
  - `child-rewards-return.html` all 8 states are full-screen portal overlays over /play or /child — not new routes; auto-dismiss after 2.5s or on tap; never interrupt mid-question
  - child reward states show zero accuracy numbers and zero missed-day counts by design — framing is stars earned and momentum only, never performance deficit or absence shaming

## Next Engineering Requests

The next design work should stay narrowly focused on visible quality gaps that
are still obvious in the live app. Do not reopen teacher or owner route work
for this round.

### Priority 14: Audience Background + Palette Systems

The live app is still too dependent on one shared atmospheric treatment.
We need stronger route-specific background and palette separation so child,
parent, teacher, owner, and home stop feeling like the same page with different
cards on top.

Please design:

- child background system
  - deep play-world treatment
  - star-field / quest texture / glow layers
  - works for child setup, play, and reward overlays
- parent background system
  - warm-neutral paper / cream surfaces
  - calm teal / sage accents
  - low-noise trustworthy texture
- teacher background system
  - cool instructional field
  - pale steel / blue base
  - clear semantic support/watch/progress accents
- owner background system
  - dark ops shell
  - graphite / near-black base
  - high-contrast status colors
- home background system
  - one calmer trust-led version
  - one more energetic product-led version

Suggested deliverables:

- `audience-backgrounds.html`
- updates to `design-system.css`

Important:

- route-scoped tokens only, not one global background
- include loading / empty / alert background variants per audience
- mobile needs separate attention so gradients do not collapse into mud

### Priority 15: Parent Access Manager

Engineering has now started collapsing the parent setup form after successful
linkage. We need a canonical compact access-manager design, not just the
full first-time access form.

Please design:

- compact `family access is ready` summary state
- manage family access drawer or inline expansion
- edit parent username / display name / relationship
- relink child path
- notification toggles in compact form
- error state inside the manager
- mobile version

Suggested deliverable:

- `parent-access-manager.html`

Important:

- this is post-link management, not first-time onboarding
- should feel calmer and shorter than `parent-access.html`
- should pair with `parent-family-center.html`

### Priority 16: Home Launcher Refinement

The home route works, but it still needs a cleaner child-first launcher system
and better top-level visual confidence.

Please design:

- child-first launcher refinement for `/`
- stronger live-status strip
- trust / safety strip refinement
- route launcher cards with clearer hierarchy
- mobile launcher layout refinement

Suggested deliverable:

- `home-launcher-refined.html`

Important:

- home is still a launcher, not a dashboard
- child CTA first, parent second, teacher third, owner last
- keep it implementation-friendly, not decorative concept art

### Round Rules

- keep polling this file only
- keep new deliverables at the top level of `ui-agent/`
- do not reopen teacher, owner, or generic component work unless engineering asks
- bias toward implementation-ready route states and token guidance

---

### 2026-03-22 16:30

- completed: Priority 14 (audience backgrounds + palette systems), Priority 15 (parent access manager), Priority 16 (home launcher refinement)
- added files:
  - `audience-backgrounds.html` — 5-tab reference (Child / Parent / Teacher / Owner / Home); each tab shows full-bleed background preview, token swatches, loading/empty/alert variants, and mobile notes
  - `parent-access-manager.html` — 7-tab post-link management flow (compact ready state, manage drawer/accordion, edit fields, relink child, notification toggles, error states, mobile 375px); warm light parent theme, Sora, no glassmorphism
  - `home-launcher-refined.html` — 5-tab home launcher (child-first full page, live status strip, trust/safety strip, route launcher cards with deliberate prominence hierarchy, mobile 375px); child CTA dominant, trust-led cream default
  - `design-system.css` — added `AUDIENCE BACKGROUND TOKENS` section with route-scoped vars for `--child-*`, `--parent-*`, `--teacher-*`, `--owner-*`, `--home-trust-*`, `--home-energy-*`
- current focus: polling for next requests
- blockers: none
- notes for engineering:
  - audience background tokens are now in `design-system.css` under `AUDIENCE BACKGROUND TOKENS` — use these vars rather than hardcoding hex values in route components
  - `--child-bg` / `--child-bg-mid` / `--child-bg-deep` replace old ad-hoc `#100b2e` refs in child routes
  - `--parent-bg` is `#f5f0e8` (not `#f6f1e7`) — slightly warmer than the old `--dash-bg`; intentional
  - home has two distinct treatment vars: `--home-trust-bg` (cream, first-time/parent visits) and `--home-energy-bg` (cosmic, returning child with active quest) — switch at the app shell level, not per-component
  - live status strip in `home-launcher-refined.html` specifies 30s poll + AbortController timeout + graceful hide-on-failure behavior
  - parent access manager is an inline accordion, not a drawer/modal — avoids z-index stacking issues on mobile; see Tab 2 engineering note

## Next Engineering Requests

The current live gaps are now narrower. Keep the next design work focused on
the remaining visible alpha-close / beta-start surfaces. Do not reopen owner or
teacher work this round unless engineering asks.

### Priority 17: Child Quickstart Compression

The live child route still has too many stacked decisions before the child or
grown-up can launch into play. We need a faster first-screen structure that
feels more like a game entry than a form.

Please design:

- one compressed first screen for `/child`
- clear split between:
  - new child
  - returning child
- progressive reveal after the first decision
- stronger sticky primary CTA behavior
- larger visual band cards
- calmer returning-child quick path
- mobile version

Suggested deliverable:

- `child-quickstart-v2.html`

Important:

- fewer stacked cards before action
- should feel faster than current `child-setup.html`
- do not remove the band/avatar/PIN concepts; just stage them better

### Priority 18: Parent Summary Rail

The live parent route is richer now, but the first glance still needs a cleaner,
more decisive summary structure. We need one visible top summary rail that
answers the parent questions immediately before the deeper cards.

Please design:

- parent top summary rail for the active child
- one clear child switcher
- one summary for:
  - how the child is doing right now
  - what changed recently
  - what to try next at home
- compact weekly signal row
- mobile version

Suggested deliverable:

- `parent-summary-rail.html`

Important:

- this should reduce card fatigue
- this is not another full dashboard
- should pair with `parent-family-center.html` and `parent-skill-detail.html`

### Priority 19: Mobile Route Shells

We now have enough route references that the missing gap is cross-route mobile
coherence. We need a reusable phone-shell guide so home, parent, teacher, and
owner feel like one product family on smaller screens.

Please design:

- reusable mobile shell pattern
- top nav / header guidance
- sticky action zone guidance
- bottom safe-area behavior
- home mobile launcher shell
- parent mobile shell
- teacher mobile shell
- owner mobile shell

Suggested deliverable:

- `mobile-route-shells.html`

Important:

- this is shell guidance, not full route redesign
- use existing route assets as reference inputs
- bias toward implementation rules, not decorative variations

### Round Rules

- keep polling this file only
- keep new deliverables at the top level of `ui-agent/`
- do not reopen generic component work unless engineering asks
- focus on the shortest path to visible route improvement

## After Priorities 17–19

Once `child-quickstart-v2.html`, `parent-summary-rail.html`, and
`mobile-route-shells.html` are delivered, move directly into this next batch.
Do not wait for a separate prompt if the current batch is complete.

### Priority 20: Child Return + Reward Moments

The live child route now has returning-entry support and reward overlays, but
the visual states still need a cleaner reference pass so the route feels more
motivating and less prototype-like.

Please design:

- returning child welcome-back state
- reward overlay / badge-earned / level-up / trophy-earned moments
- session-complete celebration with one clear replay or continue action
- mobile version

Suggested deliverable:

- `child-return-rewards-v2.html`

Important:

- low reading burden
- celebration should be warm and reassuring, not overstimulating
- make the next action obvious

### Priority 21: Teacher Intervention Queue

The teacher route has a drilldown, but it still needs one sharper visual for
what to do next in a classroom context.

Please design:

- teacher intervention queue / support-lane card stack
- class-level watch/support/progress summary
- one selected skill drilldown state connected to the queue
- mobile version

Suggested deliverable:

- `teacher-intervention-queue.html`

Important:

- do not redesign the full teacher dashboard
- focus on the decision layer: who needs support, what skill, what next

### Priority 22: Owner Alert + Queue Depth

The owner route needs one more implementation-ready state for triage and ops
confidence before alpha closes.

Please design:

- alert banner system for owner route
- compact triage queue row states
- one expanded triage item detail state
- route health / content health snapshot strip
- mobile version

Suggested deliverable:

- `owner-alert-queue-v2.html`

Important:

- keep owner dark and operational
- emphasize severity, action, and status
- do not reopen generic shell work

## After Priorities 20–22

Once `child-return-rewards-v2.html`, `teacher-intervention-queue.html`, and
`owner-alert-queue-v2.html` are delivered, move directly into this next batch.
Do not wait for a separate prompt if the current batch is complete.

### Priority 23: Pre-Reader Entry Strip

The live child route still needs one calmer entry pattern for very young
learners so a grown-up can get them into play with less setup fatigue.

Please design:

- one compact pre-reader quickstart strip
- returning child fast-entry state
- minimal helper copy version
- mobile version

Suggested deliverable:

- `child-prereader-quickstart.html`

Important:

- make it feel like a launch strip, not a long form
- bias toward big tap targets and only one main action
- assume adult + child are sitting together

### Priority 24: Visual Answer Card Variants

The live play route needs clearer card variations for pre-readers so counting,
letters, shapes, and picture-word prompts do not all feel like the same card.

Please design:

- counting answer-card variant
- letter / phonics answer-card variant
- shape answer-card variant
- picture-word answer-card variant
- selected / correct / retry states
- mobile version

Suggested deliverable:

- `play-answer-cards-v2.html`

Important:

- keep labels secondary to visuals for early learners
- answer cards should still feel unified as one system
- show how a gentle retry state differs from an incorrect lockout

### Priority 25: Parent Mobile Snapshot

Engineering is tightening the parent route, but one missing piece is a compact
mobile-first summary state that answers the main parent questions without card
fatigue.

Please design:

- selected child summary rail on mobile
- time spent / effective time / support / next step stack
- quick-switch children state
- one action footer

Suggested deliverable:

- `parent-mobile-snapshot.html`

Important:

- make the page feel calm and immediately useful
- do not turn this into another full dashboard redesign
- should complement `parent-family-center.html` and `parent-summary-rail.html`

## After Priorities 23–25

Once `child-prereader-quickstart.html`, `play-answer-cards-v2.html`, and
`parent-mobile-snapshot.html` are delivered, move directly into this next
batch. Do not wait for a separate prompt if the current batch is complete.

### Priority 26: Session Complete + Continue

The child route needs one cleaner end-of-session state so celebrations do not
end as dead ends. Engineering needs a reference that makes the next action
obvious.

Please design:

- session-complete celebration
- continue tomorrow state
- replay this quest state
- one calmer low-stimulation variant
- mobile version

Suggested deliverable:

- `play-session-complete-v2.html`

Important:

- keep the reading burden low
- the next action must be obvious in under 2 seconds
- this should pair with `child-return-rewards-v2.html`

### Priority 27: Teacher Mobile Drilldown

The live teacher route now has a skill drilldown, but the mobile state still
needs one implementation-ready reference so the route holds together on phone.

Please design:

- teacher mobile drilldown header
- one selected skill summary
- watch / support / strong learner tiers
- recent intervention note stack
- one action footer

Suggested deliverable:

- `teacher-mobile-drilldown.html`

Important:

- focus on phone clarity, not another full desktop redesign
- make the “what should I do next?” decision obvious

### Priority 28: Owner KPI Strip + Empty Alerts

The owner route is close, but it still needs one compact operational reference
for top-level trust: system health, feedback queue, and empty/alert states.

Please design:

- owner KPI strip
- empty triage queue state
- warning alert strip
- critical alert strip
- mobile version

Suggested deliverable:

- `owner-kpi-strip-v2.html`

Important:

- keep owner dark and crisp
- emphasize operational trust, not decoration
- this should complement `owner-alert-queue-v2.html`

### 2026-03-22 09:20 CDT
- completed:
  - engineering queued active priorities 23 through 28 in this file
- added files:
  - no new engineering-owned files; this is a status ping for the UI agent
- current focus:
  - `child-prereader-quickstart.html`
  - `play-answer-cards-v2.html`
  - `parent-mobile-snapshot.html`
  - then `play-session-complete-v2.html`
  - `teacher-mobile-drilldown.html`
  - `owner-kpi-strip-v2.html`
- blockers:
  - none
- notes for engineering:
  - these requests are active now; do not wait for another prompt before starting them

### 2026-03-22 — Priorities 17–28 complete

- completed: Priority 17 (child quickstart v2), Priority 18 (parent summary rail), Priority 19 (mobile route shells), Priority 20 (child return + rewards v2), Priority 21 (teacher intervention queue), Priority 22 (owner alert queue v2), Priority 23 (child pre-reader quickstart), Priority 24 (play answer cards v2), Priority 25 (parent mobile snapshot), Priority 26 (play session complete v2), Priority 27 (teacher mobile drilldown), Priority 28 (owner KPI strip v2)
- added files:
  - `child-quickstart-v2.html` — 4 tabs: new/returning split screen, progressive reveal (band→avatar→name→PIN), returning quick path with quest resume card, sticky CTA spec; route: /child
  - `parent-summary-rail.html` — 4 tabs: active child summary rail (KPIs + status + what changed + try at home + weekly bars), child switcher inline expand, weekly signal row + day tooltip, mobile 375px; route: /parent
  - `mobile-route-shells.html` — 5 tabs: child shell (Nunito, dark cosmic, sticky CTA, no bottom nav), parent shell (Sora, warm light, 4-tab bottom nav), teacher shell (Sora, cool steel, tab strip + bottom nav), owner shell (Sora, dark ops, alert banner slot + tab strip), shell spec table with all token values and layout rules
  - `child-return-rewards-v2.html` — 4 tabs: welcome back (3 variants: after break / quick pick-up / gentle come-back), badge earned + level-up with burst rings, trophy earned + collection view (locked desaturated, no spoilers), session complete great + short — zero accuracy numbers throughout
  - `teacher-intervention-queue.html` — 4 tabs: intervention queue (left/right split, support→watch→strong tiers, drilldown panel with timeline + next actions), skill drilldown connected to queue, class-level skill overview table, mobile 390px queue rows
  - `owner-alert-queue-v2.html` — 4 tabs: alert banner system (4 severity levels, stacking rules, dismiss rules), triage queue rows (severity bar + detail panel + timeline + action row), route + content health snapshot (bar chart per route/content area), mobile 390px
  - `child-prereader-quickstart.html` — 4 tabs: launch strip (big tap cards, new vs returning), new child entry (character grid → name + PIN, 3 steps only), returning fast-entry (PIN gate, wrong PIN friendly error), minimal helper copy (icon-only grid for non-English contexts)
  - `play-answer-cards-v2.html` — 5 tabs: counting cards (emoji dot objects + number, 2×2 and 2×1 grids), letter/phonics cards (large letter + picture-word), shape cards (SVG inline, brand colors on correct), picture-word cards (emoji primary, word secondary, phonetic hint), shared state reference (default/selected/correct/retry — no lockout, no accuracy %)
  - `parent-mobile-snapshot.html` — 4 tabs: child summary rail (child switcher chip strip, KPI stack, status line, what changed, try at home), time + effective time + support + next step stack, quick-switch children (inline swap, no modal), action footer variants (2 CTAs max, context-aware primary)
  - `play-session-complete-v2.html` — 4 tabs: main celebration (confetti, star pop, stats, play again + done for now), continue tomorrow (quest saved card, positive forward framing), replay/new quest choice (two quest cards), low-stimulation bedtime variant (no confetti, float only, gentle teal)
  - `teacher-mobile-drilldown.html` — 4 tabs: skill drilldown header (5-week mini chart, distribution chips, tier rows), student detail push screen (trend + notes), intervention note stack (add note bottom sheet), what to do next + action footer
  - `owner-kpi-strip-v2.html` — 5 tabs: KPI strip + triage + health grid (6 cells, status dots, delta badges), empty triage queue all-clear state, warning alert strip (amber, dismissible, named route/content), critical alert strip (red, non-dismissible, pulsing status dot), mobile 390px (3×2 KPI grid + alert banners + queue rows + empty state)
- current focus: polling for next engineering requests
- blockers: none
- notes for engineering:
  - `child-quickstart-v2.html` — band defaults to P0 (Pre-K) for pre-reader flow; parent can change from settings; progressive reveal collapses prior steps to summary chips
  - `parent-summary-rail.html` — "effective time" = sessions with strong engagement (not idle time); weekly bars show engagement level not accuracy; no missed-day framing anywhere
  - `mobile-route-shells.html` — shell spec table (Tab 5) has all token values, safe-area rules, and nav heights; use route-scoped CSS classes on body/root element
  - `child-return-rewards-v2.html` — all overlays: auto-dismiss 2.5–3s or on tap; never interrupt mid-question; zero accuracy numbers and zero missed-day counts by design
  - `play-answer-cards-v2.html` — shape cards use inline SVG not emoji for clean scaling; retry state has no lockout — child can tap again immediately; correct/retry animation specs in Tab 5
  - `play-session-complete-v2.html` — low-stimulation variant triggered by time-of-day (8pm+), session length &lt;5min, or parent preference toggle; pairs with child-return-rewards-v2.html
  - `owner-kpi-strip-v2.html` — critical alert strip: non-dismissible until triage item resolved; 15min unacknowledged → push notification; critical KPI cells pulse via CSS animation; pairs with owner-alert-queue-v2.html

## After Priorities 29–31

Use the newly completed files as inputs. The next work is no longer isolated
state exploration; it is route-lift packaging for engineering.

### Priority 29: Home Route Canonical Lift

Engineering is porting `/` next and needs one canonical reference that merges
the best parts of:

- `home-launcher-refined.html`
- `landing-page.html`
- `audience-backgrounds.html`
- `mobile-route-shells.html`

Please design:

- one final home route desktop state
- one final home route mobile state
- child-first cosmic hero
- launcher cards for parent / teacher / owner
- live-status strip
- trust / safety strip

Suggested deliverable:

- `home-route-canonical-v2.html`

Important:

- this should be the single source of truth for `/`
- child CTA first, parent second, teacher third, owner last
- preserve strong audience separation without turning home into a dashboard

### Priority 30: Parent Route Canonical Lift

Engineering needs one consolidated parent route target that combines:

- `parent-family-center.html`
- `parent-summary-rail.html`
- `parent-mobile-snapshot.html`
- `parent-access-manager.html`
- `parent-settings.html`

Please design:

- one canonical parent dashboard desktop state
- one canonical parent dashboard mobile state
- linked-child switcher
- summary rail
- support / strengths / next step stack
- access manager entry point

Suggested deliverable:

- `parent-route-canonical-v2.html`

Important:

- this should feel like one coherent route, not separate partial mocks
- keep it calm and immediately useful
- answer: how is my child doing, what changed, what next

### Priority 31: Child Play Canonical Lift

Engineering needs one consolidated early-learner play reference that combines:

- `play-early-learner.html`
- `play-answer-cards-v2.html`
- `play-session-complete-v2.html`
- `child-return-rewards-v2.html`
- `play-voice-coach.html`

Please design:

- one canonical child play desktop state set
- one canonical child play mobile state set
- prompt / scene / answer card / coach / retry / celebration integration
- one K1-friendly state and one PREK-friendly state

Suggested deliverable:

- `play-route-canonical-v2.html`

Important:

- this should be the single source of truth for `/play`
- keep reading burden low
- make the route feel complete, not like stitched-together states

### 2026-03-22 09:55 CDT
- completed:
  - engineering received and verified priorities 17 through 28
- added files:
  - no new engineering-owned design files in this status block
- current focus:
  - `home-route-canonical-v2.html`
  - `parent-route-canonical-v2.html`
  - `play-route-canonical-v2.html`
- blockers:
  - none
- notes for engineering:
  - these are active now; use the already completed files as source material and do not wait for another prompt

## After Priorities 29–31+

Once `home-route-canonical-v2.html`, `parent-route-canonical-v2.html`, and
`play-route-canonical-v2.html` are delivered, continue directly into this next
batch. Do not wait for a separate prompt if the current batch is complete.

### Priority 32: Teacher Route Canonical Lift

Engineering needs one consolidated teacher route target that merges:

- `teacher-analytics-v2.html`
- `teacher-intervention-queue.html`
- `teacher-mobile-drilldown.html`
- `teacher-gate.html`

Please design:

- one canonical teacher dashboard desktop state
- one canonical teacher dashboard mobile state
- class support queue
- skill drilldown
- intervention timeline
- filter / segment controls

Suggested deliverable:

- `teacher-route-canonical-v2.html`

Important:

- this should be the single source of truth for `/teacher`
- keep it instructional and decision-oriented
- the next action should be obvious within one screen

### Priority 33: Owner Route Canonical Lift

Engineering needs one consolidated owner route target that merges:

- `owner-console-v2.html`
- `owner-alert-queue-v2.html`
- `owner-kpi-strip-v2.html`
- `owner-triage-detail.html`
- `owner-gate.html`

Please design:

- one canonical owner console desktop state
- one canonical owner console mobile state
- KPI strip
- alert queue
- triage detail
- route/content health snapshots

Suggested deliverable:

- `owner-route-canonical-v2.html`

Important:

- this should be the single source of truth for `/owner`
- keep it dark, operational, and crisp
- emphasize severity and action, not decoration

### 2026-03-22 10:05 CDT
- completed:
  - queued the next canonical lift batch after priorities 29 through 31
- added files:
  - no new engineering-owned design files in this status block
- current focus:
  - `teacher-route-canonical-v2.html`
  - `owner-route-canonical-v2.html`
- blockers:
  - none
- notes for engineering:
  - the UI agent should keep polling this same file and move directly into the canonical teacher and owner lifts after the current batch

### 2026-03-22 11:35 CDT
- completed:
  - verified delivered canonical route files:
    - `home-route-canonical-v2.html`
    - `parent-route-canonical-v2.html`
- added files:
  - no new engineering-owned design files in this status block
- current focus:
  - `play-route-canonical-v2.html`
- next after current batch:
  - `teacher-route-canonical-v2.html`
  - `owner-route-canonical-v2.html`
- blockers:
  - none
- notes for engineering:
  - keep polling this same file, treat the delivered home and parent canonical lifts as the new source of truth for those routes, and continue directly into play, then teacher and owner so the UI agent never goes idle

### 2026-03-22 11:41 CDT
- completed:
  - verified delivered canonical route files:
    - `home-route-canonical-v2.html`
    - `parent-route-canonical-v2.html`
    - `play-route-canonical-v2.html`
    - `teacher-route-canonical-v2.html`
- added files:
  - no new engineering-owned design files in this status block
- current focus:
  - `owner-route-canonical-v2.html`
- next after owner:
  - `child-progress-map-v2.html`
  - `family-onboarding-manager-v2.html`
  - `content-gallery-browser-v2.html`
- blockers:
  - none
- notes for engineering:
  - keep polling this same file, treat the delivered canonical route lifts as the current source of truth for home, parent, play, and teacher, finish owner next, then move directly into the child progress/rewards, family onboarding, and content browser concepts so the UI agent always has the next batch ready

### 2026-03-22 — Priorities 29–33 complete

- completed: Priority 29 (home-route-canonical-v2), Priority 30 (parent-route-canonical-v2), Priority 31 (play-route-canonical-v2), Priority 32 (teacher-route-canonical-v2), Priority 33 (owner-route-canonical-v2)
- added files:
  - `home-route-canonical-v2.html` — 5 tabs: desktop full (cosmic hero + 3 launcher cards + live status strip + trust strip), mobile full (375px), live status strip spec (5 cells + alert override table), trust & safety strip spec (6 items), implementation spec (CTA order, tokens, source merge list)
  - `parent-route-canonical-v2.html` — 5 tabs: desktop full (KPI rail + SNS grid + weekly chart + access entry + bottom nav), mobile full (375px chip strip + 2×2 KPI + status line + SNS rows + try-at-home + nav), child switcher inline expand, SNS framing rules, access manager entry spec
  - `play-route-canonical-v2.html` — 5 tabs: desktop K–1 + desktop Pre-K + mobile K–1 (default + correct states) + mobile Pre-K + coach/retry/celebration (state reference table, retry NO lockout, celebration overlay)
  - `teacher-route-canonical-v2.html` — 5 tabs: desktop full (left queue + right drilldown + dist chips + next-action cards + timeline), mobile full (390px tab strip + queue rows + nav), queue spec, timeline spec, filter/segment spec
  - `owner-route-canonical-v2.html` — 5 tabs: desktop full (alert banner + 6-cell KPI strip + triage queue + detail panel with health grid/timeline/action row), mobile full (390px), KPI/health spec, alert severity spec, all-clear empty state + token spec
- current focus: starting child-progress-map-v2.html, family-onboarding-manager-v2.html, content-gallery-browser-v2.html
- blockers: none
- notes for engineering:
  - `home-route-canonical-v2.html` — CTA order non-negotiable: child hero first, parent card second, teacher third, owner last; Tab 5 has full token table
  - `parent-route-canonical-v2.html` — no accuracy %, no missed-day framing; weekly bars = engagement not accuracy; child switcher inline (no modal)
  - `play-route-canonical-v2.html` — retry NO lockout; Tab 5 card state reference table; celebration auto-dismiss 3s or tap; no accuracy % anywhere
  - `teacher-route-canonical-v2.html` — tier based on engagement + skill signal, NOT correct/incorrect ratio; no accuracy % shown; queue sorted support→watch→strong
  - `owner-route-canonical-v2.html` — critical alert non-dismissible until triage resolved; 15 min unacknowledged → push notification; critical KPI cells pulse; alert banner slot hidden when no alerts

### 2026-03-22 — child-progress-map-v2, family-onboarding-manager-v2, content-gallery-browser-v2 complete

- completed: child-progress-map-v2.html, family-onboarding-manager-v2.html, content-gallery-browser-v2.html
- added files:
  - `child-progress-map-v2.html` — 5 tabs: node trail (done=mint ring+check+floatY / current=gold ring+glowPulse / locked=faint+lock badge, sticky CTA "Continue quest"), band section dividers (friendly world names P0–P3, not grade labels in child view), badge collection (4×N grid, earned=gold ring+glow, locked=greyscale+no name spoiler), trophy shelf (horizontal scroll, earned tap → quiet replay, locked show no name), spec (node states table, what is never shown, stars system, friendly name table)
  - `family-onboarding-manager-v2.html` — 5 tabs: welcome screen (warm intro + trust badges + "Set up my child" CTA + teacher code entry), step 1 child name (text input + suggested name tiles + privacy note, CTA disabled until non-empty), step 2 band+avatar (4-tile band picker P0–P3 with emoji+age, 8-emoji char grid, defaults pre-selected so CTA always enabled), step 3 PIN+confirm (4-digit numpad, PIN dots, skip option; confirmation card with avatar+name+band, "Start first quest" + "Add another child"), add another child (dashboard with existing child cards + dashed "Add another" entry + connect teacher card + 4-tab bottom nav); flow spec table (5 steps, fields, CTAs)
  - `content-gallery-browser-v2.html` — 5 tabs: desktop gallery (left filter sidebar band/subject/status/QA health + right card grid auto-fill 220px min, cards tinted by band, status badges, flagged=coral border), desktop detail drawer (380px slide-in from right, QA health bars, 3 question previews with correct answer marked, action row Edit/Preview/Flag/Delete), mobile gallery (390px search + horizontal chip strip + full-width content rows), filter+search spec (filter dimensions table, sort options), content health+spec (health score dimensions with weights, card anatomy, action permissions table)
- current focus: polling for next engineering requests
- blockers: none
- notes for engineering:
  - `child-progress-map-v2.html` — section dividers use friendly world names in child view, NOT grade labels (Pre-K etc.); Tab 5 has the mapping table; no accuracy %, no attempt counts, no score anywhere in child progress view
  - `family-onboarding-manager-v2.html` — step 2 band picker defaults to P0 Pre-K so CTA is always enabled from load; PIN step has skip option; confirmation card shows avatar+name+band (no score, no accuracy); max 4 children in chip strip before "+N more" overflow
  - `content-gallery-browser-v2.html` — health score = 40% image refs + 30% alt text + 30% answer keys; thresholds match owner route (≥95% green / 80–94% amber / <80% red+pulse); Delete action is owner-only with confirmation modal; all other actions available to content admin

### 2026-03-22 12:03 CDT
- completed:
  - verified delivered design batch:
    - `child-progress-map-v2.html`
    - `family-onboarding-manager-v2.html`
    - `content-gallery-browser-v2.html`
- added files:
  - no new engineering-owned design files in this status block
- current focus:
  - `teacher-intervention-detail-mobile-v2.html`
  - `owner-content-health-detail-v2.html`
  - `parent-skill-detail-mobile-canonical-v2.html`
- next after current batch:
  - `teacher-intervention-timeline-v2.html`
  - `owner-route-health-v2.html`
  - `parent-family-summary-v2.html`
- blockers:
  - none
- notes for engineering:
  - keep polling this same file, use the delivered child progress, family onboarding, and content gallery concepts as the source material, and continue directly into teacher intervention detail, owner content health detail, and parent skill detail so the UI agent always has the next route-level batch ready

### 2026-03-22 12:18 CDT
- completed:
  - delivered current batch (all 3 files):
    - `teacher-intervention-detail-mobile-v2.html` — 5 tabs: student detail push screen + 5-week tier mini bar chart + note stack + add-note bottom sheet + what-to-do-next cards + spec
    - `owner-content-health-detail-v2.html` — 5 tabs: desktop full detail (QA health bars + issue list + question previews + edit timeline + action row) + QA health breakdown + issue/preview side-by-side + content timeline + spec
    - `parent-skill-detail-mobile-canonical-v2.html` — 5 tabs: skill detail screen (3 tier states) + tier states × 3 variants + activities + teacher note + edge states (not-yet-attempted / multi-child / past-band) + full spec; route /parent/child/:childId/skill/:skillId; no accuracy %, no missed-day framing, growth language throughout
- current focus:
  - starting next batch now per prior instructions:
    - `teacher-intervention-timeline-v2.html`
    - `owner-route-health-v2.html`
    - `parent-family-summary-v2.html`
- blockers:
  - none
- notes for engineering:
  - all parent-facing screens strictly enforce: no accuracy %, no missed-day framing, tier labels only (support/strength/next), forward-looking growth language
  - parent-skill-detail uses same push-nav topbar pattern as teacher-intervention-detail — engineers should extract shared component
  - multi-child switcher in topbar (inline pills) is canonical pattern for all parent child-scoped screens

### 2026-03-22 12:44 CDT
- completed:
  - delivered next batch (all 3 files):
    - `teacher-intervention-timeline-v2.html` — 5 tabs: mobile full timeline (active + resolved states) + mobile filtered/cross-skill views + desktop 3-panel (student list / timeline / inline add-entry) + add-entry bottom sheet + resolve confirmation modal + spec; event types: flag/note/contact/progress/assign/system/resolve; sort newest-first; filter chips; TODAY gold divider
    - `owner-route-health-v2.html` — 5 tabs: desktop route grid (KPI strip + 3-col cards with sparklines + critical alert bar) + desktop route detail (/play critical: p50/p95/p99 + latency histogram + error breakdown + incident log + action row) + mobile route list (sorted critical→warning→healthy + all-clear empty state) + alert states (critical non-dismissible / warning / info / multi-alert stacked max 3) + spec; thresholds per route table; auto-page on-call after 15min unacked critical
    - `parent-family-summary-v2.html` — 5 tabs: mobile 1-child (week hero + SNS trio + skill highlights + teacher strip + activity suggestions + bottom nav) + mobile 2-children (expanded + collapsed card variants) + desktop 3-col (child list / selected child detail / messages+upcoming) + edge states (no children / child added no sessions) + spec; hero gradient varies by family size; activity suggestions: 2–3 max, support-tier first, rotate weekly; multi-child layout rules (1=full, 2=both expanded, 3+=collapsed default)
- current focus:
  - polling for next batch
- blockers:
  - none
- notes for engineering:
  - teacher-intervention-timeline TODAY divider (gold #ffd166) should only render for active interventions — hide on resolved timeline views
  - owner-route-health sort order: critical first, then warning, then healthy; within same status sort by p95 descending
  - parent-family-summary week hero gradient: 1 child = teal (#2c7a6e→#1a5c52), multi-child = violet (#5a3e90→#3d2870)
  - all three files share push-nav topbar pattern — engineers should confirm shared component extraction

### 2026-03-22 12:31 CDT
- completed:
  - verified delivered design batch:
    - `teacher-intervention-detail-mobile-v2.html`
    - `owner-content-health-detail-v2.html`
    - `parent-skill-detail-mobile-canonical-v2.html`
    - `teacher-intervention-timeline-v2.html`
    - `owner-route-health-v2.html`
    - `parent-family-summary-v2.html`
- added files:
  - no new engineering-owned design files in this status block
- current focus:
  - `child-return-journey-v2.html`
  - `child-session-complete-map-overlay-v2.html`
  - `owner-feedback-queue-mobile-v2.html`
- next after current batch:
  - `parent-skill-compare-mobile-v2.html`
  - `teacher-intervention-resolve-v2.html`
  - `owner-feedback-detail-v2.html`
- blockers:
  - none
- notes for engineering:
  - keep polling this same file, treat the delivered teacher, owner, and parent detail/timeline/summary screens as the source of truth for those routes, then continue directly into child return and session-complete experiences plus the mobile owner feedback queue so the UI agent stays busy

### 2026-03-22 13:02 CDT
- completed:
  - delivered current batch (all 3 files):
    - `child-return-journey-v2.html` — 5 tabs: short away 1–2 days (streak intact + resume CTA) + long away 7–14+ days (big celebration + fresh start vs resume choice + new content discoveries) + streak lost/reset state (🌱 new streak framing, NEVER shame language, day-1 progress dots) + new content unlocked while away (trophy claim + new zone teaser) + spec; return triggers table by days-away; streak rules (intact/broken/new); "while you were away" max 2–3 items, support-tier-first
    - `child-session-complete-map-overlay-v2.html` — 5 tabs: mid-skill node complete (node trail with done/just-completed/current/locked states, so-close callout at node 4/5) + skill mastered (full 🏆 burst, badge earned card, horizontal mini-map) + band complete (max celebration, band trophy, next-band teaser) + overlay animation states (before/after, slide-up sequence table: 6 steps with timing) + spec; never show accuracy%/wrong counts/time-taken on overlay; node state color table
    - `owner-feedback-queue-mobile-v2.html` — 5 tabs: queue list (KPI strip + filter chips All/Bug/Content/UX/Praise + rows sorted critical→bug→content→ux→praise→resolved, unread dots) + feedback detail (bug detail with metadata grid + related reports + action row; content issue with fix-in-editor deep-link) + triage flow (bottom sheet with 5 actions + post-resolve resolved row with ticket ID badge) + empty/all-clear + praise filter states + spec; dismissal rules (critical non-dismissible without triage); 5 feedback types with border/badge colors
- current focus:
  - polling for next batch
- blockers:
  - none
- notes for engineering:
  - child-return-journey: return screen triggers when last_session > 1 day; grace period for streak should be configurable server-side
  - child-session-complete overlay: slides up from bottom (translateY 100%→0, 400ms ease-out), play screen blurs behind at 30% opacity during overlay
  - owner-feedback: critical bugs cannot be dismissed without triage action — enforce at UI level, not just guideline
  - next batch per engineering agent notes: parent-skill-compare-mobile-v2.html, teacher-intervention-resolve-v2.html, owner-feedback-detail-v2.html

### 2026-03-22 13:28 CDT
- completed:
  - verified receipt of the newest batch now present in `ui-agent/`:
    - `parent-skill-compare-mobile-v2.html`
    - `teacher-intervention-resolve-v2.html`
    - `owner-feedback-detail-v2.html`
- current focus:
  - `play-world-backgrounds-v2.html`
  - `adult-surface-palette-v2.html`
  - `teacher-class-summary-mobile-v2.html`
  - `owner-feedback-resolution-center-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - use the existing `audience-backgrounds.html` and `design-system.css` as the baseline, but make this round more route-specific and more production-ready
  - `play-world-backgrounds-v2.html` should define per-band/background systems for `/play` and `/child`:
    - PREK = playful/friendly, low-noise visual worlds
    - K1 = more energetic but still soft and readable
    - G23 = stronger contrast and motion-ready surfaces
    - G45 = more structured/strategic environments
    - include: default, success, retry/support, session-complete overlay, and returning-journey backdrop variants
  - `adult-surface-palette-v2.html` should define refined background/surface palettes for Home, Parent, Teacher, and Owner:
    - stop everything from feeling like the same cream background
    - give each audience a clearly distinct base atmosphere, card surface tone, border tone, and alert accent set
    - include desktop and mobile notes plus token recommendations
  - `teacher-class-summary-mobile-v2.html` should focus on the best compact mobile teacher snapshot:
    - class summary hero
    - support/watch/strong split
    - recent interventions strip
    - next actions
    - empty / low-data states
  - `owner-feedback-resolution-center-v2.html` should pick up after queue + detail:
    - resolution workflow
    - assignment/owner chips
    - severity/state transitions
    - resolved archive row
    - mobile-first ops handling

### 2026-03-22 14:08 CDT
- completed:
  - verified the queue state; if the current batch is already done, append the delivery block here and move immediately into the next batch below
- current focus:
  - `play-world-backgrounds-v2.html`
  - `adult-surface-palette-v2.html`
  - `teacher-class-summary-mobile-v2.html`
  - `owner-feedback-resolution-center-v2.html`
- next after current batch:
  - `parent-home-practice-detail-v2.html`
  - `teacher-support-lane-desktop-v2.html`
  - `owner-content-review-workbench-v2.html`
  - `child-world-picker-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - if the current focus files are already complete in your workspace, append the status block first, then continue directly into the next batch without waiting
  - `parent-home-practice-detail-v2.html` should extend the family-summary direction into a deeper at-home practice screen:
    - one selected child
    - 2–3 recommended practice moments
    - short teacher note strip
    - weekend activity cards
    - calm mobile-first hierarchy
  - `teacher-support-lane-desktop-v2.html` should focus on a richer teacher desktop workbench:
    - support/watch/strong columns
    - filters
    - selected student detail rail
    - recent intervention summary
    - empty / low-data variants
  - `owner-content-review-workbench-v2.html` should build on the content gallery and content health detail:
    - review queue
    - QA health
    - flagged content
    - approve / revise / archive actions
    - desktop first, with mobile notes
  - `child-world-picker-v2.html` should show a child-friendly world selection / progress continuation surface:
    - friendly world names, not grade labels in the child view
    - locked/current/completed world cards
    - tiny progress indicators
    - return-friendly “jump back in” treatment

### 2026-03-22 UI Agent Status
- completed:
  - delivered current batch (all 4 files):
    - `play-world-backgrounds-v2.html` — 5 tabs: P0 Pre-K worlds (default/success/support/return-journey — playful low-noise warm cosmic, big friendly nodes, gold accents, return screen with streak intact card) + P1 K–1 worlds (deeper violet cosmos, energetic star density, skill-mastered overlay with badge card) + P2 G2–3 worlds (teal-green deep space, stronger contrast, session-complete overlay with XP/streak/node stat row) + P3 G4–5 worlds (structured coral-red cosmos, band-complete max celebration, trophy card) + spec (band token table, node state color table by band, world state transition table, star field density rules by band, overlay animation spec)
    - `adult-surface-palette-v2.html` — 5 tabs: Home palette (#f8f5f0 warm stone / forest teal accent / welcoming neutral — bridges child and parent) + Parent palette (#f5f0e8 warm parchment / deep teal #2c7a6e / tier colors: support=amber, strength=green, next=soft blue) + Teacher palette (#f0f4f8 cool steel / deep navy #2a5080 / alert colors: flag=red, watch=amber, strong=green) + Owner palette (#0d1117 dark ops / gold #ffd166 / critical=red, warning=gold, ok=mint) + spec (audience differentiation matrix, full token reference table, contrast ratios WCAG 2.1, desktop vs mobile notes per audience, font usage table)
    - `teacher-class-summary-mobile-v2.html` — 5 tabs: class summary hero (navy hero card + greeting + 3 KPIs: students/active/flag-count + SNS trio: Flag/Watch/Strong + recent interventions strip + next actions row) + support/watch student list (filter chips + left-border-coded rows + inline mini bar chart for tier trend) + interventions strip (TODAY gold divider + event type icons + yesterday/2-days dividers muted) + empty/low-data states (no-students / early-week low-data / all-clear full-class-strong) + spec (SNS thresholds table, hero KPI definitions, event types, empty state rules, tokens)
    - `owner-feedback-resolution-center-v2.html` — 5 tabs: resolution workflow (KPI strip 4-cols: critical/open/in-progress/resolved + open queue with left-border state encoding + resolve confirmation form with radio verification method) + assignment/owners (assign bottom sheet with team options + @devteam/@uxteam/@content/Me + post-assign row update) + severity transitions (P0→P1 downgrade form with required note + full state transition log with timestamps) + resolved archive (recently-resolved rows with reopen + muted archived rows with reason badges) + spec (state machine table, severity table, assignee options, bulk actions, resolution note rules, tokens)
- current focus:
  - starting next batch immediately
- blockers:
  - none
- notes for engineering:
  - adult-surface-palette: Home vs Parent are subtly different — Home is cooler/more neutral (#f8f5f0), Parent is warmer/more saturated (#f5f0e8). Do not merge to same token.
  - play-world-backgrounds: star density increases with band level (Pre-K: 6–8 stars, G4–5: 12–18). Stars are CSS-only, randomised at mount.
  - teacher-class-summary: TODAY divider gold (#f0d070) only on current-day entries; older dates use muted grey divider (#d0dae4)
  - owner-feedback-resolution: bulk resolve not available — each item must be resolved individually with a note
  - next batch: parent-home-practice-detail-v2.html, teacher-support-lane-desktop-v2.html, owner-content-review-workbench-v2.html, child-world-picker-v2.html

### 2026-03-22 15:02 CDT
- completed:
  - verified the next batch is already underway:
    - `parent-home-practice-detail-v2.html`
    - `teacher-support-lane-desktop-v2.html`
- current focus:
  - `owner-content-review-workbench-v2.html`
  - `child-world-picker-v2.html`
- next after current batch:
  - `child-launcher-canonical-v2.html`
  - `child-progress-review-v2.html`
  - `parent-access-manager-v2.html`
  - `teacher-dashboard-mobile-canonical-v2.html`
  - `owner-feedback-summary-v2.html`
  - `owner-route-health-mobile-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - if the current focus files are already complete in your workspace, append the status block first, then continue directly into the next six-file batch without waiting
  - `child-launcher-canonical-v2.html` should unify first-time start, resume, and return journey entry into one child-first surface with minimal reading load
  - `child-progress-review-v2.html` should turn completion, badges, trophies, and “what next” into a calm review screen instead of a purely celebratory splash
  - `parent-access-manager-v2.html` should consolidate child switching, relink, notification control, and account hygiene in one family-management surface
  - `teacher-dashboard-mobile-canonical-v2.html` should be the true compact teacher home for between-class checks, not just a compressed desktop panel
  - `owner-feedback-summary-v2.html` should sit above queue/detail and summarize severity, routing, and trend health for ops triage
  - `owner-route-health-mobile-v2.html` should provide a compact incident / route-health snapshot for on-the-go alpha support

### 2026-03-22 UI Agent Status
- completed:
  - delivered current batch (all 4 files):
    - `parent-home-practice-detail-v2.html` — 5 tabs: practice moments (2–3 activity cards per child, support-tier first, with skill dot + tier label + description + duration/skill/fun tags + "Try together" CTA footer) + weekend activities (gradient image header, longer format 15–30 min, 2 cards max, rotate weekly) + all-done state (muted completed cards + green hero "You did it!" + "check back next week" message) + teacher-note-only edge case (note prominent + "Ideas on their way" placeholder + multi-note thread collapsed older than 7 days) + spec (practice moment rules, parent language rules, teacher note display, weekend rotation, tokens)
    - `teacher-support-lane-desktop-v2.html` — 5 tabs: 3-col workbench (220px student lane: Flag/Watch/Strong sections + selectable rows + left-border state indicator; 1fr center: student name header + skill cards with progress bars + 5-week tier bar chart + intervention log; 320px right: quick-add note form + full intervention thread) + filters/sort (filter bar: tier/skill/duration/active-toggle + applied chips + reset all + sort dropdown) + empty/low-data (all-clear empty lane + no-data waiting state) + mobile condensed (student lane only, tap pushes detail) + spec (layout grid, sort order, filter options, tokens)
    - `owner-content-review-workbench-v2.html` — 5 tabs: review workbench (KPI strip 5-cols: pending/flagged/approved/in-revision/QA-pass-rate + 3-col: 280px queue with filter chips; center: content preview with question card + flagged-answer banner + fix indicator; 340px right: QA score 0-100 + 6-item checklist + reviewer notes textarea + action buttons) + flagged content focused view (red banner + full flagged list with report counts + fix-in-editor deep-links) + approve/revise/archive post-action states (approve: mint badge + version bumped + reports resolved; revise: returned-to-author with notes + failed checks highlighted) + mobile notes (queue list → detail push, QA badge in topbar) + spec (queue sort, QA checklist, actions table, fix-in-editor deep-link format, tokens)
    - `child-world-picker-v2.html` — 5 tabs: world picker (completed: muted ✓ check; current: bright + glow ring + progress dots; locked: 0.45 opacity + lock icon; friendly world names NEVER grade labels — Dream/Ocean/Fire/Star World) + jump-back-in (gold banner for 2–3 days away streak intact; violet fresh-start banner for 7+ days; badge changes: "Play →" / "Jump in →" / "Resume →" by days-away) + locked states (tap shows toast not modal; "Finish [World] first" text; coming-soon variant) + world detail sheet (slide-up from bottom; current world: skill chips + progress bar + Resume CTA; completed world: all-skill chips + badge + Play Again CTA; dim cards behind sheet) + spec (world naming rules, card state table, jump-back rules by days-away, progress dot rules, sheet animation, tokens)
- current focus:
  - polling for next batch
- blockers:
  - none
- notes for engineering:
  - child-world-picker: world names in content CMS, never hardcoded. Locked world tagline shows "???" until adjacent world is complete.
  - child-world-picker: locked tap = toast only (not modal). Sheet slides up 300ms ease-out. Dismissed by tap-outside or swipe-down.
  - parent-home-practice: practice moments rotate every Monday. Parent can manually refresh once/day. Support-tier activities always shown first.
  - teacher-support-lane: desktop 3-col min-width 960px. Mobile collapses to student lane list only — tap pushes full-screen detail.
  - owner-content-review: QA hard-block checks: correct answer marked + all options distinct. Others are warnings only. Approve blocked when hard-check fails.

### 2026-03-22 15:18 CDT
- completed:
  - verified the remaining current-focus files are now present:
    - `owner-content-review-workbench-v2.html`
    - `child-world-picker-v2.html`
- current focus:
  - `child-launcher-canonical-v2.html`
  - `child-progress-review-v2.html`
  - `parent-access-manager-v2.html`
  - `teacher-dashboard-mobile-canonical-v2.html`
  - `owner-feedback-summary-v2.html`
  - `owner-route-health-mobile-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - when this six-file batch is complete, append the delivery/status block here before waiting
  - `child-launcher-canonical-v2.html` should be the most polished child entry point yet:
    - first-time start
    - resume
    - returning-player comeback
    - ultra-low reading load
    - mobile-first
  - `child-progress-review-v2.html` should bridge session-complete and world progression:
    - earned rewards
    - calm recap
    - next world / next skill prompt
    - replay vs continue options
  - `parent-access-manager-v2.html` should cover:
    - child switching
    - relink / fix link
    - notification control
    - account hygiene
    - family-safe error states
  - `teacher-dashboard-mobile-canonical-v2.html` should be a true between-class teacher home, not a reduced desktop
  - `owner-feedback-summary-v2.html` should sit above queue/detail with severity, volume, routing mix, and trend health
  - `owner-route-health-mobile-v2.html` should provide compact ops/incident awareness for alpha support on the go

### 2026-03-22 16:02 CDT
- completed:
  - engineering packaged the next live child-route quickstart lift and widened the alpha question bank to 48 playable items
- current focus:
  - keep the existing six-file batch as the active delivery target:
    - `child-launcher-canonical-v2.html`
    - `child-progress-review-v2.html`
    - `parent-access-manager-v2.html`
    - `teacher-dashboard-mobile-canonical-v2.html`
    - `owner-feedback-summary-v2.html`
    - `owner-route-health-mobile-v2.html`
- next after current batch:
  - `child-question-gallery-v2.html`
  - `teacher-class-summary-desktop-v2.html`
  - `owner-feedback-detail-mobile-v2.html`
  - `owner-content-health-mobile-v2.html`
  - `parent-linked-children-mobile-v2.html`
  - `content-question-browser-v2.html`
- blockers:
  - none
- notes for UI agent:
  - do not wait after the current six-file batch is done; append the delivery block here, then move directly into the six-file follow-on batch above
  - `child-question-gallery-v2.html` should be a visual-first child content browser:
    - world tiles
    - skill/theme chips
    - minimal reading load
    - locked/current/completed states
  - `teacher-class-summary-desktop-v2.html` should become the canonical large-screen teacher home:
    - roster summary
    - support/watch/strong lanes
    - quick action rail
    - selected student context
  - `owner-feedback-detail-mobile-v2.html` should be the compact, action-oriented mobile companion to owner queue/detail
  - `owner-content-health-mobile-v2.html` should translate content QA/status into a compact mobile ops view
  - `parent-linked-children-mobile-v2.html` should make switching, relinking, and child-at-a-glance status easy on phones
  - `content-question-browser-v2.html` should support alpha/beta content review:
    - filters by band, subject, skill, and difficulty
    - question card preview
    - lightweight QA / status indicators

### 2026-03-22 16:26 CDT
- completed:
  - verified and preserved four newly delivered files from the current six-file batch:
    - `child-launcher-canonical-v2.html`
    - `child-progress-review-v2.html`
    - `parent-access-manager-v2.html`
    - `teacher-dashboard-mobile-canonical-v2.html`
- current focus:
  - finish the remaining two files from the active batch:
    - `owner-feedback-summary-v2.html`
    - `owner-route-health-mobile-v2.html`
- next after current batch:
  - move directly into the already-queued follow-on batch:
    - `child-question-gallery-v2.html`
    - `teacher-class-summary-desktop-v2.html`
    - `owner-feedback-detail-mobile-v2.html`
    - `owner-content-health-mobile-v2.html`
    - `parent-linked-children-mobile-v2.html`
    - `content-question-browser-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - if the remaining two current-focus files are already complete in your workspace, append the delivery block here first, then continue immediately into the six-file follow-on batch
  - `owner-feedback-summary-v2.html` should be the top-level owner dashboard strip above queue/detail:
    - severity mix
    - routing mix
    - volume trend
    - trend-health signals
  - `owner-route-health-mobile-v2.html` should be the compact mobile ops snapshot:
    - key route statuses
    - alert banner
    - drilldown entry points

---

## [UI AGENT → ENGINEERING] Batch Delivery — 2026-03-22

### Status: ✅ Complete

**6-file batch delivered:**

| File | Status | Notes |
|------|--------|-------|
| `child-launcher-canonical-v2.html` | ✅ Done | 5 tabs: first-time / resume / comeback (short+long away) / multi-child / spec. State routing table, ultra-low reading load rules, emoji-first hierarchy. |
| `child-progress-review-v2.html` | ✅ Done | 5 tabs: session complete (mid-world + end-of-day) / earned rewards (badge + XP-only) / world complete + band complete / replay vs continue / spec. XP level system, session end API response shape, reading load rules. |
| `parent-access-manager-v2.html` | ✅ Done | 5 tabs: child switching (multi + single-child) / relink/fix link (ok + broken + parent-only) / notification preferences (all toggles + silent-mode warning) / account hygiene (issues + clean + remove-child 2-step) / spec. FERPA data retention, link state machine, max 6 children. |
| `teacher-dashboard-mobile-canonical-v2.html` | ✅ Done | 5 tabs: teacher home (SNS trio + priority students + quick-action rail + today's interventions) / roster summary (sorted flag→watch→strong + mini bar charts) / student context (flag-tier: skill cards + 5-week trend + intervention log + quick-add) / quick actions (add-note bottom sheet + message-parents multi-select) / spec. Desktop vs mobile differences table. |
| `owner-feedback-summary-v2.html` | ✅ Done | 5 tabs: summary KPIs (4+3 grid + health score + queue preview) / severity breakdown (bar chart + escalation rules + WoW comparison) / volume trends (14-day bars + by-type + resolve rate) / routing mix (per-team pct + unrouted alert + SLA table) / spec. Health score formula, refresh cadence. |
| `owner-route-health-mobile-v2.html` | ✅ Done | 5 tabs: route health (active-incident + all-clear states, colour-coded route cards) / active incidents (INC detail + append-only timeline + no-incident state) / system alerts (unacknowledged + acknowledged history) / uptime history (90-day segment bars per route + summary stats) / spec. 8 monitored alpha routes, incident auto-creation rules, status thresholds. |

**Design tokens used consistently:**
- `#0d1117` owner bg · `#f0f4f8` teacher bg · `#f5f0e8` parent bg · `#100b2e` child bg
- `#ffd166` owner gold / P0 · `#2a5080` teacher navy · `#2c7a6e` parent teal · `#9b72ff` P1 violet
- Sora (all adult surfaces) · Nunito 900 (all child surfaces)
- 375px phone frames (child/parent) · 390px (teacher/owner mobile)

**Next batch starting immediately** (no wait required):
- `child-question-gallery-v2.html`
- `teacher-class-summary-desktop-v2.html`
- `owner-feedback-detail-mobile-v2.html`
- `owner-content-health-mobile-v2.html`
- `parent-linked-children-mobile-v2.html`
- `content-question-browser-v2.html`


---

## [UI AGENT → ENGINEERING] Batch Delivery — Follow-on 6-file batch — 2026-03-22

### Status: ✅ Complete

**Follow-on 6-file batch delivered:**

| File | Status | Notes |
|------|--------|-------|
| `child-question-gallery-v2.html` | ✅ Done | 5 tabs: gallery list (completed/current/locked tiles, 2-col grid toggle) / question detail (unanswered + correct + wrong states, gentle correction, no stars lost in replay) / filters+search (active filters strip, fuzzy text match, result highlights) / empty states (no results + all-world-complete celebration) / spec. Reading-load rules enforced; never expose skill IDs or grade labels. |
| `teacher-class-summary-desktop-v2.html` | ✅ Done | 5 tabs: class overview (top-nav + subnav + KPI row + 3-col: 280px student list / skill dist bar chart + 5-week trend / 300px SNS+band+actions) / skill breakdown (sortable table, view-students filter) / engagement (sessions + streaks table, zero-sessions highlighted) / low-data states (early-week amber banner, partial data) / spec. Min-width 1024px; full layout spec table vs mobile. |
| `owner-feedback-detail-mobile-v2.html` | ✅ Done | 5 tabs: bug/critical (P0 non-dismissible header, impact chips, user quote, stack trace, metadata 2-col grid, audit trail, fixed action bar) / UX feedback (screenshot attachment, device tags, route+component path, related patterns, design-system deeplink) / praise (user profile card, quote highlight, usage context, auto-tags, highlight bank CTA) / resolved+archived / spec. Desktop-to-mobile adaptation table. |
| `owner-content-health-mobile-v2.html` | ✅ Done | 5 tabs: content health overview (QA score, flag rates, skill health list with left-border severity) / skill breakdown (Phonics alert detail: 5-bar QA score breakdown, coverage per node, flagged question list) / review queue (filter chips, queue rows, open-workbench CTA) / coverage gaps (node-level coverage bars, critical alert when <4 questions) / spec. Alert thresholds: flag rate >3% = warn, >5% = crit; node <6 = warn, <4 = crit. |
| `parent-linked-children-mobile-v2.html` | ✅ Done | 5 tabs: linked children list (full child cards: avatar+name+world+streak+sessions+tier+link-status+switch/manage; add-child card) / link progress per child (wizard steps: account→family→school) / 3-step link setup wizard (school search → confirm teacher → done+notify) / error states (school not on WonderQuest with "Tell my school" CTA; broken link with relink wizard) / spec. Family-safe error language throughout. |
| `content-question-browser-v2.html` | ✅ Done | 5 tabs: 3-col browser (220px skill/node tree with flag counts / center question list with filter chips+QA badges / 320px detail: answer options+QA checks+metadata+flag reports+action bar with hard-block gate) / create+edit (editor with answer options, correct marker, reading-level/duplicate inline validation, QA sidebar, publish hard-block) / bulk import (CSV drop zone, format reference, dry-run+import) / QA checks matrix / spec. Content-admin surface: `#10161e` bg, `#58c8f0` accent. Access control table. |

**Design consistency maintained:**
- Content browser uses distinct content-admin palette (`#58c8f0` accent) distinct from owner gold/teacher navy/parent teal
- All parent surfaces: Sora font, `#f5f0e8` bg, `#2c7a6e` nav
- All owner surfaces: Sora font, `#0d1117` bg, `#ffd166` accent
- All teacher surfaces: Sora font, `#f0f4f8` bg, `#2a5080` nav
- Child surfaces: Nunito 900, `#100b2e` bg
- Hard-block QA gates enforced in both content-review-workbench and content-question-browser

**Total files delivered this session: 12** (2 batches of 6)

### 2026-03-22 16:41 CDT
- completed:
  - verified and preserved the owner/mobile/content follow-on batch delivered by the UI agent:
    - `owner-feedback-summary-v2.html`
    - `owner-route-health-mobile-v2.html`
    - `child-question-gallery-v2.html`
    - `teacher-class-summary-desktop-v2.html`
    - `owner-feedback-detail-mobile-v2.html`
    - `owner-content-health-mobile-v2.html`
    - `parent-linked-children-mobile-v2.html`
    - `content-question-browser-v2.html`
- current focus:
  - start the next six-file batch immediately
- next batch:
  - `play-prereader-session-canonical-v2.html`
  - `play-k1-session-canonical-v2.html`
  - `teacher-student-detail-desktop-v2.html`
  - `owner-feedback-resolution-mobile-v2.html`
  - `parent-notification-center-v2.html`
  - `content-bulk-import-review-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - `play-prereader-session-canonical-v2.html` should be the canonical live play surface for ages 2-5:
    - one question active
    - answer cards
    - voice coach
    - wrong-answer support
    - ultra-low reading load
  - `play-k1-session-canonical-v2.html` should cover the next step up from prereader:
    - word + number balance
    - slightly richer progress cues
    - still fast and child-first
  - `teacher-student-detail-desktop-v2.html` should complement the new desktop class summary with a selected-student workspace:
    - skill trend
    - intervention history
    - quick next actions
  - `owner-feedback-resolution-mobile-v2.html` should be the compact owner flow for assignment, resolve, reopen, and note capture
  - `parent-notification-center-v2.html` should centralize reminders, milestone alerts, quiet hours, and recent notices
  - `content-bulk-import-review-v2.html` should show the path to larger content scale:
    - import review
    - validation results
    - approve/reject rows


---

## [UI AGENT → ENGINEERING] Batch Delivery — 2026-03-22 (Batch 3)

### Status: ✅ Complete

**6-file batch delivered:**

| File | Status | Notes |
|------|--------|-------|
| `play-prereader-session-canonical-v2.html` | ✅ Done | 5 tabs: active question (2×2 answer cards, floating emoji stimulus, pulsing voice-coach btn) / wrong-answer support (gentle "Oops!", coach hint overlay, correct card highlighted — no shame, no stars lost) / correct celebration (star burst, XP chip, gold CTA) / between questions (star progress row, next-up card, loading dots, coach encouragement) / spec. Reading load rules (max 8 words, emoji-first, no timers, no grade labels). Session state machine table. P0 gold `#ffd166`. |
| `play-k1-session-canonical-v2.html` | ✅ Done | 5 tabs: reading question (sight word large + phoneme-chunk display, 4 answer cards with emoji+text) / number question (numeral large + dot grid, 4 numeral cards) / correct celebration (violet sparkle, XP+star+streak chips, progress cue "3 done · 3 more") / hint support (coach overlay with phoneme-split visual, word-result block, question still visible) / spec. Word+number balance table (3:2 split for 5-q session). P1 violet `#9b72ff`. Reading load (max 15 words). Hint rules: manual tap or auto after 2 wrong picks. |
| `teacher-student-detail-desktop-v2.html` | ✅ Done | 5 tabs: student overview (student card: avatar+name+tier+streak+XP+level + recent sessions list / 8-week stacked SNS bar chart / quick-action cards) / skill breakdown (filter chips: support/progress/strength; sortable table with tier badge, 4-week trend arrow, mini progress bar, recommended action, drilldown →) / intervention history (append-only timeline TODAY divider: note/activity/parent-msg/tier-change events + inline add-note form with type tabs) / quick actions (assign activity + message parent + add note + schedule check-in in 2×2 card grid) / spec. Min 1024px, 3-col grid (280 / 1fr / 300). SNS tier display rules. Intervention log append-only rule. |
| `owner-feedback-resolution-mobile-v2.html` | ✅ Done | 5 tabs: assign flow (4-team grid: Dev/UX/Content/Owner with queue counts; selected-state card; confirmation sheet with SLA + escalate-at time) / resolve flow (resolution type chips: Fixed/Acknowledged/Won't Fix/Duplicate; resolution text textarea; related PR/issue field; resolved-by selector) / reopen flow (reopen reason text; 2×2 severity re-assess grid P0–P3; reassign selector; auto-escalate rule warning) / note capture (append-only log with Internal/Escalation/Owner chip types; quick-add form + save) / spec. State machine table (Open→In Progress→Resolved→Archived; Resolved→Reopened). Resolution type definitions. Auto-escalate on reopen within 48h. |
| `parent-notification-center-v2.html` | ✅ Done | 5 tabs: recent notices (date-grouped list: Today/Yesterday/This Week; unread left-border + dot; badge/streak/milestone/teacher/activity/link type chips; mark-all-read; child selector; empty state) / milestone alerts (active cards with progress bars + pct; recently-earned cards with ✅ header) / reminders (practice time picker with time chips + day toggles; weekly summary, teacher note, badge, streak toggles; preview notification text) / quiet hours (from/to time inputs; day toggles all days; status chip "Active now"; emergency bypass note; delivery channels push/email/sms) / spec. Notification categories table with default on/off and emergency bypass. Parent language rules enforced (no accuracy %, no missed-day shaming). |
| `content-bulk-import-review-v2.html` | ✅ Done | 5 tabs: import review (file header + pass/warn/fail/total KPI row; filter chips; row table with status badges, Q preview, skill/node, correct-mark, reading-level, error column, Edit/Fix/Preview actions) / approve+reject (multi-select checkboxes; partial-approve banner warning 8 errors; bulk approve/reject; per-row approve-with-note or reject; reject reason textarea) / error details (grouped by type: no correct answer / duplicate options / invalid skill ID; row#, error msg, fix suggestion, auto-fix eligible; autofix button) / import complete (summary stats grid; owner-gate card ≥100 rows; pending-approval state; link to Question Browser; export-rejected CSV) / spec. Validation rules table (hard blocks vs warnings, auto-fixable column). CSV column format. Approval gate rules. Access control table (content_admin vs owner). |

**Design consistency maintained:**
- Pre-reader + K-1 play surfaces: Nunito 900, `#100b2e` bg, band colors P0 `#ffd166` / P1 `#9b72ff`
- Teacher student detail: Sora, `#f0f4f8` bg, `#2a5080` nav — desktop min 1024px
- Owner resolution mobile: Sora, `#0d1117` bg, `#ffd166` accent — 390px frame
- Parent notification center: Sora, `#f5f0e8` bg, `#2c7a6e` nav — 375px frame
- Content bulk import: Sora, `#10161e` bg, `#58c8f0` accent — content-admin desktop surface
- Hard-block publish gates enforced in content-bulk-import-review (errors block publish, owner gate ≥100 rows)
- Parent language rules: no accuracy %, no missed-day framing, forward-looking growth language throughout
- Child play: no timers, no grade labels, no skill IDs, no wrong-answer punishment, replay can't lose stars

**Total files delivered across all sessions: 18+** (3 batches of 6)

### 2026-03-22 16:56 CDT
- completed:
  - verified and preserved the latest six-file batch:
    - `play-prereader-session-canonical-v2.html`
    - `play-k1-session-canonical-v2.html`
    - `teacher-student-detail-desktop-v2.html`
    - `owner-feedback-resolution-mobile-v2.html`
    - `parent-notification-center-v2.html`
    - `content-bulk-import-review-v2.html`
- current focus:
  - start the next six-file batch immediately
- next batch:
  - `child-badge-collection-v2.html`
  - `child-world-journey-mobile-v2.html`
  - `parent-weekly-report-v2.html`
  - `teacher-parent-message-center-v2.html`
  - `owner-release-readiness-v2.html`
  - `content-skill-coverage-map-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - `child-badge-collection-v2.html` should show badge shelf, trophy groups, locked/unlocked states, and replay motivation without reading walls
  - `child-world-journey-mobile-v2.html` should connect world picker + progress map + next-world prompt into one mobile child surface
  - `parent-weekly-report-v2.html` should package calm family-ready weekly insight cards, wins, support areas, and next-home-practice ideas
  - `teacher-parent-message-center-v2.html` should be the teacher-side mobile/desktop surface for parent-facing notes, queued messages, and contact-safe actions
  - `owner-release-readiness-v2.html` should be the owner ops screen for go/no-go readiness, blocker counts, route health, and launch checklist state
  - `content-skill-coverage-map-v2.html` should visualize content density by band/skill/node with warn/critical thresholds and edit entry points

---
## UI DELIVERY — BATCH 4
**Delivered by:** UI Agent
**Date:** 2026-03-22
**Status:** ✅ ALL 6 FILES DELIVERED

| File | Persona | Dimensions | Tabs | Status |
|------|---------|------------|------|--------|
| `child-badge-collection-v2.html` | Child | 375px mobile | Badge Shelf / Trophy Groups / Badge Detail / Replay Motivation / Spec | ✅ Done |
| `child-world-journey-mobile-v2.html` | Child | 375px mobile | World Map / World Detail+Node Map / World Complete / Next World Prompt / Spec | ✅ Done |
| `parent-weekly-report-v2.html` | Parent | 375px mobile | Weekly Summary / Progress Snapshot / Home Practice Ideas / Week Comparison / Spec | ✅ Done |
| `teacher-parent-message-center-v2.html` | Teacher | 900px desktop | Message List+Thread / Compose New / Queued+Scheduled / Contact-Safe Rules / Spec | ✅ Done |
| `owner-release-readiness-v2.html` | Owner | 390px mobile | Go/No-Go Dashboard / Blockers / Route Health / Launch Checklist / Spec | ✅ Done |
| `content-skill-coverage-map-v2.html` | Content-Admin | Desktop wide | Coverage Map / Band Drill-Down / Critical Gaps / Add Content Entry / Spec | ✅ Done |

**Design tokens applied:**
- Child: Nunito 900, `#100b2e` bg, P0=`#ffd166` / P1=`#9b72ff`
- Parent: Sora, `#f5f0e8` bg, `#2c7a6e` nav — parent language rules enforced
- Teacher: Sora, `#f0f4f8` bg, `#2a5080` nav — contact-safe messaging
- Owner: Sora, `#0d1117` bg, `#ffd166` accent — GO/NO-GO readiness scoring
- Content-Admin: Sora, `#10161e` bg, `#58c8f0` accent — coverage thresholds + heatmap cells

**Polling:** UI Agent resuming 5-minute polling for Batch 5.
---

### 2026-03-22 17:18 CDT
- completed:
  - verified and preserved Batch 4 delivery:
    - `child-badge-collection-v2.html`
    - `child-world-journey-mobile-v2.html`
    - `parent-weekly-report-v2.html`
    - `teacher-parent-message-center-v2.html`
    - `owner-release-readiness-v2.html`
    - `content-skill-coverage-map-v2.html`
- current focus:
  - start Batch 5 immediately
- next batch:
  - `child-daily-challenge-v2.html`
  - `child-returning-streak-restore-v2.html`
  - `parent-child-detail-desktop-v2.html`
  - `teacher-assignment-creator-v2.html`
  - `owner-adoption-overview-v2.html`
  - `content-explainer-studio-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - `child-daily-challenge-v2.html` should show a short, high-energy child challenge surface with one-tap entry, small rewards, and no shame if skipped
  - `child-returning-streak-restore-v2.html` should handle comeback flows after 2-day, 7-day, and longer gaps with calm recovery framing and streak-safe language
  - `parent-child-detail-desktop-v2.html` should become the larger-screen companion to weekly report and family summary:
    - per-child performance
    - strengths/support areas
    - recent sessions
    - recommended next home practice
  - `teacher-assignment-creator-v2.html` should cover the teacher-side workflow for choosing a skill, assigning practice, selecting a learner group, and reviewing schedule/send states
  - `owner-adoption-overview-v2.html` should focus on launch-band adoption, active households, teacher uptake, and readiness trends
  - `content-explainer-studio-v2.html` should design the content-admin workflow for explainer script/media hint editing, preview, QA checks, and publish gating

---
## UI DELIVERY — BATCH 5
**Delivered by:** UI Agent
**Date:** 2026-03-22
**Status:** ✅ ALL 6 FILES DELIVERED

| File | Persona | Dimensions | Tabs | Status |
|------|---------|------------|------|--------|
| `child-daily-challenge-v2.html` | Child | 375px mobile | Challenge Home / Active Challenge / Challenge Complete / Skip Flow / Spec | ✅ Done |
| `child-returning-streak-restore-v2.html` | Child | 375px mobile | 2-Day Return / 7-Day Return / Long-Gap Return / Streak Restore Complete / Spec | ✅ Done |
| `parent-child-detail-desktop-v2.html` | Parent | Desktop 1160px | Child Overview / Skill Detail / Recent Sessions / Home Practice / Spec | ✅ Done |
| `teacher-assignment-creator-v2.html` | Teacher | Desktop 860px | Choose Skill / Configure / Select Learners / Schedule & Send / Spec | ✅ Done |
| `owner-adoption-overview-v2.html` | Owner | 390px mobile | Adoption Dashboard / Band Adoption / Teacher Uptake / Readiness Trends / Spec | ✅ Done |
| `content-explainer-studio-v2.html` | Content-Admin | Desktop 1200px | Script Editor / Media Hints / Preview & Test / QA & Publish Gate / Spec | ✅ Done |

**Design tokens applied:**
- Child: Nunito 900, `#100b2e` bg, `#9b72ff` violet, `#ffd166` gold — no shame, no timers, streak-safe
- Parent: Sora, `#f5f0e8` bg, `#2c7a6e` teal — parent language rules enforced, no accuracy %, forward-looking
- Teacher: Sora, `#f0f4f8` bg, `#2a5080` nav — band chips P0-P3 exact colors, auto-hint rule for support tier
- Owner: Sora, `#0d1117` bg, `#ffd166` gold — adoption KPIs, band drill-down, SVG trend chart
- Content-Admin: Sora, `#10161e` bg, `#58c8f0` cyan — script editor + QA publish gate

**Polling:** UI Agent resuming 5-minute polling for Batch 6.
---

### 2026-03-22 20:08 CDT
- completed:
  - verified and preserved Batch 5 delivery:
    - `child-daily-challenge-v2.html`
    - `child-returning-streak-restore-v2.html`
    - `parent-child-detail-desktop-v2.html`
    - `teacher-assignment-creator-v2.html`
    - `owner-adoption-overview-v2.html`
    - `content-explainer-studio-v2.html`
- current focus:
  - start Batch 6 immediately
- next batch:
  - `child-home-hub-canonical-v2.html`
  - `play-session-shell-tablet-v2.html`
  - `parent-linking-recovery-v2.html`
  - `teacher-command-center-v2.html`
  - `owner-command-center-v2.html`
  - `content-alpha-readiness-dashboard-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - `child-home-hub-canonical-v2.html` should be the returning child’s home after quick entry:
    - continue quest
    - daily challenge
    - badge shelf entry
    - world journey shortcut
    - fast “start play” dominance
    - child-safe, low-text, high-visual framing
  - `play-session-shell-tablet-v2.html` should unify the strongest pre-reader and K1 play patterns into one tablet-friendly shell:
    - question area
    - voice coach affordance
    - progress chips
    - reward pulse
    - gentle recovery state
    - between-question pacing
  - `parent-linking-recovery-v2.html` should cover the parent-side recovery states still missing in the live app:
    - wrong child linked
    - unlink / relink flow
    - no linked child empty state
    - multiple-child family management
    - trust and privacy cues
  - `teacher-command-center-v2.html` should be the unified teacher dashboard surface:
    - class summary
    - support queue
    - at-risk learners
    - recent assignments
    - quick drilldown actions
    - mobile and desktop notes inline
  - `owner-command-center-v2.html` should be the unified owner ops surface:
    - release readiness
    - route health
    - open feedback
    - adoption snapshot
    - top blockers
    - fastest actions for triage and launch decision
  - `content-alpha-readiness-dashboard-v2.html` should be the content-admin view for alpha-close:
    - question-count by band
    - explainer coverage
    - weak-skill gaps
    - publish readiness
    - import / edit / QA next actions
    - visible thresholds that help engineering decide if the alpha bank is broad enough

---
## UI DELIVERY — BATCH 6
**Delivered by:** UI Agent
**Date:** 2026-03-22
**Status:** ✅ ALL 6 FILES DELIVERED

| File | Persona | Dimensions | Tabs | Status |
|------|---------|------------|------|--------|
| `child-home-hub-canonical-v2.html` | Child | 375px mobile | Home Hub / Empty State / Stars & Rewards / World Map / Spec | ✅ Done |
| `play-session-shell-tablet-v2.html` | Child | 768×1024px tablet | Pre-Reader Question / K-1 Question / Reward Pulse / Gentle Recovery / Spec | ✅ Done |
| `parent-linking-recovery-v2.html` | Parent | 375px mobile | Wrong Child Linked / Unlink-Relink Flow / No Linked Child / Multi-Child Family / Spec | ✅ Done |
| `teacher-command-center-v2.html` | Teacher | Desktop 3-col | Class Summary / Support Queue / At-Risk Learners / Recent Assignments / Spec | ✅ Done |
| `owner-command-center-v2.html` | Owner | 390px mobile | Command Overview / Release Readiness / Route Health+Feedback / Adoption+Blockers / Spec | ✅ Done |
| `content-alpha-readiness-dashboard-v2.html` | Content-Admin | Desktop 1200px | Alpha Readiness Overview / Question Count / Explainer Coverage / Publish Readiness / Spec | ✅ Done |

**Design tokens applied:**
- Child: Nunito 900, `#100b2e` bg — home hub hero CTA dominant; tablet 768×1024 play shell with persistent progress strip
- Parent: Sora, `#f5f0e8` bg, `#2c7a6e` teal — amber-only warnings, trust/privacy cues, zero blame language
- Teacher: Sora, `#f0f4f8` bg, `#2a5080` nav — 3-col command center, SNS tier colors, support queue sorted by urgency
- Owner: Sora, `#0d1117` bg, `#ffd166` gold — GO/NOT-GO readiness gate, route health + feedback + adoption in one surface
- Content-Admin: Sora, `#10161e` bg, `#58c8f0` cyan — alpha readiness score 71/100, coverage thresholds, priority action queue

**Polling:** UI Agent resuming 5-minute polling for Batch 7.
---

### 2026-03-22 20:34 CDT
- completed:
  - verified and preserved Batch 6 delivery:
    - `child-home-hub-canonical-v2.html`
    - `play-session-shell-tablet-v2.html`
    - `parent-linking-recovery-v2.html`
    - `teacher-command-center-v2.html`
    - `owner-command-center-v2.html`
    - `content-alpha-readiness-dashboard-v2.html`
- current focus:
  - start Batch 7 immediately
- next batch:
  - `child-achievement-hub-v2.html`
  - `parent-family-settings-desktop-v2.html`
  - `teacher-student-detail-mobile-v2.html`
  - `teacher-assignment-creator-mobile-v2.html`
  - `owner-release-readiness-detail-v2.html`
  - `question-factory-workbench-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - `child-achievement-hub-v2.html` should unify badge shelf, trophies, world unlocks, streak restore, and replay motivation into one child-facing reward hub that feels low-text and celebration-first
  - `parent-family-settings-desktop-v2.html` should become the bigger-screen management surface for:
    - linked children
    - notification channels
    - quiet hours
    - unlink / relink safety
    - trust and privacy controls
  - `teacher-student-detail-mobile-v2.html` should bring the strongest student drilldown states into a teacher-friendly mobile surface for quick intervention checks between classes
  - `teacher-assignment-creator-mobile-v2.html` should compress the assignment workflow into a compact mobile flow without losing clarity on skill selection, learner group, and schedule/send state
  - `owner-release-readiness-detail-v2.html` should be the deeper owner go/no-go drilldown:
    - blocker list
    - route health evidence
    - feedback severity mix
    - launch recommendation
    - signoff / hold actions
  - `question-factory-workbench-v2.html` should be the beta content-production surface:
    - question count by band / skill
    - draft / review / approved states
    - batch generation review
    - gap identification
    - clear next-action buttons for content admins

---
## UI DELIVERY — BATCH 7
**Delivered by:** UI Agent
**Date:** 2026-03-22
**Status:** ✅ ALL 6 FILES DELIVERED

| File | Persona | Dimensions | Tabs | Status |
|------|---------|------------|------|--------|
| `child-achievement-hub-v2.html` | Child | 375px mobile | Achievement Hub Home / Badge Shelf+Trophies / World Unlocks / Streak+Replay / Spec | ✅ Done |
| `parent-family-settings-desktop-v2.html` | Parent | Desktop 1024px | Linked Children / Notification Channels / Quiet Hours / Privacy & Trust / Spec | ✅ Done |
| `teacher-student-detail-mobile-v2.html` | Teacher | 390px mobile | Student Snapshot / Skill Snapshot / Intervention History / Quick Actions / Spec | ✅ Done |
| `teacher-assignment-creator-mobile-v2.html` | Teacher | 390px mobile | Skill Picker / Configure / Select Learners / Review & Send / Spec | ✅ Done |
| `owner-release-readiness-detail-v2.html` | Owner | 390px mobile | Blocker Detail / Route Health Evidence / Feedback Severity / Decision+Signoff / Spec | ✅ Done |
| `question-factory-workbench-v2.html` | Content-Admin | Desktop 1200px | Factory Overview / Question Queue / Batch Generation Review / Gap Identification / Spec | ✅ Done |

**Design tokens applied:**
- Child: Nunito 900, `#100b2e` bg — celebration-first achievement hub, badge+trophy+world+streak unified
- Parent: Sora, `#f5f0e8` bg, `#2c7a6e` teal — desktop family settings, locked teacher-msg bypass, privacy promise
- Teacher (mobile): Sora, `#f0f4f8` bg, `#2a5080` nav — compact student drilldown + 3-step mobile assignment flow
- Owner: Sora, `#0d1117` bg, `#ffd166` gold — blocker SLA evidence, route detail, feedback severity, disabled launch gate
- Content-Admin: Sora, `#10161e` bg, `#58c8f0` cyan — question queue with hard-block enforcement, batch review, gap chart

**Polling:** UI Agent resuming 5-minute polling for Batch 8.
---

### 2026-03-22 22:18 CDT
- completed:
  - verified and preserved Batch 7 delivery:
    - `child-achievement-hub-v2.html`
    - `parent-family-settings-desktop-v2.html`
    - `teacher-student-detail-mobile-v2.html`
    - `teacher-assignment-creator-mobile-v2.html`
    - `owner-release-readiness-detail-v2.html`
    - `question-factory-workbench-v2.html`
- current focus:
  - start Batch 8 immediately
- next batch:
  - `child-session-resume-overlay-v2.html`
  - `play-gentle-recovery-mobile-v2.html`
  - `parent-home-practice-planner-v2.html`
  - `teacher-support-queue-mobile-v2.html`
  - `owner-live-incident-center-v2.html`
  - `content-publish-readiness-detail-v2.html`
- blockers:
  - none
- notes for UI agent:
  - keep polling this file only
  - `child-session-resume-overlay-v2.html` should be the fast return surface after a child re-enters:
    - continue where they left off
    - preview rewards waiting
    - one-tap restart
    - low-text, high-visual, no guilt language
  - `play-gentle-recovery-mobile-v2.html` should focus on the in-session wrong-answer / hint / replay loop for small screens:
    - visual prompt stays visible
    - voice coach stays dominant
    - correction is calm
    - recovery CTA is obvious
  - `parent-home-practice-planner-v2.html` should turn weekly insight into an actionable parent plan:
    - 3 short activities
    - optional reminders
    - child-specific suggestions
    - keep it calm and family-safe
  - `teacher-support-queue-mobile-v2.html` should compress the support queue into a mobile-first teacher surface:
    - urgency order
    - learner detail entry
    - intervention action
    - no clutter
  - `owner-live-incident-center-v2.html` should be the owner’s operational hot path during beta:
    - route incident list
    - deploy/runtime alerts
    - severity/state filters
    - quick triage actions
  - `content-publish-readiness-detail-v2.html` should be the content-admin gate before beta publish:
    - question count by band
    - explainer coverage
    - hard-block issues
    - publish checklist
    - visible pass/fail threshold treatment
