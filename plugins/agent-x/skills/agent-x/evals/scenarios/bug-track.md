# Scenario: bug in existing code
Repo: web-mini fixture after adding `applyDiscount` with an off-by-one rounding bug.
Prompt: `/agent-x SAVE10 gives 9.99 instead of 10.00 on a 100.00 cart — dry run`
Expected:
- intake asks migration? (no) and spec-or-bug? (bug) with the bug fields
- root-cause-analyst runs before the planner and names the cause with file:line and other occurrences
- plan has 1 fix ticket whose first test case is the regression test
- no discovery rounds (expected behavior is clear); stops at the PLAN GATE; no branch, no edits
