// ================================================
// Knell — SHOP / lobby decorations + scenery
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
    { id: "usa_stars", name: { en: "Stars", ru: "Звёзды", he: "כוכבים" }, price: 0, icon: "⭐",
      desc: "A drifting field of stars, top-left corner." },
    { id: "usa_eagles", name: { en: "Eagles", ru: "Орлы", he: "נשרים" }, price: 0, icon: "🦅",
      desc: "Two eagles crossing the lobby, wings beating." },
    { id: "clouds", name: { en: "Clouds", ru: "Облака", he: "עננים" }, price: 0, icon: "☁️",
      desc: "Slow clouds at three depths — and you can poke them." },
    { id: "moon", name: { en: "Moon", ru: "Луна", he: "ירח" }, price: 0, icon: "🌙",
      desc: "A cratered moon, top-right, with a soft halo.",
      // One decoration with two faces — see the data-theme-mode split in
      // styles/base.css. The LABEL has to follow the sky, or Custom says
      // "Moon" while a sun is plainly visible behind it.
      lightName: { en: "Sun", ru: "Солнце", he: "שמש" }, lightIcon: "☀️",
      lightDesc: "A sun, top-right, with a slow halo and turning rays." }
  ];

  // What to CALL a decoration right now. Only the moon/sun differs, but
  // it's a lookup rather than a special case at each call site so the
  // next two-faced piece needs no new plumbing.
  function decorFace(d) {
    const light = document.documentElement.dataset.sky === "day";
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
    { id: "jungle",  name: { en: "Jungle", ru: "Джунгли", he: "ג'ונגל" },  price: 0,   icon: "🌴", desc: "Dense canopy and hanging vines." },
    { id: "river",   name: { en: "River", ru: "Река", he: "נהר" },   price: 0, icon: "🏞️", desc: "Still water with a far bank." },
    { id: "island",  name: { en: "Island", ru: "Остров", he: "אי" },  price: 0, icon: "🏝️", desc: "A lone palm on a sandbar." }
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

  // Effects TRACK the thing that produced them. They used to be spawned
  // at the cloud's position and left behind, so the cloud drifted out
  // from over its own rain — defended at the time as "what actually
  // happens", which was a rationalisation: it reads as the effect being
  // detached, because it is.
  //
  // Followed by rewriting left/top each frame rather than by applying a
  // transform: every effect already uses `transform` for its OWN
  // animation (rain drops fall, the rainbow scales, props spin), so a
  // transform here would fight them. Nothing animates left/top, so
  // that channel is free.
  // With "reduce motion" set in the system, the effects are not drawn at
  // all: the sky still answers, by sound (core/sfx.js), and nothing flies
  // across the screen (2026-11-24; this file never checked it before).
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const skySound = kind => { if (Dojo.sfx && Dojo.sfx.sky) Dojo.sfx.sky(kind); };

  function spawn(node, ms, anchor) {
    if (reduceMotion()) return node;
    fxLayer().appendChild(node);
    let raf = null;
    if (anchor) {
      const start = anchor.getBoundingClientRect();
      const l0 = parseFloat(node.style.left) || 0;
      const t0 = parseFloat(node.style.top) || 0;
      const follow = () => {
        const r = anchor.getBoundingClientRect();
        node.style.left = `${l0 + (r.left - start.left)}px`;
        node.style.top = `${t0 + (r.top - start.top)}px`;
        raf = requestAnimationFrame(follow);
      };
      raf = requestAnimationFrame(follow);
    }
    setTimeout(() => {
      if (raf) cancelAnimationFrame(raf);
      node.remove();
    }, ms);
    return node;
  }

  function rainAt(rect, drops, cls, ms, anchor) {
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
    spawn(wrap, ms, anchor);
  }

  function lightningAt(rect, anchor) {
    const flash = document.createElement("div");
    flash.className = "fx-flash";
    spawn(flash, 700);

    const bolt = document.createElement("div");
    bolt.className = "fx-bolt";
    bolt.style.left = `${rect.left + rect.width * 0.45}px`;
    bolt.style.top = `${rect.bottom - 12}px`;
    bolt.innerHTML = `<svg viewBox="0 0 24 60"><path d="M14 0 L4 32 L11 32 L8 60 L20 24 L13 24 Z"/></svg>`;
    spawn(bolt, 700, anchor);
  }

  // Concentric radial-gradient rings, not stroked SVG arcs. The first
  // attempt drew six hard saturated strokes and read as a croquet hoop
  // — a real rainbow is a continuous spectrum with soft edges that
  // washes out toward the horizon, so the bands BLEND (an earlier note
  // here claiming they must stay distinct was simply wrong) and the
  // whole thing is faint. The band stops, blur and end-fade all live in
  // CSS; this only places it.
  function rainbowAt(rect, anchor) {
    const bow = document.createElement("div");
    bow.className = "fx-rainbow";
    bow.style.left = `${rect.left + rect.width * 0.5}px`;
    bow.style.top = `${rect.bottom - 4}px`;
    bow.innerHTML = `<span class="bow"></span>`;
    spawn(bow, 5200, anchor);
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

  function bounceAt(rect, anchor) {
    const el = document.createElement("div");
    el.className = "fx-bounce";
    el.style.left = `${rect.left + rect.width * (0.3 + Math.random() * 0.4)}px`;
    el.style.top = `${rect.top + rect.height * 0.35}px`;
    el.innerHTML = `<span class="bo-emoji">${pickEmoji()}</span>`;
    spawn(el, 1700, anchor);
  }

  // Two props, picked at random: a hammer, and the flipped-U arch. Both
  // drawn rather than emoji — the country-flag lesson (Windows ships no
  // glyph for plenty of things) applies to any decorative character.
  function flythroughAt(rect, anchor) {
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
    spawn(el, 1500, anchor);
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

  // An arrow, loosed from below. Most of the time it misses.
  //
  // ---- Why 75% miss ----
  // The old interaction always did the same thing: feather, bolt, done.
  // Predictable is the enemy of a poke-toy — once you have seen it, the
  // second click is worth nothing. A mostly-miss roll means the hit is
  // an event, and the kill is rarer still. The bird also has to survive
  // most encounters or the sky empties out and the decoration stops
  // decorating.
  //
  //   miss    75%  arrow sails past, bird bolts, usually unscathed
  //   stuck   17%  glancing hit; it flies on with the arrow in it
  //   downed   8%  struck properly; it tumbles out of the sky
  // Named apart from the clouds' OUTCOMES/rollOutcome, which sit in this
  // same IIFE scope and roll weather.
  const SHOT_OUTCOMES = [
    { kind: "miss",   weight: 75 },
    { kind: "stuck",  weight: 17 },
    { kind: "downed", weight: 8 }
  ];
  function rollShot() {
    let r = Math.random() * SHOT_OUTCOMES.reduce((n, o) => n + o.weight, 0);
    for (const o of SHOT_OUTCOMES) { if ((r -= o.weight) < 0) return o.kind; }
    return "miss";
  }

  // ---- Feathers, rethought ----
  // They used to drop on every single click, which made them meaningless
  // — a feather stopped reading as "something happened to the bird" and
  // became just part of the click. Now the count tracks what actually
  // occurred, so seeing feathers TELLS you the outcome before the bird
  // finishes reacting:
  //   miss   -> usually nothing; a quarter of the time one shaken loose
  //             by the near miss and the panic
  //   stuck  -> one or two, from the impact
  //   downed -> three, and the bird follows them down
  function feathersFor(kind) {
    if (kind === "downed") return 3;
    if (kind === "stuck")  return 1 + (Math.random() < 0.5 ? 1 : 0);
    return Math.random() < 0.25 ? 1 : 0;
  }

  // The arrow itself. Flies up from the lower edge toward the bird,
  // rotated along its own trajectory so it never looks like it is
  // travelling sideways.
  function arrowTo(rect, kind) {
    const tx = rect.left + rect.width * 0.5;
    const ty = rect.top + rect.height * 0.5;
    // Loosed from below, from the same side of the screen the bird is on
    // — a shot crossing the whole width reads as a stray, not an aim.
    const sx = tx + (Math.random() * 120 - 60);
    const sy = window.innerHeight + 40;
    const angle = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI + 90;

    const a = document.createElement("div");
    a.className = "fx-arrow";
    a.style.left = `${sx}px`;
    a.style.top = `${sy}px`;
    // Distance along the flight path. The keyframe translates on -Y
    // AFTER rotating by --rot, so "forward" is always the arrow's own
    // nose and one keyframe serves every angle — which is why this is
    // the hypotenuse and not the x/y components.
    const dist = Math.hypot(tx - sx, ty - sy);
    a.style.setProperty("--travel", `${dist}px`);
    a.style.setProperty("--rot", `${angle}deg`);
    // A miss keeps going past the bird instead of stopping in mid-air,
    // which is the tell that separates "missed" from "vanished".
    a.classList.add(kind === "miss" ? "miss" : "hit");
    a.innerHTML =
      `<svg viewBox="0 0 8 40">
         <path class="ar-shaft" d="M4 6 L 4 34" />
         <path class="ar-head"  d="M4 0 L 7.2 8 L 0.8 8 Z" />
         <path class="ar-fletch" d="M4 30 L 7.5 38 L 4 36 L 0.5 38 Z" />
       </svg>`;
    // A hit is removed as soon as its flight ends (the .fx-arrow-stuck
    // copy on the bird takes over); a miss lives long enough to clear
    // the screen.
    return spawn(a, kind === "miss" ? 900 : 360);
  }

  function pokeEagle(el) {
    if (el.dataset.busy) return;
    el.dataset.busy = "1";
    const rect = el.getBoundingClientRect();
    const kind = rollShot();

    arrowTo(rect, kind);
    skySound("bow");
    setTimeout(() => skySound(kind === "miss" ? "miss" : "hit"), 360);

    // Feathers wait for the arrow to actually arrive — bursting them at
    // click time gave away the outcome before the shot landed.
    const nFeathers = feathersFor(kind);
    setTimeout(() => {
      for (let i = 0; i < nFeathers; i++) {
        setTimeout(() => featherFrom(rect), i * 140);
      }
    }, 320);

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
    ghost.style.cssText =
      `left:${rect.left}px; top:${rect.top}px; width:${rect.width}px; height:${rect.height}px;`;
    // Bolt away from the nearer edge, so it always exits the short way.
    const leftward = rect.left < window.innerWidth / 2;
    ghost.style.setProperty("--rush", leftward ? "-52vw" : "52vw");
    ghost.style.setProperty("--bank", leftward ? "10deg" : "-10deg");

    // One class, complete styling, per outcome — see the note above about
    // specificity: keeping the original .decor-usa_eagles classes let the
    // per-bird animation longhands beat these shorthands.
    let ghostMs;
    if (kind === "downed") {
      ghost.setAttribute("class", "fx-eagle-fall");
      ghostMs = 2200;
    } else if (kind === "stuck") {
      ghost.setAttribute("class", "fx-eagle-rush hit");
      // The arrow rides along, planted in it. Appended to the ghost so it
      // inherits every transform the flight applies, rather than being
      // animated separately and drifting out of register.
      const stuck = document.createElement("div");
      stuck.className = "fx-arrow-stuck";
      stuck.innerHTML =
        `<svg viewBox="0 0 8 40">
           <path class="ar-shaft" d="M4 6 L 4 34" />
           <path class="ar-head"  d="M4 0 L 7.2 8 L 0.8 8 Z" />
           <path class="ar-fletch" d="M4 30 L 7.5 38 L 4 36 L 0.5 38 Z" />
         </svg>`;
      ghost.appendChild(stuck);
      ghostMs = 1800;
    } else {
      ghost.setAttribute("class", "fx-eagle-rush");
      ghostMs = 1500;
    }
    spawn(ghost, ghostMs);

    // The real bird restarts from the BEGINNING of its path (off-screen)
    // rather than resuming wherever its loop had got to — resuming is
    // the other way a startled bird appeared to teleport, popping back
    // into view mid-screen a moment after it fled. The inline delay
    // overrides the negative stagger the CSS gives each bird.
    // A bird that was shot down should not reappear a second later as if
    // nothing happened. It stays out of the sky longer, then returns from
    // the start of its path like the others — the decoration has to come
    // back eventually, or repeated play empties the screen permanently.
    el.style.visibility = "hidden";
    setTimeout(() => {
      el.style.visibility = "";
      el.style.animation = "none";
      void el.offsetWidth;                 // reflow, so the restart takes
      el.style.animation = "";
      el.style.animationDelay = "0s";
      delete el.dataset.busy;
    }, kind === "downed" ? 6000 : 1600);
  }

  // ---- Sun ----
  // Spin it like a fan and it puts out more heat. Two full turns, then
  // it settles back to its idle drift.
  function pokeSun(el) {
    if (el.dataset.busy) return;
    el.dataset.busy = "1";
    el.classList.add("sun-spun");
    setTimeout(() => { el.classList.remove("sun-spun"); delete el.dataset.busy; }, 1500);
    skySound("sun");

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

  // ---- Moon ----
  // Poke it and a colony scatters out from behind it. Mostly ordinary
  // bats; one in the pack is the Batman emblem, as asked — rare enough
  // that spotting it is the joke rather than the default.
  const BAT_REAL = `<svg viewBox="0 0 44 22">
      <path d="M22 7 Q 18.5 3.5, 15 5.5 Q 11 1.5, 5 3.5 Q 8 7, 6 11.5
               Q 10.5 9.5, 14 12.5 Q 18 10.5, 22 14 Q 26 10.5, 30 12.5
               Q 33.5 9.5, 38 11.5 Q 36 7, 39 3.5 Q 33 1.5, 29 5.5
               Q 25.5 3.5, 22 7 Z"/>
      <path d="M20 6.4 L19.2 2.8 L21.4 5.2 Z"/>
      <path d="M24 6.4 L24.8 2.8 L22.6 5.2 Z"/>
    </svg>`;
  const BAT_LOGO = `<svg viewBox="0 0 60 22">
      <path d="M30 3 L33 8.5 Q 39.5 4.5, 46 6.5 Q 43.5 10.5, 47.5 14
               Q 39 12.5, 33 16.5 L30 20.5 L27 16.5 Q 21 12.5, 12.5 14
               Q 16.5 10.5, 14 6.5 Q 20.5 4.5, 27 8.5 Z"/>
    </svg>`;

  // Bats come from BEHIND the moon, so they cannot live in the fx layer
  // like every other effect: that sits above the app and would paint
  // them ON TOP of the moon, which reads as them erupting out of it.
  // They go into the decoration layer instead, inserted BEFORE the moon
  // in DOM order — same stacking context, so the moon's disc covers them
  // until they clear its edge. Start at the moon's centre and they are
  // simply invisible until they emerge, which is the whole effect.
  function spawnBehindMoon(node, ms, moonEl) {
    const layer = moonEl.parentNode;
    if (!layer) return node;
    layer.insertBefore(node, moonEl);
    setTimeout(() => node.remove(), ms);
    return node;
  }

  function pokeMoon(el) {
    if (el.dataset.busy) return;
    el.dataset.busy = "1";
    setTimeout(() => delete el.dataset.busy, 1800);
    skySound("moon");

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const n = 7;
    // One logo per colony, at a random position in the pack.
    const logoAt = Math.floor(Math.random() * n);
    // ONE heading for the whole swarm, re-rolled on every poke — the
    // pack holds together (that's the point of a pack) but never leaves
    // in the same direction twice.
    const heading = Math.random() * 360;

    for (let i = 0; i < n; i++) {
      const bat = document.createElement("div");
      const isLogo = i === logoAt;
      bat.className = `fx-bat${isLogo ? " fx-bat-logo" : ""}`;
      bat.innerHTML = isLogo ? BAT_LOGO : BAT_REAL;

      // A PACK, not a starburst. They used to fan across 300°, which
      // read as an explosion — bats leaving a roost travel together.
      // Everyone follows the swarm's heading with a narrow ±20°
      // deviation, so the group stays legible as one flock while no two
      // paths overlap exactly.
      const spread = heading + (Math.random() * 40 - 20);
      const dist = 300 + Math.random() * 120;
      const rad = spread * Math.PI / 180;
      const size = isLogo ? 50 : 26 + Math.random() * 12;

      bat.style.left = `${cx - size / 2}px`;
      bat.style.top = `${cy - size / 4}px`;
      bat.style.width = `${size}px`;
      bat.style.setProperty("--bx", `${Math.cos(rad) * dist}px`);
      // Small vertical jitter rather than one shared arc: a flock has
      // depth, and identical paths read as a copy-paste.
      bat.style.setProperty("--by", `${Math.sin(rad) * dist - 20 - Math.random() * 50}px`);
      // Staggered so they string out of the roost instead of leaving in
      // one rank, which is the other half of reading as a pack.
      bat.style.animationDelay = `${i * 0.07 + Math.random() * 0.08}s`;
      bat.style.animationDuration = `${1.7 + Math.random() * 0.5}s`;
      const flap = bat.querySelector("svg");
      if (flap) flap.style.animationDuration = `${0.16 + Math.random() * 0.12}s`;
      spawnBehindMoon(bat, 2600, el);
    }
  }

  function moonAt(x, y) {
    const moon = document.querySelector(".decor-moon");
    if (!moon || getComputedStyle(moon).display === "none") return null;
    const r = moon.getBoundingClientRect();
    return (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) ? moon : null;
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

    // Low clouds skip the weather table entirely — see isBottomCloud.
    if (isBottomCloud(cloud)) {
      if (Math.random() < 0.5) { bounceAt(rect, cloud); skySound("bounce"); }
      else { flythroughAt(rect, cloud); skySound("whoosh"); }
      return;
    }

    switch (rollOutcome()) {
      case "drizzle":    rainAt(rect, 8,  "light", 2600, cloud); skySound("drizzle"); break;
      case "rain-light": rainAt(rect, 22, "light", 3000, cloud); skySound("rain"); break;
      case "rain-heavy": rainAt(rect, 55, "heavy", 3400, cloud); skySound("storm"); break;
      case "lightning":  lightningAt(rect, cloud); skySound("thunder"); break;
      case "rainbow":    rainbowAt(rect, cloud); skySound("rainbow"); break;
      case "fairy":      fairyFrom(cloud, rect); skySound("fairy"); break;
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

  // Whether something is drawn here, over the sky. The sky is the page's
  // backdrop, so where a shape, a picture, a line of text or a filled
  // panel sits on top of it, the cloud or bird behind can't be seen, and
  // aiming or poking "through" it read as a glitch: on the start screen
  // the reticle blinked on and off over the garden as clouds drifted
  // behind it (2026-11-23, «sniping coursos on pre screen is glitchy»).
  // Open sky inside a scene's frame still counts as sky: there the
  // pointer is on the <svg> itself, not on one of its shapes.
  function coversSky(el) {
    if (!el || el === document.documentElement || el === document.body) return false;
    if (el instanceof SVGElement) return el.tagName.toLowerCase() !== "svg";
    if (/^(IMG|CANVAS|VIDEO)$/.test(el.tagName)) return true;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) return true;
    const cs = getComputedStyle(el);
    if (cs.backgroundImage !== "none") return true;
    const alpha = cs.backgroundColor.match(/^rgba\(.*,\s*([\d.]+)\)$/);
    return cs.backgroundColor !== "transparent" && !(alpha && parseFloat(alpha[1]) === 0);
  }

  function initClouds() {
    if (document.body.dataset.cloudsBound) return;
    document.body.dataset.cloudsBound = "1";
    document.addEventListener("click", e => {
      if (e.target.closest && e.target.closest(INTERACTIVE)) return;
      // Birds first: they're small and often drawn over a cloud, so the
      // cloud would otherwise swallow every attempt to hit one. None of
      // them through something drawn on top (coversSky).
      if (!coversSky(e.target)) {
        const balloon = balloonAt(e.clientX, e.clientY);
        if (balloon) { popBalloon(balloon); return; }
        const bird = eagleAt(e.clientX, e.clientY);
        if (bird) { pokeEagle(bird); return; }
        const sun = sunAt(e.clientX, e.clientY);
        if (sun) { pokeSun(sun); return; }
        const moon = moonAt(e.clientX, e.clientY);
        if (moon) { pokeMoon(moon); return; }
        const cloud = cloudAt(e.clientX, e.clientY);
        if (cloud) { poke(cloud); return; }
      }
      // Hit nothing at all: no control, no bird, no sun, moon or cloud.
      // Announced rather than handled, because what a miss should mean
      // belongs to the screen it happened on — the lobby uses it to show
      // what IS clickable (core/lobby.js).
      if (Dojo.Bus) Dojo.Bus.emit("click:dead", { x: e.clientX, y: e.clientY });
    });

    // ---- Aim -------------------------------------------------------------
    // The mouse is a scope (decided 2026-11-22: «курсор на прицел», over a
    // glow around clouds and birds). Poking a bird already looses an
    // arrow at it, so a scope is the honest picture of what a click does.
    //
    // Two reticles. In the lobby a faint one covers the whole surface
    // («make it work across all the surface»). Over something a click
    // will actually hit (a bird, the sun, the moon, a cloud, or the
    // lobby's wheel, which takes darts) it locks on: brighter, in the
    // theme's accent, with a dot. Off the lobby only the lock-on shows,
    // so reading screens keep their own cursors.
    //
    // It asks the same questions as the click above, in the same order,
    // never shows over a control, and never locks on to sky that
    // something drawn is hiding (coversSky). CSS :hover can't do this: the sky
    // layers are pointer-events:none on purpose, so they are never the
    // thing under the pointer. Nothing shows on the study screens, where
    // the sky is hidden but its pieces still sit at their old positions.
    //
    // Mouse only. Touch has no hover, and a missed tap can still light
    // the lobby's controls (core/lobby.js). At most one test per frame,
    // however fast the mouse reports.
    let aimX = 0, aimY = 0, aimOver = null, aimQueued = false, aimMode = "";
    const root = document.documentElement;
    const inLobby = () => {
      const l = document.getElementById("lobby");
      return !!(l && l.classList.contains("active"));
    };
    const aim = () => {
      aimQueued = false;
      let mode = "";
      const onControl = aimOver && aimOver.closest && aimOver.closest(INTERACTIVE);
      if (!onControl && !root.dataset.study) {
        // The wheel is outside the coversSky test: its own ring and the
        // dartboard behind it are drawn, and they are what takes the dart.
        const sky = !coversSky(aimOver) && (balloonAt(aimX, aimY) || eagleAt(aimX, aimY) || sunAt(aimX, aimY) ||
                    moonAt(aimX, aimY) || cloudAt(aimX, aimY));
        const target = sky || (Dojo.wheelAt && Dojo.wheelAt(aimX, aimY));
        mode = target ? "lock" : inLobby() ? "scope" : "";
      }
      if (mode === aimMode) return;
      aimMode = mode;
      if (mode) root.style.setProperty("--sky-aim", aimCursor(mode === "lock"));
      root.classList.toggle("sky-aim", !!mode);
    };
    document.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      aimX = e.clientX; aimY = e.clientY; aimOver = e.target;
      if (!aimQueued) { aimQueued = true; requestAnimationFrame(aim); }
    }, { passive: true });
  }

  // The reticles themselves, each with a dark edge so it reads on a night
  // sky and a day sky alike. The faint one is the theme's dim text
  // colour; the lock-on is its accent, heavier, with a dot. CSS can't put
  // var() inside url(), so the whole cursor value is built here and
  // handed to base.css as --sky-aim, once per colour.
  const aimCache = {};
  function aimCursor(locked) {
    const css = getComputedStyle(document.documentElement);
    const c = css.getPropertyValue(locked ? "--accent" : "--text-dim").trim() ||
      (locked ? "#6366f1" : "#94a3b8");
    const key = (locked ? "lock:" : "scope:") + c;
    if (aimCache[key]) return aimCache[key];
    const marks = '<circle cx="16" cy="16" r="9"/><path d="M16 2v7M16 23v7M2 16h7M23 16h7"/>';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">' +
      '<g fill="none" stroke-linecap="round">' +
        `<g stroke="rgba(0,0,0,${locked ? 0.6 : 0.45})" stroke-width="${locked ? 3.6 : 2.8}">${marks}</g>` +
        `<g stroke="${c}" stroke-width="${locked ? 1.7 : 1.1}">${marks}</g>` +
      '</g>' +
      (locked ? `<circle cx="16" cy="16" r="1.7" fill="${c}"/>` : "") + '</svg>';
    aimCache[key] = `url("data:image/svg+xml,${encodeURIComponent(svg)}") 16 16, crosshair`;
    return aimCache[key];
  }

  // ---- Darts ---------------------------------------------------------------
  // In the lobby's Star layout the ring of tiles reads as a wheel, and a
  // click on it that hits no tile throws a dart («if pointed on wheel
  // throw a dart», 2026-11-22). The lobby decides that a miss landed on
  // the wheel (core/lobby.js, wheelAt); this only draws the throw.
  //
  // Thrown from below, like the arrows: it flies in along its own axis,
  // shrinking as it goes into the board, lands tip first a few pixels off
  // the aim point, quivers, and is pulled out after a few seconds. Three
  // at most stay in the board, a round of darts; a fourth takes the
  // oldest out. Each change in how many are in is announced
  // (darts:changed), and the lobby shows its dartboard while any are.
  const DART_SVG =
    `<svg viewBox="0 0 10 46">
       <path class="dt-tip" d="M5 0 L 5 10" />
       <rect class="dt-barrel" x="2.6" y="9" width="4.8" height="14" rx="2.2" />
       <path class="dt-grip" d="M2.8 13 H 7.2 M2.8 16 H 7.2 M2.8 19 H 7.2" />
       <path class="dt-shaft" d="M5 23 L 5 34" />
       <path class="dt-flight" d="M5 31 L 9.6 45 L 5 41.5 L 0.4 45 Z" />
     </svg>`;
  const darts = [];
  // The moment a dart lands (asked 2026-11-24, "add a vfx for darts"): a
  // ring punched out from the tip and a few splinters flying off it, timed
  // to the 0.3s the dart takes to arrive, so the hit is seen as well as
  // heard. spawn() leaves it out under reduced motion, like every effect.
  function dartHitAt(x, y) {
    const hit = document.createElement("div");
    hit.className = "fx-dart-hit";
    hit.style.left = `${x}px`;
    hit.style.top = `${y}px`;
    let html = '<span class="fx-dart-ring"></span>';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 360 + Math.random() * 30;
      const d = 14 + Math.random() * 14;
      html += `<span class="fx-dart-chip" style="--a:${a.toFixed(0)}deg;--d:${d.toFixed(0)}px"></span>`;
    }
    hit.innerHTML = html;
    spawn(hit, 700);
  }

  function dartAt(x, y) {
    const tx = x + (Math.random() * 14 - 7);
    const ty = y + (Math.random() * 14 - 7);
    const sx = tx + (Math.random() * 140 - 70);
    const sy = window.innerHeight + 60;
    const d = document.createElement("div");
    d.className = "fx-dart";
    d.style.left = `${tx}px`;
    d.style.top = `${ty}px`;
    d.style.setProperty("--rot", `${Math.atan2(ty - sy, tx - sx) * 180 / Math.PI + 90}deg`);
    d.style.setProperty("--travel", `${Math.hypot(tx - sx, ty - sy)}px`);
    d.innerHTML = `<div class="fx-dart-body">${DART_SVG}</div>`;
    spawn(d, 3200);
    skySound("dartThrow");
    darts.push(d);
    if (darts.length > 3) darts.shift().classList.add("pulled");
    const announce = () => Dojo.Bus && Dojo.Bus.emit("darts:changed", { count: darts.length });
    announce();
    setTimeout(() => {
      const i = darts.indexOf(d);
      if (i >= 0) { darts.splice(i, 1); announce(); }
    }, 3200);
    setTimeout(() => { skySound("dart"); dartHitAt(tx, ty); }, 300);
  }

  // ---- The balloon ----
  // Asked 2026-11-24 («a baloon that you can tap and cabin disappears and
  // from it sulte and firewoks fall (sfx vfx) i want it colorful and
  // nice»). Now and then a hot-air balloon drifts across the lobby, high
  // up and slow. Tapped, its basket lets go and vanishes, confetti pours
  // out of where it was, and fireworks go up around it; the envelope,
  // lighter by a basket, floats off upwards. It comes back a while later.
  // Lobby only, and never under reduced motion: it is a decoration.
  const FW_COLOURS = ["#ff4d6d", "#ffd166", "#06d6a0", "#4cc9f0", "#b388ff", "#ff9f1c", "#f72585", "#7bf1a8"];
  const BALLOON_SVG =
    '<svg viewBox="0 0 80 112" class="bal-svg">' +
    '<defs><clipPath id="bal-env"><path d="M40 4C18 4 6 22 6 40c0 18 14 30 24 44h20c10-14 24-26 24-44C74 22 62 4 40 4z"/></clipPath></defs>' +
    '<g class="bal-env" clip-path="url(#bal-env)">' +
      '<rect x="0" y="0" width="12" height="90" fill="#ff4d6d"/><rect x="12" y="0" width="12" height="90" fill="#ffd166"/>' +
      '<rect x="24" y="0" width="12" height="90" fill="#06d6a0"/><rect x="36" y="0" width="10" height="90" fill="#4cc9f0"/>' +
      '<rect x="46" y="0" width="12" height="90" fill="#b388ff"/><rect x="58" y="0" width="12" height="90" fill="#ff9f1c"/>' +
      '<rect x="70" y="0" width="12" height="90" fill="#f72585"/>' +
      '<ellipse cx="28" cy="26" rx="9" ry="16" fill="#fff" opacity="0.22"/>' +
    '</g>' +
    '<path d="M30 84h20l-3 6H33z" fill="#c9773a"/>' +
    '<g class="bal-basket">' +
      '<path d="M32 90L34 98M48 90L46 98" stroke="#8a6a4a" stroke-width="1"/>' +
      '<rect x="32" y="98" width="16" height="11" rx="2" fill="#a0683a"/>' +
      '<path d="M32 101h16M32 104h16" stroke="#7a4e2a" stroke-width="0.8"/>' +
    '</g></svg>';

  let balloonEl = null;
  function lobbyShown() {
    const l = document.getElementById("lobby");
    return !!(l && l.classList.contains("active")) && !document.hidden;
  }
  function launchBalloon() {
    if (balloonEl || reduceMotion() || !lobbyShown()) return;
    const b = document.createElement("div");
    b.className = "fx-balloon";
    b.style.top = `${8 + Math.random() * 18}vh`;
    const ltr = Math.random() < 0.5;
    b.style.setProperty("--from", ltr ? "-120px" : "calc(100vw + 40px)");
    b.style.setProperty("--to", ltr ? "calc(100vw + 40px)" : "-120px");
    b.innerHTML = `<div class="bal-bob">${BALLOON_SVG}</div>`;
    fxLayer().appendChild(b);
    balloonEl = b;
    b.addEventListener("animationend", e => {
      if (e.target === b) { b.remove(); if (balloonEl === b) balloonEl = null; }
    });
  }
  function scheduleBalloon(ms) {
    setTimeout(() => { launchBalloon(); scheduleBalloon(60000 + Math.random() * 60000); }, ms);
  }
  function balloonAt(x, y) {
    if (!balloonEl || balloonEl.classList.contains("popped")) return null;
    const r = balloonEl.querySelector(".bal-svg").getBoundingClientRect();
    return (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) ? balloonEl : null;
  }
  function popBalloon(b) {
    const basket = b.querySelector(".bal-basket").getBoundingClientRect();
    const bx = basket.left + basket.width / 2, by = basket.top + basket.height / 2;
    b.classList.add("popped");
    skySound("balloon");
    // Gone once it has floated off, so the next one can come.
    setTimeout(() => { b.remove(); if (balloonEl === b) balloonEl = null; }, 3300);
    // Confetti out of where the basket was.
    const conf = document.createElement("div");
    conf.className = "fx-confetti";
    conf.style.left = `${bx}px`;
    conf.style.top = `${by}px`;
    let html = "";
    for (let i = 0; i < 70; i++) {
      const c = FW_COLOURS[i % FW_COLOURS.length];
      const dx = (Math.random() * 2 - 1) * 180;
      const up = 30 + Math.random() * 70;
      const fall = window.innerHeight * (0.5 + Math.random() * 0.4);
      const rot = (Math.random() * 2 - 1) * 900;
      const dur = 2.4 + Math.random() * 1.6;
      const shape = i % 3 === 0 ? "round" : "";
      html += `<span class="cf ${shape}" style="--c:${c};--dx:${dx.toFixed(0)}px;--up:${up.toFixed(0)}px;--fall:${fall.toFixed(0)}px;--rot:${rot.toFixed(0)}deg;--dur:${dur.toFixed(2)}s;--delay:${(Math.random() * 0.25).toFixed(2)}s"></span>`;
    }
    conf.innerHTML = html;
    spawn(conf, 4400);
    // Fireworks around it, one after another.
    const n = 3 + Math.floor(Math.random() * 2);
    for (let k = 0; k < n; k++) {
      setTimeout(() => {
        const tx = Math.max(40, Math.min(window.innerWidth - 40, bx + (Math.random() * 2 - 1) * 220));
        const ty = Math.max(40, by - 40 - Math.random() * 140);
        firework(bx + (Math.random() * 2 - 1) * 30, by + 10, tx, ty, FW_COLOURS[(k * 3 + 1) % FW_COLOURS.length]);
      }, 250 + k * 520);
    }
  }
  function firework(x0, y0, x1, y1, colour) {
    skySound("fwUp");
    const rise = document.createElement("div");
    rise.className = "fx-fw-rise";
    rise.style.left = `${x0}px`;
    rise.style.top = `${y0}px`;
    rise.style.setProperty("--dx", `${x1 - x0}px`);
    rise.style.setProperty("--dy", `${y1 - y0}px`);
    rise.style.setProperty("--c", colour);
    spawn(rise, 520);
    setTimeout(() => {
      skySound("fwBang");
      const burst = document.createElement("div");
      burst.className = "fx-fw";
      burst.style.left = `${x1}px`;
      burst.style.top = `${y1}px`;
      const second = FW_COLOURS[(FW_COLOURS.indexOf(colour) + 3) % FW_COLOURS.length];
      let h = '<span class="fw-flash" style="--c:' + colour + '"></span>';
      const sparks = 30;
      for (let i = 0; i < sparks; i++) {
        const a = (i / sparks) * Math.PI * 2 + Math.random() * 0.2;
        const d = 55 + Math.random() * 45;
        const c = i % 2 ? colour : second;
        h += `<span class="fw-spark" style="--c:${c};--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px"></span>`;
      }
      burst.innerHTML = h;
      spawn(burst, 1700);
    }, 480);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initClouds);
  } else {
    initClouds();
  }
  // First pass a little after the app opens, then every one to two minutes.
  scheduleBalloon(20000 + Math.random() * 20000);

  // ---- A plane and a rocket ----
  // Asked 2026-11-24: «add a plane and a rocket (less frequent than the
  // birds obv) to a plane add a peace sign plane name "da plane"». Both
  // cross the lobby now and then, rarer than the eagles (which never stop):
  // the plane every two to four minutes, towing a banner with a peace sign
  // and its name; the rocket every three to six, with flame and smoke.
  // Nothing happens on a tap yet; that was not asked.
  // Seen from the side, nose to the right, the way it flies: one wing,
  // one tail fin. Until 2026-11-24 it was drawn from above, and its two
  // wings and two tailplanes read as «4 крыла».
  const PLANE_SVG =
    '<svg viewBox="0 0 64 24" class="pl-svg">' +
    '<path d="M7 11.5 L3.5 3 H8.5 L15.5 11.5 Z" fill="#c9d3e0"/>' +
    '<path d="M6 12.4 H17 L15.5 14 H6 Z" fill="#b5c0cf"/>' +
    '<path d="M6.5 13 C6.5 11.6 8 10.6 10 10.6 H50 C55.5 10.6 59.5 11.6 61.5 13.2 C59.5 14.8 55.5 15.8 50 15.8 H10 C8 15.8 6.5 14.5 6.5 13 Z" fill="#e9eef5"/>' +
    '<path d="M29 14.6 H40 L32 21.5 H26.6 Z" fill="#c9d3e0"/>' +
    '<path d="M52 11.6 H56 C57.6 11.6 58.8 12.2 59.6 13 H52 Z" fill="#4cc9f0"/>' +
    [20, 25, 30, 35, 40, 45].map(x => `<circle cx="${x}" cy="12.9" r="0.9" fill="#4cc9f0"/>`).join("") +
    '</svg>';
  const ROCKET_SVG =
    '<svg viewBox="0 0 20 52" class="rk-svg">' +
    '<path d="M10 1c5 6 7 13 7 22v13H3V23C3 14 5 7 10 1z" fill="#eef1f6"/>' +
    '<path d="M10 1c3 4 5 8 6 12H4c1-4 3-8 6-12z" fill="#ff4d6d"/>' +
    '<circle cx="10" cy="20" r="3.2" fill="#4cc9f0" stroke="#9aa4b2" stroke-width="1"/>' +
    '<path d="M3 28l-3 9h3zM17 28l3 9h-3z" fill="#ff4d6d"/>' +
    '<path class="rk-flame" d="M5 36c0 6 2 11 5 15 3-4 5-9 5-15z" fill="#ffd166"/>' +
    '</svg>';

  let flyerBusy = false;
  function flyBy(kind) {
    if (flyerBusy || reduceMotion() || !lobbyShown()) return;
    flyerBusy = true;
    const el = document.createElement("div");
    const ltr = Math.random() < 0.5;
    if (kind === "plane") {
      el.className = "fx-plane" + (ltr ? "" : " rtl");
      el.style.top = `${5 + Math.random() * 12}vh`;
      el.innerHTML = `<div class="pl-bob"><span class="pl-banner"><span class="pl-peace">☮</span> da plane</span><span class="pl-rope"></span>${PLANE_SVG}</div>`;
    } else {
      el.className = "fx-rocket" + (ltr ? "" : " rtl");
      el.style.left = `${10 + Math.random() * 30}vw`;
      el.innerHTML = `<div class="rk-body">${ROCKET_SVG}</div>`;
      const smoke = setInterval(() => {
        if (!el.isConnected) { clearInterval(smoke); return; }
        const r = el.querySelector(".rk-svg").getBoundingClientRect();
        const puff = document.createElement("div");
        puff.className = "fx-rk-puff";
        puff.style.left = `${r.left + r.width / 2}px`;
        puff.style.top = `${r.bottom - 4}px`;
        spawn(puff, 1600);
      }, 90);
    }
    fxLayer().appendChild(el);
    el.addEventListener("animationend", e => {
      if (e.target === el) { el.remove(); flyerBusy = false; }
    });
  }
  function scheduleFlyer(kind, min, spread) {
    setTimeout(() => { flyBy(kind); scheduleFlyer(kind, min, spread); }, min + Math.random() * spread);
  }
  scheduleFlyer("plane", 120000, 120000);
  scheduleFlyer("rocket", 180000, 180000);

  Object.assign(Dojo, { BG_DECORS, SCENES, decorFace, pokeMoon, pokeSun, dartAt, launchBalloon, flyBy });
})();
