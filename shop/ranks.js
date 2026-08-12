// ================================================
// CS Dojo — RANKS (pure data + lookup)
// ------------------------------------------------
// XP is earned by studying and never spent. Rank is what it buys, and
// rank is what hands out rewards. No prices, no balance, no sink.
//
// ---- How the ladder was sized ----
//
// The ceiling is 10,000 XP at Nobel Laureate — every rung's threshold
// doubled from the original ladder by explicit request (the grind felt
// too quick; ranks were landing faster than the studying that earned
// them). The GAPS still widen the same way relative to each other
// (120, 180, 220 ... 920, 980 now), just scaled up.
//
//   15 min  ~= 5 chunks
//   1 chunk  = 5-7 XP, so ~30 XP on a normal day
//
// At that pace: Lead Investigator around day 213, Program Director
// around day 241, Nobel Laureate around day 333 — about double the
// original day-counts, which is the point of doubling the thresholds.
//
// Gaps widen deliberately: early ranks land fast enough to feel like
// something is happening, late ones slowly enough that Nobel Laureate
// means something.
//
// If the XP per chunk changes, re-check this comment — it is the only
// place the 15-min assumption is written down.
//
// ---- Feature unlocks ----
// Rank hands out FEATURES as well as themes. A brand-new profile should
// not be juggling hunger, rent and a story on day one — that is three
// systems before anyone has finished a chunk. They arrive at Senior Lab
// Manager (2220 XP, a few weeks of normal use), by which point the
// Library is a habit and the sim is a reward rather than a chore.
//
// Pure data, like everything else here: hasFeature takes the xp, it
// does not read DB. Callers pass DB.getXp().

// ---- Rewards ----
// `reward: null` is a deliberate blank, not an oversight. Ranks without
// a reward still rank up and still show on the ladder; fill them in as
// there is something worth giving.
// ================================================

const RANKS = [
  { n: 1,  xp: 0,     name: "Lab Intern",               abbr: "INT",  reward: null },
  { n: 2,  xp: 120,   name: "Research Assistant I",     abbr: "RA1",  reward: null },
  { n: 3,  xp: 300,   name: "Research Assistant II",    abbr: "RA2",  reward: null },
  { n: 4,  xp: 520,   name: "Lab Technician",           abbr: "TCH",  reward: { theme: "sakura" } },
  { n: 5,  xp: 780,   name: "Shift Supervisor",         abbr: "SUP",  reward: { theme: "paper" } },
  { n: 6,  xp: 1080,  name: "Research Coordinator",     abbr: "CRD",  reward: null },
  { n: 7,  xp: 1420,  name: "Senior Research Coordinator", abbr: "SCR", reward: { theme: "sumi" } },
  { n: 8,  xp: 1800,  name: "Lab Manager",              abbr: "MGR",  reward: null },
  { n: 9,  xp: 2220,  name: "Senior Lab Manager",       abbr: "SLM",  reward: null },
  { n: 10, xp: 2680,  name: "Chief Technician",         abbr: "CHT",  reward: { theme: "terminal" } },
  { n: 11, xp: 3180,  name: "Director of Operations",   abbr: "DOP",  reward: null },
  { n: 12, xp: 3720,  name: "Master Technician",        abbr: "MTC",  reward: null },
  { n: 13, xp: 4300,  name: "Principal Investigator",   abbr: "PI",   reward: { theme: "koi" } },
  { n: 14, xp: 4940,  name: "Postdoctoral Researcher",  abbr: "PDR",  reward: null },
  { n: 15, xp: 5640,  name: "Project Lead",             abbr: "PL",   reward: null },
  { n: 16, xp: 6400,  name: "Lead Investigator",        abbr: "LI",   reward: { theme: "ronin" } },
  { n: 17, xp: 7220,  name: "Program Director",         abbr: "PD",   reward: null },
  { n: 18, xp: 8100,  name: "Senior Program Director",  abbr: "SPD",  reward: null },
  { n: 19, xp: 9020,  name: "Vice President of R&D",    abbr: "VP",   reward: { theme: "fuji" } },
  { n: 20, xp: 10000, name: "Nobel Laureate",           abbr: "NL",   reward: { theme: "kirigami" } }
];

