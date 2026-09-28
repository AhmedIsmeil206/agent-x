# Profile: web-react
kind: web

Covers React SPAs and SSR frameworks (Vite, Next.js, TanStack Start, Remix). Project.md overrides any default.

## Architecture
- Data: server state through one data layer (TanStack Query key factories + `queryOptions`, or the
  framework's loader pattern). HTTP client created in one place only. DTO → view-model mapping in the
  data layer, never in components.
- Container / presenter: containers own hooks, loaders, mutations; presenters are props-in → UI-out
  with no server-state hooks.
- SSR frameworks: prefetch above-the-fold data in loaders; guard browser-only APIs; head metadata per route
  (title, description, canonical, lang/dir, OG, JSON-LD where applicable).
- Validation with the repo's schema lib (usually Zod) at API and form boundaries.
- Forms through the repo's form system if one exists.
- Styling through the design system and tokens; no raw hex/magic numbers; logical properties for RTL.
- TypeScript strict: no `any` (use `unknown` + narrowing), `import type` for types, path alias over `../../..`.

## Commands (defaults if project.md is silent)
lint `npx eslint --fix <files>` · typecheck `npx tsc --noEmit` · test `npx vitest run <pattern>`

## Verification
visual-verifier + a11y-auditor via Chrome DevTools MCP. Breakpoints from the repo, else 375/768/1280.

## Structure checklist
- [ ] Container/presenter split respected
- [ ] All server state through the data layer; no ad-hoc fetch/axios in components
- [ ] Mapping in the data layer; schemas at boundaries
- [ ] No `any`; `import type`; alias imports
- [ ] Placement + naming match project conventions (zero violations)
- [ ] Reused existing components; no duplicated primitive
- [ ] Tokens only; RTL-safe logical properties
- [ ] SEO/head parity (SSR apps)
- [ ] Presenter test per state (empty/loading/error/filled); mapper unit tests
