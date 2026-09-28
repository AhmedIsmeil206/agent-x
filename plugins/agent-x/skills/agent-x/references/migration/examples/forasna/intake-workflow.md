# migrate-feature — INTAKE WORKFLOW (executed by reading, not by a script)

You (the orchestrator) run this by ASKING in chat and following each step in order. This markdown
IS the intake — you run it by asking in chat. There is no intake script: a `.js`/JSON script can
silently skip a field, but a workflow read and executed line-by-line cannot. That is the whole
reason intake lives here as markdown.

## The one rule that governs the whole intake

**NOTHING HERE MAY BE SKIPPED.** Every field below is asked and answered before the run starts.

- A blank / empty answer is never "leave it out" — you **re-ask**.
- Where "no value" is a legitimate answer (API domain, endpoints, future-notes, legacy ref), the
  human must **say `none` explicitly**, so the absence is a recorded decision, not an accident.
- You **MUST NOT invent, default silently, or omit** an answer. The only defaults allowed are the
  ones named in the table (e.g. base branch `develop`), and even those are shown and confirmed.

Ask efficiently: you MAY batch the fields into one message, but you must have a real answer for
**every** row before STEP F. If any is missing or invalid, re-ask only the missing/invalid ones.

---

## STEP A — Are we resuming, run-seeded, or spec-seeded?

1. If `docs/migrations/<id>/run-state.json` already exists for this task (a prior session seeded
   it): **read `intake.md` + `run-state.json` and STOP asking.**
    - If `phase` is past `Intake`, this is a RESUME: re-enter at `next` / `last_node` with the
      existing counters, gates, and frozen artifacts. Re-run a node only if its artifact is missing or
      its inputs drifted. (Design captures are session knowledge — if a cold resume no longer holds
      them, re-run `design-fetcher` live rather than reading files.)
2. **Spec-seeded?** If `docs/route-specs/<slug>.spec.md` exists (written by the `route-spec` skill),
   **read its `Pre-seed for /migrate-feature` block** and use it to PRE-FILL the STEP B fields:
   `surface`, `slug`, `task`, `case`, `legacy_source.path` + `route`, `target`, `design_source`,
   `route_feature_spec`, `endpoints`, `shared_modules`, and the seed `acceptance_criteria`. You still
   run STEP C (DoR) and **CONFIRM the pre-filled fields with the human in one message** — the spec
   fills the answers, it does not bypass the human's sign-off. Record `spec_ref` in run-state so the
   Phase-A agents know exactly where to look (extraction still runs live, but scoped by the spec, so
   nothing is re-searched blindly). Do NOT re-ask a field the spec already answers unless it fails
   validation.
    - **Drift check:** re-hash the live legacy files + design source and compare to the spec's
      `legacy_sha256` / `source_sha256`. On mismatch, WARN the human, show what changed, and treat the
      drifted part as unknown — re-extract it at Phase A rather than trusting the stale spec. A spec is
      a fast start, never a substitute for live truth.
    - A `mode: quick` spec is NOT migration-ready — use it only to locate the source; Phase A still
      runs the full design capture + inventory it omitted. An `.index.spec.md` (a multi-page area) is
      NOT a migration input — require a per-route child spec.
3. Otherwise, run STEP B onward.

---

## STEP B — Ask every field (nothing skipped)

