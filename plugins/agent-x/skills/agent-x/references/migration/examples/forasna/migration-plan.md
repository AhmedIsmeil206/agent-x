# Forasna Migration System — Plan, Engine & Gaps

Legacy `forasna` (Symfony + Doctrine + Smarty `.tpl` + jQuery) → `forasna-frontend`
(React 19 + TanStack Start/Router/Query/Form + Zod 4 + Radix/shadcn + Tailwind v4 + axios + Sentry).

This document is the source of truth for _how_ migration and new-feature work runs. The
`.claude/` engine below executes it; if the engine and this doc disagree, **this doc wins**.

**The success bar (canonical):** every migrated route/page must reach **≥98% on FOUR separately
measured axes — UI/UX fidelity, code logic, code structure, feature functionality — never averaged
into one number.** Each PLAN phase loops build→coverage→gate until its slice clears the bar; the run
does not close until every phase clears all four axes or the human explicitly waives a shortfall. A
migrate-page run ALWAYS runs the full graph (design-truth capture → build → visual+a11y+route+
security coverage → gate); "static / simple / cost" may lower a model tier but **never skips a
required node**. See `skill.md` for the executable procedure.

---

## 0. What was adapted from your inputs (and why it changed)

Your pasted spec, the `graph-x` engine, and `WORKFLOW-final.md` were written for a **pnpm
monorepo / React Native / Figma** world. The real `forasna-frontend` is none of those.
Every rule below is re-bound to what is actually on disk:

| Your spec assumed                                    | Reality in `forasna-frontend`                         | What I bound to                                                           |
| ---------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------- |
| pnpm monorepo, `packages/data-access`, `packages/ui` | single Vite app on **npm**, no `packages/`            | `src/api/<domain>` triads + `src/components/<role>`                       |
| TanStack Query key factories in a package            | already exist as `*.query-keys.ts` objects            | reuse the existing triad convention                                       |
| `pnpm lint --fix && pnpm tsc --noEmit` hook          | npm + `eslint` + `tsc --noEmit` (via `vite`/`vitest`) | `npx eslint --fix` + `npx tsc --noEmit`                                   |
| React Native + Figma-only design source              | web DOM + you already wired **chrome-devtools-mcp**   | design capture via **Chrome DevTools MCP or Figma**                       |
| graph-x: "no similarity %" (RN has no DOM)           | web has computed styles + DOM                         | **real ≥98% fidelity** via computed-style/DOM diff (one of the four axes) |
| Monorepo layout as the target                        | not present                                           | documented as a **future refactor target** (§10)                          |

---

## 1. Architecture — one engine, three surfaces

```
                ┌──────────────────────────────────────────┐
                │  N0 ORCHESTRATOR  (skills/migrate-feature) │  owns run-state, caps, routing
                └───────────────────┬──────────────────────┘
     ┌───────────────────┬──────────┴───────────┬─────────────────────┐
     │ SURFACE 1         │ SURFACE 2            │ SURFACE 3            │
     │ New feature       │ Migrate a page       │ Design-only clone    │
     │ (spec-first)      │ (legacy → new)       │ (≥98% pixel/DOM)     │
     └───────────────────┴──────────────────────┴─────────────────────┘
              │ every surface routes the same subagents, capped ≤3
              ▼
  discovery · legacy-decompiler · design-fetcher · pattern-mapper · planner
  · react-synthesizer(★ only writer) · visual-verifier · qa-tester · code-reviewer
  · a11y-auditor · security-auditor · integration-tester · devops-env-swapper
  · doc-writer
```

**Non-negotiables (ported verbatim from graph-x / WORKFLOW-final):**

1. The main thread owns `docs/migrations/<id>/run-state.json` (`<id>` = the run id, e.g.
   `03-talent-search`). No subagent writes it.