const FEATURES = {
  // id            rank it arrives at
  survival:        9    // vitals, the life shop, and the Story tab
};
// Senior Lab Manager, not Senior Research Coordinator. SSG already hands
// out Sumi Ink, and two rewards landing on one rung means the smaller one
// goes unnoticed — you only read the rank-up once. MSG (2220 XP) was one
// of the deliberate blanks, so the survival sim fills an empty rung
// instead of crowding a full one.

// ---- Rank badge glyphs ----
// One emoji per rank on a shared card frame — not the hand-drawn
// chevron/tick/ring scheme this replaced. That version stacked thin
// gold strokes (ticks, rings, a wire-frame "atom") on top of each
// other for the busier ranks, and at 26x32px real size it read as
// overlapping stripes, not a badge. An emoji is one glyph, drawn by
// the system font, so it can't collide with itself, and "flask",
// "microscope", "DNA" etc. are legible at this size in a way thin
// custom line art wasn't. Escalates loosely by seniority within the
// technician track (n1-12), then the specialist/leadership tiers,
// capped with the medal at Nobel Laureate — not meant to be exact,
// just a different, recognisable glyph per rung.
const RANK_EMOJI = {
  INT: "\u{1F393}", RA1: "\u{1F9EB}", RA2: "\u{1F9EA}", TCH: "\u{1F52C}",
  SUP: "\u{1F4CB}", CRD: "\u{1F4CA}", SCR: "\u{1F4C8}", MGR: "\u{1F5C2}\u{FE0F}",
  SLM: "\u{2697}\u{FE0F}", CHT: "\u{1F9F0}", DOP: "\u{1F9ED}", MTC: "\u{1F6E0}\u{FE0F}",
  PI:  "\u{1F52D}", PDR: "\u{1F4DA}", PL:  "\u{1F4D0}", LI:  "\u{1F9EC}",
  PD:  "\u{1F9E0}", SPD: "\u{1F4E1}", VP:  "\u{269B}\u{FE0F}", NL:  "\u{1F3C5}"
};

// Small badge-shaped SVG (rounded rect backdrop + this rank's emoji)
// sized to sit inline in the HUD chip. `rank` is a RANKS entry.
function insigniaSvg(rank) {
  const emoji = RANK_EMOJI[rank.abbr] || "";
  return `<svg class="rank-svg" viewBox="0 0 28 34" width="26" height="32" aria-hidden="true">`
    + `<rect x="1.5" y="1.5" width="25" height="31" rx="4" fill="var(--bg-card)" stroke="var(--border)"/>`
    + (emoji ? `<text x="14" y="18" text-anchor="middle" dominant-baseline="central" font-size="15">${emoji}</text>` : "")
    + `</svg>`;
}

(() => {
  function featureRank(id) {
    return RANKS.find(r => r.n === FEATURES[id]) || null;
  }

  function hasFeature(id, xp) {
    const need = FEATURES[id];
    if (need == null) return true;          // unknown feature: never gate it
    const at = featureRank(id);
    return !!at && Number(xp || 0) >= at.xp;
  }

  function rankFor(xp) {
    let out = RANKS[0];
    for (const r of RANKS) if (xp >= r.xp) out = r;
    return out;
  }

  function nextRank(xp) {
    return RANKS.find(r => r.xp > xp) || null;
  }

  // Everything the HUD needs in one call.
  function progress(xp) {
    const cur = rankFor(xp);
    const next = nextRank(xp);
    if (!next) return { cur, next: null, into: 0, span: 0, pct: 100, toGo: 0 };
    const into = xp - cur.xp;
    const span = next.xp - cur.xp;
    return { cur, next, into, span, pct: Math.min(100, (into / span) * 100), toGo: next.xp - xp };
  }

  // Which reward themes the profile has reached. Themes unlocked under
  // the old paid system stay owned via DB.ownsTheme, so both count.
  function unlockedThemes(xp) {
    return new Set(
      RANKS.filter(r => xp >= r.xp && r.reward && r.reward.theme).map(r => r.reward.theme)
    );
  }

  function themeRank(themeId) {
    return RANKS.find(r => r.reward && r.reward.theme === themeId) || null;
  }

  Dojo.Ranks = { RANKS, FEATURES, rankFor, nextRank, progress, unlockedThemes, themeRank,
                 hasFeature, featureRank, insigniaSvg };
})();