| #   | Field                   | Ask for                                                                                                                                   | Required?                                                                                                                                                            | Validate — re-ask until it passes                                                                                          |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | **surface**             | migrate-page / new-feature / design-clone                                                                                                 | yes                                                                                                                                                                  | one of the three                                                                                                           |
| 2   | **slug**                | short kebab-case name, e.g. `talent-search`                                                                                               | yes                                                                                                                                                                  | matches `^[a-z0-9]+(-[a-z0-9]+)*$`                                                                                         |
| 3   | **task**                | one-line task, frozen for the whole run                                                                                                   | yes                                                                                                                                                                  | non-empty                                                                                                                  |
| 4   | **legacy route path**   | the route's path/folder in the OLD repo `../forasna` that holds this feature (the READ SCOPE), e.g. `application/modules/employer/talent` | **YES — ALWAYS ask, in every case, whenever the route has a legacy origin** (all migrate-page cases 1–6; design-clone/new-feature when it revamps an existing route) | the path MUST exist — verify with Glob/Read against `../forasna`; if it doesn't, STOP and re-ask                           |
| 5   | **legacy route/ref**    | the legacy URL/route this page serves                                                                                                     | yes (or `none`)                                                                                                                                                      | non-empty or explicit `none`; default it to the legacy path                                                                |
| 6   | **case(s)**             | case1–6, or `auto`                                                                                                                        | yes                                                                                                                                                                  | if `auto`, YOU detect them by reading inside the legacy path (§Case detection) and present the set with a recommended pick |
| 7   | **design source**       | `url` + a live production/legacy URL, OR `figma` + `fileKey:nodeId`                                                                       | **yes for migrate-page / design-clone; `none` FORBIDDEN there**                                                                                                      | url → a real `http(s)://…`; figma → contains `:`; new-feature may be `none` only if it has no visual target                |
| 8   | **target route**        | the `src/routes/…` path, e.g. `/employer/talent/search`                                                                                   | yes                                                                                                                                                                  | starts with `/`                                                                                                            |
| 9   | **role**                | employer / jobseeker / guest / shared / otp                                                                                               | yes                                                                                                                                                                  | one of the five                                                                                                            |
| 10  | **API domain**          | `src/api/<domain>`                                                                                                                        | yes (or `none`)                                                                                                                                                      | non-empty or explicit `none`                                                                                               |
| 11  | **endpoint URL(s)**     | the URL(s) the page calls — URL only, you discover the shape                                                                              | yes (or `none`)                                                                                                                                                      | at least one URL, or explicit `none` (an empty list must be a decision)                                                    |
| 12  | **base branch**         | default `develop`                                                                                                                         | yes                                                                                                                                                                  | non-empty (offer `develop`)                                                                                                |
| 13  | **acceptance criteria** | ≥1 testable AC                                                                                                                            | **yes, hard-fail**                                                                                                                                                   | at least one; reject placeholder text (`TODO`/`TBD`/`FIXME`/`n/a`)                                                         |
| 14  | **notes to remember**   | future conventions / gotchas                                                                                                              | yes (or `none`)                                                                                                                                                      | non-empty or explicit `none`; if given, ask whether to append to `.claude/team-notes.md`                                   |

**Why the legacy route path is asked in EVERY case (field 4):** when you give the route in the old
repo, it is how the pipeline **finds the original source and extracts the route's FEATURE SPEC —
its purpose and its core functionalities** — to migrate/revamp it faithfully. Without it, the
legacy-decompiler would sweep the whole `../forasna` app to find the feature (slow, token-heavy,
and it may miss parts). So: **always ask for it whenever the route exists in the old repo, in every
case.** The only run with no legacy path is a genuinely net-new feature that has no old-repo origin
at all — and there you confirm that explicitly (`none`) rather than skipping the question.

---

## STEP C — DoR HARD-FAILS (→ N2 human, STOP, no node runs)

The run **cannot start** if any of these is true. Do not proceed, do not seed a partial run:

- **No real acceptance criteria** (field 13 empty or placeholder).
- **No resolvable design source** for migrate-page / design-clone — `design_source.type = "none"`
  is FORBIDDEN for these surfaces; without a source of truth the UI/UX axis can never be scored.
- **No legacy route path** on any run that HAS a legacy origin (every migrate-page case, and any
  design-clone/new-feature that revamps an existing route) — without it the decompiler cannot locate
  the original source and must sweep the whole `../forasna` repo (the biggest token sink there is).
  A net-new feature with no old-repo origin is the only exception, and that must be an explicit
  `none`, confirmed with the human — never an unanswered field.

