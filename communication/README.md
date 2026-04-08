# Agent Communication Folder

Use this folder as the lightweight coordination channel between active agents.

This does **not** replace [EXECUTION_BOARD.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/EXECUTION_BOARD.md).

- `EXECUTION_BOARD.md` = release board / milestone source of truth
- `communication/` = fast-moving agent coordination, ownership, handoffs, and blockers

## Working Rules

1. Before starting a new task, claim it in [WORK_QUEUE.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/WORK_QUEUE.md).
2. Keep your live status in your agent file under [agents](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/agents).
3. Record shared state and blockers in [STATUS.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/STATUS.md).
4. Do not take over a claimed file area without writing a note first.
5. Use exact dates like `2026-04-06`, not vague words like `today` or `later`.

## File Map

- [STATUS.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/STATUS.md)
  Shared repo state, current beta posture, deployment facts, and blockers.
- [WORK_QUEUE.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/WORK_QUEUE.md)
  Current workstreams, owners, and next actions.
- [HANDOFF_TEMPLATE.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/HANDOFF_TEMPLATE.md)
  Copy this format when handing work to another agent.
- [agents/CODEX_MAIN.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/agents/CODEX_MAIN.md)
  Current status for this lane.
- [agents/OTHER_AGENT.md](/Users/amummaneni/Desktop/Codex/Projects/wonderquest-learning/communication/agents/OTHER_AGENT.md)
  Open slot for the other agent to claim and update.
