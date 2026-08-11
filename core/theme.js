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
    const t = resolveTheme(id);
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

    const tx = t.mode === "light" ? LIGHT_TEXT : DARK_TEXT;
    root.setProperty("--text", tx.text);
    root.setProperty("--text-dim", tx.dim);
    root.setProperty("--text-muted", tx.muted);
    root.setProperty("--border", tx.border);
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { applyTheme, resolveTheme, themeUnlocked, hexToRgb, shade });
})();
