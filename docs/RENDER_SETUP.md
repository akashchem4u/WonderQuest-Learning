# WonderQuest Render Setup

## Goal

This is the morning deployment checklist for the first WonderQuest prototype on Render.

The app is built as:

- `Next.js` web app in [app](../app)
- `Supabase` for persistent data
- `Render` for the initial hosted prototype

## Render Blueprint

The repo already includes [render.yaml](../render.yaml).

Render service shape:

- type: `web`
- runtime: `node`
- rootDir: `app`
- build command: `npm install && npm run build`
- start command: `npm run start`

## Environment Variables Required

### Public Client Variables

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server and DB Variables

- `SUPABASE_DB_HOST`
- `SUPABASE_DB_PORT`
- `SUPABASE_DB_NAME`
- `SUPABASE_DB_USER`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_DB_SSLMODE`

### Owner Access

- `OWNER_ACCESS_CODE`

## Render Dashboard Steps

1. Open Render and create a new `Blueprint` deployment from the GitHub repo.
2. Choose the WonderQuest repository.
3. Confirm Render detects [render.yaml](../render.yaml).
4. Fill the required environment variables.
5. Start the first deploy.

## Recommended Initial Values

- `NEXT_PUBLIC_APP_NAME=WonderQuest Learning`
- `SUPABASE_DB_PORT=5432`
- `SUPABASE_DB_NAME=postgres`
- `SUPABASE_DB_USER=postgres`
- `SUPABASE_DB_SSLMODE=require`

Everything else should come from the real Supabase project and your private owner code.

## Post-Deploy Checks

After the first deploy, verify:

1. `/` shows live launch-band counts
2. `/child` can create or reopen a profile
3. `/parent` can link to a child
4. `/play` starts a session from a real child profile
5. `/owner` shows the owner gate first
6. owner access code unlocks the dashboard

## Important Notes

- The deployed app uses server-side Postgres access for live counts and owner data, so DB env vars are required on Render.
- The owner route is now gated with `OWNER_ACCESS_CODE`; do not leave that blank in production.
- The first launch questions and explainers were already synced to Supabase locally. If you later refresh them, run:

```bash
npm run db:sync-launch
```

from [app](../app).
