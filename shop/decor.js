// ================================================
// CS Dojo — SHOP / lobby decorations + scenery
// ------------------------------------------------
// Bought with $, layered over the lobby independent of theme/palette —
// see core/theme.js's applyBgDecors for the rendering side and its
// per-theme suppression rule. "Each separately purchasable" per the
// original ask, plus a bundle: the Liberty Bundle sells both US pieces
// AND the USA flag palette together at a discount.
//
// This file owns the DATA and, unusually for a shop/ file, the cloud
// INTERACTION too. That's deliberate: the click behaviour is what the
// decoration *is* (a cloud you can poke), not a screen that renders it,
// and there is no other branch that owns the background layer.
// ================================================

(() => {
  // Not all US-themed: `clouds` is the first general-purpose one, and
  // deliberately so — it's the proof that the decoration layer built
  // for the US ask generalises, and the first real piece of the parked
  // Weather VFX idea (see UPDATESTACK.md) rather than a fourth overlay
  // invented for weather alone.
  // price 0 = free and always owned, the same convention themes use for
  // Indigo/Frost. All four ship free and switched on by default (see
  // data/db.js's profile defaults): this set IS the app's look now, not
  // an upsell, so a fresh profile should open on it rather than on an
  // empty background with the good version behind a paywall.
  const BG_DECORS = [
    { id: "usa_stars", name: "Stars", price: 0, icon: "⭐",
      desc: "A drifting field of stars, top-left corner." },
    { id: "usa_eagles", name: "Eagles", price: 0, icon: "🦅",
      desc: "Two eagles crossing the lobby, wings beating." },
    { id: "clouds", name: "Clouds", price: 0, icon: "☁️",
      desc: "Slow clouds at three depths — and you can poke them." },
    { id: "moon", name: "Moon", price: 0, icon: "🌙",
      desc: "A cratered moon, top-right, with a soft halo.",
      // One decoration with two faces — see the data-theme-mode split in
      // styles/base.css. The LABEL has to follow the sky, or Custom says
      // "Moon" while a sun is plainly visible behind it.
      lightName: "Sun", lightIcon: "☀️",
      lightDesc: "A sun, top-right, with a slow halo and turning rays." }
  ];

  // What to CALL a decoration right now. Only the moon/sun differs, but
  // it's a lookup rather than a special case at each call site so the
  // next two-faced piece needs no new plumbing.
  function decorFace(d) {
    const light = document.documentElement.dataset.themeMode === "light";
    if (!light) return { name: d.name, icon: d.icon, desc: d.desc };
    return {
      name: d.lightName || d.name,
      icon: d.lightIcon || d.icon,
      desc: d.lightDesc || d.desc
    };
  }

  // The Liberty Bundle is GONE, not repriced. It sold Stars + Eagles +
  // the USA palette for $650; with both decorations now free it would
  // be a $650 wrapper around a $400 palette — strictly worse than
  // buying the palette on its own, which is a trap, not a discount.
  // The USA palette is still sold normally in Styles.

  // ---- Scenery ----
  // The horizon along the bottom. A SLOT, not a set — see data/db.js's
  // getScene comment.
  // Nature only, for now. City and Village were built and then pulled:
  // drawn as rectangles-plus-triangles they read as flat cut-outs next
  // to the organic curves of the other three, and looked worse on the
  // page than no scenery at all. The markup is still in index.html and
  // the CSS still targets it — re-listing them here is all it takes to
  // bring them back, once they're drawn to the same standard.
  const SCENES = [
    { id: "jungle",  name: "Jungle",  price: 0,   icon: "🌴", desc: "Dense canopy and hanging vines." },
    { id: "river",   name: "River",   price: 250, icon: "🏞️", desc: "Still water with a far bank." },
    { id: "island",  name: "Island",  price: 350, icon: "🏝️", desc: "A lone palm on a sandbar." }
  ];

  // ================================================
  // Cloud interactions
  // ------------------------------------------------
  // Click a cloud and something happens — weighted random, so it stays
  // a small surprise rather than a button with one known result. The
  // fairy is the rare one on purpose; if it fired as often as rain it
  // would stop being worth waiting for.
  // ================================================
  const OUTCOMES = [
    { id: "rain-light", weight: 24 },
    { id: "rain-heavy", weight: 16 },
    { id: "lightning",  weight: 22 },
    { id: "drizzle",    weight: 20 },
    { id: "rainbow",    weight: 12 },
    { id: "fairy",      weight: 8 }
  ];
  const TOTAL_WEIGHT = OUTCOMES.reduce((n, o) => n + o.weight, 0);

  function rollOutcome() {
    let n = Math.random() * TOTAL_WEIGHT;
    for (const o of OUTCOMES) {
      n -= o.weight;
      if (n <= 0) return o.id;
    }
    return OUTCOMES[0].id;
  }

  // Effects render into their own layer, NOT the decoration layer:
  // decorations sit at z-index -1 (behind the app, which is right for
  // ambient background art), but a lightning flash or a fairy that the
  // user just summoned by clicking has to be visible over the cards or
  // the interaction reads as broken. Below core/hud.js's bolt layer
  // (z-index 70) so XP feedback still wins.
  function fxLayer() {
    let el = document.getElementById("decor-fx");
    if (!el) {
      el = document.createElement("div");
      el.id = "decor-fx";
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
    }
    return el;
  }

  // Effects are spawned at the cloud's CURRENT screen position and then
  // left behind — the cloud keeps drifting out from over its own rain,
  // which is what actually happens and costs nothing to allow.
  function spawn(node, ms) {
    fxLayer().appendChild(node);
    setTimeout(() => node.remove(), ms);
    return node;
  }

  function rainAt(rect, drops, cls, ms) {
    const wrap = document.createElement("div");
    wrap.className = `fx-rain ${cls}`;
    wrap.style.left = `${rect.left}px`;
    wrap.style.top = `${rect.bottom - 10}px`;
    wrap.style.width = `${rect.width}px`;
    for (let i = 0; i < drops; i++) {
      const d = document.createElement("span");
      d.style.left = `${Math.random() * 100}%`;
      d.style.animationDelay = `${Math.random() * 0.9}s`;
      d.style.setProperty("--fall", `${60 + Math.random() * 90}px`);
      wrap.appendChild(d);
    }
    spawn(wrap, ms);
  }

  function lightningAt(rect) {
    const flash = document.createElement("div");
    flash.className = "fx-flash";
    spawn(flash, 700);

    const bolt = document.createElement("div");
    bolt.className = "fx-bolt";
    bolt.style.left = `${rect.left + rect.width * 0.45}px`;
    bolt.style.top = `${rect.bottom - 12}px`;
    bolt.innerHTML = `<svg viewBox="0 0 24 60"><path d="M14 0 L4 32 L11 32 L8 60 L20 24 L13 24 Z"/></svg>`;
    spawn(bolt, 700);
  }

  // Concentric radial-gradient rings, not stroked SVG arcs. The first
  // attempt drew six hard saturated strokes and read as a croquet hoop
  // — a real rainbow is a continuous spectrum with soft edges that
  // washes out toward the horizon, so the bands BLEND (an earlier note
  // here claiming they must stay distinct was simply wrong) and the
  // whole thing is faint. The band stops, blur and end-fade all live in
  // CSS; this only places it.
  function rainbowAt(rect) {
    const bow = document.createElement("div");
    bow.className = "fx-rainbow";
    bow.style.left = `${rect.left + rect.width * 0.5}px`;
    bow.style.top = `${rect.bottom - 4}px`;
    bow.innerHTML = `<span class="bow"></span>`;
    spawn(bow, 5200);
  }

  // ---- Bottom clouds get their own outcomes ----
  // Weather falling out of a cloud that sits BELOW the content reads
  // backwards (rain going down from there lands off-screen). So low
  // clouds do something else entirely: something leaps out and drops
  // back in, or an object spins straight through.
  function isBottomCloud(el) {
    const r = el.getBoundingClientRect();
    return (r.top + r.height / 2) > window.innerHeight * 0.5;
  }

  // What comes out of a low cloud: the app is a study app, so it rains
  // stationery rather than novelty items.
  //
  // Country-flag emoji are the ONLY class that failed on Windows (the OS
  // ships no glyph for regional-indicator pairs) — ordinary object emoji
  // like these are fine, so this is safe where 🇺🇦 was not. Kept to
  // widely-shipped single-codepoint emoji all the same: no ZWJ sequences
  // (👩‍🏫 splits into two glyphs where the sequence isn't supported) and
  // nothing newer than Emoji 12.
  const STUDY_EMOJI = [
    "📚", "📖", "📝", "✏️", "✒️", "🖊️", "🖍️", "📐", "📏", "📌", "📎", "🖇️",
    "🔖", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📜", "📋", "🗒️", "🗓️",
    "📅", "🗂️", "📁", "📊", "📈", "📉", "🔢", "🧮", "🎓", "🏫", "🧠", "💡",
    "🔬", "🔭", "🧪", "⚗️", "🔍", "💻", "⌨️", "🖥️", "⌛", "⏳", "⏰", "☕",
    "🍎", "🧩", "🏆", "🥇", "🎯", "✅", "❓", "❗", "⭐", "🚀", "💯", "🤓"
  ];
  const pickEmoji = () => STUDY_EMOJI[Math.floor(Math.random() * STUDY_EMOJI.length)];

  function bounceAt(rect) {
    const el = document.createElement("div");
    el.className = "fx-bounce";
    el.style.left = `${rect.left + rect.width * (0.3 + Math.random() * 0.4)}px`;
    el.style.top = `${rect.top + rect.height * 0.35}px`;
    el.innerHTML = `<span class="bo-emoji">${pickEmoji()}</span>`;
    spawn(el, 1700);
  }

  // Two props, picked at random: a hammer, and the flipped-U arch. Both
  // drawn rather than emoji — the country-flag lesson (Windows ships no
  // glyph for plenty of things) applies to any decorative character.
  function flythroughAt(rect) {
    const el = document.createElement("div");
    el.className = "fx-fly";
    el.style.top = `${rect.top + rect.height * 0.45}px`;
    const fromLeft = Math.random() < 0.5;
    el.classList.add(fromLeft ? "from-left" : "from-right");
    el.style.left = fromLeft ? `${rect.left - 90}px` : `${rect.right + 90}px`;
    // Mostly study emoji; the two drawn props (hammer, flipped-U arch)
    // stay in the rotation as the occasional odd one out.
    const roll = Math.random();
    el.innerHTML = roll < 0.72
      ? `<span class="fx-prop fx-prop-emoji">${pickEmoji()}</span>`
      : roll < 0.86
        ? `<svg viewBox="0 0 40 40" class="fx-prop">
             <rect class="pr-dark" x="18" y="12" width="4" height="24" rx="1.6"/>
             <rect class="pr-head" x="9" y="5" width="22" height="9" rx="2.4"/>
           </svg>`
        : `<svg viewBox="0 0 40 40" class="fx-prop">
             <path class="pr-head" d="M8 34 L8 20 A 12 12 0 0 1 32 20 L32 34 L25 34 L25 20 A 5 5 0 0 0 15 20 L15 34 Z"/>
           </svg>`;
    spawn(el, 1500);
  }

  // ---- Eagles ----
  // Clicking one startles it: a feather comes loose and the bird bolts.
  // The real element keeps running its own loop invisibly and reappears
  // on its next pass, so the flight timing is never left out of sync.
  function featherFrom(rect) {
    const f = document.createElement("div");
    f.className = "fx-feather";
    f.style.left = `${rect.left + rect.width * 0.5}px`;
    f.style.top = `${rect.top + rect.height * 0.6}px`;
    f.innerHTML =
      `<svg viewBox="0 0 20 44">
         <path class="fe-vane" d="M10 1 Q 1 15, 5 29 Q 7.5 38, 10 43 Q 12.5 38, 15 29 Q 19 15, 10 1 Z"/>
         <path class="fe-quill" d="M10 5 L 10 42" stroke-width="1" fill="none"/>
       </svg>`;
    spawn(f, 3400);
  }

  function pokeEagle(el) {
    if (el.dataset.busy) return;
    el.dataset.busy = "1";
    const rect = el.getBoundingClientRect();
    featherFrom(rect);
    if (Dojo.sfx && Dojo.sfx.click) Dojo.sfx.click();

    // A clone does the bolting. Re-timing the real element's animation
    // mid-flight would fight the keyframes that own its transform.
    //
    // The clone is stripped down to ONE class on purpose. Keeping
    // `.decor-usa_eagles.eagle-2` meant that rule's animation-duration
    // (23s) and animation-delay (-9s) longhands beat the shorthand in
    // `.fx-eagle-rush` on specificity, so eagle-2 started its 1.5s bolt
    // already 9s in and simply vanished — "some tp, some natural",
    // exactly as reported, since eagle-1 has no such override.
    // `.fx-eagle-rush` carries its own complete styling instead.
    const ghost = el.cloneNode(true);
    ghost.setAttribute("class", "fx-eagle-rush");
    ghost.style.cssText =
      `left:${rect.left}px; top:${rect.top}px; width:${rect.width}px; height:${rect.height}px;`;
    // Bolt away from the nearer edge, so it always exits the short way.
    const leftward = rect.left < window.innerWidth / 2;
    ghost.style.setProperty("--rush", leftward ? "-52vw" : "52vw");
    ghost.style.setProperty("--bank", leftward ? "10deg" : "-10deg");
    spawn(ghost, 1500);

    // The real bird restarts from the BEGINNING of its path (off-screen)
    // rather than resuming wherever its loop had got to — resuming is
    // the other way a startled bird appeared to teleport, popping back
    // into view mid-screen a moment after it fled. The inline delay
    // overrides the negative stagger the CSS gives each bird.
    el.style.visibility = "hidden";
    setTimeout(() => {
      el.style.visibility = "";
      el.style.animation = "none";
      void el.offsetWidth;                 // reflow, so the restart takes
      el.style.animation = "";
      el.style.animationDelay = "0s";
      delete el.dataset.busy;
    }, 1600);
  }

  // ---- Sun ----
  // Spin it like a fan and it puts out more heat. Two full turns, then
  // it settles back to its idle drift.
  function pokeSun(el) {
    if (el.dataset.busy) return;
    el.dataset.busy = "1";
    el.classList.add("sun-spun");
    setTimeout(() => { el.classList.remove("sun-spun"); delete el.dataset.busy; }, 1500);
    if (Dojo.sfx && Dojo.sfx.click) Dojo.sfx.click();

    const rect = el.getBoundingClientRect();
    const heat = document.createElement("div");
    heat.className = "fx-heat";
    const size = rect.width * 1.15;
    heat.style.left = `${rect.left + rect.width / 2 - size / 2}px`;
    heat.style.top = `${rect.top + rect.height / 2 - size / 2}px`;
    heat.style.width = `${size}px`;
    heat.style.height = `${size}px`;
    spawn(heat, 1500);
  }

  function sunAt(x, y) {
    const sun = document.querySelector(".decor-sun");
    if (!sun || getComputedStyle(sun).display === "none") return null;
    const r = sun.getBoundingClientRect();
    return (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) ? sun : null;
  }

  function eagleAt(x, y) {
    for (const e of document.querySelectorAll(".decor-usa_eagles")) {
      if (getComputedStyle(e).display === "none" || e.style.visibility === "hidden") continue;
      const r = e.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return e;
    }
    return null;
  }

  // The cloud itself fades out, the fairy is what was hiding in it, and
  // the cloud fades back once she's gone.
  function fairyFrom(cloud, rect) {
    cloud.classList.add("cloud-fading");
    setTimeout(() => cloud.classList.remove("cloud-fading"), 2600);

    const fairy = document.createElement("div");
    fairy.className = "fx-fairy";
    fairy.style.left = `${rect.left + rect.width * 0.5}px`;
    fairy.style.top = `${rect.top + rect.height * 0.5}px`;
    fairy.innerHTML = `<span class="fairy-glow"></span><span class="fairy-body">✦</span>`;
    spawn(fairy, 2600);
  }

  function poke(cloud) {
    if (cloud.dataset.busy) return;          // one effect per cloud at a time
    cloud.dataset.busy = "1";
    setTimeout(() => delete cloud.dataset.busy, 1400);

    const rect = cloud.getBoundingClientRect();
    cloud.classList.add("cloud-poked");
    setTimeout(() => cloud.classList.remove("cloud-poked"), 600);
    if (Dojo.sfx && Dojo.sfx.click) Dojo.sfx.click();

    // Low clouds skip the weather table entirely — see isBottomCloud.
    if (isBottomCloud(cloud)) {
      if (Math.random() < 0.5) bounceAt(rect); else flythroughAt(rect);
      return;
    }

    switch (rollOutcome()) {
      case "drizzle":    rainAt(rect, 8,  "light", 2600); break;
      case "rain-light": rainAt(rect, 22, "light", 3000); break;
      case "rain-heavy": rainAt(rect, 55, "heavy", 3400); break;
      case "lightning":  lightningAt(rect); break;
      case "rainbow":    rainbowAt(rect); break;
      case "fairy":      fairyFrom(cloud, rect); break;
    }
  }

  // Bound once against the layer rather than per-cloud: the cloud
  // elements are static markup in index.html, but delegating means a
  // future cloud added there needs no wiring here.
  // Anything the app itself might want the click for. If a click lands
  // on one of these, the cloud never hears about it.
  const INTERACTIVE = 'button, a, input, select, textarea, label, summary,' +
    ' [role="button"], [tabindex], [data-slot-nav], [contenteditable="true"]';

  // Clouds are pointer-events:none (see styles/base.css), so they can't
  // intercept anything. Instead we take clicks that hit no control at
  // all — dead background — and only then ask whether one landed on a
  // cloud. Hit-tested by rect rather than by the browser, precisely so
  // that a cloud drifting over a menu can never steal that menu's tap.
  //
  // The rect is the cloud's bounding box, which is a bit larger than the
  // drawn shape. Forgiving in the harmless direction: the cost is a poke
  // that lands slightly off the visible cloud, on a spot where clicking
  // did nothing anyway.
  function cloudAt(x, y) {
    const clouds = document.querySelectorAll(".decor-clouds");
    for (const c of clouds) {
      if (getComputedStyle(c).display === "none") continue;
      const r = c.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return c;
    }
    return null;
  }

  function initClouds() {
    if (document.body.dataset.cloudsBound) return;
    document.body.dataset.cloudsBound = "1";
    document.addEventListener("click", e => {
      if (e.target.closest && e.target.closest(INTERACTIVE)) return;
      // Birds first: they're small and often drawn over a cloud, so the
      // cloud would otherwise swallow every attempt to hit one.
      const bird = eagleAt(e.clientX, e.clientY);
      if (bird) { pokeEagle(bird); return; }
      const sun = sunAt(e.clientX, e.clientY);
      if (sun) { pokeSun(sun); return; }
      const cloud = cloudAt(e.clientX, e.clientY);
      if (cloud) poke(cloud);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initClouds);
  } else {
    initClouds();
  }

  Object.assign(Dojo, { BG_DECORS, SCENES, decorFace, pokeCloud: poke });
})();
