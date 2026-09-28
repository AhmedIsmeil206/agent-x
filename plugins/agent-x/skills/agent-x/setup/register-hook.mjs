import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const f = join(process.env.HOME, '.claude', 'settings.json');
const cmd = `node "${join(HERE, '..', 'hooks', 'quality-check.mjs')}"`;
let s = {};
if (existsSync(f)) { copyFileSync(f, f + '.agent-x.bak'); s = JSON.parse(readFileSync(f, 'utf8')); }
s.hooks ??= {}; s.hooks.PostToolUse ??= [];
s.hooks.PreToolUse ??= [];
if (!JSON.stringify(s.hooks.PostToolUse).includes('quality-check.mjs')) s.hooks.PostToolUse.push({ matcher: 'Write|Edit|MultiEdit', hooks: [{ type: 'command', command: cmd, timeout: 60 }] });
const filt = `bash "${join(HERE, '..', 'hooks', 'filter-output.sh')}"`;
if (!JSON.stringify(s.hooks.PreToolUse).includes('filter-output.sh')) s.hooks.PreToolUse.push({ matcher: 'Bash', hooks: [{ type: 'command', command: filt, timeout: 10 }] });
writeFileSync(f, JSON.stringify(s, null, 2));
console.log('hook registered in ~/.claude/settings.json (backup: settings.json.agent-x.bak)');
