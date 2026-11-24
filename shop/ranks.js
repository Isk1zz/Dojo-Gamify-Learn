// ================================================
// Knell — RANKS (pure data + lookup)
// ------------------------------------------------
// XP is earned by studying and never spent. Rank is what it buys, and
// rank is what hands out rewards. No prices, no balance, no sink.
//
// ---- How the ladder was sized ----
//
// The ceiling is 100,000 XP at Nobel Laureate — doubled again from
// 50,000 by explicit request, this time sized against a deliberately
// LONG-TERM content target rather than what exists today: one full
// course completion (141 chunks, every topic exam, the Final Quiz)
// nets ~6,870 XP at a realistic ~90% average score, so 100,000 lands
// at ~14.6 courses' worth of content — "about 15 courses" to call
// someone a Nobel Laureate, the explicit target this ceiling was
// picked to hit. With exactly one course existing today, that's an
// aspirational multi-year target, not a near-term one — deliberately;
// see library.js's REVIEW_XP_PER_CARD for the other half of why that's
// sustainable rather than just a wall (review pays properly now, so
// the climb doesn't stall once the one course is exhausted). The GAPS
// still widen the same way relative to each other, just scaled up
// 2x again along with everything else.
//
//   15 min  ~= 5 chunks
//   1 chunk  = 5-7 XP, so ~30 XP on a normal NEW-content day
//
// At a flat 30 XP/day of pure new content, Nobel Laureate lands around
// day 3,333 (~9 years) — but that number assumes nobody ever reviews
// and nothing new ever ships, neither of which is the real scenario:
// review pays properly now (see library.js's REVIEW_XP_PER_CARD), and
// every additional course shipped is 3x denser XP/day than review-only
// income at the same daily time, so real day-counts drop substantially
// as more courses launch. This ceiling was chosen for where the
// content roadmap is headed, not for the one course that exists today.
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
// 100+50+75+200+120 = 545 free Tokens across the ladder, over five
// ranks. The figure said 795 across seven until 2026-09-02: two rewards
// were removed from the array below and the sum was never corrected.
// Paid by the SERVER now (migration 0016), which re-derives the
// entitlement from charge_earned rather than trusting the rank in the
// request. Change a number here and 0016 must change with it.
// Originally sized to stay under the course price so ranking up alone
// could never fully cover one — that constraint no longer holds now
// that intro-cs dropped from 1000 to 250, and again to 100 (barrier-
// to-entry calls, see BACKLOG.md): 795 clears 100 nearly 8x over, so a
// profile CAN reach the one course that exists purely by studying, no
// purchase ever required, with a lot of room to spare. Left as-is
// deliberately — a free path into the one course that exists isn't a
// leak to plug, it's the accessible-entry point the price drops were
// for. Re-check this math once a second, differently-priced course
// exists, since 795 stretches a lot further than it used to.
// ================================================

