# agent-x (team marketplace)

## Install (each teammate)
```
claude plugin marketplace add AhmedIsmeil206/agent-x
claude plugin install agent-x@agent-x
```
Restart Claude Code, then run the setup once per machine:
```
bash "$(ls -d ~/.claude/plugins/cache/agent-x/agent-x/*/ | tail -1)skills/agent-x/setup/deps.sh"
```
(or just run `/agent-x` — the first run offers the same check). Then `/agent-x:models` once, and `/agent-x:init`
inside each repo.

## Update
`claude plugin marketplace update agent-x` then `claude plugin update agent-x@agent-x`.

## Commands
`/agent-x:agent-x <task | Jira key | spec>` · `/agent-x:init` · `/agent-x:spec` · `/agent-x:review` · `/agent-x:audit`
· `/agent-x:resume` · `/agent-x:rollback` · `/agent-x:models`
