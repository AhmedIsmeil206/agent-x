#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';

const [, , cmd, ...args] = process.argv;
const die = (m, c = 1) => { console.error(m); process.exit(c); };
const readJSON = (f, d = {}) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return d; } };
const writeJSON = (f, o) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(o, null, 2)); };
const git = (a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const home = process.env.HOME;

const cmds = {
  commit(runDir, message, ...paths) {
    if (!runDir || !message || !paths.length) die('usage: ax commit <runDir> "<message>" <path>...');
    const rs = readJSON(join(runDir, 'run-state.json'));
    const base = rs.git?.base; const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    if (base && branch === base) die(`refusing to commit on the base branch ${base}`);
    const bad = paths.filter((p) => /(^|\/)\.env(\.|$)|\.pem$|id_rsa|secrets?\./i.test(p));
    if (bad.length) die(`refusing to commit secret-looking files: ${bad.join(', ')}`);
    const locked = rs.locked_paths ?? [];
    const outside = locked.length ? paths.filter((p) => !locked.some((l) => p === l || p.startsWith(l.replace(/\*+$/, '')))) : [];
    if (outside.length) die(`not in locked_paths: ${outside.join(', ')}`);
    execFileSync('git', ['add', '--', ...paths], { stdio: 'inherit' });
    execFileSync('git', ['commit', '-m', message], { stdio: 'inherit' });
    const sha = git(['rev-parse', 'HEAD']);
    rs.git = { ...(rs.git ?? {}), commits: [...(rs.git?.commits ?? []), sha] }; writeJSON(join(runDir, 'run-state.json'), rs);
    console.log(sha);
  },
  env(action, runDir) {
    const pm = readFileSync('.agent-x/project.md', 'utf8');
    const get = (k) => (pm.match(new RegExp(`^\\s*[-*]?\\s*${k}\\s*[:=]\\s*(.+)$`, 'mi')) ?? [])[1]?.trim().replace(/^`|`$/g, '');
    const dev = get('dev'), url = get('health') ?? get('dev_url'), compose = get('compose');
    const pidf = join(runDir ?? '.agent-x', 'env', 'pids');
    if (action === 'status' || action === 'up') {
      const up = url ? (() => { try { execFileSync('curl', ['-sf', '-o', '/dev/null', '--max-time', '3', url]); return true; } catch { return false; } })() : false;
      if (action === 'status' || up) { console.log(JSON.stringify({ dev_url: url, up, started: [] })); return; }
      if (!dev) die('project.md has no dev command (Environment section: "dev: <command>")', 3);
      mkdirSync(dirname(pidf), { recursive: true });
      if (compose) execFileSync('docker', ['compose', '-f', compose, 'up', '-d'], { stdio: 'inherit' });
      const p = spawn('bash', ['-c', dev], { detached: true, stdio: ['ignore', 'ignore', 'ignore'] }); p.unref();
      appendFileSync(pidf, `${p.pid}\n`);
      for (let i = 0; i < 60 && url; i++) { try { execFileSync('curl', ['-sf', '-o', '/dev/null', '--max-time', '2', url]); console.log(JSON.stringify({ dev_url: url, up: true, started: ['dev'] })); return; } catch { execFileSync('sleep', ['2']); } }
      die(`dev server not healthy at ${url} after 120s`, 4);
    }
    if (action === 'down') {
      if (existsSync(pidf)) for (const pid of readFileSync(pidf, 'utf8').split('\n').filter(Boolean)) { try { process.kill(-Number(pid)); } catch { try { process.kill(Number(pid)); } catch {} } }
      writeFileSync(pidf, ''); console.log('stopped what agent-x started');
    }
  },
  board(runDir) {
    const tdir = join(runDir, 'tickets'); if (!existsSync(tdir)) die('no tickets/');
    const files = readdirSync(tdir); const field = (t, k) => (t.match(new RegExp(`^\\s*${k}:\\s*(.+)$`, 'mi')) ?? [])[1]?.trim() ?? '';
    const bugs = files.filter((f) => f.startsWith('BUG-')).map((f) => readFileSync(join(tdir, f), 'utf8'));
    const rows = files.filter((f) => f.startsWith('T-')).sort().map((f) => {
      const t = readFileSync(join(tdir, f), 'utf8'); const id = f.split('-').slice(0, 2).join('-');
      const open = bugs.filter((b) => field(b, 'ticket').includes(id) && !/closed|verified|wontfix/.test(field(b, 'status')));
      const tcs = (t.match(/TC-\d+-\d+/g) ?? []).length; const pass = (t.match(/TC-\d+-\d+[^\n]*\bpass\b/gi) ?? []).length;
      return `| ${id} | ${field(t, 'status')} | ${field(t, 'blocked_by') || '-'} | ${field(t, 'band')} | ${open.length} | ${pass}/${tcs} |`;
    });
    const md = `| ticket | status | blocked by | band | open bugs | TCs pass |\n|---|---|---|---|---|---|\n${rows.join('\n')}\n`;
    writeFileSync(join(runDir, 'board.md'), md); console.log(md);
  },
  size(...pairs) {
    const p = Object.fromEntries(pairs.map((x) => x.split('='))); const n = (k) => Number(p[k] ?? 0);
    let s = 0; const sp = n('points'); s += sp >= 13 ? 3 : sp >= 8 ? 2 : sp >= 3 ? 1 : 0;
    const ac = n('acs'); s += ac >= 9 ? 2 : ac >= 4 ? 1 : 0; const inv = n('inventory'); s += inv >= 21 ? 2 : inv >= 6 ? 1 : 0;
    const pk = n('packages'); s += pk >= 3 ? 2 : pk === 2 ? 1 : 0;
    s += n('contract') + 2 * n('risk') + 2 * n('migration') + n('design') + Math.floor(n('open') / 2) + n('unfamiliar') + n('bug') + n('spike');
    const band = s >= 12 ? 'XL' : s >= 8 ? 'L' : s >= 4 ? 'M' : 'S'; console.log(JSON.stringify({ score: s, band }));
  },
  mapping(runDir) {
    const f = join(runDir, 'MAPPING.md'); if (!existsSync(f)) die('no MAPPING.md');
    const rows = readFileSync(f, 'utf8').split('\n').filter((l) => /^\|\s*M-\d+/.test(l)).map((l) => l.split('|').map((c) => c.trim()));
    const by = {}; for (const r of rows) by[r[4]] = (by[r[4]] ?? 0) + 1;
    const noEv = rows.filter((r) => r[4] === 'mapped' && (!r[6] || r[6] === '-' || r[6] === '—')).map((r) => r[1]);
    const noTk = rows.filter((r) => !r[7] || r[7] === '-').map((r) => r[1]);
    const out = { rows: rows.length, by_status: by, pending: by.pending ?? 0, mapped_without_evidence: noEv, without_ticket: noTk };
    console.log(JSON.stringify(out, null, 2));
  },
  cost(runDir, agent, model, effort, band) {
    const u = readJSON(join(home, '.claude/agent-x/usage.json'), null); const now = u?.cost?.total_cost_usd ?? null;
    const f = join(runDir, 'run-state.json'); const rs = readJSON(f); rs.cost ??= [];
    const prev = rs._last_cost_mark ?? null; const delta = now != null && prev != null ? +(now - prev).toFixed(4) : null;
    rs.cost.push({ agent, model, effort, band, dispatches: 1, cost_delta_usd: delta, at: new Date().toISOString() });
    if (now != null) rs._last_cost_mark = now; writeJSON(f, rs); console.log(JSON.stringify({ delta }));
  },
};
if (!cmds[cmd]) die('usage: ax <commit|env|board|size|mapping|cost> ...  (see references/token-budget.md)', 2);
cmds[cmd](...args);
