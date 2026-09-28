# Rules index — one owner file per rule

If two files disagree, the **owner** wins and the conflict is reported to the user (and fixed in the next version).
Other files may only point to the owner, not restate numbers.

| Rule | Owner |
|---|---|
| Lifecycle, gates order, non-negotiables | SKILL.md |
| Modes, node list, escalation triggers, dry run | references/modes.md |
| Intake fields and hard fails | references/intake.md |
| Autonomy — what is asked vs decided | references/autonomy.md |
| Axes, thresholds, caps (back-edges 3, inner loops 2, human changes 2), board rules at gates, cost report | references/gates.md |
| Tickets, test cases, bug lifecycle, "done" definition | references/tickets.md |
| Discovery method and round caps | references/discovery-questions.md |
| Root-cause policy | references/root-cause.md |
| Model tiers C0/C1/C2, external models | references/model-policy.md |
| Complexity bands, per-dispatch tier + effort, session and outcome adjustments | references/sizing.md |
| Effort levels low/medium/high/max | references/effort-policy.md |
| Routing table | references/routing.md |
| Budget profiles (lean = solo + batching), no-model steps (ax.mjs), report size, output filter | references/token-budget.md |
| Session thresholds 50/70/85 | references/session-limits.md |
| Git steps and what the human decides | references/git-workflow.md |
| Reading narrowly | references/token-economy.md |
| Old ↔ new mapping | references/migration/mapping.md |
| Migration track | references/migration/track.md (forasna preset: examples/forasna/) |
| Design system use | references/design-system.md |
| Stack conventions | the project first, then profiles/*.md |
| Each agent's own procedure | agents/<name>.md |
