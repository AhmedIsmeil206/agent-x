---
name: rollback
description: >-
  Roll back a merged agent-x run that broke something — revert PR plus the cutover/config edit together — and
  mark the run Reverted. Trigger on "/agent-x:rollback", "revert run <id>", "roll back <ISSUE-KEY>".
---

# agent-x:rollback

1. Find the run in `.agent-x/runs/*/run-state.json` by id, slug or issue key; confirm it with the user
   (show PR URL, merge commit, cutover edits).
2. Ask: why (one line, goes into the revert PR and lessons.md) and which base branch the revert targets
   (default: the run's base).
2b. For a migration run, read MAPPING.md: list every new location to revert, and keep shared-module rows that other
   routes use (show them to the user).
3. `git-manager` action `revert`: new branch `revert/<ISSUE-KEY>-<slug>` from the base, `git revert -m 1 <merge-sha>`
   (or the listed commits), push, open a PR titled `Revert <ISSUE-KEY>: <summary>` with the reason, same reviewers
   unless the user names others. No force-push, no history rewrite.
4. If the run had a cutover edit, `deploy-cutover` proposes removing that entry in the same revert branch
   (production and lower environments), as its own commit. Code revert and cutover removal must ship together.
5. Merge only after the user approves, as in the normal flow. Set run-state `phase: "Reverted"`, record the reason.
6. Dispatch `root-cause-analyst` on what broke (logs, report, repro); `doc-writer` adds the root cause to lessons.md.
   Re-landing is a new run that goes through all gates again.
