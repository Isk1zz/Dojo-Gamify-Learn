// ================================================
// Knell — service worker: RETIRED on 2026-11-22
// ------------------------------------------------
// Knell no longer caches itself for offline use ("remove offline"). The
// worker that lived here served a returning visitor the copy it had
// kept, so the first visit after an update could show an old screen:
// it happened on the live demo the day this was written, the start
// screen still a junction after the garden had shipped. Now every visit
// loads from the network, every visitor sees the current version, and
// nothing suggests the app works without a connection.
//
// The file stays as a kill switch, for browsers that still run the old
// worker. They check this script on their next visit, find it changed,
// and install it; it deletes this app's own caches and nobody else's
// (several apps share isk1zz.github.io, and so one Cache Storage),
// unregisters itself, and reloads the open pages so that they come from
// the network. It has no fetch handler, so it never answers a request.
// index.html registers nothing any more, and removes a leftover worker
// and caches itself on the visits after that.
//
// CACHE_VERSION only names this app's cache family now: tools/make-demo.js
// renames it to knell-demo-v… in the demo copy, which is how each copy
// deletes its own caches and no other app's. The worker that was here,
// and every version note it carried, is in git up to commit 4b57d4e.
// ================================================
const CACHE_VERSION = "knell-v78";
const CACHE_FAMILY = CACHE_VERSION.replace(/\d+$/, "");   // "knell-v" or "knell-demo-v"

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith(CACHE_FAMILY) && /^\d+$/.test(k.slice(CACHE_FAMILY.length)))
      .map(k => caches.delete(k)));
    await self.registration.unregister();
    const pages = await self.clients.matchAll({ type: "window" });
    await Promise.all(pages.map(p => p.navigate(p.url).catch(() => { /* not ours to reload */ })));
  })());
});
