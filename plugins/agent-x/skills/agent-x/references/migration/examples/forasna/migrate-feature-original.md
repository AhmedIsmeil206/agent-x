---
name: migrate-feature
description: >-
  THE single entry point. Invoke this one skill and it runs the entire pipeline end to end for any
  surface — migrate a legacy page, build a new feature spec-first, or clone a design. Given only a
  URL or a spec it finishes the whole migration: intake → Phase A (design-truth capture +
  functionality inventory) → Phase B → Phase C → route-integrity → devops cutover (both envs) → the
  human gate (developer then does git). It owns run-state and every loop cap, and it drives EVERY
  migrated route to ≥98% on FOUR separately-measured axes (UI/UX, code logic, code structure,
  functionality). Trigger on "/migrate-feature", "migrate <page>", "revamp <page>", "build
  <feature>", "clone <page>". You do not run agents by hand — this skill runs them for you.
---

# migrate-feature — one command, whole pipeline

You are the **orchestrator (N0)**. Execute the procedure below top to bottom in one run: dispatch
each subagent with the **Agent tool** (`subagent_type` = agent name), read run-state before and
write it after every node, enforce caps, and stop only at the three human interrupts — **N2**
(clarify), the **PLAN GATE** (approve the plan before Phase B), and **N13** (final gate).

**You route and gate; you do not re-do the nodes' work.** Each agent file carries its own procedure
and refusal rules — dispatch it, then check its report against the gate here. Do not restate an
agent's checklist in its prompt; paste only its inputs (below, §Dispatch payload).

## Success bar — FOUR axes, each ≥98%, measured and reported SEPARATELY (never averaged)

| Axis | Measured by | Evidence required to pass |
|---|---|---|
| **UI/UX** | `visual-verifier` | both-sides-rendered diff table, per element × state × breakpoint, RTL |
| **Code logic** | `qa-tester` + `code-reviewer` | tests exercising every inventory branch |
| **Code structure** | `code-reviewer` | conformance checklist (split, triad, placement, zero naming violations, SEO/SSR head parity) |
| **Functionality** | `qa-tester` + `integration-tester` | in-browser drive log / nav + network evidence per item |

Axes are **AND, not OR**. 99% UI with one dead link is NOT done. A run closes only when every page
clears all four, or the human explicitly waives a shortfall at N13. Scores live in
`fidelity.axes`; present them unaveraged.

## Non-negotiables

1. **Run-state is the spine.** You own `docs/migrations/<id>/run-state.json` (schema
   `./run-state.schema.json`). No subagent writes it. **No run-state → no run:** a run without it is
   invalid and passes no gate.
2. **Single writer.** Only `react-synthesizer` edits code. Before each dispatch write its intended
   files to `locked_paths` and grep other `docs/migrations/*/run-state.json` in a live phase for
   overlap → any overlap **STOPS** to a human decision.
2a. **Shared modules migrate ONCE, then are reused (§2e).** A legacy model/service/util/partial used
   by 2+ pages is migrated to ONE shared frontend home by the first run that touches it, recorded in
   `shared_modules`, and every later run **imports it, never re-migrates it**. Before building
   anything that consumes a shared module, reconcile `shared_modules` across ALL runs: another run
   with the same id `migrating` **STOPS** this run to a human decision (cross-run lock, like
   `locked_paths`); an id already `migrated`/`reused` by an earlier run is imported from its
   `frontend_home`, not rebuilt. Re-migrating a shared module — duplicating a model/util the repo
   already has — is a BLOCKING code-structure finding.
3. `../forasna` is **read-only** for every node.
4. **Caps:** graph back-edges 3 → N13. Node inner loops 2. Human-gate "changes" 2. **Never a silent
   extra attempt.** Counters reset to 0 at the start of each PLAN phase.
5. **Coverage nodes report and exit** — they never retry toward a verdict. A FAIL→PASS inside one
   invocation is rejected and re-dispatched.
