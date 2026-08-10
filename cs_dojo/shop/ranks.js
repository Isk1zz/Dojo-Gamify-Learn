// ================================================
// CS Dojo — RANKS (pure data + lookup)
// ------------------------------------------------
// XP is earned by studying and never spent. Rank is what it buys, and
// rank is what hands out rewards. No prices, no balance, no sink.
//
// ---- How the ladder was sized ----
//
// The ceiling is 5,000 XP at General, and the 18 rungs below it are
// spread so the gaps widen smoothly (60, 90, 110 ... 460, 490).
//
//   15 min  ~= 5 chunks
//   1 chunk  = 5-7 XP, so ~30 XP on a normal day
//
// At that pace: Captain around day 107, Major around day 120, General
// around day 167. A 5,000 ceiling is a LONGER ladder than the original
// 120-day brief — finishing it in 120 days needs ~42 XP/day, closer to
// 20 minutes than 15. That is a fine trade (running out of ladder is
// worse than having some left), but it is a trade, so it is written
// down here rather than left as a surprise.
//
// Gaps widen deliberately: early ranks land fast enough to feel like
// something is happening, late ones slowly enough that General means
// something.
//
// If the XP per chunk changes, re-check this comment — it is the only
// place the 15-min assumption is written down.
//
// ---- Rewards ----
// `reward: null` is a deliberate blank, not an oversight. Ranks without
// a reward still rank up and still show on the ladder; fill them in as
// there is something worth giving.
// ================================================

const RANKS = [
  { n: 1,  xp: 0,    name: "Recruit",                 abbr: "RCT",  reward: null },
  { n: 2,  xp: 60,   name: "Private",                 abbr: "PVT",  reward: null },
  { n: 3,  xp: 150,  name: "Private First Class",     abbr: "PFC",  reward: null },
  { n: 4,  xp: 260,  name: "Specialist",              abbr: "SPC",  reward: { theme: "sakura" } },
  { n: 5,  xp: 390,  name: "Corporal",                abbr: "CPL",  reward: null },
  { n: 6,  xp: 540,  name: "Sergeant",                abbr: "SGT",  reward: null },
  { n: 7,  xp: 710,  name: "Staff Sergeant",          abbr: "SSG",  reward: { theme: "sumi" } },
  { n: 8,  xp: 900,  name: "Sergeant First Class",    abbr: "SFC",  reward: null },
  { n: 9,  xp: 1110, name: "Master Sergeant",         abbr: "MSG",  reward: null },
  { n: 10, xp: 1340, name: "First Sergeant",          abbr: "1SG",  reward: { theme: "terminal" } },
  { n: 11, xp: 1590, name: "Sergeant Major",          abbr: "SGM",  reward: null },
  { n: 12, xp: 1860, name: "Command Sergeant Major",  abbr: "CSM",  reward: null },
  { n: 13, xp: 2150, name: "Warrant Officer",         abbr: "WO",   reward: { theme: "koi" } },
  { n: 14, xp: 2470, name: "Second Lieutenant",       abbr: "2LT",  reward: null },
  { n: 15, xp: 2820, name: "First Lieutenant",        abbr: "1LT",  reward: null },
  { n: 16, xp: 3200, name: "Captain",                 abbr: "CPT",  reward: { theme: "ronin" } },
  { n: 17, xp: 3610, name: "Major",                   abbr: "MAJ",  reward: null },
  { n: 18, xp: 4050, name: "Lieutenant Colonel",      abbr: "LTC",  reward: null },
  { n: 19, xp: 4510, name: "Colonel",                 abbr: "COL",  reward: { theme: "fuji" } },
  { n: 20, xp: 5000, name: "General",                 abbr: "GEN",  reward: null }
];

(() => {
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

  Dojo.Ranks = { RANKS, rankFor, nextRank, progress, unlockedThemes, themeRank };
})();
