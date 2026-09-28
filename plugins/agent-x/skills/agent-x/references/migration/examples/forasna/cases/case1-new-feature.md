---
name: case1-new-feature
description: >-
  Migration Case 1 — a NEW feature that shipped in legacy forasna (PHP/TPL) first and must be
  ported to forasna-frontend without letting the new repo fall behind. Spec-first dual
  implementation. Trigger when a feature exists/ships in legacy and needs a matching React version.
---

# Case 1 — Spec-first dual implementation

The legacy side already exists (or ships for production immediacy). Port it here in sync.

## Workflow
1. **Interface contract first.** Before porting, generate the shared TS/Zod contract for the
   feature's state + API from the legacy controller's response and the `.tpl` data. Seal it in
   `docs/migrations/<NN>/` (Phase A). This is the anchor both sides agree on.
2. **Read the legacy delivery.** legacy-decompiler reads the fresh PHP controller + `.tpl` + any
   jQuery, emitting the JSON spec (route, params, guards, endpoints, branches, strings).
3. **Port to the frontend.** pattern-mapper → blueprint; react-synthesizer builds:
   - `src/api/<domain>/` triad from the contract (Case 3's hook synthesis if it fetches data);
   - container/presenter under `src/components/<role>` + a route in `src/routes/<group>`;
   - AR strings + RTL, SSR-safe, Zod at boundaries.
4. **Verify + wire + ship** — Phase B (visual/a11y/review) → Phase C (mapper/integration) → devops
   cutover (values-file edit) → human gate → the developer commits/pushes manually.

## Non-negotiable gates (this case does NOT relax them)
- **G2 no escape hatch.** Every required node runs. "The feature is small / already specced / we
  wrote the legacy side" is NEVER a reason to skip capture, the graph, or a coverage node.
- **G3 design-truth first.** No code before a RENDERED capture of the legacy delivery (screenshots
  at mobile+tablet+desktop, full computed-style set, interactive-state matrix). Building from the
  `.tpl` alone is FORBIDDEN.
- **G4 functionality inventory** frozen; the N13 gate REFUSES to close while any item is neither
  `done` nor `waived`.
- **G5 design-comparison gate.** visual-verifier MUST render BOTH sides (Figma node or the live
  legacy/production URL, AND the running implementation) and diff them per element × state ×
  breakpoint; ≥0.98 GATES, a miss opens a back-edge (cap 3).
- **G6** every control driven, every matrix state exercised — an unexercised state is an automatic FAIL.
- **G7** route-integrity on every emitted href across localhost/testing/production.
- **G10** devops cutover spans BOTH envs before "done".

## Notes
- Keep the two implementations behavior-equivalent; divergences are logged as decisions.
- If the legacy feature is still changing, `legacy_sha256` in run-state guards drift: a legacy
  edit re-opens the affected gate so the port doesn't silently diverge.
