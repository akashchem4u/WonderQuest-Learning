# WonderQuest Parallel Agent Instructions

Use this file as the active instruction source for the fast support agent.

## Current Rules

- Do not touch `/ui-agent`; that folder is now the frozen UI reference library.
- Put all new deliverables in `/parallel-agent`.
- Favor route-level or component-level deliverables.
- Do not auto-invent new audiences or product areas.
- Keep everything child-safe and family-safe.
- Avoid multiplayer, peer chat, public leaderboards, or social mechanics.
- Work continuously in batches of `6` files at a time.
- After each batch of `6`, append to `STATUS.md` and continue immediately into the
  next unchecked items in `TASK_BACKLOG.md`.
- Do not wait for another prompt unless engineering explicitly pauses the queue.

## Current Batch

Start with these files:

1. `owner-release-gate-desktop-v3.html`
2. `owner-feedback-workbench-desktop-v3.html`
3. `owner-route-health-compact-v3.html`
4. `parent-family-dashboard-desktop-v3.html`
5. `play-session-complete-desktop-v3.html`
6. `child-returning-player-hub-v2.html`

## After This Batch

When these six are complete, continue directly into `TASK_BACKLOG.md` from the
next unchecked task. Do not wait for another prompt.

## Completion Protocol

When a file or batch is complete:

- append a short status note to `STATUS.md`
- list:
  - files created
  - what states were covered
  - anything engineering should notice
- then continue with the next unchecked task unless engineering pauses the queue
