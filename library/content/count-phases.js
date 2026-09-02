#!/usr/bin/env node
// ================================================
// Knell — five-phase coverage counter.  NOT LOADED BY THE APP.
// ------------------------------------------------
//   node library/content/count-phases.js
//
// Counts how many chunks actually carry predict and recall. Both are
// OPTIONAL in the schema (see phasesFor in library/library.js), so a
// chunk without them silently runs the old three-phase flow — and the
// two it drops are the two with the strongest evidence behind them:
// the pretesting effect and the generation effect.
//
// First run, 2026-09-02: 33 of 171 chunks had all five. 81% were
// running three. That is not an engine problem, it is content, and it
// dwarfed every improvement on the research shortlist at the time.
// ================================================
const fs = require("fs"), path = require("path"), vm = require("vm");
const CONTENT = path.resolve(process.cwd(), "library", "content");

function loadModules(dir) {
  const files = fs.readdirSync(dir).filter(f => /^data_m\d+\.js$/.test(f)).sort();
  const ctx = { console: { log(){}, warn(){}, error(){}, info(){} } };
  vm.createContext(ctx);
  const mods = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8")
      .replace(/^\s*const\s+(MODULE_\w+)/m, "globalThis.$1");
    const before = new Set(Object.keys(ctx));
    try { vm.runInContext(src, ctx, { filename: f }); } catch (e) { continue; }
    const name = Object.keys(ctx).find(k => !before.has(k) && /^MODULE_/.test(k));
    if (name) mods.push({ file: f, mod: ctx[name] });
  }
  return mods;
}

const courses = fs.readdirSync(CONTENT)
  .filter(f => !f.startsWith("_") && !f.endsWith(".md") && !f.endsWith(".js"))
  .filter(f => fs.statSync(path.join(CONTENT, f)).isDirectory()).sort();

let total = 0, withPredict = 0, withRecall = 0, withBoth = 0;
const byCourse = {};

for (const c of courses) {
  const mods = loadModules(path.join(CONTENT, c));
  if (!mods.length) continue;
  const s = { chunks: 0, predict: 0, recall: 0, both: 0 };
  for (const { mod } of mods) {
    for (const t of (mod.topics || [])) {
      for (const ch of (t.chunks || [])) {
        s.chunks++; total++;
        const p = !!ch.predict, r = !!ch.recall;
        if (p) { s.predict++; withPredict++; }
        if (r) { s.recall++; withRecall++; }
        if (p && r) { s.both++; withBoth++; }
      }
    }
  }
  byCourse[c] = s;
}

const pct = (n) => total ? Math.round(n / total * 100) : 0;
console.log("chunk  predict  recall  both   course");
for (const [c, s] of Object.entries(byCourse)) {
  console.log(String(s.chunks).padStart(5), String(s.predict).padStart(8),
              String(s.recall).padStart(7), String(s.both).padStart(6), "  " + c);
}
console.log("-----");
console.log(`${total} chunks total`);
console.log(`predict: ${withPredict} (${pct(withPredict)}%)`);
console.log(`recall:  ${withRecall} (${pct(withRecall)}%)`);
console.log(`all five phases: ${withBoth} (${pct(withBoth)}%)`);
console.log(`three-phase only: ${total - withBoth} (${pct(total - withBoth)}%)`);