6. **Scope frozen at intake** from the functionality inventory. New asks = new run. Dropped items
   require an explicit human `waived` + reason.
6a. **Clarify up front, once.** Intake is answered in full (nothing skipped), and every remaining
   unknown is batched into ONE clarification round in Phase A **before the planner runs** (§2d).
   Probe first; ask only real decisions; never trickle questions during the build.
6b. **The PLAN GATE is a hard human stop.** After the planner, present the plan (phases · tasks ·
   per-phase agentic loop + goal · design-system reuse + additions) in chat and **STOP**; Phase B
   MUST NOT begin until the human returns "approved". Their add/consider/edit/remove asks loop back
   to the planner first.
7. **No fabricated metrics.** Reject on sight any pass/score claim with no tool artifact behind it
   (rendered diff, computed-style table, nav/curl check, test run). Unmeasured is reported as
   **unmeasured**, never as a pass.
8. **The engine never runs git** — no branch/commit/push/PR. The developer does all git after N13.
9. **NO ESCAPE HATCH.** There is no "simple / static / small / cost" path that skips the design
   capture, the inventory, the design-comparison gate, any coverage node, route-integrity, or the
   four-axis bar. If you catch yourself reasoning "this page is simple enough that…", **STOP — that
   reasoning is forbidden and the node runs anyway.** Cost discipline may lower a node's *model
   tier* only (§Tiers). The only work outside this bar is a trivial one-line non-migration edit,
   which never enters this skill at all.
10. **A DECLARED CASE NEVER REDUCES EXTRACTION.** "It's static" / "it's just case2" selects the
    **build** workflow only. Phase A extraction is **always complete and identical**: the full JSON
    spec, the full functionality inventory, the full design capture, AND the design-system
    inventory. **You MUST NOT let a declared case shrink what gets extracted into JSON** — under-
    extraction here is unrecoverable downstream. (§STEP 2.)
11. **Token economy** (`rules/token-economy.md`): grep-then-read-range, reuse upstream `file:line`,
    query `graphify-out/` for corpus questions. Reject a node report that pasted whole files.

## Dispatch payload (paste ONLY this into each subagent prompt)

Frozen task + ACs · the run-state slice it needs · the files it may read but MUST NOT modify · its
effort tier from `rules/effort-policy.md` · and for browser/build nodes: `dev_url`, `design_source`,
and the **design facts design-fetcher returned — the computed-style manifest + interactive-state
matrix + design-system inventory, pasted INLINE from your session** (they live in your context, not
in a repo folder). Nothing else — blank-context agents know only what you paste, and their own file
already carries their procedure.

---

# EXECUTION

## STEP 0a — Preflight
- **Browser capture reachable?** No Chrome DevTools MCP → `tooling_absent` + **STOP at N13**: UI/UX
  cannot be honestly measured without rendering. This is the one tooling STOP.
- **Figma intake without `FIGMA_API_KEY`** → `tooling_absent` + **STOP** (same reason).
- **`graphify` / `msw` WARN and offer an install; they MUST NEVER abort.** Record in
  `tooling_absent`, proceed (msw → the mock branch, STEP 4). The engine never edits `package.json`.
- `Agent(subagent_type="doc-writer")` in intake mode → relevant `.claude/team-notes.md` items; fold
  into the planner's prompt.

## STEP 0 — Intake (blocking precondition; freezes scope) — run the INTAKE WORKFLOW
**Intake is a MARKDOWN WORKFLOW you execute by asking in chat, not a script.** Open
`./intake-workflow.md` and follow it top to bottom — it is the authoritative intake and it is
built so **nothing can be skipped** (every field is asked; "no value" must be an explicit `none`;
a completeness gate blocks a partial run; DoR hard-fails STOP the run). If a run was already
seeded (its `docs/migrations/<id>/{run-state.json,intake.md}` exist), read them and continue instead
of re-asking. Otherwise run the workflow now.

