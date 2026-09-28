# Rule: design system

## Primitives

- Compose **Radix UI** + **shadcn** components; style with **Tailwind v4** utilities.
- Variants via `class-variance-authority` (`cva`); merge classes with `clsx` + `tailwind-merge`.
- Icons: `lucide-react`. Command/typeahead: `cmdk`. Carousel: `embla-carousel-react`.
  Floating/positioning: `@floating-ui/react`. JSON view: `@uiw/react-json-view`.
- Fonts are `the-sans` (`src/assets/fonts`). Do not add font files without a decision entry.

## The `design_system_inventory` artifact (Phase A, frozen)

Every migrate/clone run freezes a `design_system_inventory` in run-state: for EVERY visual primitive
on the source — the legacy widget, the repo primitive it `maps_to`, `reuse` (reuse-existing /
extend-existing / build-new), the `tokens` its captured values resolve to, and the
`verify_states` it must be checked in. **It is produced on EVERY run regardless of the declared
case** — a "static"/case2 page changes the DATA wiring, never the depth of extraction.
`build-new` where an existing primitive covers the need is a BLOCKING review finding, and any
captured value with no token in the scale is logged to `tokens_missing` as design drift — never
silently inlined.

## Reuse first, then compose

- **Search before you build.** If a component already exists in the design system / `src/components`
  (button, input, dialog, combobox, table, card…), **import and use it** — never re-implement a
  primitive that ships. discovery + pattern-mapper hand you the reuse map; consume it.
- **Compound components.** Build composite UI as compound components (e.g. `Card` + `Card.Header`
    - `Card.Body`, `Filter` + `Filter.Item`) so parts are reusable and context flows without prop
      drilling. Prefer composition over one giant configurable component.
- **Existing tokens & patterns are the reference.** Colors, spacing, button variants, and the
  functional approaches already written in the repo are the baseline — match them. If you see a
  genuinely better approach/logic, apply it, but state the improvement in your report (a decision),
  don't diverge silently.

## Non-negotiables

- **No raw hex / magic numbers.** Use the `@theme` tokens in `src/styles.css`. A value that isn't in
  the scale is a design-drift flag → log it, don't silently inline it.
- **Missing-but-reusable → promote to a GLOBAL, then use.** When the source needs a color / font /
  radius / spacing / component that the design system does NOT have yet **and it will be used more
  than once**, add it to the design system as a named global — a color ramp `--color-<FAMILY><STOP>`
  or single stop, `--font-*`, `--radius-*` in `src/styles.css @theme`, or a kebab-case shared
  component in `src/components/shared` — **named per the existing convention in `src/styles.css` and
  the `files-and-folders-naming-rules` skill**, and only THEN referenced. It is added ONCE and reused
  everywhere; never inline the same raw value in N components. These promotions travel as
  `design_system_additions` in run-state and are approved by the human at the PLAN GATE before any
  code is written.
- **RTL / Arabic first.** Direction via `@radix-ui/react-direction`. Never hard-code `left`/`right`;
  use logical properties (`ms-*`, `me-*`, `text-start`) so RTL mirrors correctly.
- **Accessibility is a gate, not a nicety.** Every interactive element: keyboard reachable,
  correct `role`, visible focus, accessible name. Dialogs/menus use Radix a11y, not custom.
- **Responsive** to the same breakpoints as existing components (mobile links vs desktop links
  pattern in `src/components/jobseeker/header`).

## When cloning a legacy (Bootstrap/jQuery) page

Map, don't transliterate:
| Legacy | New |
|---|---|
| Bootstrap grid (`.row`/`.col-*`) | Tailwind fl: `flex`/`grid` utilities |
| `.btn .btn-primary` | shadcn `Button` variant |
| bootstrap3-typeahead / Select2 | shadcn `Combobox` (`cmdk`) |
| jQuery-UI datepicker | Radix/shadcn date picker |
| jqGrid | **TanStack Table** |
| bootstrap-notify / growl | shadcn toast |
| image-picker | controlled file input + preview component |

**The mapping is NOT 1:1 and is never assumed.** Each mapped primitive is verified by
`visual-verifier` against the frozen capture **in each of its `verify_states`** — icon stroke/weight
tuned to the legacy glyph, `.collapse` → a real `<button aria-expanded>` with both states diffed,
grid/combobox/datepicker states each exercised. A shallow swap that renders but diffs badly is a
FAIL, not a pass.

Fidelity is the **UI/UX axis** of the four-axis ≥98% bar and is measured by the design-comparison
gate: `visual-verifier` renders BOTH sides — the `design_source` (Figma node, else the
production/legacy URL captured live) AND the running implementation — and diffs them per element ×
state × breakpoint, RTL included, with icon weight, per-side padding/margin, colors, line-heights
and spacing as explicitly diffed properties. A report that did not render both sides is rejected,
not scored.
