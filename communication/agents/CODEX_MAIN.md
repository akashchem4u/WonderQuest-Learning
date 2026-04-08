# CODEX Main Agent

Updated: `2026-04-07T08:45:00Z`

## Current Position

- Backend beta backlog is closed in code.
- Production routes were verified live on Render.
- Production AI feature gate was verified on `2026-04-06 12:07 CDT` as enabled.
- Production child smoke with live AI was verified on `2026-04-06 12:22 CDT`.
- Follow-up hardening pass completed locally for teacher skills, monitoring, and content QA.
- Play-session timeout fix is pushed to `main` as `545bd61`, Render was retriggered with `6b8adfe`, and the supporting Supabase indexes are applied.
- Play cue / distractor / skill-variety hotfix is pushed to `main` as `3c93524` and is live in production.
- Teacher route security pass is complete locally and verified; production still needs the deploy.

## Completed Recently

- Notification lifecycle endpoints and guardian-scoped notification handling
- Parent skills and parent report APIs
- Assignment progress and teacher assignment workflow backend
- Persistent mastery tracking and intervention resolution feedback
- AI session hardening with live budget, prewarm, and fallback model support
- Health endpoint, backend smoke expansion, and smoke cleanup path
- Teacher profile compatibility route for UI branches
- Child `streakCount` returned from access/session payloads
- Verification that teacher assignments POST contract already matches active teacher assignment UI
- Production child smoke passed with real `ai-live_*` question keys and cleanup completed
- Added `/api/teacher/skills` in the main repo using `teacher_student_roster`
- Added `/api/teacher/class` in the main repo to match the worktree roster contract
- Added `/api/teacher/interventions` and `/api/teacher/interventions/auto-queue` in the main repo
- Added `/api/teacher/students/[studentId]` in the main repo for teacher drill-down pages
- Added `/api/parent/activity` and `/api/parent/reset-child-pin` in the main repo
- Added parent route compatibility for `studentId` aliases and batch notification PATCH
- Upgraded `/api/parent/report` to the richer weekly-report contract with `weekOffset`
- Added `/api/child/logout`, `/api/parent/logout`, and `/api/teacher/logout` in the main repo
- Updated `/api/teacher/access` to return `teacherId` and set `wonderquest-teacher-id`
- Added scheduled GitHub Actions health check for `/api/health`
- Added repeatable content QA sampling and saved the first report to `communication/content_qa_20260406.json`
- Added runtime prompt sanitization so seeded `Variant N`/meta boilerplate is stripped when questions load
- Aligned `render.yaml` primary question model with runtime default `gpt-5-mini`
- Added shared prompt-cleanup tooling in `tools/question-prompt-sanitizer.mjs`
- Added `tools/clean_seeded_question_bank.mjs` and rewrote `data/launch/sample_questions.json.gz`
- Verified the local bank now reports `promptHygiene.issueCount: 0` and QA sample `flaggedIssues: []`
- Verified Supabase seeded prompt hygiene is also now clean at `issueCount: 0`
- Added DB verification script `app/scripts/seeded-prompt-hygiene-report.mjs` and npm alias `db:report-prompt-hygiene`
- Added targeted DB repair script `app/scripts/fix-seeded-prompt-hygiene.mjs` and npm alias `db:fix-prompt-hygiene`
- Raised default seeded question sync batch size from `500` to `2000` and made sync chunk sizes env-configurable
- Fixed `weekOffset` handling in `getParentReport(...)` so service-layer weekly/monthly windows shift correctly
- Added targeted regression smoke `app/scripts/parent-report-weekoffset-smoke.mjs` and npm alias `smoke:parent-report`
- Verified local week shifting end to end:
  - current week -> `This week`, `sessions: 1`
  - previous week -> `Last week`, `sessions: 0`
- Added scheduled production route/auth smoke in `.github/workflows/render-route-check.yml`
- Production auth smoke now uses `tools/render_post_setup_check.sh` on a 30-minute schedule
- Added content QA CI gates in `.github/workflows/content-qa.yml`
- Bank regressions now fail CI on duplicate keys, missing explainers, or prompt-hygiene issues
- Fixed the play-session timeout by replacing broad band scans with difficulty-bucket reads in `session-service.ts`
- Added `supabase/migrations/20260407_000013_play_session_query_performance.sql`
- Verified locally:
  - `npm run lint` passed
  - `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3004 npm run smoke:local` passed
  - `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3004 npm run smoke:backend` passed