If any hard-fail: tell the human exactly what's missing and ask for it. Nothing else runs.

---

## STEP D — Case detection (only when field 6 = `auto`)

Read INSIDE the legacy path folder (never a repo-wide sweep) and match signals:

- `$_SESSION` / `{include file="(header|nav|footer)"}` → **case5** (shell/auth; runs once, globally)
- `jqGrid` / `typeahead` / `datepicker` / `image-picker` / `.append(` / `.html(` → **case6**
- `$.ajax` / `$.get` / `$.post` → **case3**
- inline SQL (`->query(`, `SELECT … FROM`, `new PDO`) with no REST endpoint → **case4** (MSW)
- pure `.tpl`, none of the above → **case2**
- feature shipped in PHP first → **case1**

Most pages match 2+. Compose in dep order **case5 → case2/case6 → case3/case4**, present the set
with the strongest as **(recommended)**, and confirm. A user-declared case that diverges from the
signals is **never silently overridden** — it becomes a question in the STEP 2d clarification round.

**The case only picks the BUILD path — it NEVER reduces Phase-A extraction.**

---

## STEP E — Set the run's baselines

- **UI/UX baseline** (`fidelity.compare_against`): design-clone / Figma intake / faithful port →
  the captured source, **≥0.98 gating**. A human-declared **redesign** → gated ≥0.98 against the NEW
  design-truth artifact, legacy diff report-only. Report-only never means "skip UI verification".
- **Scope may not silently shrink.** If the source has N pages/cards/links, intake proposes ALL of
  them; any reduction is a human-confirmed `waived`.

---

## STEP F — Completeness gate (before writing anything)

Confirm you hold a real answer for EVERY required field in STEP B (each either a value or an
explicit `none` where allowed). If any is still missing, go back and re-ask it. **Do not seed an
incomplete run** — this is the same guarantee the script's `requireComplete()` gives, done by
reading.

---

## STEP G — Seed run-state (phase = "Intake", ACs frozen)

Write `docs/migrations/<id>/run-state.json` (schema `./run-state.schema.json`) and `intake.md`.
`<id>` = `<NN>-<slug>` where `<NN>` is the next zero-padded number in `docs/migrations/`.

Minimum shape (fields you asked for, mapped to the schema):

```jsonc
{
    "id": "<NN>-<slug>",
    "surface": "migrate-page",
    "case": "<id | ordered array | null>",
    "task": "<frozen>",
    "acceptance_criteria": ["<real AC>", "..."],
    "legacy_source": { "path": "<legacy path folder>", "route": "<legacy route>" },
    "target": { "route": "<src/routes path>", "role": "<role>", "domain": "<domain, if any>" },
    "design_source": { "type": "url|figma", "ref": "<url | fileKey:nodeId>", "captured_live": false },
    "extraction_contract": {
        "full_extraction_required": true,
        "note": "a declared case picks the BUILD path only; Phase A extraction is always complete",
    },
    "phase": "Intake",
    "branch": "<feat|revamp>/<NN>-<slug>",
    "endpoints": [{ "endpoint": "<url>", "state": "proposed" }],
    "tooling_absent": [],
    "open_questions": [],
    "retry_counters": { "verify": 0, "qa": 0, "review": 0, "a11y": 0, "security": 0, "integration": 0 },
    "gates": { "A": "pending", "plan": "pending", "B": "pending", "C": "pending", "human": "pending" },
    "last_node": "intake",
    "next": "discovery + legacy-decompiler + design-fetcher (parallel)",
}
```

Then continue the pipeline at **STEP 1** of `skill.md`. Route by surface: `new-feature` also loads
`skills/spec-new-feature`; `design-clone` runs Phase A + B + the fidelity loop (no Phase C);
`migrate-page` runs the full graph.
