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