- Applied the new performance migration directly to Supabase
- Re-ran the live child smoke against `https://wonderquest-learning.onrender.com` and confirmed `/api/play/session` no longer fails with `Query read timeout`
- Ran `npm run cleanup:smoke` after production verification
- Replaced the hardcoded early-play label with question-type-aware stage labels in `play-client.tsx`
- Replaced the soccer-ball math hero with countable stars for early addition / subtraction scenes
- Added prompt-level replay / slow replay / pictures-only controls so audio help is visible without scrolling
- Sanitized ambiguous early-reader distractors in `content-bank.ts` so `bat` no longer pairs with sports words like `ball` or `net`
- Tightened `session-service.ts` guided selection so it walks the band skill ladder before pooled fallback
- Verified locally on `http://127.0.0.1:3004`:
  - `npm run lint` passed
  - `WONDERQUEST_SMOKE_BASE_URL=http://127.0.0.1:3004 npm run smoke:local` passed
  - `K1` guided skills: `short-a-sound`, `read-simple-word`, `add-to-10`, `short-e-sound`, `short-i-sound`
  - `PREK` guided skills: `count-to-3`, `shape-circle`, `letter-b-recognition`, `letter-a-recognition`, `rhyme-match`
- Verified in production on `https://wonderquest-learning.onrender.com`:
  - hotfix commit `3c93524` is deployed
  - production smoke returns the same non-repeating K1 / PREK guided skill sequences
- Added `app/src/lib/teacher-session.ts` to centralize teacher-session validation
- Normalized the remaining teacher-only routes to `requireTeacherSession(...)`
  - includes AI suggestions, AI push sessions, demo-class routes, virtual-class status, and teacher notes
- Updated `tools/render_post_setup_check.sh` to:
  - match the current live page copy for `/child`, `/parent`, `/teacher`, and `/owner`
  - assert `/api/health` returns `status: ok`
  - assert parent auth gates stay closed
  - assert teacher `/api/class`, `/api/skills`, and `/api/interventions` return `401`
- Verified locally:
  - `npm run lint` passed
  - `/api/teacher/class` -> `401`
  - `/api/teacher/ai-suggestions` -> `401`
  - `/api/teacher/has-virtual-class` -> `401`
- Verified on Render with the repaired checker:
  - public routes pass
  - health route passes and still reports live question generation enabled
  - parent routes pass auth-gate checks
  - teacher `/api/class`, `/api/skills`, `/api/interventions` still fail auth-gate checks in production (`200`)

## Latest Deployment — `8b318cc` (2026-04-07T08:45Z)

### Shipped in this batch
- Owner auth hardening — all 4 owner APIs now `401` unauthenticated on live Render:
  - `/api/owner/overview` — was returning `500`, now `401` ✅
  - `/api/owner/feedback` — was returning `200`, now `401` ✅
  - `/api/owner/schools` — guarded ✅
  - `/api/owner/schools/teachers` — guarded ✅
- `app/src/lib/owner-session.ts` committed (was untracked; required by owner API imports)
- DB resilience — all access routes (child/parent/teacher/owner) now return `503` + friendly message on connection failures
- Smoke gate hardened:
  - `assertHealthyDatabase` preflight added to `live-smoke.mjs` and `backend-smoke.mjs`
  - Owner auth assertions added to `live-smoke.mjs` (unauthenticated `401` + post-auth success)
  - `smoke:backend` and `smoke:beta` npm scripts added; `smoke:beta` is the new beta release gate
  - `render_post_setup_check.sh` — owner auth checks added (now 17 checks total)
  - `render.yaml` — `npm ci` for reproducible builds
- Teacher Recent Wins page (`/teacher/recent-wins`) — ported from sidecar and deployed

### Live verification (2026-04-07T08:45Z)
- `tools/render_post_setup_check.sh https://wonderquest-learning.onrender.com` = **17/17 pass, 0 failures**

## Recommended Next Claims

1. ~~Deploy the local teacher-route security pass~~ — superseded; owner auth is the blocker that was live
2. Parent link-health UI — OTHER_AGENT is assigned (see `OTHER_AGENT.md`)
3. Route error boundaries for `/child`, `/play`, `/parent` — OTHER_AGENT queued after link-health
4. Teacher UI hookup to assignments/interventions using the now-complete main-repo API surface

## Files That Need Care

- [session-service.ts](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/lib/session-service.ts)
- [live-question-generator.ts](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/lib/live-question-generator.ts)
- [parent-service.ts](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/lib/parent-service.ts)
- [teacher-session.ts](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/lib/teacher-session.ts)
- [render_post_setup_check.sh](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/tools/render_post_setup_check.sh)

Avoid parallel edits here unless explicitly coordinated in [WORK_QUEUE.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/WORK_QUEUE.md).