The workflow ends by seeding `docs/migrations/<id>/{run-state.json,intake.md}` with
`phase = "Intake"` and ACs frozen, then hands back here at STEP 1. Its guarantees you rely on
downstream: `design_source` frozen (never `none` for migrate-page/design-clone), `legacy_source.path`
frozen as the read scope, the UI/UX baseline set, and scope not silently shrunk. **When the route
has a legacy origin, `legacy_source.path` is always captured — that is how Phase A locates the
original source and extracts the route's FEATURE SPEC (purpose + core functionalities).**

## STEP 1 — no git. Keep a *suggested* `branch` in run-state; never act on it.

## STEP 2 — PHASE A (read-only, parallel) — produces the frozen artifacts
Optional: build a `graphify-out/` index once over the legacy subtree if it's large.

Dispatch in parallel (one message):
`discovery` · `legacy-decompiler` (reads `legacy_source.path` → the route's FEATURE SPEC: purpose +
core functionalities + the functionality inventory; skip only for a truly net-new feature, where the
planner writes the spec) · `design-fetcher`.
**Paste `legacy_source.path` into every legacy-reading node — all their greps start inside it.**
Widening beyond it is allowed only for a proven shared dependency and MUST be recorded in
`legacy_source.out_of_scope_reads`; a repo-wide legacy sweep is forbidden.

**Extraction is ALWAYS complete — the declared case does not reduce it (§Non-negotiable 10).**
Phase A must produce ALL of:
- **2a `design_capture` + `interactive_state_matrix`** — a **RENDERED** capture (never a read of
  `.tpl`/markup): all three breakpoints rendered (mobile/tablet/desktop), per-element computed styles
  across the full property set (incl. line-height, letter-spacing, per-side padding/margin,
  box-shadow, icon stroke-width/size), and every state each element can be in (default / hover /
  focus / active / expanded / collapsed / empty / loading / error / disabled / RTL) at each
  breakpoint. **These are SESSION KNOWLEDGE: screenshots and the raw style dump are NOT written to
  the repo — design-fetcher returns the facts as text, you hold them in context and thread them into
  the planner/build/verify prompts. run-state stores only compact proof (`rendered`, `breakpoints`,
  `properties_captured`, the matrix states, the DS inventory).**
- **2b `functionality_inventory`** — EVERY link (with `target` + `target_kind`
  frontend-route|legacy-path|external), control, matrix state, form, endpoint, analytics event, and
  seo head affordance. Each gets a stable `id` + `status`. **Silent narrowing is FORBIDDEN.**
- **2c `design_system_inventory` + `design_system_additions`** — for EVERY visual primitive on the
  source: the legacy widget, the repo primitive it maps to (**reuse first** — the already-implemented
  `src/components`, the `@theme` tokens in `src/styles.css`, `cva` variants), the tokens it resolves
  to, and **what must be verified per state**. **When a color / font / radius / spacing / component
  the source needs is NOT already in the design system AND is reusable, it does NOT get inlined as a
  one-off:** it is added to `design_system_additions` as a GLOBAL token/component to promote into
  `src/styles.css @theme` (or `src/components/shared`), **named per `rules/design-system.md` +
  `skills/files-and-folders-naming-rules`** (e.g. a color ramp `--color-<FAMILY><STOP>`, `--font-*`,
  `--radius-*`, a kebab-case shared component), and only THEN used. A raw value with no token is
  design drift, never a silent inline. Produced **even for a "static" page**.

