#!/usr/bin/env node
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const CURRENT = '1.6.0';
const file = process.argv[2];
if (!file) { console.error('usage: migrate-run-state.mjs <run-state.json>'); process.exit(2); }
const s = JSON.parse(readFileSync(file, 'utf8'));
const from = s.engine_version ?? '1.0.0';
if (from === CURRENT) { console.log(`up to date (${CURRENT})`); process.exit(0); }
copyFileSync(file, `${file}.v${from}.bak`);
const add = (k, v) => { if (s[k] === undefined) s[k] = v; };
add('counters', { back_edges: 0, inner_loops: {}, human_changes: 0 });
add('budget', { max_dispatches: 25, used: 0 });
add('git', {}); add('jira', {}); add('root_causes', []);
add('input', { kind: 'pasted', ref: '' }); add('dry_run', false);
add('pr_loop', { ci_rounds: 0, review_rounds: 0, open_comments: [] }); add('cost', []);
add('environment', {}); add('follow_ups', []);
add('discovery', { rounds: 0, frontier_empty: false });
add('tickets', []); add('bugs', []); add('session', { source: 'unknown' });
add('autonomy', 'normal'); add('decisions', []);
if (s.phase === 'Build' && s.tickets.length === 0) s.decisions.push({ at: new Date().toISOString(), decision: 'migrated from pre-ticket run: remaining PLAN phases treated as one ticket each', by: 'migrate-run-state' });
s.engine_version = CURRENT;
writeFileSync(file, JSON.stringify(s, null, 2));
console.log(`migrated ${from} → ${CURRENT} (backup: ${file}.v${from}.bak)`);