2. **Single writer.** Only `react-synthesizer` edits frontend code. Reads fan out; writes never.
3. **Legacy is read-only.** No subagent may edit anything under `forasna/`. Enforced in `mcp.json` mount + `git-workflow.md`.
4. **Back-edges cap at 3**, then route to the human gate — never a silent 4th attempt.
5. **Coverage nodes never retry toward a verdict** (verifier, audits). They report and exit; N0 decides the loop-back. A FAIL that becomes a PASS on a later pass in the same run is rejected.
6. **Scope frozen at intake.** "Oh also can you…" is a new slice, raised at the gate.
7. **No fabricated metrics.** "Looks 96%" with no diff table behind it is rejected.
8. Every node returns a **loop record** first, so you can see it iterated rather than claimed it.
9. **Intake runs first and is enforced.** No node begins until `run-state.json` exists; a run with
   no run-state is invalid. DoR hard-fail (no ACs OR no resolvable source) → STOP at the human gate.
10. **Three frozen Phase-A artifacts precede any code:** the design-truth capture (rendered
    screenshot + per-element computed styles + interactive-state matrix, every state × breakpoint)
    the functionality inventory (every link/control/state/form/endpoint/analytics/seo), and the
    design-system inventory (every primitive → repo primitive + tokens + states to verify).
    Building from `.tpl` markup alone is forbidden; scope may not silently shrink — every dropped
    item is a human waiver. **A declared case never reduces extraction depth.**
11. **The engine never runs git** — the developer does all git manually after the human gate.

---

## 2. Phase model (per spec / per migrated page)

Ported from `WORKFLOW-final.md`, re-bound to the web stack.

```
INTAKE — mandatory, first                   (blocking precondition, no node bypasses it)
  Write run-state.json + intake.md, phase="Intake", ACs frozen.
  DoR hard-fail (no ACs OR no resolvable source) → STOP at human.

PHASE A — Design-truth + contract sweep     (read-only, no production code)
  A1 DESIGN-TRUTH CAPTURE (frozen, SESSION KNOWLEDGE not repo files) → RENDERED
     at every breakpoint + per-element computed styles + INTERACTIVE-STATE MATRIX
     (default/hover/focus/expanded/collapsed/empty/loading/error/disabled/RTL).
     Screenshots + raw style dumps are held in the orchestrator's context and threaded
     into downstream prompts — never written to a docs/migrations/<id>/design/ folder.
     run-state keeps only compact proof (rendered, breakpoints, properties_captured).
     Building from .tpl markup alone is forbidden.
  A2 FUNCTIONALITY INVENTORY (frozen) → every link (frontend/legacy) / control /
     state / form / endpoint / analytics event / seo head affordance. Planner maps each
     item to a phase or acceptance check; analytics + seo items are gate-blocking too.
  A3 DESIGN-SYSTEM INVENTORY (frozen) → every visual primitive: legacy widget →
     repo primitive to REUSE, the tokens its captured values resolve to, and the
     states it must be verified in. Produced on EVERY run — a declared case selects
     the BUILD path only and NEVER reduces Phase-A extraction depth.
  A4 Contract → Zod schemas + TS prop types + the query-key triad shape.
  Gate A: all three artifacts frozen, contracts sealed, drift hashes stamped.

PLAN GATE — human approval (STOP)           (between A and B)
  planner presents PLAN.md IN CHAT: phases → tasks, each phase's GOAL + agentic
  build->coverage->gate loop + exit condition, the design-system primitives it will
  REUSE, and every design_system_additions global it will PROMOTE (name/value/target).
  Asks: continue, or add / consider / edit / remove? Phase B MUST NOT start until
  gates.plan = "approved"; "changes" loops back to the planner (inner cap 2).

PHASE B — UI build                          (per phase, dep order, no data yet)
  Container/Presenter split; presenter is pure props-in/UI-out. Build EVERY matrix state.
  visual-verifier (UI/UX axis, ≥0.98 across every state × breakpoint, RTL) +
  code-reviewer (TWO axes: code-logic AND code-structure — split/triad/placement/aliases/types,
  zero naming-rule violations, SEO/SSR head parity; each ≥0.98) + a11y + security run as files land.
  Gate B: UI/UX ≥0.98 with no unexercised state, code-logic branches covered, code-structure ≥0.98
          with zero naming violations, every seo inventory item satisfied, eslint+tsc+vitest green.

PHASE C — Data wiring                        (per endpoint; MSW mock is a reachable branch)
  Mapper (JSON:API → view model) → triad + useQuery/useMutation → 1-line container swap.
  qa-tester (senior QC: a test case per inventory item + drives the real page in-browser)
  + integration-tester + security. Missing endpoint → MSW mock (inferred, labeled),
  build against it, record in backend-asks.md, re-raise at the gate. Never a dead-end.
  Gate C: fetcher wired (or mocked+recorded), mapper tests green, live evidence.

ROUTE-INTEGRITY — first-class coverage       (before devops)
  Every emitted href: resolves? frontend or legacy? behaves on localhost/testing/prod?
  Reconciled against the ingress allowlists. Strangler-fig: deployed links stay RELATIVE.

DEVOPS — route cutover, BOTH envs            (part of "done", after route-integrity)
  devops-env-swapper appends the route regex to testing AND production values in the
  SAME diff: testing applied now; production prepared, marked "apply on sign-off AND
  with/after the prod code deploy". The gate lists any env still lacking the route.

SHIP — human gate, then MANUAL git
  N13 presents the functionality inventory statuses, the four per-page axis scores
  (unaveraged, with diff tables + the ≥98% bar), route-completeness per legacy route,
  interactive-state coverage, route integrity per env, mocked endpoints, analytics/SEO
  parity, and devops paths per env. The engine STOPS
  here — it never branches, commits, pushes, or opens a PR.
```

