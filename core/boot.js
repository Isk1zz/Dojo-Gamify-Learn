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
    museum:         () => Dojo.renderMuseum,
    inventory:      () => Dojo.renderInventory,
    store:          () => Dojo.renderStore,
    settings:       () => Dojo.renderSettings
  };

  Object.entries(SCREENS).forEach(([id, get]) => {
    const fn = get();
    if (typeof fn === "function") Router.register(id, { render: fn });
    // Says no more than that: in the demo the Forum is left out on
    // purpose and its tile goes to the Museum, so "its tile will hide"
    // (what this used to add) was not true for every branch.
    else console.info(`[boot] branch for "${id}" not loaded`);
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
  // The demo has no Forum: it needs a server the demo does not have, so
  // tools/make-demo.js leaves forum/ out of the copy. There the Forum's
  // tile becomes the Museum (museum/museum.js), with the Forum as its
  // first exhibit. It is the same tile and id, not a new one, because
  // two Star looks count tiles exactly (core/lobby.js, RING_TRIM).
  if (Dojo.DEMO) {
    const slot = document.getElementById("btn-lobby-games");
    const icon = slot && slot.querySelector(".lt-icon");
    const title = slot && slot.querySelector(".lt-title");
    if (icon) icon.textContent = "\u{1F3DB}️";
    if (title) { title.dataset.i18n = "ui.tile.museum"; title.textContent = I18N.t("ui.tile.museum"); }
  }
  on("btn-lobby-games",    () => Router.go(Dojo.DEMO ? "museum" : "forum"));
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
  //
  // In the PENTAGRAM topology the ring must be exactly five, so Resume
  // is moved here when there is something to resume — core/lobby.js
  // sets data-pent-hub="resume" and swaps the icon. The id stays
  // "flashcards" because it addresses an element, not a behaviour;
  // renaming it would touch index.html and the CSS for no gain.
  on("btn-lobby-hub-flashcards", (e) => {
    const el = e && e.currentTarget;
    if (el && el.dataset.pentHub === "resume") {
      // Same call the real Resume tile makes below -- resumeAt needs the
      // saved position, it does not look it up itself.
      const pos = DB.getPosition();
      if (!pos) return Dojo.showLobby();
      return Dojo.resumeAt(pos);
    }
    if (Dojo.openFlashcardsHub) Dojo.openFlashcardsHub();
  });

  ["btn-back-lobby", "btn-back-lobby2", "btn-back-lobby3",
   "btn-back-lobby4", "btn-back-lobby6"]
    .forEach(id => on(id, () => Dojo.showLobby()));
  // Was the Arcade's special case (step back to the game list rather
  // than to the Lobby). The Forum has no sub-screens, so it is an
  // ordinary back button now.
  on("btn-back-lobby5", () => Dojo.showLobby());
  on("btn-back-museum", () => Dojo.showLobby());

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
  // The SERVER pays these, and it verifies the rank itself.
  //
  // This was the last client-side grant in the app: DB.addTokens(bonus)
  // wrote free Tokens straight into localStorage, where the next
  // economy pull erased them. The same bug XP had, on the currency that
  // costs real money.
  //
  // It is also the best-verified reward in the app, better than the
  // course content ones. Those trust progress, because the client
  // pushes completed_topics. A rank reward is checked against
  // charge_earned — a number the server computed from payments it made
  // itself, and which no client has been able to name since 0012. The
  // rank number in this call is only an address; the entitlement behind
  // it is re-derived server-side (`require_xp` in migration 0016).
  //
  // The event still drives it, so the moment is unchanged: the reward
  // arrives when the boundary is crossed, not on a later sweep.
  Bus.on("rank:up", ({ to }) => {
    if (!to || !to.reward || !to.reward.tokens || !Dojo.Earn) return;
    Dojo.Earn.claim(`rank:${to.n}`).then(r => {
      if (r && r.status === "paid" && r.tokens) {
        Bus.emit("tokens:changed", { delta: r.tokens, reason: "rank-up" });
      }
    });
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
  // Demo build only: a sample profile on a visit that has none yet, so
  // every screen has something to show (core/demo.js).
  if (Dojo.DEMO && Dojo.seedDemo) Dojo.seedDemo();
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

  // ---- Landing: the Knell garden, playable before you begin ----
  // The start screen shows a garden with a bell tower (scenes/
  // knell-garden.js): the Garden's five growth stages along one path. A
  // visitor can send the runner around before deciding to start. Arriving
  // at a plant puts that stage's meaning in the caption, and arriving at
  // the tower rings the bell (the scene swings it; the sound is here).
  // Off screen its own IntersectionObserver stops it, so it costs nothing
  // behind the app. Until 2026-11-22 this was the e-bike junction, which
  // showed one course rather than what Knell is.
  const sceneHost = document.getElementById("landing-scene");
  if (sceneHost && Dojo.Scenes && Dojo.Scenes.has("knell-garden")) {
    const cap = document.createElement("p");
    cap.className = "landing-scene-caption";
    cap.textContent = I18N.t("scene.landingCaption");

    // A tap on a pin pins a small note to it, on the letter's paper: the
    // stage's symbol from the Garden, its name, and a line or two on what
    // it means ("can it open a tiny letter saying what that is? like a
    // note", 2026-11-22). In the scene a sprout is a few pixels tall on a
    // phone, so the note is what says which stage was picked. It sits
    // beside the pin, because the pins stand in one column and a note
    // above one covers the next; only where there is no room beside it
    // (a phone) does it go above the pin, or below when there is no room
    // above either. A tap on the note puts it away; the next pin
    // replaces it.
    const note = document.createElement("div");
    note.className = "scene-note";
    note.hidden = true;
    note.setAttribute("role", "status");
    const noteHead = document.createElement("div");
    noteHead.className = "scene-note-head";
    const noteIcon = document.createElement("span");
    noteIcon.className = "scene-note-icon";
    noteIcon.setAttribute("aria-hidden", "true");
    const noteTitle = document.createElement("span");
    const noteText = document.createElement("p");
    noteText.className = "scene-note-text";
    noteHead.append(noteIcon, noteTitle);
    note.append(noteHead, noteText);
    note.addEventListener("click", () => { note.hidden = true; });
    const showNote = ({ say, icon, label, el }) => {
      if (!say || !el) { note.hidden = true; return; }
      noteIcon.textContent = icon;
      noteTitle.textContent = label;
      noteText.textContent = say;
      note.hidden = false;
      note.classList.remove("below", "right", "left");
      const host = sceneHost.getBoundingClientRect(), pin = el.getBoundingClientRect();
      const px = pin.left + pin.width / 2 - host.left, py = pin.top + pin.height / 2 - host.top;
      // Beside the whole column of pins, not just this one: they zigzag,
      // so a note just past one pin lands on the next. The note narrows
      // to the room there is, down to 150 px, before giving up the side.
      const xs = [...sceneHost.querySelectorAll(".ks-pin")].map(p => {
        const r = p.getBoundingClientRect();
        return r.left + r.width / 2 - host.left;
      });
      const colRight = Math.max(...xs) + 20, colLeft = Math.min(...xs) - 20;
      const roomR = host.width - colRight - 16, roomL = colLeft - 16;
      const side = roomR >= 150 ? "right" : roomL >= 150 ? "left" : "";
      note.style.maxWidth = side ? Math.min(240, side === "right" ? roomR : roomL) + "px" : "";
      const w = note.offsetWidth, h = note.offsetHeight, half = w / 2;
      if (side) {
        note.classList.add(side);
        note.style.left = (side === "right" ? colRight + 6 : colLeft - 6) + "px";
        note.style.top = Math.max(h / 2 + 4, Math.min(host.height - h / 2 - 4, py)) + "px";
      } else {
        const x = Math.max(half + 6, Math.min(host.width - half - 6, px));
        const below = pin.top - host.top - h - 10 < 0;
        note.classList.toggle("below", below);
        note.style.left = x + "px";
        note.style.top = (below ? pin.bottom - host.top + 10 : pin.top - host.top - 10) + "px";
        note.style.setProperty("--tail", (px - (x - half)) + "px");
      }
      // Restart the pop-in, so a second tap visibly lands a new note.
      note.style.animation = "none";
      void note.offsetWidth;
      note.style.animation = "";
    };

    const drawGarden = () => Dojo.Scenes.render(sceneHost, "knell-garden", {
      lang: I18N.lang(),
      onPick: showNote,
      onChapter: ({ act }) => {
        if (act === "bell" && Dojo.sfx && Dojo.sfx.bell) Dojo.sfx.bell();
        // The mailbox at the gate holds a letter (core/letter.js).
        if (act === "letter" && Dojo.openLetter) Dojo.openLetter();
      }
    });
    let garden = drawGarden();
    sceneHost.append(note, cap);
    // The garden is drawn for the sky it opens under, day or night, so a
    // switch of sky redraws it, above the note and the caption.
    Bus.on("sky:changed", () => {
      note.hidden = true;
      garden.destroy();
      garden = drawGarden();
      sceneHost.insertBefore(garden.svg, note);
    });
    const content = sceneHost.closest(".landing-content");
    if (content) content.classList.add("has-scene");
  }

  // While sign-in is switched off, the line under the button says so.
  // The account line it replaces promises progress on any device, which
  // in this mode is false, and it is the first sentence a visitor reads.
  if (Dojo.OPEN_ACCESS) {
    const hint = document.getElementById("landing-hint");
    if (hint) {
      hint.removeAttribute("data-i18n");
      hint.textContent = I18N.t("ui.landing.demo");
    }
  }

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