### STEP 2e — SHARED MODULES (extract-once registry; before pattern-mapper)
Legacy forasna reuses code across pages — a model, a service, a jQuery util, a `.tpl` partial, a
validation rule. Migrating each page's copy independently duplicates and drifts it. So:
- **legacy-decompiler flags candidates by DEFINITION LOCATION (no repo-wide grep):** a symbol this
  route USES whose legacy DEFINITION lives **outside** `legacy_source.path` — especially in a
  common/shared/lib legacy dir or an entity/model dir — is a `shared_modules` `candidate`, with
  `legacy_symbol` (name + `file:line`), `legacy_path`, `kind`, and a **best-effort** `used_by`.
  Proving a second consumer must NOT trigger a legacy sweep: **query `graphify-out/` for the real
  consumer list if it exists**; otherwise flag with the one consumer you can prove and say so — the
  orchestrator confirms whether it's truly shared. The ≥2-consumer bar is a confirmation target, not
  a precondition for flagging.
- **Reconcile across ALL runs (you, the orchestrator):** grep every `docs/migrations/*/run-state.json`
  `shared_modules` for the same `legacy_symbol`.
  - Already `migrated`/`reused` by an earlier run → set THIS run's entry `status: "reused"` +
    `owning_run`. **CONTRACT-CHECK before importing:** pattern-mapper confirms the existing
    `frontend_home` actually exposes what THIS consumer needs (fields/methods/props vs
    `migrated_fields`). Fits → import it, no rebuild. **Doesn't fit → the partial-migration path:**
    `status: "extended"`, EXTEND the home in place (add the missing field/method), and **re-run the
    shared module's tests + every earlier `used_by` consumer's tests** to prove the extension didn't
    break run A's page. Never fork a second copy — trust the registry to LOCATE it, verify it FITS
    before depending on it.
  - **Drift:** if the shared symbol's live hash ≠ the registry `legacy_sha256` → `status: "drifted"`:
    re-open the shared module's own Phase C AND flag every `used_by` consumer whose behavior could
    shift as **blast radius** at N13. A shared-logic change never lands silently across live pages.
  - Another live run has it `migrating` → **STOP to a human decision** (cross-run lock): which run
    owns it. Never let two runs migrate the same shared symbol.
  - Nobody owns it yet → this run may claim it: `status: "migrating"`, `owning_run: <this id>`,
    stamp `legacy_sha256`; `pattern-mapper` picks the `frontend_home` in an EXISTING repo home
    (shared `src/api/<domain>` triad + a `src/types` type for a model, `src/components/shared` for a
    partial, `src/hooks/use-*` or `src/lib` for logic, a `src/forms/schemas` Zod schema for
    validation, a `src/constants` entry for a constant — named per `files-and-folders-naming-rules`).
    Record `migrated_fields` (what you actually migrated) so a later consumer knows what's present.
- **A shared module is its own phase** in the plan, sequenced **before** the phases that consume it,
  so it exists once and the consumers import it. When it lands, flip `status: "migrated"`.
- **The N13 gate lists every `candidate`/`migrating`/`drifted` shared module still unresolved, and
  the blast radius of any `drifted`/`extended` one** — a shared dependency left half-migrated or
  drifted strands its consumers.

Then `pattern-mapper` → Component Blueprint + the mapping-fidelity checklist +
`design_system_additions` + the `frontend_home` for any shared module this run owns.

Select the case(s) from decompiler signals (§Case signals); a page usually matches 2+ — mix them,
present the set with the top pick **(recommended)**, write `case`. A user-declared case that
diverges from the signals is **never silently overridden** — it becomes a question in the round below.

### STEP 2d — CLARIFY EVERYTHING NOW, IN ONE ROUND (before planning)
Phase A is where unknowns surface. **You MUST resolve them BEFORE the planner runs — never mid-build
and never one question at a time.** After discovery / legacy-decompiler / design-fetcher /
pattern-mapper report, collect EVERY open item into a single list:
- every `"unknown"` the decompiler marked (ambiguous branch, unclear guard, unresolved shape),
- every pattern-mapper open question (which primitive, reuse vs promote, a mapping with no obvious
  equivalent),
- a declared case that diverges from the detected signals,
- every ambiguity in the ACs or the frozen scope,
- anything where two readings would produce materially different work.

