# Old ↔ new mapping (every migration run)

One file per run: `.agent-x/runs/<id>/MAPPING.md`, built by `migration-lead` action `mapping`, kept current through
the run, and shipped in the PR body as a summary. It is the answer to "is everything from the old version
accounted for, and where did it go?"

## Row kinds
route/screen · file/symbol · component/widget · endpoint/query · data field (request, response, DB column) ·
validation rule · business rule/branch · event/analytics call · user-visible string/locale key · permission/guard ·
SEO/meta · background job/webhook · config/flag · shared module.

## Row format (one table per kind)
| id | legacy (file:line or URL) | new (path:symbol or route) | status | change note | evidence | ticket |
|---|---|---|---|---|---|---|
| M-017 | legacy/app/talent/search.tpl:88 `{if $user.premium}` | src/components/employer/talent/filters.tsx:FiltersView `isPremium` | mapped | — | TC-004-03 pass | T-004 |

`status`: **pending** (not built yet) · **mapped** (same behavior) · **changed** (intentional difference; change note
+ who approved) · **merged** (several legacy rows into one new, list them) · **split** · **dropped** (human waiver +
reason) · **new** (no legacy counterpart; must link an AC).
`evidence`: the test id, drive-log entry, parity check (same input → same output/side effect) or visual diff that
proves the row. No evidence → the row cannot be `mapped`.

## Rules
1. Seeded at Phase A from source-analyzer's inventory + blueprint (every inventory item becomes ≥1 row; legacy
   file hashes recorded for drift). Every row links a ticket before the PLAN GATE.
2. implementer writes new locations into the rows it builds (via its report; the orchestrator updates the file).
3. code-reviewer: new code with no mapping row, or a mapped row whose code does something else, is blocking.
4. qa-tester / integration-tester / visual-verifier fill `evidence` per row they verify.
5. Gates: PLAN GATE shows coverage (rows by kind, rows with a ticket); FINAL GATE requires 0 `pending`, every
   `changed`/`dropped` approved, every `mapped` with evidence. Coverage % is part of the functionality axis.
6. Drift: on resume and before the FINAL GATE, re-hash legacy files; a changed hash marks its rows `drifted` and
   lists the new files they point to as blast radius.
7. Rollback: `/agent-x:rollback` uses the mapping to list every new location to revert and every shared module row
   used by other routes (those are kept, not reverted).