---

## 3. The six migration cases (bound to the real stack)

Each case is a skill under `.claude/skills/`. The orchestrator picks one at intake.

| #   | Case                       | Trigger                                    | Real-stack workflow                                                                                                                                                                                                                                                           |
| --- | -------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **New feature in legacy**  | feature ships in `forasna` PHP first       | Spec-first: Zod/TS contract → read new PHP/`.tpl` → port to `src/components/<role>` + `src/api/<domain>` triad                                                                                                                                                                |
| 2   | **Static page**            | pure `.tpl` markup, no state               | `.tpl` → TSX: `class→className`, Bootstrap → Tailwind/shadcn, **no query hooks**                                                                                                                                                                                              |
| 3   | **Dynamic page (has API)** | `$.ajax`/`$.get` + PHP route               | scan endpoints → **discover the shape yourself** (api-docs → controller → live testing call → infer from the jQuery success handler); never ask the dev for a payload shape → generate query-key triad + `useQuery`/`useMutation`. Missing endpoint → MSW mock, keep building |
| 4   | **Inline PHP, no API**     | SQL/logic inside the `.php` controller     | isolate logic → propose REST schema → **MSW** mock (new dep) → build UI against mock                                                                                                                                                                                          |
| 5   | **Shared shell + auth**    | `header.tpl`/`nav.tpl` + `$_SESSION`       | extract to `src/components/shared` layout + TanStack Router root routes + `useAuth()` (matches existing `_private`/`_guest`/`_public` route groups)                                                                                                                           |
| 6   | **jQuery refactor**        | jqGrid, jQuery-UI, typeahead, image-picker | jqGrid → **TanStack Table**, typeahead → **shadcn Combobox/cmdk**, jQuery-UI datepicker → Radix; `.append()`/`.hide()` → `useState`                                                                                                                                           |

Legacy plugin inventory found on disk (targets for Case 6): `assets/js/third_party/jqgrid/*`,
`jquery-ui.js`, `bootstrap3-typeahead`, `image-picker`, `bootstrap-notify`.

---

## 4. Design-clone loop (the ≥98% UI/UX axis, done honestly)

For "migrate only the design" the `design-clone` skill runs a **capped correction loop**:

```
1. design-fetcher captures the source page:
   • Figma: get_design_context (node-id, children[], tokens), OR
   • Chrome DevTools MCP: navigate legacy URL → screenshot + computed styles + DOM tree
2. react-synthesizer builds the page in the real design system (shadcn/Tailwind).
3. visual-verifier renders the new page (every captured breakpoint) and produces a DIFF TABLE:
   per element × state → {spacing, color, font-size, radius, layout, direction} source vs built,
   driving EVERY interactive state in the matrix. Fidelity = matched / total. Target ≥ 0.98.
4. Mismatch, or any unexercised state → back to synthesizer (cap 3). At cap 3 → human gate.
```

This is the one place I overrode graph-x: on web the number is measurable, so we gate on a
real computed-style diff, not vibes. RTL/Arabic parity is a required diff dimension.

---

## 5. DevOps route cutover (the real "URL replacement")

Your `devops/helm/forasna-frontend/*-values.yaml` ingress already routes **specific legacy
paths** to the new frontend (traffic-splitting, page by page). Migrating a page means adding
its route regex to that allowlist — not a text find-replace.

Cutover spans **BOTH** envs in the same run's diff and is part of "done":

- **testing-values.yaml** (`testing.forasna.basharsys.com`) — APPLIED now, reachable for validation.
- **production-values.yaml** (`forasna.com` / `frontend.forasna.com`) — appended in the SAME diff but
  PREPARED, marked "apply on human sign-off AND with/after the prod code deploy" (never before, or
  the URL 404/500s into a split-brain). Its own commit for surgical rollback.
- `devops-env-swapper` appends the new `path:` block (ImplementationSpecific) matching the
  TanStack route, mirroring the existing entries (`/employer/talent/search(/.*)?`, `/otp(/.*)?`, …).
- The N13 gate lists every env whose ingress still lacks the route as an open blocker; a run editing
  only testing is INCOMPLETE. Rollback = revert the code PR AND remove the path from both files.

---

## 6. Human gate, then manual git

The engine never runs git (see `.claude/rules/git-workflow.md`):

```
  → work happens in the working tree, no branch created
  → STOP at the human validation gate (N13) — nothing staged, nothing pushed
  → on "approved": the engine is done; the DEVELOPER branches, commits, pushes, opens the PR
  → on "changes": loop back, human-gate cap 2
```

Suggested branch name (`feat|revamp/<NN>-<slug>`) is carried in run-state for convenience only —
no node acts on it. No agent creates, merges, or closes a PR.

---

## 6b. Why each gate exists (the incidents behind them)

`skill.md` states the gates imperatively and without narration to keep the per-run token cost down.
The reasoning lives here, where it is read by humans, not reloaded on every invocation:

- **Design-truth capture must be RENDERED.** A `/sitemap` run shipped a ~10% mock because it built
  from the `.tpl` without ever rendering the page. Hence `rendered: true` is schema-enforced and a
  partial capture is a STOP.
- **The verifier must render BOTH sides.** Scoring against a stored manifest hides drift between
  what was captured and what the source actually looks like now, and lets a run report a number it
  never measured. Hence `both_sides_rendered: false` is a rejected report, not a low score.
- **Capture the full property set.** Early captures read ~9 properties; line-height, letter-spacing,
  per-side padding, box-shadow and icon stroke-width were missing — exactly the properties whose
  absence reads as "close but wrong". A property never captured can never be diffed, so the
  synthesizer guesses it.
- **Route integrity is first-class.** A page shipped with every link 404ing at the wrong origin
  because nobody clicked a link or reconciled hrefs against the ingress allowlists.
- **Intake is a blocking precondition.** A run free-ran with no run-state spine and no frozen ACs,
  so no later gate had anything authoritative to check.
- **A declared case must not reduce extraction.** Declaring a page "static" was being read as
  "extract less", producing a thin JSON spec with no design-system inventory — under-extraction that
  no later node can recover from. Extraction depth is now constant across all cases.
