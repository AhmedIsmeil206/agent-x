#!/usr/bin/env bash
# usage: deps.sh [--check] [--yes]
set -uo pipefail
CHECK=0; YES=0
for a in "$@"; do case "$a" in --check) CHECK=1;; --yes|-y) YES=1;; esac; done
OS="$(uname -s)"; PM=""
if [ "$OS" = "Darwin" ]; then command -v brew >/dev/null && PM=brew
else for p in apt-get dnf pacman zypper; do command -v $p >/dev/null && { PM=$p; break; }; done; fi
MISSING=0
ok(){ printf "  \033[32mok\033[0m      %s\n" "$1"; }
miss(){ printf "  \033[33mmissing\033[0m %s\n" "$1"; MISSING=$((MISSING+1)); }
ask(){ [ $CHECK = 1 ] && return 1; [ $YES = 1 ] && return 0
  while true; do read -r -p "  install $1? [y/n] " r </dev/tty
    case "$r" in [Yy]|[Yy][Ee][Ss]) return 0;; [Nn]|[Nn][Oo]|"") return 1;; *) echo "  please answer y or n";; esac; done; }
ensure_uv(){ command -v uv >/dev/null && return 0
  if [ "$PM" = brew ]; then brew install uv; else curl -LsSf https://astral.sh/uv/install.sh | sh; fi
  export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"; command -v uv >/dev/null; }
install_graphify(){
  if ensure_uv; then uv tool install graphifyy && export PATH="$HOME/.local/bin:$PATH"
  elif command -v pipx >/dev/null || { [ "$PM" = brew ] && brew install pipx; }; then pipx install graphifyy && export PATH="$HOME/.local/bin:$PATH"
  else echo "  could not install uv or pipx; install one of them, then run: uv tool install graphifyy"; return 1; fi
  command -v graphify >/dev/null || { echo "  graphify installed to ~/.local/bin — add it to PATH: echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc"; return 1; }; }
pkg(){ case "$PM" in
  brew) brew install "$@";;
  apt-get) sudo apt-get update -qq && sudo apt-get install -y "$@";;
  dnf) sudo dnf install -y "$@";; pacman) sudo pacman -S --noconfirm "$@";; zypper) sudo zypper -n install "$@";;
  *) echo "  no supported package manager; install $* manually"; return 1;; esac; }
need(){ local name="$1" test="$2" install="$3"
  if eval "$test" >/dev/null 2>&1; then ok "$name"; else miss "$name"; ask "$name" && eval "$install" && ok "$name (installed)"; fi; }

echo "agent-x requirements ($OS, package manager: ${PM:-none})"
if [ "$OS" = "Darwin" ] && [ -z "$PM" ]; then miss "Homebrew (needed to install the rest on macOS)"
  ask "Homebrew" && /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" && PM=brew; fi
need git "command -v git" "pkg git"
need "node >= 18" "node -e 'process.exit(+process.versions.node.split(\".\")[0]>=18?0:1)'" "pkg node || pkg nodejs npm"
need "claude (Claude Code CLI)" "command -v claude" "npm install -g @anthropic-ai/claude-code"
need "gh (GitHub CLI)" "command -v gh" "pkg gh"
if command -v gh >/dev/null && ! gh auth status >/dev/null 2>&1; then miss "gh login"; ask "gh login (opens browser)" && gh auth login; fi
need "graphify (installs uv first if needed)" "command -v graphify || [ -x \"\$HOME/.local/bin/graphify\" ]" "install_graphify"
for c in gemini codex ollama llm; do command -v $c >/dev/null && ok "external LLM CLI: $c"; done

if command -v claude >/dev/null; then
  MCPS="$(claude mcp list 2>/dev/null || true)"
  mcp(){ local n="$1"; shift; if grep -qi "^$n" <<<"$MCPS"; then ok "MCP $n"; else miss "MCP $n"; ask "MCP $n" && claude mcp add "$@" && ok "MCP $n (added)"; fi; }
  mcp chrome-devtools --scope user chrome-devtools -- npx -y chrome-devtools-mcp@latest
  mcp atlassian --scope user --transport http atlassian https://mcp.atlassian.com/v1/mcp
  mcp figma --scope user --transport http figma https://mcp.figma.com/mcp
  if grep -qi "^pal" <<<"$MCPS"; then ok "MCP pal (multi-LLM)"; else miss "MCP pal (optional: Gemini/OpenAI/OpenRouter/Ollama via one server)"
    if ask "MCP pal"; then claude mcp add pal --scope user -- bash -c "uvx --from git+https://github.com/BeehiveInnovations/pal-mcp-server.git pal-mcp-server" && ok "MCP pal (added — set GEMINI_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY or run Ollama for it to find models)"; fi; fi
  echo "  note: Atlassian and Figma ask you to sign in the first time Claude Code uses them."
fi
echo
[ $MISSING = 0 ] && echo "All requirements present." || echo "$MISSING item(s) were missing (see above). Optional ones (graphify, MCPs) never block agent-x; it reports them as tooling_absent."
[ $CHECK = 0 ] && mkdir -p "$HOME/.claude/agent-x" && date > "$HOME/.claude/agent-x/.setup-done" 2>/dev/null
exit 0
