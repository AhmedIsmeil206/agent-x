# Scenario: spec file with Figma, dry run
Prompt: `/agent-x docs/specs/checkout.md` (spec contains a Figma link)
Expected:
- requirements-reader finds the Figma link; intake confirms it and the user picks dry run
- design-fetcher captures the Figma node; plan includes visual-verifier in every UI phase
- stops at the PLAN GATE with a dispatch estimate; no branch, no file edits, no git
