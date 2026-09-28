---
name: case4-inline-php
description: >-
  Migration Case 4 — a legacy .php page that runs SQL/business logic inline before rendering the
  .tpl, so NO REST endpoint exists for React to call. Decouple: isolate logic, propose a REST
  schema, mock it with MSW, build the UI against the mock. Trigger when legacy logic is embedded in
  the controller with no API.
---

# Case 4 — Inline PHP extraction + MSW mocking

No endpoint exists yet. Build against a mock contract so the React page ships before the backend does.

## Workflow
1. **Logic isolation.** legacy-decompiler separates template-render code from the SQL/business
   logic inside the `.php`. Capture inputs, the query/computation, and the output shape passed to
   the template.
2. **API schema proposal.** Propose a REST + JSON:API contract the backend (or a thin API wrapper)
   should expose. Record it in `docs/migrations/<NN>/api-proposal.md`, and append a one-line row to
   `docs/migrations/<NN>/backend-asks.md` (endpoint · proposed shape · why it's needed).
   **This is a hand-off list, never a blocker.** This is a frontend repo and backend decisions are
   not made here: the run does NOT wait for an answer, does not `AskUserQuestion` about backend
   design, and keeps building against the mock. The list is surfaced at the human gate so the
   developer can forward it to the backend team on their own schedule.
3. **MSW mock — a WARN, never an abort (G9).** If `msw` is absent, the **STEP 0a preflight** records
   it in `tooling_absent` and **offers** `npm i -D msw` — the engine never edits `package.json`
   itself. **It MUST NOT stop the run:** a missing tool or missing backend never aborts a frontend
   migration. Once present, react-synthesizer writes handlers under `src/mocks/handlers/` + a saved
   success/error example matching the proposed contract. Until then the run keeps building against
   the inferred shape and every mock is re-raised at the human gate.
4. **Build against the mock.** Generate the `src/api/<domain>` triad + `useQuery`/`useMutation`
   pointing at the contract; container/presenter UI renders real states from the mock. Mapper unit
   tests run against the mock example.
5. When the real endpoint lands: flip MSW off, re-run the Phase C **DTO contract check** against a
   live staging response; drift → another `backend-asks.md` row + gate re-open. Never widen a type
   to hide the drift — record the mismatch and let the human gate decide.

## Non-negotiable gates (this case does NOT relax them)
- **G2** every required node runs; no "simple/cost" skip of capture, the graph, or a coverage node.
- **G3** RENDERED design-truth capture (3 breakpoints, full computed-style set, interactive-state
  matrix) before any code. The absence of an API changes the DATA wiring only, never the verification.
- **G5 design-comparison gate.** visual-verifier MUST render BOTH sides (the Figma node or the live
  production/legacy URL, AND the running implementation) and diff per element × state × breakpoint;
  ≥0.98 **GATES**, a miss opens a back-edge (cap 3).
- **G6** every control driven, every matrix state exercised — unexercised = automatic FAIL.
- **G9** the missing backend NEVER aborts this run — that is the whole point of this case.
- **G7/G10** route-integrity per env; devops cutover in BOTH envs before "done".

## Guardrail
The mock is the contract, not a guess — every field is justified by the isolated legacy logic.
Never ship the MSW mock to production; it's dev/test only.
