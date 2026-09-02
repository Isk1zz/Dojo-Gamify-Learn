#!/usr/bin/env node
// ================================================
// Knell — catalogue generator.  NOT LOADED BY THE APP.
// ------------------------------------------------
// Reads the real content files and prints the SQL that fills
// public.content_items — the server's list of what work exists and what
// each piece is worth.
//
//   node supabase/build-catalogue.js            > catalogue.sql
//   node supabase/build-catalogue.js --summary  (counts only, no SQL)
//
// ---- Why a generator and not a hand-written migration ----
// The catalogue has to agree with the content exactly. An item missing
// from it cannot be paid for, so a learner does honest work for nothing;
// an item in it that no longer exists is a row nobody can ever claim.
// Hand-maintaining that list against five courses guarantees drift, and
// drift here is silent — it shows up as "why did I get no XP".
//
// So the reward numbers are READ OUT OF library/library.js rather than
// retyped here. If someone changes UNIT_MONEY_REWARD, this file follows
// on the next run. Retyping them would recreate exactly the copy-drift
// this exists to prevent.
//
// ---- Pace ----
// Seconds are the thresholds set for the app: a minute on a page of
// theory, twenty seconds on a one-question quiz, fifteen on a thin one.
// They are per-item so a future short chunk can carry its own number
// without a code change.
//
// Note these can only ever bite on a FIRST pass — a re-read is not paid
// at all, so it never reaches the check.
// ================================================

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const CONTENT = path.join(__dirname, "..", "library", "content");
const LIBRARY = path.join(__dirname, "..", "library", "library.js");
const summaryOnly = process.argv.includes("--summary");

// ---- Pace thresholds, in seconds --------------------------------------
const PACE = {
  chunk:  60,   // a page of theory
  topic:  20,   // the topic exam sits behind chunks that already paced it
  unit:   15,   // a completion marker, not a page — nothing to read
  course: 15,
  // Review has NO pace threshold, deliberately. A custom deck spanning
  // five topics claims five reviews in the same instant, and any
  // threshold at all would refuse four of them — the pace check
  // measures the gap since the last payment, which is zero inside a
  // batch. It is not needed either: a review is already capped at once
  // per topic per day, which is a firmer limit than seconds, and the
  // client's own MIN_CARD_MS still refuses cards tapped through.
  //
  // Note the clock still protects everything else. Finishing a review
  // stamps a payment, so a theory page opened straight afterwards is
  // still held to its 60 seconds.
  review: 0,
  final:  20
};

// ---- Reward numbers, read from the app rather than retyped ------------
// A narrow parse on purpose: these are four flat literals in library.js
// and pulling them with a regex keeps this file from needing the whole
// app in scope. If a table stops being a literal the extractor throws
// rather than silently returning nothing — a wrong catalogue is worse
// than no catalogue.
function readRewards() {
  const src = fs.readFileSync(LIBRARY, "utf8");
  const grab = (name) => {
    const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\{[^}]*\\})`));
    if (!m) throw new Error(`${name} not found in library.js, or no longer a flat object literal`);
    return vm.runInNewContext("(" + m[1] + ")");
  };
  const num = (name) => {
    const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*(\\d+)`));
    if (!m) throw new Error(`${name} not found in library.js`);
    return Number(m[1]);
  };
  return {
    unitMoney:  grab("UNIT_MONEY_REWARD"),
    unitTokens: grab("UNIT_TOKEN_REWARD"),
    unitXp:     grab("UNIT_XP_REWARD"),
    courseTokens: num("COURSE_TOKEN_REWARD"),
    reviewPerCard: num("REVIEW_XP_PER_CARD"),
    finalBase: num("FINAL_QUIZ_XP_BASE"),
    finalFirst: num("FINAL_QUIZ_COMPLETION_XP")
  };
}

