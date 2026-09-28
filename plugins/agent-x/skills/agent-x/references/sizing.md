# Adaptive tier and effort — from spec/Jira complexity and session usage

Owner of: complexity scoring, and how model tier + effort are chosen per dispatch. Criticality floors (C0/C1/C2)
come from `model-policy.md`; effort behavior per level from `effort-policy.md`.

## 1. Score complexity (run level at intake, then per ticket by the planner)
Add points from what requirements-reader, discovery and source-analyzer found (facts, not guesses):

| Signal | Points |
|---|---|
| Jira story points: 1–2 / 3–5 / 8 / 13+ | 0 / 1 / 2 / 3 |
| Acceptance criteria: ≤3 / 4–8 / 9+ | 0 / 1 / 2 |
| Functionality inventory items: ≤5 / 6–20 / 21+ | 0 / 1 / 2 |
| Packages or services touched: 1 / 2 / 3+ | 0 / 1 / 2 |
| New or changed contract (API, schema, shared component props) | +1 |
| DB/data migration, auth, payments, PII, permissions | +2 |
| Migration run, or legacy scope > 10 files | +2 |
| Design fidelity target (Figma/design clone) | +1 |
| Open decisions after discovery (assumptions carried) | +1 per 2 |
| Unfamiliar area (no sibling example found by discovery) | +1 |
| Bug input: severity blocker/critical, or not yet reproducible | +1 / +2 |
| Issue type or labels say spike/research/refactor-wide | +1 |

Band: **0–3 S · 4–7 M · 8–11 L · 12+ XL**. XL tickets must be split by the planner; an XL run is always `full` mode.
Record the score, band and the signals that produced it in run-state `sizing` and on each ticket.

## 2. Pick model tier and effort per dispatch
Start from the work's criticality floor (model-policy), then:

| Band | Tier | Effort |
|---|---|---|
| S | floor | low (C0) · medium (C1/C2) |
| M | floor, C1 work may use sonnet→opus if the ticket touches a contract | medium · high for C2 |
| L | one tier above floor for C1 work (max opus) | high |
| XL (after split, per sub-ticket re-scored) | opus for C1/C2 | high · max for planning, root cause, security |

Agents without judgment (environment, git-manager, doc-writer, task-router) stay at their default regardless of band.
The **budget profile** (token-budget.md) decides how many dispatches a ticket gets; this table decides their model and effort.

## 3. Adjust for session usage (session-limits.md)
| Usage | Adjustment |
|---|---|
| < 50% | none |
| 50–69% | C0/C1: effort −1 step (not below low); send C0 bulk work to external/cheap models; skip optional second opinions |
| 70–84% | as above, and no new L/XL ticket starts in this session — checkpoint and resume fresh first |
| ≥ 85% | stop after the current call |
C2 work is never lowered in tier or effort for usage reasons: it waits for a fresh session instead.

## 4. Adjust on outcome
Failed attempt → +1 effort step, then +1 tier on the next failure (caps from gates.md still apply). Two clean
passes in a row on S tickets of the same kind → next similar ticket may drop one effort step (never below the floor).

## 5. Say it
Every dispatch records `{agent, model, effort, band, reason}` in run-state `cost`. The PLAN GATE shows the band per
ticket and the planned tier/effort; the user can override any of them. Under `gates-only` autonomy the choice is
automatic and logged.
