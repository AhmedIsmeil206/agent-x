#!/usr/bin/env bash
# Status-line script: saves Claude Code's status JSON for agent-x session awareness, then prints a short line.
# If AGENTX_PREV_STATUSLINE is set (your previous status-line command), its output is shown instead.
mkdir -p "$HOME/.claude/agent-x"
input="$(cat)"
printf '%s' "$input" > "$HOME/.claude/agent-x/usage.json.tmp" && mv "$HOME/.claude/agent-x/usage.json.tmp" "$HOME/.claude/agent-x/usage.json"
if [ -n "${AGENTX_PREV_STATUSLINE:-}" ]; then printf '%s' "$input" | bash -c "$AGENTX_PREV_STATUSLINE"; exit 0; fi
node -e '
let j={};try{j=JSON.parse(process.argv[1])}catch{}
const m=j.model?.display_name??"";const c=j.context_window?.used_percentage;const cost=j.cost?.total_cost_usd;
const parts=[m];if(c!=null)parts.push(`ctx ${Math.round(c)}%`);if(cost!=null)parts.push(`$${cost.toFixed(2)}`);
process.stdout.write(parts.filter(Boolean).join(" · "));' "$input" 2>/dev/null || true
