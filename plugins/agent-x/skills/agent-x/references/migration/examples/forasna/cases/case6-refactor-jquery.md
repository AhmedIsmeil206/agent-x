---
name: case6-refactor-jquery
description: >-
  Migration Case 6 — a legacy page built on imperative jQuery plugins (jqGrid, Select2/typeahead,
  jQuery-UI datepicker, image-picker) and direct DOM manipulation (.html()/.append()/.hide()).
  Replace plugins with modern React equivalents and convert DOM bindings to declarative state.
  Trigger when a page depends on jQuery plugins or manual DOM injection.
---

# Case 6 — Imperative jQuery → declarative React

Copying jQuery DOM scripts into React breaks the virtual DOM. Rebuild behavior declaratively.

## Workflow
1. **Behavioral mapping.** legacy-decompiler scans `assets/js/<role>/*.js` for: jQuery selectors
   (`$()`), DOM mutations (`.html()`, `.append()`, `.hide()`, `.show()`, `.val()`), event handlers,
   and plugin inits. Produce the behavior table.
2. **Library replacement** (per `design-system.md`):
   | Legacy | React |
   |---|---|
   | jqGrid (`assets/js/third_party/jqgrid`) | **TanStack Table** (sorting/paging/filter as state) |
   | Select2 / bootstrap3-typeahead | **shadcn Combobox** (`cmdk`) |
   | jQuery-UI datepicker | Radix/shadcn date picker |
   | image-picker | controlled file input + preview component |
   | bootstrap-notify / growl | shadcn toast |
3. **Declarative refactor.** react-synthesizer converts imperative DOM updates into `useState`
   (or URL search params via TanStack Router for filters/paging); server data via the `src/api`
   triad + `useQuery` — never `.append()` of fetched rows. Event handlers become React handlers.
4. **Container/presenter split**; loading/empty/error variants; AR strings + RTL; SSR-safe.
5. Verify (visual ≥0.98 across every state × breakpoint + a11y — grids/combos are a11y-heavy) →
   integration test (sort/filter/paginate) + route-integrity on emitted links
   → devops (values-file edit) → human gate → the developer commits/pushes manually.

## Non-negotiable gates (this case does NOT relax them)
- **G2** every required node runs; no "simple/cost" skip of capture, the graph, or a coverage node.
- **G3** RENDERED design-truth capture at 3 breakpoints with the full computed-style set and an
  interactive-state matrix that includes the **plugin states**: grid sorted/paged/row-expanded,
  combobox open/filtered/selected/empty, datepicker open/selected/disabled, toast shown/dismissed.
- **G8 design-system mapping is NOT 1:1 — each mapped primitive is VERIFIED against the capture at
  each of its states, never assumed:** FontAwesome solid → Lucide (**stroke/weight tuned to match the
  glyph's visual weight**), Bootstrap `.collapse` → real `<button aria-expanded>` + panel,
  jqGrid → TanStack Table, typeahead/Select2 → cmdk Combobox, growl/bootstrap-notify → shadcn toast.
  A shallow swap that renders but diffs badly is a FAIL, not a pass.
- **G5 design-comparison gate.** visual-verifier MUST render BOTH sides (the Figma node or the live
  production/legacy URL, AND the running implementation) and diff per element × state × breakpoint;
  ≥0.98 **GATES**, a miss opens a back-edge (cap 3).
- **G6** every control driven — click every sort header, page, filter, open every combo — every
  matrix state exercised; unexercised = automatic FAIL.
- **G7/G10** route-integrity per env; devops cutover in BOTH envs before "done".

## Guardrail
Do NOT port a jQuery plugin's config verbatim — translate its *behavior*. Table state lives in
React/URL, not in the DOM. Grid data comes from a query hook, not imperative injection.
