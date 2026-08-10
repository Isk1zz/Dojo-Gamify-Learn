// ================================================
// CS Dojo — ARCADE (games + story)
// ------------------------------------------------
// SKELETON. The shell, the gating and the payout seam are here.
// The three games themselves are NOT implemented yet — each one
// gets its own file in this folder (crash.js, hilo.js, blackjack.js)
// and registers itself with Games.register().
//
// The gate is the important part and it is already enforced:
//   - 1 ticket per round. 2 tickets per 6h, ceiling 2.
//   - 10 energy per round on top of the ticket.
//   - stake is capped at MAX_STAKE and at the current wallet.
// A round cannot start unless DB.spendTicket() AND DB.spendEnergy()
// both succeed. Never let a game call DB.addMoney() directly for a
// payout — go through settle(), so every payout is logged in one place.
//
// The Arcade screen has two tabs: Games and Story. story/ registers
// itself here at load via Arcade.registerTab, so it stays a separate
// folder you can work on alone while sharing one screen and one gate.
//
// Emits: wallet:changed, arcade:round
// ================================================

(() => {
  const Bus = Dojo.Bus;
  const showScreen = Dojo.showScreen;

  const MAX_STAKE = 50;

  // ---- Unlock prices ----
  // Bought once, with MONEY, and stored in the inventory as
  // "game_<id>". Same coin as food and shelter — an unlock is another
  // thing you save up for, and the ladder is steep enough that the
  // Garden has to carry you there. Charge can never buy one.
  const UNLOCK_PRICE = { crash: 75, hilo: 150, blackjack: 300 };

  const unlockKey = id => `game_${id}`;
  function isUnlocked(id) { return DB.getInventory().includes(unlockKey(id)); }

  // Returns true only if the money actually left the wallet.
  function unlockGame(id) {
    const price = UNLOCK_PRICE[id];
    if (price == null || isUnlocked(id)) return false;
    if (!DB.spendMoney(price)) return false;
    DB.addInventory(unlockKey(id));
    Bus.emit("wallet:changed", { delta: -price, reason: "game-unlock" });
    return true;
  }

  // Registry — a game file calls Games.register({...}) at load.
  // { id, name, tagline, icon, mount(container, api) }
  const games = [];

  function register(game) { games.push(game); }

  // The ONLY way a game is allowed to take a stake.
  // Returns null if the round can't start, and takes nothing in that case.
  function beginRound(stake, gameId) {
    // Too weak to play. The Library is never gated this way — only the
    // optional systems are. See shop/life.js.
    if (Dojo.LifeShop && Dojo.LifeShop.isWeak()) return null;
    if (gameId && !isUnlocked(gameId)) return null;
    const s = Math.floor(Number(stake) || 0);
    if (s <= 0 || s > MAX_STAKE) return null;
    if (DB.getWallet() < s) return null;
    if (DB.getTickets() < 1) return null;
    if (!DB.spendMoney(s)) return null;
    if (!DB.spendTicket()) { DB.addMoney(s); return null; }
    if (Dojo.LifeShop) Dojo.LifeShop.cost("arcade");
    Bus.emit("wallet:changed", { delta: -s, reason: "stake" });
    return { stake: s, gameId: gameId || null };
  }

  // The ONLY way a game is allowed to pay out. `payout` is the total
  // returned to the player including their stake — 0 means a loss.
  function settle(round, payout, meta) {
    const amount = Math.max(0, Math.floor(payout || 0));
    if (amount > 0) DB.addMoney(amount);
    Bus.emit("wallet:changed", { delta: amount, reason: "arcade" });
    Bus.emit("arcade:round", { stake: round.stake, payout: amount, ...meta });
    return amount;
  }

  // Extra money into a live round (Blackjack's double down). Same rule
  // as beginRound: money only ever leaves the wallet through this file.
  function raise(round, amount) {
    const a = Math.floor(Number(amount) || 0);
    if (!round || a <= 0) return false;
    if (!DB.spendMoney(a)) return false;
    round.stake += a;
    Bus.emit("wallet:changed", { delta: -a, reason: "raise" });
    return true;
  }

  function canPlay() {
    if (Dojo.LifeShop && Dojo.LifeShop.isWeak()) return false;
    return DB.getTickets() >= 1;
  }

  // ---- Tabs ----
  // Another branch adds a tab instead of taking its own lobby slot:
  //   Arcade.registerTab({ id, label, render(body) })
  const tabs = [{ id: "games", label: "\u{1F3B0} Games", render: renderGamesTab }];
  function registerTab(tab) { if (!tabs.some(t => t.id === tab.id)) tabs.push(tab); }

  function fmtWait(ms) {
    // Round to whole minutes FIRST, then split — otherwise a ceil on the
    // remainder can produce "23h 60m".
    const mins = Math.ceil(ms / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  function gamesSummary() {
    const t = DB.getTickets();
    if (Dojo.LifeShop && Dojo.LifeShop.isWeak()) return Dojo.LifeShop.weakReason();
    if (!games.length) return "Games not built yet \u00b7 Story inside";
    if (!games.some(g => isUnlocked(g.id))) {
      return `$${DB.getWallet()} \u00b7 unlock a game from $${UNLOCK_PRICE.crash}`;
    }
    return t
      ? `${t} ticket${t === 1 ? "" : "s"} \u00b7 $${DB.getWallet()} in the wallet`
      : `No tickets \u00b7 next in ${fmtWait(DB.msUntilNextTicket())}`;
  }

  function renderGames(tab) {
    const root = document.getElementById("games-body");
    if (!root) return;
    const active = tabs.some(t => t.id === tab) ? tab : "games";
    root.innerHTML = `
      <div class="tab-row">
        ${tabs.map(t => `<button class="tab-btn${t.id === active ? " active" : ""}" data-tab="${t.id}">${t.label}</button>`).join("")}
      </div>
      <div id="arcade-tab-body"></div>`;
    root.querySelectorAll(".tab-btn").forEach(b =>
      b.addEventListener("click", () => renderGames(b.getAttribute("data-tab"))));
    (tabs.find(t => t.id === active) || tabs[0]).render(document.getElementById("arcade-tab-body"));
    showScreen("games");
  }

  function renderGamesTab(body) {
    if (!body) return;
    const tickets = DB.getTickets();

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">$${DB.getWallet()}</div>
        <div class="sw-meta">
          \u{1F3AB} ${tickets}/${DB.constants().TICKET_MAX} tickets
          ${tickets < DB.constants().TICKET_MAX ? `\u00b7 next in ${fmtWait(DB.msUntilNextTicket())}` : ""}
        </div>
        ${Dojo.LifeShop && Dojo.LifeShop.weakReason()
          ? `<div class="vitals-warn">\u26A0 ${Dojo.LifeShop.weakReason()} \u2014 the Arcade is shut. Buy something in the Shop.</div>`
          : ""}
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          One ticket a round, stakes capped at $${MAX_STAKE}, seven tickets every six hours.
          That ceiling is the whole brake \u2014 the arcade is a break, not an income.
        </p>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3B0} Arcade</div>
        <div class="shop-grid" id="games-grid"></div>
      </div>`;

    const grid = body.querySelector("#games-grid");
    const planned = [
      { id: "crash",     icon: "\u{1F4C8}", name: "Crash",     tagline: "Cash out before the curve breaks" },
      { id: "hilo",      icon: "\u{1F0CF}", name: "Hi-Lo",     tagline: "Higher or lower than the card shown" },
      { id: "blackjack", icon: "\u{1F0A1}", name: "Blackjack", tagline: "Classic 21, dealer stands on 17" }
    ];

    planned.forEach(g => {
      const built = games.find(x => x.id === g.id);
      const owned = isUnlocked(g.id);
      const price = UNLOCK_PRICE[g.id];
      const afford = DB.getWallet() >= price;

      const card = document.createElement("div");
      card.className = `shop-card${built ? "" : " soon"}${owned ? " owned" : ""}`;

      let action;
      if (!built) {
        action = `<div class="shop-price soon-tag">Not built yet</div>`;
      } else if (!owned) {
        action = `<button class="shop-btn buy${afford ? "" : " short"}" data-act="unlock" ${afford ? "" : "disabled"}>
                    Unlock $${price}${afford ? "" : ` \u00b7 need $${price - DB.getWallet()} more`}
                  </button>`;
      } else {
        action = `<button class="shop-btn ${canPlay() ? "equip" : "short"}" data-act="play" ${canPlay() ? "" : "disabled"}>
                    ${canPlay() ? "Play" : "No tickets"}
                  </button>`;
      }

      card.innerHTML = `
        <div class="shop-card-preview game-preview"><span class="gp-icon">${g.icon}</span></div>
        <div class="shop-card-body">
          <div class="shop-name">${g.name}</div>
          <div class="shop-tagline">${owned || !built ? g.tagline : `${g.tagline} \u2014 one-off unlock`}</div>
          ${action}
        </div>`;

      const btn = card.querySelector("button");
      if (btn && !btn.disabled) {
        btn.addEventListener("click", () => {
          if (btn.getAttribute("data-act") === "unlock") {
            if (unlockGame(g.id)) { if (Dojo.renderVitals) Dojo.renderVitals(); renderGames("games"); }
            return;
          }
          built.mount(body, { beginRound, settle, raise, MAX_STAKE, renderGames, gameId: g.id });
        });
      }
      grid.appendChild(card);
    });
  }

  Dojo.Games = { register, beginRound, settle, raise, canPlay, isUnlocked, unlockGame,
                 UNLOCK_PRICE, MAX_STAKE };
  Dojo.Arcade = Dojo.Games;
  Dojo.Arcade.registerTab = registerTab;
  Object.assign(Dojo, { renderGames, gamesSummary });
})();
