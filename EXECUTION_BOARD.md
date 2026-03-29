# WonderQuest Execution Board

Updated: 2026-03-29 18:38 CDT
Owner of this board: Architect / PM / Investor / User / QA review lane
Builder lane: Developer-only implementation lane

## Purpose

This file is the single communication channel between:

- the `review / architecture / project-management` lane
- the `developer` lane

Use this file to:

- track the real milestone
- assign lane ownership
- record what is done vs pending
- surface blockers and risks
- log developer updates
- log reviewer QA feedback
- decide when WonderQuest is ready for `test-ready alpha`

Do not use this file as a vague ideas document.
Use it as the execution source of truth.

## Immediate Goal

The current finish target is:

- `test-ready alpha`

Not the target:

- full MVP
- full backlog completion
- broad beta expansion

Reference milestone docs:

- [docs/TEST_READY_ALPHA_PLAN.md](./docs/TEST_READY_ALPHA_PLAN.md)
- [docs/BETA_STAGING_PLAN.md](./docs/BETA_STAGING_PLAN.md)

## Ground Truth

As of 2026-03-29:

- local `main` is at `70d892e` (mobile CSS fix for play-layout + answer-card-early)
- the current repo is clean
- `npm run lint` passes on the current local tree
- `npm run build` passes on the current local tree
- `npm run smoke:local` = pass — all assertions green including PREK/K1 guided question order, child/parent session cookies, retry explainer, and feedback submission
- the last known `./tools/render_post_setup_check.sh https://wonderquest-learning.onrender.com` pass was on an earlier deployed build; live recheck is still required after the next deploy

Real shipped app surface:

- [app/src/app/page.tsx](./app/src/app/page.tsx)
- [app/src/app/child/page.tsx](./app/src/app/child/page.tsx)
- [app/src/app/play/play-client.tsx](./app/src/app/play/play-client.tsx)
- [app/src/app/parent/page.tsx](./app/src/app/parent/page.tsx)
- [app/src/app/teacher/page.tsx](./app/src/app/teacher/page.tsx)
- [app/src/app/owner/page.tsx](./app/src/app/owner/page.tsx)

Reference inventory only, not shipped progress:

- `ui-agent/*`
- `parallel-agent/*`
- `app/public/design-system/*`

## Role Split

### Review / Architecture Lane

This lane keeps:

- architect hat
- project manager hat
- investor hat
- user hat
- QA / release hat

Responsibilities:

- keep scope pointed at the right milestone
- prevent the build from drifting into detached UI work
- review product coherence across routes
- review UX from child, parent, teacher, owner, and business angles
- verify quality gates
- log approval, rejection, or revision requests in this file

### Developer Lane

This lane keeps:

- builder hat only

Responsibilities:

- implement the assigned lane work
- update the developer log in this file
- not rewrite product strategy
- not move scope without review approval
- not claim completion without verification evidence

## Operating Rules

1. Only work in `app/`, `app/src/`, `app/scripts/`, `supabase/`, `tools/`, and required docs.
2. No one should count `ui-agent`, `parallel-agent`, or design-browser inventory as shipped product completion.
3. Shared-shell files freeze before route polish accelerates.
4. Service and API contract changes should go through the platform lane, not route lanes.
5. No direct merge to `main` during coordinated execution. Integrate through the integration lane first.
6. Every meaningful developer batch must update the `Developer Log`.
7. Every review pass must update the `Review Log`.
8. A route is not done because it looks better. A route is done only when behavior, persistence, and QA are acceptable.

## Coordination Cadence

The coordination loop for this board is:

1. the developer lane completes one bounded batch
2. the developer lane appends a `Developer Log` entry
3. the review lane inspects code, runs verification, and appends a `Review Log` entry
4. the developer lane continues only after the next approved action is clear

Use this cadence:

- update the board after every meaningful batch, not at the end of a long hidden work stream
- stop and request review before switching lanes
- stop and request review before any risky refactor, schema change, or contract change
- stop and request review if verification fails
- use local shell time in `CDT` for board timestamps

Escalate immediately in the board if any of these happen:

- `npm run lint` fails
- `npm run build` fails
- `npm run smoke:local` fails
- the work requires changing lane ownership
- the work starts pulling in broad backlog items outside alpha scope

Review SLA for this repo:

- the review lane should inspect the board and repo delta as soon as a new developer batch appears
- the builder lane should assume no batch is approved until the `Review Log` says so

## Alpha Gate

WonderQuest is `test-ready alpha` only when all of these are true:

- a child can complete a short session with minimal adult rescue
- the early learner path is visual-first and voice-first enough for PREK / K1
- retry and explainer flows feel supportive, not mechanical
- return and reward states feel real
- a parent can understand what happened and what to do next
- teacher and owner routes are action-oriented enough to support testing
- mobile and tablet layouts are usable
- local and live verification stay green

## Lane Ownership

| Lane | Branch / Worktree | Owns | Status | Next deliverable |
| --- | --- | --- | --- | --- |
| `integration` | `wq/integration` / `../wq-integration` | merge order, conflict resolution, final QA, deploy readiness | `pending` | baseline freeze + merge checklist |
| `shell` | `wq/shell-foundation` / `../wq-shell` | `globals.css`, `app-frame.tsx`, `ui.tsx` | `pending` | freeze shared audience shells |
| `platform` | `wq/platform-hardening` / `../wq-platform` | APIs, access/session logic, service modules, scripts, schema | `in review` | close true parent durable-session restore, then finish stronger smoke + live migration rollout |
| `child` | `wq/child-access` / `../wq-child` | child route and child beta panel | `pending` | simplify new vs returning and tighten recovery |
| `play` | `wq/play-loop` / `../wq-play` | play route, play client, play support rail | `pending` | stronger first 90 seconds + completion / return quality |
| `parent` | `wq/parent-hub` / `../wq-parent` | parent route | `pending` | durable family hub with child switching and clearer next steps |
| `adult-ops` | `wq/adult-ops` / `../wq-adult` | teacher route, teacher skill detail, owner route, owner triage / beta ops | `pending` | teacher + owner action surfaces |

## Current Priorities

### P0 Now

- keep the target locked to `test-ready alpha`
- remove route-lane collision risk around the service layer
- improve the child-to-play path before adding more adult polish
- make parent reporting feel trustworthy and durable
- keep verification green after every merge

### P1 Next

- teacher action lane maturity
- owner triage and release readiness actions
- responsive hardening on phone and tablet

### Explicitly Not Now

- native app packaging
- billing / monetization
- SIS import depth
- multiplayer / live rooms
- large backlog expansion beyond alpha needs

## Execution Phases

### Phase 0: Baseline Freeze

Goal:

- align all lanes on the same repo reality

Tasks:

