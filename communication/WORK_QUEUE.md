# Work Queue

Updated: `2026-04-07T08:45:00Z`

| Workstream | Owner | Status | Write Scope | Next Action |
| --- | --- | --- | --- | --- |
| Teacher profile API | `CODEX_MAIN` | `done` | `app/src/app/api/teacher/profile/route.ts` | ✅ Done |
| Teacher assignments API | `CODEX_MAIN` | `done` | `app/src/app/api/teacher/assignments/route.ts` | ✅ Done |
| Child streak count | `CODEX_MAIN` | `done` | `app/src/lib/prototype-service.ts` | ✅ Done |
| Verify skills.code column | `CODEX_MAIN` | `done` | confirmed in migrations | ✅ skills.code exists |
| Verify example_items.source_kind | `CODEX_MAIN` | `done` | confirmed by migrations | ✅ Done |
| Production smoke with live AI | `CODEX_MAIN` | `done` | scripts only | ✅ Passed, ai-live_* keys confirmed |
| Teacher assignment skill picker | `UI_AGENT` | `done` | `assignment/page.tsx` + new `/api/teacher/skills` | ✅ Dynamic skills from DB |
| Child hub world progress + error state | `UI_AGENT` | `done` | `child/hub/page.tsx` | ✅ Done |
| Error states (child profile, teacher home) | `UI_AGENT` | `done` | child/profile, teacher/home | ✅ Done |
| Parent family real data + dates | `UI_AGENT` | `done` | `parent/family/page.tsx` | ✅ Done |
| Sync backend agent files to worktree | `UI_AGENT` | `done` | worktree | ✅ Done |
| Teacher class API (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/teacher/class/route.ts` | ✅ Added route matching worktree roster contract |
| Teacher skills API (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/teacher/skills/route.ts` | ✅ Added route using `teacher_student_roster` |
| Teacher interventions APIs (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/teacher/interventions/**` + `app/src/lib/intervention-service.ts` | ✅ Added list/create/resolve + auto-queue routes |
| Teacher student detail API (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/teacher/students/[studentId]/route.ts` | ✅ Added drill-down detail route |
| Parent activity API (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/parent/activity/route.ts` | ✅ Added recent session feed route with skill filtering |
| Parent reset-child-pin API (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/parent/reset-child-pin/route.ts` | ✅ Added guardian-linked child PIN reset route |
| Parent route compatibility aliases | `CODEX_MAIN` | `done` | `app/src/app/api/parent/{skills,report,notifications}/route.ts` | ✅ Added `studentId` alias support + batch notification PATCH |
| Parent weekly report contract (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/parent/report/route.ts` | ✅ Added worktree-compatible weekly report payload with `weekOffset` |
| Backend smoke expansion | `CODEX_MAIN` | `done` | `app/scripts/backend-smoke.mjs` | ✅ Verified new teacher + parent routes end-to-end |
| Logout route parity (main repo) | `CODEX_MAIN` | `done` | `app/src/app/api/{child,parent,teacher}/logout/route.ts` | ✅ Added logout routes matching worktree behavior |
| Teacher identity cookie parity | `CODEX_MAIN` | `done` | `app/src/app/api/teacher/access/route.ts` | ✅ Added `teacherId` response + `wonderquest-teacher-id` cookie |
| Scheduled monitoring / health smoke | `CODEX_MAIN` | `done` | `.github/workflows/health-check.yml` | ✅ Cron workflow added for `/api/health` |
| Scheduled production route/auth smoke | `CODEX_MAIN` | `done` | `.github/workflows/render-route-check.yml`, `tools/render_post_setup_check.sh` | ✅ Cron workflow added to catch ungated production teacher routes |
| Content QA CI gates | `CODEX_MAIN` | `done` | `.github/workflows/content-qa.yml`, `tools/content_qa_sample.mjs`, `app/scripts/content-bank-report.mjs` | ✅ CI now fails on prompt hygiene, duplicates, or missing explainer regressions |
| Content QA sweep | `CODEX_MAIN` | `done` | `tools/` + `communication/STATUS.md` | ✅ Report saved to `communication/content_qa_20260406.json` |
| Production AI config hardening | `CODEX_MAIN` | `done` | `render.yaml` + `app/src/lib/content-bank.ts` | ✅ Blueprint aligned and prompt boilerplate sanitized at load time |
| Seeded prompt cleanup at rest + DB verification | `CODEX_MAIN` | `done` | `tools/`, `app/scripts/sync-launch-content.mjs`, `app/scripts/seeded-prompt-hygiene-report.mjs`, `app/scripts/fix-seeded-prompt-hygiene.mjs`, `data/launch/sample_questions.json.gz` | ✅ Local bank and Supabase both verified at `issueCount: 0` |
| Parent report `weekOffset` service fix | `CODEX_MAIN` | `done` | `app/src/lib/parent-service.ts`, `app/src/app/api/parent/report/route.ts`, `app/scripts/backend-smoke.mjs`, `app/scripts/parent-report-weekoffset-smoke.mjs` | ✅ Service-layer week windows now shift with `weekOffset`; targeted smoke passed locally |
| Play session query-timeout fix | `CODEX_MAIN` | `done` | `app/src/lib/session-service.ts`, `supabase/migrations/20260407_000013_play_session_query_performance.sql` | ✅ Pushed to `main` as `545bd61`; retriggered Render with `6b8adfe`; production smoke now passes and QA rows were cleaned |
| Play cues / distractors / skill variety hotfix | `CODEX_MAIN` | `done` | `app/src/app/play/play-client.tsx`, `app/src/lib/content-bank.ts`, `app/src/lib/session-service.ts` | ✅ Pushed to `main` as `3c93524`; production smoke now shows unique K1/PREK skill sequences |
| Teacher route session hardening | `CODEX_MAIN` | `done` | `app/src/lib/teacher-session.ts`, `app/src/app/api/teacher/**`, `tools/render_post_setup_check.sh` | ✅ Deployed in prior pass |
| Owner auth hardening | `CODEX_MAIN` | `done` | `app/src/lib/owner-session.ts`, `app/src/app/api/owner/**`, `tools/render_post_setup_check.sh` | ✅ Deployed `8b318cc`; 17/17 live |
| Teacher Recent Wins page | `CODEX_MAIN` | `done` | `app/src/app/teacher/recent-wins/page.tsx` | ✅ Ported from sidecar, deployed |
| Smoke gate hardening | `CODEX_MAIN` | `done` | `app/scripts/live-smoke.mjs`, `app/scripts/backend-smoke.mjs`, `app/package.json` | ✅ `smoke:beta` live |
| Parent link-health UI | `OTHER_AGENT` | `in-progress` | `app/src/app/parent/` (new page only) | Build UI for `/api/parent/link-health`; surface broken links + recovery CTA |
| Route error boundaries | `OTHER_AGENT` | `ready` | `app/src/app/child/error.tsx`, `app/src/app/play/error.tsx`, `app/src/app/parent/error.tsx` | Add after link-health is done |
| Copy skill-trends API to worktree | `OTHER_AGENT` | `ready` | `app/src/app/api/teacher/skill-trends/route.ts` | Copy from main → worktree |
| Copy analytics-service.ts to worktree | `OTHER_AGENT` | `ready` | `app/src/lib/analytics-service.ts` | Copy from main → worktree |
| Teacher intervention-detail fix | `UI_AGENT` | `in-progress` | `app/src/app/teacher/intervention-detail/[id]/page.tsx` | Verify live data, check resolve button works |
| Owner analytics/users/schools stubs | `UI_AGENT` | `in-progress` | `app/src/app/owner/` pages | Check if routes exist, add nav items if missing |

## Claim Protocol
- Change Owner from `unclaimed` to your agent name before editing.
- If blocked, set Status to `blocked` and add a note in your agent file.
- When finished, set Status to `done` and update STATUS.md.
