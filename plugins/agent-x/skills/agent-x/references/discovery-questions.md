# Discovery — PM and business questions before any implementation

Run by `product-analyst` after intake and before planning, for standard/full/migration runs (quick: only if the
input has no clear user or success measure). Uses the grilling method:

- Work in **rounds**. The **frontier** = every open decision whose prerequisites are settled. Ask the whole
  frontier at once, numbered, each with a **recommended answer** and why.
- **Facts are ours, decisions are the user's.** Anything answerable from the code, docs, Jira, analytics or the
  legacy app is looked up (discovery, graphify, requirements-reader), never asked.
- Each answer reshapes the tree; recompute the frontier. Stop when the frontier is empty — nothing left assumed.
- Record answers as they land: glossary terms and domain rules in `.agent-x/CONTEXT.md`, hard-to-reverse
  choices as ADRs in `.agent-x/adr/NNNN-<slug>.md` (context · decision · alternatives · consequences).
- **Cap: 3 rounds** (quick: 1, and only when needed). After the cap, remaining open decisions go into the plan as
  explicit, visible assumptions with the recommended answer, and the PLAN GATE lists them for the user to accept.
  The user can say "skip discovery" at any time; record that as a decision.
- Anything only a third party can answer → `to-questionnaire`: write `.agent-x/runs/<id>/questions-for-<who>.md`
  and mark dependent tickets `blocked`.

## Question bank (pick what applies; never ask what the input already answers)
**Problem & users** — who exactly uses this, in which role; what are they doing today instead; what pain does
this remove; what happens if we don't build it.
**Outcome** — what does success look like in numbers (conversion, time saved, errors, revenue); how will we
measure it; what analytics events are needed.
**Scope** — the smallest version that delivers the outcome (MVP); what is explicitly out; what can ship later.
**Business rules** — permissions and roles, limits and quotas, pricing/billing effects, legal/compliance (GDPR,
PII, consent, data retention), localization/RTL, time zones, currency.
**Edge cases** — empty, first-time, huge data, concurrent edits, offline/slow network, failure and retry,
partial success, undo, deletion and what happens to related data.
**Dependencies** — other teams, APIs, contracts, feature flags, release timing, marketing/support needs.
**Risk** — what is expensive to reverse; what could hurt users or data; rollout plan (flag, %, beta).
**Non-functional** — performance budget, accessibility level, supported browsers/devices/OS versions, SEO.
**Acceptance** — who signs off; which ACs are must-have vs nice-to-have.

Output to the planner: resolved decisions, glossary, ADR paths, success metrics, MVP scope, open third-party
questions. The planner may not plan a ticket that depends on an unresolved decision.
