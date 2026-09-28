# Autonomy level — how often agent-x stops to ask

Set once per project in `.agent-x/project.md` (`Autonomy: normal`), confirmed or overridden at intake per run.

| Decision | high-touch | normal (default) | gates-only |
|---|---|---|---|
| Migration? / mode / intake / Figma / base branch | ask | ask | ask |
| Discovery rounds | up to 3 | up to 2, only C2 decisions asked; others → visible assumptions | 1 round of blocking questions only; rest → assumptions |
| PLAN GATE | ask | ask | ask |
| Bug triage (severity, duplicate) | ask for blocker/critical | decide, show at next gate | decide, show at next gate |
| Reviewer disagreement reply | ask | ask | decide with recommendation, list at final gate |
| Follow-up creation | ask each | ask as one batch at the gate | ask as one batch at the final gate |
| Model tier escalation | ask | decide | decide |
| Session checkpoint / fresh-session prompt | ask | tell | tell |
| FINAL GATE, reviewers, merge | ask | ask | ask |

Never lowered by any level: the PLAN GATE, the FINAL GATE, base branch, reviewers, merge, sending code to a
hosted external model the first time, anything irreversible (data migration, production cutover, deletes),
waiving a blocker, and security findings rated critical/high.
Every decision taken without asking is logged in run-state `decisions` with its reason and shown at the next gate.
