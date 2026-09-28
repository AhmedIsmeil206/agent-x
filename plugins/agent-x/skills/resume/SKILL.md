---
name: resume
description: >-
  Continue a stopped agent-x run from its run-state (after a cap, a gate, a crash or a new session).
  Trigger on "/agent-x:resume", "continue the run", "pick up where we left off".
---

# agent-x:resume

1. List `.agent-x/runs/*/run-state.json` whose `phase` is not `Done|Reverted|Descoped`; if several, ask which.
2. Upgrade first: run `node <AGENTX_HOME>/setup/migrate-run-state.mjs <run-state.json>` (AGENTX_HOME = the agent-x skill folder);
   it backs up the file and adds fields newer versions need. Then read run-state and intake.md. Report: mode, phase, last node, next node, counters, budget used/left,
   open questions, blocking findings.
3. Drift check (migrations: re-hash legacy files in MAPPING.md and mark changed rows `drifted`): if files in `locked_paths` or the source path changed since `updated_at`, list them and
   re-run the node whose inputs drifted. Design captures are not persisted — re-run design-fetcher if a
   UI node needs them.
4. Dispatch `environment status`/`up` if the next node needs a running app.
5. If stopped at a gate, re-present that gate. Otherwise continue the graph from `next` under the
   `agent-x` skill rules. Never reset counters on resume.
