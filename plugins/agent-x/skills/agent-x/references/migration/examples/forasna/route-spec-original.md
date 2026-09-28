---
name: route-spec
description: >-
  Generate a comprehensive, migration-ready SPEC for a single route/page WITHOUT building anything.
  Give it a route (the legacy URL/folder and/or the target frontend route) and it produces
  docs/route-specs/<slug>.spec.md — a sharp spec doc covering the design link, the route's purpose +
  core functionalities, the full UI/UX + interactive-state inventory, the code logic (branches,
  guards, state transitions), every functionality (links/controls/forms/endpoints/analytics/seo),
  related pages, shared modules reused across the app, endpoints + their discovered shapes, risks,
  and seed acceptance criteria. It is READ-ONLY (writes only the spec .md) and its output PRE-SEEDS
  /migrate-feature so a migration can start from the spec with no re-extraction. Trigger on
  "spec this route", "write a spec for <page>", "route spec", "generate a migration spec",
  "/route-spec".
---

# route-spec — one route in, one migration-ready spec out

You produce a **specification**, not code and not a migration. You read the legacy source and the
live design, reuse the migrate-feature **read-only extraction agents** to gather facts, and compose
them into ONE markdown spec another engineer (or `/migrate-feature`) can build from without re-doing
the reconnaissance.

**What you write:** exactly one file — `docs/route-specs/<slug>.spec.md`. Nothing else. No `src/`
edits, no `run-state.json`, no branch/commit. You are the front-of-pipeline: the spec you write is
the input a later `/migrate-feature` run reads instead of re-extracting.

## Non-negotiables

1. **Read-only.** `../forasna` is read-only; `src/` is not touched. The ONLY file you create is the
   spec `.md`. You never run git.
2. **Reuse the extraction agents — don't hand-roll extraction.** The facts come from the same
   read-only nodes `/migrate-feature` Phase A uses, so the spec and any later migration share one
   source of truth and never diverge: `discovery` (frontend placement + reuse map), `legacy-decompiler`
   (purpose, core functionalities, functionality inventory, shared-module flags, endpoints, branches),
   `design-fetcher` (the live/Figma design capture + interactive-state matrix + design-system
   inventory). Dispatch them with the **Agent tool**; you compose their reports.
3. **Scoped legacy reads.** Every legacy read starts inside the route's legacy path (§Inputs); a
   repo-wide sweep of `../forasna` is forbidden (`rules/token-economy.md`). Widening beyond the path
   for a proven shared dependency is allowed and is recorded in the spec's Shared-modules section.
4. **No fabricated facts.** Every claim in the spec traces to a tool result — a `file:line`, a
   rendered capture, a discovered endpoint shape. A design link you couldn't open, an endpoint shape
   you couldn't find, a state you couldn't reach → say so in the spec as an OPEN QUESTION, never
   invent it. "Looks like" is not a spec.
5. **Completeness over brevity.** The spec's job is to lose nothing. List EVERY link, control, form,
   endpoint, state, analytics event, and SEO affordance — never "and similar". An under-listed spec
   silently narrows a future migration's scope.
6. **Design source is mandatory for a visual route.** If the route has a UI, the spec MUST carry a
   real design link (a Figma node ref, or the live production/legacy URL that was actually rendered)
   and the capture facts. A spec with no rendered design source for a visual page is incomplete —
   flag it as a blocker, don't ship it.

## Inputs (ask once, in one message, if not given)

- **slug** — kebab-case, e.g. `talent-search` (names the spec file).
- **legacy route path** — the folder/file in `../forasna` that holds this route (the READ SCOPE),
  e.g. `application/modules/employer/talent`. Verify it exists (Glob) before reading. If the route is
  net-new (no legacy origin), say so explicitly — the spec then leans on the design + your input.
- **legacy route/URL** — the URL this page serves in the old app (or `none`).
- **design source** — a Figma `fileKey:nodeId`, OR a live production/legacy URL to render. Required
  for any visual route.
