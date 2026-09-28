---
name: init
description: >-
  Scan the current repo once and write .agent-x/project.md (stack, packages, commands, layout, conventions,
  reusable modules) for agent-x to use. Trigger on "/agent-x:init", "set up agent-x here", or when agent-x
  runs in a repo without .agent-x/project.md.
---

# agent-x:init

Goal: one confirmed file that saves every future run from rediscovering the repo.

1. **Detect packages.** Glob for manifests (skip node_modules, build dirs): `package.json`, `pnpm-workspace.yaml`,
   `turbo.json`, `nx.json`, `pyproject.toml`, `requirements*.txt`, `go.mod`, `Cargo.toml`, `pom.xml`,
   `build.gradle*`, `pubspec.yaml`, `Podfile`, `*.csproj`, `composer.json`, `Gemfile`, `app.json`/`app.config.*`.
2. **Classify each package** to a profile in `<AGENTX_HOME>/profiles/`:
   react-native/expo deps → `mobile-react-native`; react/next/vite/tanstack → `web-react`;
   express/fastify/nest/hono → `backend-node`; fastapi/django/flask → `backend-python`; any other language
   (Go, Rust, Java, Kotlin, Swift, Dart/Flutter, C#, PHP, Ruby, Elixir, Scala, C/C++…) → `generic` plus its row in
   `profiles/languages.md`. Record the language per package.
3. **Read commands, don't guess them.** From scripts/config: install, dev, build, test, lint, typecheck,
   e2e, dev port + health URL, docker compose services, seed script, simulator/emulator target. Also list the repo's
   own rule files (CLAUDE.md, AGENTS.md, CONTRIBUTING.md, .cursor/rules, lint/format config) — the implementer obeys them first. Mark any you cannot find as `unknown`.
4. **Sample conventions narrowly.** List top-level source dirs; read 2–3 representative files per package
   (a component/screen/route/handler and its test) to capture: folder layout, naming (kebab/Pascal/snake),
   data-layer pattern, state management, styling/design system, test framework, path aliases.
5. **Design system.** Find the project's design system per `<AGENTX_HOME>/references/design-system.md` (UI package,
   tokens/theme, component library, Storybook, icons, fonts, breakpoints) and record paths only.
5b. **Reusable inventory.** List shared component/module folders with a one-line purpose each (paths only).
6. **Optional project rules.** Ask whether there are rules to carry (legacy source repo + read-only,
   cutover mechanism, forbidden patterns such as "no code comments", RTL, SEO requirements).
7. **graphify.** Check `which graphify`. If missing, offer `uv tool install graphifyy` (or pipx). With the user's OK run `graphify extract .` at the repo root, and suggest `graphify-out/` in `.gitignore` and `graphify hook install`. Never block init on it.
8. **Git + Jira.** Record the default base branch, remote host (GitHub → gh, GitLab → glab; check `gh auth status`), CODEOWNERS path, PR template path, and the Jira project key if the user has one.
9. **Write** `.agent-x/project.md` using the template below, show it, and apply the user's corrections.
   Create empty `.agent-x/lessons.md`. Add `.agent-x/runs/` and `graphify-out/` to `.gitignore` (ask first); `project.md`, `lessons.md`, `CONTEXT.md`,
   `adr/`, `specs/` are meant to be committed and shared with the team.

```markdown
# agent-x project
## Packages
| path | profile | kind (web/mobile/backend) |
## Commands (per package)
install · dev · build · test · lint · typecheck · e2e
## Layout and conventions
## Reusable modules
## Project rules (override profile)
## Migration (optional: legacy_path, preset (none | forasna), read-only, which project rules apply (forasna preset: examples/forasna/rules), cutover files)
## Design system (package/path, tokens/theme files, component library, Storybook, icons, fonts, breakpoints, Figma library)
## Budget (lean | balanced | thorough; default lean) · Filter (on | off) · Hook (on | off)
## Autonomy (high-touch | normal | gates-only; default normal)
## Environment (dev command, port, health URL, docker compose file/profile, seed command, simulator/emulator target)
## Git (base branch, remote CLI, CODEOWNERS, PR template)
## Jira (project key, statuses for In Progress / In Review / Done)
## graphify (installed? index path)
## Cutover (optional)
## Design source defaults (optional)
```

Never modify source during init. Evidence for every command is the file:line where it was found.
