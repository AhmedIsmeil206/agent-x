# Rule: devops route cutover (the real "URL replacement")

The strangler-fig split lives in `devops/helm/forasna-frontend/`. Traffic is moved to the new
frontend **one path at a time** by adding that path to the ingress `paths` allowlist. This is
what "replace the URL on production/testing per feature" means here — an append, not a find-replace.

## The three environment value files

| File                     | Primary host                                    | Cut over here…                   |
| ------------------------ | ----------------------------------------------- | -------------------------------- |
| `testing-values.yaml`    | `testing.forasna.basharsys.com`                 | **first** (validate on testing)  |
| `staging-values.yaml`    | `frontend-forasna-staging.wuzzuf.basharsys.com` | optional pre-prod soak           |
| `production-values.yaml` | `forasna.com` / `frontend.forasna.com`          | **last**, after human validation |

## What a cutover edit looks like

Under `ingress.hosts[host: forasna.com].paths` (and the testing host), append the migrated
route's regex, matching the existing entries' style:

```yaml
- path: /<migrated-route>(/.*)?
  pathType: ImplementationSpecific
```

Existing precedents already there: `/employer/talent/search(/.*)?`, `/otp(/.*)?`,
`/jobseeker/register(/.*)?`, `/login/forgot-password(/.*)?`, … Match that exact shape and the
TanStack route path (`src/routes/...`).

## Sequencing & rollback

1. `devops-env-swapper` edits **testing-values.yaml** → validate the page on testing.
2. On human sign-off, edit **production-values.yaml** (the developer commits it — the engine does
   not; see git-workflow.md). Keep it a separate commit so cutover and rollback are surgical.
3. Never touch ingress annotations, `livenessProbe`/`readinessProbe` (`/health-check`), or
   `replicaCount` during a route cutover — those are infra, not feature routing.

## The two non-linear states (confirmed)

- **Descoped** — a _pre-merge_ N13 ask that **exceeds the frozen migration slice**. The extra scope
  is split off as a new run (`phase = "Descoped"` for it); the in-slice work still ships. No devops
  action.
- **Reverted** — an _already-merged / live_ migration that is subsequently rolled back. It has a
  **real post-merge rollback procedure**, and both halves must happen together:
    1. **Revert the code PR** (or `git revert` the merge) so the frontend no longer serves the route.
    2. **Remove the route's `path:` block** from `production-values.yaml` (and testing, if present),
       then redeploy the chart — this hands the URL back to legacy `forasna`. Skipping this strands
       the path pointing at a frontend that no longer implements it (a 404/500 split-brain).
    3. Set run-state `phase = "Reverted"`; re-landing later re-runs the full merge gate.
       The developer performs the git revert; the engine only proposes the values-file diff to remove.

## Explicitly out of scope (a boundary, not a gap)

Provisioning **env vars / secrets / backend config** for a new API domain is NOT a step in this
pipeline — it is a prerequisite handled outside it (backend/infra ticket). `devops-env-swapper`
touches the ingress `paths` allowlist and nothing else; `security-auditor` only checks that no
secret leaked into the bundle. If a migration needs a new secret, raise it at the human gate as a
blocker and wait — never invent, inline, or commit one.

## Guardrails

- One path per commit. The commit message: `chore(devops): route /<path> to frontend (<env>)`.
- Confirm the route actually exists in `src/routes/` and returns 200 on `/health-check`-style
  probe before adding it to production.
