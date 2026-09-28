# Migration patterns (generalized from the six Forasna cases)

Detect signals inside the source path only. Most migrations match several; compose in the order listed.
A declared pattern picks the BUILD path; it never reduces what source-analyzer extracts.

## P1 — Shell / auth first (run once per app)
Signals: shared layout includes (header/nav/footer), session/cookie guards, global middleware.
Web: shared layout components + route-group guards (server-side, not client-only).
Mobile: navigation root + auth stack/app stack split, secure token storage.
Backend: auth middleware/guards, session → token strategy, same authorization semantics.

## P2 — Static / presentational
Signals: templates with no data calls and no state. Straight markup → component translation, no data
layer. SEO/meta parity still required on web.

## P3 — Dynamic over existing endpoints
Signals: AJAX/fetch/form posts to existing routes with undocumented shapes. Discover real responses
(curl/HAR/logs), write schemas (Zod/pydantic/etc.) at the boundary, build the profile's data layer.

## P4 — Logic embedded in the view/controller, no API
Signals: inline SQL or business logic before render. Isolate the logic, propose an API contract, mock it
(MSW on web/RN, fixtures on backend), build against the mock; the backend implementation is its own run
or phase with contract tests.

## P5 — Imperative → declarative
Signals: jQuery plugins, manual DOM mutation, imperative native view code, callback pyramids.
Replace with declarative state + the profile's component equivalents; each replaced widget verified in
every state it has.

## P6 — Parallel implementation (new feature shipped in legacy first)
Spec-first: freeze the behavior spec, implement in the new stack, keep a parity checklist until cutover.

## Shared modules
A model/service/util used by 2+ migrated units is migrated ONCE to a shared home, recorded in
`shared_modules`, and imported by later runs. Re-migrating one is a blocking structure finding.

## Cutover and rollback
If `project.md` defines a cutover (ingress paths, feature flags, app release tracks), deploy-cutover
proposes the edit for the lowest environment first; production only after human sign-off. Rollback =
revert the code change AND the cutover edit together.
