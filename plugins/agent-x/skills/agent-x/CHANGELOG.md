# Changelog

## 1.0.0 — 2026-09-28
- Generalized from the Forasna `.claude` migrate-feature system to any stack.
- Three modes (quick/standard/full) with one-way escalation.
- New commands: init, spec, review, audit, resume.
- 14 stack-agnostic agents; profiles for web-react, mobile-react-native, backend-node, backend-python, generic.
- Axes: functionality, logic, structure, ui-fidelity, contract, security (applicability per domain).
- lessons.md learning loop, run budget, monorepo per-package profiles.
- Non-blocking per-file lint hook (no full typecheck on every edit).
- Six migration cases merged into references/migration-patterns.md.

## 1.1.0 — 2026-09-28
- Root-cause policy + root-cause-analyst: every blocking finding/bug is diagnosed first and fixed as a class with a regression test.
- task-router + routing table for cheapest-fit agent/model dispatch.
- graphify integration (init setup, incremental update at run start, query-first search).
- requirements-reader: Jira card → intake. git-manager: branch after plan gate, commit per phase, PR with human-chosen base and reviewers, merge only after approval.

## 1.2.0 — 2026-09-28
- Input can be a Jira card or a spec (file, doc URL, pasted); jira-reader → requirements-reader.
- Figma question always asked at intake; design capture feeds every UI phase.
- After-PR loop: CI failures and review comments go through root-cause → fix → push → reply → re-review (3 rounds each).
- sync-base before PR and each push; conflicts stop for the human.
- Cost report per agent/model; dry-run mode that stops at the PLAN GATE.
- Read-only agents now disallow Edit/Write; ~ paths resolved to absolute before reads.

## 1.3.0 — 2026-09-28
- environment agent: starts/stops dev server, simulator, services from project.md and waits for health.
- Context checkpoints after each gate/round with a fresh-session resume prompt for long runs.
- Follow-ups: approved out-of-scope items become linked Jira issues or .agent-x/follow-ups.md.
- Cross-run locked_paths check before every implementer dispatch.
- /agent-x:rollback: revert PR + cutover removal together, phase Reverted, root cause to lessons.
- Project-first rule: implementer follows project.md, CLAUDE.md/AGENTS.md, lint config and nearest siblings over profile defaults; reviewer blocks violations.
- New eval scenarios for Jira→merge, spec+Figma dry run, project rules, conflicts and rollback.

## 1.4.0 — 2026-09-28
- Device setup: install.sh copies skills/agents, then setup/deps.sh checks and (with per-item consent or --yes)
  installs git, node, Claude Code CLI, gh + login, uv, graphify, and the chrome-devtools / Atlassian / Figma MCPs;
  optional hook registration. First /agent-x run on a device offers the same check.
- Migration: always asked first; a yes runs the migration track (original migrate-feature rigor) for any stack and
  language, with migration-lead. The Forasna original is kept verbatim as the `forasna` preset.
- Any language: profiles/languages.md toolchain map; generic profile covers every language; lint hook formats
  Go, Rust, Kotlin, Swift, Dart, Ruby, PHP, Elixir, C#, C/C++, Scala besides JS/TS and Python.

## 2.3.0 — 2026-09-28
- Migration budget: single extraction dispatch, legacy-scoped graphify, capture once, scripted style diffs
  (setup/style-diff.mjs, Playwright), one change-only discovery round, section tickets, final checks once.
  ~16–24 dispatches / 0.6M–1.4M per page (was 30–45 / 1.3M–3M); rigor and gates unchanged.

## 2.2.0 — 2026-09-28
- lean is now solo + batching: the orchestrator implements S tickets itself with one independent haiku/sonnet
  verifier; S tickets in the same area are batched; planner writes CONTEXT-PACK.md for all later dispatches.
  The previous lean plan is now `balanced`.
- build-plugin.sh rebuilds in place and keeps the folder's .git history.

