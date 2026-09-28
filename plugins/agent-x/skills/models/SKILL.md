---
name: models
description: >-
  Discover and register every LLM available on this device (Claude tiers, PAL MCP models, gemini/codex/ollama/llm/
  aider/opencode CLIs) so agent-x can route each task to the most suitable and cheapest model. Trigger on
  "/agent-x:models", "which models can agent-x use", "add a model", "refresh models".
---

# agent-x:models

1. Dispatch `llm-broker discover`. Show the registry as a table: model · provider · local/hosted · cost class · context.
2. Ask the user, in one message: which models they're willing to use for (a) C0 bulk summarizing, (b) second-
   opinion reviews, (c) research; whether hosted external models may see this project's code (per project, saved
   in `.agent-x/project.md` → `External models`); any model to exclude.
3. Save the choices into `~/.claude/agent-x/models.json` (`allowed_for`, `excluded`) and the per-project answer
   into project.md. Never store API keys; point to the provider's own env/config.
4. To add a provider not present: suggest PAL MCP (`claude mcp add pal ...`, see setup/deps.sh) or the provider's
   CLI, and say which env key it needs — the user sets keys themselves.
