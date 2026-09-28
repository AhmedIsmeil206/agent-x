# Token budget — lean by default

Owner of: budget profiles, which steps run without a model, report size, dispatch batching.
Set per project (`Budget: lean | balanced | thorough` in project.md, default **lean**), overridable at intake.
**lean** = solo + batching (§2a); **balanced** = the previous lean plan (§2); **thorough** = full loops.
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

## 2a. lean: solo mode and batching
- **Solo for S tickets and S bugs**: the orchestrator itself is the implementer for that ticket (it is still the
  only writer; no implementer dispatch). It follows implementer.md's rules exactly: project-first, design system,
  test-first at the agreed seam, no git beyond `ax commit`. Then it runs the project's test/lint/typecheck commands
  directly (filtered by the output hook) and dispatches **one** independent reviewer:
  `qa-tester` action `verifier` on **haiku** for pure-logic tickets with green tests and no UI/contract/security
  surface, else on sonnet. The reviewer never sees the orchestrator's reasoning, only the diff, ACs and tests.
- Solo is never used for: M/L/XL tickets, C2 work (auth, payments, PII, data migration, security fixes),
  migrations, UI with a design fidelity target, or a bug whose root cause isn't explained in one line (those go
  through root-cause-analyst first; the fix may then be solo if the ticket is S).
- **Batching**: S tickets in the same area (same package and folder, no blocking edges between them) are built in
  one pass (solo, or one implementer dispatch if they're C1 M) and verified in one verifier dispatch; each keeps
  its own ticket, TCs and `ax commit`.
- **Planner hand-off**: the planner writes `runs/<id>/CONTEXT-PACK.md` (≤600 words: relevant files with line
  ranges, patterns to copy, decisions, commands). Every later dispatch gets that file instead of re-discovering.
- Expected lean dispatches: quick fix ≈ 1–2 · S bug ≈ 2 (root cause + verifier; 1 if trivially explained) ·
  M feature (4 tickets) ≈ 9–12.

## 2b. Migration budget (default for migrations; `thorough` still available)
1. **One extraction dispatch**: migration-lead action `extract` does scope + patterns + inventory + inventory-audit +
   seeded MAPPING.md in one pass (it has the same read scope as source-analyzer); source-analyzer runs separately
   only for legacy scopes > 40 files.
2. **graphify first**: build or update an index over `legacy_source.path` once; every later legacy question is a
   graph query plus ranged reads.
3. **Design capture once**: design-fetcher captures the source once per breakpoint; later phases reuse the
   capture file, never re-render the source.
4. **Scripted fidelity**: the orchestrator runs `node <AGENTX_HOME>/setup/style-diff.mjs <sourceUrl> <buildUrl>
   <selectors> [widths]` (Playwright); visual-verifier gets only the score and mismatches to judge and to check
   states the script can't reach (hover, open menus). No Playwright → visual-verifier renders as before.
5. **Discovery**: behavior comes from the legacy code, so product-analyst runs one round, only about intentional
   changes (redesign, dropped or new behavior). Faithful ports with no changes skip it.
6. **Tickets by page section** (shell, header, filters, list, detail…), S/M sections batched; per ticket:
   implementer → code-reviewer ∥ qa execute on sonnet (verifier pass for S sections) → style-diff; mapping evidence
   filled by the same dispatches.
7. **Final checks once**: security ∥ a11y ∥ integration (with parity checks per mapping row) at the end, not per ticket.
Expected: one page ≈ 16–24 dispatches, 0.6M–1.4M tokens (was 30–45, 1.3M–3M). Shared shell (P1) runs once per app
and is then reused, so later pages are cheaper still.

## 2. balanced: dispatch plan per ticket
| Band | balanced (default until 2.2 called "lean") | balanced + | thorough |
|---|---|---|---|
| S | implementer (writes tests from the ACs, TDD) → **verifier pass**: one qa-tester dispatch that runs tests, drives the change and does a spec+standards review (sonnet) | same + code-reviewer separate if the ticket touches a contract | full per-ticket loop |
| M | qa test-plans batched for all M tickets in ONE dispatch after the PLAN GATE → implementer → code-reviewer ∥ qa execute (sonnet) | + visual-verifier for UI with design | full |
| L | full per-ticket loop (test-plan, implement, review, execute, domain checks) | full | full + second opinions |
Bugs always go through root-cause-analyst, but a trivial, fully explained failure (the error names file and cause)
goes straight to implementer with a one-line cause, in lean and balanced.

Bug track: lean → root-cause-analyst (skipped when the cause is explained in one line) → solo fix → haiku/sonnet
verifier → commit (≈1–2 dispatches); balanced → root-cause-analyst → implementer → verifier (≈3).

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
migration (per page, 2b) ≈ 16–24 · lean: quick ≈ 1–2 · S bug ≈ 2 · M feature (4 tickets) ≈ 9–12 · L (8 tickets) ≈ 30–45 (L tickets never go solo).
balanced: quick ≈ 3 · M ≈ 14–18 · L ≈ 35–50. thorough ≈ 2× balanced. Migrations use the migration budget (2b) unless the user picks thorough.
