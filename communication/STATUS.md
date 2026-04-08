# Shared Status

Updated: `2026-04-07T08:45:00Z`

## Production Facts

- Render production URL: `https://wonderquest-learning.onrender.com`
- Verified on `2026-04-06 17:07 UTC`:
  - `GET /api/health` returned `200`, `liveQuestionGenerationEnabled: true`
- Verified production routes exist:
  - `/api/health`, `/api/parent/skills`, `/api/parent/report`
  - `/api/parent/notifications/read-all`, `/api/teacher/interventions/:id/resolve`
- Production child smoke passed with real `ai-live_*` keys on `2026-04-06 17:22 UTC`
- Verified on `2026-04-06 20:54 UTC` with updated `render_post_setup_check.sh`:
  - public routes `/`, `/child`, `/parent`, `/owner`, `/teacher` all returned `200`
  - `/api/health` reports live question generation enabled
  - parent routes `/api/parent/activity` and `/api/parent/reset-child-pin` are deployed and parent-gated (`401` without session)
  - teacher routes `/api/teacher/class`, `/api/teacher/skills`, and `/api/teacher/interventions` still return `200` without teacher access
    - this strongly suggests production is still serving the older ungated teacher-route implementation, not the latest local gated pass
- Re-verified on `2026-04-07 00:30 UTC` via `tools/render_post_setup_check.sh`:
  - parent routes still pass auth-gate checks
  - teacher `/api/class`, `/api/skills`, `/api/interventions` still fail auth-gate checks in production (`200` instead of `401`)
- Re-verified on `2026-04-07 00:57 UTC` after repairing `tools/render_post_setup_check.sh`:
  - public route checks now match current live UI copy on `/child`, `/parent`, `/teacher`, and `/owner`
  - `/api/health` confirms `status: ok` and `liveQuestionGenerationEnabled: true`
  - parent auth gates still pass in production
  - teacher `/api/class`, `/api/skills`, and `/api/interventions` still fail auth-gate checks in production (`200` instead of `401`)
  - this is now the clearest remaining production backend gap
- Re-verified on `2026-04-06 22:33 UTC` after pushing the play-session timeout fix:
  - isolated fix commit `545bd61` pushed to `main`
  - follow-up empty commit `6b8adfe` pushed to retrigger Render auto-deploy because the first rollout did not pick up immediately
  - `WONDERQUEST_SMOKE_BASE_URL=https://wonderquest-learning.onrender.com npm run smoke:local` passed
  - the previous production `Query read timeout` on `/api/play/session` is no longer reproducing
  - `npm run cleanup:smoke` completed after the production verification run
- Re-verified on `2026-04-06 23:08 UTC` after pushing play/content hotfix `3c93524`:
  - hardcoded `"Which word matches the picture?"` was replaced with question-type-aware stage labels in play
  - math hero visuals no longer fall back to the soccer-ball icon for `add-to-10` / `subtract-from-10`
  - early-learner replay controls are now visible near the active prompt, not only in the lower support area
  - ambiguous `bat` distractors are sanitized so sports words like `ball` / `net` do not appear in early reading cards
  - guided-session selection now walks the band skill ladder before pooled fallback, reducing repeated skills in a single quest
  - production child smoke now returns non-repeating guided skills:
    - `K1`: `short-a-sound`, `read-simple-word`, `add-to-10`, `short-e-sound`, `short-i-sound`
    - `PREK`: `count-to-3`, `shape-circle`, `letter-b-recognition`, `letter-a-recognition`, `rhyme-match`

## Backend State

- All backend beta backlog items deployed and verified
- Supabase migration applied: `20260406_000008_learning_ops_hardening.sql`
- Scheduled GitHub Actions health check live (every 15 min to `/api/health`)
- Scheduled GitHub Actions production route check added (every 30 min via `tools/render_post_setup_check.sh`)
- Scheduled GitHub Actions content QA added for bank/report regressions
- Runtime prompt sanitization live in `content-bank.ts`
- Content QA report saved to `communication/content_qa_20260406.json`
- Seeded bank cleaned at rest on `2026-04-06`
  - `tools/clean_seeded_question_bank.mjs` rewrote `data/launch/sample_questions.json.gz`
  - normalized `967224` prompt strings to remove top-up boilerplate
  - `app/scripts/content-bank-report.mjs` now reports `promptHygiene.issueCount: 0`
  - regenerated `communication/content_qa_20260406.json` now shows `promptHygieneFailures: 0` for all sampled bands and `flaggedIssues: []`
