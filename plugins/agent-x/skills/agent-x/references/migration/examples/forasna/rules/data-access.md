# Rule: server-state (the query-key triad)

The canonical pattern in `src/api/<domain>/`. Reproduce it exactly for every new domain.
This is the repo's equivalent of the spec's "TanStack Query key factories in packages/data-access"
— it already exists here as a per-domain triad. Use it; do not invent a `packages/` layer.

## Three files per domain

```
src/api/<domain>/
├── <domain>.query-keys.ts   # the key factory (a const object, `as const`)
├── <domain>.requests.ts     # axios calls via @/api/base `request()`; DTO → model mapping
└── <domain>.queries.ts      # queryOptions + use*Query hooks
```

## Key factory (copy this shape)

```ts
// company.query-keys.ts
export const companyQueryKeys = {
    all: ['company'] as const,
    detail: (companyId: string | number) => [...companyQueryKeys.all, 'detail', String(companyId)] as const,
};
```

## Requests (JSON:API envelope, axios only here)

```ts
// company.requests.ts
import { request } from '../base';
import type { JsonObject } from '@/types/api';
import type { Company } from '@/types/company';

async function fetchCompanyById(companyId: string | number) {
    const data = await request<JsonObject<Company>>({ url: `/companies/${companyId}` });
    return data.data; // unwrap JSON:API `data`
}
export async function getCompanyById(companyId: string | number) {
    /* map/compose here */
}
```

## Queries (the consumable surface)

```ts
// company.queries.ts
import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { companyQueryKeys } from './company.query-keys';
import { getCompanyById } from './company.requests';

export const fetchCompanyByIdQueryOptions = (id: string | number) =>
    queryOptions({ queryKey: companyQueryKeys.detail(id), staleTime: Infinity, queryFn: () => getCompanyById(id) });
export const useFetchCompanyById = (id: string | number) => useQuery(fetchCompanyByIdQueryOptions(id));
export const useFetchCompanyByIdSuspense = (id: string | number) => useSuspenseQuery(fetchCompanyByIdQueryOptions(id));
```

## Rules

- Requests import from `@/api/base` (`request`, interceptors). Never `axios.create` elsewhere.
- Export `queryOptions` factories so route loaders can prefetch for SSR hydration.
- Mutations live in `<domain>.queries.ts` too (`useXxxMutation`) and invalidate via the key factory.
- DTO→view-model mapping happens in `<domain>.requests.ts`, never in a component.
- Content type is `application/vnd.api+json`; pagination/filter params via `qs`.