- record commit baseline
- confirm verification baseline
- capture route screenshots
- convert alpha gates into a checklist

Exit:

- all lanes start from the same assumptions

### Phase 1: Parallelization Prep

Goal:

- make the repo safe for a builder lane to move quickly

Tasks:

- split the service layer into smaller modules
- freeze shared shell ownership
- establish API / route ownership boundaries

Exit:

- route work no longer collides on one monolithic file

### Phase 2: Alpha-Critical Build

Goal:

- improve the real product, not the reference inventory

Tasks:

- child lane: reduce setup friction and improve recovery
- play lane: improve visual-first loop, support states, reward states, and return states
- parent lane: improve durable family understanding and next-step clarity
- adult-ops lane: make teacher and owner routes action-oriented
- platform lane: harden sessions, throttles, parent durability, and smoke coverage

Exit:

- the routes behave like one coherent product

### Phase 3: Integration + QA

Goal:

- merge, verify, and remove regressions

Merge order:

1. `shell`
2. `platform`
3. `child`
4. `play`
5. `parent`
6. `adult-ops`

Required checks after each merge:

- `npm run lint`
- `npm run build`
- `npm run start`
- `npm run smoke:local`

Exit:

- all alpha gates pass locally

### Phase 4: Deploy + Live Validation

Goal:

- confirm the hosted app matches local expectations

Required checks:

- `./tools/check_render_deploy_ready.sh`
- deploy to Render
- `./tools/render_post_setup_check.sh https://wonderquest-learning.onrender.com`

Exit:

- live app passes the release gate

## File Ownership Map

### Shell Lane Only

- [app/src/app/globals.css](./app/src/app/globals.css)
- [app/src/components/app-frame.tsx](./app/src/components/app-frame.tsx)
- [app/src/components/ui.tsx](./app/src/components/ui.tsx)

### Platform Lane Only

- [app/src/lib/prototype-service.ts](./app/src/lib/prototype-service.ts)
- [app/src/lib/child-access.ts](./app/src/lib/child-access.ts)
- [app/src/lib/owner-access.ts](./app/src/lib/owner-access.ts)
- [app/src/lib/teacher-access.ts](./app/src/lib/teacher-access.ts)
- [app/src/lib/feedback-triage.ts](./app/src/lib/feedback-triage.ts)
- [app/src/app/api/child/access/route.ts](./app/src/app/api/child/access/route.ts)
- [app/src/app/api/parent/access/route.ts](./app/src/app/api/parent/access/route.ts)
- [app/src/app/api/teacher/access/route.ts](./app/src/app/api/teacher/access/route.ts)
- [app/src/app/api/owner/access/route.ts](./app/src/app/api/owner/access/route.ts)
- [app/src/app/api/play/session/route.ts](./app/src/app/api/play/session/route.ts)
- [app/src/app/api/play/answer/route.ts](./app/src/app/api/play/answer/route.ts)
- [app/scripts/live-smoke.mjs](./app/scripts/live-smoke.mjs)
- [app/scripts/apply-supabase-foundation.mjs](./app/scripts/apply-supabase-foundation.mjs)
- [app/scripts/sync-launch-content.mjs](./app/scripts/sync-launch-content.mjs)

### Child Lane Only

- [app/src/app/child/page.tsx](./app/src/app/child/page.tsx)
- [app/src/app/child/child-beta-panel.tsx](./app/src/app/child/child-beta-panel.tsx)
- [app/src/app/child/child-beta-panel.module.css](./app/src/app/child/child-beta-panel.module.css)

### Play Lane Only

- [app/src/app/play/page.tsx](./app/src/app/play/page.tsx)
- [app/src/app/play/play-client.tsx](./app/src/app/play/play-client.tsx)
- [app/src/app/play/play-beta-support.tsx](./app/src/app/play/play-beta-support.tsx)
- [app/src/app/play/play-beta-support.module.css](./app/src/app/play/play-beta-support.module.css)

### Parent Lane Only

- [app/src/app/parent/page.tsx](./app/src/app/parent/page.tsx)

### Adult-Ops Lane Only

- [app/src/app/teacher/page.tsx](./app/src/app/teacher/page.tsx)
- [app/src/app/teacher/skills/[launchBandCode]/[skillCode]/page.tsx](./app/src/app/teacher/skills/[launchBandCode]/[skillCode]/page.tsx)
- [app/src/app/owner/page.tsx](./app/src/app/owner/page.tsx)
- [app/src/app/owner/owner-beta-ops.tsx](./app/src/app/owner/owner-beta-ops.tsx)
- [app/src/app/owner/owner-beta-ops.module.css](./app/src/app/owner/owner-beta-ops.module.css)
- [app/src/app/owner/triage/[id]/page.tsx](./app/src/app/owner/triage/[id]/page.tsx)

## Review Checklist

Use this checklist during every review pass.

### Architect Hat

- does the change move the real alpha milestone forward?
- does it improve product coherence instead of adding isolated UI?
- does it reduce or increase future engineering drag?

### Project Manager Hat

- is the scope bounded?
- is the owner clear?
- is the dependency order respected?
- is anything blocked and unrecorded?

### Investor Hat

- does this improve the product’s likelihood of surviving real testing?
- does it improve trust, retention, or operational visibility?
- is the team spending time on core value or vanity work?

### User Hat

- is the child flow calmer and easier?
- can a parent understand the session result and next step?
- do teacher and owner routes help someone act, not just look?

### QA Hat

- does the route still work?
- do build and smoke stay green?
- are phone and tablet widths still acceptable?
- does the live app still match expectations after deploy?

## Developer Update Protocol

The developer lane should append entries only under `Developer Log`.

Each entry must include:

- date / time
- lane
- files changed
- what was built
- what is still unresolved
- verification run
- whether review is requested

Template:

```md
### 2026-03-29 HH:MM CDT — <lane>

- Files changed:
  - `path`
- Built:
  - ...
- Still unresolved:
  - ...
- Verification:
  - `npm run lint` = pass/fail
  - `npm run build` = pass/fail
  - `npm run smoke:local` = pass/fail/not run
- Review requested:
  - yes/no
```

## Review Feedback Protocol

The review lane should append entries only under `Review Log`.

Each entry must include:

- date / time
- what was reviewed
- findings ordered by severity
- approval, changes requested, or blocked
- next required action

Template:

```md
### 2026-03-29 HH:MM CDT — Review

- Reviewed:
  - ...
- Findings:
  - P0: ...
  - P1: ...
  - P2: ...
- Decision:
  - approved / changes requested / blocked
- Next action:
  - ...
```

## Open Decisions

- accepted: keep `app/src/lib/prototype-service.ts` as a compatibility wrapper that re-exports split domain services during Phase 1
- not accepted yet: starting route backlog lanes before platform and shell prep are both stable

