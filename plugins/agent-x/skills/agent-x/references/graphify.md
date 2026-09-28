# graphify (code knowledge graph)

Source: https://github.com/Graphify-Labs/graphify — local tree-sitter parsing, ~37 languages, no API calls
for code extraction.

## Setup (done by /agent-x:init, with the user's OK)
- Install: `uv tool install graphifyy` (or `pipx install graphifyy`). The package is `graphifyy`; the command is `graphify`.
- Build the index once at repo root: `graphify extract .` (or `/graphify .` inside Claude Code after `graphify install`).
- Output: `graphify-out/graph.json`, `GRAPH_REPORT.md`, `graph.html`. Suggest adding `graphify-out/` to `.gitignore`.
- Optional: `graphify hook install` to refresh on commit/checkout.

## Use in runs
- Before any cross-file search, if `graphify-out/` exists: `graphify query "<question>"`,
  `graphify path "<A>" "<B>"`, `graphify explain "<Symbol>"`. Read only the files the graph points to.
- At run start, if the index is older than HEAD: `graphify update .` (incremental, changed files only).
- Missing graphify never blocks a run: record `tooling_absent: graphify` and fall back to Grep + ranged Read.
- For a large legacy source outside the repo, build a scoped index over just the intake source path.

[Likely] Command names are from the project README as of 2026-09; if a command errors, run `graphify --help`
and adapt rather than guessing flags.