**Probe before you ask** (§Endpoints; grep the legacy path; check the repo) — only genuinely
human decisions reach the human. Then ask them **all at once** in ONE `AskUserQuestion`, each with
your recommended default and the consequence of each choice. Record answers in `open_questions`.

**Do NOT start the planner while a blocking unknown is unanswered** — a plan built on a guess is a
plan that gets rebuilt. If an answer is genuinely cheap to reverse, state the assumption explicitly
in the plan instead of stalling; if it is expensive to reverse, it blocks.

Only then `planner` → `PLAN.md`: smallest independently buildable+testable phases, **every inventory
item mapped to a phase or acceptance check**, each phase carrying its own build→coverage→gate and
the four-axis exit condition for its slice.

**REFUSE to seal Gate A** unless: `design_capture.rendered === true`; ≥3 breakpoints captured; the
full property set present; the matrix covers every reachable state; the inventory is complete; and
`design_system_inventory` exists. A partial capture is a **STOP**, never a "good enough" baseline —
an uncaptured property is one no verifier can diff and the synthesizer will get wrong.
→ `gates.A = "sealed"`. Stamp `legacy_sha256` + `source_sha256`; re-check at Phase C and N13 —
drift re-opens the affected gate.

### STEP 2 → THE PLAN GATE (human interrupt — STOP before Phase B)
After the planner returns, **you MUST present `PLAN.md` in the chat and STOP for the human's
approval — you may NOT start Phase B until they approve.** Present it as:
- **The phases, split into tasks** — each phase with its **goal (tied to that phase's purpose)**, its
  ordered task list, its **agentic loop** (the `build → coverage → gate` cycle + which nodes run +
  the cap), and its four-axis exit condition.
- **Design-system reuse** — the already-implemented components / `@theme` tokens / colors / fonts the
  plan will REUSE (from `design_system_inventory`).
- **Design-system additions** — every `design_system_additions` entry the plan will promote to a
  GLOBAL token/component (name + value + target file), so the human sees what gets added to
  `src/styles.css @theme` / `src/components/shared` before it happens.
- **Shared modules** — every `shared_modules` entry: which this run will MIGRATE ONCE (its
  `frontend_home` + the phase that builds it, before its consumers) and which it will REUSE from an
  earlier run's home (with `owning_run`). The human sees no shared model gets duplicated.
Then ask directly: **continue, or add / consider / edit / remove anything?**
- **"continue / approved"** → set `gates.plan = "approved"`, mark approved `design_system_additions`,
  set `phase = "B"`, proceed.
- **"add / consider / edit / remove …"** → set `gates.plan = "changes"`, loop back to `planner` with
  the human's asks (this is the planner's correction loop, inner cap 2), re-present. **No silent
  Phase B start.** `phase` stays at `A` until approval.

## STEP 3 — PHASE B (starts ONLY after `gates.plan = "approved"`; per PLAN phase, dep order; reset counters at each phase start)
1. `react-synthesizer` builds ONLY this phase's files, to the captured numbers and tokens. Its own
   eslint/tsc/test failures are its inner loop (cap 2); still red → back-edge, increment `verify`.
   **Start the dev server once, here** (`npm run dev` in background), record `dev_url`, and pass it
   to every browser node — they have no Bash. One server per run; stop it after N13.
2. In parallel, the coverage nodes this phase names:
   - **`visual-verifier` — THE DESIGN-COMPARISON GATE (UI/UX axis).** It MUST render **BOTH** sides:
     Side A = `design_source` (Figma node via Figma MCP, else the production/legacy URL captured
     **live**), Side B = the implementation at `dev_url` — and diff per element × state ×
     breakpoint, RTL included, with icon weight, per-side padding/margin, colors, line-heights and
     spacing as explicitly diffed properties. ≥0.98 **GATES** whenever a design target exists; a miss
     opens a back-edge (cap 3). **REJECT a report with `both_sides_rendered: false`** — that is not a
     score. → `design_comparison`.
   - **`code-reviewer`** — scores the **code-logic** AND **code-structure** axes separately (each
     ≥0.98); runs `files-and-folders-naming-rules` over new/renamed files (any violation is
     BLOCKING); verifies the design-system mapping checklist, SEO/SSR head parity, and no `__dev__`
     scaffolding.
   - **`a11y-auditor`** · **`security-auditor`**.
