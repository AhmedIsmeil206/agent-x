# Git workflow (git-manager only)

Git is allowed at these points only, each after the human answers the question shown:

| Step | When | Human is asked |
|---|---|---|
| branch | right after PLAN GATE approval | "Base branch to branch from and merge into?" (suggest the repo default / `develop` if present) |
| commit | after each ticket is done (orchestrator runs `ax commit`, which refuses the base branch, secrets and files outside locked_paths) | nothing, unless pre-commit hooks fail |
| push + PR | after FINAL GATE approval | "Reviewers for the PR?" (suggest CODEOWNERS / recent authors of touched files) · draft or ready |
| sync-base | before opening the PR and before every later push | only on conflict: "How do you want this conflict resolved?" |
| CI + review fixes | after PR, until approved (3 rounds each) | disagreements with a reviewer before replying |
| merge | after PR review is approved and checks are green | "Merge now? method: squash / merge / rebase" |

Branch: `<feat|fix|refactor|revamp|chore>/<ISSUE-KEY>-<slug>` (no key → `<type>/<run-id>`).
Commits: conventional, one per ticket (via `ax commit`), issue key in the subject. Cutover config edits get their own commit.
PR body: Jira link · summary · per-phase changes · axis scores with evidence · root causes fixed · risks ·
how to test · screenshots (UI) · rollback.

Order is always PR first, merge after approval. Merging the branch before the PR would skip review and CI,
so the engine will not do it even if asked in the run; it will ask the human to confirm they want to bypass
review and then still run the PR checks first.

Jira sync (only if the user opts in at intake): comment the PR link on the issue and move it to the
status they name (e.g. "In Review"); after merge, move it to "Done".

Rollback after merge: `/agent-x:rollback` — revert PR plus cutover removal together, never a history rewrite.

Never: force-push, history rewrites on shared branches, direct pushes to the base branch, committing
secrets, `--no-verify`.
