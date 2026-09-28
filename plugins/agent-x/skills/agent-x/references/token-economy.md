# Token economy

1. Locate before reading: Grep/Glob the exact symbol, route or endpoint, then Read a line range.
2. Never sweep a directory for context; discovery does reconnaissance once, later nodes reuse its file:line.
3. Reuse upstream findings passed in the dispatch; do not re-derive them.
4. Cite, don't paste: reports carry file:line, not file bodies.
5. Model by task: mechanical scan → haiku; bounded analysis → sonnet; contract/design/security judgment → opus.
6. Migrations: the source path from intake is the read scope; widening is recorded with a reason.
7. For corpus-wide questions, query an existing index (e.g. `graphify-out/`) before opening files.
8. Reports ≤300 words with file:line; longer detail goes to `runs/<id>/reports/` and is read only when needed.
9. Never read node_modules, build output, generated files, lockfiles, Pods, .gradle, venv.