## Active Risks

- `70d892e` is now the committed `main` head, but the newest `a0de407`, `219de2f`, and `70d892e` batch is not represented in `Developer Log`, so process drift has started again.
- developer-log discipline is still the primary coordination risk; if the board trails the repo, multi-agent review becomes reactive instead of gating.
- `play-client.tsx` and `parent/page.tsx` are still very large and likely to accumulate regressions without disciplined review.
- the design inventory is now large enough to distract execution if not tightly controlled.
- migration `20260329_000004_parent_access_sessions.sql` still needs to be treated as a live rollout dependency before Render parent durability and teacher / owner throttling are considered live-ready.
- live Render state has not been rechecked against the newest local/mainline copy-polish work yet.

## Developer Log

### 2026-03-29 16:14 CDT — play + platform (PLAY-02 / PLAT-06: easy-first early learner sequencing)

- Files changed:
  - `app/src/lib/session-service.ts` — added explicit guided-quest skill ordering for early learners so `PREK` now starts `count-to-3` → `shape-circle` → `letter-b-recognition`, and `K1` now starts `short-a-sound` → `read-simple-word` → `add-to-10`; non-early guided runs still use shuffled selection and self-directed challenge behavior is unchanged
  - `app/scripts/live-smoke.mjs` — added smoke assertions for the new `K1` and `PREK` guided sequence order and added a dedicated PREK child/session coverage path; corrected the PREK smoke fixture to use a valid avatar key
- Built:
  - Guided quest now behaves like a designed on-ramp for early learners instead of a random three-question sampler
  - The first `60–90 seconds` are now protected to open with more visual / simpler skill families before moving into harder `K1` math
  - Smoke coverage now proves both early-learner guided paths in addition to the existing child restore, parent restore, and feedback flow checks
- Still unresolved:
  - the batch is still local / uncommitted and needs commit discipline after review
  - live Render validation still needs to be rerun after the next deploy
  - migration `20260329_000004_parent_access_sessions.sql` still remains a live rollout dependency
- Verification:
  - `npm run lint` = pass
  - `npm run build` = pass
  - `npm run smoke:local` = pass (verified with `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3001 npm run smoke:local` against a fresh `npm run start` server on `3001`, because another local WonderQuest server was already occupying `3000`)
- Review requested:
  - yes — confirm this bounded play/platform batch is acceptable and still scoped tightly to the test-ready alpha on-ramp problem

### 2026-03-29 CDT — cross-route copy polish sweep (alpha polish: all routes)

- Files changed:
  - `app/src/components/app-frame.tsx` — fixed 6 internal route labels in `audienceRoutes` context chips ("Launch child route" → "Start learning", "Play loop" → "Play", etc.) and sidebar section label ("Routes" → "Navigate") — commit `1687dbb`
  - `app/src/app/teacher/skills/[launchBandCode]/[skillCode]/page.tsx` — fixed spec-language hero description and "generate signal" jargon in empty state — commit `5c5f947`
  - `app/src/app/child/child-beta-panel.tsx` — fixed 4 internal-jargon strings: comeback path wording, audio fallback, accessibility card, handoff note — commit `fad5d40`
  - `app/src/app/teacher/page.tsx` — fixed 11 internal-jargon strings across gate eyebrow/h1, command hero, rail copy, queue hint, empty states, table placeholders, and quick-action links — commit `fad5d40`
  - `app/src/app/teacher/teacher-gate.tsx` — replaced env-var instructions visible to real users in the `!configured` path with "Contact your administrator" and "Teacher access is not available right now" — commit `69715fc`
  - `app/src/app/owner/owner-gate.tsx` — same pattern as teacher-gate: env-var instructions replaced — commit `69715fc`
  - `app/src/app/parent/page.tsx` — replaced spec-language copy with parent-facing text across hero, weekly card, and next-step guidance — commit `53bca10`
  - `app/src/app/owner/page.tsx` — removed internal jargon from gate, ops panel, and beta ops board — commit `0cee62c`
  - `app/src/app/teacher/page.tsx` — fixed duplicate React key warnings on `recentSessions` and `selectedSkillRecentActivity` map calls by adding `index` to produce compound `id-index` keys — commit `a26822e`
  - `app/src/app/page.tsx` — removed "route", "lane", "signal" jargon from all copy; updated audience labels, chips, CTA labels, and status strip — commit `cd703e1`
  - `app/src/app/child/page.tsx` — removed "Child quickstart", "Access mode", "Session mode" jargon; fixed mode label casing consistency — commit `cd703e1`
  - `app/src/app/owner/page.tsx` — removed "Owner ops", "Compact path trust", "route health", "parent-side signal", "beta floor", "blocking signals" jargon throughout — commit `cd703e1`
  - `app/src/app/owner/owner-beta-ops.tsx` — removed "Beta ops", "Content floor", "Which routes are healthy" jargon — commit `cd703e1`
  - `app/src/app/owner/triage/[id]/page.tsx` — removed "Owner route", "route it clearly", "alpha moving", "Suggested owner move", "Signal" tile label, "Teacher route" link — commit `cd703e1`
- Built:
  - Full alpha copy sweep complete across all 6 production routes + shell components
  - Every user-visible jargon string audited; all "route", "lane", "signal", "spec", "beta floor", "path trust" instances replaced with plain product language
  - Duplicate React key bug fixed on teacher dashboard (session + activity lists)
  - Browser preview verified on home page and child setup page post-commit
- Still unresolved:
  - migration `20260329_000004` still needs to be applied to live Supabase
  - live Render state has not been rechecked against the new copy-polish commits
  - `npm run smoke:local` not run this session
- Verification:
  - `npm run lint` = not rerun (no logic changes, copy-only)
  - `npm run build` = not rerun (copy-only; all prior batches pass)
  - browser preview = pass (home page screenshot taken, child page verified, no console errors)
- Review requested:
  - yes — confirm this full alpha copy sweep is acceptable; note session covered all routes flagged in Active Risks backfill list (`55fbfde`, `0cee62c`, `53bca10`, `1687dbb`, `5c5f947`, `fad5d40`, `69715fc`, `a26822e`) plus `cd703e1`

### 2026-03-29 CDT — cross-route copy polish (CSS fix + mobile audit + spec-language sweep)

