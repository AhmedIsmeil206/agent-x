# Profile: backend-node
kind: backend

Covers Node/TypeScript services (Express, Fastify, NestJS, Hono). Project.md overrides any default.

## Architecture
- Layers: route/controller (HTTP only) → service (business logic) → repository/data access. No SQL or ORM
  calls in controllers; no HTTP types in services.
- Contract first: request/response schemas (Zod/TypeBox/class-validator or OpenAPI) validated at the edge;
  OpenAPI kept in sync if the repo publishes one.
- Errors: typed domain errors mapped to HTTP in one error handler; no stack traces to clients.
- Authz checked per resource (object-level), not only per route.
- DB changes as migrations with a tested down/rollback; no destructive change without a data plan.
- Config from env via one validated config module; no secrets in code.
- Idempotency for retries/webhooks; pagination on list endpoints; timeouts on outbound calls.
- Structured logging without PII/tokens.

## Commands (defaults if project.md is silent)
lint `npx eslint --fix <files>` · typecheck `npx tsc --noEmit` · test `npx vitest run` or `npx jest`

## Verification
qa-tester calls endpoints (supertest/HTTP) with valid, invalid, unauthorized and boundary input.
integration-tester diffs the contract and runs contract tests. Performance claims need a load script
(autocannon/k6) or are `unmeasured`.

## Structure checklist
- [ ] Controller / service / repository separation
- [ ] Schema validation at every entry point; contract/OpenAPI updated
- [ ] Object-level authorization
- [ ] Central error mapping; no internal leaks
- [ ] Migration with rollback, tested
- [ ] Config validated; no secrets in code
- [ ] Pagination, timeouts, idempotency where relevant
- [ ] Unit tests for services; API tests for handlers
