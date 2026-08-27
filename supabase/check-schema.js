// ================================================
// Knell — schema drift check
// ------------------------------------------------
//   node supabase/check-schema.js        (from the repo root)
//
// Does supabase/migrations/0001_init.sql still cover every field
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
const sql = fs.readFileSync("supabase/migrations/0001_init.sql", "utf8");
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
  "id", "user_id", "created_at", "updated_at", "country"
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
  console.error("\nSchema drift. Fix 0001_init.sql (it has not run against a\n" +
                "live database yet, so editing it in place is still safe).");
  process.exit(1);
}
console.log("No drift.");