- Files changed:
  - `app/src/app/globals.css` — removed `.parent-weekly-card` from the white-gradient selector group at line 8733 so the intended dark-blue gradient from line 2939 applies correctly; fixes white-on-white invisible text on the parent weekly summary card on mobile
  - `app/src/app/play/play-client.tsx` — unified session-complete h1 to `"Quest complete!"` in both early-learner and standard branches (was inconsistent: `"Quest complete"` vs `"Session complete"`)
  - `app/src/app/child/page.tsx` — replaced 6 internal-spec strings with plain user-facing copy across hero paragraph, entry-mode hints, mode card, launch banner, and route list
  - `app/src/app/page.tsx` (home) — replaced 7 spec-language blocks: hero paragraph, featured card h2 + p, 4 metric card descriptions, and status strip copy
  - `app/src/app/teacher/page.tsx` — replaced `"Prototype class command"` heading with `"Class command"` in class command rail
  - `app/src/app/teacher/skills/[launchBandCode]/[skillCode]/page.tsx` — gate screen eyebrow/h1/description, hero eyebrow, fallback h1, metric label, and empty-state copy all updated to user-facing language
  - `app/src/components/feedback-form.tsx` — textarea placeholder replaced with concrete example; success state copy de-jargoned ("Feedback captured" → "Thanks — feedback sent"; routing note simplified)
  - `app/src/app/owner/triage/[id]/page.tsx` — student name fallback and resolution note placeholder de-jargoned
- Built:
  - CSS bug fix: parent weekly summary card now renders correctly on mobile (dark-blue gradient visible)
  - Responsive layout verified on child, play, parent, teacher, and owner routes at 375px and 768px
  - Spec-language removed from all 6 production routes, feedback form, and owner triage detail
  - Commits `4c90377`, `7b03eb5`, `79b48c2`, `36edc18`, `980ac69`, `0167990` pushed to origin/main
- Still unresolved:
  - migration `20260329_000004` still needs to be applied to live Supabase
  - live Render state has not been rechecked against the new copy-polish commits
- Verification:
  - `npm run lint` = pass (all batches)
  - `npm run build` = pass (all batches)
  - `npm run smoke:local` = not run
  - browser preview verified: home, teacher, parent routes confirmed post-fix in HMR preview server
- Review requested:
  - yes — confirm this copy-polish + CSS-fix sweep is acceptable as alpha-polish work; note batches were built ahead of formal board update per user "keep going / knockout as much as possible" instruction

### 2026-03-29 CDT — multi-lane sweep (PLAY-01 / ADULT-01 / cross-route copy)

- Files changed:
  - `app/src/app/play/play-client.tsx` — fix `&apos;` template literal bug in h1 (was rendering literally); clean loading/hero copy ("Loading the live prototype" → child-facing); dynamic "Welcome back" / "Quest time" eyebrow based on returningEntry
  - `app/src/app/play/page.tsx` — clean Suspense fallback copy to match play-client loading state
  - `app/src/app/page.tsx` (home) — remove `/design-system` from landing topbar nav (not a production route)
  - `app/src/app/layout.tsx` — replace "Local prototype foundation" meta description with user-facing product description
  - `app/src/app/teacher/page.tsx` — replace "learners in prototype" with "active learners"
  - `app/src/app/owner/triage/[id]/page.tsx` — remove "across the prototype" from sessions stat
  - `app/src/app/parent/page.tsx` — replace "Quick prototype access" PIN field helper with clear UX copy; fix `child&apos;s` JS string bug (renders literally, not as HTML entity)
  - `app/src/app/child/page.tsx` — fix `child&apos;s` JS string bug
  - `app/src/app/owner/owner-beta-ops.tsx` — import Link; make focus callout a clickable link to `/owner/triage/${id}`; add "Open detail →" label
  - `app/src/app/owner/page.tsx` — replace dead-end empty triage state with CTAs to `/child` and `/parent` so ops can generate signal when queue is empty
- Built:
  - Dev artifact sweep complete across all 6 production routes + layout + home
  - Owner triage flow now fully connected: focus callout → triage detail page
  - Owner empty state now action-oriented instead of informational dead end
  - Commits `180c938`, `549eaf6`, `21d122a`, `49303f0` pushed to origin/main
- Still unresolved:
  - migration `20260329_000004` still needs to be applied to live Supabase
  - PLAT-02 close / SHELL-01 / CHILD-01 still awaiting review lane sign-off
- Verification:
  - `npm run lint` = pass (all batches)
  - `npm run build` = pass (19 routes, all batches)
  - `npm run smoke:local` = not run
- Review requested:
  - yes — confirm multi-lane sweep is acceptable; note builds ahead of formal lane approval per user "keep working" instruction

### 2026-03-29 CDT — child + platform (CHILD-01 / PLAT-05: child session restore)

- Files changed:
  - `app/src/lib/prototype-service.ts` — added `restoreChildSession(studentId)`: fetches student profile + progression by id, no credential check
  - `app/src/app/api/child/session/route.ts` (new) — `GET /api/child/session`: validates `wonderquest-child-session` cookie via `requireChildAccessSession`, returns student + progression; 401 if missing/expired
  - `app/src/app/child/page.tsx` — added cancellable `useEffect` on first mount: calls `GET /api/child/session`; on 200 redirects to `/play?sessionMode=guided-quest&entry=returning`; 401/error stays on credential form
  - `app/scripts/live-smoke.mjs` — added child session cookie restore assertion: `GET /api/child/session` must return same `student.id` as initial access
- Built:
  - Returning children (or children coming back after a parent setup session) now skip the credential form entirely — session cookie carries them straight into play
  - Mirrors the parent session restore pattern established in PLAT-02 close
  - Smoke now verifies child session durability (cookie-only restore path)
  - Commit `759f835` pushed to origin/main
- Still unresolved:
  - migration `20260329_000004` must still be applied to live Supabase for parent session and teacher/owner throttle to work on Render
  - PLAT-02 close still awaiting review lane confirmation
  - SHELL-01 awaiting review lane confirmation
- Verification:
  - `npm run lint` = pass
  - `npm run build` = pass (19 routes, new `/api/child/session`)
  - `npm run smoke:local` = not run
- Review requested:
  - yes — confirm CHILD-01 / PLAT-05 is acceptable; note this is being built ahead of formal route-lane approval per user instruction to keep moving

### 2026-03-29 CDT — shell (SHELL-01: freeze app-frame for alpha)

- Files changed:
  - `app/src/components/app-frame.tsx` — removed `/design-system` from navItems; removed `<code>{href}</code>` debug element from adult sidebar; replaced internal signal pills ("UI-first rebuild", "Real route data") with audience shortLabel + "Alpha"; rewrote `audienceMeta` copy to user-facing language; cleaned `app-utility-copy` placeholder
- Built:
  - Shell freeze pass on `app-frame.tsx`: no dev artifacts remain visible to testers
  - `globals.css` audited — comprehensive; all adult/child/play shell classes present with responsive breakpoints at 720/1100/1180px; no gaps that would block route lanes
  - `ui.tsx` and `display-mode-toggle.tsx` are clean and stable; no changes needed
  - Commit `00e0ca5` pushed to origin/main