- **target frontend route** — the intended `src/routes/…` path (or "propose one" → discovery suggests
  it from the role + router grammar).
- **role** — employer / jobseeker / guest / shared / otp (or let discovery infer from the legacy
  `assets/js/<role>` correspondence).

If the route was already spec'd (`docs/route-specs/<slug>.spec.md` exists), read it and ask whether
to refresh it (re-run extraction) or edit in place.

## Modes & shapes

- **Full (default).** Renders the design + runs the full extraction agents → a **migration-ready**
  spec whose pre-seed a `/migrate-feature` run can build from. Use this for anything you intend to
  migrate.
- **Quick (`--quick` / "just outline it").** `legacy-decompiler` + `discovery` only, **no design
  render** — a fast scope/triage outline (purpose, core functionalities, functionality inventory,
  shared-module flags, related pages). Clearly stamped **`mode: quick` — NOT migration-ready**: it
  omits the design capture and the interactive-state matrix, so a later migration re-captures those.
  Use it to decide what to migrate and in what order, not to build.
- **One route per spec.** A spec is exactly ONE route — sharp, buildable, one migrate-feature run.
- **A multi-page AREA → an INDEX spec.** For a whole section/sitemap, write
  `docs/route-specs/<area>.index.spec.md` that lists the child routes, the shared modules they have
  in common, and a **suggested migration order** (shared shell/case5 first → shared modules →
  leaf pages), each child linking to its own per-route spec (generate those on demand). Never inline
  five pages into one giant spec, and never let an area spec become a migration input — only its
  per-route children are.
- **Net-new route (no legacy origin).** Supported: skip legacy extraction, build the spec from the
  **design source + the functionalities the user describes + the ACs**, and pre-seed
  `surface: "new-feature"`. Sections 2/5/6 come from the design + the user, section 3 from the
  design, and there is no legacy code-logic to extract — say so explicitly rather than leaving those
  sections empty. (For building it afterwards, `/migrate-feature` routes new-feature through
  `spec-new-feature`.)

## Procedure

1. **Preflight.** Chrome DevTools MCP reachable (needed to render a live design source), or a Figma
   node with `FIGMA_API_KEY`. If neither is available and the route is visual, tell the user the
   design capture can't run and stop — a visual spec with no rendered source is not worth writing.
2. **Dispatch the extraction agents (read-only, parallel).** Paste each its scoped inputs (the legacy
   path, the design source, the target route) and its effort tier from `rules/effort-policy.md`:
   - `Agent(subagent_type="discovery")` — where it lands in `src/`, what to reuse, the triad status,
     the related frontend routes already present.
   - `Agent(subagent_type="legacy-decompiler")` — the route's **purpose + core functionalities**, the
     **functionality inventory** (every link with `target_kind`, control, form, endpoint, analytics,
     seo), branches/guards/params, and **shared-module candidates** (symbols defined outside the
     legacy path, used by ≥2 pages).
   - `Agent(subagent_type="design-fetcher")` — the **rendered** design capture (screenshots at
     mobile/tablet/desktop, per-element computed styles, the interactive-state matrix) and the
     **design-system inventory** (each legacy primitive → the repo primitive it maps to, tokens,
     states to verify).
