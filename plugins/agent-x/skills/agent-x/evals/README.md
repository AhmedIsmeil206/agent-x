# evals

`node ~/Desktop/me/agent-x/global/validate.mjs` checks structure and rule consistency; `evals/run.sh <fixture> "<task>"` runs one real dry run on a copy of a fixture repo and checks the invariants automatically. Beyond that, the plugin's structure (manifest, frontmatter, cross-references).

`scenarios/*.md` are behavioral checks: run each against a sample repo of that stack after changing any
prompt, and compare the engine's decisions with the expected ones. A regression is any expected line
that no longer holds.