- Seeded Supabase prompt hygiene is now verified clean
  - first full `db:sync-launch` completed after the initial cleanup pass
  - second full resync attempt timed out at the database statement level
  - added targeted DB maintenance scripts:
    - `app/scripts/seeded-prompt-hygiene-report.mjs`
    - `app/scripts/fix-seeded-prompt-hygiene.mjs`
  - reran remote verification on `2026-04-06` and confirmed:
    - `npm run db:report-prompt-hygiene` -> `issueCount: 0`
- CODEX_MAIN local compatibility pass completed:
  - teacher: `/api/class`, `/api/skills`, `/api/interventions`, `/api/interventions/auto-queue`, `/api/students/[studentId]`
  - parent: `/api/activity`, `/api/reset-child-pin`, richer `/api/report`, notification collection `PATCH`, `studentId` alias support
  - logout parity: `/api/child/logout`, `/api/parent/logout`, `/api/teacher/logout`
  - teacher identity parity: `/api/teacher/access` now returns `teacherId` and sets `wonderquest-teacher-id`
- CODEX_MAIN teacher-session hardening pass completed locally:
  - added shared helper `app/src/lib/teacher-session.ts`
  - normalized all teacher-only API routes to the same session contract
  - teacher APIs now resolve identity from `wonderquest-teacher-id` only after `hasTeacherAccess()` passes
  - mismatched `teacherId` query/body values now fail with `403`
  - routes converted in this pass:
    - `/api/teacher/class`
    - `/api/teacher/skills`
    - `/api/teacher/interventions`
    - `/api/teacher/interventions/auto-queue`
    - `/api/teacher/interventions/[id]/resolve`
    - `/api/teacher/messages`
    - `/api/teacher/profile`
    - `/api/teacher/skill-detail/[skillCode]`
    - `/api/teacher/skill-trends`
    - `/api/teacher/students/[studentId]`
    - `/api/teacher/students/[studentId]/report`
    - `/api/teacher/assignments`
    - `/api/teacher/assignments/[assignmentId]`
    - `/api/teacher/assignments/[assignmentId]/progress`
    - `/api/teacher/ai-suggestions`
    - `/api/teacher/ai-push-sessions`
    - `/api/teacher/create-demo-class`
    - `/api/teacher/remove-demo-class`
    - `/api/teacher/has-virtual-class`
    - `/api/teacher/notes`
  - `create-demo-class` now accepts `G6` as a valid demo band
- Local verification after the teacher-session pass:
  - `npm run lint` passed
  - local unauthenticated checks now return `401` on:
    - `/api/teacher/class`
    - `/api/teacher/ai-suggestions`
    - `/api/teacher/has-virtual-class`
- Expanded backend smoke now passes locally against `next dev`
  - verified `teacherRosterCount: 1`
  - verified `teacherSkillCount: 16`
  - verified `teacherInterventionCount: 2`
  - verified `parentNotificationCount: 5`
  - verified `parentActivityCount: 1`
  - verified `weeklyReportSessions: 1`
  - verified `parentUnreadCountAfterRead: 0`
- Re-ran backend smoke after teacher access parity change
  - still passed end-to-end
  - confirmed teacher access now returns a `teacherId`
- Parent report service now honors `weekOffset`
  - `app/src/lib/parent-service.ts` now anchors weekly/monthly report windows to the requested week
  - `app/src/app/api/parent/report/route.ts` now passes `weekOffset` through to the legacy service call
  - added targeted smoke `app/scripts/parent-report-weekoffset-smoke.mjs`
  - verified locally on `http://127.0.0.1:3004`:
    - current week -> `weekLabel: "This week"`, `sessions: 1`
    - previous week -> `weekLabel: "Last week"`, `sessions: 0`
