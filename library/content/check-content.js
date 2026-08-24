#!/usr/bin/env node
// ================================================
// Knell — content checker.  NOT LOADED BY THE APP.
// ------------------------------------------------
// Do NOT add a <script> tag for this file. It is a command-line tool,
// run by hand, that checks every course module against the rules in
// CONTENT-MODEL.md and prints what's off.
//
//   node library/content/check-content.js
//   node library/content/check-content.js intro-cs      (one course)
//
// It reads the data_m*.js files directly — no app, no browser, no
// dependencies. Exits 1 if any module fails, so it can gate a commit.
// ================================================

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const only = process.argv[2];

// ---- Targets. These are CONTENT-MODEL.md §1 in machine-readable form.
// Change them here and there in the same commit, or they drift.
const T = {
  chunksPerTopic:   3,
  examQsPerTopic:   5,
  blocksPerChunk:   [2, 4],
  explainWords:     [150, 320],   // per chunk, tags stripped
  sourcesPerChunk:  2,
  analogyWords:     [25, 90],
  exampleSteps:     [3, 4],
  maxKeyShare:      0.45          // no single answer letter above this
};

const LETTER = ["A", "B", "C", "D"];
const strip = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const words = s => (strip(s) ? strip(s).split(" ").length : 0);

// ---- Language bags (core/i18n.js) ----
// A bilingual course writes {en, ru} where a single-language one writes a
// string. This file runs in a bare VM with no app around it, so it cannot
// call I18N — it carries its own copy of the same two rules. Keep them in
// step: a bag is an object whose keys are ALL language codes, which is what
// stops {heading, text} being mistaken for one.
//
// Without this every bagged string stringifies to "[object Object]" and
// scores one word, so a fully translated module would fail on every single
// explain-length check. The failure would look like thin content and it
// would be a lie.
const LANGS = ["en", "ru"];
const isBag = v => v && typeof v === "object" && !Array.isArray(v) &&
  Object.keys(v).length > 0 && Object.keys(v).every(k => LANGS.includes(k));

function langsIn(v, found = new Set()) {
  if (isBag(v)) { Object.keys(v).forEach(k => found.add(k)); Object.values(v).forEach(x => langsIn(x, found)); }
  else if (Array.isArray(v)) v.forEach(x => langsIn(x, found));
  else if (v && typeof v === "object") Object.values(v).forEach(x => langsIn(x, found));
  return found;
}

function pick(v, lang) {
  if (isBag(v)) return pick(v[lang] !== undefined ? v[lang] : v[LANGS.find(l => v[l] !== undefined)], lang);
  if (Array.isArray(v)) return v.map(x => pick(x, lang));
  if (v && typeof v === "object") {
    const out = {};
    for (const k in v) out[k] = pick(v[k], lang);
    return out;
  }
  return v;
}

function loadModules(dir) {
  const files = fs.readdirSync(dir).filter(f => /^data_m\d+\.js$/.test(f)).sort();
  const ctx = { console };
  vm.createContext(ctx);
  const mods = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8")
      .replace(/^\s*const\s+(MODULE_\w+)/m, "globalThis.$1");
    const before = new Set(Object.keys(ctx));
    try { vm.runInContext(src, ctx, { filename: f }); }
    catch (e) { mods.push({ file: f, fatal: e.message }); continue; }
    const name = Object.keys(ctx).find(k => !before.has(k) && /^MODULE_/.test(k));
    if (!name) { mods.push({ file: f, fatal: "no MODULE_* was defined" }); continue; }
    mods.push({ file: f, mod: ctx[name] });
  }
  return mods;
}

