# Session and usage awareness

Signals, best first:
1. **Status-line feed** (installed by setup, opt-in): the status-line script receives Claude Code's JSON each
   refresh and writes it to `~/.claude/agent-x/usage.json`. Read it before each phase: context-window use %,
   session cost, model, and rate-limit/plan fields when the running version provides them. [Likely] field names
   differ between versions; read what is present and treat missing fields as unknown.
2. **Run counters**: dispatches and loop rounds in run-state (always available).
3. **The user**: `/usage` shows plan bars; when signals are missing, ask once at intake "How much of your
   session/weekly limit is left?" and at each gate if the run is long.

Thresholds (context use or plan use, whichever is known):
- **≥50%**: stop launching optional work (second opinions, extra audits beyond the mode); prefer C0/C1 and
  external large-context models for summarizing.
- **≥70%**: finish the current ticket, write a checkpoint + handoff, and tell the user to continue in a fresh
  session with `/agent-x:resume <id>`.
- **≥85% or a limit warning**: stop after the current tool call, write the checkpoint, never start a C2 step.

Handoff doc (written with every checkpoint, `.agent-x/runs/<id>/HANDOFF.md`): where we are, decisions, open
tickets/bugs, next step and the skills/agents to use — links to files instead of copies, no secrets.
If Claude Code offers to wait for a usage reset, that is the user's choice; run-state makes resuming lossless.
