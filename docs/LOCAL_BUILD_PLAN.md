# WonderQuest Learning Local Build Plan

## Goal For This Local Build Window

Create a usable local prototype foundation so deployment can be handled separately in the morning.

This local build window should produce:

- a web app scaffold
- a Supabase-ready schema and seed layer
- structured launch data files
- a spreadsheet workbook for flows, paths, and Q&A capture
- a clearer file structure for the ongoing build

## Delivery Scope

### 1. App Foundation

- Next.js App Router scaffold
- React 19-based structure
- TypeScript configuration
- launch dashboard page that reflects the current product scope
- environment template for Supabase wiring

### 2. Data Foundation

- launch bands
- theme mapping
- onboarding flow model
- sample question bank
- sample explainer references

### 3. Database Foundation

- lightweight child and parent identity model
- progression persistence
- session logging
- content tables
- feedback intake model

### 4. Planning Foundation

- workbook for onboarding flows
- workbook tabs for child, parent, and teacher paths
- question bank capture sheet
- explainer sheet
- notification and backlog refinement sheets

## Tonight's Work Sequence

1. Set up the new project folders and root structure.
2. Scaffold the local web app.
3. Create Supabase migration and seed SQL.
4. Add launch JSON data for bands, onboarding, and sample content.
5. Generate the WonderQuest planning workbook.
6. Verify the outputs and leave the project in a clean state for the morning.

## Morning Follow-On

- install dependencies if needed
- wire local `.env`
- stand up Supabase project config
- connect the app to Supabase
- set up Render deployment config
- run the prototype locally end to end