function checkModule(M, file) {
  const fail = [], warn = [];
  const qKey = [0, 0, 0, 0];
  let chunks = 0, legacy = 0, noSrc = 0, thin = 0, noTags = 0, noPredict = 0, noRecall = 0;

  (M.topics || []).forEach(t => {
    const cs = t.chunks || [];
    if (cs.length !== T.chunksPerTopic)
      warn.push(`topic "${t.id}" has ${cs.length} chunks (model says ${T.chunksPerTopic})`);
    const eq = (t.examQuestions || []).length;
    if (eq !== T.examQsPerTopic)
      fail.push(`topic "${t.id}" has ${eq} exam questions (must be ${T.examQsPerTopic})`);

    cs.forEach((c, i) => {
      chunks++;
      const e = c.explain || {};
      const where = `"${t.id}" chunk ${i + 1}`;

      if (!e.blocks) { legacy++; fail.push(`${where}: legacy \`text\` explain — model requires \`blocks\``); }
      else {
        if (e.blocks.length < T.blocksPerChunk[0] || e.blocks.length > T.blocksPerChunk[1])
          warn.push(`${where}: ${e.blocks.length} blocks (model: ${T.blocksPerChunk.join("-")})`);
        if (e.blocks[0] && e.blocks[0].heading)
          warn.push(`${where}: first block has a heading — the lede should not`);
        e.blocks.slice(1).forEach((b, j) => {
          if (!b.heading) warn.push(`${where}: block ${j + 2} has no heading`);
        });
      }

      const w = (e.blocks ? e.blocks.reduce((n, b) => n + words(b.text), 0) : words(e.text));
      if (w < T.explainWords[0]) { thin++; fail.push(`${where}: ${w} words of explanation (model: ${T.explainWords[0]}+)`); }
      else if (w > T.explainWords[1]) warn.push(`${where}: ${w} words — long, consider splitting the chunk`);

      const nSrc = (e.sources || []).length;
      if (nSrc < T.sourcesPerChunk) { noSrc++; fail.push(`${where}: ${nSrc} sources (model: ${T.sourcesPerChunk})`); }
      (e.sources || []).forEach((s, j) => {
        if (!s.ref) fail.push(`${where}: source ${j + 1} has no \`ref\``);
        if (!s.note) warn.push(`${where}: source ${j + 1} has no \`note\` naming the claim it supports`);
      });

      const aw = words(e.analogy);
      if (!aw) fail.push(`${where}: no analogy`);
      else if (aw < T.analogyWords[0]) warn.push(`${where}: analogy is ${aw} words — probably a restatement, not an analogy`);
      else if (aw > T.analogyWords[1]) warn.push(`${where}: analogy is ${aw} words — long`);

      const st = (c.example && c.example.steps || []).length;
      if (st < T.exampleSteps[0] || st > T.exampleSteps[1])
        warn.push(`${where}: ${st} example steps (model: ${T.exampleSteps.join("-")})`);

      if (!c.quiz) fail.push(`${where}: no quiz`);
      else {
        if ((c.quiz.options || []).length !== 4) fail.push(`${where}: quiz has ${(c.quiz.options || []).length} options (must be 4)`);
        if (typeof c.quiz.correct !== "number" || c.quiz.correct < 0 || c.quiz.correct > 3)
          fail.push(`${where}: quiz \`correct\` is not 0-3`);
        else qKey[c.quiz.correct]++;
        if (!c.quiz.explanation) warn.push(`${where}: quiz has no explanation`);
      }

      if (!c.wisdomTags || !c.wisdomTags.length) noTags++;
      // predict on the first chunk of a topic; recall on EVERY chunk (§3).
      // Recall used to be last-chunk-only. It moved because recall cards are
      // what the spaced-review queue serves instead of replaying the topic —
      // one card per topic is not a deck.
      if (i === 0 && !c.predict) noPredict++;
      if (i !== 0 && c.predict) warn.push(`${where}: \`predict\` is only for the first chunk of a topic`);
      if (!c.recall) noRecall++;
      else {
        if (!c.recall.prompt) fail.push(`${where}: recall has no \`prompt\``);
        if (!c.recall.answer) fail.push(`${where}: recall has no model \`answer\``);
        // `points` is mandatory now, not optional: once a self-grade drives the
        // SM-2 interval, a generous grade buys a LONGER gap — i.e. forgetting.
        // Grading against a checklist is much harder to fudge than "did I know it?".
        if (!(c.recall.points || []).length)
          fail.push(`${where}: recall has no \`points\` checklist to self-grade against`);
      }
    });
  });

  // Chunk-quiz answer spread. Exams are shuffled per attempt so their
  // stored keys don't matter; chunk quizzes are rendered as written.
  const totalQ = qKey.reduce((a, b) => a + b, 0) || 1;
  const share = qKey.map(n => n / totalQ);
  share.forEach((s, i) => {
    if (s > T.maxKeyShare)
      fail.push(`chunk quiz answers are ${Math.round(s * 100)}% ${LETTER[i]} — guessable without reading`);
  });

  if (noTags)    warn.push(`${noTags}/${chunks} chunks have no \`wisdomTags\` — quotes fall back to random`);
  if (noPredict) warn.push(`${noPredict} topics have no \`predict\` on their first chunk`);
  if (noRecall)  warn.push(`${noRecall}/${chunks} chunks have no \`recall\` — they contribute nothing to the review deck`);

  return {
    file, id: M.id, unit: M.unit, title: M.title,
    topics: (M.topics || []).length, chunks,
    spread: LETTER.map((L, i) => `${L}${Math.round(share[i] * 100)}%`).join(" "),
    fail, warn
  };
}

