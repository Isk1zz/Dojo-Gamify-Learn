// ================================================
// Knell — SHOP / tokens
// ------------------------------------------------
// A SECOND, separate currency from $ money — Tokens buy Library courses,
// money buys Arcade/Garden things. Same "two currencies, deliberately
// separate" rule SHOP.md documents for XP vs money; see data/db.js's
// getTokens/addTokens/spendTokens comment.
//
// Named Tokens, not Stars — ⭐ was already the XP glyph (rank chip, the
// "+N XP" fly-bolt) before this currency existed. Renamed before it
// ever shipped past one session rather than leave two unrelated things
// sharing a symbol.
//
// ---- Where Tokens come from ----
//   - Free: a handful of rank-up rewards (shop/ranks.js's `reward:
//     { tokens: N }`), credited once per rank crossed — see
//     core/boot.js's "rank:up" Bus listener.
//   - Bought: real-money packs, below. THIS PART IS A DELIBERATE STUB —
//     see the big comment on buyPack().
//
// ---- Course pricing ----
// A course opts into costing Tokens by setting `priceTokens` in its
// manifest (library/content/registry.js defaults it to 0 = free).
// intro-cs is the one paid course today (100 Tokens, course.js) —
// ownership is stored the same way Arcade game unlocks and stake-cap
// tiers are (a string in DB's generic inventory array), not a bespoke
// profile field.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;

  // ---- Token packs ----
  // Priced against the market (Anki/Udemy's one-time-purchase shape,
  // not Duolingo/Brilliant/Coursera's subscriptions — see the chat that
  // scoped this). Bigger pack, better rate, same psychology every
  // mobile-game currency shop uses. `price` is the numeric $ amount
  // (priceLabel is just its display string) — kept as a real number so
  // the bonus badge below is computed, not hand-typed, and can't drift
  // out of sync with the actual tokens/price the way a hardcoded
  // percentage could.
  //
  // Rebuilt again 2026-08-14, final pass — your exact numbers. Note
  // this is a DIFFERENT shape than the two drafts before it: pack 1
  // (100 Tokens/$3.99, exactly one course) is deliberately the WORST
  // per-token rate in the whole ladder — worse even than the
  // pre-session $6.99/350 pack (50 tokens/$) — while every tier above
  // it gets dramatically better, up to +249% by the top pack. That's a
  // real strategic pivot from the "cheap everywhere, including the
  // biggest pack" version two commits ago — flagged in chat, not
  // silently smoothed over. See bonusPct() for the live-computed %.
  const TOKEN_PACKS = [
    { id: "starter", tokens: 100,  price: 3.99,  priceLabel: "$3.99" },
    { id: "small",   tokens: 250,  price: 5.99,  priceLabel: "$5.99" },
    { id: "medium",  tokens: 700,  price: 11.99, priceLabel: "$11.99" },
    { id: "large",   tokens: 1500, price: 19.99, priceLabel: "$19.99" },
    { id: "best",    tokens: 3500, price: 39.99, priceLabel: "$39.99" }
  ];

  // Bonus % vs. the smallest pack's tokens-per-dollar rate — the
  // baseline everything else is judged against, same "smallest pack
  // sets the floor" logic a mobile-game shop's bonus badges use.
  const BASE_RATE = TOKEN_PACKS[0].tokens / TOKEN_PACKS[0].price;
  function bonusPct(pack) {
    return Math.round(((pack.tokens / pack.price) / BASE_RATE - 1) * 100);
  }

  // ---- Patron tiers ----
  // A "thank you" recognition star, explicitly NOT a real subscription
  // — there is no recurring-billing system here (same demo-stub honesty
  // as TOKEN_PACKS above), so this is framed as "pick the tier that
  // matches what you'd want to give," not an actual monthly charge.
  // Positioning: the app itself stays deliberately cheap (see the
  // 2026-08-14 price cut above) — this exists for people who want to
  // support that staying true for everyone else, not as a paywall.
  // Same star icon at every tier (as asked — "a star of one colour,
  // then a star of a second colour"), recoloured via CSS
  // (.profile-patron-star.tier-N); tier 3 swaps to a distinct icon and
  // a named title ("Contributor") rather than a third star colour, per
  // the ask. A tier can only be raised, never lowered — see
  // `DB.setPatronTier`'s comment.
  // XP multiplier per tier lives in data/db.js's PATRON_XP_MULT (applied
  // in addXp, the one place every XP grant already funnels through) —
  // `xpBonus` here is just the matching display label, kept in sync by
  // hand since it's copy, not logic.
  const PATRON_TIERS = [
    { tier: 1, id: "supporter", label: "Supporter", range: "$5–$10/mo", star: "⭐",
      xpBonus: "+50% XP", desc: "A small thank-you star next to your name, and +50% XP on everything you earn." },
    { tier: 2, id: "patron", label: "Patron", range: "$15–$20/mo", star: "⭐",
      xpBonus: "+75% XP", desc: "A brighter star — you're covering more than just your own seat — and +75% XP." },
    { tier: 3, id: "contributor", label: "Contributor", range: "$25+/mo", star: "🎖️",
      xpBonus: "×2 XP", desc: "The top tier — named as a Contributor, not just another star colour — and double XP." }
  ];

  // Each tier makes courses genuinely cheaper — the "your contribution
  // keeps content cheap" line has to be true of something, or it's just
  // copy. Applied to the price everywhere it is shown AND charged (see
  // coursePrice below), not only on the label.
  const PATRON_COURSE_DISCOUNT = { 0: 0, 1: 0.10, 2: 0.20, 3: 0.30 };
  function courseDiscount() {
    return PATRON_COURSE_DISCOUNT[DB.getPatronTier ? DB.getPatronTier() : 0] || 0;
  }
  function coursePrice(course) {
    const base = (course && course.priceTokens) || 0;
    if (!base) return 0;
    return Math.max(1, Math.round(base * (1 - courseDiscount())));
  }

  function choosePatronTier(tier) {
    return DB.setPatronTier(tier);
  }

  // ---- Course ownership ----
  const courseKey = id => `course_${id}`;
  function ownsCourse(courseId) {
    const c = COURSES.find(x => x.id === courseId);
    if (!c) return false;
    if (!c.priceTokens) return true; // free course — always "owned"
    return DB.getInventory().includes(courseKey(courseId));
  }

  function buyCourse(courseId) {
    const c = COURSES.find(x => x.id === courseId);
    if (!c || !c.priceTokens || ownsCourse(courseId)) return false;
    const price = coursePrice(c);
    if (!DB.spendTokens(price)) return false;
    DB.addInventory(courseKey(courseId));
    Dojo.Bus.emit("tokens:changed", { delta: -price, reason: "course-buy" });
    return true;
  }

  // ---- THE STUB ----
  // No backend exists (static GitHub Pages site), so there is no way to
  // take real money here yet — a real integration needs either Stripe
  // Payment Links (redirect out, trust the return — spoofable with no
  // server to verify against) or native store IAP, which only exists
  // once the iOS/Android port on the roadmap happens. Rather than fake
  // a payment flow, this credits the pack INSTANTLY and says so — an
  // honest placeholder standing in the exact spot the real checkout
  // call goes, not a working purchase. Swap this one function's body
  // for a real Payment Link redirect once there's an account to wire it
  // to; nothing else in the Token economy needs to change.
  function buyPack(packId) {
    const pack = TOKEN_PACKS.find(p => p.id === packId);
    if (!pack) return false;
    DB.addTokens(pack.tokens);
    Dojo.Bus.emit("tokens:changed", { delta: pack.tokens, reason: "pack-demo" });
    return true;
  }

  // Token Shop sells Tokens, full stop — it used to also list every
  // priced course in its own "Priced Courses" section, which meant
  // buying a course was a two-step hunt (get redirected here, then find
  // the right card further down). Buying a course now happens right
  // where it's clicked (library.js's showCourseBuyModal, via the
  // buyCourse/ownsCourse exported below), so this screen only needs to
  // sell what it's named after.
  // ---- Panes for the unified Shop (shop/store.js) ----
  // The store owns the screen and the left-hand category nav; the pack
  // and tier DATA lives here, so it hands back markup rather than
  // letting the store restate prices it doesn't own.
  function tokenPacksPane() {
    return `
      <div class="settings-section">
        <div class="stats-section-title">🪙 Token packs</div>
        <p class="settings-hint">Buying is a DEMO — packs credit instantly, no real payment happens yet.</p>
        <div class="shop-grid">
          ${TOKEN_PACKS.map(pack => {
            const bonus = bonusPct(pack);
            return `
              <div class="shop-card">
                <div class="shop-card-preview game-preview">
                  <span class="gp-icon">🪙</span>
                  ${bonus > 0 ? `<span class="pack-bonus-badge">+${bonus}%</span>` : ""}
                </div>
                <div class="shop-card-body">
                  <div class="shop-name">${pack.tokens} Tokens</div>
                  <div class="shop-tagline">${bonus > 0 ? `${bonus}% more per $ than the smallest pack` : "Demo purchase — no real payment"}</div>
                  <button class="shop-btn buy" data-pack="${pack.id}">${pack.priceLabel} (demo)</button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  function patronPane() {
    const cur = DB.getPatronTier ? DB.getPatronTier() : 0;
    return `
      <div class="settings-section">
        <div class="stats-section-title">💜 Support the Dojo</div>
        <p class="settings-hint">
          Not a subscription and not a paywall — closer to a whip-round. The Dojo is priced to be
          genuinely affordable, and supporters are what keeps it that way for people who can't pay.
          <strong>Every tier makes courses permanently cheaper for you too</strong> — −10% / −20% / −30%
          off every course price, applied wherever it's shown and charged. Plus a star by your name
          and an XP boost. No real billing yet; a tier can only go up.
        </p>
        ${cur ? `<p class="settings-hint"><strong>Your discount: −${Math.round(courseDiscount() * 100)}% on every course.</strong></p>` : ""}
        <div class="shop-grid">
          ${PATRON_TIERS.map(t => {
            const owned = cur >= t.tier;
            return `
              <div class="shop-card">
                <div class="shop-card-preview game-preview">
                  <span class="gp-icon profile-patron-star tier-${t.tier}">${t.star}</span>
                  <span class="pack-bonus-badge">${t.xpBonus}</span>
                  <span class="pack-bonus-badge discount-badge">−${Math.round((PATRON_COURSE_DISCOUNT[t.tier] || 0) * 100)}% courses</span>
                </div>
                <div class="shop-card-body">
                  <div class="shop-name">${t.label}</div>
                  <div class="shop-tagline">${t.range} — ${t.desc}</div>
                  <button class="shop-btn buy" data-tier="${t.tier}" ${owned ? "disabled" : ""}>${owned ? "Current tier" : "Choose (demo)"}</button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  function bindTokenPane(root, rerender) {
    root.querySelectorAll("[data-pack]").forEach(btn => {
      btn.addEventListener("click", () => { if (buyPack(btn.getAttribute("data-pack"))) rerender(); });
    });
    root.querySelectorAll("[data-tier]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (choosePatronTier(parseInt(btn.getAttribute("data-tier"), 10))) {
          rerender();
          if (Dojo.updateProfileBadge) Dojo.updateProfileBadge();
        }
      });
    });
  }

  Object.assign(Dojo, { ownsCourse, buyCourse, PATRON_TIERS, tokenPacksPane, patronPane, bindTokenPane, coursePrice, courseDiscount });
})();
