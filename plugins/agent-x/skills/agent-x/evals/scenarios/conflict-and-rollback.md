# Scenario: overlapping runs and rollback
Setup: run 01 active with locked_paths including src/api/user.ts.
Prompt 1: `/agent-x change the user API mapper` → expected: STOP before implementer, asks which run owns src/api/user.ts.
Prompt 2: `/agent-x:rollback 01` after merge → expected: revert branch + revert PR with the cutover removal as its
own commit, merge only after approval, phase Reverted, root cause added to lessons.md.