// ---- run ----
const courses = fs.readdirSync(ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== "_template")
  .map(d => d.name)
  .filter(n => !only || n === only);

if (!courses.length) { console.error(`no course folders found in ${ROOT}`); process.exit(1); }

let failures = 0;
for (const slug of courses) {
  console.log(`\n\u2501\u2501\u2501 ${slug} \u2501\u2501\u2501`);
  const loaded = loadModules(path.join(ROOT, slug));
  if (!loaded.length) { console.log("  (no data_m*.js files)"); continue; }

  const rows = [];
  for (const { file, mod, fatal } of loaded) {
    if (fatal) { console.log(`\n  ${file}\n    \u2717 could not load: ${fatal}`); failures++; continue; }
    // A bilingual module is checked ONCE PER LANGUAGE, against the full
    // standard each time. Half a translation must not pass: 200 words of
    // Russian explanation beside a one-line English stub would sail
    // through any check that only saw whichever language came first.
    // A single-language module yields exactly one pass, as before, and
    // its row stays unlabelled.
    const present = [...langsIn(mod)];
    const passes = present.length ? LANGS.filter(l => present.includes(l)) : [null];

    for (const lang of passes) {
      const tag = lang ? ` [${lang}]` : "";
      const r = checkModule(lang ? pick(mod, lang) : mod, file);
      rows.push({ file: r.file + tag, unit: r.unit, title: r.title, topics: r.topics, chunks: r.chunks,
                  "quiz keys": r.spread, fails: r.fail.length, warns: r.warn.length });
      if (r.fail.length || r.warn.length) {
        console.log(`
  ${r.file}${tag} — ${r.title} (unit ${r.unit})`);
        r.fail.slice(0, 12).forEach(m => console.log(`    ✗ ${m}`));
        if (r.fail.length > 12) console.log(`    ✗ ...and ${r.fail.length - 12} more`);
        r.warn.slice(0, 8).forEach(m => console.log(`    ⚠ ${m}`));
        if (r.warn.length > 8) console.log(`    ⚠ ...and ${r.warn.length - 8} more`);
      }
      if (r.fail.length) failures++;
    }
  }
  console.log("");
  console.table(rows);
}

console.log(failures
  ? `\n${failures} module(s) do not meet CONTENT-MODEL.md.`
  : `\nAll modules meet CONTENT-MODEL.md.`);
process.exit(failures ? 1 : 0);
