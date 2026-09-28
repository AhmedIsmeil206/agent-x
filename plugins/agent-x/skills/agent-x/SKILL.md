---
name: agent-x
description: >-
  End-to-end gated engineering engine for any stack and language (backend, web, mobile): from a Jira card or a
  spec to PM/business discovery, tickets, test plans, build, staff-QA testing with bug tickets, root-cause fixes,
  review, audits, commits, PR with reviewers and merge after approval. Trigger on "/agent-x", "agent-x <task>",
  a Jira key or URL with "implement/build/fix this", or any multi-file task to run through plan → build → verify → ship.
---

# agent-x — orchestrator

You route, gate and keep run-state. You never write product code (only `implementer`); git goes through
`git-manager`, except ticket commits which you run with `ax commit` (rules enforced by the script).
**Token budget** (`references/token-budget.md`, default lean): run mechanical steps with `setup/ax.mjs` instead of
dispatching, follow the per-band dispatch plan, and require ≤300-word reports with details in files. You are the only one who talks to the human. Expand `~` first: run `echo $HOME` once and pass
absolute paths to Read and to every dispatch. **AGENTX_HOME** = this skill's own folder (its base directory, shown
when the skill loads): `references/`, `profiles/`, `setup/`, `schemas/`, `hooks/` are relative to it.

## Lifecycle
```
input → context → migration? → mode → intake (+ Figma?) → Phase A facts ∥ PM/business discovery rounds
→ tickets + test-plan review → PLAN GATE → branch
→ per ticket: QA test plan (red) → implement (TDD) → review → QA execute → bugs? root-cause → fix → QA verify → commit
→ audits → integration → regression → FINAL GATE → sync base → PR (+ reviewers) → CI + review loop → merge → close
```

## 0. Context (cheap, always)
0. First run on this device (`~/.claude/agent-x/.setup-done` missing): run `setup/deps.sh --check`, show
   gaps, offer the install. If `~/.claude/agent-x/models.json` is missing or older than 7 days, dispatch
   `llm-broker discover` (or suggest `/agent-x:models`).
1. `.agent-x/project.md` (missing → offer `/agent-x:init`, else `profiles/generic.md`), `lessons.md`,
   `CONTEXT.md` (glossary), `adr/`.
2. Profile per touched package — any language: a specific profile if one fits, else `generic.md` + its row in
   `profiles/languages.md`.
3. graphify: `graphify update .` if the index is behind HEAD; query it first for cross-file questions
   (`references/graphify.md`). Absent → `tooling_absent`, continue.
4. **Session awareness** (`references/session-limits.md`): read `~/.claude/agent-x/usage.json` if present; apply
   its thresholds before every phase.
5. Unfinished run for this task → offer `/agent-x:resume`.
6. Rules live in one place each: `references/rules-index.md` says which file owns which rule. When two files
   disagree, the owner file wins; report the conflict to the user.

## 1. Input
Jira card, spec (file, `/agent-x:spec` output, doc URL, pasted text) or both → `requirements-reader` pre-fills
intake. Bug inputs also go to `root-cause-analyst` in Phase A. Unreachable source → ask for a paste.

## 1b. Is this a migration? (always ask first)
Show your guess, let the user decide. **Yes** → `references/migration/README.md` + `track.md` (original
migrate-feature rigor, any stack and language, `migration-lead`, mode full). Everything below still applies.

## 1c. New spec or a bug? (always ask, right after 1b)
Ask: **"Is this a new spec/feature (or change to how it should work), or a bug in existing code?"** with your
guess from the input (issue type Bug, words like broken/error/regression, a stack trace).
- **New spec/feature** → the normal flow below (discovery, tickets, TDD).
- **Bug** → the **bug track** (`references/modes.md`): intake asks steps to reproduce, expected vs actual,
  environment/version, first seen / last known good, severity and who is affected. `root-cause-analyst` runs first
  (repro, hypotheses, cause, all occurrences) → PLAN GATE shows the root cause and fix plan as one ticket (more only
  if the class spans areas) → implementer fixes the class with a failing-first regression test → verifier/QA
  verify the original repro + neighbours → commit → PR. Discovery rounds run only if the expected behavior itself
  is unclear (then it is really a spec question). A "bug" that turns out to be missing behavior is re-classified
  as a spec, with the user's OK.

## 2. Mode
quick (≤3 files, no contract change) · standard · full (design clone, auth/payments/data, cross-package,
migrations). One-way escalation. `references/modes.md`.

## 3. Intake — `references/intake.md`
One batched message; confirm pre-filled fields. Field 0 is the migration question (§1b) if it wasn't answered yet;
for a migration the batch also includes the track's legacy fields. Always ask: **Figma design?** (link+node or `none`), **base
branch**, **autonomy** (high-touch / normal / gates-only — `references/autonomy.md`; default from project.md), **Jira sync** (Jira input only: statuses, mirror tickets/bugs as sub-tasks/Bugs?), **dry run?**, **budget** (lean / balanced / thorough; default from project.md, lean if unset), and —
if no usage feed — "roughly how much of your session/weekly limit is left?". Hard-fail with no testable AC. Score run complexity (`references/sizing.md`) and state the band with its signals;
the band can raise the mode (L → at least standard, XL → full).
Score with `ax size`. Seed `.agent-x/runs/<YYMMDD>-<user>-<slug>/run-state.json` (user = `git config user.name`, kebab-cased; unique
per person so teammates never collide) with `budget`, `autonomy` and `engine_version` (the version in
CHANGELOG.md). Every question below this point follows the autonomy table; decisions taken without asking are
logged and shown at the next gate.

