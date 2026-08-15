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
      desc: "A cratered moon, top-right, with a soft halo." }
  ];

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
  // Delegated from the document, not a layer: the clouds moved into
  // #bg-decor-front (above the app, so clicks reach them at all) while
  // the rest of the decorations stayed in #bg-decor-layer, and binding
  // to one specific layer meant silently binding to the wrong one.
  function initClouds() {
    if (document.body.dataset.cloudsBound) return;
    document.body.dataset.cloudsBound = "1";
    document.addEventListener("click", e => {
      const cloud = e.target.closest && e.target.closest(".decor-clouds");
      if (cloud) poke(cloud);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initClouds);
  } else {
    initClouds();
  }

  Object.assign(Dojo, { BG_DECORS, SCENES, pokeCloud: poke });
})();