// Chunk XP lives HERE, not in library.js.
//
// It used to be read out of the app, the same way the unit rewards
// still are — `const gain = 15 + Math.floor(Math.random() * 7)`. Wiring
// the client to claim_earning deleted that line, and this generator
// stopped with "chunk XP expression not found", which is exactly what
// it was built to do: a number that silently vanished would have meant
// a catalogue paying zero for every chunk in the app.
//
// The right home is here, because the SERVER now decides the amount and
// rolls the jitter. The unit rewards stay readable from library.js for
// the opposite reason: the roadmap draws "$30" badges from them, so the
// client still legitimately holds those numbers and the two must agree.
const CHUNK_XP = { min: 15, max: 21 };

// ---- Load one course's modules ---------------------------------------
// Same approach as library/content/check-content.js: run the data files
// in a bare VM. They are plain `const MODULE_X = {...}` with no imports.
function loadModules(dir) {
  const files = fs.readdirSync(dir).filter(f => /^data_m\d+\.js$/.test(f)).sort();
  const ctx = { console: { log() {}, warn() {}, error() {}, info() {} } };
  vm.createContext(ctx);
  const mods = [];
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8")
      .replace(/^\s*const\s+(MODULE_\w+)/m, "globalThis.$1");
    const before = new Set(Object.keys(ctx));
    try { vm.runInContext(src, ctx, { filename: f }); }
    catch (e) { console.error(`  ! ${f}: ${e.message}`); continue; }
    const name = Object.keys(ctx).find(k => !before.has(k) && /^MODULE_/.test(k));
    if (name) mods.push(ctx[name]);
  }
  return mods;
}

