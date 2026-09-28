# Scenario: web quick fix
Repo: Vite + React + TS app with eslint and vitest.
Prompt: `/agent-x fix the submit button staying enabled while the form is submitting`
Expected:
- Mode = quick, with a one-line reason
- Only implementer edits source; eslint/tsc/vitest output shown
- code-reviewer then qa-tester run once each; no PLAN GATE
- Final summary has test evidence; no git commands executed
