// ================================================
// CS Dojo — RANKS (pure data + lookup)
// ------------------------------------------------
// XP is earned by studying and never spent. Rank is what it buys, and
// rank is what hands out rewards. No prices, no balance, no sink.
//
// ---- How the ladder was sized ----
//
// The ceiling is 50,000 XP at Nobel Laureate — 5x the previous 10,000
// ceiling, by explicit request once the ladder was checked against
// this app's ACTUAL content: one full course completion (141 chunks,
// every topic exam, the Final Quiz) only nets ~2,300 XP at a realistic
// ~90% average score, so the old 10,000 ceiling needed something like
// 4-5 courses' worth of content to ever reach — with exactly one
// course existing, "top of the ladder" was functionally unreachable,
// not just a long climb. Raising the ceiling doesn't fix that by
// itself; see the review-XP note below, which is the other half of
// the same fix. The GAPS still widen the same way relative to each
// other, just scaled up 5x along with everything else.
//
//   15 min  ~= 5 chunks
//   1 chunk  = 5-7 XP, so ~30 XP on a normal NEW-content day
//
// At a flat 30 XP/day of pure new content, Nobel Laureate lands around
// day 1,667 — but that number assumes nobody ever reviews, which was
// never realistic and is even less so now that review pays properly
// (see library.js's REVIEW_XP_PER_CARD): once the one course's content
// is exhausted, daily income shifts to review sessions instead of
// stopping, so real day-counts run faster than this pure-new-content
// figure once someone's past the first course.
//
// Gaps widen deliberately: early ranks land fast enough to feel like
// something is happening, late ones slowly enough that Nobel Laureate
// means something.
//
// If the XP per chunk changes, re-check this comment — it is the only
// place the 15-min assumption is written down.
//
// ---- Feature unlocks ----
// Rank can hand out FEATURES as well as themes — a rank-gated system a
// brand-new profile shouldn't be juggling on day one. Currently unused
// (the life-sim was the only feature that ever registered here; see
// BACKLOG.md for its removal) but kept as infra for the next one.
//
// Pure data, like everything else here: hasFeature takes the xp, it
// does not read DB. Callers pass DB.getXp().

// ---- Rewards ----
// `reward: null` is a deliberate blank, not an oversight. Ranks without
// a reward still rank up and still show on the ladder; fill them in as
// there is something worth giving.
//
// ---- Token rewards specifically (7 ranks: 6, 8, 11, 12, 15, 17, 18) ----
// Sized so the ladder's free Tokens can never fully cover a course on
// their own: 100+50+150+75+200+100+120 = 795, short of the 1000-Token
// price on the one course that exists (shop/tokens.js). Ranking up
// stays worth celebrating without turning into a grind-instead-of-buy
// path around the Token Shop — every free-Token profile still needs at
// least one real purchase (or the demo stub, today) to actually get in.
// Re-check this sum if either the ladder or a course price changes.
// ================================================

const RANKS = [
  { n: 1,  xp: 0,     name: "Lab Intern",               abbr: "INT",  reward: { bgStripe: "diagonal" } },
  { n: 2,  xp: 600,   name: "Research Assistant I",     abbr: "RA1",  reward: { bgStripe: "crosshatch" } },
  { n: 3,  xp: 1500,  name: "Research Assistant II",    abbr: "RA2",  reward: { bgStripe: "herringbone" } },
  { n: 4,  xp: 2600,  name: "Lab Technician",           abbr: "TCH",  reward: { theme: "sakura" } },
  { n: 5,  xp: 3900,  name: "Shift Supervisor",         abbr: "SUP",  reward: { theme: "paper" } },
  { n: 6,  xp: 5400,  name: "Research Coordinator",     abbr: "CRD",  reward: { tokens: 100 } },
  { n: 7,  xp: 7100,  name: "Senior Research Coordinator", abbr: "SCR", reward: { theme: "sumi" } },
  { n: 8,  xp: 9000,  name: "Lab Manager",              abbr: "MGR",  reward: { tokens: 50 } },
  { n: 9,  xp: 11100, name: "Senior Lab Manager",       abbr: "SLM",  reward: { bgStripe: "lattice" } },
  { n: 10, xp: 13400, name: "Chief Technician",         abbr: "CHT",  reward: { theme: "terminal" } },
  { n: 11, xp: 15900, name: "Director of Operations",   abbr: "DOP",  reward: { tokens: 150 } },
  { n: 12, xp: 18600, name: "Master Technician",        abbr: "MTC",  reward: { tokens: 75 } },
  { n: 13, xp: 21500, name: "Principal Investigator",   abbr: "PI",   reward: { theme: "koi" } },
  { n: 14, xp: 24700, name: "Postdoctoral Researcher",  abbr: "PDR",  reward: { bgStripe: "origami" } },
  { n: 15, xp: 28200, name: "Project Lead",             abbr: "PL",   reward: { tokens: 200 } },
  { n: 16, xp: 32000, name: "Lead Investigator",        abbr: "LI",   reward: { theme: "ronin" } },
  { n: 17, xp: 36100, name: "Program Director",         abbr: "PD",   reward: { tokens: 100 } },
  { n: 18, xp: 40500, name: "Senior Program Director",  abbr: "SPD",  reward: { tokens: 120 } },
  { n: 19, xp: 45100, name: "Vice President of R&D",    abbr: "VP",   reward: { theme: "fuji" } },
  { n: 20, xp: 50000, name: "Nobel Laureate",           abbr: "NL",   reward: { theme: "kirigami" } }
];

// Empty since the life-sim (the last thing that used a feature gate —
// vitals, the life shop, the Story tab before it) was removed. Kept as
// infra: hasFeature/featureRank stay generic so a future rank-gated
// feature has somewhere to register without re-deriving this plumbing.
const FEATURES = {};

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

  // Visual tier, not a gameplay one — four even 5-rank bands so the
  // ladder reads as a progression at a glance (basic -> mid -> elite ->
  // legendary), same convention most game rank ladders use. Purely
  // cosmetic: nothing about XP math, rewards, or unlocks reads this.
  function rankTier(n) {
    if (n <= 5) return "basic";
    if (n <= 10) return "mid";
    if (n <= 15) return "elite";
    return "legendary";
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

  // Same pattern as the theme pair above, for the background-stripe
  // rewards — a separate axis from themes, unlocked earlier on purpose.
  function unlockedBgStripes(xp) {
    return new Set(
      RANKS.filter(r => xp >= r.xp && r.reward && r.reward.bgStripe).map(r => r.reward.bgStripe)
    );
  }

  function bgStripeRank(id) {
    return RANKS.find(r => r.reward && r.reward.bgStripe === id) || null;
  }

  // `reward: { tokens: N } is deliberately NOT read the same way as
  // theme/bgStripe above. Those are permanent access flags, safe to
  // re-derive from XP on every call. Tokens are spendable — crediting
  // them from a membership scan would re-grant the same Tokens every
  // time this function runs. Instead they're granted exactly once, at
  // the moment core/hud.js's checkRankUp crosses that rank (see the
  // "rank:up" Bus listener in core/boot.js) — event-driven, not
  // recomputed from current state.

  Dojo.Ranks = { RANKS, FEATURES, rankFor, nextRank, progress, rankTier, unlockedThemes, themeRank,
                 unlockedBgStripes, bgStripeRank,
                 hasFeature, featureRank, insigniaSvg };
})();
