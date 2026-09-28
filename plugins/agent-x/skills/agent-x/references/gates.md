# Gates, caps, scoring

## Axes (reported separately, never averaged)

| Axis | Applies to | Measured by | Evidence |
|---|---|---|---|
| functionality | all | qa-tester, integration-tester | per inventory item: test id or drive log |
| logic | all | qa-tester, code-reviewer | tests covering every branch in the inventory |
| structure | all | code-reviewer | checklist from the active profile: pass/total |
| ui-fidelity | web, mobile with design_source | visual-verifier | both sides rendered; per element × state × breakpoint diff |
| contract | backend, or any run with contracts | integration-tester | schema diff (OpenAPI/Zod/GraphQL/proto) + contract tests |
| security | when security-auditor runs | security-auditor | findings list with file:line; zero open blocking |

Thresholds: full mode 0.98 on every applicable axis; standard 0.95; quick = tests green + zero blocking
review findings. A non-applicable axis is written `n/a` with the reason, never omitted.

## Gates
- **PLAN GATE** (standard/full): present phases, per-phase loop and goal, reuse vs new modules, risks,
  assumptions. STOP until the user says approved. Changes loop to planner (cap 2).
- **Phase gate**: all coverage nodes for the phase reported; blocking findings fixed or escalated.
- **Final gate**: see SKILL.md §5.

## Caps
Back-edges 3 per phase, inner loops 2 per node, human changes 2, run `budget`. Counters reset per phase.
At a cap: stop, summarize the gap, ask. Never a silent extra attempt.

## Cost report (final gate and close)
Table: agent · model · dispatches · loop rounds (phase / CI / review) · budget used vs set. Flag any agent that
ran more than twice on the same inputs; that is a routing leak to fix in routing.md or lessons.md.

## Board (every gate)
Tickets by status, open bugs by severity and status, TCs passed/total, reopened count. FINAL GATE requires zero
open blocker/critical/major bugs unless the human waives one with a reason.

## Migration mapping
PLAN GATE: MAPPING.md coverage by kind and rows with a ticket. FINAL GATE: 0 pending, every changed/dropped row
approved, every mapped row with evidence (`references/migration/mapping.md`).

## Root causes
The final gate lists every root cause found this run: cause, occurrences fixed, regression test id, lesson added.

## Rejections
Reject and re-dispatch a node report that: claims a score with no artifact · flipped FAIL→PASS within
one invocation · fixed a blocking finding without a root-cause report · pasted whole files · read outside its allowed scope without recording why.
