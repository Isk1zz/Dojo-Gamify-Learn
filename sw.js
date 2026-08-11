// ================================================
// CS Dojo — service worker
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

const CACHE_VERSION = "cs-dojo-v2";
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
