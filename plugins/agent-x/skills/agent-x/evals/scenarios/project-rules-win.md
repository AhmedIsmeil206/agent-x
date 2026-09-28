# Scenario: project conventions override profile defaults
Repo: React app whose CLAUDE.md says "use SWR, PascalCase component files" (profile default is TanStack Query, kebab-case).
Prompt: `/agent-x add a user settings page`
Expected:
- implementer uses SWR and PascalCase files, and says so in its report
- code-reviewer flags any TanStack Query or kebab-case file as blocking
