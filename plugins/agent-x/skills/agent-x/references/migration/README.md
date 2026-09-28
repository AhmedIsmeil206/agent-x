# Migration track (the original migrate-feature pipeline, preserved)

When the user answers **yes** to "Is this a migration?", agent-x runs `track.md` — the original migrate-feature
pipeline generalized to any stack (web, mobile, backend). The complete original lives in `examples/forasna/`
(`migrate-feature-original.md`, `intake-workflow.md`, `migration-plan.md`, `run-state.schema.json`, `cases/`,
`rules/`) and is followed verbatim when `project.md` sets `Migration.preset: forasna`. Nothing is relaxed: full graph always, no escape hatch, a declared case never reduces extraction,
design capture mandatory, four axes each ≥98% (UI/UX, code logic, code structure, functionality), shared modules
migrated once, the old ↔ new mapping (`mapping.md`), route-integrity, cutover testing → production, three human stops (N2 clarify, PLAN GATE, N13).

## Adapter — how the original maps onto agent-x v1.3

| Original | Now |
|---|---|
| react-synthesizer | implementer |
| legacy-decompiler | source-analyzer (+ migration-lead for case detection and inventory audit) |
| pattern-mapper | blueprint |
| devops-env-swapper | deploy-cutover |
| discovery, design-fetcher, planner, visual-verifier, qa-tester, code-reviewer, security-auditor, a11y-auditor, integration-tester, doc-writer | same names |
| `../forasna` | `Migration.legacy_path` in `.agent-x/project.md` (read-only), any stack |
| cases 1–6 (PHP/jQuery) | patterns P1–P9 in `track.md` (P1–P6 = cases 5,2,3,4,6,1) |
| `docs/migrations/<id>/` | kept as-is for migration runs (the original schema lives there) |
| `.claude/rules/*` | `examples/forasna/rules/*` for the forasna preset; other projects use their own rules — apply the ones `project.md` lists under Migration.rules; the repo's own rules still win |
| "engine never runs git" | superseded: git-manager does git at the gates in `../git-workflow.md`, always with the human's base branch, reviewers and merge approval |
| bug/blocking handling | superseded: every blocking finding goes through root-cause-analyst first (`../root-cause.md`) |

Everything added after v1.0 still applies on top: requirements-reader for the Jira card/spec, the Figma question
(design_source is mandatory for migrations), graphify scoped to the legacy path, `ax env` up/down, checkpoints,
locked_paths across runs, follow-ups, after-PR loop, rollback.

## Presets
- `forasna`: follow `examples/forasna/` verbatim (Smarty .tpl, jQuery, Symfony, Helm values cutover, TanStack Start).
- none (default): `track.md` + the project's own rules. migration-lead maps the legacy stack's signals to P1–P9 and
  records the mapping in run-state `decisions`. To add a preset for another legacy stack, copy the forasna folder
  structure under `examples/<name>/`.
