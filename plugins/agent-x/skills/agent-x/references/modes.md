# Modes and the graph

## Nodes

| Agent | Role | Writes | Tier |
|---|---|---|---|
| discovery | map the target codebase: placement, reusable modules, conventions | nothing | medium (haiku) |
| source-analyzer | extract behavior spec + functionality inventory from existing/legacy code or a spec | nothing | medium (sonnet) |
| design-fetcher | capture design truth (Figma, live URL, simulator screenshots) | nothing | medium (sonnet) |
| blueprint | map inventory + design onto the repo's existing primitives; module/contract plan | nothing | medium (sonnet) |
| planner | phased PLAN.md with per-phase loops and self-audit | PLAN.md only | high (opus) |
| implementer | the only source writer; one phase per call; runs profile checks | source + tests | high (opus) |
| code-reviewer | correctness + structure axis | nothing | high (opus) |
| qa-tester | tests per inventory item; drives the running app; adversarial | tests only when asked | high (opus) |
| visual-verifier | UI fidelity axis (web or mobile) | nothing | high (opus) |
| security-auditor | secrets, authz, injection, data exposure (stack-aware) | nothing | high (opus) |
| a11y-auditor | keyboard/screen-reader/contrast/RTL (web + mobile) | nothing | medium (sonnet) |
| integration-tester | cross-feature regressions, routes/deep links, API contract | nothing | medium (sonnet) |
| deploy-cutover | optional traffic/route cutover edits defined in project.md | config only | medium (sonnet) |
| root-cause-analyst | diagnose every failure to root cause; fix spec for the whole class | nothing | high (opus) |
| task-router | pick agent + model + minimal inputs for unclear work units | nothing | medium (haiku) |
| requirements-reader | read Jira card + links into intake | nothing | medium (sonnet) |
| git-manager | branch, commit, push, PR, merge (human-chosen values) | git only | medium (sonnet) |
| migration-lead | migration track only: scope, case detection, inventory audit, shared modules, cutover | nothing | high (opus) |
| product-analyst | PM/business discovery rounds before planning | nothing | high (opus) |
| llm-broker | model registry; runs C0/second-opinion work on external LLMs | external outputs only | medium (haiku) |
| environment | start/stop dev server, simulator, services from project.md | nothing | medium (haiku) |
| doc-writer | intake notes, run log, lessons.md | docs only | medium (haiku) |

## quick
No discovery rounds unless the input lacks a clear user or success measure; one ticket. qa-tester test-plan →
implementer → code-reviewer → qa-tester execute (run/extend tests). One pass each, inner cap 2. A failure with a non-obvious cause goes to root-cause-analyst. Git steps (branch/commit/PR) still go through git-manager with the human-chosen base and reviewers. No PLAN GATE;
the final gate is a short summary with test evidence. Escalate if any escalation trigger appears.

## standard
discovery → (source-analyzer if there is existing behavior to preserve) → planner → **PLAN GATE** →
per ticket (thorough shown; lean/balanced per token-budget.md): qa test-plan → implementer → code-reviewer ∥ qa execute
→ [domain checks] → (blocking → root-cause-analyst → implementer → qa verify) → `ax commit` → final gate → PR → merge.
Domain checks by profile `kind`:
- web: a11y-auditor; visual-verifier if a design_source exists
- mobile: a11y-auditor; visual-verifier if a design_source exists and a simulator is available
- backend: security-auditor always; integration-tester for contract changes

## full
Phase A in parallel: discovery ∥ source-analyzer ∥ design-fetcher → blueprint ∥ product-analyst discovery rounds (cap per token-budget.md)
→ planner → **PLAN GATE** → Phase B/C per plan (implementer → code-reviewer → qa-tester → visual-verifier)
→ security-auditor ∥ a11y-auditor → integration-tester → deploy-cutover (if project.md defines it)
→ **FINAL GATE**. All applicable axes gate at the thresholds in gates.md.

## bug track (field 0b = bug)
context → intake (bug fields) → root-cause-analyst (feedback loop, repro, hypotheses, cause, occurrences;
`git bisect run` from the last known good commit when given) → discovery/blueprint only if the fix touches
contracts or UI → planner: 1 fix ticket (split by area if the class is wide) with the regression test as its first
TC → PLAN GATE (root cause + fix + blast radius) → implementer (regression test red → fix → green) → verifier (lean
S) or code-reviewer ∥ qa execute → qa verify of the original repro and neighbouring flows → commit → PR. Sizing:
bug inputs add their severity/reproducibility points (sizing.md). Unreproducible after the analyst's loop → STOP
with what was tried and what evidence would help.

## dry run (any mode)
Runs context → intake → Phase A → planner and stops at the PLAN GATE with the plan, routing and an estimated dispatch
count. No branch, no edits, no git.

## Escalation triggers (quick/standard → higher)
New or changed public contract (API schema, props of a shared component, DB schema) · auth, payments,
PII or permissions touched · a data migration · more than one package · a design fidelity target ·
the user says "careful" / "production".
