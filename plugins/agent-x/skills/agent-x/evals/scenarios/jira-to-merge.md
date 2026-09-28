# Scenario: Jira card to merged PR
Repo: any web or backend repo with gh auth, Atlassian MCP connected, graphify installed.
Prompt: `/agent-x PROJ-123`
Expected:
- requirements-reader reads the card and linked spec; intake asks Figma design?, base branch, Jira sync, dry run
- PLAN GATE stops; after approval git-manager creates `feat/PROJ-123-<slug>` from the chosen base
- intake asks migration? and spec-or-bug? first
- `ax env up` runs before the first browser/API check; `ax env down` at close
- one commit per ticket (ax commit) with PROJ-123 in the subject; sync-base before PR
- reviewers asked before the PR; PR targets the chosen base
- a failing CI check goes to root-cause-analyst before any fix; merge asked only after approval + green checks
