// ================================================
// Knell — service worker
// ------------------------------------------------
// Makes the app installable and genuinely offline. It is the ONLY file
// in the project that isn't loaded by index.html — the browser runs it
// separately, which is why it can't use anything from Dojo or DB.
//
// ---- Why there is no file list ----
//
// The obvious service worker precaches an array of every asset. That
// array then has to be kept in sync by hand with index.html's ~30
// script tags, forever, and the failure mode is silent: you add a file,
// forget the array, and the app half-works offline for the one person
// who installed it.
//
// So: precache only index.html, then cache every same-origin GET as it
// is actually fetched (stale-while-revalidate). After one visit the
// whole app is cached, and adding a course or a branch needs no change
// here at all. That matters more than a cold-start-perfect first load.
//
// ---- Updating ----
// Bump CACHE_VERSION. Old caches are deleted on activate, and the new
// worker takes over the next time every tab is closed and reopened.
// Nothing auto-reloads mid-session: a study app swapping its JS out
// from under someone mid-exam is worse than a stale tab.
//
// ---- Note on file:// ----
// Service workers only run over http(s) or localhost. Double-clicking
// index.html still works exactly as before — you just don't get the
// offline cache or the install prompt. That is deliberate: the no-build,
// open-the-file property is not being traded away for this.
// ================================================

// Bumped 2026-08-16: the Arcade branch (games.js, games.css) was deleted
// and several files changed meaning. Stale-while-revalidate would have
// refreshed the live ones eventually, but the DELETED ones would have
// sat in the old cache indefinitely — nothing re-fetches a file that no
// longer exists. Bumping drops the whole cache and starts clean.
// Bumped 2026-08-24: core/i18n.js is a NEW file that library.js now
// depends on at load time. Stale-while-revalidate serves the cached
// index.html first, so a returning device would have got the OLD index
// (no <script src="core/i18n.js">) together with the NEW library.js —
// and library.js reads I18N.t() while building PHASE_META, at load.
// Result: ReferenceError, Content never renders, blank Library, fixed
// only by opening the app a second time.
//
// This is the case the header's "Updating" note is for, and it is worth
// stating the rule sharply: a stale cache is acceptable when old files
// merely render old content, and NOT acceptable once one file needs
// another file to exist. Adding a script tag that something depends on
// is exactly that line. Bump when you add a file, not just when you
// delete one.
// Bumped 2026-08-24 again: library/exam-sim.js is another new file, and
// core/i18n.js gained the strings it renders with. A stale i18n.js
// beside a fresh exam-sim.js would put raw keys like "sim.begin" on the
// buttons — not a crash this time, because library.js reaches the
// feature through a `Dojo.examSimEntry` guard, but still a broken
// screen. Same rule as v5: adding a file that something else reads
// means bumping.
// Bumped 2026-08-24 a third time, and this one is not about a new file:
// v6 shipped a mock exam you could not leave. Stale-while-revalidate
// would hand the fix over on the SECOND open, which is the wrong shape
// for "the exit button is dead" — the person hitting it is stuck now.
// Bump when a cached copy is actively broken, not only when files are
// added.
// Renamed 2026-08-24 with the app: Knell. Safe to rename HERE and
// nowhere else — a cache key is disposable by design (activate deletes
// everything that isn't the current version), whereas the localStorage
// keys in db.js, i18n.js and exam-sim.js address saved data and keep
// their old names forever. The rename doubles as the bump that
// index.html and the manifest need anyway.
// Bumped for the first-run language gate: index.html gained the
// overlay markup and core/i18n.js the code that reveals it. A stale
// pairing shows a gate with dead buttons, or no gate at all on a device
// that never chose.
// Bumped again: tickets removed from db.js/admin.js, and flashcard
// decks now include exam questions. Both are behaviour changes across
// files that load together.
const CACHE_VERSION = "knell-v3";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // Only same-origin GETs. Anything else (a POST, a CDN font) goes
  // straight to the network and is never cached.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(cache =>
      cache.match(req).then(cached => {
        const network = fetch(req)
          .then(res => {
            // Only cache real successes. Caching a 404 or an opaque
            // response is how an app ends up permanently broken offline.
            if (res && res.status === 200 && res.type === "basic") {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => cached || caches.match("./index.html"));

        // Serve the cache immediately when there is one; the network
        // copy refreshes it for next time.
        return cached || network;
      })
    )
  );
});
