# Design system — always the project's own

Applies to every run that touches UI (web or mobile), including migrations and design clones. The project's
design system is the source of truth for how things are built; the design source (Figma, legacy page) is the
source of truth for what they look like. When they disagree, map to the design system and flag the difference.

## Where it comes from (recorded by /agent-x:init in project.md → `Design system`)
Look for, in order: a design-system/UI package in the repo or monorepo (`packages/ui`, `design-system`), theme and
token files (`tokens.json`, `theme.ts`, CSS custom properties / `@theme`, `tailwind.config.*`, NativeWind /
Tamagui / Restyle / styled-components theme), the component library in use (shadcn, Radix, MUI, Chakra, Mantine,
Ant, React Native Paper, custom), Storybook stories, icon set, fonts, breakpoints, and a linked Figma library.
If none exists, say so; the nearest existing components become the reference.

## Rules
1. **Reuse first**: use the design system's components, variants and tokens. Never re-implement a primitive it
   already ships; extend an existing component before creating a new one.
2. **Tokens only**: colors, spacing, radii, typography, shadows, z-index, motion and breakpoints come from tokens.
   No raw hex, px or magic numbers where a token exists.
3. **Missing value or component** needed more than once → propose a named addition that follows the system's
   naming, listed under `design_system_additions` at the PLAN GATE. Used once → map to the nearest token and log
   the drift. Never add a token or component without approval.
4. **Design source vs system**: design-fetcher resolves every captured value to a token (`tokens_missing` for the
   rest). visual-verifier scores against the design source but treats a token-snapped difference within the
   system's scale as a pass when the addition was declined, and lists it.
5. **Migrations**: legacy widgets map to design-system components (never transliterate Bootstrap/jQuery/native
   styles); the mapping is part of blueprint's output and reviewed at the PLAN GATE.
6. **Theming, RTL and a11y** follow the system's own mechanisms (theme provider, logical properties, direction
   provider, its focus and contrast rules).

Checked by: blueprint (reuse map), implementer (writes only with it), code-reviewer (blocking: raw values where a
token exists, duplicated primitive, unapproved addition), visual-verifier (fidelity), a11y-auditor.