- Play-session query timeout fix is now shipped to `main`
  - root cause was broad band-wide ordered scans in `loadBandQuestionWindow(...)`
  - `app/src/lib/session-service.ts` now:
    - loads same-band questions in difficulty buckets instead of one broad ordered scan
    - runs bucket reads in parallel
    - skips the duplicate fallback pass when there are no recent-question exclusions
    - uses the same band-window path for fallback requested-focus reconstruction
  - added migration `supabase/migrations/20260407_000013_play_session_query_performance.sql`
    - partial active index on `(launch_band_code, difficulty, example_key)`
    - partial active index on `(skill_id, difficulty, example_key)`
  - applied `20260407_000013_play_session_query_performance.sql` directly to Supabase on `2026-04-06`
  - local verification on `http://127.0.0.1:3004`:
    - `npm run lint` passed
    - `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3004 npm run smoke:local` passed
    - `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3004 npm run smoke:backend` passed
    - observed `POST /api/play/session` timings:
      - `K1` about `1.8s` to `3.1s`
      - slower `PREK` case about `5.8s` to `8.8s`
  - isolated deploy commit pushed to `origin/main`: `545bd61` (`Fix play session query timeout`)
  - Render retrigger commit pushed to `origin/main`: `6b8adfe` (`Trigger Render deploy for play-session timeout fix`)
  - production child smoke now passes again on Render

## UI Agent Latest Pass (`2026-04-06T22:15 UTC`)

### Auth Gates — All Teacher Sidebar Pages Now Protected
- `feedback-panel`, `band-coverage`, `recent-wins` now show TeacherGate if unauthenticated
- `class-health`, `intervention-overview`, main dashboard already had gates
- All 5 sidebar-linked teacher pages now require auth before any data loads

### Child Sign-Out Added
- "Sign out" button added to child hub nav bar → `/api/child/logout`
- Previously the route existed but was inaccessible from UI

### Backend Lib Sync (main → worktree)
- `session-service.ts` — bank-first AI strategy (seeded questions served first; AI only supplements shortfall slots; cache warmed when bank is sufficient)
- `intervention-service.ts` — TeacherInterventionRecord type + mapping helpers added
- `parent/notifications/route.ts` — updated notification lifecycle handling
- Re-added `getPlaySessionHistory` export to session-service (child/history route dependency)

### Build Status
- `next build` passes clean (0 TypeScript errors, all pages compiled)
- Pushed to main: commit `c6dd142`

### Previously Fixed (from live testing)
- **"Question order is out of sync"** — relaxed positional sync check
- **undefined questions / NaN% accuracy** on parent skill detail — field name mismatch
- **studentId vs childId param mismatch** — routes now accept both aliases
- **"Next Question" button stuck after Q5** — adaptive question spliced into client session
- **teacher skills route wrong table** — teacher_student_links → teacher_student_roster
- `GET /api/parent/logout` + `GET /api/child/logout` + `GET /api/teacher/logout`
- Sign out links in parent and teacher sidebars

## CODEX_MAIN Latest Deploy — `8b318cc` (2026-04-07T08:45Z)

- Owner auth hardening deployed — `/api/owner/overview` and `/api/owner/feedback` now return `401` unauthenticated
- `owner-session.ts` committed and live
- DB connection errors now return `503` across all access routes
- `smoke:beta` added as the new beta release gate
- `render_post_setup_check.sh` now has 17 checks including owner auth assertions
- Teacher Recent Wins page live at `/teacher/recent-wins`
- Live verification: **17/17 pass, 0 failures**

## CODEX_MAIN Tasks Outstanding

1. ~~Deploy owner auth hardening~~ ✅ DONE
2. ~~Teacher route security~~ ✅ Previously deployed
3. Parent link-health UI — assigned to OTHER_AGENT
4. Route error boundaries — assigned to OTHER_AGENT, queued after link-health

## Remaining Beta Work

- [x] Owner pages — wired to /api/owner/overview (users, analytics, schools, experiments all live)
- [x] Child profile logout — sign-out button added to hub nav bar
- [x] Auth gate all teacher sidebar pages — done
- [x] Owner auth hardening deployed — `/api/owner/overview` and `/api/owner/feedback` return `401` ✅
- [x] Teacher Recent Wins page live ✅
- [ ] Parent link-health UI — OTHER_AGENT assigned
- [ ] Route error boundaries for `/child`, `/play`, `/parent` — OTHER_AGENT queued
- [ ] End-to-end play session completion screen smoke in production
- [ ] Parent notifications mark-read in prod
- [ ] Parent weekly/report pages smoke in production

## Collision Risks

- `app/src/lib/session-service.ts` — recently edited by UI agent
- `app/src/lib/parent-service.ts` — CODEX_MAIN owns
- `app/src/app/parent/page.tsx` — coordinate before editing
- `app/src/app/teacher/page.tsx` — coordinate before editing
