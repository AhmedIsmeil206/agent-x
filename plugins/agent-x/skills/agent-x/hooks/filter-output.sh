#!/usr/bin/env bash
# PreToolUse(Bash) hook: keep only failures + summary from test/build/lint output. Never blocks.
input="$(cat)"
[ "${AGENTX_FILTER:-1}" = "0" ] && { echo '{}'; exit 0; }
[ -f .agent-x/project.md ] && grep -qiE '^Filter:\s*off' .agent-x/project.md && { echo '{}'; exit 0; }
command -v node >/dev/null || { echo '{}'; exit 0; }
node -e '
const i = JSON.parse(process.argv[1] || "{}"); const c = i.tool_input?.command ?? "";
const re = /^(\s*(npx |pnpm |yarn |bun |npm run |npm )?(test|vitest|jest|mocha|playwright|tsc|eslint|lint|build)\b|\s*(pytest|go (test|build|vet)|cargo (test|build|clippy)|dotnet (test|build)|mvn |gradle|\.\/gradlew|mix test|rspec|phpunit|flutter test|swift test|xcodebuild))/;
if (!re.test(c) || /\|\s*(grep|tail|head)/.test(c)) { process.stdout.write("{}"); process.exit(0); }
const f = `set -o pipefail; ( ${c} ) 2>&1 | awk '"'"'/(FAIL|Error|ERROR|error[: ]|✗|✕|failed|panic|Traceback|AssertionError|expected|Exception)/{p=12} p>0{print; p--} {last[NR%25]=$0} END{print "--- summary ---"; for(i=NR-24;i<=NR;i++) if(i>0) print last[i%25]}'"'"' | tail -n 80`;
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "allow", updatedInput: { ...i.tool_input, command: f } } }));
' "$input" 2>/dev/null || echo '{}'
