// ================================================
// Knell — schema drift check
// ------------------------------------------------
//   node supabase/check-schema.js        (from the repo root)
//
// Do the supabase/migrations/*.sql files still cover every field
// data/db.js's defaultProfile() creates? Run this after ANY change to
// defaultProfile — a new profile field that never reaches the schema is
// a field that silently fails to sync, and the failure shows up as
// "my settings didn't save on my other device" long after the commit
// that caused it.
//
// Same spirit as library/content/check-content.js: the numbers in one
// file are held to the truth in another, mechanically, rather than by
// remembering to check.
//
// Exits non-zero on drift so it can gate a commit if that's ever wanted.
// ================================================
const fs = require("fs");

// ---- 1. Top-level keys of defaultProfile() -------------------------
const dbSrc = fs.readFileSync("data/db.js", "utf8");
const fnStart = dbSrc.indexOf("function defaultProfile(");
const fnBody = dbSrc.slice(fnStart, dbSrc.indexOf("\n  }", fnStart));
// Keys sit at exactly 6 spaces inside the returned object literal.
// Nested keys are deeper, so this depth filter isolates the top level.
const profileKeys = [...fnBody.matchAll(/^ {6}([a-zA-Z_][a-zA-Z0-9_]*):/gm)].map(m => m[1]);

// ---- 2. Columns per table in the migration -------------------------
// Every migration, in order — not just 0001. Once a migration has run
// against the live project it can no longer be edited in place, so the
// schema is the SUM of these files and reading only the first would
// report a column added by a later one as missing.
const dir = "supabase/migrations";
const sql = fs.readdirSync(dir)
  .filter(f => f.endsWith(".sql"))
  .sort()
  .map(f => fs.readFileSync(`${dir}/${f}`, "utf8"))
  .join("\n");

// The three tables that MIRROR a local profile, and the only ones this
// check is about. It asks one question: does every field in
// defaultProfile() have a column to sync into, and vice versa.
//
// Named explicitly rather than "every table in the migrations", because
// the database has tables that are not mirrors of anything local —
// content_items and earnings (the earning ledger), posts, replies,
// rep_grants and reports (the forum). Those are server-owned, the
// client never holds a copy, and counting their columns here reported
// drift that did not exist: `content_items.repeat_daily` has no
// business being a field in defaultProfile().
const MIRRORED = ["profiles", "progress", "economy"];

const tables = {};
for (const m of sql.matchAll(/create table public\.(\w+) \(([\s\S]*?)\n\);/g)) {
  const [, name, body] = m;
  tables[name] = body
    .split("\n")
    .map(l => l.trim())
    .filter(l => l && !l.startsWith("--"))
    .map(l => l.match(/^([a-z_][a-z0-9_]*)\s/))
    .filter(Boolean)
    .map(m2 => m2[1]);
}

// Columns added by a later migration, which arrive as ALTER TABLE
// rather than inside the CREATE TABLE body above.
//
// Two passes, because one ALTER may add SEVERAL columns:
//
//     alter table public.profiles
//       add column if not exists holiday_since timestamptz,
//       add column if not exists holiday_days int not null default 0;
//
// The first version of this matched `alter table ... add column NAME`
// as one unit and therefore saw only the first of those. It reported
// holiday_days as a missing column when the column existed — and would
// equally have missed a genuine orphan, which is the failure that
// matters: a check that silently sees less than it claims to.
//
// So: find the whole statement, then every `add column` inside it.
for (const stmt of sql.matchAll(/alter table public\.(\w+)([\s\S]*?);/gi)) {
  const [, table, body] = stmt;
  // Only the mirrored three. Without this an ALTER on a server-owned
  // table creates an entry here — which is exactly how 0015's
  // `alter table earnings add column period` came to be reported as
  // profile drift.
  if (!MIRRORED.includes(table)) continue;

  for (const col of body.matchAll(
    /add column(?:\s+if not exists)?\s+([a-z_][a-z0-9_]*)/gi
  )) {
    const name = col[1];
    if (!tables[table]) tables[table] = [];
    if (!tables[table].includes(name)) tables[table].push(name);
  }
}

const allCols = new Set(Object.values(tables).flat());
const camelToSnake = s => s.replace(/[A-Z]/g, c => "_" + c.toLowerCase());

// ---- 3. Compare ----------------------------------------------------
const missing = [];
const found = [];
for (const key of profileKeys) {
  const snake = camelToSnake(key);
  if (allCols.has(snake)) {
    const table = Object.keys(tables).find(t => tables[t].includes(snake));
    found.push(`${key} -> ${table}.${snake}`);
  } else {
    missing.push(`${key}  (looked for column "${snake}")`);
  }
}

// Columns that exist in SQL but map to no profile field. Bookkeeping
// columns are expected here; anything else is a schema invention.
const EXPECTED_EXTRA = new Set([
  "id", "user_id", "created_at", "updated_at", "country",
  // Step 4 claim marker: bookkeeping, not a profile field. See
  // 0002_migration_marker.sql.
  "migrated_at",
  // The bell's read mark (0022). Server-owned state that happens to
  // live in a mirrored table: the client never reads or writes it — it
  // asks the server for a count and presses a button to clear it — so
  // there is deliberately no local field to pair with.
  //
  // The test for adding something here is narrow, and it is not "the
  // checker complained": a column belongs on this list only when the
  // CLIENT never touches it and the server is the only party that
  // changes it. Anything the client reads must have a field, or the
  // display and the database can disagree, which is the whole reason
  // this check exists.
  "bell_seen_at"
]);
const profileSnake = new Set(profileKeys.map(camelToSnake));
const orphanCols = [];
for (const [t, cols] of Object.entries(tables)) {
  for (const c of cols) {
    if (!profileSnake.has(c) && !EXPECTED_EXTRA.has(c)) orphanCols.push(`${t}.${c}`);
  }
}

console.log("defaultProfile() top-level fields: " + profileKeys.length);
console.log("SQL columns across 3 tables:       " + allCols.size + "\n");

console.log("=== FIELDS WITH NO COLUMN (" + missing.length + ") ===");
missing.forEach(m => console.log("  MISSING  " + m));

console.log("\n=== COLUMNS WITH NO FIELD (" + orphanCols.length + ") ===");
orphanCols.forEach(c => console.log("  ORPHAN   " + c));

console.log("\n=== mapped ok: " + found.length + " ===");

if (missing.length || orphanCols.length) {
  // 0001 HAS run against the live project now, so editing it in place is
  // no longer safe — the live database would silently stop matching the
  // file. Fix drift with a NEW numbered migration instead.
  console.error("\nSchema drift. Add a new supabase/migrations/000N_*.sql\n" +
                "with the missing ALTER TABLE — do NOT edit a migration that\n" +
                "has already run against the live project.");
  process.exit(1);
}
console.log("No drift.");
