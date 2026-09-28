---
name: case2-static-page
description: >-
  Migration Case 2 — a purely presentational legacy page (Terms, landing, static dashboard layout):
  pure .tpl markup, no $.ajax, no state. Direct TPL → TSX translation with NO query hooks. Trigger
  for static/presentational legacy pages.
---

# Case 2 — Presentational TPL → TSX

No state, no network — so this case skips the **data** machinery (no triad/hooks). It does NOT skip
the design-truth capture, the interactive-state matrix, the functionality inventory, or any coverage
node. "Static" lowers the wiring, never the verification: a static page still gets driven in the
browser and gated ≥0.98 on UI/UX across every state × breakpoint, and its links still pass
route-integrity.

## Workflow
1. legacy-decompiler confirms: no `$.ajax`/`$.get`, no `$_SESSION`-driven branching beyond
   show/hide; pure markup + maybe `{if}`/`{foreach}` over static data.
2. react-synthesizer translates the `.tpl` directly:
   - `class` → `className`, `for` → `htmlFor`, inline styles → Tailwind utilities.
   - Bootstrap classes → Tailwind/shadcn primitives (`design-system.md` mapping table).
   - `{foreach}` → `.map()`; `{if}` → conditional render or ternary.
   - Logical RTL properties; Arabic strings preserved (both AR + EN if the page is bilingual).
   - **SEO parity**: reproduce `<title>`, meta description, canonical, `lang`/`dir`, and any JSON-LD
     the legacy page emitted (these pages are usually SEO-critical) via the route's head config.
3. **No triad, no `useQuery`, no container/presenter data split** — a static presenter is enough.
   Add a per-page render test.
4. Verify (visual-verifier ≥0.98 across every state × breakpoint + a11y + route-integrity on its
   links) → route → devops cutover (BOTH testing + production values, prod prepared) → human gate
   → the developer commits/pushes manually.

## Extraction is NOT reduced by choosing this case
Declaring a page "static" selects the BUILD path only. **Phase A still extracts EVERYTHING into
JSON at full depth** — the complete legacy spec, the complete `functionality_inventory` (links,
controls, states, forms, strings, analytics, seo head tags), the RENDERED `design_capture` at 3
breakpoints with the full computed-style set, the `interactive_state_matrix`, AND the
`design_system_inventory` (every primitive → the repo primitive to reuse + its tokens + the states
to verify). **A static page still has a design system.** Under-extracting here is unrecoverable.

## Non-negotiable gates (this case does NOT relax them — G2)
"Static" lowers the DATA machinery only. You **MUST NOT** skip any of these, and "the page is simple"
is a FORBIDDEN reason:
- **G3** RENDERED design-truth capture (mobile+tablet+desktop screenshots, full computed-style set
  incl. line-height/letter-spacing/per-side padding/box-shadow/icon weight, interactive-state matrix)
  before any code. Building from the `.tpl` alone is FORBIDDEN.
- **G5 design-comparison gate.** visual-verifier MUST render BOTH sides — the Figma node or the live
  production/legacy URL, AND the running implementation — and diff them per element × state ×
  breakpoint, RTL included. ≥0.98 **GATES**; a miss opens a back-edge to react-synthesizer (cap 3).
- **G6** every control driven and every matrix state exercised (a static page still has hover, focus,
  and RTL states) — an unexercised state is an automatic FAIL.
- **G4/G7/G10** inventory frozen and closed out; route-integrity on every link across
  localhost/testing/production; devops cutover in BOTH envs.

## Guardrail
If discovery finds even one dynamic fetch or stateful interaction, STOP — this is Case 3 or 6,
not Case 2. Don't force a static translation onto a dynamic page.
