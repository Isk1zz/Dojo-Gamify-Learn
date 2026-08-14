// ================================================
// CS Dojo — ARCADE
// ------------------------------------------------
// The shell, the gating and the payout seam. Three games are built:
// crash.js, hilo.js and blackjack.js, each in its own file, each
// registering itself with Games.register().
//
// The gate:
//   - 1 ticket per round. 7 tickets per 6h, ceiling 7.
//   - stake capped at the game's own cap (see STAKE_TIERS) and at the
//     current wallet.
//   - the game must be unlocked.
// Energy was deleted in v6 — it and tickets were two rate limits doing
// the same job. The `energy` field survives in stored profiles because
// migrations never drop fields, but nothing reads it.
//
// Never let a game call DB.addMoney() directly for a payout — go
// through settle(), so every payout is logged in one place.
//
// The Arcade screen supports tabs via Arcade.registerTab, so another
// branch can share this screen and its gate rather than taking a lobby
// slot of its own. Story/ used that seam and has since been removed;
// only the Games tab ships today, so the tab row hides itself.
//
// Emits: wallet:changed, arcade:round
// ================================================

(() => {
  const Bus = Dojo.Bus;
  const showScreen = Dojo.showScreen;

  // Base cap before any upgrade is bought — was the flat MAX_STAKE
  // every game shared. Kept as the tier-0 floor now that each game has
  // its own ladder (see STAKE_TIERS below).
  const MAX_STAKE = 50;

  // ---- Stake-cap upgrades (Arcade → Upgrades tab) ----
  // Each of the four games has its OWN cap, upgraded independently —
  // maxing out Crash says nothing about Blackjack's cap. Same "bought
  // once with MONEY" pattern as UNLOCK_PRICE below, stored the same
  // generic way: a string in DB's inventory array, not a bespoke field,
  // so no profile-schema migration was needed for this. Ownership of
  // tier N implies nothing about tier N-1 being separately owned —
  // stakeTier() just reports the highest tier whose key is present.
  const STAKE_TIERS = [
    { tier: 1, cap: 75,  price: 500 },
    { tier: 2, cap: 100, price: 1000 },
    { tier: 3, cap: 150, price: 2000 },
    { tier: 4, cap: 200, price: 4000 },
    { tier: 5, cap: 250, price: 8000 }
  ];

  const stakeTierKey = (gameId, tier) => `stake_${gameId}_${tier}`;

  // Highest tier bought for this game, 0 if none.
  function stakeTier(gameId) {
    const inv = DB.getInventory();
    for (let i = STAKE_TIERS.length - 1; i >= 0; i--) {
      if (inv.includes(stakeTierKey(gameId, STAKE_TIERS[i].tier))) return STAKE_TIERS[i].tier;
    }
    return 0;
  }

  function stakeCapFor(gameId) {
    const t = stakeTier(gameId);
    return t === 0 ? MAX_STAKE : STAKE_TIERS[t - 1].cap;
  }

  // Returns the tier definition (tier, cap, price) not yet owned by this
  // game, or null if it's already at the top of the ladder.
  function nextStakeTier(gameId) {
    return STAKE_TIERS[stakeTier(gameId)] || null;
  }

  // Returns true only if the money actually left the wallet.
  function buyStakeUpgrade(gameId) {
    const next = nextStakeTier(gameId);
    if (!next || !isUnlocked(gameId)) return false;
    if (!DB.spendMoney(next.price)) return false;
    DB.addInventory(stakeTierKey(gameId, next.tier));
    Bus.emit("wallet:changed", { delta: -next.price, reason: "stake-upgrade" });
    return true;
  }

  // ---- Unlock prices ----
  // Bought once, with MONEY, and stored in the inventory as
  // "game_<id>". Same coin as food and shelter — an unlock is another
  // thing you save up for, and the ladder is steep enough that the
  // Garden has to carry you there. Charge can never buy one.
  //
  // The order here is the order the cards appear in.
  // Emptied when the casino games were removed. catalogue() is driven
  // by THIS table, not by which files registered — so leaving the four
  // ids here would have kept showing them as "planned, coming soon",
  // which is the opposite of removing them. Add an id back here (plus a
  // register() call) and the Arcade lights up again unchanged.
  const UNLOCK_PRICE = {};

  // ---- Remembered stake ----
  // Every game's box used to reset to 5 after every round, so anyone
  // playing at a steady stake retyped it all evening. Kept here rather
  // than per game so the four boxes agree with each other, and read
  // through stakeDefault() so it can never pre-fill more than the
  // wallet holds — a pre-filled amount you can't afford is worse than
  // a wrong one. Session-only: this deliberately isn't in db.js,
  // because a stake is a mood, not a setting.
  let lastStake = 5;

  // Whether a game is currently mounted into #arcade-tab-body, as
  // opposed to the tab/game-list view. Each game's own "✕ Close"
  // button already returns to the list correctly (api.renderGames) —
  // this is for the Arcade screen's OWN topbar back button, which used
  // to always jump straight to the Lobby even mid-game, skipping the
  // arcade level entirely. See backFromArcade below.
  let inGame = false;

  function rememberStake(n, gameId) {
    const s = Math.floor(Number(n) || 0);
    // Clamped to whichever game just set it, not a shared ceiling — the
    // four boxes still agree on the NUMBER (that's the point of keeping
    // this shared rather than per-game), just not on what the top of
    // the range is, since that's per-game now.
    if (s > 0) lastStake = Math.min(s, gameId ? stakeCapFor(gameId) : MAX_STAKE);
  }

  function stakeDefault(gameId) {
    const cap = gameId ? stakeCapFor(gameId) : MAX_STAKE;
    return Math.max(1, Math.min(lastStake, cap, DB.getWallet() || 1));
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
    rememberStake(stake, gameId);
    if (gameId && !isUnlocked(gameId)) return null;
    const s = Math.floor(Number(stake) || 0);
    if (s <= 0 || s > stakeCapFor(gameId)) return null;
    if (DB.getWallet() < s) return null;
    if (DB.getTickets() < 1) return null;
    if (!DB.spendMoney(s)) return null;
    if (!DB.spendTicket()) { DB.addMoney(s); return null; }
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
    return DB.getTickets() >= 1;
  }

  // ---- Tabs ----
  // Another branch adds a tab instead of taking its own lobby slot:
  //   Arcade.registerTab({ id, label, render(body) })
  const tabs = [
    { id: "games", label: "\u{1F3B0} Games", render: renderGamesTab },
    { id: "upgrades", label: "⬆️ Upgrades", render: renderUpgradesTab }
  ];
  function registerTab(tab) { if (!tabs.some(t => t.id === tab.id)) tabs.push(tab); }

  // ---- Rank-gated tabs ----
  // A registered tab may name a rank feature it needs; the host screen
  // decides what it shows, the tab itself knows nothing about this.
  // Empty since Story was removed — kept because registerTab is a
  // public seam any branch can still use, and a locked tab is the only
  // sanctioned way to gate one.
  const TAB_GATE = {};

  function tabOpen(t) {
    const need = TAB_GATE[t.id];
    if (!need) return true;
    return !Dojo.Ranks || Dojo.Ranks.hasFeature(need, DB.getXp());
  }

  // A locked tab STAYS ON SCREEN wearing a padlock, rather than being
  // hidden — a reward nobody knows about isn't a reward.

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
    if (!games.length) return "Empty for now — new games coming";
    if (!games.some(g => isUnlocked(g.id))) {
      const prices = Object.values(UNLOCK_PRICE);
      if (!prices.length) return "Empty for now — new games coming";
      const cheapest = Math.min(...prices);
      return `$${DB.getWallet()} \u00b7 unlock a game from $${cheapest}`;
    }
    return t
      ? `${t} ticket${t === 1 ? "" : "s"} \u00b7 $${DB.getWallet()} in the wallet`
      : `No tickets \u00b7 next in ${fmtWait(DB.msUntilNextTicket())}`;
  }

  function renderGames(tab) {
    const root = document.getElementById("games-body");
    if (!root) return;
    // Landing back on the tab list, however we got here (a tab click, a
    // game's own close button, or backFromArcade below).
    inGame = false;
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
          Keeping yourself fed, clean and housed opens at
          <strong>${at ? at.name : ""}</strong>. Until then the Arcade is just the games:
          nothing decays, you can't starve, and nobody goes through your pockets at night.
          It comes from studying \u2014 there is nothing to buy.
        </p>
      </div>`;
  }

  function renderGamesTab(body) {
    if (!body) return;

    // The casino games (Crash, Hi-Lo, Mines, Blackjack) were removed on
    // request — the Arcade shell, tickets, stake caps and the $ economy
    // all stay, so whatever replaces them plugs into the same register()
    // seam with no rework. Until then this is deliberately empty and
    // says so, rather than rendering a bare wallet card that reads as a
    // loading failure.
    if (!catalogue().length) {
      body.innerHTML = `
        <div class="shop-wallet">
          <div class="sw-balance">$${DB.getWallet()}</div>
          <p class="settings-hint" style="margin:0.6rem 0 0;">
            The Arcade is empty right now. The casino games have been
            removed; what replaces them is still being designed. Your
            wallet, tickets and unlocks are untouched.
          </p>
        </div>`;
      return;
    }

    const tickets = DB.getTickets();

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">$${DB.getWallet()}</div>
        <div class="sw-meta">
          \u{1F3AB} ${tickets}/${DB.constants().TICKET_MAX} tickets
          ${tickets < DB.constants().TICKET_MAX ? `\u00b7 next in ${fmtWait(DB.msUntilNextTicket())}` : ""}
        </div>
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          One ticket a round, seven tickets every six hours. Each game starts
          capped at $${MAX_STAKE} a stake \u2014 raise it per game in
          \u2b06\ufe0f Upgrades. That ceiling is the whole brake \u2014 the arcade is a
          break, not an income.
        </p>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3B0} Arcades</div>
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
            // the top on every purchase. ARCHITECTURE.md §6.
            if (unlockGame(g.id)) {
              if (Dojo.renderVitals) Dojo.renderVitals();
              renderGamesTab(body);
            }
            return;
          }
          inGame = true;
          g.mount(body, {
            beginRound, settle, raise, renderGames, gameId: g.id,
            MAX_STAKE: stakeCapFor(g.id),
            stakeDefault: () => stakeDefault(g.id)
          });
        });
      }
      grid.appendChild(card);
    });
  }

  // Per-game stake-cap ladder. Unbuilt/not-yet-unlocked games still show
  // a card (greyed out, same "locked" treatment the Games tab uses) so
  // the ladder itself isn't a surprise once a game IS unlocked — same
  // reasoning as `reward: null` ranks staying on the ladder in ranks.js.
  function renderUpgradesTab(body) {
    if (!body) return;
    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">$${DB.getWallet()}</div>
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          Five tiers per game, each raising ONLY that game's stake cap.
          Unlock the game in \u{1F3B0} Games first.
        </p>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{2b06}\u{fe0f} Stake Upgrades</div>
        <div class="shop-grid" id="upgrades-grid"></div>
      </div>`;

    const grid = body.querySelector("#upgrades-grid");

    catalogue().filter(g => g.built).forEach(g => {
      const owned = isUnlocked(g.id);
      const tier = owned ? stakeTier(g.id) : 0;
      const cap = owned ? stakeCapFor(g.id) : MAX_STAKE;
      const next = owned ? nextStakeTier(g.id) : null;
      const afford = next ? DB.getWallet() >= next.price : false;

      const card = document.createElement("div");
      card.className = `shop-card${owned ? " owned" : " locked"}`;

      let action;
      if (!owned) {
        action = `<div class="shop-price soon-tag">Unlock the game first</div>`;
      } else if (!next) {
        action = `<div class="shop-price">Maxed — $${cap} cap</div>`;
      } else {
        action = `<button class="shop-btn buy${afford ? "" : " short"}" data-act="upgrade" data-game="${g.id}" ${afford ? "" : "disabled"}>
                    Tier ${next.tier}: $${next.cap} cap — $${next.price}${afford ? "" : ` · need $${next.price - DB.getWallet()} more`}
                  </button>`;
      }

      card.innerHTML = `
        <div class="shop-card-preview game-preview"><span class="gp-icon">${g.icon}</span></div>
        <div class="shop-card-body">
          <div class="shop-name">${g.name}</div>
          <div class="shop-tagline">${owned ? `Tier ${tier}/5 · current cap $${cap}` : g.tagline}</div>
          ${action}
        </div>`;

      const btn = card.querySelector("button");
      if (btn && !btn.disabled) {
        btn.addEventListener("click", () => {
          // Redraw THIS TAB IN PLACE, same reasoning as the Games tab's
          // own unlock handler — ARCHITECTURE.md §6.
          if (buyStakeUpgrade(g.id)) {
            if (Dojo.renderVitals) Dojo.renderVitals();
            renderUpgradesTab(body);
          }
        });
      }
      grid.appendChild(card);
    });
  }

  // The Arcade screen's OWN topbar back button (btn-back-lobby5, wired
  // in core/boot.js) — steps back one level at a time instead of always
  // leaving Arcade entirely. Mid-game, that's the game list; from the
  // game list, it's the Lobby, same as every other screen's back button.
  function backFromArcade() {
    if (inGame) renderGames("games");
    else Dojo.showLobby();
  }

  Dojo.Games = { register, beginRound, settle, raise, canPlay, isUnlocked, unlockGame,
                 stakeDefault, rememberStake, UNLOCK_PRICE, MAX_STAKE };
  Dojo.Arcade = Dojo.Games;
  Dojo.Arcade.registerTab = registerTab;
  Object.assign(Dojo, { renderGames, gamesSummary, backFromArcade });
})();
