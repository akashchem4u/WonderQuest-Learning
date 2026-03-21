# WonderQuest Codex Cloud Handoff

## Goal

Use Codex cloud tasks for parallel execution while keeping this repository as
the source of truth.

## Repository

- GitHub: `https://github.com/akashchem4u/WonderQuest-Learning`
- Branch: `main`
- App root: [app](../app)

## Current Runtime Stack

- `Next.js` web app
- `Supabase` for persistence
- `Render` for deployment

## Environment Variables Needed

Public:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server:

- `SUPABASE_DB_HOST`
- `SUPABASE_DB_PORT`
- `SUPABASE_DB_NAME`
- `SUPABASE_DB_USER`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_DB_SSLMODE`
- `OWNER_ACCESS_CODE`
- `TEACHER_ACCESS_CODE`

## Supabase Connection Note

Use the `Session pooler` values on hosted environments.

Expected shape:

- `SUPABASE_DB_HOST=aws-1-us-east-2.pooler.supabase.com`
- `SUPABASE_DB_USER=postgres.cbgevfhusngqqsojifyd`
- `SUPABASE_DB_PORT=5432`
- `SUPABASE_DB_NAME=postgres`
- `SUPABASE_DB_SSLMODE=require`

## Recommended Cloud Task Split

1. UI and mobile polish
   - tighten child and parent onboarding flows
   - improve teacher and owner dashboard density
   - continue responsive refinement

2. Auth and abuse protection
   - child session binding
   - PIN retry throttling
   - access-code throttling

3. Data and adaptive engine
   - question-factory schema expansion
   - larger content seed pipeline
   - adaptation decision logging

4. Feedback and ops
   - provenance improvements on feedback
   - better owner triage queue
   - health and logging improvements

5. QA and device coverage
   - mobile viewport checks
   - regression smoke checks
   - session edge-case coverage

## Local Verification Commands

From [app](../app):

```bash
npm run build
npm run smoke:local
```

## Render Note

The Blueprint config lives in [render.yaml](../render.yaml), and the deployment
runbook lives in [RENDER_SETUP.md](./RENDER_SETUP.md).
