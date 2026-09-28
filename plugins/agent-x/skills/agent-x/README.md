# agent-x

Gated multi-agent engineering engine for Claude Code, for any stack and language. Full guide (install, sequence,
every command and agent): see the team guide page, or the files in `references/`.

## Install
Plugin (team): `claude plugin marketplace add AhmedIsmeil206/agent-x` then `claude plugin install agent-x@agent-x`.
Global skill (single machine): `bash global/install.sh` from the source folder. Use one of the two, not both.

## Commands (plugin names; the global install uses `/agent-x-<name>`)
`/agent-x:agent-x <Jira key | spec | text>` · `/agent-x:init` · `/agent-x:models` · `/agent-x:spec` ·
`/agent-x:review` · `/agent-x:audit` · `/agent-x:resume <id>` · `/agent-x:rollback <id>`

## Team use of `.agent-x/`
Commit: `project.md`, `lessons.md`, `CONTEXT.md`, `adr/`, `specs/`, `follow-ups.md`.
Ignore: `runs/` (per-person working state) and `graphify-out/`. Run ids are `<YYMMDD>-<user>-<slug>` so two
people never collide. `lessons.md` is append-only, one line per lesson, so merges stay trivial.

## Lint hook
Formats only the file just edited, when the project has that formatter. Turn it off per repo with
`Hook: off` in `.agent-x/project.md`, or per shell with `AGENTX_HOOK=0`.
