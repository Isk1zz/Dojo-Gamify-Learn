# Packaging

How to get Knell onto a machine. In the order worth doing it.

---

## The constraint everything else follows from

There is **no build step**. `index.html` opens by double-click and the app
runs. Every option below preserves that — nothing here is required for the app
to work, and if you delete `sw.js`, `manifest.webmanifest` and `icons/`, you
are back exactly where you started.

> **Corrected 2026-09-02: "no dependency and no server" is no longer true.**
> The line said all three for months after Supabase landed. supabase-js is a
> real dependency (loaded from a CDN, still no npm) and there is a real
> server holding accounts, progress, the economy and the Forum.
>
> The no-build property is the one that survived, and it is the one worth
> defending. Double-clicking `index.html` still works; what a signed-out
> device gets is the study flow on locally stored progress.

Don't trade that away for packaging. It's the reason the app will still run in
five years.

---

## 1. Web — already done

GitHub Pages serves the folder as-is. Branch `main`, root.
Live at `Isk1zz.github.io/cs_dojo_demo`.

Nothing to do. This is also the distribution channel with no gatekeeper, which
matters more than it sounds — see §4.

---

## 2. PWA — done in this stage

Added: `manifest.webmanifest`, `sw.js`, `icons/`, and a guarded registration
block at the bottom of `index.html`.

What it buys:

| Platform | Result |
|---|---|
| Android | Install to home screen, own icon, no browser chrome |
| Windows / macOS / Linux | Install from Chrome or Edge, own window, own taskbar entry |
| iOS / iPadOS | Add to Home Screen from Safari — works, but Apple won't prompt for it |

**Service workers need http(s) or localhost.** Over `file://` the registration
is skipped silently and the app behaves exactly as before. To test locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

### How the caching works, and why there's no file list
The obvious service worker precaches an array of every asset — which then has
to be hand-synced with ~30 script tags forever, and fails *silently* when you
forget. So `sw.js` precaches only `index.html` and caches every same-origin GET
as it's fetched. After one visit the whole app is offline-ready, and adding a
course or a branch needs no change to `sw.js` at all.

### Shipping an update
Bump `CACHE_VERSION` in `sw.js`. Old caches are deleted on activate; the new
version takes over once every tab is closed and reopened. **Nothing
auto-reloads mid-session** — a study app swapping its JS out from under someone
mid-exam is worse than a stale tab.

If you forget to bump it, returning users keep the old version indefinitely.
That is the one real footgun here.

---

## 3. Desktop binary — Tauri, when it's worth it

Tauri wraps the same folder in a native window: a few MB, uses the system
webview, no Electron. Roughly:

```bash
npm create tauri-app@latest      # frontend: "vanilla", dist dir: this folder
npm run tauri build
```

That does introduce a toolchain — but only for *producing installers*, not for
running the app. The folder still opens in a browser afterwards.

**Only worth doing once someone actually asks for an installer.** The PWA
already gives a desktop window and a taskbar icon for zero maintenance.

---

## 4. iOS and Android stores — read before starting

**Android**: a PWA can be published via Trusted Web Activity through Bubblewrap.
Not difficult.

**iOS**: the App Store requires a native shell (Capacitor or similar), an Apple
Developer account at $99/year, and review.

### The thing that will actually bite
Both stores treat **simulated gambling** as a restricted category, and the app
has an arcade with Crash, Hi-Lo and Blackjack.

The rule that keeps this simple: **the money must never be purchasable and
stakeable.** As long as `$` is earned in-app only, never bought with real money
and never cashed out, it's a closed loop — normal, and what most games do.
The moment a "buy stars" button exists next to a blackjack table, some
jurisdictions treat it as gambling regardless of intent, and both stores treat
it as a different class of app.

This is a schema decision, not a UI one. Decide it before building a store
build, not after.

Also unresolved and needed before any public release:
- **A LICENSE file.** The repo has none. See PROJECT.md §10.
- **Terms of Service and Privacy Policy.** Both are placeholders in Settings.

  > **This bullet used to be dangerous, corrected 2026-09-02.** It read: "The
  > privacy one is easy and true: everything is in localStorage, there is no
  > account, no server, no analytics, nothing leaves the browser. Say exactly
  > that." Following that instruction today produces a false privacy policy,
  > and it very nearly did — the shipped policy claimed exactly this after
  > accounts landed, and had to be corrected twice.
  >
  > What is true now: accounts are mandatory, email and a nickname are stored
  > on a Supabase project, progress and the economy sync to it, and Forum posts
  > are readable by other signed-in people. There is still no analytics and no
  > third-party tracking. **Write what the code does, then check it against the
  > code** — a privacy policy is the one document where being out of date is
  > not a documentation problem.

---

## Suggested order

1. **PWA** — done. Free, works everywhere, no gatekeeper, no review.
2. **Use it for a while.** Real usage will tell you what packaging is missing
   better than guessing will.
3. **Tauri** if someone wants a `.exe` or a `.dmg`.
4. **Stores** only if there's a reason to be in them — and only after the
   currency question and the licence are settled.
