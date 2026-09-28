# Routing table (token economy)

Every row's model is the default; `model-policy.md` decides the actual tier per work unit (C0/C1/C2) and whether an
external model from the registry takes C0 bulk work or a second opinion via `llm-broker`.

Default: the orchestrator routes with this table directly. Dispatch `task-router` (haiku) only when a work
unit does not clearly match a row. Before any dispatch, check whether the answer is already in hand.

| Work | Agent | Model | Pass only |
|---|---|---|---|
| "where is X / who uses X" | graphify query, else Explore | — / haiku | the question |
| repo reconnaissance for a task | discovery | haiku | task, profile, project.md |
| read a Jira card, spec file or doc link | requirements-reader | sonnet | the key / path / URL |
| extract behavior from legacy/existing code | source-analyzer | sonnet | source path scope |
| migration scope, cases, inventory audit, shared modules, cutover | migration-lead | opus | legacy path, run-state slice |
| capture a design | design-fetcher | sonnet | design_source, breakpoints |
| map onto repo primitives | blueprint | sonnet | inventory, discovery report |
| PM/business discovery rounds | product-analyst | opus | intake, reader + discovery reports, answers so far |
| spec-review / test-plan / execute / verify / regression | qa-tester | opus (sonnet for test-plan of S tickets and verify) | ticket, TCs, dev_url |
| summarize big logs/docs, second opinions, research | llm-broker → external model | haiku + external | the files, the model name |
| phased plan + tickets | planner | opus | inventory, blueprint, lessons |
| write/modify source | implementer | opus (sonnet for mechanical edits: renames, config, copy changes) | phase entry, locked_paths |
| diagnose a failure | root-cause-analyst | opus | failure + file:line |
| review | code-reviewer | opus (sonnet for ≤50-line diffs) | diff file list, profile |
| tests + drive | qa-tester | opus (sonnet for adding tests to an existing pattern) | inventory ids, dev_url |
| UI fidelity | visual-verifier | opus | design facts, dev_url |
| security | security-auditor | opus | changed files |
| accessibility | a11y-auditor | sonnet | changed UI files, dev_url |
| contract/regression/links | integration-tester | sonnet | contracts, suite command |
| cutover edit | deploy-cutover | sonnet | cutover section |
| ticket commit, env up/down, board, sizing, mapping coverage, cost marks | none — `ax.mjs` | — | args only |
| branch/push/PR/merge/sync-base/ci-status/fetch-review/reply/revert | git-manager | sonnet | exact values from the human |
| CI failure or review change request | root-cause-analyst → implementer | opus | log tail or comment + file:line |
| simulators, unusual env setups (else `ax env`) | environment | haiku | project.md Environment section |
| docs, lessons, follow-ups | doc-writer | haiku | run-state summary |

Rules: parallelize read-only nodes that don't depend on each other; never send the same file set to two
agents to "double check"; a node that would repeat a prior node's reading is skipped and given that
node's report instead; count every dispatch against the run budget.
