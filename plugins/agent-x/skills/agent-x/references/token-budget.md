# Token budget — lean by default

Owner of: budget profiles, which steps run without a model, report size, dispatch batching.
Set per project (`Budget: lean | balanced | thorough` in project.md, default **lean**), overridable at intake.
Migrations and XL work use at least **balanced**; the user can pick thorough.

## 1. No model for mechanical steps (the orchestrator runs `setup/ax.mjs` directly, no dispatch)
| Step | Command |
|---|---|
| commit a ticket (enforces locked_paths, no base branch, no secrets, hooks run) | `node <AGENTX_HOME>/setup/ax.mjs commit <runDir> "<msg>" <paths…>` |
| start/stop/check the dev server and compose services | `ax env up|down|status <runDir>` (falls back to the `environment` agent only for simulators or unusual setups) |
| rebuild board.md from tickets | `ax board <runDir>` |
| complexity score → band | `ax size points=5 acs=6 packages=2 contract=1 risk=1 …` |
| mapping coverage (migrations) | `ax mapping <runDir>` |
| record cost per dispatch from the usage feed | `ax cost <runDir> <agent> <model> <effort> <band>` |
| run-state, LOG.md, lessons.md lines, follow-ups | orchestrator writes them directly (doc-writer only for CONTEXT/ADR drafting in thorough) |
Git beyond commit (branch, push, PR, CI, review, merge, revert) stays with `git-manager`.

## 2. Dispatch plan per ticket
| Band | lean | balanced | thorough |
|---|---|---|---|
| S | implementer (writes tests from the ACs, TDD) → **verifier pass**: one qa-tester dispatch that runs tests, drives the change and does a spec+standards review (sonnet) | same + code-reviewer separate if the ticket touches a contract | full per-ticket loop |
| M | qa test-plans batched for all M tickets in ONE dispatch after the PLAN GATE → implementer → code-reviewer ∥ qa execute (sonnet) | + visual-verifier for UI with design | full |
| L | full per-ticket loop (test-plan, implement, review, execute, domain checks) | full | full + second opinions |
Bugs always go through root-cause-analyst, but a trivial, fully explained failure (the error names file and cause)
goes straight to implementer with a one-line cause, in lean and balanced.

Bug track, lean: intake → root-cause-analyst → implementer → verifier → commit (≈3 dispatches for an S bug).

## 3. Phase A and discovery
- lean: discovery and source-analyzer merged into one dispatch for S/M; blueprint only if UI or contracts; 1
  discovery round for M (2 for L, 3 for XL/migrations); spec-review folded into the planner's self-audit for S/M.
- Final checks: security-auditor only when the diff touches auth/input/secrets/data or the run is backend; a11y only
  for UI; integration-tester only for contracts, multiple packages or migrations; regression = the test suite
  command run by the orchestrator, with a qa dispatch only if it fails.

## 4. Keep every dispatch small
- Pass paths and line ranges, never file bodies; pass the run-state slice, never the whole file.
- Every agent report ≤ 300 words: verdict, findings with file:line, and paths to anything longer (written to
  `runs/<id>/reports/<agent>-<n>.md`). The orchestrator reads the long file only when a gate needs it.
- Test and build output is filtered to failures by the `filter-output` hook (§5); agents never paste full logs.
- Reuse: never re-dispatch a node on unchanged inputs; a second review of the same diff needs a reason.
- Large inputs (logs, legacy files, long docs) go to a large-context or local external model for a summary first
  (llm-broker), when the registry has one allowed.

## 5. Output filter hook
`hooks/filter-output.sh` (PreToolUse on Bash): rewrites common test/build/lint commands so only failures and the
summary reach the model (last 60 lines of failures). Opt out per repo with `Filter: off` in project.md.

## 6. Expected dispatches (for the PLAN GATE estimate)
lean: quick ≈ 3 · M feature (4 tickets) ≈ 14–18 · L (8 tickets) ≈ 35–50. balanced ≈ 1.3× lean. thorough ≈ 2× lean.
