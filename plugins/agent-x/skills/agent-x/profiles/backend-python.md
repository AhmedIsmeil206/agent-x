# Profile: backend-python
kind: backend

Covers FastAPI, Django/DRF and Flask. Project.md overrides any default.

## Architecture
- Layers: router/view → service → repository/ORM. Keep business logic out of views and serializers.
- Contracts: pydantic models (FastAPI) or DRF serializers validate all input; OpenAPI stays accurate.
- Authz per object (DRF permissions / dependency checks), not only per route.
- Migrations (Alembic / Django) with a reversible down path; data migrations tested.
- Type hints everywhere; mypy/pyright clean if configured.
- Settings from env through one settings module; no secrets in code.
- Async correctness: no blocking I/O inside async handlers.

## Commands (defaults if project.md is silent)
lint `ruff check --fix <files>` · format `ruff format <files>` · typecheck `mypy .` or `pyright` · test `pytest -q`

## Verification
Same as backend-node: HTTP tests per input class, contract diff, perf only with a measurement.

## Structure checklist
- [ ] View / service / repository separation
- [ ] Pydantic/serializer validation at entry; OpenAPI accurate
- [ ] Object-level permissions
- [ ] Reversible migration, tested
- [ ] Typed; type checker clean
- [ ] No blocking I/O in async paths
- [ ] Settings validated; no secrets in code
- [ ] pytest coverage for services and endpoints
