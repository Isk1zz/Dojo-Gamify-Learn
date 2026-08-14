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
    // The dials sit above the brand, outside .lobby-actions (see
    // index.html) — so they can't be shown/hidden by a descendant
    // selector on the style class above. Toggled directly instead.
    const dialsEl = document.getElementById("lobby-dials");
    if (dialsEl) dialsEl.classList.toggle("is-star", style === "star");

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
    sparkDeg = 0;
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
      // Counter-rotation, geared down by the radius ratio the last
      // layout pass measured — see the orbit block above.
      sparkDeg -= velocity * dt * gearRatio;
      sparkDir = velocity > 0 ? -1 : 1;
      layoutLobbyRadial("star", starAngle);
    }
    starSpinHandle = requestAnimationFrame(starSpinTick);
  }

  function startStarSpin() {
    stopStarSpin();
    starSpinHandle = requestAnimationFrame(starSpinTick);
  }

  // ---- Orbit ring + spark (Star topology only) ----
  // A dotted track drawn around the whole constellation with a single
  // spark travelling along it. Two things keep this from being arbitrary
  // decoration — both fall out of geometry that already exists:
  //
  //  * The spark runs COUNTER to the menu, at the real gear ratio
  //    between the two circles. Meshed gears share a tangential speed
  //    (v = wR), so w_spark = w_menu * (r_menu / r_orbit): the bigger
  //    wheel turns slower, exactly like a small gear driving a big one.
  //    Nothing here is hand-tuned — move either radius and the ratio
  //    follows, because it IS the ratio, not a number picked to look
  //    like one.
  //  * Its colour advances one step every 7 full revolutions, eased
  //    across the last of those 7 so it reads as a morph, not a switch.
  //
  // Both derive from one accumulator, so the whole effect is a pure
  // function of how far the menu has been turned. Nothing to persist.
  const SPARK_COLORS = ["#38bdf8", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"];
  const REVS_PER_COLOR = 7;

  // A 3:1 step-up stage on top of the true radius ratio. Pure 1:1
  // tangential coupling is the honest two-gear answer, but it reads as
  // sluggish precisely BECAUSE it's correct — the bigger wheel turns
  // slower, so the spark crawled while the menu swept past it. A
  // compound train with a step-up stage is still a real mechanism, so
  // this multiplies the ratio rather than replacing it with a made-up
  // constant: move either radius and the spark still responds
  // proportionally, it just runs three stages faster.
  const SPARK_STEPUP = 3;

  // Deliberately NOT starAngle: that one wraps at 360 (it only ever
  // feeds trig, where the wrap is free), and a wrapped counter can't
  // answer "how many revolutions have you done" — which is the whole
  // basis of the colour step below.
  let sparkDeg = 0;
  let sparkDir = -1;   // sign of last motion; picks which side the tail trails on
  let gearRatio = 0.7; // recomputed from the measured radii on every layout pass

  function mixHex(a, b, t) {
    const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const A = rgb(a), B = rgb(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
  }

  // `phaseSteps` offsets a spark whole colour-steps along the sequence,
  // so a ring of sparks shows several palette colours at once instead
  // of N copies of the same one. Added in REVOLUTIONS, not degrees, so
  // it can't interact with the abs() below the way a raw degree offset
  // would once totalDeg goes negative.
  function sparkColorAt(totalDeg, phaseSteps) {
    const revs = Math.abs(totalDeg) / 360 + (phaseSteps || 0) * REVS_PER_COLOR;
    const step = Math.floor(revs / REVS_PER_COLOR);
    const within = revs - step * REVS_PER_COLOR;
    // Hold the colour for 6 revolutions, then cross-fade over the 7th —
    // a fade spread across all 7 would never actually BE any of the
    // palette colours, just a permanent slow rainbow.
    const t = within <= REVS_PER_COLOR - 1 ? 0 : within - (REVS_PER_COLOR - 1);
    const eased = t * t * (3 - 2 * t);
    return mixHex(
      SPARK_COLORS[step % SPARK_COLORS.length],
      SPARK_COLORS[(step + 1) % SPARK_COLORS.length],
      eased
    );
  }

  // Where the track can sit without ever costing the page a horizontal
  // scrollbar. Outside the tiles when the box allows it; clamped to
  // whatever slack the viewport actually has when it doesn't (at 375px
  // the tiles already reach the container's own edge, and narrower
  // still overruns it). Vertical bleed needs no clamp — the SVG is
  // absolutely positioned and overflow:visible, so a few px past the
  // box costs nothing and the page scrolls that way anyway.
  function orbitRadiusFor(box, cx, r, tileHalf) {
    const slackX = Math.max(0, (document.documentElement.clientWidth - box.width) / 2 - 12);
    return Math.max(r * 0.5, Math.min(r + tileHalf + 10, cx + slackX));
  }

  function orbitTrackMarkup(cx, cy, orbitR) {
    return `<circle class="lobby-orbit-ring" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${orbitR.toFixed(1)}"/>`;
  }

  // Drawn as plain concentric circles rather than a blur filter or a
  // CSS drop-shadow: this is rebuilt every animation frame while the
  // ring turns, and three cheap circles cost nothing on a phone where
  // a re-parsed filter would.
  function orbitSparkMarkup(cx, cy, orbitR) {
    // Count comes straight off the dial each frame, exactly like the
    // rotate slider's velocity — no state, nothing to persist or reset.
    const dial = document.getElementById("lobby-spark-slider");
    const count = dial ? parseInt(dial.value, 10) : 1;
    if (!count || count < 1) return "";

    const at = deg => {
      const a = (-90 + deg) * Math.PI / 180;
      return [cx + orbitR * Math.cos(a), cy + orbitR * Math.sin(a)];
    };

    let out = "";
    for (let s = 0; s < count; s++) {
      // Evenly spaced around the ring, each one colour-step apart.
      const lead = sparkDeg + s * (360 / count);
      const color = sparkColorAt(sparkDeg, s);
      for (let k = 5; k >= 1; k--) {
        const [tx, ty] = at(lead - sparkDir * k * 3.4);
        out += `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${(2.5 - k * 0.36).toFixed(2)}" fill="${color}" opacity="${(0.32 - k * 0.05).toFixed(3)}"/>`;
      }
      const [sx, sy] = at(lead);
      out += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="8.5" fill="${color}" opacity="0.14"/>` +
             `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4.6" fill="${color}" opacity="0.4"/>` +
             `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="2.3" fill="${color}"/>`;
    }
    return out;
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

    // Spokes start on the hub's RIM, not at the dead-centre point they
    // all used to converge on — every line met in one spot behind the
    // Flashcards button, which read as a knot rather than a hub. Each
    // one now leaves the circle at the bearing of its own tile, so the
    // attachment points sit evenly around the hub and orbit it as the
    // ring turns (they're derived from the same angle as the tile).
    const hubEl = document.getElementById("btn-lobby-hub-flashcards");
    const hubR = ((hubEl && hubEl.offsetWidth) || 66) / 2 + 4;

    const nodeAt = i => {
      const a = (-90 + rot + i * (360 / n)) * Math.PI / 180;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    const line = (x1, y1, x2, y2) =>
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;

    // Hexagram: two triangles through alternating nodes — with the
    // Resume tile hidden the ring is exactly 6 tiles at 60°, so
    // {0,2,4} and {1,3,5} are Library/Garden/Statistics and
    // Career/Settings/Arcades. That's a true Magen David, not an
    // approximation of one. It needs SIX nodes to be one, though: when
    // Resume is visible the ring is 7 and connecting every-other node
    // walks a single 7-pointed path instead of closing two triangles,
    // so that case falls back to spokes rather than drawing something
    // lopsided and calling it a hexagram.
    const wantHexagram = DB.getStarLinks && DB.getStarLinks() === "hexagram";
    let links;
    if (wantHexagram && n === 6) {
      links = [0, 1].map(offset =>
        [0, 1, 2].map(k => {
          const [x1, y1] = nodeAt(offset + k * 2);
          const [x2, y2] = nodeAt(offset + ((k + 1) % 3) * 2);
          return line(x1, y1, x2, y2);
        }).join("")
      ).join("");
    } else {
      links = tiles.map((_, i) => {
        const a = (-90 + rot + i * (360 / n)) * Math.PI / 180;
        const cos = Math.cos(a), sin = Math.sin(a);
        const [x2, y2] = nodeAt(i);
        return line(cx + hubR * cos, cy + hubR * sin, x2, y2);
      }).join("");
    }

    // offsetWidth, not getBoundingClientRect().width — a hovered tile
    // carries a scale(1.1), and measuring that would make the whole
    // orbit jump outward whenever the pointer rests on a tile.
    const tileHalf = (tiles[0] ? tiles[0].offsetWidth : 112) / 2;
    const orbitR = orbitRadiusFor(box, cx, r, tileHalf);
    gearRatio = orbitR > 0 ? (r / orbitR) * SPARK_STEPUP : SPARK_STEPUP;

    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    // Track first so the spokes and the spark both sit above it.
    svg.innerHTML = orbitTrackMarkup(cx, cy, orbitR) + links + orbitSparkMarkup(cx, cy, orbitR);
  }

  // Re-measures and repositions the ring after the container's actual
  // size can have changed out from under the ONE-TIME measurement
  // showLobby's layoutLobbyRadial call took. Two real triggers this
  // fixes, neither reproducible on a fast local dev server, which is
  // why this shipped broken on a real phone but never here: (1)
  // index.html loads Google Fonts over the network with
  // `display=swap` — text renders in a fallback font first, then
  // reflows once Inter/JetBrains Mono actually arrive, and a slow
  // mobile connection is exactly where that gap is widest; (2) mobile
  // Safari/Chrome resize the visual viewport as the address bar
  // collapses/expands on scroll, which layoutLobbyRadial's one-shot
  // getBoundingClientRect never sees happen. Guarded to only act while
  // the lobby is the active screen and Star is the equipped style —
  // free to call liberally, it's a no-op otherwise.
  function relayoutIfStarLobbyActive() {
    const lobbyEl = document.getElementById("lobby");
    if (!lobbyEl || !lobbyEl.classList.contains("active")) return;
    if (DB.getLobbyStyle() !== "star") return;
    layoutLobbyRadial("star", starAngle);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(relayoutIfStarLobbyActive);
  }
  let resizeDebounce = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(relayoutIfStarLobbyActive, 120);
  });

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { showLobby });
})();
