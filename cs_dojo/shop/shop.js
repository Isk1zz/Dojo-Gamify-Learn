// ================================================
// CS Dojo — SHOP
// ------------------------------------------------
// The sink for lightning charge. Cosmetic goods only — nothing here
// buys progress, hints, retries or exam advantage, because the whole
// learning argument falls over if grinding is the shortest path to a
// passing score. Life-shop consumables (v5) live in shop/life.js.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const PREMIUM_THEMES = Dojo.PREMIUM_THEMES;
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const Bus = Dojo.Bus;
  const applyTheme = (...a) => Dojo.applyTheme(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);

  // ---- Shop ----
  // This is the sink the charge system was missing. Before it, the cap
  // was reached about four topics into a 26-topic course and the bar
  // stopped meaning anything for the remaining 22. Spending frees room
  // to earn again, so the bar keeps moving for the whole course.
  //
  // Deliberately cosmetic only. Nothing here buys progress, hints,
  // retries or exam advantages — that would turn a study app into a
  // game where the shortest path to a passing score is grinding, and
  // the whole design argument (§5 of PROJECT.md) is against that.
  // ---- Inventory ----
  //
  // Was the Shop. Nothing here is bought any more: themes arrive with a
  // RANK, so this screen shows what you have, what is coming, and what
  // it takes to get there. Money and life goods live on the Story tab.
  //
  // The rank ladder is the honest version of a rewards list — you can
  // see every rung, including the ones with nothing attached yet.
  function renderShop() {
    const body = document.getElementById("shop-body");
    const xp = DB.getXp();
    const R = Dojo.Ranks;
    const prog = R.progress(xp);
    const unlocked = R.unlockedThemes(xp);
    const current = DB.getTheme();

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="rank-now">
          <span class="rank-badge">${prog.cur.abbr}</span>
          <span>
            <span class="rank-name">${prog.cur.name}</span>
            <span class="sw-meta">${xp} XP total${prog.next
              ? ` \u00b7 ${prog.toGo} to ${prog.next.name}` : " \u00b7 top of the ladder"}</span>
          </span>
        </div>
        <div class="v-track wide" style="margin-top:0.7rem;"><span class="v-fill" style="width:${prog.pct}%"></span></div>
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          XP comes from finishing chunks and passing exams, and is never spent.
          Rewards arrive when you reach the rank \u2014 there is nothing to buy.
        </p>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3A8} Themes</div>
        <div class="shop-grid" id="shop-grid"></div>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F396} Ranks</div>
        <div class="rank-ladder" id="rank-ladder"></div>
      </div>`;

    // ---- Themes ----
    const grid = body.querySelector("#shop-grid");
    PREMIUM_THEMES.forEach(t => {
      const owned = unlocked.has(t.id) || DB.ownsTheme(t.id);
      const equipped = owned && current === t.id;
      const at = R.themeRank(t.id);

      const card = document.createElement("div");
      card.className = `shop-card${owned ? " owned" : " locked"}`;
      card.innerHTML = `
        <div class="shop-card-preview" style="background:${t.deep};">
          <div class="scp-bg" style="background:${t.bg};"></div>
          <div class="scp-chip" style="background:${t.card};border-color:${t.accent};">
            <span class="scp-dot" style="background:${t.accent};box-shadow:0 0 10px ${t.accent};"></span>
            <span class="scp-line" style="background:${t.light};"></span>
          </div>
          <div class="scp-bar"><div class="scp-fill" style="background:linear-gradient(90deg,${t.bolt[0]},${t.bolt[1]},${t.bolt[2]});"></div></div>
          ${owned ? "" : `<div class="scp-lock">\u{1F512}</div>`}
        </div>
        <div class="shop-card-body">
          <div class="shop-name">${t.name}</div>
          <div class="shop-tagline">${owned ? t.tagline : at ? `Awarded at ${at.name}` : "Not awarded yet"}</div>
          ${owned
            ? `<button class="shop-btn ${equipped ? "equipped" : "equip"}" ${equipped ? "disabled" : ""}>
                 ${equipped ? "\u2713 Equipped" : "Equip"}</button>`
            : `<div class="shop-price soon-tag">${at ? `${Math.max(0, at.xp - xp)} XP to go` : "\u2014"}</div>`}
        </div>`;

      const btn = card.querySelector("button");
      if (btn && !btn.disabled) {
        btn.addEventListener("click", () => {
          DB.setTheme(t.id);
          applyTheme(t.id);
          renderCharge();
          renderShop();
        });
      }
      grid.appendChild(card);
    });

    // ---- Rank ladder ----
    const ladder = body.querySelector("#rank-ladder");
    R.RANKS.forEach(r => {
      const reached = xp >= r.xp;
      const isNow = r.n === prog.cur.n;
      const theme = r.reward && r.reward.theme
        ? (PREMIUM_THEMES.find(t => t.id === r.reward.theme) || {}).name
        : null;

      const row = document.createElement("div");
      row.className = `rank-row${reached ? " reached" : ""}${isNow ? " now" : ""}`;
      row.innerHTML = `
        <span class="rr-badge">${r.abbr}</span>
        <span class="rr-name">${r.name}</span>
        <span class="rr-xp">${r.xp} XP</span>
        <span class="rr-reward">${theme
          ? `\u{1F3A8} ${theme}`
          : `<span class="rr-blank">\u2014</span>`}</span>`;
      ladder.appendChild(row);
    });

    showScreen("shop");
  }

  function shopSummary() {
    const prog = Dojo.Ranks.progress(DB.getXp());
    return prog.next
      ? `${prog.cur.name} \u00b7 ${prog.toGo} XP to ${prog.next.name}`
      : `${prog.cur.name} \u00b7 top of the ladder`;
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { renderShop, shopSummary });
})();
