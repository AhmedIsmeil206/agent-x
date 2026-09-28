# Rule: reading legacy `forasna` (READ-ONLY reference)

`../forasna` is a Symfony (Doctrine) app with Smarty `.tpl` views and jQuery. **Never edit it.**
It is the behavioral source of truth for what a migrated page must do.

## Where things live

```
forasna/
├── application/            # Symfony app (controllers, entities, DoctrineMigrations, services)
│   └── ...                 # inline PHP business logic + SQL often lives in controllers (Case 4)
├── assets/js/<role>/       # jQuery feature scripts: admin | employer | jobseeker | job | applications | companies
│   └── third_party/        # jqGrid, jquery-ui, bootstrap3-typeahead, image-picker, bootstrap-notify (Case 6 targets)
├── *.tpl (Smarty)          # templates: {if}/{foreach}/{$var}, {include file="header.tpl"} (Case 2/5)
└── api-docs/               # existing API surface (feeds Case 3 endpoint discovery)
```

The `assets/js/<role>` folders map 1:1 onto `forasna-frontend/src/components/<role>` — use that
correspondence when deciding where a migrated page lands.

## How to decode a legacy page (what legacy-decompiler extracts → JSON spec)

1. **Template (`.tpl`)**: DOM structure, `{if}`/`{foreach}` branches, `{$variables}`,
   `{include}` partials (shell/shared), form fields + actions.
2. **Controller (`.php`)**: route/URL, request params, session checks (`$_SESSION[...]`),
   DB queries / business logic, the data it passes to the template, redirects.
3. **jQuery (`assets/js/...`)**: `$.ajax`/`$.get`/`$.post` endpoints + payloads, DOM event
   handlers (`.on('click')`), DOM mutations (`.html()`/`.append()`/`.hide()`), plugin inits
   (jqGrid/typeahead/datepicker), analytics/GA event calls.
4. Emit a clean JSON spec: `{ route, params, session_guards, endpoints[], events[], dom_events[],
plugins[], branches[], strings[] }`. That JSON is the contract the frontend is built against.

## Security posture to carry over (and improve)

- Legacy auth = PHP `$_SESSION`. New auth = JWT (`jwt-decode`, `refresh-token.ts`, httpOnly cookie via SSR).
  A migrated guarded page must reproduce the guard as a route-group check (`_private`), not client-only.
- Never copy inline secrets/API keys from legacy JS into the bundle. Server-only via `VITE_API_URL`/SSR.
- Reproduce CSRF/authorization semantics; when unclear, `AskUserQuestion` rather than guess.
- Preserve input validation intent with Zod (legacy server-side checks become client+server Zod).
