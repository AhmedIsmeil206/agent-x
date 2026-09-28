#!/usr/bin/env bash
# usage: evals/run.sh <fixture-repo-path> "<task or Jira key or spec path>"
# Runs agent-x headless in DRY-RUN mode on a throwaway copy of the fixture, then checks the invariants.
# It spends real tokens (one dry run). It never touches the original fixture.
set -uo pipefail
SRC="$1"; TASK="$2"; W="$(mktemp -d)/fixture"
cp -R "$SRC" "$W" && cd "$W" || exit 2
git rev-parse --git-dir >/dev/null 2>&1 || { git init -q && git add -A && git commit -qm fixture; }
BR_BEFORE="$(git branch --list | wc -l)"
CMD="/agent-x"; claude plugin list 2>/dev/null | grep -q "agent-x@" && CMD="/agent-x:agent-x"
claude -p "$CMD $TASK — dry run, autonomy gates-only, answer your own intake questions with the recommended defaults and state them" --permission-mode acceptEdits > .agentx-eval.log 2>&1
fail=0; chk(){ if eval "$2"; then echo "PASS $1"; else echo "FAIL $1"; fail=1; fi; }
RS="$(ls -d .agent-x/runs/*/ 2>/dev/null | tail -1)"
chk "run-state created" "[ -n \"$RS\" ] && [ -f \"$RS/run-state.json\" ]"
chk "dry_run recorded" "grep -q '\"dry_run\": *true' \"$RS/run-state.json\""
chk "engine_version recorded" "grep -q '\"engine_version\"' \"$RS/run-state.json\""
chk "PLAN.md written" "[ -f \"$RS/PLAN.md\" ]"
chk "tickets written" "ls \"$RS\"/tickets/T-*.md >/dev/null 2>&1"
chk "every ticket has ACs" "! grep -L -i 'acceptance' \"$RS\"/tickets/T-*.md 2>/dev/null | grep -q ."
chk "no branch created" "[ \"$(git branch --list | wc -l)\" = \"$BR_BEFORE\" ]"
chk "no source edited" "[ -z \"$(git status --porcelain | grep -v '^?? .agent-x/' | grep -v '.agentx-eval.log' | grep -v graphify-out)\" ]"
echo "workspace: $W (log: .agentx-eval.log)"; exit $fail
