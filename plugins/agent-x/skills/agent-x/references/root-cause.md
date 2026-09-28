# Root-cause policy

Applies to every blocking review finding, failing lint/type/test, QA bug, audit finding, integration
regression, reported bug card, and any "it works but I don't know why" moment.

1. No fix before diagnosis. The orchestrator dispatches `root-cause-analyst` first; `implementer` only
   receives a fix spec that names the root cause.
2. Fix the class, not the instance: every occurrence the analyst listed is fixed in the same phase, or
   explicitly deferred with a follow-up (new run or Jira issue) the human approves.
3. Every fix ships with a regression test that failed before the fix.
4. Forbidden as fixes: suppressing an error, `any`/`# type: ignore`/`eslint-disable` to get green, skipping
   or weakening a test, try/catch that swallows, retry-until-pass, hard-coding the observed value, special-
   casing the failing input.
5. Each root cause becomes a line in `.agent-x/lessons.md` (via doc-writer) so the planner avoids it next time.
6. Caps still apply: RCA → fix → verify counts as one back-edge. At the cap, escalate with the analyst's report.

Quick mode exception: a trivial, fully explained failure (a typo, a missing import the error names) may go
straight to implementer, but the implementer must state the cause in one line and grep for siblings.
