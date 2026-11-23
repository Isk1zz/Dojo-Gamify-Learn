#!/usr/bin/env node
// ================================================
// Knell — make the public demo.  NOT LOADED BY THE APP.
// ------------------------------------------------
//   node tools/make-demo.js            -> ../knell-demo
//   node tools/make-demo.js <folder>   -> <folder>
//
// Not a build: the output is the same files the app already runs on.
// It copies what the app needs to RUN (no working docs, no migrations)
// and changes exactly these things in the copy:
//
//   core/demo.js      Dojo.DEMO = false  ->  true
//   core/supabase.js  project URL and publishable key  ->  ""
//   index.html        the supabase-js <script> tag  ->  removed
//   index.html        the Forum's <script> tag and screen  ->  removed
//   sw.js             "knell-vNN"  ->  "knell-demo-vNN"
//
// With the keys blank, Dojo.Cloud.isConfigured() is false and every
// branch skips the server on its own, so the demo cannot reach the real
// database and does not even hold its address. The last step checks
// that: if any production identifier survives anywhere in the copy, it
// fails rather than leaving something publishable.
//
// The Forum is left out whole (added 2026-11-22): forum/ is not copied,
// because without the server it could only ever be an empty screen. Its
// lobby tile opens the Museum instead (museum/museum.js), where the
// Forum is an exhibit. The last step checks that no trace of it is left.
//
// The target's .git folder survives a re-run, so the demo repository
// keeps its history; everything else in the target is replaced.
// ================================================
const fs = require("fs"), path = require("path"), { execSync } = require("child_process");

const SRC = path.resolve(__dirname, "..");
const DEST = path.resolve(process.argv[2] || path.join(SRC, "..", "knell-demo"));

const die = msg => { console.error("make-demo: " + msg); process.exit(1); };
if (DEST === SRC || SRC.startsWith(DEST + path.sep) || DEST.startsWith(SRC + path.sep)) {
  die("the demo folder must be outside the app folder, and not contain it");
}

// What the app needs to run. Branch .md files and dev scripts stay in
// the main repository, which is where the full source and history are.
const RUNTIME = ["index.html", "manifest.webmanifest", "sw.js", "LICENSE",
  "core/", "data/", "library/", "garden/", "shop/", "museum/", "settings/",
  "admin/", "scenes/", "styles/", "icons/"];
// Not library/content/build.js: despite the name it runs in the app,
// publishing COURSES / UNITS / ALL_TOPICS (index.html loads it).
const DEV_ONLY = /(^|\/)check-content\.js$|scenes\/prototype\.html$/;

// Tracked files plus new ones not yet committed, minus anything
// .gitignore excludes (the local test-account notes among them), and
// minus files no longer on disk: one deleted but not yet committed is
// still in git's index, and copying it would stop the build halfway.
const tracked = execSync("git ls-files --cached --others --exclude-standard", { cwd: SRC, encoding: "utf8" }).trim().split("\n");
const files = tracked.filter(f =>
  RUNTIME.some(r => r.endsWith("/") ? f.startsWith(r) : f === r) &&
  !f.endsWith(".md") && !DEV_ONLY.test(f) &&
  fs.existsSync(path.join(SRC, f)));
// From disk, not from git: a screenshot taken for this run may not be
// committed yet.
const SHOTS = path.join(SRC, "docs", "screenshots");
const extras = [
  ["demo/README.md", "README.md"],
  ...(fs.existsSync(SHOTS) ? fs.readdirSync(SHOTS) : [])
    .filter(n => n.startsWith("demo-"))
    .map(n => [`docs/screenshots/${n}`, `docs/screenshots/${n}`])
];

// ---- Clean the target, keeping its .git -------------------------------
fs.mkdirSync(DEST, { recursive: true });
for (const name of fs.readdirSync(DEST)) {
  if (name === ".git") continue;
  fs.rmSync(path.join(DEST, name), { recursive: true, force: true });
}

const copy = (from, to) => {
  const out = path.join(DEST, to);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.copyFileSync(path.join(SRC, from), out);
};
files.forEach(f => copy(f, f));
for (const [from, to] of extras) {
  if (!fs.existsSync(path.join(SRC, from))) die(`missing ${from}`);
  copy(from, to);
}

// ---- The four changes ---------------------------------------------------
function edit(file, re, replacement, what) {
  const p = path.join(DEST, file);
  const src = fs.readFileSync(p, "utf8");
  // Counted with a global copy of the pattern: without the g flag,
  // match() returns capture groups too, and a pattern with one group
  // "found" two of everything.
  const n = (src.match(new RegExp(re.source, re.flags + "g")) || []).length;
  if (n !== 1) die(`${file}: expected exactly one ${what}, found ${n}`);
  fs.writeFileSync(p, src.replace(re, replacement));
  console.log(`  ${file.padEnd(18)} ${what}`);
}
console.log(`Demo copy: ${files.length + extras.length} files -> ${DEST}`);
edit("core/demo.js", /Dojo\.DEMO = false;/, "Dojo.DEMO = true;", "demo switch on");
edit("core/supabase.js", /const SUPABASE_URL = "[^"]*";/, 'const SUPABASE_URL = "";', "project URL blanked");
edit("core/supabase.js", /const SUPABASE_PUBLISHABLE_KEY = "[^"]*";/, 'const SUPABASE_PUBLISHABLE_KEY = "";', "publishable key blanked");
edit("index.html", /[ \t]*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/[^"]*"><\/script>\r?\n/, "", "supabase-js tag removed");
edit("index.html", /[ \t]*<script src="forum\/forum\.js"><\/script>\r?\n/, "", "Forum's script removed");
edit("index.html", /[ \t]*<!-- ====== Forum \(forum\/forum\.js\) ======[\s\S]*?<\/section>\r?\n/, "", "Forum's screen removed");
edit("sw.js", /const CACHE_VERSION = "knell-v(\d+)";/, 'const CACHE_VERSION = "knell-demo-v$1";', "cache renamed");

// ---- Nothing of production may survive ---------------------------------
const live = fs.readFileSync(path.join(SRC, "core/supabase.js"), "utf8");
const url = (live.match(/const SUPABASE_URL = "([^"]*)"/) || [])[1] || "";
const key = (live.match(/const SUPABASE_PUBLISHABLE_KEY = "([^"]*)"/) || [])[1] || "";
const ref = (url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1] || "";
const needles = [url, key, ref, "supabase.co"].filter(Boolean);
const leaks = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(js|html|css|json|webmanifest|md|txt)$/.test(e.name)) continue;
    const text = fs.readFileSync(p, "utf8");
    needles.forEach(n => { if (text.includes(n)) leaks.push(`${path.relative(DEST, p)}: ${n}`); });
  }
})(DEST);
if (leaks.length) die("production identifiers in the demo copy:\n  " + leaks.join("\n  "));
console.log("  checked: no project URL, key or reference anywhere in the copy");

// ---- Nor any of the Forum ---------------------------------------------
const page = fs.readFileSync(path.join(DEST, "index.html"), "utf8");
const forumLeft = [
  fs.existsSync(path.join(DEST, "forum")) && "a forum/ folder",
  page.includes("forum/forum.js") && "index.html loads forum/forum.js",
  /id="forum"/.test(page) && "index.html has the Forum's screen"
].filter(Boolean);
if (forumLeft.length) die("the Forum is still in the demo copy: " + forumLeft.join("; "));
console.log("  checked: no Forum in the copy");
