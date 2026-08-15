// ================================================
// CS Dojo — CORE / theme painter
// ------------------------------------------------
// Turns a theme id into CSS custom properties on :root. Knows
// nothing about prices or ownership beyond asking DB.ownsTheme
// before applying a premium one — an imported profile must not
// silently wear something it never bought.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const THEMES = Dojo.THEMES;
  const ALL_THEMES = Dojo.ALL_THEMES;
  const isPremium = (...a) => Dojo.isPremium(...a);
  const BG_STRIPES = Dojo.BG_STRIPES;

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function shade(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    const f = v => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
    return `#${[f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, "0")).join("")}`;
  }

  // A theme is unlocked if the profile has REACHED THE RANK that gives
  // it, or already owned it under the old paid system. Anything else
  // must not silently apply — an imported profile can't wear a reward
  // it never earned — so it falls back to Indigo.
  function themeUnlocked(id) {
    if (!isPremium(id)) return true;
    if (DB.ownsTheme(id)) return true;
    return Dojo.Ranks ? Dojo.Ranks.unlockedThemes(DB.getXp()).has(id) : false;
  }

  function resolveTheme(id) {
    if (!themeUnlocked(id)) return THEMES[0];
    return ALL_THEMES.find(x => x.id === id) || THEMES[0];
  }

  // A separate, rank-gated axis from the colour theme (see shop/themes.js's
  // BG_STRIPES) — same "must have reached the rank" gate, same fallback
  // shape, just its own CSS var so it can be layered over any theme.
  function bgStripeUnlocked(id) {
    if (id === "none") return true;
    return Dojo.Ranks ? Dojo.Ranks.unlockedBgStripes(DB.getXp()).has(id) : false;
  }

  // The stripe overlay was designed against a dark, plain surface. Two
  // real problems showed up combining it with actual themes, both
  // reported live:
  //   1. "kirigami stripes when combined with other ones create a
  //      mess" — Kirigami's OWN `bg` is already a repeating diagonal
  //      line pattern (the torn-paper look). Layering a second,
  //      differently-angled repeating stripe on top reads as noise,
  //      not texture. Any theme whose `bg` is itself a repeating
  //      pattern (Kirigami, Terminal's CRT scanlines) suppresses the
  //      separate stripe layer entirely rather than stacking a second
  //      one — the theme's own texture wins.
  //   2. "paper & frost + stripes poor visibility" — every stripe's
  //      `css` is hardcoded `rgba(255,255,255,…)`, a white wash that
  //      reads fine on a dark surface and goes nearly invisible on a
  //      light one — the exact class of gap already flagged above for
  //      other fixed-white overlays. Light themes (`mode: "light"`)
  //      get the same pattern recoloured dark instead.
  function stripeCssFor(id, t) {
    const stripe = bgStripeUnlocked(id) && BG_STRIPES ? BG_STRIPES.find(s => s.id === id) : null;
    if (!stripe) return "none";
    if (t.bg && t.bg.includes("repeating-linear-gradient")) return "none";
    if (t.mode === "light") return stripe.css.replace(/rgba\(255,\s*255,\s*255,/g, "rgba(15, 23, 42,");
    return stripe.css;
  }

  // Called when the STRIPE choice itself changes (Settings) — repaints
  // against whichever theme is actually equipped right now. A stripe
  // pick is persisted (DB.setBgStripe, done by the caller), unlike a
  // theme preview, so this always reads the real theme, never a
  // previewed one.
  function applyBgStripe(id) {
    const t = resolveTheme(DB.getTheme ? DB.getTheme() : "indigo");
    document.documentElement.style.setProperty("--bg-stripe-image", stripeCssFor(id, t));
  }

  // ---- Background decorations (Inventory's "Decorations" slot) ----
  // Same busy-theme conflict stripeCssFor already solves for the stripe
  // layer, applied here too: a theme whose OWN `bg` is a repeating
  // pattern (Kirigami etc.) reads as noise with a second moving layer
  // on top, so decorations suppress there exactly like stripes do —
  // still owned/toggled in DB, just not rendered against that theme.
  // Rendered via a data attribute (`~=` token matching in CSS), not a
  // CSS var, because decorations are actual animated DOM elements
  // (flying eagles), not a single background-image string.
  function decorsSuppressed(t) {
    return !!(t && t.bg && t.bg.includes("repeating-linear-gradient"));
  }
  function applyBgDecors(ids) {
    const t = resolveTheme(DB.getTheme ? DB.getTheme() : "indigo");
    document.documentElement.dataset.bgDecor = decorsSuppressed(t) ? "" : (ids || []).join(" ");
  }

  // Scenery is deliberately NOT run through decorsSuppressed: the
  // suppression rule exists because a repeating overlay tiled on top of
  // a repeating theme `bg` reads as noise. Scenery is a solid silhouette
  // anchored to the bottom edge — it doesn't tile, so it doesn't fight
  // a patterned theme the way stripes and drifting decorations do.
  function applyScene(id) {
    document.documentElement.dataset.bgScene = id && id !== "none" ? id : "";
  }

  // ---- Sky: day / night ----
  // A scene in its own right, NOT a reading of whether the theme is
  // light or dark. The first version derived it from the theme, which
  // meant one control moved two unrelated things: the app's colours and
  // the time of day outside. Separating them means a dark theme can run
  // in daylight and a light theme at night, and the sky can be equipped
  // from Custom like any other scene.
  //
  // Everything downstream keys off this one attribute: sun vs moon, the
  // stars (hidden by day), and the doubled cloud count.
  function applySky(id) {
    document.documentElement.dataset.sky = id === "day" ? "day" : "night";
  }

  function toggleSky() {
    const next = (DB.getSky ? DB.getSky() : "night") === "day" ? "night" : "day";
    setSky(next);
    return next;
  }

  // The lock runs BOTH ways. setSky picks the matching theme, and this
  // picks the matching sky for whatever theme is equipped — otherwise
  // equipping a light theme from Custom leaves a night sky over a white
  // app, which is exactly what first launch showed (reported: "a day
  // topic with night sky"). Called on boot and whenever a theme is
  // equipped, so the two can never be observed disagreeing.
  function syncSkyToTheme() {
    const t = resolveTheme(DB.getTheme ? DB.getTheme() : "indigo");
    const want = t.mode === "light" ? "day" : "night";
    if (DB.setSky && (DB.getSky ? DB.getSky() : "night") !== want) DB.setSky(want);
    applySky(want);
    if (Dojo.renderVitals) Dojo.renderVitals();
    if (Dojo.Bus) Dojo.Bus.emit("sky:changed", { id: want });
  }

  // The one call sites should use when the user PICKS a theme, so the
  // sky follows. Plain applyTheme stays preview-only and persists
  // nothing.
  function equipTheme(id) {
    DB.setTheme(id);
    applyTheme(id);
    syncSkyToTheme();
  }

  // Day means a WHITE app, not just a bright sky — one switch moves the
  // whole look. The pair is fixed rather than remembering whichever
  // themes you last used: "day" has to mean the same thing every time,
  // and both of these are free, so the switch can never land you on a
  // theme you don't own.
  const SKY_THEME = { day: "frost", night: "indigo" };

  function setSky(id) {
    const sky = id === "day" ? "day" : "night";
    if (DB.setSky) DB.setSky(sky);
    applySky(sky);

    const theme = SKY_THEME[sky];
    if (theme && DB.getTheme && DB.getTheme() !== theme) {
      DB.setTheme(theme);
      applyTheme(theme);
    }

    if (Dojo.renderVitals) Dojo.renderVitals();   // repaint the toggle's own icon
    if (Dojo.Bus) Dojo.Bus.emit("sky:changed", { id: sky });
  }

  // Text was "deliberately not themed" (see core/CORE.md) for as long as
  // every theme was a dark background — a fixed light text color always
  // had contrast. A light theme breaks that assumption outright, so text
  // now DOES move, but only as a function of `t.mode === "light"`, never
  // per-theme — every dark theme still shares the exact same text colour,
  // which is the property the original decision was protecting.
  //
  // Known gap: a handful of hover/overlay effects across the stylesheets
  // are hardcoded `rgba(255,255,255,0.0N)` — a white wash meant to lighten
  // a dark surface slightly. On a light theme that's a near-invisible
  // white-on-white instead of the intended subtle darken. Core surfaces
  // (page/card backgrounds, all text) are fully theme-aware; those
  // scattered fixed-white overlays are not yet audited — they'll just
  // read as slightly under-styled on a light theme rather than broken.
  const LIGHT_TEXT = { text: "#1e293b", dim: "#475569", muted: "#64748b", border: "rgba(0, 0, 0, 0.08)" };
  const DARK_TEXT = { text: "#e2e8f0", dim: "#94a3b8", muted: "#64748b", border: "rgba(255, 255, 255, 0.06)" };

  function applyTheme(id) {
    paintTheme(resolveTheme(id));
  }

  // Locked-theme preview (Settings): paints a theme's CSS variables
  // straight from ALL_THEMES, skipping the unlock gate — nothing is
  // bought or persisted, it's just what the app would look like. Falls
  // back to Indigo for an unknown id, same as the gated path.
  function previewTheme(id) {
    paintTheme(ALL_THEMES.find(x => x.id === id) || THEMES[0]);
  }

  function paintTheme(t) {
    const [r, g, b] = hexToRgb(t.accent);
    const [dr, dg, db_] = hexToRgb(t.deep);
    const bolt = t.bolt || [shade(t.accent, -0.35), t.accent, t.light];
    const [br, bg_, bb] = hexToRgb(bolt[2]);
    const root = document.documentElement.style;
    root.setProperty("--accent", t.accent);
    root.setProperty("--accent-light", t.light);
    root.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.25)`);
    root.setProperty("--accent-glow-strong", `rgba(${r}, ${g}, ${b}, 0.5)`);
    root.setProperty("--border-accent", `rgba(${r}, ${g}, ${b}, 0.3)`);
    root.setProperty("--bg-deep", t.deep);
    root.setProperty("--bg-deep-rgb", `${dr}, ${dg}, ${db_}`);
    root.setProperty("--bg-card", t.card);
    root.setProperty("--bg-card-hover", t.hover);
    root.setProperty("--bg-surface", t.surface);
    // Charge bar / flying bolt / award text all read these.
    root.setProperty("--bolt-1", bolt[0]);
    root.setProperty("--bolt-2", bolt[1]);
    root.setProperty("--bolt-3", bolt[2]);
    root.setProperty("--bolt-glow", `rgba(${br}, ${bg_}, ${bb}, 0.55)`);
    root.setProperty("--bg-image", t.bg || "none");

    // (A `data-theme-mode` attribute lived here briefly to drive the
    // sun/moon swap off light-vs-dark. The sky is its own setting now —
    // `data-sky`, see applySky — so nothing read it any more and it was
    // removed rather than left looking load-bearing.)
    const tx = t.mode === "light" ? LIGHT_TEXT : DARK_TEXT;
    root.setProperty("--text", tx.text);
    root.setProperty("--text-dim", tx.dim);
    root.setProperty("--text-muted", tx.muted);
    root.setProperty("--border", tx.border);

    // Re-adapt the equipped stripe to whichever theme just painted —
    // switching (or previewing) a theme used to leave the stripe
    // exactly as it was, which is how it went unnoticed that Kirigami
    // and the white-on-white light themes needed different handling.
    const stripeId = DB.getBgStripe ? DB.getBgStripe() : "none";
    root.setProperty("--bg-stripe-image", stripeCssFor(stripeId, t));

    // Same re-adapt as the stripe above: a theme switch/preview has to
    // re-check decoration suppression against whichever theme just
    // painted, not leave decorations exactly as they were.
    document.documentElement.dataset.bgDecor = decorsSuppressed(t) ? "" : (DB.getBgDecors ? DB.getBgDecors() : []).join(" ");
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { applyTheme, previewTheme, resolveTheme, themeUnlocked, applyBgStripe, bgStripeUnlocked, applyBgDecors, applyScene, applySky, setSky, toggleSky, syncSkyToTheme, equipTheme, hexToRgb, shade });
})();
