// ================================================
// CS Dojo — ARCADE / Hi-Lo
// ------------------------------------------------
// A card 1-13 is shown. Call whether the next one is higher or lower.
// Get it right and the card you turned becomes the new base — keep
// calling as long as you like, with the multiplier compounding, and
// cash out whenever you want. Get it wrong and the whole chain is gone.
//
// ONE TICKET BUYS A WHOLE CHAIN, not a single call. That is the point
// of the streak: the decision that matters is when to stop, and
// charging per call would just make it Crash with cards.
//
// This file owns the ODDS. games.js owns the gate and the wallet.
// ================================================

(() => {
  const RTP = 0.96;          // per call — see the compounding note below
  const RANKS = 13;

  // The running multiplier is capped. Each call is independent, so a
  // long chain's expected return is 0.96^n — the edge compounds against
  // the player the further they push, which is exactly the tension the
  // cash-out button is for. Without a ceiling, a freak run at the $50
  // stake cap could pay five figures and make every other system in the
  // app pointless. 50x x $50 = $2,500. Hitting the cap force-cashes.
  const MAX_CHAIN_MULT = 50;

  // ---- The odds table ----
  //
  // A TIE LOSES. That single rule is what makes the maths clean:
  //
  //   w = number of cards that win the call
  //   payout = RTP * 13 / w
  //   EV     = (w/13) * payout = RTP,  for every card, both directions
  //
  // So the return is a flat 96% whichever card you're looking at and
  // whichever way you call it — exactly like Crash. There is no card
  // that's a better bet than another, which is the honest way to build
  // it: the player can't be punished for not knowing an odds table.
  //
  // A push-on-tie version was tried first and doesn't work. Calling
  // "higher" on a 1 wins 12/13 and pushes 1/13, so it can never lose —
  // and the house can only take its cut by paying under 1x on a win,
  // which is nonsense. Ties losing removes that whole class of problem.
  // ACE IS HIGH. rank 1 = 2, rank 13 = A — the usual poker/blackjack
  // convention. This used to be ace-low; flipped on request. The numeric
  // odds table below is unaffected — it works on rank magnitude only,
  // never on what the rank is named.
  const RANK_NAME = ["", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"];

  function winCount(rank, dir) {
    return dir === "higher" ? RANKS - rank : rank - 1;
  }

  function payoutFor(rank, dir) {
    const w = winCount(rank, dir);
    if (w <= 0) return 0;                       // impossible call
    return Math.round((RTP * RANKS / w) * 100) / 100;
  }

  function drawRank() { return 1 + Math.floor(Math.random() * RANKS); }
  function drawSuit() { return SUITS[Math.floor(Math.random() * SUITS.length)]; }

  function cardHtml(rank, suit, faceDown, extra) {
    if (faceDown) return `<div class="pcard back"></div>`;
    const red = suit === "\u2665" || suit === "\u2666";
    return `<div class="pcard${red ? " red" : ""}${extra ? " " + extra : ""}">
      <span class="pc-rank">${RANK_NAME[rank]}</span>
      <span class="pc-suit">${suit}</span>
    </div>`;
  }

  function mount(container, api) {
    let round = null;          // live round from games.js
    let base = null;           // the card you're calling against
    let mult = 1;              // running multiplier, compounding
    let chain = [];            // cards turned this chain
    // Every card shown this chain, in the order it appeared. The old
    // display rendered `base` and then the chain separately, so the
    // card you were calling against also appeared inside the history
    // and you got "5 from 5 A" for a two-call chain.
    let shown = [];
    let lastPayout = 0;        // what a cash-out actually returned
    let lastStakeLost = 0;     // what a loss actually cost (the STAKE)
    let phase = "idle";        // idle | calling | over
    let message = "Set a stake and deal.";
    let tone = "";

    const panel = document.createElement("div");
    panel.className = "table-panel";
    container.innerHTML = "";
    container.appendChild(panel);

    const pot = () => Math.floor((round ? round.stake : 0) * mult);
    const stakeNow = () => (round ? round.stake : 0);
    // What the pot becomes if this call comes in — the number the
    // decision actually turns on. The buttons used to show only the
    // step multiplier, which reads like a total and isn't one.
    const potIf = dir => Math.floor(stakeNow() * Math.min(MAX_CHAIN_MULT, mult * payoutFor(base.rank, dir)));
    // What a winning call actually ADDS. This is the number the button
    // has to show. Money is whole dollars, so at a $5 stake a 1.04x step
    // is 20 cents and floors away to nothing: the button read
    // "1.04x -> $5" next to "$5 riding", which looks like a bug and is
    // in fact the game telling the truth badly. $25 is the exact point
    // where even the worst call gains a dollar.
    const gainIf = dir => potIf(dir) - pot();
    const STAKE_THAT_PAYS = Math.ceil(1 / (RTP * RANKS / (RANKS - 1) - 1));
    const defaultStake = () => (api.stakeDefault ? api.stakeDefault() : 5);

    function paint() {
      const hi = base ? payoutFor(base.rank, "higher") : 0;
      const lo = base ? payoutFor(base.rank, "lower") : 0;
      // True when EVERY legal call would add nothing. On an A or a K
      // only one direction is even possible, so at a small stake the
      // player's whole move is forced and pays zero — which is exactly
      // the screen that looked broken.
      const flatCall = phase === "calling" &&
        ["higher", "lower"].filter(d => payoutFor(base.rank, d) > 0).every(d => gainIf(d) === 0);

      panel.innerHTML = `
        <div class="crash-head">
          <div class="stats-section-title">\u{1F0CF} Hi-Lo</div>
          <button class="btn-ghost table-close">\u2715 Close</button>
        </div>

        ${phase !== "idle" ? `
          <div class="chain-bar">
            <span class="chain-mult">${mult.toFixed(2)}\u00d7</span>
            <span class="chain-pot">${
              phase === "calling" ? `$${pot()} riding`
              : tone === "lost" ? `lost $${stakeNow() || lastStakeLost}`
              : `$${lastPayout} banked`}</span>
            <span class="chain-len">${chain.length} call${chain.length === 1 ? "" : "s"}</span>
          </div>` : ""}

        <div class="card-row">
          ${shown.length
            ? shown.slice(-6).map((c, i, arr) => cardHtml(c.rank, c.suit, false,
                i === arr.length - 1 ? (phase === "over" && tone === "lost" ? "lost" : "current") : "past")).join("")
            : `<div class="pcard back"></div>`}
        </div>
        ${phase === "calling"
          ? `<div class="chain-len" style="margin:-0.2rem 0 0.2rem;">Calling against ${RANK_NAME[base.rank]} \u00b7 2 is low, A is high</div>`
          : ""}

        <div class="table-status ${tone}">${message}</div>

        ${phase === "calling" ? `
          <div class="call-row">
            <button class="shop-btn equip" data-call="higher" ${hi ? "" : "disabled"}>
              \u25B2 Higher${hi ? ` \u00b7 ${hi.toFixed(2)}\u00d7 \u00b7 +$${gainIf("higher")}` : " \u00b7 impossible"}
            </button>
            <button class="shop-btn equip" data-call="lower" ${lo ? "" : "disabled"}>
              \u25BC Lower${lo ? ` \u00b7 ${lo.toFixed(2)}\u00d7 \u00b7 +$${gainIf("lower")}` : " \u00b7 impossible"}
            </button>
          </div>
          <button class="shop-btn buy cashout" data-act="cash" ${chain.length ? "" : "disabled"}>
            ${chain.length
              ? `\u{1F4B0} Cash out $${pot()}`
              : `Cash out \u00b7 nothing won yet`}
          </button>
          <p class="settings-hint">A tie loses, and a wrong call takes the whole chain \u2014
          the multiplier compounds but so does the risk. Cap ${MAX_CHAIN_MULT}\u00d7.${flatCall ? `
          <br><strong>+$0 is not a bug.</strong> Money is whole dollars, so at a $${stakeNow()} stake
          the safest calls are worth cents and round away. The multiplier is still climbing and the
          pot moves once it has caught up \u2014 but this game only really pays from about
          $${STAKE_THAT_PAYS} a stake.` : ""}</p>`
        : `
          <div class="crash-controls">
            <label class="crash-stake">
              <span>Stake</span>
              <input id="hilo-stake" class="modal-input admin-input" type="number"
                     min="1" max="${api.MAX_STAKE}" step="1" value="${defaultStake()}" />
            </label>
            <button id="hilo-deal" class="btn-primary">Deal</button>
          </div>
          <p class="settings-hint">
            One ticket buys a whole chain, not one call \u2014 keep going as long as you
            dare and cash out when you want. <strong>2 is low (1), A is high (13)</strong>, and
            a tie loses. Max stake $${api.MAX_STAKE}. Each call returns
            ${Math.round(RTP * 100)}% long-run, so a chain of n calls returns
            ${Math.round(RTP * 100)}%^n \u2014 the button that makes you money is the cash-out one.
            <br>Stake at least <strong>$${STAKE_THAT_PAYS}</strong> if you want every call to pay:
            money is whole dollars, and below that the safest calls are worth cents and round to nothing.
          </p>`}`;

      panel.querySelector(".table-close").addEventListener("click", () => api.renderGames("games"));
      const deal = panel.querySelector("#hilo-deal");
      if (deal) deal.addEventListener("click", startChain);
      panel.querySelectorAll("[data-call]").forEach(b =>
        b.addEventListener("click", () => call(b.getAttribute("data-call"))));
      const cash = panel.querySelector("[data-act='cash']");
      // NOT `addEventListener("click", cashOut)` — that hands the click
      // event in as `forced`, which is truthy, so every manual cash-out
      // printed the previous message glued to the front of the new one.
      if (cash) cash.addEventListener("click", () => cashOut(false));
    }

    function startChain() {
      const stake = Math.floor(Number(panel.querySelector("#hilo-stake").value) || 0);
      round = api.beginRound(stake, api.gameId);
      if (!round) {
        base = null; shown = []; phase = "idle"; tone = "lost";
        message = Dojo.LifeShop && Dojo.LifeShop.isWeak()
          ? Dojo.LifeShop.weakReason() + "."
          : DB.getTickets() < 1 ? "No tickets left \u2014 seven come back every six hours."
          : DB.getWallet() < stake ? "Not enough money for that stake."
          : `Stake must be between $1 and $${api.MAX_STAKE}.`;
        paint();
        return;
      }
      base = { rank: drawRank(), suit: drawSuit() };
      mult = 1; chain = []; shown = [base]; phase = "calling"; tone = "";
      message = `Showing ${RANK_NAME[base.rank]}. Higher or lower?`;
      if (Dojo.renderVitals) Dojo.renderVitals();
      paint();
    }

    function call(dir) {
      if (phase !== "calling" || !round) return;
      const next = { rank: drawRank(), suit: drawSuit() };
      const won = dir === "higher" ? next.rank > base.rank : next.rank < base.rank;
      const tie = next.rank === base.rank;
      const step = payoutFor(base.rank, dir);
      chain.push(next);
      shown.push(next);

      if (!won) {
        // The whole chain goes, not just this call. settle(0) is the
        // loss — the stake was already taken by beginRound.
        //
        // TWO DIFFERENT NUMBERS, and the old message conflated them.
        // It said "$52 gone" off a $50 stake at 1.04x, which reads as
        // though the wallet lost $52. It never held $52 — that was the
        // pot you were playing for. What actually left is the stake.
        const wasRiding = pot();
        lastStakeLost = round.stake;
        api.settle(round, 0, { game: "hilo", dir, base: base.rank, next: next.rank, chain: chain.length });
        round = null; phase = "over"; tone = "lost";
        const calls = `${chain.length} call${chain.length === 1 ? "" : "s"}`;
        message = tie
          ? `${RANK_NAME[next.rank]} \u2014 a tie, and a tie loses. $${wasRiding} was riding after ${calls}; your $${lastStakeLost} stake is gone.`
          : `${RANK_NAME[next.rank]} \u2014 wrong. $${wasRiding} was riding after ${calls}; your $${lastStakeLost} stake is gone.`;
        if (Dojo.renderVitals) Dojo.renderVitals();
        paint();
        return;
      }

      mult = Math.min(MAX_CHAIN_MULT, mult * step);
      base = next;

      if (mult >= MAX_CHAIN_MULT) {
        message = `${RANK_NAME[next.rank]} \u2014 right, and that's the ${MAX_CHAIN_MULT}\u00d7 ceiling.`;
        cashOut(true);
        return;
      }
      tone = "";
      message = `${RANK_NAME[next.rank]} \u2014 right. $${pot()} riding at ${mult.toFixed(2)}\u00d7. Again, or take it?`;
      paint();
    }

    function cashOut(forced) {
      if (!round) return;
      // Cashing out before a single call just hands the stake straight
      // back and burns the ticket for nothing. The button is disabled
      // for it; this is the belt to that pair of braces.
      if (!chain.length) return;
      const payout = pot();
      api.settle(round, payout, { game: "hilo", chain: chain.length, mult });
      const calls = chain.length;
      lastPayout = payout;
      round = null; phase = "over"; tone = "won";
      message = `${forced === true ? message + " " : ""}Cashed out at ${mult.toFixed(2)}\u00d7 after ${calls} call${calls === 1 ? "" : "s"} \u2014 $${payout} back.`;
      if (Dojo.renderVitals) Dojo.renderVitals();
      paint();
    }

    paint();
  }

  Dojo.Games.register({
    id: "hilo",
    name: "Hi-Lo",
    tagline: "Higher or lower than the card shown",
    icon: "\u{1F0CF}",
    mount
  });

  Dojo.HiLo = { payoutFor, winCount, RTP, RANKS, MAX_CHAIN_MULT };
})();
