// ================================================
// CS Dojo — SHOP / tokens
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
// manifest (library/content/registry.js defaults it to 0 = free). No
// course does today — intro-cs stays free — so nothing currently gated
// changes; this is the machinery for the day a second, paid course
// exists. Ownership is stored the same way Arcade game unlocks and
// stake-cap tiers are (a string in DB's generic inventory array), not a
// bespoke profile field.
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
  const TOKEN_PACKS = [
    { id: "small",  tokens: 350,  price: 6.99,  priceLabel: "$6.99" },
    { id: "medium", tokens: 654,  price: 11.99, priceLabel: "$11.99" },
    { id: "large",  tokens: 1234, price: 20.99, priceLabel: "$20.99" },
    { id: "bigger", tokens: 2345, price: 37.99, priceLabel: "$37.99" },
    { id: "best",   tokens: 5000, price: 67.99, priceLabel: "$67.99" }
  ];

  // Bonus % vs. the smallest pack's tokens-per-dollar rate — the
  // baseline everything else is judged against, same "smallest pack
  // sets the floor" logic a mobile-game shop's bonus badges use.
  const BASE_RATE = TOKEN_PACKS[0].tokens / TOKEN_PACKS[0].price;
  function bonusPct(pack) {
    return Math.round(((pack.tokens / pack.price) / BASE_RATE - 1) * 100);
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
    if (!DB.spendTokens(c.priceTokens)) return false;
    DB.addInventory(courseKey(courseId));
    Dojo.Bus.emit("tokens:changed", { delta: -c.priceTokens, reason: "course-buy" });
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

  function renderTokenShop() {
    const body = document.getElementById("token-shop-body");
    if (!body) return;

    const pricedCourses = COURSES.filter(c => c.priceTokens > 0);

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">🪙 ${DB.getTokens()}</div>
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          Buying is a DEMO right now — packs credit instantly, no real
          payment happens yet. Real checkout arrives once this becomes a
          real product (see the long-term roadmap in the project notes).
        </p>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">🪙 Token Packs</div>
        <div class="shop-grid" id="token-packs-grid"></div>
      </div>
      ${pricedCourses.length ? `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F4DA} Priced Courses</div>
        <div class="shop-grid" id="token-courses-grid"></div>
      </div>` : ""}
    `;

    const packGrid = body.querySelector("#token-packs-grid");
    TOKEN_PACKS.forEach(pack => {
      const bonus = bonusPct(pack);
      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `
        <div class="shop-card-preview game-preview">
          <span class="gp-icon">🪙</span>
          ${bonus > 0 ? `<span class="pack-bonus-badge">+${bonus}%</span>` : ""}
        </div>
        <div class="shop-card-body">
          <div class="shop-name">${pack.tokens} Tokens</div>
          <div class="shop-tagline">${bonus > 0 ? `${bonus}% more per $ than the smallest pack` : "Demo purchase — no real payment"}</div>
          <button class="shop-btn buy" data-pack="${pack.id}">${pack.priceLabel} (demo)</button>
        </div>`;
      card.querySelector("button").addEventListener("click", () => {
        if (buyPack(pack.id)) renderTokenShop();
      });
      packGrid.appendChild(card);
    });

    if (pricedCourses.length) {
      const courseGrid = body.querySelector("#token-courses-grid");
      pricedCourses.forEach(c => {
        const owned = ownsCourse(c.id);
        const afford = DB.getTokens() >= c.priceTokens;
        const card = document.createElement("div");
        card.className = `shop-card${owned ? " owned" : ""}`;
        card.innerHTML = `
          <div class="shop-card-preview game-preview"><span class="gp-icon">${c.icon}</span></div>
          <div class="shop-card-body">
            <div class="shop-name">${c.title}</div>
            <div class="shop-tagline">${c.subtitle}</div>
            ${owned
              ? `<div class="shop-price">Owned</div>`
              : `<button class="shop-btn buy${afford ? "" : " short"}" ${afford ? "" : "disabled"}>
                   Unlock 🪙 ${c.priceTokens}${afford ? "" : ` · need ${c.priceTokens - DB.getTokens()} more`}
                 </button>`}
          </div>`;
        const btn = card.querySelector("button");
        if (btn && !btn.disabled) {
          btn.addEventListener("click", () => { if (buyCourse(c.id)) renderTokenShop(); });
        }
        courseGrid.appendChild(card);
      });
    }

    showScreen("token-shop");
  }

  Object.assign(Dojo, { renderTokenShop, ownsCourse });
})();