3. Any FAIL/BLOCKING → back to `react-synthesizer` for THIS phase with the specific findings;
   increment the matching counter; **at 3 → N13**.
4. **Phase exit:** tests green · eslint+tsc clean · UI/UX ≥0.98 with **every** state × breakpoint
   exercised (an unexercised state is an automatic FAIL) · code-logic branches covered ·
   code-structure ≥0.98 with zero naming violations · every `seo` item in the slice satisfied.
→ `gates.B = "passed"`, `phase = "C"` (design-clone → STEP 5).

## STEP 4 — PHASE C (per endpoint) — functionality axis
`pattern-mapper` (DTO → view-model plan) → `react-synthesizer` (the `src/api/<domain>` triad +
hooks + the **1-line container swap**, presenter untouched) → in parallel `qa-tester` +
`integration-tester` + `security-auditor`. FAIL → synthesizer, cap 3 → N13.
Every `analytics` inventory item gets a `track()` parity assertion; one left `todo` blocks Gate C.
**A missing endpoint NEVER aborts:** build via MSW mock with the shape inferred from the legacy
success handler and **labeled `inferred`**, mark it `mocked`, record it in `backend-asks.md`, keep
going; re-raise every mock at N13.
→ `gates.C = "passed"` on fetcher wired (or mocked+recorded), mapper tests green, live evidence.

## STEP 4b — ROUTE & NAVIGATION INTEGRITY (coverage node, before devops)
`integration-tester` in route-integrity mode over **every href in the inventory**: does it resolve ·
frontend route or legacy path (classified against `src/routes/` + the ingress allowlists in
`devops/helm/forasna-frontend/{testing,production}-values.yaml`) · does it behave on **localhost,
testing AND production**. **Strangler-fig rule:** deployed builds keep cross-app links **RELATIVE**;
only local dev may prefix a legacy path to a reachable origin; **never pin a cross-env link to an env
var absent from the helm values.** → `route_integrity[]` per env.

**Same pass — `route_completeness[]`:** every in-scope legacy route must have a matching frontend
route, in the **correct group** (`_private`/`_guest`/`_public` matching the legacy auth posture — a
`$_SESSION` page maps to `_private`, never a client-only guard), with head-metadata parity. Missing,
mis-grouped, or head-parity-less = `todo` and **blocks N13**. Failures → synthesizer (cap 3).

## STEP 5 — DevOps cutover, BOTH envs (file edits only) — part of "done"
`devops-env-swapper` appends the route regex to **testing-values.yaml (APPLIED →
`devops_cutover.testing = "applied"`)** AND **production-values.yaml in the SAME diff (PREPARED, its
own commit, marked "apply on human sign-off AND with/after the production code deploy" →
`devops_cutover.production = "prepared"`)**. Editing only testing is **INCOMPLETE**. **You MUST list
every env still `missing` at N13 as an OPEN BLOCKER.** Ordering guardrail: the prod path goes live
only WITH/AFTER the code deploy — never before, or the URL 404/500s into a split-brain. Rollback =
revert the code PR AND remove the path block from BOTH values files, then redeploy.

## STEP 6 — Docs
`doc-writer` updates `docs/migrations/<id>` + regenerates STATUS; you commit run-state `next`.