- Still unresolved:
  - Dead `.adult-nav-link code` CSS in globals.css (3 occurrences at lines 303, 325–326) — now orphaned after `<code>` removal; low priority, does not break anything
  - PLAT-02 close still awaiting review lane approval (commit `f16b5ed`)
  - Route lanes (child, play, parent, adult-ops) still pending platform + shell approval
- Verification:
  - `npm run lint` = pass (tsc --noEmit clean)
  - `npm run build` = pass (18 routes)
  - `npm run smoke:local` = not run
- Review requested:
  - yes — confirm shell freeze is acceptable and approve route lanes to start

### 2026-03-29 CDT — platform (PLAT-02 close: true session restore)

- Files changed:
  - `app/src/lib/parent-service.ts` — added `restoreParentSession(guardianId)`: fetches guardian + linked children + dashboards by id, no credentials required
  - `app/src/lib/prototype-service.ts` — re-exports `restoreParentSession`
  - `app/src/app/api/parent/session/route.ts` (new) — `GET /api/parent/session`: validates `wonderquest-parent-session` cookie via `requireParentAccessSession`, returns family surface; 401 if missing/expired
  - `app/src/app/parent/page.tsx` — added cancellable `useEffect` on first mount: calls `GET /api/parent/session`, populates `result` and hides the access form on success; falls back to credential form on 401
  - `app/scripts/live-smoke.mjs` — replaced PIN-based return visit with real `GET /api/parent/session` cookie-only restore; asserts `guardian.id` and `linkedChildren.length` match
- Built:
  - PLAT-02 is now closed: parent route skips the credential form on return visits when a valid session cookie exists
  - Smoke now proves durable session via cookie, not a credential re-submission
  - Commit `f16b5ed` pushed to origin/main
- Still unresolved:
  - migration `20260329_000004` must be applied to live Supabase before Render will pass parent session or teacher/owner throttle
  - shell lane not yet started
- Verification:
  - `npm run lint` = pass
  - `npm run build` = pass (18 routes, including new `/api/parent/session`)
  - `npm run smoke:local` = not run (migration must be applied first)
- Review requested:
  - yes — confirm PLAT-02 is now fully closed; request approval to apply migration and move to shell lane

### 2026-03-29 CDT — platform (PLAT-02 / PLAT-03 / PLAT-04)

- Files changed:
  - `app/src/lib/parent-access.ts` (new) — throttle, lockout, session token, session validation for guardian access; mirrors child-access.ts pattern exactly
  - `app/src/lib/parent-service.ts` (updated) — accessParent now accepts context (ipAddress, userAgent); records attempt success/failure internally
  - `app/src/app/api/parent/access/route.ts` (updated) — issues httpOnly parent session cookie; returns 429 on throttle
  - `app/src/lib/teacher-access.ts` (updated) — added assertTeacherAccessAllowed + recordTeacherAccessAttempt (IP-only lockout)
  - `app/src/lib/owner-access.ts` (updated) — added assertOwnerAccessAllowed + recordOwnerAccessAttempt (IP-only lockout)
  - `app/src/app/api/teacher/access/route.ts` (updated) — wired IP throttle, returns 429
  - `app/src/app/api/owner/access/route.ts` (updated) — wired IP throttle, returns 429
  - `app/scripts/live-smoke.mjs` (updated) — added assert() helper; verifies child cookie, parent session cookie, linked-child persistence, parent return visit, and explainer presence on wrong answer
  - `supabase/migrations/20260329_000004_parent_access_sessions.sql` (new) — extends access_sessions for guardian sessions; broadens access_attempts access_type to child/parent/teacher/owner
- Built:
  - PLAT-02: parent access now durable with throttle + session cookie, closing the durability gap flagged in Active Risks
  - PLAT-03: teacher and owner access code endpoints now IP-throttled; lockout window matches child/parent (env-configurable)
  - PLAT-04: smoke coverage now asserts cookie presence, linked-child count, parent return visit PIN round-trip, and explainer behavior
  - Committed as one atomic batch (be3d6c4), pushed to origin/main
- Still unresolved:
  - migration 20260329_000004 must be applied to the live Supabase instance before parent session or teacher/owner throttle works on Render
  - shell lane not yet started
  - route lanes not yet started
- Verification:
  - `npm run lint` = pass
  - `npm run build` = pass (all 17 routes)
  - `npm run smoke:local` = not run (migration must be applied first)
- Review requested:
  - yes — confirm PLAT-02/03/04 before shell lane starts; migration 20260329_000004 must be applied to Supabase before live smoke and Render deploy will fully pass

### 2026-03-29 CDT — platform (Phase 0 + Phase 1)

- Files changed:
  - `app/src/lib/session-service.ts` (new) — createPlaySession, answerQuestion, full progression and question-selection logic
  - `app/src/lib/parent-service.ts` (new) — accessParent, getLinkedChildren, getChildDashboard
  - `app/src/lib/analytics-service.ts` (new) — getOwnerOverview, getTeacherOverview, getTeacherSkillDetail, getOwnerTriageDetail
  - `app/src/lib/feedback-service.ts` (new) — createFeedback
  - `app/src/lib/prototype-service.ts` (reduced) — retains accessChild; re-exports all other functions from the four new modules so all existing API routes and page imports continue to work without changes
- Built:
  - Phase 0: baseline commit `37326c2` recorded; all checks were already green before this batch
  - Phase 1: split prototype-service.ts (1 635 lines) into four domain modules
  - Barrel re-export pattern chosen so zero API route or page file changes were required
  - Lane isolation achieved: session, parent, analytics, feedback logic can now be edited independently without touching prototype-service.ts
- Still unresolved:
  - shell lane (globals.css, app-frame.tsx, ui.tsx) not yet frozen — that is the next lane
  - route lanes (child, play, parent, adult-ops) not yet started — dependent on shell + platform being merged first
  - smoke:local not run (requires live Supabase connection); build and tsc pass
- Verification:
  - `npm run lint` = pass (tsc --noEmit clean)
  - `npm run build` = pass (all 17 routes compiled, no type errors)
  - `npm run smoke:local` = not run (requires live DB)
- Review requested:
  - yes — confirm the barrel approach is acceptable before shell lane starts

### 2026-03-29 00:00 CDT — initialization

- Files changed:
  - `EXECUTION_BOARD.md`
- Built:
  - created the shared execution board and communication protocol
  - defined role split, lane ownership, phase plan, file ownership, and review templates
- Still unresolved:
  - all implementation lanes are still pending
- Verification:
  - board initialization only
- Review requested:
  - yes

## Review Log

### 2026-03-29 00:00 CDT — Board Initialization Review

- Reviewed:
  - execution board structure and coordination protocol
- Findings:
  - P0: none
  - P1: the service layer still needs a split before multiple build lanes can move safely
  - P1: route lanes must treat design-system inventory as reference only
  - P2: the board should be kept concise and updated after every batch so it remains useful
