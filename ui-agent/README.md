# WonderQuest UI Agent Workspace

This folder is the shared handoff space between local engineering and the
external UI/design agent.

## Coordination Rule

- Poll and append updates to [`ENGINEERING_REQUESTS.md`](./ENGINEERING_REQUESTS.md) only.
- Treat that file as the single status and instruction source.

## Canonical Top-Level Files

These are the active design references engineering should port from first:

- `design-system.css`
- `component-library.html`
- `index.html`
- `child-setup.html`
- `play-early-learner.html`
- `play-arena.html`
- `parent-access.html`
- `parent-hub-v2.html`
- `parent-settings.html`
- `teacher-gate.html`
- `teacher-analytics-v2.html`
- `owner-gate.html`
- `owner-console-v2.html`
- `landing-page.html`

## Archived Files

Superseded v1 files move into [`archive/legacy-v1`](./archive/legacy-v1).
They stay available for reference but should not be updated or used as the
primary implementation source when a `v2` file exists.

Archived today:

- `parent-hub.html`
- `teacher-analytics.html`
- `owner-console.html`

## Ignore Noise

- `.claude/` is preview-tooling noise, not part of the WonderQuest handoff.
- Keep new design deliverables at the top level of `ui-agent/` unless
  engineering asks for a new archive split.
