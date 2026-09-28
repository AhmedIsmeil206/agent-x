---
name: spec
description: >-
  Produce a build-ready spec for a feature, route, screen or endpoint without writing code: purpose,
  functionality inventory, states, contracts, risks and acceptance criteria. Trigger on "/agent-x:spec",
  "spec this", "write a spec for <X>".
---

# agent-x:spec

Read-only except the spec file. Load `.agent-x/project.md` and the active profile first.

1. Dispatch `discovery` (where it lives, what to reuse). If there is existing/legacy behavior, dispatch
   `source-analyzer` scoped to the given path. If a design source exists, dispatch `design-fetcher`.
2. Write `.agent-x/specs/<slug>.spec.md`:
   - Purpose and users · design source link
   - Functionality inventory: every control, link, form, endpoint call, event, analytics hook, each with an id
   - States: empty / loading / error / success / permission-denied / offline (mobile) per unit
   - Logic: branches, guards, state transitions, validation rules
   - Contracts: request/response schemas, events, DB changes
   - Reuse: existing modules to import, new shared modules to create
   - Risks and open questions (with a recommended answer each)
   - Acceptance criteria (testable)
   - `Pre-seed` block: the intake fields filled, so `/agent-x` starts from this spec without re-asking
3. Record a hash of the source files in the pre-seed so a later run can detect drift.
