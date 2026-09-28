# Migration track — stack-agnostic

The original migrate-feature rigor, for ANY language and ANY source → target (same or different language, e.g.
PHP → TypeScript, Java → Kotlin, ObjC → Swift, Python 2 → 3, AngularJS → React, monolith → services): legacy web (PHP/Smarty, JSP, ASP.NET WebForms,
Rails/Django templates, jQuery, AngularJS, Backbone), mobile (native iOS/Android → React Native, RN class → hooks,
old navigation → new), backend (monolith → service, framework A → B, REST v1 → v2, ORM/DB schema changes).
`examples/forasna/` is the complete original, kept as the worked reference for PHP/Smarty/jQuery → TanStack Start.

## Fixed rules (never relaxed)
1. Full graph always; mode = full. No "simple/static/small" shortcut skips capture, inventory, the comparison gate,
   any coverage node, route/flow integrity or the axes. Cost may lower a model tier only.
2. A declared pattern picks the BUILD path only; extraction is always complete (behavior spec, functionality
   inventory, design capture for UI, design-system inventory).
3. Read scope: `legacy_source.path` inside `Migration.legacy_path` (read-only, never edited). Widening is recorded.
4. Axes, each ≥98%, separately: functionality · logic · structure · **parity** — UI fidelity for web/mobile
   (both sides rendered), or contract/behavior parity for backend (same inputs → same outputs/side effects against
   the legacy system, recorded).
5. Shared modules migrate once, then are imported; cross-run conflict → STOP.
6. Three human stops: clarification round (N2) → PLAN GATE → FINAL GATE (N13). Plus the git gates in `../git-workflow.md`.
7b. **Old ↔ new mapping is mandatory** (`mapping.md`): every legacy item has a row pointing to its new location
   with status and evidence; the FINAL GATE requires no pending rows.
7. Cutover is incremental (strangler fig): route/flag/traffic moved per unit, lowest environment first,
   production after sign-off; rollback = code revert + cutover removal together.

UI in a migration is built with the target project's design system (`../design-system.md`); legacy styles are
mapped to its components and tokens, never copied.

## Token plan for migrations (rigor unchanged, fewer tokens)
Migrations use the **migration budget** in `../token-budget.md` §2b: one extraction pass (source-analyzer and
migration-lead `scope`+`cases`+`inventory-audit`+`mapping` merged into a single migration-lead dispatch), a
graphify index scoped to the legacy path, scripted style diffs (`setup/style-diff.mjs`) so visual-verifier only
interprets mismatches, one discovery round limited to intentional changes, per-section ticket batching, and
security/a11y/integration once at the end. The four ≥98% axes, the mapping and the gates are the same.

## Intake (in addition to ../intake.md)
legacy repo/path (verified) · legacy route/screen/endpoint · target placement · design source (mandatory for UI:
Figma or the live legacy app) · parity baseline (faithful port vs approved redesign) · cutover mechanism
(ingress paths, feature flag, app release/remote config, API gateway route, DB dual-write) · shared modules known.

## Graph
Phase A in parallel: discovery (target) ∥ source-analyzer (legacy, scoped) ∥ design-fetcher (UI) →
migration-lead `scope` + `cases` + `inventory-audit` + `shared-modules` → blueprint → migration-lead `mapping`
(seed MAPPING.md) → ONE clarification round →
planner → PLAN GATE → branch → Phase B (UI/units per plan) → Phase C (data/endpoint slices: schema → mapper →
data layer → container swap → integration test) → per ticket: qa test-plan → implementer → code-reviewer ∥ qa-tester →
visual-verifier or parity check → root-cause loop on any blocking → `ax commit` → migration-lead `mapping` update → security ∥ a11y → integration-tester
(route/deep-link/contract integrity vs legacy) → migration-lead `cutover` → deploy-cutover (lowest env) →
FINAL GATE → PR loop → merge → production cutover after human sign-off.

## Migration patterns → ../migration-patterns.md
P1 shell/auth first · P2 static · P3 dynamic over existing endpoints · P4 logic embedded with no API ·
P5 imperative → declarative · P6 parallel implementation · plus:
- **P7 data/schema**: expand → migrate/backfill → dual-read/write → contract; every step reversible and tested.
- **P8 API version**: new version beside old, consumers listed and moved, deprecation window, old removed last.
- **P9 platform**: native screen/module → RN (or reverse): bridge boundary defined first, parity per device.

## Signals (migration-lead `cases`, read inside scope only)
| Signal | Pattern |
|---|---|
| layout includes, session/cookie guards, global middleware, app-root navigator | P1 |
| templates/views with no data calls or state | P2 |
| AJAX/fetch/form posts/HTTP clients to existing endpoints | P3 |
| SQL/ORM/business logic inside views/controllers with no API | P4 |
| jQuery plugins, DOM mutation, AngularJS $scope/watchers, imperative native views, callback chains | P5 |
| feature exists in legacy and is still being changed there | P6 |
| schema/ORM model changes, column renames, backfills | P7 |
| versioned routes, breaking response changes | P8 |
| Swift/ObjC/Kotlin/Java UI or native modules being replaced | P9 |
| language/runtime change (Py2→3, Java→Kotlin, JS→TS, framework major upgrade) | P5 or P6, plus a codemod plan |

Compose in dependency order P1 → P2/P5/P9 → P3/P4 → P7/P8; confirm with the user; never silently override a
declared pattern.