const q = s => "'" + String(s).replace(/'/g, "''") + "'";

function main() {
  const R = readRewards();
  const CX = CHUNK_XP;

  const courses = fs.readdirSync(CONTENT)
    .filter(f => !f.startsWith("_") && !f.endsWith(".md") && !f.endsWith(".js"))
    .filter(f => fs.statSync(path.join(CONTENT, f)).isDirectory())
    .sort();

  const rows = [];
  const seen = new Set();
  // A unit legitimately spans several module files -- intro-cs unit 6 is
  // networks + internet + security, and its reward lands only when all
  // of their topics are done. So a repeated unit id is one unit seen
  // again, not a collision, and the second sighting is dropped quietly.
  // Every other repeat still shouts: two topics sharing an id would mean
  // finishing one silently pays for the other.
  const add = (id, kind, o = {}) => {
    if (seen.has(id)) {
      if (kind !== "unit") console.error(`  ! duplicate item id: ${id}`);
      return;
    }
    seen.add(id);
    rows.push({
      id, kind,
      xp_min: o.xp_min || 0, xp_max: o.xp_max || o.xp_min || 0,
      money: o.money || 0, tokens: o.tokens || 0,
      min_seconds: o.min_seconds || 0,
      repeat_daily: !!o.repeat_daily
    });
  };

  const stat = { courses: 0, units: 0, topics: 0, chunks: 0 };

  for (const c of courses) {
    const mods = loadModules(path.join(CONTENT, c));
    if (!mods.length) continue;
    stat.courses++;

    add(`course:${c}`, "course", {
      tokens: R.courseTokens, min_seconds: PACE.course
    });

    // The final quiz, but ONLY for a course that actually has one.
    //
    // A first pass emitted these for every course, which would have
    // been three quizzes in the catalogue where the app has one:
    // FINAL_QUIZ_QUESTIONS is a single global, defined in
    // intro-cs/final_quiz.js and loaded app-wide. Rows for quizzes that
    // do not exist are unclaimable clutter, and worse, they would have
    // suggested the app had a per-course final quiz when it does not.
    if (fs.existsSync(path.join(CONTENT, c, "final_quiz.js"))) {
      // Retakeable, and it pays two different things. Scaled per
      // attempt, capped to once a day: the client already had a per-day
      // attempt cap (final_quiz.xpAttemptsToday), but it was a number in
      // localStorage and therefore not a cap at all.
      add(`final:${c}`, "final", {
        xp_min: R.finalBase, xp_max: R.finalBase,
        min_seconds: PACE.final, repeat_daily: true
      });
      // And a one-time bonus for the first genuine pass, which stays
      // once-ever because that is what "first" means.
      add(`final-first:${c}`, "final", {
        xp_min: R.finalFirst, xp_max: R.finalFirst, min_seconds: PACE.final
      });
    }

    for (const m of mods) {
      const unit = m.unit;
      // Counted only when it is actually new, or the summary reports
      // module sightings and calls them units -- intro-cs would read as
      // 10 units when it has 8.
      if (unit != null) {
        if (!seen.has(`unit:${unit}`)) stat.units++;
        add(`unit:${unit}`, "unit", {
          xp_min: R.unitXp[unit] || 0,
          xp_max: R.unitXp[unit] || 0,
          money:  R.unitMoney[unit] || 0,
          tokens: R.unitTokens[unit] || 0,
          min_seconds: PACE.unit
        });
      }

      for (const t of (m.topics || [])) {
        const chunks = t.chunks || [];
        stat.topics++;

        chunks.forEach((_, i) => {
          stat.chunks++;
          add(`chunk:${t.id}:${i}`, "chunk", {
            xp_min: CX.min, xp_max: CX.max, min_seconds: PACE.chunk
          });
        });

        // The topic bonus is what its chunks earned, scaled by the exam
        // multiplier the server clamps to 0.7-1.5. The catalogue carries
        // the UNSCALED sum; claim_earning applies the multiplier.
        add(`topic:${t.id}`, "topic", {
          xp_min: CX.min * chunks.length,
          xp_max: CX.max * chunks.length,
          min_seconds: PACE.topic
        });

        // Spaced review, claimable once per topic per DAY. Repeating is
        // the point of it -- returning next week is the behaviour the
        // app exists to build, so pay-once-ever would have quietly
        // stopped rewarding exactly that.
        //
        // Flat, not per card. The old code paid per card the learner
        // said they knew, and that count came from the client -- the one
        // number a console would inflate. One card's worth per chunk
        // keeps it near where it was and asks the client for nothing.
        //
        // Worth roughly one chunk, deliberately: a review must not be a
        // faster way to earn than studying the topic was.
        add(`review:${t.id}`, "review", {
          xp_min: R.reviewPerCard * chunks.length,
          xp_max: R.reviewPerCard * chunks.length,
          min_seconds: PACE.review,
          repeat_daily: true
        });
      }
    }
  }

  if (summaryOnly) {
    console.log(`courses ${stat.courses} · units ${stat.units} · topics ${stat.topics} · chunks ${stat.chunks}`);
    console.log(`rows    ${rows.length}`);
    return;
  }

  console.log("-- GENERATED by supabase/build-catalogue.js. Do not hand-edit.");
  console.log("-- Re-run the generator after any content change and re-apply.");
  // ASCII only: this text goes through the clipboard into the SQL
  // editor on Windows, where `clip` mangles UTF-8.
  console.log(`-- ${stat.courses} courses, ${stat.units} units, ${stat.topics} topics, ${stat.chunks} chunks`);
  console.log("");
  console.log("begin;");
  console.log("");
  // Upsert rather than truncate: earnings references content_items, so
  // deleting a row a learner has already been paid for would cascade
  // their history away. Content that disappears leaves its row behind,
  // unclaimable but intact -- the right trade when the alternative is
  // erasing what somebody earned.
  console.log("insert into public.content_items (id, kind, xp_min, xp_max, money, tokens, min_seconds, repeat_daily) values");
  console.log(rows.map(r =>
    `  (${q(r.id)}, ${q(r.kind)}, ${r.xp_min}, ${r.xp_max}, ${r.money}, ${r.tokens}, ${r.min_seconds}, ${r.repeat_daily})`
  ).join(",\n"));
  console.log("on conflict (id) do update set");
  console.log("  kind = excluded.kind, xp_min = excluded.xp_min, xp_max = excluded.xp_max,");
  console.log("  money = excluded.money, tokens = excluded.tokens, min_seconds = excluded.min_seconds,");
  console.log("  repeat_daily = excluded.repeat_daily;");
  console.log("");
  console.log("select kind, count(*) from public.content_items group by kind order by kind;");
  console.log("");
  console.log("commit;");
}

main();
