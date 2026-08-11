// ================================================
// CS Dojo — ARCADE / Blackjack
// ------------------------------------------------
// Classic 21. Dealer hits below 17 and stands on 17 or more (soft 17
// included — dealer stands). Blackjack pays 3:2, a push returns the
// stake, double down is available on the opening two cards.
//
// This file owns the RULES. games.js owns the gate and the wallet:
// extra money for a double goes through api.raise, never DB directly.
//
// WHY THIS IS THE $300 UNLOCK
// Crash and Hi-Lo both return a flat 96% no matter what the player
// does — there is nothing to learn. Blackjack is the opposite: played
// well it returns around 99%, played badly a good deal less. The
// expensive unlock buys a game where paying attention is worth
// something, which is the only kind of "skill" this app should sell.
// Splits are deliberately out of scope for v1.
// ================================================

(() => {
  const RANK_NAME = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"];
  const DECKS = 6;

  // ---- Shoe ----
  // Rebuilt and shuffled per round. Card counting across rounds would
  // be pointless anyway with two tickets per six hours.
  function freshShoe() {
    const shoe = [];
    for (let d = 0; d < DECKS; d++)
      for (let s = 0; s < SUITS.length; s++)
        for (let r = 1; r <= 13; r++) shoe.push({ rank: r, suit: SUITS[s] });
    for (let i = shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }
    return shoe;
  }

  // ---- Hand value ----
  // Aces count 11 until that busts, then drop to 1. `soft` means an ace
  // is still counting as 11, which is what the display needs.
  function handValue(cards) {
    let total = 0, aces = 0;
    cards.forEach(c => {
      const v = c.rank === 1 ? 11 : Math.min(10, c.rank);
      if (c.rank === 1) aces++;
      total += v;
    });
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return { total, soft: aces > 0 };
  }

  const isBlackjack = cards => cards.length === 2 && handValue(cards).total === 21;

  function cardHtml(c, faceDown) {
    if (faceDown) return `<div class="pcard back"></div>`;
    const red = c.suit === "\u2665" || c.suit === "\u2666";
    return `<div class="pcard${red ? " red" : ""}">
      <span class="pc-rank">${RANK_NAME[c.rank]}</span>
      <span class="pc-suit">${c.suit}</span>
    </div>`;
  }

  function mount(container, api) {
    let shoe = [], player = [], dealer = [], round = null;
    let phase = "idle";        // idle | playing | done
    let message = "Set a stake and deal.";
    let outcome = "";

    const panel = document.createElement("div");
    panel.className = "table-panel";
    container.innerHTML = "";
    container.appendChild(panel);

    const draw = () => shoe.pop();

    function paint() {
      const pv = handValue(player);
      const dv = handValue(dealer);
      const hideHole = phase === "playing";
      const canDouble = phase === "playing" && player.length === 2 && DB.getWallet() >= round.stake;

      panel.innerHTML = `
        <div class="crash-head">
          <div class="stats-section-title">\u{1F0A1} Blackjack</div>
          <button class="btn-ghost table-close">\u2715 Close</button>
        </div>

        <div class="bj-side">
          <div class="bj-label">Dealer ${dealer.length ? `\u00b7 ${hideHole ? handValue([dealer[0]]).total : dv.total}` : ""}</div>
          <div class="card-row">${dealer.map((c, i) => cardHtml(c, hideHole && i === 1)).join("") || `<div class="pcard back"></div>`}</div>
        </div>

        <div class="bj-side">
          <div class="bj-label">You ${player.length ? `\u00b7 ${pv.total}${pv.soft ? " soft" : ""}` : ""}</div>
          <div class="card-row">${player.map(c => cardHtml(c)).join("") || `<div class="pcard back"></div>`}</div>
        </div>

        <div class="table-status ${outcome}">${message}</div>

        ${phase === "playing" ? `
          <div class="call-row">
            <button class="shop-btn equip" data-act="hit">Hit</button>
            <button class="shop-btn equip" data-act="stand">Stand</button>
            <button class="shop-btn equip" data-act="double" ${canDouble ? "" : "disabled"}>
              Double${canDouble ? ` \u00b7 $${round.stake}` : ""}
            </button>
          </div>`
        : `
          <div class="crash-controls">
            <label class="crash-stake">
              <span>Stake</span>
              <input id="bj-stake" class="modal-input admin-input" type="number"
                     min="1" max="${api.MAX_STAKE}" step="1"
                     value="${api.stakeDefault ? api.stakeDefault() : 5}" />
            </label>
            <button id="bj-deal" class="btn-primary">Deal</button>
          </div>
          <p class="settings-hint">
            1 ticket and a little upkeep per deal.
            Dealer hits below 17. Blackjack pays 3:2, a push returns your stake.
            Played well this is the best return in the arcade \u2014 played carelessly it isn't.
          </p>`}`;

      panel.querySelector(".table-close").addEventListener("click", () => api.renderGames("games"));
      const deal = panel.querySelector("#bj-deal");
      if (deal) deal.addEventListener("click", startRound);
      panel.querySelectorAll("[data-act]").forEach(b =>
        b.addEventListener("click", () => act(b.getAttribute("data-act"))));
    }

    function startRound() {
      const stake = Math.floor(Number(panel.querySelector("#bj-stake").value) || 0);
      round = api.beginRound(stake, api.gameId);
      if (!round) {
        outcome = "lost";
        message = Dojo.LifeShop && Dojo.LifeShop.isWeak()
          ? Dojo.LifeShop.weakReason() + "."
          : DB.getTickets() < 1 ? "No tickets left \u2014 seven come back every six hours."
          : DB.getWallet() < stake ? "Not enough money for that stake."
          : `Stake must be between $1 and $${api.MAX_STAKE}.`;
        paint();
        return;
      }

      shoe = freshShoe();
      player = [draw(), draw()];
      dealer = [draw(), draw()];
      phase = "playing";
      outcome = "";
      message = "Hit, stand, or double.";
      if (Dojo.renderVitals) Dojo.renderVitals();

      // A natural resolves immediately, either way.
      if (isBlackjack(player) || isBlackjack(dealer)) return finish();
      paint();
    }

    function act(what) {
      if (phase !== "playing") return;
      if (what === "hit") {
        player.push(draw());
        if (handValue(player).total > 21) return finish();
        message = "Hit, or stand.";
        paint();
        return;
      }
      if (what === "double") {
        // Doubling adds a second stake, takes exactly one card, and ends
        // the hand. The extra money goes through the seam.
        if (!api.raise(round, round.stake)) {
          message = "Not enough money to double.";
          paint();
          return;
        }
        if (Dojo.renderVitals) Dojo.renderVitals();
        player.push(draw());
        return finish();
      }
      finish();   // stand
    }

    function finish() {
      phase = "done";
      const pv = handValue(player).total;
      const pBJ = isBlackjack(player);
      const dBJ = isBlackjack(dealer);

      // Dealer only plays on if the player is still live.
      if (pv <= 21 && !pBJ && !dBJ) {
        while (handValue(dealer).total < 17) dealer.push(draw());
      }
      const dv = handValue(dealer).total;

      let payout = 0;
      if (pv > 21) { outcome = "lost"; message = `Bust at ${pv}. $${round.stake} gone.`; }
      else if (pBJ && dBJ) { payout = round.stake; outcome = "push"; message = "Both blackjack \u2014 push."; }
      else if (pBJ) { payout = Math.floor(round.stake * 2.5); outcome = "won"; message = `Blackjack! $${payout} back.`; }
      else if (dBJ) { outcome = "lost"; message = `Dealer blackjack. $${round.stake} gone.`; }
      else if (dv > 21) { payout = round.stake * 2; outcome = "won"; message = `Dealer busts at ${dv}. $${payout} back.`; }
      else if (pv > dv) { payout = round.stake * 2; outcome = "won"; message = `${pv} beats ${dv}. $${payout} back.`; }
      else if (pv === dv) { payout = round.stake; outcome = "push"; message = `${pv} each \u2014 push.`; }
      else { outcome = "lost"; message = `${dv} beats ${pv}. $${round.stake} gone.`; }

      api.settle(round, payout, { game: "blackjack", player: pv, dealer: dv });
      round = null;
      if (Dojo.renderVitals) Dojo.renderVitals();
      paint();
    }

    paint();
  }

  Dojo.Games.register({
    id: "blackjack",
    name: "Blackjack",
    tagline: "Classic 21, dealer stands on 17",
    icon: "\u{1F0A1}",
    mount
  });

  Dojo.Blackjack = { handValue, isBlackjack, freshShoe, DECKS };
})();
