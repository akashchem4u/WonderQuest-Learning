# WonderQuest Parallel Agent

This folder is for the fast external support agent.

Use this lane for:

- bounded UX/UI route work
- component-level design work
- support screens
- recovery and empty states
- route-adjacent product surfaces

Do **not** use this folder for the frozen UI reference library. That remains in:

- `/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/ui-agent`

## Polling Rule

The support agent should poll only:

- `CURRENT_INSTRUCTIONS.md`

When a batch is done, it should append a short completion note to:

- `STATUS.md`

## Backlog Rule

If the current batch is complete, move to:

- `TASK_BACKLOG.md`

and continue from the next unchecked item.

## Output Rule

- Keep new deliverables in this folder.
- Prefer one file per route or state.
- Prefer implementation-adjacent deliverables over abstract design exploration.
