#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';

const SKIP = /[\\/](node_modules|dist|build|\.output|\.next|Pods|\.gradle|venv|\.venv|__pycache__)[\\/]|routeTree\.gen\.ts$|\.lock$|lock\.json$/;

function findUp(start, names) {
  let dir = start;
  for (;;) {
    for (const n of names) if (existsSync(join(dir, n))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function has(cmd) {
  try { execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' }); return true; } catch { return false; }
}

function run(cmd, args, cwd) {
  try { execFileSync(cmd, args, { cwd, stdio: ['ignore', 'inherit', 'inherit'], timeout: 45000 }); } catch {}
}

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let file = '';
  try { file = JSON.parse(raw)?.tool_input?.file_path ?? ''; } catch {}
  if (process.env.AGENTX_HOOK === '0') process.exit(0);
  if (!file || SKIP.test(file) || !existsSync(file)) process.exit(0);
  const pm = findUp(dirname(file), ['.agent-x']);
  if (pm) { try { if (/^Hook:\s*off/mi.test(readFileSync(join(pm, '.agent-x', 'project.md'), 'utf8'))) process.exit(0); } catch {} }
  const ext = extname(file);

  if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
    const root = findUp(dirname(file), ['package.json']);
    if (!root) process.exit(0);
    let pkg = {};
    try { pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')); } catch {}
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.eslint) run('npx', ['--no-install', 'eslint', '--fix', file], root);
    else if (deps['@biomejs/biome']) run('npx', ['--no-install', 'biome', 'check', '--write', file], root);
  } else if (ext === '.py') {
    const root = findUp(dirname(file), ['pyproject.toml', 'setup.cfg', 'requirements.txt']) ?? dirname(file);
    if (has('ruff')) run('ruff', ['check', '--fix', file], root);
  } else {
    const d = dirname(file);
    const byExt = {
      '.go': [['gofmt', ['-w', file]]],
      '.rs': [['rustfmt', ['--edition', '2021', file]]],
      '.kt': [['ktlint', ['-F', file]]], '.kts': [['ktlint', ['-F', file]]],
      '.swift': [['swiftformat', [file]]],
      '.dart': [['dart', ['format', file]]],
      '.rb': [['rubocop', ['-a', file]]],
      '.php': [['php-cs-fixer', ['fix', file]]],
      '.ex': [['mix', ['format', file]]], '.exs': [['mix', ['format', file]]],
      '.cs': [['dotnet', ['format', 'whitespace', '--include', file]]],
      '.c': [['clang-format', ['-i', file]]], '.cpp': [['clang-format', ['-i', file]]], '.h': [['clang-format', ['-i', file]]],
      '.scala': [['scalafmt', [file]]],
    };
    for (const [cmd, args] of byExt[ext] ?? []) if (has(cmd)) run(cmd, args, d);
  }
  process.exit(0);
});
