import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
const f = join(process.env.HOME, '.claude', 'settings.json');
const script = join(HERE, 'usage-feed.sh');
let s = {};
if (existsSync(f)) { copyFileSync(f, f + '.agent-x.bak'); s = JSON.parse(readFileSync(f, 'utf8')); }
const prev = s.statusLine?.command;
if (prev && prev.includes('usage-feed.sh')) { console.log('status-line feed already registered'); process.exit(0); }
const cmd = prev ? `AGENTX_PREV_STATUSLINE=${JSON.stringify(prev)} bash "${script}"` : `bash "${script}"`;
s.statusLine = { type: 'command', command: cmd };
writeFileSync(f, JSON.stringify(s, null, 2));
console.log(prev ? 'status-line feed registered (your previous status line is kept and still shown)' : 'status-line feed registered');
