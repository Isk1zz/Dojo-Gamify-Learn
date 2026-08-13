// ================================================
// CS Dojo — CORE / lobby
// ------------------------------------------------
// The hub screen. Owns no content of its own — every tile is a
// one-line summary a branch hands over, plus Router.go(...).
// If a tile needs a number, ask the branch for it; do not compute
// another branch's numbers here.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const state = Dojo.state;
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const gardenSummary = (...a) => Dojo.gardenSummary(...a);
  const shopSummary = (...a) => Dojo.shopSummary(...a);

  // ---- Lobby ----
  function showLobby() {
    state.currentCourse = null;
    const p = DB.getActiveProfile();
    document.getElementById("lobby-welcome").textContent =
      p ? `Welcome back, ${p.name}.` : "Welcome.";

    // "Cards" is a re-skin of these same six tiles, not a rearrangement
    // — see styles/base.css's .lobby-style-cards. "Star" DOES rearrange
    // them, into a hub-and-spoke circle of nodes — see layoutLobbyRadial
    // below. "classic" needs no class.
    const style = DB.getLobbyStyle();
    const actionsEl = document.getElementById("lobby-actions");
    if (actionsEl) {
      actionsEl.classList.toggle("lobby-style-cards", style === "cards");
      actionsEl.classList.toggle("lobby-style-star", style === "star");
    }

    // Streak now lives as a persistent top-right badge (core/hud.js's
    // renderStreak), not a lobby-only line — it needs to be visible from
    // every screen, not just here.

    // Resume tile — only offered when there's somewhere to resume to.
    const pos = DB.getPosition();
    const resumeBtn = document.getElementById("btn-lobby-resume");
    if (pos) {
      const topic = ALL_TOPICS.find(t => t.id === pos.topicId);
      if (topic) {
        resumeBtn.style.display = "flex";
        document.getElementById("lobby-resume-sub").textContent =
          `${topic.icon} ${topic.title} — chunk ${pos.chunkIdx + 1}`;
      } else {
        resumeBtn.style.display = "none";
      }
    } else {
      resumeBtn.style.display = "none";
    }

    // Review is no longer a tile. Due topics are "plants that need
    // watering" and live in the Garden, where the picture already means
    // retention — see garden/GARDEN.md.

    // Each tile's subtitle is asked for, not computed here. The lobby
    // must not know what a plant or a theme price is.
    const tile = (id, subId, summary) => {
      const btn = document.getElementById(id);
      const sub = document.getElementById(subId);
      if (!btn) return;
      if (!summary) { btn.style.display = "none"; return; }
      btn.style.display = "flex";
      if (sub) sub.textContent = summary;
    };
    tile("btn-lobby-garden", "lobby-garden-sub", gardenSummary());
    tile("btn-lobby-shop",   "lobby-shop-sub",   shopSummary());
    tile("btn-lobby-games",  "lobby-games-sub",  Dojo.gamesSummary ? Dojo.gamesSummary() : null);
    tile("btn-lobby-flashcards", "lobby-flashcards-sub", Dojo.flashcardsSummary ? Dojo.flashcardsSummary() : null);

    renderCharge();
    if (Dojo.renderStreak) Dojo.renderStreak();
    if (Dojo.renderVitals) Dojo.renderVitals();
    showScreen("lobby");
    starAngle = 0;
    layoutLobbyRadial(style, starAngle);
    if (style === "star") startStarSpin(); else stopStarSpin();
  }

  // ---- Rotate slider (Star topology only) ----
  // Purely visual, no game state involved. The slider is a VELOCITY
  // dial, not a position dial — centered on 0 (no spin), drag either
  // way to set how many degrees/second the ring turns. A rAF loop
  // (starSpinTick) reads that value every frame and accumulates it
  // into starAngle, which feeds the same trig layoutLobbyRadial already
  // used for tile position and spoke lines, so tile icons/text stay
  // upright and click hit-testing stays correct while it spins — a
  // CSS transform on the container would rotate tile content sideways
  // too and reintroduce the hit-testing mismatch documented below.
  // Resets to 0 every time the lobby is (re)entered; nothing about the
  // angle is worth persisting.
  let starAngle = 0;
  let starSpinHandle = null;
  let starLastTs = null;

  function stopStarSpin() {
    if (starSpinHandle) cancelAnimationFrame(starSpinHandle);
    starSpinHandle = null;
    starLastTs = null;
  }

  function starSpinTick(ts) {
    const lobbyEl = document.getElementById("lobby");
    const slider = document.getElementById("lobby-rotate-slider");
    if (!lobbyEl || !lobbyEl.classList.contains("active") || !slider) { stopStarSpin(); return; }
    if (starLastTs == null) starLastTs = ts;
    const dt = (ts - starLastTs) / 1000;
    starLastTs = ts;
    const velocity = parseFloat(slider.value) || 0; // degrees/second
    if (velocity !== 0) {
      starAngle = (starAngle + velocity * dt) % 360;
      layoutLobbyRadial("star", starAngle);
    }
    starSpinHandle = requestAnimationFrame(starSpinTick);
  }

  function startStarSpin() {
    stopStarSpin();
    starSpinHandle = requestAnimationFrame(starSpinTick);
  }

  // Star's own tile order — Career/Garden and Settings/Arcade sit
  // swapped from their Classic/Cards positions here, because the swap
  // was asked for on the ring layout specifically, not as a change to
  // the tile list itself. Classic/Cards still read straight DOM order
  // (index.html), so this array is the ONLY place that order differs.
  // Flashcards deliberately does NOT sit on this ring — reported live
  // as "broken" once it did: 6 tiles fit the ring radius Star was tuned
  // for; a 7th (or 8th, with Resume also visible) started overlapping.
  // It lives in the hub instead — see the "middle button" wiring below,
  // which fixes the tile count problem structurally rather than
  // re-tuning the radius for a number that can grow again later.
  const STAR_ORDER = [
    "btn-lobby-courses", "btn-lobby-resume", "btn-lobby-shop",
    "btn-lobby-garden", "btn-lobby-settings", "btn-lobby-stats", "btn-lobby-games"
  ];

  // Positions each visible tile around a circle and draws the
  // hub-to-tile spokes as SVG lines. Computed in JS rather than pure
  // CSS nth-child angles because the Resume tile toggles display:none
  // on its own — a fixed angle-per-DOM-slot scheme would leave a gap
  // at its spot whenever it's hidden. Must run after showScreen("lobby")
  // so the container has real layout to measure.
  //
  // Tile position used to be a pure-CSS `rotate(angle) translate(radius)
  // rotate(-angle)` chain driven by a single `--angle` custom property —
  // clean in theory, but a chained rotate/translate/rotate transform is
  // exactly the kind of thing real browsers (and their touch/pointer
  // hit-testing) don't all agree on: the circle could render in one
  // place while the actual clickable point sat somewhere else entirely
  // (reported live: "lobby's mouse points offset from real position",
  // reproduced — a tile's own computed center point activated a
  // DIFFERENT tile across the layout). Fixed by computing each tile's
  // pixel position in JS with plain trig — the same formula already
  // used for the SVG spoke lines below, now shared by both — and
  // setting it as `left`/`top`. Ordinary box position plus a single
  // `translate(-50%, -50%)` to center on that point has exactly one
  // reasonable interpretation for hit-testing, unlike the rotate chain.
  function layoutLobbyRadial(style, angle) {
    const actionsEl = document.getElementById("lobby-actions");
    const svg = document.getElementById("lobby-star-lines");
    if (!actionsEl) return;
    const allTiles = Array.from(actionsEl.querySelectorAll(".lobby-tile"));

    if (style !== "star") {
      allTiles.forEach(el => { el.style.removeProperty("--tx"); el.style.removeProperty("--ty"); });
      if (svg) svg.innerHTML = "";
      return;
    }

    // Flashcards lives in the hub in this topology, not on the ring —
    // its regular tile is still in the DOM (Classic/Cards need it) and
    // showLobby's tile() helper already set it to display:flex via
    // inline style before this function ever runs, which no external
    // stylesheet rule can override. With no --tx/--ty it would fall
    // back to dead-center and land right on top of the hub. Hidden
    // explicitly here instead; restored for free next time showLobby
    // runs in a non-star style, since tile() sets its display on every
    // call regardless of what this function last did to it.
    const hubOnlyTile = document.getElementById("btn-lobby-flashcards");
    if (hubOnlyTile) hubOnlyTile.style.display = "none";

    const tiles = STAR_ORDER
      .map(id => document.getElementById(id))
      .filter(el => el && el.style.display !== "none");

    const n = tiles.length;
    const box = actionsEl.getBoundingClientRect();
    const cx = box.width / 2, cy = box.height / 2;
    const r = parseFloat(getComputedStyle(actionsEl).getPropertyValue("--lobby-radius")) || 130;
    const rot = typeof angle === "number" ? angle : 0;

    tiles.forEach((el, i) => {
      const a = (-90 + rot + i * (360 / n)) * Math.PI / 180;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      el.style.setProperty("--tx", `${x}px`);
      el.style.setProperty("--ty", `${y}px`);
    });

    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = tiles.map((_, i) => {
      const a = (-90 + rot + i * (360 / n)) * Math.PI / 180;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`;
    }).join("");
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { showLobby });
})();
