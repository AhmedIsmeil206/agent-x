# Rule: forasna-frontend architecture

Extracted from the live repo. Every generated component/hook/route must satisfy these.

## Layering

```
src/
├── api/<domain>/         # server-state triad (see data-access.md) — the ONLY place axios runs
├── components/<role>/    # UI by role: employer | jobseeker | guest | shared | otp
├── routes/               # file-based TanStack Router: _private | _guest | _public groups
├── constants/            # env.ts, cities.ts, browse-jobs.ts …
├── types/                # shared TS types (Company, JsonObject<T>, api envelope types)
└── assets/               # fonts (the-sans), images, svgs
```

## Hard rules

- **Container / Presenter split.** A route or feature has a container (owns data: hooks,
  loaders, mutations) and a presenter/`*View` (pure props-in → UI-out). No server-state hooks
  (`useQuery`/`useMutation`/`useSuspenseQuery`) in a presenter. Enforced by code-reviewer.
- **SSR-aware.** This is TanStack **Start** — code runs on server and client. Guard browser-only
  APIs with `import.meta.env.SSR`. Data fetching prefers route loaders + `queryOptions` so SSR
  hydration works (see `api-client.ts`: `baseURL = SSR ? VITE_API_URL : '/api'`).
- **Validation.** Parse external data with Zod v4 at the boundary; never trust the wire shape.
- **Path alias** `@/*`. No `../../..` chains.
- **TS strict** + `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`. No `any`; use
  `unknown` + narrowing. `verbatimModuleSyntax` is on → use `import type` for types.
- **Errors** surface through the axios interceptors (`response-interceptor.ts`) + Sentry; do not
  swallow. Route-level errors use `error-component.tsx`.
- **Forms** use the repo's own form system in `src/forms/` (`useAppForm` from `form-system.ts`,
  `form.AppForm` / `form.AppField` / `form.FormSubmitButton` / `form.FormError`,
  `field.TextFormField`, schemas in `src/forms/schemas/`) — NOT hand-rolled `@tanstack/react-form`.
  Follow the `.agent/skills/migrate-form-system` skill for the exact pattern; reuse it, don't restate it.

## Composition & page assembly

- **Split every feature into small, reusable components**, each with one responsibility, then
  **assemble them in the feature's root page** (the route/container) — the root composes, the
  children stay dumb and reusable. No 500-line page component.
- Reuse existing components/design-system primitives before writing new ones (see design-system.md);
  build composites as **compound components**.
- Treat the existing design tokens and functional approaches as the reference; improve only with a
  logged reason, never diverge silently.

## SEO + SSR (mandatory, every page)

This is TanStack **Start** — pages render on the server. Every migrated/new page must:

- Set head metadata on the route (`title`, meta description, canonical, `lang`/`dir`, Open Graph,
  and JSON-LD where the legacy page had it) — reproduce or improve the legacy page's SEO, never drop it.
- Fetch via route **loaders + `queryOptions`** so data is server-rendered and hydrated (no
  client-only fetch for above-the-fold content); guard browser-only APIs with `import.meta.env.SSR`.
- Keep markup semantic and crawlable (real links, headings, no content trapped behind client-only JS).

## These rules ARE the code-structure axis

Conformance to this file is scored: `code-reviewer` measures the **code-structure axis** of the
four-axis ≥98% bar as (conformant checks / total checks) over the container/presenter split, the
`src/api` triad for all server state, `@/*` + `import type` + no-`any` + Zod-at-boundaries, correct
file/role placement with **zero `files-and-folders-naming-rules` violations**, no duplication of
existing components, and SEO/SSR head parity. It is reported SEPARATELY from code logic — a page
whose tests pass but whose structure drifts has FAILED this axis.

## Testing

Vitest + Testing Library. Each presenter gets a render test per state variant
(empty/loading/error/filled). Each mapper gets a unit test against a saved API example.