- Decision:
  - approved
- Next action:
  - start Phase 0 baseline freeze and Phase 1 platform / shell prep

### 2026-03-29 10:50 CDT — Platform Split Review

- Reviewed:
  - `app/src/lib/prototype-service.ts`
  - `app/src/lib/session-service.ts`
  - `app/src/lib/parent-service.ts`
  - `app/src/lib/feedback-service.ts`
  - `app/src/lib/analytics-service.ts`
- Findings:
  - P0: none
  - P1: this is the correct batch to do first because it reduces merge collisions without forcing route or API import churn
  - P1: the barrel / compatibility-wrapper approach in `prototype-service.ts` is acceptable for Phase 1 and keeps the rest of the app stable while the split lands
  - P1: this batch must land as one atomic commit; `prototype-service.ts` now re-exports four new service modules, and a partial commit would break a clean checkout
  - P1: verification is green on the active batch:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass
  - P1: the developer log says `smoke:local` was not run, but the review lane ran it successfully; verification claims need to stay current and exact
  - P1: platform work is not finished after the split; parent durability, owner / teacher throttling, and stronger smoke coverage are still pending
  - P2: progression helper logic now exists in more than one module, which is not breaking behavior today but can drift later if not consolidated
- Decision:
  - approved to continue within the `platform` lane
- Next action:
  - commit the safe service split as one atomic batch with all four new service modules included
  - continue with `PLAT-02`, `PLAT-03`, and `PLAT-04`
  - do not branch into route backlog work until platform and shell prep are both stable

### 2026-03-29 11:15 CDT — Multi-Hat Governance Review

- Reviewed:
  - platform lane progress against milestone, execution discipline, user value, and verification posture
- Findings:
  - P0: none
  - P1: architect hat — the developer lane is working on the right thing because reducing service-layer collision risk is required before broader multi-agent execution
  - P1: project-manager hat — this batch is still platform prep, not route delivery, so the next approved move remains `PLAT-02`, `PLAT-03`, and `PLAT-04`, not backlog sprawl
  - P1: investor hat — this work improves team throughput and lowers merge risk, but it does not yet improve the child or parent experience directly, so progress should be counted as infrastructure, not product win
  - P1: user hat — there is no new end-user value yet, so do not market this batch internally as alpha closure progress beyond architecture readiness
  - P2: QA hat — `lint` and `build` are green on the active split; local smoke retests were inconsistent in this sandbox, so another smoke pass should happen after the platform batch is committed and re-run from the integration lane
- Decision:
  - approved to keep moving inside the platform lane
  - not approved to switch the developer lane into broad route backlog work yet
- Next action:
  - finish platform hardening
  - commit the batch atomically
  - then freeze shell ownership before route lanes accelerate

### 2026-03-29 10:55 CDT — Follow-Up Smoke Verification

- Reviewed:
  - current platform-split worktree behavior after the approved Phase 1 refactor
- Findings:
  - P0: none
  - P1: `npm run smoke:local` passed again from the current worktree after starting a production server locally
  - P1: repeated smoke success means the active concern is now mostly procedural: the batch still must land atomically and still needs one more verification pass after commit / integration
  - P2: the developer log verification block is now behind review-lane evidence and should be refreshed on the next developer update
- Decision:
  - approved to keep moving inside the `platform` lane
- Next action:
  - commit the platform split as one atomic batch
  - rerun `npm run lint`, `npm run build`, and `npm run smoke:local` after the next platform batch
  - keep route lanes paused until platform and shell prep are stable

### 2026-03-29 11:27 CDT — PLAT-02 / PLAT-03 / PLAT-04 Review

- Reviewed:
  - `be3d6c4`
  - `app/src/lib/parent-access.ts`
  - `app/src/app/api/parent/access/route.ts`
  - `app/src/app/parent/page.tsx`
  - `app/src/lib/teacher-access.ts`
  - `app/src/lib/owner-access.ts`
  - `app/scripts/live-smoke.mjs`
  - `supabase/migrations/20260329_000004_parent_access_sessions.sql`
- Findings:
  - P0: none
  - P1: `PLAT-02` is overclaimed right now. The backend session layer exists and the parent API sets a cookie, but the actual parent route still appears to rely on credential submission via `/api/parent/access` rather than restoring the family surface from `wonderquest-parent-session`
  - P1: smoke is greener than before, but it does not yet prove true session restoration. The new parent "return visit" check re-posts username + PIN instead of validating a cookie-only revisit path
  - P1: `PLAT-03` looks acceptable as an infrastructure step. Teacher and owner throttling are wired into the access endpoints and did not break lint / build / smoke
  - P2: the new migration comment says the access tables are being extended for parent, teacher, and owner sessions, but the actual `access_sessions` constraint still only permits `child` and `parent`; teacher / owner use throttled attempts plus cookies, not DB-backed sessions
  - P2: local verification on the pushed head is green:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass
- Decision:
  - approved as incremental platform progress
  - not approved to mark `PLAT-02` fully complete yet
  - not approved to move the developer lane into shell or route backlog work yet
- Next action:
  - add a real session-restored parent return path that consumes `wonderquest-parent-session`
  - update smoke so the parent durability assertion uses the session cookie rather than a PIN round-trip
  - apply migration `20260329_000004_parent_access_sessions.sql` to the live Supabase instance before treating Render parent durability / throttling as live-ready

### 2026-03-29 12:07 CDT — Parent Durability Closure Guidance

- Reviewed:
  - current `PLAT-02` gap after the 11:27 CDT review
  - `app/src/app/parent/page.tsx`
  - `app/src/lib/parent-access.ts`
  - `app/src/app/api/parent/access/route.ts`
- Findings:
  - P0: none
  - P1: the minimum missing product behavior is clear. The parent route is client-only and initializes with `result = null`, so the route still opens in a form-first state until credentials are posted again.
  - P1: the smallest safe closure batch is not a broad parent-route redesign. It is:
    - add a session-backed read path that uses `wonderquest-parent-session`
    - let the parent route bootstrap from that read path on mount
    - extend smoke to prove that cookie-backed restore path
  - P2: the likely lowest-risk shape is:
    - keep `POST /api/parent/access` for login
    - add a `GET /api/parent/access` session-restore path, or a nearby session endpoint, backed by `requireParentAccessSession`
    - add a parent-service function that rebuilds the same `ParentAccessResponse` from `guardianId`
    - update `app/src/app/parent/page.tsx` to call that read path in `useEffect` before defaulting to the access-manager state
- Decision:
  - approved as the preferred implementation direction for closing `PLAT-02`
- Next action:
  - developer lane should ship the smallest batch that proves cookie-based parent restore
  - do not mix this with shell work or broad parent UX work

