# WonderQuest Prototype Wiring

This doc explains how the local WonderQuest build fits together for the morning setup.

## What Goes Where

### `app/`

The `app/` folder is the local web prototype scaffold.

It should be treated as the working front end for the first build:

- `app/src/app` contains the Next.js pages and layout
- `app/src/components` holds reusable UI pieces
- `app/src/lib` holds launch-band and product wiring data
- `app/.env.example` shows the variables needed to connect Supabase later

### `supabase/`

The `supabase/` folder is the database foundation.

It has two parts:

- `supabase/migrations` defines the schema
- `supabase/seed` loads the first launch data into the tables

This is where the child, parent, progress, session, and feedback models live.

### `data/launch/`

The `data/launch/` folder is the structured launch content source.

Use it for:

- launch bands
- onboarding flows
- challenge paths
- explainers
- sample questions
- notification scenarios

This is the easiest place to keep the first content system readable before it becomes more dynamic.

### `render.yaml`

The Render blueprint is the future deployment wiring.

It should be kept in the repo now so deployment setup later is straightforward, but it does not block local development.

## How The Pieces Fit

1. `data/launch/` defines what the first experience should look like.
2. `supabase/migrations` defines where structured learner and content data lives.
3. `supabase/seed` loads the initial bands, themes, and subjects.
4. `app/` reads the launch structure and becomes the local prototype.
5. `render.yaml` is ready when deployment is turned on later.

## Morning Setup Order

1. Create the Supabase project.
2. Apply the migration in `supabase/migrations`.
3. Load the seed data in `supabase/seed`.
4. Copy credentials into `app/.env.local`.
5. Run the app locally from `app/`.
6. Validate that the first launch bands, content, and progress model render correctly.

## Operating Rule

Do not wait on deployment setup to keep building the product.

The local build should keep moving with structured data, stable docs, and the Supabase-ready schema even if credentials arrive later.
