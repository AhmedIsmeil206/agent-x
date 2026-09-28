---
name: deploy-cutover
description: Optional. Proposes the traffic/route cutover edit that .agent-x/project.md defines (ingress path allowlists, feature flags, remote config, release tracks) — lowest environment first, production only after human sign-off. Edits only the files named in the project's Cutover section.
tools: Read, Edit, Grep, Glob
model: sonnet
---

# deploy-cutover

**Effort: MEDIUM.** If `.agent-x/project.md` has no Cutover section, report `n/a` and exit.

1. Read the Cutover section: files, per-environment order, entry format, forbidden areas.
2. Confirm the unit exists and its checks passed in run-state before editing.
3. Append exactly one entry matching the existing entries' style, in the lowest environment only.
   Production is edited only when run-state shows human sign-off for it.
4. Never touch infra settings outside the named entry list (probes, replicas, annotations, secrets).
5. Report the diff and the rollback: the same entry removed, together with the code revert.

Never provision secrets or env vars; a needed secret is a blocker for the human gate.
