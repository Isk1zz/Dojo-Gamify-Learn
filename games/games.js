// ================================================
// CS Dojo — ARCADE (games + story)
// ------------------------------------------------
// The shell, the gating and the payout seam. Three games are built:
// crash.js, hilo.js and blackjack.js, each in its own file, each
// registering itself with Games.register().
//
// The gate:
//   - 1 ticket per round. 7 tickets per 6h, ceiling 7.
//   - a bite out of vitals per round, via LifeShop.cost("arcade").
//   - stake capped at MAX_STAKE and at the current wallet.
//   - the game must be unlocked.
// Energy was deleted in v6 — it and tickets were two rate limits doing
// the same job. The `energy` field survives in stored profiles because
// migrations never drop fields, but nothing reads it.
//
// Never let a game call DB.addMoney() directly for a payout — go
// through settle(), so every payout is logged in one place.
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
  //
  // The order here is the order the cards appear in.
  const UNLOCK_PRICE = { crash: 75, hilo: 150, mines: 200, blackjack: 300 };

  // ---- Remembered stake ----
  // Every game's box used to reset to 5 after every round, so anyone
  // playing at a steady stake retyped it all evening. Kept here rather
  // than per game so the four boxes agree with each other, and read
  // through stakeDefault() so it can never pre-fill more than the
  // wallet holds — a pre-filled amount you can't afford is worse than
  // a wrong one. Session-only: this deliberately isn't in db.js,
  // because a stake is a mood, not a setting.
  let lastStake = 5;

  function rememberStake(n) {
    const s = Math.floor(Number(n) || 0);
    if (s > 0) lastStake = Math.min(s, MAX_STAKE);
  }

  function stakeDefault() {
    return Math.max(1, Math.min(lastStake, MAX_STAKE, DB.getWallet() || 1));
  }

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

  // ---- Catalogue ----
  // ONE place per game. A built game already supplies its icon, name
  // and tagline through register(), so the card reads them from there.
  // COMING covers anything announced before it exists.
  //
  // This used to be a second hardcoded `planned` array carrying the
  // same four fields, which meant every game's metadata lived in two
  // files at once and a tagline edited in one quietly disagreed with
  // the other.
  //
  // A game file registers itself at LOAD, so its <script> tag must come
  // after this one. If it doesn't, or the tag is missing entirely, the
  // id is priced here but never registers — which used to render as a
  // bland "Not built yet" card and looked like a design decision rather
  // than a missing file. Now it says so, and says so in the console.
  const COMING = {};
  const warned = {};

  function catalogue() {
    return Object.keys(UNLOCK_PRICE).map(id => {
      const built = games.find(g => g.id === id);
      if (built) return Object.assign({ built: true, state: "built" }, built);

      const c = COMING[id];
      if (c) return { id, icon: c.icon, name: c.name, tagline: c.tagline, built: false, state: "planned" };

      if (!warned[id]) {
        warned[id] = true;
        console.warn(
          `[arcade] "${id}" is priced in UNLOCK_PRICE but never called Games.register().\n` +
          `         Add <script src="games/${id}.js"></script> to index.html, AFTER games/games.js.`);
      }
      return { id, icon: "\u26A0\uFE0F", name: id, tagline: "script not loaded", built: false, state: "missing" };
    });
  }

  // The ONLY way a game is allowed to take a stake.
  // Returns null if the round can't start, and takes nothing in that case.
  function beginRound(stake, gameId) {
    // Remembered before any of the refusals below, so a round you
    // couldn't afford still leaves the number you meant in the box.
    rememberStake(stake);
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
    // Every game's payout passes through here, so this is the one place
    // to hook a "money moved" effect instead of each game rolling its
    // own. payout 0 is always a loss in this codebase's convention (a
    // push returns the stake, never 0) — see hilo.js/mines.js comments.
    if (Dojo.moneyBurst) Dojo.moneyBurst(amount > 0 ? "win" : "loss");
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

  // ---- Rank-gated tabs ----
  // story/ still registers itself normally and knows nothing about
  // this; the host screen decides what it shows. The survival sim and
  // the story arrive together at Senior Lab Manager, because the story
  // is about staying alive and there is nothing to stay alive from
  // until vitals exist. See shop/ranks.js.
  const TAB_GATE = { story: "survival" };

  function tabOpen(t) {
    const need = TAB_GATE[t.id];
    if (!need) return true;
    return !Dojo.Ranks || Dojo.Ranks.hasFeature(need, DB.getXp());
  }

  // A locked tab STAYS ON SCREEN wearing a padlock. Hiding it meant a
  // player who hadn't earned it had no idea the story existed, and a
  // reward nobody knows about isn't a reward.

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
      const cheapest = Math.min(...Object.values(UNLOCK_PRICE));
      return `$${DB.getWallet()} \u00b7 unlock a game from $${cheapest}`;
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
      ${tabs.length > 1 ? `<div class="tab-row">
        ${tabs.map(t => `<button class="tab-btn${t.id === active ? " active" : ""}${tabOpen(t) ? "" : " locked"}" data-tab="${t.id}">${t.label}${tabOpen(t) ? "" : " \u{1F512}"}</button>`).join("")}
      </div>` : ""}
      <div id="arcade-tab-body"></div>`;
    root.querySelectorAll(".tab-btn").forEach(b =>
      b.addEventListener("click", () => renderGames(b.getAttribute("data-tab"))));
    const chosen = tabs.find(t => t.id === active) || tabs[0];
    const tabBody = document.getElementById("arcade-tab-body");
    if (tabOpen(chosen)) chosen.render(tabBody);
    else renderLockedTab(tabBody, chosen);
    showScreen("games");
  }

  // What a locked tab shows when you open it. Tells you what's behind it,
  // what it costs and how far off you are — a padlock with no price on it
  // is just a closed door.
  function renderLockedTab(body, tab) {
    if (!body) return;
    const at = Dojo.Ranks && Dojo.Ranks.featureRank(TAB_GATE[tab.id]);
    const xp = DB.getXp();
    const toGo = at ? Math.max(0, at.xp - xp) : 0;
    const pct = at && at.xp ? Math.min(100, (xp / at.xp) * 100) : 0;
    body.innerHTML = `
      <div class="shop-wallet">
        <div class="stats-section-title">\u{1F512} Locked until ${at ? at.name : "later"}</div>
        <div class="v-track wide" style="margin:0.7rem 0 0.4rem;"><span class="v-fill" style="width:${pct}%"></span></div>
        <div class="sw-meta">${xp} of ${at ? at.xp : "?"} XP \u00b7 ${toGo} to go</div>
        <p class="settings-hint" style="margin:0.7rem 0 0;">
          The story, and keeping yourself fed, clean and housed, open together at
          <strong>${at ? at.name : ""}</strong>. Until then the Arcade is just the games:
          nothing decays, you can't starve, and nobody goes through your pockets at night.
          It comes from studying \u2014 there is nothing to buy.
        </p>
      </div>`;
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

    catalogue().forEach(g => {
      const owned = isUnlocked(g.id);
      const price = UNLOCK_PRICE[g.id];
      const afford = DB.getWallet() >= price;

      const card = document.createElement("div");
      card.className = `shop-card${g.built ? "" : " soon"}${owned ? " owned" : ""}`;

      let action;
      if (!g.built) {
        action = `<div class="shop-price soon-tag">${
          g.state === "missing" ? "Not loaded \u2014 see console" : "Not built yet"}</div>`;
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
          <div class="shop-tagline">${owned || !g.built ? g.tagline : `${g.tagline} \u2014 one-off unlock`}</div>
          ${action}
        </div>`;

      const btn = card.querySelector("button");
      if (btn && !btn.disabled) {
        btn.addEventListener("click", () => {
          if (btn.getAttribute("data-act") === "unlock") {
            // Redraw THIS TAB IN PLACE. Going through renderGames would
            // end in showScreen -> scrollTo(0,0) and throw the page to
            // the top on every purchase — the same jump already fixed
            // for story choices and life-shop buys. ARCHITECTURE.md §6.
            if (unlockGame(g.id)) {
              if (Dojo.renderVitals) Dojo.renderVitals();
              renderGamesTab(body);
            }
            return;
          }
          g.mount(body, { beginRound, settle, raise, MAX_STAKE, stakeDefault, renderGames, gameId: g.id });
        });
      }
      grid.appendChild(card);
    });
  }

  Dojo.Games = { register, beginRound, settle, raise, canPlay, isUnlocked, unlockGame,
                 stakeDefault, rememberStake, UNLOCK_PRICE, MAX_STAKE };
  Dojo.Arcade = Dojo.Games;
  Dojo.Arcade.registerTab = registerTab;
  Object.assign(Dojo, { renderGames, gamesSummary });
})();