3. **Resolve endpoint shapes** (don't ask the user for a payload): for each endpoint the decompiler
   found, discover the shape — `../forasna/api-docs/` → the PHP controller's response construction →
   a live authenticated call → infer from the jQuery success handler (labeled `inferred`). Record the
   shape + provenance in the spec. A missing endpoint is noted as a mock-to-build, never a blocker.
4. **Reconcile shared modules across existing runs.** Grep `docs/migrations/*/run-state.json`
   `shared_modules` and `src/` for each candidate: mark it **already-migrated** (name its frontend
   home to reuse) or **to-migrate-once** (propose the shared home by kind). This is what stops a
   later migration from re-migrating a shared model.
5. **Compose the spec** at `docs/route-specs/<slug>.spec.md` using the template below. Fill every
   section; where a fact is unknown, write it under Open Questions with your recommended default.
6. **Emit the pre-seed block** (§Pre-seed) at the end of the spec so `/migrate-feature` intake can
   read it and skip re-extraction.

## The spec template (write ALL of these sections)

```markdown
# Route Spec — <slug>

> Generated by /route-spec on <date>. READ-ONLY analysis; no code was written.
> Feeds /migrate-feature (see Pre-seed at the bottom).

## 1. Identity
- **Target frontend route:** <src/routes/… path> · **role:** <role> · **surface:** migrate-page | new-feature | design-clone
- **Legacy route/URL:** <url or none> · **legacy path (read scope):** <../forasna/…>
- **Detected case(s):** <case1..6 mix, in dep order, with the recommended pick> — build path only, never reduces this spec's depth.

## 2. Purpose & core functionalities  (the reason the route exists)
- **Purpose:** <1–2 sentences, user's POV — from legacy-decompiler>
- **Core functionalities (ranked):** <the things the route actually does; each MUST survive migration>

## 3. Design
- **Design link:** <Figma fileKey:nodeId, OR the live production/legacy URL rendered> — **rendered:** yes/no
- **Breakpoints captured:** mobile / tablet / desktop
- **Key screens/states captured:** <list>
- **Design-system mapping (legacy → repo primitive):** <table: legacy widget | maps_to | reuse/extend/build-new | tokens | states to verify>
- **Design-system ADDITIONS needed (promote to global, not inline):** <color/font/radius/spacing/component, name, value, target file, reused_by>

## 4. UI/UX inventory & interactive-state matrix
- **Elements** (per breakpoint) with the computed-style facts that matter (spacing, color, font, radius, icon weight, layout, direction/RTL).
- **State matrix:** per element, every state it can be in — default / hover / focus / active / expanded / collapsed / empty / loading / error / disabled / RTL — at each breakpoint. This is what a migration must reproduce and verify.

## 5. Code logic
- **Params / inputs:** <query/body/path params + types>
- **Branches:** <every {if}/{foreach} / conditional behavior — e.g. "premium → show X", "empty → show Y">
- **State transitions:** <what changes on each interaction>
- **Auth / session guards:** <$_SESSION[...] → the frontend route group (_private/_guest/_public) + JWT posture>

## 6. Functionality inventory  (the frozen scope contract — nothing dropped)
Every item, with a stable id and target where relevant:
- **Links:** <id · label · target · frontend-route|legacy-path|external>
- **Controls:** <id · label · what it does>
- **Forms:** <id · fields · submit action · validation>
- **Endpoints:** <id · method + URL>
- **Analytics:** <each GA/track() event + payload keys>
- **SEO:** <title, meta description, canonical, lang/dir, OG, JSON-LD the legacy page had>
> Totals per kind, so nothing is silently lost.

## 7. Endpoints & data
Per endpoint: method + URL · **discovered shape + provenance** (api-docs / controller / live / inferred) · state (proposed/mocked/wired) · the JSON:API DTO → view-model mapping notes · the `src/api/<domain>` triad to reuse or create.

## 8. Related pages & features
- **Links out** to other routes (which are already migrated frontend routes, which are still legacy paths).
- **Shared shell / auth** (case5) this route depends on.
- **Cross-route state / navigation** the migration must preserve.
- **Sibling routes** that should be migrated together or in sequence, and why.

## 9. Shared modules  (extract-once — migrate one, reuse everywhere)
Per shared legacy symbol used across pages:
- **id · legacy symbol (file:line) · used_by (the pages that consume it) · kind (model/service/util/validation/partial).**
- **Status:** already migrated (→ reuse from `<frontend home>`) | to migrate once (→ proposed shared home: shared `src/api/<domain>` triad + type / `src/components/shared` / `src/hooks/use-*` / `src/lib` / `src/forms/schemas`).
> These MUST be migrated once and imported, never re-implemented per page.

## 10. Risks & open questions
- <every ambiguity, unresolved shape, unreachable state, reuse-vs-build call> — each with a recommended default and the consequence of each choice. These become the /migrate-feature Phase-A clarification round.

## 11. Acceptance criteria (seed)
- <≥1 testable AC derived from the core functionalities> — the human confirms/edits these at intake.

## 12. Success bar reminder
A migration of this route must hit ≥98% on FOUR separate axes — UI/UX, code logic, code structure, functionality — each measured, never averaged (see /migrate-feature).

---

## Pre-seed for /migrate-feature
```jsonc
{
  "surface": "migrate-page",
  "slug": "<slug>",
  "task": "<one-line>",
  "case": "<id | ordered array | auto>",
  "legacy_source": { "path": "<legacy path>", "route": "<legacy url>" },
  "target": { "route": "<src/routes path>", "role": "<role>", "domain": "<domain|none>" },
  "design_source": { "type": "figma|url", "ref": "<fileKey:nodeId | url>", "captured_live": true },
  "route_feature_spec": { "purpose": "<...>", "core_functionalities": ["..."] },
  "endpoints": [{ "endpoint": "<url>", "state": "proposed|mocked" }],
  "shared_modules": [{ "id": "<...>", "legacy_symbol": "<name file:line>", "used_by": ["..."], "kind": "<...>", "status": "candidate|reused", "owning_run": "<run id if reused>" }],
  "acceptance_criteria": ["<seed AC>"],
  "spec_ref": "docs/route-specs/<slug>.spec.md",
  "generated_at": "<ISO date>",
  "legacy_sha256": "<hash of the legacy files this spec was extracted from>",
  "source_sha256": "<hash of the design source manifest / figma node>",
  "mode": "full | quick"
}
```
```

**Stamp the hashes so drift is detectable.** Compute `legacy_sha256` over the legacy files the
decompiler cited and `source_sha256` over the design capture, and write both into the pre-seed. A
spec is a fast start, **never a substitute for live truth**: when `/migrate-feature` reads the
pre-seed it re-hashes the live source and, on mismatch, WARNS, shows what changed, and re-extracts
the drifted part rather than trusting the stale spec. A `quick` spec (below) is never treated as
migration-ready — intake re-extracts fully from it, using it only to know where to look.

## How /migrate-feature consumes this
When intake sees a `docs/route-specs/<slug>.spec.md` with a Pre-seed block, it reads it as answered
intake fields (surface, case, legacy_source.path, design_source, route_feature_spec, endpoints,
shared_modules, ACs) — the human still CONFIRMS them (and the ACs) at the DoR gate, but nothing is
re-extracted. The spec's functionality inventory + design-system inventory + interactive-state matrix
are re-derived live at Phase A from the SAME agents (captures are session knowledge, not repo files),
but the spec tells them exactly where to look, so Phase A is fast and loses nothing.

## Failure modes (say it, don't fake it)
- **Design source unreachable / not rendered** (visual route): the spec is incomplete — stamp
  `captured_live: false`, flag it as a blocker in §10, and do NOT present it as migration-ready.
- **Legacy path doesn't exist / wrong folder:** stop and re-ask the path; never sweep `../forasna`
  to find it.
- **Endpoint shape unfindable:** record the endpoint as `mocked`/`inferred` in §7 with that note; it
  is a mock-to-build for the migration, never a fabricated shape.
- **A "shared" candidate with only one provable consumer:** keep it flagged but say the evidence is
  one consumer; the migration confirms whether it's truly shared before promoting it.
- **Stale spec on re-run:** offer refresh (re-extract) vs edit-in-place; never silently keep old
  facts under a new date.

## What this skill is NOT
- Not a migration — it never builds, wires, or cuts over. Hand off to `/migrate-feature` for that.
- Not a design tool — it captures and links the existing design; it does not create one.
- Not a shortcut past intake — the human still confirms scope + ACs when the migration starts, and a
  `quick` spec is never treated as migration-ready.
- Not an area builder — an `.index.spec.md` models a multi-page area and orders its migration; only
  its per-route child specs feed a migration run.