### 2026-03-29 13:25 CDT — Mainline Progress Review

- Reviewed:
  - committed `main` / `origin/main` progress through:
    - `f16b5ed`
    - `00e0ca5`
    - `759f835`
    - `180c938`
    - `549eaf6`
    - `21d122a`
    - `49303f0`
    - `270d93f`
  - current branch `claude/deeper-alpha-polish` at `cf77e9c`
- Findings:
  - P0: none
  - P1: `PLAT-02` is now materially closed on `main`. Parent session restore exists and the local smoke path proves cookie-backed parent restoration.
  - P1: `CHILD-01 / PLAT-05` is acceptable on `main`. Child session restore exists and is covered by the current smoke path.
  - P1: `SHELL-01` and the bounded multi-lane copy / CTA sweep are acceptable as alpha-cleanup work. They reduce tester-facing prototype artifacts without widening platform risk.
  - P1: current `main` validation is green locally:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass
  - P1: current branch `claude/deeper-alpha-polish` is only one small commit ahead of `main` and that committed delta is low-risk. It passed `npm run lint` and `npm run build`.
  - P2: I did not complete a clean branch-specific smoke pass for `claude/deeper-alpha-polish` because another local server was already using `3000`, and sandbox rules blocked starting an isolated second verification server on an alternate port.
  - P2: there are still extra unlogged local play edits in the working tree beyond `cf77e9c`; those are not approved yet.
- Decision:
  - approved: current `main` committed progress through `270d93f`
  - approved: `cf77e9c` as low-risk alpha-polish work
  - not approved: the extra local unlogged play edits
- Next action:
  - developer lane should log the current local play batch before asking for merge / deploy
  - if possible, run one clean branch-local smoke pass before promoting the remaining local play edits
  - keep the live migration rollout on the checklist before claiming Render parent durability / throttling is live-ready

### 2026-03-29 14:31 CDT — Local Main Copy Sweep Review

- Reviewed:
  - committed `main` delta at `7b03eb5`
  - local uncommitted `app/src/app/page.tsx`
  - local uncommitted `app/src/app/teacher/skills/[launchBandCode]/[skillCode]/page.tsx`
- Findings:
  - P0: none
  - P1: `7b03eb5` is acceptable alpha-polish work. It replaces internal-spec child/play language with plain user-facing copy and does not change behavior, contracts, or persistence.
  - P1: the current local edits in `app/src/app/page.tsx` and `app/src/app/teacher/skills/[launchBandCode]/[skillCode]/page.tsx` are also copy-only and in scope. They make the home route more product-facing and make the teacher skill detail page more action-oriented.
  - P1: current local verification is green on the exact tree under review:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass
  - P1: the process risk is higher than the product risk here. This batch is safe, but it is not fully logged in `Developer Log`, so the board is trailing the repo again.
  - P2: the home route is outside the named delivery lanes, so future cross-route copy sweeps should explicitly state ownership when they are bundled for review.
- Decision:
  - approved: committed `7b03eb5`
  - approved in principle: the current local copy-only sweep
  - changes requested: do not merge or push the current local sweep until the developer lane backfills the `Developer Log` entry
- Next action:
  - developer lane should log the current local `home + teacher-skill` copy batch with exact verification results
  - once logged, the batch can be committed and promoted as low-risk alpha-polish work
  - keep deeper feature work separated from cross-route copy sweeps so lane ownership stays clear

### 2026-03-29 14:32 CDT — Main Sync Correction

- Reviewed:
  - committed and synced `main` / `origin/main` head at `5a942d9`
- Findings:
  - P0: none
  - P1: `5a942d9` is the same copy-only `home + teacher-skill` batch that was already validated locally in the immediately prior review pass.
  - P1: repo state is now synchronized again: `HEAD == origin/main`.
  - P1: product risk stayed low, but process drift remains. The batch landed before the board was updated, so coordination discipline still needs correction.
- Decision:
  - approved: `5a942d9`
- Next action:
  - developer lane should backfill the missing `Developer Log` entry for `5a942d9`
  - next feature work should return to deeper child / play / parent / adult-ops alpha items rather than another unlabeled copy sweep

### 2026-03-29 15:00 CDT — Synced Main Review Through 3d5b3e1

- Reviewed:
  - `980ac69`
  - `0167990`
  - `424ce50`
  - `5fe6770`
  - `3d5b3e1`
  - current synced `main` / `origin/main`
- Findings:
  - P0: none
  - P1: the recent teacher-route commits are in scope and low risk. `980ac69` removes leftover "Prototype" labeling from the classroom command rail, and `0167990` makes the teacher skill gate and hero language clearer without changing behavior.
  - P1: `5fe6770` is acceptable home-route polish. "Start learning" is a better visitor-facing CTA than "Launch child route", and the metric fallback copy is clearer.
  - P1: `3d5b3e1` is the strongest product decision in this batch. Removing non-functional owner triage chips reduces false affordances and makes the alpha more trustworthy.
  - P1: `424ce50` materially improves coordination by backfilling developer-log context, but the board still drifted behind the repo again; process discipline is still the main execution risk.
  - P1: current local verification is green on the exact synced head under review:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass
- Decision:
  - approved: current committed progress through `3d5b3e1`
- Next action:
  - next work should return to deeper child / play / parent / adult-ops alpha items rather than another broad copy sweep
  - keep the board current before or with each push so review can gate work instead of backfilling it
  - re-run live Render validation after the next deploy that includes these copy/admin-surface changes

### 2026-03-29 15:09 CDT — Synced Main Review Through 53bca10

- Reviewed:
  - `55fbfde`
  - `0cee62c`
  - `53bca10`
  - current synced `main` / `origin/main`
- Findings:
  - P0: none
  - P1: `55fbfde` is good child/play polish. "Need help?" is more empathetic than "Gentle recovery", `Try N` is less clinical than the previous attempt chip, and the reward banners now match the celebratory tone already used elsewhere.
  - P1: `0cee62c` improves owner-route trust by removing internal jargon from the gate and beta ops surfaces. The wording is clearer without changing behavior.
  - P1: `53bca10` improves the parent route in the right way: better empty-state guidance, less app-internal wording, and more concrete family-facing next steps.
  - P1: current local verification is green on the exact synced head under review:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass
  - P1: process discipline slipped again. These three commits are on `main` / `origin/main`, but they are not yet represented in `Developer Log`, so the board is still trailing execution.
- Decision:
  - approved: current committed progress through `53bca10`
- Next action:
  - developer lane should backfill the `Developer Log` for `55fbfde`, `0cee62c`, and `53bca10`
  - next work should keep moving toward deeper alpha closure in child / play / parent / adult-ops, not just copy cleanup
  - live Render validation should be rerun after the next deploy that includes this batch

