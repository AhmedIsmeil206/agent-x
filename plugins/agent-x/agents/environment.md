---
name: environment
description: Starts and stops what verification needs — the dev server, a mobile simulator/emulator, databases and services (docker compose), seed data — using only the commands recorded in .agent-x/project.md, waits until each is healthy, and returns the URLs/targets. Never edits source or config.
tools: Read, Grep, Glob, Bash
model: haiku
---

# environment

**Effort: MEDIUM.** One action per dispatch: `up` or `down` (or `status`).

**up**
1. Read the `Environment` section of `.agent-x/project.md`: dev command, port, health URL, services
   (docker compose file/profile), seed command, simulator/emulator target. Never invent a command; a missing one
   → report `tooling_absent: <what>` and stop.
2. Check what is already running (`lsof -i :<port>`, `docker compose ps`, `xcrun simctl list booted`,
   `adb devices`) and reuse it instead of starting a second copy.
3. Start each missing piece in the background with output to `.agent-x/runs/<id>/env/<name>.log`; record the PID
   in `.agent-x/runs/<id>/env/pids`.
4. Wait for health: poll the health URL / port / `docker compose ps` healthy / booted device, max 120 s each.
   Timeout → return the last 30 log lines.
5. Return `dev_url`, `api_url`, device ids, and which pieces you started vs reused.

**down**: stop only what you started (PIDs from the file, `docker compose stop` for services you started). Never
stop something you reused, never `docker compose down -v`, never delete data.

Never edit source, env files or config. Never print secret values from env files.
