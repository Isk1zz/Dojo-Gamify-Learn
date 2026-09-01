// ================================================
// Knell — CORE / boot
// ------------------------------------------------
// Loads last. Three jobs and no others:
//   1. register every branch's screen with the Router
//   2. wire the cross-branch buttons (lobby tiles, back-to-lobby)
//   3. start the app
//
// A button that stays inside one branch (back to Topics, retry exam)
// is wired by that branch, not here. If you are adding a listener to
// this file, check first that it really crosses a branch boundary.
// ================================================

(() => {
  const { Router, Bus, state } = Dojo;

  // ---- 1. Screen registry ----
  // A branch that isn't loaded simply isn't registered, and its lobby
  // tile hides itself. That's what makes a folder droppable.
  const SCREENS = {
    lobby:          () => Dojo.showLobby,
    "course-select":() => Dojo.renderCourseSelect,
    "unit-select":  () => Dojo.renderUnitSelect,
    "topic-map":    () => Dojo.renderTopicMap,
    garden:         () => Dojo.renderGarden,
    shop:           () => Dojo.renderShop,
    forum:          () => Dojo.renderForum,
    inventory:      () => Dojo.renderInventory,
    store:          () => Dojo.renderStore,
    settings:       () => Dojo.renderSettings
  };

  Object.entries(SCREENS).forEach(([id, get]) => {
    const fn = get();
    if (typeof fn === "function") Router.register(id, { render: fn });
    else console.info(`[boot] branch for "${id}" not loaded — its tile will hide`);
  });

  // ---- 2. Cross-branch wiring ----
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };

  // Accounts are mandatory (BACKEND-ROADMAP.md Step 3): requireAccount()
  // opens the sign-in gate and returns false when this device has never
  // signed in, so the lobby is never painted behind it. It returns true
  // offline for anyone who HAS signed in here before — the gate is a
  // localStorage read, not a network call, so an installed PWA still
  // opens on a plane. See core/auth.js.
  //
  // Dojo.checkProfile stays as the fallback for a build where auth.js
  // is absent; deleting a branch file should degrade, not crash.
  on("btn-start", () => {
    if (Dojo.Auth) {
      if (!Dojo.Auth.requireAccount()) return;
    } else {
      Dojo.checkProfile();
    }
    Dojo.showLobby();
  });

  on("btn-lobby-courses",  () => Router.go("course-select"));
  on("btn-token-shop",     () => Router.go("store", { cat: "packs" }));
  on("btn-lobby-garden",   () => Router.go("garden"));
  on("btn-lobby-shop",     () => Router.go("shop"));
  on("btn-lobby-games",    () => Router.go("forum"));
  on("btn-lobby-settings", () => Router.go("settings"));
  // Statistics merged into Career; this tile is Inventory now (its id
  // is unchanged on purpose — see index.html).
  on("btn-lobby-stats",    () => Router.go("inventory"));
  on("btn-back-inventory", () => Router.go("lobby"));
  on("btn-back-store",     () => Router.go("lobby"));
  on("btn-lobby-flashcards", () => Dojo.openFlashcardsHub && Dojo.openFlashcardsHub());
  // Star layout's hub button — Flashcards' home in that topology only
  // (see core/lobby.js's STAR_ORDER comment). Inert in Classic/Cards,
  // where .lobby-hub stays display:none and the real tile handles it.
  on("btn-lobby-hub-flashcards", () => Dojo.openFlashcardsHub && Dojo.openFlashcardsHub());

  ["btn-back-lobby", "btn-back-lobby2", "btn-back-lobby3",
   "btn-back-lobby4", "btn-back-lobby6"]
    .forEach(id => on(id, () => Dojo.showLobby()));
  // Was the Arcade's special case (step back to the game list rather
  // than to the Lobby). The Forum has no sub-screens, so it is an
  // ordinary back button now.
  on("btn-back-lobby5", () => Dojo.showLobby());

  // Resume: jump straight back into the exact chunk they left.
  // Lives here rather than in library/ because the lobby owns the tile.
  on("btn-lobby-resume", () => {
    const pos = DB.getPosition();
    if (!pos) return Dojo.showLobby();
    Dojo.resumeAt(pos);
  });


  // ---- 3. Cross-branch reactions ----
  // Branches announce facts; the reaction lives with whoever cares.
  Bus.on("profile:changed", () => {
    Dojo.applyTheme(DB.getTheme());
    if (Dojo.applyBgStripe) Dojo.applyBgStripe(DB.getBgStripe());
    if (Dojo.applyScene) Dojo.applyScene(DB.getScene());
    if (Dojo.syncSkyToTheme) Dojo.syncSkyToTheme();   // theme + sky can never be observed disagreeing
    if (Dojo.applyHints) Dojo.applyHints(DB.getHintsEnabled());
    if (Dojo.applySoundEnabled) Dojo.applySoundEnabled(DB.getSoundEnabled());
    Dojo.renderCharge();
    Dojo.updateProfileBadge();
    if (Dojo.renderVitals) Dojo.renderVitals();
    // Entering a profile is exactly the "next time the user enters"
    // admin/ADMIN.md specifies for delivering a warning notice.
    if (Dojo.checkWarnings) Dojo.checkWarnings();
  });

  // The wallet strip lives in the top bar, so any branch that changes
  // the balance repaints it here rather than reaching for the element
  // itself.
  Bus.on("wallet:changed", () => Dojo.renderVitals && Dojo.renderVitals());
  Bus.on("tokens:changed", () => Dojo.renderVitals && Dojo.renderVitals());

  // data/db.js emits this when localStorage rejects a write (quota
  // exhausted, Safari private mode). It was emitted but never listened
  // to, so progress could silently stop persisting mid-session with no
  // indication — the one failure mode in an offline-first app that
  // actually loses a user's work. See core/hud.js's warnSaveFailed.
  Bus.on("db:saveFailed", () => Dojo.warnSaveFailed && Dojo.warnSaveFailed());

  // Free Tokens, event-driven off the SAME rank-up crossing that already
  // fires (core/hud.js's checkRankUp emits this on every XP-earning
  // action, but only actually FIRES when a rank boundary is crossed).
  // Credited here, once, rather than re-derived from XP like theme/
  // bgStripe rewards are — see shop/ranks.js's comment on why Tokens
  // can't use that pattern.
  Bus.on("rank:up", ({ to }) => {
    const bonus = to && to.reward && to.reward.tokens;
    if (bonus) {
      DB.addTokens(bonus);
      Bus.emit("tokens:changed", { delta: bonus, reason: "rank-up" });
    }
  });

  Bus.on("progress:changed", () => {
    if (state.currentUnit) Dojo.renderTopicMap();
  });

  // Admin & Telemetry Suite shortcut (Ctrl+Shift+A / F2) — a genuine
  // cross-branch binding (nothing "owns" a global keydown), so it lives
  // here even though admin/admin.js registers its own screen. Same
  // isAdmin gate every other entry point goes through; this is just a
  // faster door to it, not a bypass.
  if (Dojo.Router) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "F2" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a")) {
        e.preventDefault();
        Router.go("admin");
      }
    });
  }

  // ---- 4. Start ----
  DB.init();
  Dojo.applyTheme(DB.getTheme());
  if (Dojo.applyBgStripe) Dojo.applyBgStripe(DB.getBgStripe());
  if (Dojo.applyScene) Dojo.applyScene(DB.getScene());
  if (Dojo.syncSkyToTheme) Dojo.syncSkyToTheme();   // theme + sky can never be observed disagreeing
  if (Dojo.applyHints) Dojo.applyHints(DB.getHintsEnabled());
  if (Dojo.applySoundEnabled) Dojo.applySoundEnabled(DB.getSoundEnabled());
  Dojo.renderCharge();
  if (Dojo.renderStreak) Dojo.renderStreak();
  Dojo.updateProfileBadge();
  if (Dojo.renderVitals) Dojo.renderVitals();
  // Also on cold start, not just on profile switch: reopening the app
  // with a profile already active is the commonest way a warned user
  // actually comes back, and profile:changed doesn't fire for it.
  if (Dojo.checkWarnings) Dojo.checkWarnings();

  // ---- 5. Owned lazy content ----
  // A lazy course (intro-cs) ships its manifest only; its modules are
  // injected when the course is opened. That is fine for a course nobody
  // bought — and wrong for one somebody did, because an owner's numbers
  // depend on that content being in memory. Garden's due-review count
  // and Stats both walk ALL_TOPICS, and both run long before anyone
  // opens the Library.
  //
  // So an owned lazy course is fetched in the background right after
  // boot: the owner waits for nothing and sees correct figures, while an
  // unowned course stays off the boot path entirely — which is the whole
  // saving. requestIdleCallback keeps it clear of the first paint.
  //
  // This lives in boot.js and not in library.js on purpose: it is the
  // Library's content serving the Garden and Stats, which is exactly the
  // cross-branch case this file exists for.
  if (typeof Content !== "undefined" && Content.load) {
    Bus.on("content:loaded", () => {
      // Re-render whatever the user is actually looking at. The DOM is
      // the honest source for that — no second copy of "current screen"
      // to fall out of step with Router.
      const active = document.querySelector(".screen.active");
      const get = active && SCREENS[active.id];
      const fn = get && get();
      if (typeof fn === "function") fn();
    });

    const soon = window.requestIdleCallback || (fn => setTimeout(fn, 400));
    soon(() => {
      COURSES.forEach(c => {
        if (!c.lazyFiles || Content.isLoaded(c.id)) return;
        const owned = !(c.priceTokens > 0 && Dojo.ownsCourse && !Dojo.ownsCourse(c.id));
        if (!owned) return;
        Content.load(c.id, CONTENT).then(ok => {
          if (ok) Bus.emit("content:loaded", { course: c.id });
        });
      });
    });

    // Buying a course is the other moment its content becomes needed,
    // and it can happen in a session that never preloaded it.
    Bus.on("course:bought", e => {
      const id = e && e.course;
      if (id && !Content.isLoaded(id)) {
        Content.load(id, CONTENT).then(ok => { if (ok) Bus.emit("content:loaded", { course: id }); });
      }
    });
  }
})();
