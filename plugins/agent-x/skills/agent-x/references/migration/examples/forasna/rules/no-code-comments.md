# Rule: no comments in implementation code

Do **not** write comments in any implementation source file the engine creates or edits
(`.ts`, `.tsx`, `.js`, `.jsx`, `.css`). This is a hard rule, not a preference.

## What this means

- No line comments (`//`), block comments (`/* … */`), JSX comments (`{/* … */}`), or CSS
  comments (`/* … */`) in code you author.
- No explanatory headers, no "why" notes, no TODO/FIXME breadcrumbs, no section dividers.
- Make the code self-documenting instead: names carry the intent. If a value needs provenance
  (a captured metric, a legacy source line, a decision rationale), record it in the run's
  `docs/migrations/<id>/` notes or `run-state.json` `decisions`, **never** as an inline comment.

## Scope

- Applies to every file written or modified through the migrate-feature engine and to any
  hand edit in this repo.
- JSDoc/TSDoc doc-comments are included in this ban unless a reviewer/rule explicitly requires
  them for a published shared API.
- **Functional directives are exempt** — they are instructions to a tool, not prose: framework
  pragmas (`'use client'`), the vitest environment pragma (`// @vitest-environment jsdom`),
  `// @ts-expect-error`, `eslint-disable`, codegen banners. Prefer moving them to config when a
  config location exists; keep the directive only when the file needs it to build or run.
- Does **not** apply to Markdown docs, `run-state.json`, or the `.claude/rules` / `.claude/skills`
  governance files themselves — those are documentation, not implementation code.

## Enforcement

- `code-reviewer` treats any comment in new/edited implementation code as a BLOCKING
  code-structure finding.
- The author strips comments before a phase gate; a diff that adds a comment does not pass.
