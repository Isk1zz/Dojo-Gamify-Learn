// ================================================
// CS Dojo — SHOP / theme catalogue (pure data)
// ------------------------------------------------
// Pure data. No DOM, no DB, no rendering. Two lists:
//   THEMES          free, always available
//   PREMIUM_THEMES  bought with charge in the Shop
// core/theme.js paints them; shop/shop.js sells them; settings
// lists the owned ones. Adding a theme = one entry here.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.


  // ---- Themes ----
  // Each theme overrides only the accent family; backgrounds and text
  // stay put so contrast stays readable whichever one is picked.
  // Each theme repaints the whole surface, not just the accent — the
  // background is most of what you actually see, so changing only
  // --accent barely registers.
  // `bolt` is the charge-bar palette (dark -> mid -> bright). The bar
  // used to be hardcoded sky-blue on an indigo strip, so every theme
  // except Indigo Night left it looking pasted on from another app.
  // If a theme omits `bolt` it is derived from the accent.
  const THEMES = [
    { id: "indigo", name: "Indigo Night", swatch: "#6366f1",
      accent: "#6366f1", light: "#818cf8",
      deep: "#0a0e1a", card: "#111827", hover: "#1a2235", surface: "#151c2e",
      bolt: ["#0ea5e9", "#38bdf8", "#7dd3fc"] },
    { id: "ember", name: "Ember", swatch: "#f97316",
      accent: "#f97316", light: "#fb923c",
      deep: "#140d08", card: "#1f1510", hover: "#2b1d15", surface: "#241a13",
      bolt: ["#dc2626", "#f97316", "#fcd34d"] },
    { id: "jade", name: "Jade", swatch: "#10b981",
      accent: "#10b981", light: "#34d399",
      deep: "#06120f", card: "#0d1f1a", hover: "#132b24", surface: "#0f251f",
      bolt: ["#047857", "#10b981", "#6ee7b7"] },
    { id: "rose", name: "Rose", swatch: "#ec4899",
      accent: "#ec4899", light: "#f472b6",
      deep: "#150a11", card: "#20111a", hover: "#2c1824", surface: "#26141f",
      bolt: ["#be185d", "#ec4899", "#fbcfe8"] },
    { id: "ice", name: "Ice", swatch: "#06b6d4",
      accent: "#06b6d4", light: "#22d3ee",
      deep: "#07131a", card: "#0e1f28", hover: "#152a35", surface: "#11242e",
      bolt: ["#0891b2", "#22d3ee", "#a5f3fc"] },
    { id: "sepia", name: "Sepia", swatch: "#f59e0b",
      accent: "#f59e0b", light: "#fbbf24",
      deep: "#14100a", card: "#1e1811", hover: "#2a2118", surface: "#231c14",
      bolt: ["#b45309", "#f59e0b", "#fde68a"] },
    { id: "violet", name: "Violet", swatch: "#a855f7",
      accent: "#a855f7", light: "#c084fc",
      deep: "#100a17", card: "#191022", hover: "#23172f", surface: "#1d1329",
      bolt: ["#7c3aed", "#a855f7", "#e9d5ff"] },
    { id: "slate", name: "Slate", swatch: "#64748b",
      accent: "#64748b", light: "#94a3b8",
      deep: "#0c0f14", card: "#151a21", hover: "#1e242d", surface: "#191f27",
      bolt: ["#475569", "#94a3b8", "#e2e8f0"] }
  ];

  // ---- Premium themes ----
  // Bought with lightning charge in the Shop. Same fields as a free
  // theme plus `price` and `bg` — a fixed background image layer, which
  // is what actually makes one feel different from a recoloured default.
  const PREMIUM_THEMES = [
    {
      id: "sakura", name: "Sakura Midnight", price: 90, tagline: "Petals over a plum-dark sky",
      swatch: "#f9a8d4", accent: "#f472b6", light: "#fbcfe8",
      deep: "#100812", card: "#1b0f1e", hover: "#261629", surface: "#1f1223",
      bolt: ["#db2777", "#f472b6", "#fce7f3"],
      bg: "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(244,114,182,0.16), transparent 62%)," +
          "radial-gradient(ellipse 45% 40% at 88% 92%, rgba(192,132,252,0.10), transparent 58%)," +
          "linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%)"
    },
    {
      id: "sumi", name: "Sumi Ink", price: 110, tagline: "Brush and paper, nothing else",
      swatch: "#e7e5e4", accent: "#d6d3d1", light: "#f5f5f4",
      deep: "#0b0b0b", card: "#161616", hover: "#212121", surface: "#1a1a1a",
      bolt: ["#57534e", "#d6d3d1", "#fafaf9"],
      bg: "radial-gradient(ellipse 80% 50% at 30% 0%, rgba(255,255,255,0.05), transparent 60%)," +
          "radial-gradient(ellipse 50% 45% at 85% 85%, rgba(255,255,255,0.03), transparent 55%)"
    },
    {
      id: "terminal", name: "Amber Terminal", price: 120, tagline: "CRT glow, 1979",
      swatch: "#fbbf24", accent: "#f59e0b", light: "#fcd34d",
      deep: "#080600", card: "#12100a", hover: "#1c1810", surface: "#16130c",
      bolt: ["#b45309", "#fbbf24", "#fef3c7"],
      bg: "repeating-linear-gradient(180deg, rgba(251,191,36,0.035) 0 1px, transparent 1px 3px)," +
          "radial-gradient(ellipse 75% 60% at 50% 40%, rgba(251,191,36,0.07), transparent 70%)"
    },
    {
      id: "koi", name: "Koi Pond", price: 150, tagline: "Orange fish, deep green water",
      swatch: "#fb923c", accent: "#f97316", light: "#fdba74",
      deep: "#04120f", card: "#0a1e1a", hover: "#0f2a24", surface: "#0c231e",
      bolt: ["#ea580c", "#fb923c", "#fed7aa"],
      bg: "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(20,184,166,0.14), transparent 60%)," +
          "radial-gradient(ellipse 55% 45% at 80% 90%, rgba(249,115,22,0.10), transparent 60%)"
    },
    {
      id: "ronin", name: "Neon Ronin", price: 180, tagline: "Rain, signage, no sleep",
      swatch: "#22d3ee", accent: "#e879f9", light: "#22d3ee",
      deep: "#06030d", card: "#110a1c", hover: "#1b1029", surface: "#150c22",
      bolt: ["#a21caf", "#e879f9", "#67e8f9"],
      bg: "radial-gradient(ellipse 55% 45% at 12% 8%, rgba(232,121,249,0.18), transparent 60%)," +
          "radial-gradient(ellipse 55% 45% at 88% 88%, rgba(34,211,238,0.16), transparent 60%)," +
          "repeating-linear-gradient(90deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 6px)"
    },
    {
      id: "fuji", name: "Fuji Dawn", price: 220, tagline: "First light on the mountain",
      swatch: "#fda4af", accent: "#fb7185", light: "#fecdd3",
      deep: "#080b1c", card: "#101528", hover: "#1a2038", surface: "#141a30",
      bolt: ["#4f46e5", "#fb7185", "#fed7aa"],
      bg: "linear-gradient(180deg, rgba(251,113,133,0.14) 0%, rgba(129,140,248,0.08) 32%, transparent 65%)," +
          "radial-gradient(ellipse 90% 40% at 50% 105%, rgba(255,255,255,0.05), transparent 60%)"
    }
  ];

  const ALL_THEMES = [...THEMES, ...PREMIUM_THEMES];
  const isPremium = id => PREMIUM_THEMES.some(t => t.id === id);

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { THEMES, PREMIUM_THEMES, ALL_THEMES, isPremium });
})();