## STEP 7 — N13 HUMAN GATE — STOP and present the honest ledger
Every claim carries its tool artifact:
- **The route's feature spec** (`route_feature_spec`) — its purpose and **every core functionality**,
  each confirmed present in the migrated route (or explicitly waived). A dropped core functionality
  is a failed migration, not a detail.
- **The functionality inventory**, each item `✅ done` or `✍️ waived` — **REFUSE to report the run
  as done while any item is neither.**
- **The four scores, unaveraged**, each with its evidence and the ≥98% bar; flag any axis below it.
- **The design-comparison record** — which source was rendered, **proof both sides were rendered**,
  the per-property diff. `both_sides_rendered != true` → the run is NOT presentable as done.
- **Interactive-state coverage** (all states × breakpoints, each result) · **route-integrity per
  env** · **route-completeness** · **devops paths per env**, any missing env as an open blocker.
- **Shared modules** — each migrated to ONE home (or reused from an earlier run); any still
  `candidate`/`migrating` is an OPEN BLOCKER (a half-migrated shared dependency strands consumers).
- **Mandatory endpoint re-ask:** list every `proposed`/`mocked` endpoint with its assumed shape and
  provenance and ask whether the real one landed. Yes → MSW off, re-run the DTO check, mark `wired`,
  re-run affected coverage. No → they explicitly acknowledge it ships on mock data. **Never mark an
  endpoint `wired` that was only ever mocked.**

Then: **approved** → `devops-env-swapper` sets `production_cutover = true`; engine done at
`phase = "Devops"`; the developer does all git. · **changes** → loop to synthesizer,
`human_gate_retries` **cap 2**, then `Parked` or `Descoped`. · **reject** → `Parked`, doc-writer
closes the LOG, leave the working tree alone. · An ask exceeding the frozen slice becomes a NEW run
(`Descoped`); the in-slice work still ships. `Merged`/`Reverted` are developer-set only.

---

## Case signals (auto-pick; a case selects the BUILD path, never the extraction depth)
legacy PHP first → **case1** · pure `.tpl`, no `$.ajax`/state → **case2** · `$.ajax` + known route →
**case3** · inline SQL/logic, no REST → **case4** (MSW) · `header/nav.tpl`, `$_SESSION` shell →
**case5** (run once, globally) · jqGrid / typeahead / datepicker / DOM manip → **case6**.
Compose a mix in dep order **case5 (shell/auth) → case2/6 (UI) → case3/4 (data)**. Read each chosen
`skills/case<N>/skill.md` and follow it through B/C.

## Loop taxonomy
Correction (discovery, decompiler, planner, mapper, synthesizer, doc-writer): iterate own gaps,
inner cap 2. Coverage (verifier, audits, reviewers, integration): check once, report, exit, never
retry a verdict. Graph back-edges (→ synthesizer): yours, cap 3 → N13, reset per PLAN phase.
Caps compound: 2 × 3 = 6 attempts max on any one thing. **Loop record first in every node report** —
a report without one is rejected. Terminal: `Devops` (engine done), `Parked`, `Descoped`.

## Endpoint discovery (the developer gives the URL; YOU find the shape)
Never ask what JSON an endpoint returns. First hit wins: `../forasna/api-docs/` → the PHP
controller's response construction → a real authenticated call against testing → infer from the
legacy jQuery success handler + MSW `inferred`. Save every shape under `docs/migrations/<id>/api/`
**with its provenance**; the mapper's tests bind to it, so an inferred shape MUST be labeled.

## Model tiers (cost discipline may lower the tier, never skip a node)
haiku: discovery, legacy-decompiler, doc-writer · sonnet: design-fetcher, pattern-mapper,
integration-tester, devops-env-swapper, a11y-auditor · opus: planner, react-synthesizer,
visual-verifier, qa-tester, code-reviewer, security-auditor.
Effort follows the model (HIGH=opus, MEDIUM=sonnet/haiku) — paste the tier's contract from
`rules/effort-policy.md` into every dispatch.
