# Ticket system (work tickets + bug tickets)

Lives in `.agent-x/runs/<id>/tickets/`. The orchestrator owns `board.md`; agents update only the fields their
role owns. If Jira sync is on, each work ticket mirrors to a Jira sub-task and each bug to a Jira Bug linked to it
(created by requirements-reader with `write: create-issue`, only after the user approved sync at intake).

## Work ticket — `T-<NNN>-<slug>.md` (written by planner)
```
id: T-003 · title: Guest can apply to a job with a saved CV
status: todo | ready | in-progress | in-review | qa | done | blocked
blocked_by: [T-001]            # native edges; none = can start now
size: S | M | L                # L must fit one fresh context window, else split
seams: public interfaces the tests hit (agreed at PLAN GATE)
what_to_build: end-to-end behavior, not layer steps (a tracer bullet through every layer it touches)
acceptance_criteria: [AC-1 …]   # verifiable
inventory_ids: [F-12, F-13]
test_cases: [TC-003-01 …]       # written by qa-tester BEFORE implementation
files: planned locked_paths
band: S | M | L (sizing.md; XL must be split) · signals: [...]
model_tier + effort: per agent, from sizing.md (orchestrator may adjust for session usage and outcomes)
```
Sizing: a ticket is demoable on its own and fits one fresh context. Wide mechanical refactors use expand → migrate
→ contract tickets. Order: blockers first; tickets with no blockers can run as soon as the writer is free.

## Test case — `TC-<ticket>-<NN>` (inside the ticket, written by qa-tester)
id · covers (AC / inventory id / state) · type (unit/component/API/e2e/manual-drive) · preconditions · steps ·
expected result (from an independent source of truth, never recomputed like the code) · priority (P0–P2).

## Bug ticket — `BUG-<NNN>.md` (written by qa-tester, code-reviewer, auditors, integration-tester)
```
id: BUG-007 · ticket: T-003 · found_by: qa-tester · severity: blocker | critical | major | minor | trivial
status: open → triaged → assigned → fixed → verified → closed   (reopened if verify fails; wontfix needs human)
test_case: TC-003-02 · environment: dev_url / device / commit
steps_to_reproduce · expected · actual · evidence (log tail, screenshot path, failing test id)
root_cause: filled by root-cause-analyst · occurrences · fix_ref: commit/files · regression_test
```
Flow: finder files it `open` → orchestrator triages (severity, duplicate check) → root-cause-analyst fills cause →
`assigned` to implementer with the fix spec → implementer sets `fixed` + fix_ref → **the finder (usually
qa-tester) verifies** by rerunning the repro and the regression test → `verified`/`closed` or `reopened`.
Only the human can set `wontfix` or downgrade a blocker.

## Board — `board.md` (orchestrator)
One table: ticket · status · blocked_by · open bugs by severity · tests passed/total · model tier. A ticket moves
to `done` only when: its ACs pass, all its TCs pass, zero open blocker/critical/major bugs, review has no blocking
findings, and its commit exists. Shown at every gate.