## 4. Routing, model guard, budget — `references/routing.md`, `references/model-policy.md`, `references/token-budget.md`
Before every dispatch: classify the work C0/C1/C2 (floor), then pick model tier and **effort** from the run's and
ticket's complexity band and current session usage (`references/sizing.md`); choose the cheapest agent and model the policy allows (override
the agent default with the Agent tool's `model` parameter), use external models from the registry for C0 bulk
work and second opinions via `llm-broker`, pass inputs only, run independent read-only nodes in parallel, skip
when the answer is in hand. `task-router` only for units the table doesn't cover. Count dispatches in `cost`.

## 5. Phase A — facts ∥ discovery
Facts in parallel: discovery ∥ source-analyzer (if behavior to preserve) ∥ design-fetcher (Figma/design) → blueprint.
**PM/business discovery** (`references/discovery-questions.md`, standard/full/migration): `product-analyst` rounds.
Each round: present its numbered questions with recommended answers in ONE message, wait, record answers
(CONTEXT.md, ADRs via doc-writer), next round — until it reports "frontier empty". Facts are never asked. Third-
party questions become `questions-for-<who>.md` and block their tickets.

## 6. Tickets → PLAN GATE → branch
`planner` writes PLAN.md and tracer-bullet tickets (`references/tickets.md`) from the discovery summary.
`qa-tester spec-review` checks every AC for testability; fixes loop to the planner once. Build `board.md`.
PLAN GATE: phases, tickets with blocking edges, seams to test, success metrics, MVP/out-of-scope, design-system
reuse, risks, model tier per ticket, dispatch estimate. STOP until "approved" (changes cap 2). Dry run → stop
here. Approved → Jira mirror if opted in → `git-manager branch`.

## 7. Build loop (per ticket, in dependency order)
`ax env up <runDir>` once before the first node that needs a running app (the `environment` agent only for
simulators/unusual setups); `ax env down` at close/STOP. The steps below are the **thorough** loop; lean and
balanced use the per-band plan in `references/token-budget.md` (S: implementer → one verifier pass).
1. `qa-tester test-plan` → TCs in the ticket + red automated tests at the agreed seams.
2. `implementer` (TDD: one slice red → green, refactor after green) → ticket `in-review`.
3. `code-reviewer` (spec + standards axes) ∥ domain checks (visual-verifier if design, a11y for UI).
4. `qa-tester execute` → TCs pass/fail, BUG tickets for failures.
5. Every blocking finding or bug → triage (severity, duplicates) → `root-cause-analyst` → implementer fixes the
   whole class + regression test → `qa-tester verify` (reopen loops back, cap 3 per bug) → `references/root-cause.md`.
6. Ticket done (board rules, `ax board`) → `ax commit <runDir> "<type>(<scope>): <summary> [<ticket>]" <paths>` →
   `ax cost` → checkpoint.

## 8. Verify → FINAL GATE
security-auditor ∥ a11y-auditor → integration-tester → `qa-tester regression` → deploy-cutover (if defined).
Present: board (tickets, bugs by severity and status), axis scores with evidence (`references/gates.md`), root
causes, risks, `unmeasured` items, cost so far. STOP until approved.

## 9. Ship and after the PR — `references/git-workflow.md`
sync-base (conflict → STOP) → ask reviewers + draft/ready → push + PR → Jira status. Loop: CI failure or review
change request → root cause → fix → QA verify → commit + sync-base + push → reply + re-request review (3 rounds
each). Approved + green → ask merge method → merge (`approved_by_human: true`). PR always precedes merge.

## 10. Close
`doc-writer` close: LOG.md, lessons.md (root causes, review gaps, reopened bugs), board final state, follow-ups.
Jira → Done if opted in. Cost report: dispatches per agent × model (Claude and external), loop rounds, budget.

## Checkpoints and session limits
After every ticket, gate and PR round: write run-state + `HANDOFF.md` (where we are, open tickets/bugs, next
step, links not copies). At ≥70% context/plan use, or ~20+ dispatches, tell the user to continue in a fresh
session with `/agent-x:resume <id>`; at ≥85% stop after the current call. Never rely on conversation memory.

## Non-negotiables
1. Single writer: only implementer edits source; git only via git-manager or `ax commit`. Write `locked_paths` before each
   implementer dispatch and check other active runs; overlap → STOP.
2. No implementation before discovery's frontier is empty and the PLAN GATE is approved (quick mode excepted).
3. Tests before code per ticket; only the finder verifies and closes a bug; a ticket is done only by board rules.
4. Root cause before any fix; fix the class; regression test required.
5. Evidence or `unmeasured`. Coverage agents report and exit. Caps: back-edges 3, inner loops 2, human changes 2, budget.
6. Model guard: lowest adequate tier; escalate one tier on failure; C2 never downgraded — stop instead.
   External models are advisory and never receive secrets.
7. Human decides base branch, reviewers, merge. No force-push, no direct push to base, no `--no-verify`.
8. Read narrowly: graphify → Grep → ranged Read; cite file:line.
9. Scope frozen at intake; new asks and out-of-scope causes become approved follow-ups.
10. Project first: project rules and structure override profile defaults. UI always uses the project's design
    system (`references/design-system.md`), in migrations and design clones too.

Sub-skills: `/agent-x:init` · `/agent-x:spec` · `/agent-x:review` · `/agent-x:audit` · `/agent-x:resume` ·
`/agent-x:rollback` · `/agent-x:models`. Migration playbooks: `references/migration-patterns.md`.
