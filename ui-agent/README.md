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
- `home-route-canonical-v2.html`
- `child-launcher-canonical-v2.html`
- `play-route-canonical-v2.html`
- `parent-route-canonical-v2.html`
- `teacher-route-canonical-v2.html`
- `owner-route-canonical-v2.html`

## Active Supplemental Files

These are current route slices that still matter for implementation even when a
canonical route file exists:

- `child-home-hub-canonical-v2.html`
- `child-achievement-hub-v2.html`
- `play-prereader-session-canonical-v2.html`
- `play-k1-session-canonical-v2.html`
- `play-session-shell-tablet-v2.html`
- `parent-family-summary-v2.html`
- `parent-weekly-report-v2.html`
- `parent-linking-recovery-v2.html`
- `parent-family-settings-desktop-v2.html`
- `teacher-command-center-v2.html`
- `teacher-student-detail-desktop-v2.html`
- `teacher-student-detail-mobile-v2.html`
- `teacher-assignment-creator-v2.html`
- `teacher-assignment-creator-mobile-v2.html`
- `owner-command-center-v2.html`
- `owner-release-readiness-detail-v2.html`
- `question-factory-workbench-v2.html`

## Archived Files

Superseded v1 files move into [`archive/legacy-v1`](./archive/legacy-v1).
They stay available for reference but should not be updated or used as the
primary implementation source when a `v2` file exists.

Superseded early exploration files move into
[`archive/superseded-early`](./archive/superseded-early). They stay available
for historical reference but should not be treated as current route targets.

Archived today:

- `parent-hub.html`
- `teacher-analytics.html`
- `owner-console.html`
- `child-prereader-quickstart.html`
- `child-quickstart-v2.html`
- `child-rewards-return.html`
- `home-launcher-refined.html`
- `landing-page.html`
- `mobile-route-shells.html`
- `parent-access-manager.html`
- `parent-family-center.html`
- `parent-summary-rail.html`

## Ignore Noise

- `.claude/` is preview-tooling noise, not part of the WonderQuest handoff.
- Keep new design deliverables at the top level of `ui-agent/` unless
  engineering asks for a new archive split.
