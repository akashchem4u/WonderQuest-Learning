# WonderQuest Learning

This project started as a simple soccer learning prototype and is now being reframed as a broader AI-guided learning product for:

- ages 2 to 5
- Kindergarten to Grade 5
- child, parent, and teacher / school experiences

## Project Structure

- [app](./app): local web prototype scaffold for the new WonderQuest build
- [docs](./docs): active strategy, execution, and backlog documents for WonderQuest Learning
- [supabase](./supabase): local database schema and seed assets for the Supabase-backed prototype
- [data](./data): structured launch data for flows, themes, and question content
- [planning](./planning): generated spreadsheet assets for flows, paths, and content capture
- [tools](./tools): local generators and helper scripts
- [ui-agent](./ui-agent): shared design-reference workspace and the single-file coordination loop for the external UI agent
- [prototype/legacy-concept](./prototype/legacy-concept): original static soccer prototype kept only as a legacy concept reference

## Planning Docs

- [docs/PRODUCT_STRATEGY.md](./docs/PRODUCT_STRATEGY.md): product vision, audience model, AI direction, safety guardrails, data model, and long-term product shape
- [docs/EXECUTION_STRATEGY.md](./docs/EXECUTION_STRATEGY.md): delivery strategy, technology recommendation, phased roadmap, risks, success metrics, and immediate next steps
- [docs/PRODUCT_BACKLOG.md](./docs/PRODUCT_BACKLOG.md): prioritized backlog for MVP, adaptive features, teacher / school capabilities, platform work, and recommended enhancements
- [docs/QUESTION_FACTORY_STRATEGY.md](./docs/QUESTION_FACTORY_STRATEGY.md): scalable 1M+ question, explainer, image, and grading architecture
- [docs/RENDER_SETUP.md](./docs/RENDER_SETUP.md): deployment checklist and environment wiring for Render
- [docs/TEST_READY_ALPHA_PLAN.md](./docs/TEST_READY_ALPHA_PLAN.md): explicit go / no-go gates, scenario coverage, and the milestone definition for serious owner-led testing
- [docs/UI_ADOPTION_STRATEGY.md](./docs/UI_ADOPTION_STRATEGY.md): how WonderQuest absorbs multiple design versions without rewriting the full UI each time

## Legacy Prototype

- [prototype/legacy-concept/index.html](./prototype/legacy-concept/index.html): original static prototype entry point
- [prototype/legacy-concept/script.js](./prototype/legacy-concept/script.js): original prototype logic
- [prototype/legacy-concept/styles.css](./prototype/legacy-concept/styles.css): original prototype styling

## Current Recommendation

Do not keep extending the static prototype directly.

The better path is:

1. treat the current prototype as a concept reference
2. define the content and learner-data model
3. move to a web-first product architecture
4. build the first MVP around one adaptive core with a few theme families