- **No escape hatch.** "It's simple / save cost" reasoning was skipping capture and coverage nodes.
  Cost discipline may lower a model tier and nothing else.

## 7. Gaps in your original plan (what I added)

You asked for the gaps. These are the ones that would have broken a real migration:

1. **No reconciliation for divergent live changes.** Legacy keeps shipping while you migrate.
   Added: `spec-.sha256` + legacy-file hash tracking in run-state; a legacy change to an
   already-migrated page re-opens its Phase C gate (drift alarm).
2. **No SEO/SSR parity gate.** Legacy pages are SEO-critical and server-rendered; TanStack
   Start is SSR too, but meta/canonical/hreflang/JSON-LD parity is silent-failure territory.
   Added as a Phase B checklist item.
3. **No i18n/RTL contract.** Forasna is Arabic-first (`the-sans` fonts, `radix-ui/react-direction`
   present). Added: every migrated string ships AR + RTL diff dimension in visual-verifier.
4. **No analytics parity.** Legacy fires GA/events inline in jQuery. Added: event inventory in
   discovery + `track()` assertions in Phase C (matches the `*.events.ts` files already in repo).
5. **No auth-session bridge.** Legacy `$_SESSION` vs the new JWT (`jwt-decode`, `refresh-token.ts`).
   Case 5 makes the cookie/JWT bridge explicit instead of assuming greenfield auth.
6. **MSW wasn't installed.** Case 4 depends on it — the preflight WARNs and offers `npm i -D msw`,
   but a missing backend/mock **never aborts** a frontend run: build against the inferred MSW mock,
   record it in `backend-asks.md`, and re-raise every mock at the human gate.
7. **No rollback path.** Route cutover is a traffic split; added: revert = remove the path block
   from ingress values (fast rollback without a redeploy of code).
8. **Dual-writer risk.** Your 3 agents (decompiler/mapper/synthesizer) didn't state a single-writer
   rule; graph-x does. Enforced: only `react-synthesizer` writes.

---

## 8. Better approaches than "port file-by-file"

- **Contract-first, not markup-first.** Seal Zod schemas from the JSON:API responses before any
  JSX; the presenter is then provably correct against types, and Phase C is a 1-line swap.
- **Strangler-fig via ingress** (already how your Helm is set up) beats a big-bang cutover —
  migrate one path at a time, split traffic, roll back by deleting a path block.
- **Measure design fidelity, don't eyeball it** (Chrome DevTools computed-style diff).
- **Reuse the existing role-based structure** rather than importing a monorepo — less churn, and
  the legacy `assets/js/<role>` map cleanly onto `src/components/<role>`.

---

## 9. File map (what the engine installs)

```
forasna-frontend/
├── CLAUDE.md                         # <100-line governance spine
├── migration-plan.md                 # this file
└── .claude/
    ├── mcp.json                      # dual-root FS (legacy RO) + chrome-devtools + figma
    ├── settings.json                 # extended: PostToolUse quality hook + git/fs perms
    ├── rules/                        # extracted repo rules
    │   ├── frontend-architecture.md  ├── data-access.md   ├── design-system.md
    │   ├── legacy-forasna.md         ├── git-workflow.md   └── devops-routing.md
    ├── agents/                       # the graph (graph-x port + migration nodes)
    └── skills/
        ├── migrate-feature/          # N0 orchestrator + run-state.schema.json
        ├── graph-x/                  # generalized graph+loops engine
        ├── spec-new-feature/         # spec-first new feature
        ├── design-clone/             # ≥98% design capture+rebuild loop
        └── case1..case6/             # the six migration workflows
```

## 10. Future target (documented, not built)

If the app grows to warrant it, split into a pnpm/Turborepo monorepo:
`packages/data-access` (the `src/api` triads), `packages/ui` (shadcn primitives),
`apps/web` (routes). The rules are written so this refactor is mechanical when you choose it.