const RANKS = I18N.resolve([
  { n: 1,  xp: 0,      name: { en: "Lab Intern", ru: "Стажёр лаборатории", he: "מתמחה במעבדה" },               abbr: { en: "INT", ru: "СТЖ", he: "מת״מ" },  reward: { bgStripe: "diagonal" } },
  { n: 2,  xp: 1200,   name: { en: "Research Assistant I", ru: "Лаборант-исследователь I", he: "עוזר מחקר א׳" },     abbr: { en: "RA1", ru: "ЛИ1", he: "ע״מ1" },  reward: { bgStripe: "crosshatch" } },
  { n: 3,  xp: 3000,   name: { en: "Research Assistant II", ru: "Лаборант-исследователь II", he: "עוזר מחקר ב׳" },    abbr: { en: "RA2", ru: "ЛИ2", he: "ע״מ2" },  reward: { bgStripe: "herringbone" } },
  { n: 4,  xp: 5200,   name: { en: "Lab Technician", ru: "Техник лаборатории", he: "טכנאי מעבדה" },           abbr: { en: "TCH", ru: "ТЕХ", he: "ט״מ" },  reward: { theme: "sakura" } },
  { n: 5,  xp: 7800,   name: { en: "Shift Supervisor", ru: "Начальник смены", he: "אחראי משמרת" },         abbr: { en: "SUP", ru: "НСМ", he: "אחמ״ש" },  reward: { theme: "paper" } },
  { n: 6,  xp: 10800,  name: { en: "Research Coordinator", ru: "Координатор исследований", he: "רכז מחקר" },     abbr: { en: "CRD", ru: "КРД", he: "ר״מ" },  reward: { tokens: 100 } },
  { n: 7,  xp: 14200,  name: { en: "Senior Research Coordinator", ru: "Старший координатор исследований", he: "רכז מחקר בכיר" }, abbr: { en: "SCR", ru: "СКР", he: "רמ״ב" }, reward: { theme: "sumi" } },
  { n: 8,  xp: 18000,  name: { en: "Lab Manager", ru: "Заведующий лабораторией", he: "מנהל מעבדה" },              abbr: { en: "MGR", ru: "ЗАВ", he: "מנ״מ" },  reward: { tokens: 50 } },
  { n: 9,  xp: 22200,  name: { en: "Senior Lab Manager", ru: "Старший заведующий лабораторией", he: "מנהל מעבדה בכיר" },       abbr: { en: "SLM", ru: "СЗЛ", he: "מנמ״ב" },  reward: { bgStripe: "lattice" } },
  { n: 10, xp: 26800,  name: { en: "Chief Technician", ru: "Главный техник", he: "טכנאי ראשי" },         abbr: { en: "CHT", ru: "ГТХ", he: "ט״ר" },  reward: { theme: "terminal" } },
  { n: 11, xp: 31800,  name: { en: "Director of Operations", ru: "Директор по операциям", he: "מנהל תפעול" },   abbr: { en: "DOP", ru: "ДПО", he: "מנ״ת" },  reward: { bgStripe: "trellis" } },
  { n: 12, xp: 37200,  name: { en: "Master Technician", ru: "Мастер-техник", he: "טכנאי־אמן" },        abbr: { en: "MTC", ru: "МТХ", he: "ט״א" },  reward: { tokens: 75 } },
  { n: 13, xp: 43000,  name: { en: "Principal Investigator", ru: "Руководитель исследования", he: "חוקר ראשי" },   abbr: { en: "PI", ru: "РИС", he: "ח״ר" },   reward: { theme: "koi" } },
  { n: 14, xp: 49400,  name: { en: "Postdoctoral Researcher", ru: "Научный сотрудник, постдок", he: "חוקר בתר־דוקטורט" },  abbr: { en: "PDR", ru: "НСП", he: "בת״ד" },  reward: { bgStripe: "origami" } },
  { n: 15, xp: 56400,  name: { en: "Project Lead", ru: "Руководитель проекта", he: "ראש פרויקט" },             abbr: { en: "PL", ru: "РПР", he: "ר״פ" },   reward: { tokens: 200 } },
  { n: 16, xp: 64000,  name: { en: "Lead Investigator", ru: "Ведущий исследователь", he: "חוקר מוביל" },        abbr: { en: "LI", ru: "ВИС", he: "ח״מ" },   reward: { theme: "ronin" } },
  { n: 17, xp: 72200,  name: { en: "Program Director", ru: "Директор программы", he: "מנהל תוכנית" },         abbr: { en: "PD", ru: "ДПР", he: "מ״ת" },   reward: { bgStripe: "sunburst" } },
  { n: 18, xp: 81000,  name: { en: "Senior Program Director", ru: "Старший директор программы", he: "מנהל תוכנית בכיר" },  abbr: { en: "SPD", ru: "СДП", he: "מת״ב" },  reward: { tokens: 120 } },
  { n: 19, xp: 90200,  name: { en: "Vice President of R&D", ru: "Вице-президент по разработке", he: "סמנכ״ל מחקר ופיתוח" },    abbr: { en: "VP", ru: "ВПР", he: "סמנכ״ל" },   reward: { theme: "fuji" } },
  { n: 20, xp: 100000, name: { en: "Nobel Laureate", ru: "Нобелевский лауреат", he: "זוכה פרס נובל" },           abbr: { en: "NL", ru: "НЛ", he: "נובל" },   reward: { theme: "kirigami" } }
]);

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
//
// Keyed by rank NUMBER, in ladder order (the comment after each is the
// English abbreviation). It was keyed by abbreviation, but the
// abbreviation is translated (СТЖ, מת״מ), so outside English the lookup
// found nothing and the HUD showed an empty frame.
const RANK_EMOJI = [
  "\u{1F393}" /* INT */, "\u{1F9EB}" /* RA1 */, "\u{1F9EA}" /* RA2 */, "\u{1F52C}" /* TCH */,
  "\u{1F4CB}" /* SUP */, "\u{1F4CA}" /* CRD */, "\u{1F4C8}" /* SCR */, "\u{1F5C2}\u{FE0F}" /* MGR */,
  "\u{2697}\u{FE0F}" /* SLM */, "\u{1F9F0}" /* CHT */, "\u{1F9ED}" /* DOP */, "\u{1F6E0}\u{FE0F}" /* MTC */,
  "\u{1F52D}" /* PI */, "\u{1F4DA}" /* PDR */, "\u{1F4D0}" /* PL */, "\u{1F9EC}" /* LI */,
  "\u{1F9E0}" /* PD */, "\u{1F4E1}" /* SPD */, "\u{269B}\u{FE0F}" /* VP */, "\u{1F3C5}" /* NL */
];

// Small badge-shaped SVG (rounded rect backdrop + this rank's emoji)
// sized to sit inline in the HUD chip. `rank` is a RANKS entry.
function insigniaSvg(rank) {
  const emoji = RANK_EMOJI[rank.n - 1] || "";
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