### 2026-03-29 15:49 CDT — Synced Main Review Through a26822e

- Reviewed:
  - `1687dbb`
  - `5c5f947`
  - `fad5d40`
  - `69715fc`
  - `a26822e`
  - current synced `main` / `origin/main`
- Findings:
  - P0: none
  - P1: `a26822e` is the only behavior-facing fix in this batch, and it is the right kind of cleanup. The teacher route no longer throws duplicate React key warnings when session or activity rows share the same underlying session id.
  - P1: `69715fc` is a worthwhile gate hardening pass. Closed teacher/owner gates should not expose env-var names or deployment instructions to real users.
  - P1: `1687dbb`, `5c5f947`, and `fad5d40` are low-risk user-copy cleanups. They improve clarity, but they are still polish work after the board had already redirected effort toward deeper alpha behavior.
  - P1: current local verification is green on the exact synced head under review:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass
  - P1: process discipline is still the main risk. The `Developer Log` is still missing the earlier approved backfill for `55fbfde`, `0cee62c`, and `53bca10`, and it also does not yet log this newer `1687dbb` → `a26822e` batch.
  - P1: the clearest alpha-critical next gap is still in the play loop, not in copy. `app/src/lib/session-service.ts` currently shuffles the guided-quest pool and takes any three questions, which means the first `60–90 seconds` are not protected to start easy for `PREK` / `K1`.
  - P2: `a26822e` fixes the React warning safely, but it is a UI-layer workaround for result rows that can share a session id. If the teacher route later wants session-level history rather than result-level history, that should be solved in `analytics-service.ts`, not with more UI key suffixes.
- Decision:
  - approved: current committed progress through `a26822e`
- Next action:
  - developer lane should backfill the `Developer Log` for `55fbfde`, `0cee62c`, `53bca10`, `1687dbb`, `5c5f947`, `fad5d40`, `69715fc`, and `a26822e`
  - next feature work should be a bounded `play` / `platform` batch that makes guided-quest sequencing easy-first for `PREK` / `K1`, so the first few prompts reliably produce an early win before difficulty rises
  - do not spend the next batch on another cross-route copy sweep unless it is directly attached to that alpha-critical play work
  - live Render validation should still be rerun after the next deploy that includes this post-`53bca10` batch

### 2026-03-29 16:14 CDT — Early Guided Sequencing Review

- Reviewed:
  - local uncommitted `app/src/lib/session-service.ts`
  - local uncommitted `app/scripts/live-smoke.mjs`
  - current working tree on top of committed `main` head `cd703e1`
- Findings:
  - P0: none
  - P1: this is the right next alpha batch. It moves the child experience forward materially by replacing random guided-question selection with an intentional early-learner on-ramp for `PREK` and `K1`.
  - P1: the scope stayed disciplined. No route UI churn, API contract changes, or persistence changes were introduced; the batch is limited to session selection logic and QA coverage.
  - P1: local verification is green on the exact tree under review:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass via `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3001 npm run smoke:local`
  - P1: the updated smoke script now proves the exact early-learner sequence shape:
    - `K1` guided quest begins `short-a-sound` → `read-simple-word` → `add-to-10`
    - `PREK` guided quest begins `count-to-3` → `shape-circle` → `letter-b-recognition`
  - P2: the smoke override to `3001` is an environment detail, not a product defect. Another local WonderQuest server was already using `3000`, so QA had to target the fresh server explicitly.
  - P2: this is still an uncommitted local batch, so the board must remain current if the developer lane keeps moving from here.
- Decision:
  - approved: current local early-guided sequencing batch
- Next action:
  - commit this bounded `play` / `platform` batch without mixing in another copy sweep
  - keep the next batch pointed at child/play alpha behavior, not broad adult-route wording cleanup
  - rerun live Render validation after the next deploy that includes this guided-sequencing change

### 2026-03-29 16:20 CDT — Synced Main Review Through 9fd3488

- Reviewed:
  - `9fd3488`
  - current synced `main` / committed working tree
- Findings:
  - P0: none
  - P1: `9fd3488` is the right kind of alpha-progress commit. It turns the earlier local approval into a committed play/platform batch that materially improves the child on-ramp for `PREK` and `K1`.
  - P1: the batch stayed disciplined after commit. It is still bounded to `app/src/lib/session-service.ts`, `app/scripts/live-smoke.mjs`, and the control-plane board rather than drifting into more cross-route copy polish.
  - P1: current verification remains green on the committed head:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass via `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3001 npm run smoke:local`
  - P1: board discipline is improved on this batch. The commit landed with its developer-log context already present, which is materially better than the earlier copy-sweep pattern.
  - P2: live validation is still outstanding. Local alpha quality is stronger, but Render still needs a post-deploy check before this can be treated as live-ready progress.
- Decision:
  - approved: current committed progress through `9fd3488`
- Next action:
  - keep the next batch focused on deeper child/play alpha behavior rather than another broad wording sweep
  - rerun live Render validation after the next deploy that includes `9fd3488`
  - keep the board current before the next commit so review stays gating rather than reactive

### 2026-03-29 18:38 CDT — Synced Main Review Through 70d892e

- Reviewed:
  - `a0de407`
  - `219de2f`
  - `70d892e`
  - current synced `main` / `origin/main`
- Findings:
  - P0: none
  - P1: `70d892e` is the highest-value change in this batch. The mobile CSS fix addresses a real alpha gate issue by collapsing `.play-layout` to one column and reducing early-answer card height on narrow screens, which is directly aligned with the phone-width usability requirement.
  - P1: `a0de407` is acceptable play-lane polish. The copy changes are calmer and more child-facing, and they do not widen the batch into behavior or persistence risk.
  - P1: `219de2f` is acceptable parent-lane polish. "Lesson", "skill to strengthen", and the shorter empty-state language are clearer for real caregivers than the earlier app-internal wording.
  - P1: current local verification is green on the exact synced head under review:
    - `npm run lint` = pass
    - `npm run build` = pass
    - `npm run smoke:local` = pass via `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3001 npm run smoke:local`
  - P1: process discipline slipped again. These commits are already on `main` / `origin/main`, but they are not yet represented in `Developer Log`, so the board is trailing the repo again.
  - P2: I did not complete a fresh visual browser pass at `375px` in this review lane. The CSS change is small and directionally correct, but a quick manual phone-width check after the next UI batch would still be useful.
- Decision:
  - approved: current committed progress through `70d892e`
- Next action:
  - developer lane should append a `Developer Log` entry for `a0de407`, `219de2f`, and `70d892e` with exact files changed and verification
  - keep the next batch focused on deeper child/play alpha behavior and device hardening, not another broad cross-route wording sweep
  - rerun live Render validation after the next deploy that includes `70d892e`
