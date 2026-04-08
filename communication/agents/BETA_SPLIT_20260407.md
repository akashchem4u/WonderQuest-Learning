# WonderQuest Beta Split

Updated: `2026-04-08T03:28:00Z`
Live Render baseline: `8b318cc`

## Deployment Ownership

- `CODEX_MAIN` owns deploy.
- Reason:
  - deploy needs integrated owner-auth hardening
  - deploy also needs smoke-gate changes and live verification
  - sidecar work should stay isolated to bounded UI tasks

## Main Agent Scope

### Completed on live Render
- Commit `8b318cc` is live.
- Owner auth hardening is deployed.
- Smoke gate updates are deployed.
- `Teacher Recent Wins` is deployed.
- Live verification:
  - `./tools/render_post_setup_check.sh https://wonderquest-learning.onrender.com` -> `17/17` pass
  - `/api/owner/overview` unauthenticated -> `401`
  - `/api/owner/feedback` unauthenticated -> `401`

### Remaining main-agent thread
- Local DB connectivity still times out during connect.
- Local smoke now fails early on `/api/health` with a DB timeout instead of later on `/api/child/access`.
- Production `/api/health` is green, so this currently looks local-env or local-network specific rather than a production app outage.
- Added local staged diagnostic:
  - `npm run db:diagnose`
- Current local result:
  - DNS resolution succeeds
  - TCP connect succeeds
  - first Postgres SSL request times out
  - `pg.connect()` times out
- Current inference:
  - local network, firewall, or device policy is likely blackholing Postgres protocol traffic after TCP connect

## Other Agent Scope

### Completed
- Teacher Recent Wins page is implemented and validated.
- File:
  - [app/src/app/teacher/recent-wins/page.tsx](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/app/teacher/recent-wins/page.tsx)
- Validation reported by sidecar:
  - `npm run lint`
  - `npm run build`
- Parent link-health UI is implemented and validated.
- Files:
  - [app/src/app/parent/page.tsx](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/app/parent/page.tsx)
  - [app/src/app/parent/link-health/page.tsx](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/app/src/app/parent/link-health/page.tsx)
- Mainline verification:
  - `npm run lint`
  - `npm run build`
- Status:
  - ready for CODEX_MAIN commit and deploy in the next batch

### Next assignment — Route error boundaries
- Add `error.tsx` for:
  - `app/src/app/child/error.tsx`
  - `app/src/app/play/error.tsx`
  - `app/src/app/parent/error.tsx`
- Each should be a graceful "something went wrong" screen with a retry button and a link back to the relevant home route
- Isolated UI only — no API, no service layer, no deploy

## Current Production Risks

- Owner auth production blocker is closed.
- Current remaining risk is local-only DB connectivity investigation for developer verification flows.
- Parent link-health page is built and verified locally; it is not deployed yet.

## Merge and Deploy Sequence

1. ✅ `CODEX_MAIN` committed `07c2f10` — parent link-health UI + nav link + route error boundaries
2. 🔜 **Other agent deploys** — push `07c2f10` to origin and verify live on Render
3. Other agent runs `./tools/render_post_setup_check.sh https://wonderquest-learning.onrender.com` after deploy
4. Other agent writes deploy result back to this file

## Deploy Handoff — Other Agent Action

Commit `07c2f10` is ready on local `main`. Your steps:

```
git push origin main
```

After Render build completes (~2 min):

```
./tools/render_post_setup_check.sh https://wonderquest-learning.onrender.com
```

Expected: 17/17 pass. Write result here when done.

## Do Not Reassign

- Other agent builds isolated UI slices + owns this deploy batch.
- CODEX_MAIN handles integration-level deploys requiring smoke gate changes.
