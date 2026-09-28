---
name: case3-dynamic-page
description: >-
  Migration Case 3 — a legacy page that fetches via jQuery AJAX / form submit against EXISTING PHP
  routes, but response shapes are often undocumented. Interactive API discovery + TanStack Query
  hook generation. Trigger for dynamic legacy pages with existing endpoints.
---

# Case 3 — API discovery → query-triad synthesis

The endpoints exist; their payload shapes are buried in PHP/jQuery. Discover, confirm, wire.

## Workflow
1. **Endpoint scan.** legacy-decompiler extracts every `$.ajax`/`$.get`/`$.post` URL, HTTP method,
   query/body params, and the success handler's assumed shape from `assets/js/<role>/*.js`, plus
   the PHP route. Mark unknown/ambiguous response shapes as `"unknown"`.
2. **Resolve each `"unknown"` — the developer gave you the URL, you find the shape.** In order,
   first hit wins: (a) grep `../forasna/api-docs/`; (b) read the PHP controller's response
   construction; (c) call the endpoint on **testing** via chrome-devtools as the right role;
   (d) if all fail, infer it from the legacy jQuery success handler's field access and keep going.
   **Never ask the developer what JSON an endpoint returns** — this is a frontend repo and that is
   not their decision. Save the shape under `docs/migrations/<NN>/api/` with its **provenance**
   (docs / controller / live / inferred); an inferred shape must be labeled, because that file is
   what the mapper's tests bind to. If an endpoint **doesn't exist yet**, mock it with MSW and keep
   building — then raise it again at the human gate (below).

3. **Hook synthesis.** react-synthesizer generates the `src/api/<domain>/` triad:
   - `*.query-keys.ts` factory (per `data-access.md`),
   - `*.requests.ts` axios call via `@/api/base` with JSON:API unwrap + Zod parse + DTO→model map,
   - `*.queries.ts` `queryOptions` + `useQuery`/`useMutation` (invalidate via the key factory).
4. **Bind UI.** container consumes the hook; pure `*View` presenter renders; loading/error/empty
   variants from the real states.
5. Verify (visual ≥0.98 across every state × breakpoint + a11y + review) → integration test with
   live/mock evidence → route-integrity on emitted links → devops cutover (BOTH testing + production
   values, prod prepared) → human gate → the developer commits/pushes manually.
6. **At the human gate, ask about the APIs again.** Every endpoint still `proposed`/`mocked` is
   listed with its assumed shape + provenance, and the developer is asked whether the real endpoint
   has landed. If it has: MSW off, re-run the DTO contract check, mark it `wired`, re-run the
   affected coverage nodes. If not: they explicitly acknowledge it ships on mock data. A run never
   closes silently on a mock.

## Non-negotiable gates (this case does NOT relax them)
- **G2** every required node runs; no "simple/cost" skip of capture, the graph, or a coverage node.
- **G3** RENDERED design-truth capture (3 breakpoints, full computed-style set, interactive-state
  matrix) before any code — including the **loading / empty / error** states this page really has.
- **G5 design-comparison gate.** visual-verifier MUST render BOTH sides (the Figma node or the live
  production/legacy URL, AND the running implementation) and diff per element × state × breakpoint;
  ≥0.98 **GATES**, a miss opens a back-edge (cap 3). `both_sides_rendered: false` is a rejected report.
- **G6** every control driven, every matrix state exercised — unexercised = automatic FAIL.
- **G9** a missing endpoint NEVER aborts: MSW mock labeled `inferred`, logged in `backend-asks.md`,
  re-raised at the gate.
- **G7/G10** route-integrity per env; devops cutover in BOTH envs before "done".

## Guardrail
If a "route" turns out to have no real REST endpoint (logic inline in the `.php`), this is **Case 4**
(propose schema + MSW), not Case 3.
