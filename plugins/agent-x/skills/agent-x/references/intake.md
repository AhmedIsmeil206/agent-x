# Intake

Batch these in one message. Blank is never "skip": re-ask, or the user answers `none` explicitly.
Pre-fill anything `.agent-x/project.md` or an existing spec already answers and ask only to confirm.

| # | Field | Notes |
|---|---|---|
| 0 | migration? | **always asked first**: "Is this a migration of existing/legacy code, or new work?" with your guess. Yes → also ask legacy repo/path, legacy route/screen/endpoint, parity baseline (faithful port or approved redesign), cutover mechanism, and preset (none / forasna) — see migration/track.md |
| 0b | spec or bug? | **always asked right after field 0**: "Is this a new spec/feature, or a bug in existing code?" with your guess. Bug → also ask: steps to reproduce, expected vs actual, environment/version/device, first seen or last known good version/commit, severity, who is affected, logs/screenshots. Missing repro is not a hard fail: root-cause-analyst builds one first |
| 1 | type | feature / migration / refactor / fix / design-clone / spec-only |
| 2 | slug | kebab-case, e.g. `talent-search` |
| 3 | task | one line, frozen |
| 4 | package(s) | which profile(s) apply (monorepo) |
| 5 | source of behavior | legacy path/URL, existing module, spec doc, or `none` for net-new. For migrations this path is the READ SCOPE; verify it exists |
| 6 | design source | **always asked**: "Is there a Figma design?" → Figma link with node (`fileKey:nodeId`), else live URL, screenshots, or `none` (forbidden for design-clone). Confirm any link requirements-reader found |
| 7 | contracts | endpoints / schemas / events touched, or `none` |
| 8 | acceptance criteria | ≥1 testable; reject TODO/TBD placeholders — hard fail |
| 9 | constraints | perf budget, platforms (iOS/Android/min OS), browsers, locales/RTL, or `none` |
| 11 | base branch | branch from and merge into; suggest repo default |
| 13 | input | Jira key/URL, spec path/URL, or pasted text → requirements-reader pre-fills the rest |
| 15 | usage | only if no status-line feed: rough session/weekly limit left |
| 14 | dry run | yes = stop after the PLAN GATE, no branch, no edits |
| 12 | Jira | issue key (pre-fills 1–9 via requirements-reader) and whether to sync status/comments, or `none` |
| 10 | budget | max agent dispatches for the run (default: quick 6, standard 25, full 60) |

Hard fails (stop, ask): no testable AC · design-clone without design source · migration without a
verifiable source path.

Output: `.agent-x/runs/<YYMMDD>-<user>-<slug>/run-state.json` with `phase: "Intake"` and `intake.md` mirroring the
answers. Branch name: see git-workflow.md (git-manager creates it after the PLAN GATE).
