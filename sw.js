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
// Bumped for interface translation pass 1: index.html gained ~56
// data-i18n nodes and i18n.js the keys behind them. Split across a
// stale cache that is a screen of raw keys.
// Bumped for lazy course loading. This one MATTERS more than the usual
// bump: index.html no longer carries the ten intro-cs <script> tags, and
// intro-cs/course.js now builds its units from a factory that reads the
// modules after they are injected. A stale index.html paired with a new
// course.js (or the reverse) yields a course that registers with zero
// units and a Library card reading "0 units" — which is exactly what a
// stale cache produced while this was being tested, and it cost a round
// of chasing a scoping bug that was not there.
// Bumped for core/crypto.js: a new file in band 1. A cached index.html
// without its tag means Dojo.Crypto is simply absent, and every caller
// has to guess whether that means "not supported here" or "stale cache".
// Bumped for the road-signs topic in bike-a3: data_m1.js gained a
// seventh topic, and exam-sim.js gained the `official: false` guard that
// keeps that topic's questions out of the mock exam. Cached apart, the
// mock exam would draw 45 questions and stop being a simulation of the
// Ministry's forty.
// Bumped for interface translation pass 2: 40 new i18n keys, and the
// shop/garden/stats catalogues turned into {en, ru} bags resolved through
// I18N.resolve. A stale pairing shows raw keys or half-translated tiles.
// Bumped for the Philosophy course: two new content files, a new
// "humanities" shelf in library.js and the i18n key behind its label. A
// stale index.html against a fresh library.js gives a shelf with no course
// under it.
// Bumped for three contract strings that survived every earlier
// translation pass: "Sign & Enter", "Sign here", and the fineprint line,
// which also still said "Dojo" instead of "Knell". Found during a live
// walkthrough of the Philosophy course.
// Bumped again in the same walkthrough: the topic-map back button
// ("← Units") had no data-i18n at all and was missed by every earlier
// sweep because it carries no emoji and sits in a two-element flex
// wrapper my filters did not check.
// Bumped a third time in the same walkthrough: the Map/List view
// toggle on the unit-map and topic-map screens (4 buttons, 2 screens)
// carried no data-i18n and no I18N.t call anywhere.
// Bumped a fourth time: the "Analogy" and "Sources & further reading"
// labels inside every lesson chunk carried no I18N.t call. These show on
// EVERY chunk of EVERY course with an analogy or a source list, so this
// was the widest-reaching gap found in the walkthrough.
// Bumped a fifth time: the predict-phase "Back to explanation" button.
// Bumped a sixth time: the whole mastery-exam result screen (title,
// two buttons, the score description with day-count pluralisation) was
// entirely hardcoded English. The widest single gap found in this
// walkthrough -- it shows after every exam on every course.
// Bumped a seventh time: the exam header (title suffix, subtitle,
// question counter) and the quiz-phase next-chunk button duplicated
// English strings that renderRecall already had translated via
// existing btn.* keys -- the two render paths had simply drifted apart.
// Bumped an eighth time: quiz feedback ("Correct!" / "Wrong — the
// answer is X") and the exam-navigation buttons (Next Question, See
// Results) were hardcoded independently in two render paths.
// Bumped for the Supabase client scaffolding: core/supabase.js is a
// new file in band 1, and the supabase-js CDN script is new too. Not
// wired into any UI yet -- Dojo.Cloud.isConfigured() is false until
// SUPABASE_URL/ANON_KEY are filled in, so this bump is precautionary,
// not because anything user-facing changed.
// Bumped for Philosophy topic 3: "Что он думал" -- De Re Publica (the
// rector ideal, retroactively explaining topic 2's Catiline/Octavian
// beats), De Officiis (sapientia vs calliditas), Tusculan Disputations
// (closes the circle back to topic 1's death scene).
// Bumped for the topic-3 accuracy review: six factual corrections
// (Tusculans set-at vs written-at, a two-and-a-half-year interval called
// eighteen months, Tullia listed in the wrong window, a backwards
// Petrarch clause, Off. 2.24 miscited as Book One), one RU typo, and a
// quiz-answer rebalance that pulled C off the 45% ceiling.
// Bumped for the About-this-course blocks: a new `about` manifest field
// carried through registry.js, rendered on unit-select, with content for
// all three built courses. Also fixes a mis-cited De Re Publica section.
// Bumped again: About block now also in the pre-purchase buy modal (with
// a working unit count for lazy/unloaded courses); Garden no longer
// force-opens an empty course plot on first paint; the sign-contract
// modal explains signing plants the course's first Garden seed.
// Bumped for the live Supabase connection: core/supabase.js now carries
// a real project URL and publishable key instead of two empty strings.
// A stale copy is the version that still believes the backend is not
// configured, so every Cloud call throws the "not configured" error --
// which reads exactly like a broken backend rather than a cached file.
// Bumped for the cheat-code removal: Settings lost its Unlock-code box,
// index.html lost the settings/codes.js tag, i18n.js lost five keys and
// db.js lost applyAdminCode. A stale index.html against a fresh
// settings.js renders a code box whose handler no longer exists.
// Bumped for the account gate: core/auth.js is a NEW file index.html
// must load, plus new i18n keys, the #auth-modal markup and the profile
// dropdown losing its switcher. A stale index.html against a fresh
// profile.js is a dropdown wired to elements that no longer exist.
// Bumped for Step 4: core/migrate-cloud.js is a NEW file index.html must
// load, and auth.js calls it. A stale index.html means Dojo.CloudMigrate
// is simply absent and the claim silently never runs.
// Bumped for Step 6: core/sync.js is a NEW file, plus the sync.offline
// i18n key and .sync-notice CSS it renders with. A stale index.html
// means Dojo.Sync is absent and nothing ever reaches the cloud.
// Bumped for Step 7: corrected privacy/ToS text (the old copy claimed
// no account and no server, both false since Step 3), a new
// #delete-account-modal in index.html, and the deleteAccount plumbing
// in supabase.js/auth.js. A stale index.html gives a delete button with
// no modal to open.
// Bumped for the admin-gate fix: admin/admin.js lost MASTER_ADMIN_KEYS
// and its passcode challenge, data/db.js lost SECRET_ADMIN_NAME. A
// stale admin.js is the version that still accepts a typed public
// string, which is the whole hole being closed.
// Bumped for the run-through fixes: buyCourse now goes through the
// buy_course RPC (it was still spending locally, so the server-side
// paywall existed but was never called), and the sign-up nickname now
// lands after the claim instead of being overwritten by it.
// Bumped: the delete-account modal blamed the network when the real
// cause was "not signed in", and the section now hides entirely when
// there is no account on the device.
// Bumped: the landing page still promised "no account needed", which
// has been false since the sign-in gate shipped -- the first thing a
// new visitor read, and the third stale local-only claim found.
// Bumped: the server economy is now mirrored into the local profile on
// sign-in and every sync -- without it the HUD showed 0 tokens while the
// account held 5000. Also disables the demo token-pack stub, which
// credited local tokens the server-side paywall correctly ignores.
// Bumped for nickname login: sign-in accepts an email OR a nickname
// (0007 adds the lookup RPC + a unique index), the field is relabelled
// per mode, and sign-up rejects a taken nickname up front.
// Bumped: poking a bird now looses an arrow at it -- 75% miss, 17%
// stuck (flies on wounded), 8% downed (tumbles out of the sky), with
// feather counts reworked to tell you which happened.
// Bumped for the pentagram star-links mode: core/lobby.js draws it,
// base.css styles it, and Custom lists it alongside Spokes and Star of
// David.
const CACHE_VERSION = "knell-v47";
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
