#!/usr/bin/env node
// usage: style-diff.mjs <sourceUrl> <buildUrl> <selectorsFile|-> [widths=375,768,1280] [out.json]
// Renders both pages headless and diffs computed styles per selector and width. Needs Playwright
// (npm i -g playwright, or a local install). Prints only mismatches so the model never reads full dumps.
const [src, build, selFile = '-', widthsArg = '375,768,1280', out] = process.argv.slice(2);
if (!src || !build) { console.error('usage: style-diff.mjs <sourceUrl> <buildUrl> <selectorsFile|-> [widths] [out.json]'); process.exit(2); }
let pw; try { pw = await import('playwright'); } catch { console.log(JSON.stringify({ tooling_absent: 'playwright' })); process.exit(3); }
const { readFileSync, writeFileSync } = await import('node:fs');
const selectors = selFile === '-' ? ['body *'] : readFileSync(selFile, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const PROPS = ['display','position','width','height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left','font-family','font-size','font-weight','line-height','letter-spacing','color','background-color','border-top-width','border-radius','box-shadow','gap','text-align','direction','opacity'];
const browser = await pw.chromium.launch();
const grab = async (url, width) => {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  const data = await page.evaluate(({ selectors, PROPS }) => {
    const r = {};
    for (const s of selectors) [...document.querySelectorAll(s)].slice(0, 200).forEach((el, i) => {
      const cs = getComputedStyle(el); r[`${s}#${i}`] = Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
    });
    return r;
  }, { selectors, PROPS });
  await page.close(); return data;
};
const report = { widths: {}, checks: 0, mismatches: 0 };
for (const w of widthsArg.split(',').map(Number)) {
  const [a, b] = [await grab(src, w), await grab(build, w)]; const diffs = [];
  for (const k of Object.keys(a)) for (const p of PROPS) { report.checks++; const va = a[k]?.[p], vb = b[k]?.[p];
    if (va !== vb) { report.mismatches++; diffs.push({ el: k, prop: p, source: va ?? null, build: vb ?? null }); } }
  report.widths[w] = diffs.slice(0, 150);
}
await browser.close();
report.score = report.checks ? +(1 - report.mismatches / report.checks).toFixed(4) : null;
if (out) writeFileSync(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ score: report.score, checks: report.checks, mismatches: report.mismatches, top: Object.fromEntries(Object.entries(report.widths).map(([w, d]) => [w, d.slice(0, 15)])) }));
