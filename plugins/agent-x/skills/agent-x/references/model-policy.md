# Model policy (rule guard) — right model for the importance of the task

The orchestrator applies this before EVERY dispatch and can override an agent's default with the Agent tool's
`model` parameter. Agents' frontmatter models are defaults, not permissions.

## Criticality tiers
| Tier | What | Default model | Examples |
|---|---|---|---|
| C0 mechanical | no judgment, easy to verify | haiku, or a cheap/local external model | file finding, graph queries, formatting, renames, log/test-output summarizing, board updates, changelog |
| C1 bounded | clear inputs, local reasoning | sonnet | tests in an existing pattern, small diffs (≤50 lines) review, a11y sweep, contract diff, docs, intake parsing |
| C2 critical | contracts, security, design, money, data, ambiguous root causes | opus | planning, product discovery, implementation of new modules, security audit, root cause of non-obvious bugs, UI fidelity, migration scope |

Tier and effort per dispatch are then adjusted by complexity band and session usage in `sizing.md`.

## Guard rules
1. Pick the lowest tier that the work allows; state the tier on the ticket (`model_tier`).
2. **Escalate** one tier after a failed attempt at the current tier (never two levels, never on the first try
   for C0/C1). **Never downgrade** C2 work because budget is low: stop and tell the user instead.
3. Security, auth, payments, PII, data migrations and production cutover are always C2 regardless of size.
4. Don't send the same inputs to two agents "to double check" unless the plan calls for a second opinion.
5. When the session is near its limit (session-limits.md), finish the current C2 step, then prefer checkpoint +
   resume over downgrading.

## Beyond Claude — the model registry
`llm-broker` builds `~/.claude/agent-x/models.json` (per device; refresh with `/agent-x:models`):
- **Claude tiers** (always): opus, sonnet, haiku as subagent models.
- **PAL MCP** (if connected): its `listmodels` tool — Gemini, OpenAI, Grok, OpenRouter, Azure, Ollama, custom.
- **CLIs on PATH**: `gemini`, `codex`, `ollama` (`ollama list`), `llm` (`llm models`), `aider`, `opencode`.
- For each: name · provider · how to call · context size (if known) · cost class (free-local / cheap / standard /
  premium) · strengths the user confirms.

What external models may do (they have no Claude Code tools and must be sent their inputs):
- C0 work on large inputs: summarizing big logs, CI output, long docs or legacy files (a large-context model
  saves Claude context); classifying review comments; drafting changelog/PR text.
- Second opinions: an independent review or `consensus` on a C2 decision, root-cause hypotheses, a plan critique.
- Research lookups when the model has web access.

What stays with Claude agents: every source edit (implementer), git (git-manager), gates, and any step that must
use tools on this machine. External output is advisory: a Claude agent verifies it before it changes anything.
Never send secrets, `.env` content or customer data to an external model; ask before sending proprietary code
to a hosted (non-local) model the first time in a project, and record the answer in project.md.
