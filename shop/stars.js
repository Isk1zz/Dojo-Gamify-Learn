// ================================================
// CS Dojo — SHOP / stars
// ------------------------------------------------
// A SECOND, separate currency from $ money — Stars buy Library courses,
// money buys Arcade/Garden things. Same "two currencies, deliberately
// separate" rule SHOP.md documents for XP vs money; see data/db.js's
// getStars/addStars/spendStars comment.
//
// ---- Where Stars come from ----
//   - Free: a handful of rank-up rewards (shop/ranks.js's `reward:
//     { stars: N }`), credited once per rank crossed — see
//     core/boot.js's "rank:up" Bus listener.
//   - Bought: real-money packs, below. THIS PART IS A DELIBERATE STUB —
//     see the big comment on buyPack().
//
// ---- Course pricing ----
// A course opts into costing Stars by setting `priceStars` in its
// manifest (library/content/registry.js defaults it to 0 = free). No
// course does today — intro-cs stays free — so nothing currently gated
// changes; this is the machinery for the day a second, paid course
// exists. Ownership is stored the same way Arcade game unlocks and
// stake-cap tiers are (a string in DB's generic inventory array), not a
// bespoke profile field.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;

  // ---- Star packs ----
  // Priced against the market (Anki/Udemy's one-time-purchase shape,
  // not Duolingo/Brilliant/Coursera's subscriptions — see the chat that
  // scoped this). Bigger pack, better rate, same psychology every
  // mobile-game currency shop uses.
  const STAR_PACKS = [
    { id: "small",  stars: 300,  priceLabel: "$2.99" },
    { id: "medium", stars: 550,  priceLabel: "$4.99" },
    { id: "large",  stars: 1200, priceLabel: "$9.99" },
    { id: "best",   stars: 2600, priceLabel: "$19.99" }
  ];

  // ---- Course ownership ----
  const courseKey = id => `course_${id}`;
  function ownsCourse(courseId) {
    const c = COURSES.find(x => x.id === courseId);
    if (!c) return false;
    if (!c.priceStars) return true; // free course — always "owned"
    return DB.getInventory().includes(courseKey(courseId));
  }

  function buyCourse(courseId) {
    const c = COURSES.find(x => x.id === courseId);
    if (!c || !c.priceStars || ownsCourse(courseId)) return false;
    if (!DB.spendStars(c.priceStars)) return false;
    DB.addInventory(courseKey(courseId));
    Dojo.Bus.emit("stars:changed", { delta: -c.priceStars, reason: "course-buy" });
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
  // to; nothing else in the Star economy needs to change.
  function buyPack(packId) {
    const pack = STAR_PACKS.find(p => p.id === packId);
    if (!pack) return false;
    DB.addStars(pack.stars);
    Dojo.Bus.emit("stars:changed", { delta: pack.stars, reason: "pack-demo" });
    return true;
  }

  function renderStarShop() {
    const body = document.getElementById("star-shop-body");
    if (!body) return;

    const pricedCourses = COURSES.filter(c => c.priceStars > 0);

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">⭐ ${DB.getStars()}</div>
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          Buying is a DEMO right now — packs credit instantly, no real
          payment happens yet. Real checkout arrives once this becomes a
          real product (see the long-term roadmap in the project notes).
        </p>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">⭐ Star Packs</div>
        <div class="shop-grid" id="star-packs-grid"></div>
      </div>
      ${pricedCourses.length ? `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F4DA} Priced Courses</div>
        <div class="shop-grid" id="star-courses-grid"></div>
      </div>` : ""}
    `;

    const packGrid = body.querySelector("#star-packs-grid");
    STAR_PACKS.forEach(pack => {
      const card = document.createElement("div");
      card.className = "shop-card";
      card.innerHTML = `
        <div class="shop-card-preview game-preview"><span class="gp-icon">⭐</span></div>
        <div class="shop-card-body">
          <div class="shop-name">${pack.stars} Stars</div>
          <div class="shop-tagline">Demo purchase — no real payment</div>
          <button class="shop-btn buy" data-pack="${pack.id}">${pack.priceLabel} (demo)</button>
        </div>`;
      card.querySelector("button").addEventListener("click", () => {
        if (buyPack(pack.id)) renderStarShop();
      });
      packGrid.appendChild(card);
    });

    if (pricedCourses.length) {
      const courseGrid = body.querySelector("#star-courses-grid");
      pricedCourses.forEach(c => {
        const owned = ownsCourse(c.id);
        const afford = DB.getStars() >= c.priceStars;
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
                   Unlock ⭐ ${c.priceStars}${afford ? "" : ` · need ${c.priceStars - DB.getStars()} more`}
                 </button>`}
          </div>`;
        const btn = card.querySelector("button");
        if (btn && !btn.disabled) {
          btn.addEventListener("click", () => { if (buyCourse(c.id)) renderStarShop(); });
        }
        courseGrid.appendChild(card);
      });
    }

    showScreen("star-shop");
  }

  Object.assign(Dojo, { renderStarShop, ownsCourse });
})();