## 2.1.0 — 2026-09-28
- Intake field 0b: "new spec/feature or a bug in existing code?" always asked; bug track with repro fields,
  root cause first, bisect from last known good, single fix ticket, regression test first (~3 dispatches lean).

## 2.0.0 — 2026-09-28
- Token budget profiles (lean default / balanced / thorough): per-band dispatch plans, batched test plans, merged
  Phase A for S/M, conditional final checks; S tickets take ~2 dispatches.
- setup/ax.mjs runs mechanical steps with no model: commit (guarded), env up/down/status, board, size, mapping
  coverage, cost marks from the usage feed (per-dispatch cost delta).
- filter-output hook trims test/build/lint output to failures + summary (exit code kept).
- qa-tester and code-reviewer default to sonnet, raised by sizing.
- ≤300-word reports; long detail in runs/<id>/reports/.

## 1.9.0 — 2026-09-28
- Migration MAPPING.md: row-by-row old ↔ new traceability (routes, files, endpoints, fields, rules, events,
  strings, guards, SEO, jobs, shared modules) with status and evidence; enforced at both gates, by the reviewer,
  parity-checked by integration-tester, used for drift and rollback.
- Intake field 0: the migration question is part of every intake batch.

## 1.8.2 — 2026-09-28
- Plugin no longer auto-starts the Chrome DevTools MCP for everyone; setup/deps.sh offers it per person.
- smoke-test.sh + bundled web-mini fixture: one command runs the structure check and a real dry run.

## 1.8.1 — 2026-09-28
- Team use: run ids `<YYMMDD>-<user>-<slug>`; what to commit vs ignore in `.agent-x/`; README rewritten.
- Lint hook can be turned off per repo (`Hook: off`) or per shell (`AGENTX_HOOK=0`).

## 1.8.0 — 2026-09-28
- Adaptive sizing: complexity score from spec/Jira signals → band S/M/L/XL per run and ticket; model tier and
  effort (low/medium/high/max) chosen per dispatch from band, criticality floor, session usage and outcomes.

## 1.7.0 — 2026-09-28
- Design-system rule: every UI run (incl. migrations, design clones) uses the project's own design system; init
  records it; blueprint maps to it; implementer, reviewer and visual-verifier enforce it.
- Plugin build (global/build-plugin.sh → agent-x-team marketplace); setup paths are relative to the skill folder.
- deps.sh: graphify installs uv itself; y/n prompts re-ask on invalid input.

## 1.6.0 — 2026-09-28
- Autonomy levels (high-touch / normal / gates-only) with a fixed list of decisions that are always asked.
- setup/migrate-run-state.mjs upgrades old run-state files on resume (with backup).
- evals/run.sh: automated dry-run eval on a copy of a fixture repo with invariant checks.
- rules-index.md: one owner file per rule; validator checks caps consistency, git ban, Bash read-only claims.

## 1.5.0 — 2026-09-28
Adopted from mattpocock/skills (adapted, not copied): grilling-style PM/business discovery with frontier rounds and
recommended answers (product-analyst, CONTEXT.md glossary, ADRs, questionnaires); tracer-bullet tickets with
blocking edges; TDD at agreed seams; two-axis review (spec + standards with smell baseline); diagnosing-bugs
feedback-loop and hypotheses in root-cause-analyst; handoff docs at checkpoints.
- Ticket system: work tickets, test cases, bug tickets with a verified lifecycle, board.md, optional Jira mirror.
- qa-tester is now a staff QA engineer: spec-review, test-plan (red first), execute, verify, regression.
- Model guard (C0/C1/C2) with per-dispatch model override; multi-LLM registry via llm-broker + /agent-x:models
  (PAL MCP, gemini/codex/ollama/llm CLIs) for bulk and second-opinion work.
- Session awareness: opt-in status-line feed, thresholds at 50/70/85%, handoff + resume.
