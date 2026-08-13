// ================================================
// CS Dojo — ARCADE / Mines
// ------------------------------------------------
// Pick a field size and how many mines are hidden in it, then reveal
// tiles one at a time. Every safe tile compounds the multiplier; the
// first mine you hit takes the whole chain. Cash out whenever you want.
//
// Structurally the same shape as Hi-Lo — a chain of independent picks,
// cash out anytime, one wrong pick loses everything — just with the
// odds set by the player's own field/mine choice instead of a fixed
// deck. Deliberately follows Hi-Lo's math, not Crash's: the edge
// compounds per reveal (0.96^n over a chain), it does not stay flat.
// See games/GAMES.md for why that's the right family for this shape
// of game.
//
// This file owns the ODDS. games.js owns the gate and the wallet.
// ================================================

(() => {
  const RTP = 0.96;          // per reveal — compounds over a chain, like Hi-Lo

  // Same reasoning as Hi-Lo's MAX_CHAIN_MULT, and deliberately the same
  // number: both are compounding chain games in the same family, so one
  // ceiling for both is easier to justify than two different ones.
  // Without it, a high-mine-density board cleared almost to the end
  // could pay a multiplier deep into the hundreds — 50x x $50 stake cap
  // = $2,500, already the largest number anywhere in the app (see
  // hilo.js). Hitting the cap force-cashes.
  const MAX_MULT = 50;

  // Field is fixed to one of three square sizes rather than an arbitrary
  // number — a free-form width/height input is more surface for a
  // trivial gain, and non-square grids don't read as a "field" at a
  // glance the way a square does.
  const FIELD_SIZES = [
    { id: "s", label: "4×4", n: 16 },
    { id: "m", label: "5×5", n: 25 },
    { id: "l", label: "6×6", n: 36 }
  ];

  // ---- The odds ----
  //
  // n tiles, m mines, j already revealed safely. The probability the
  // NEXT reveal is safe is (n-m-j)/(n-j) — one fewer safe tile and one
  // fewer tile overall than a moment ago. So the fair step multiplier is
  // its reciprocal, (n-j)/(n-m-j), and RTP is applied per step exactly
  // like Hi-Lo's per-call payout:
  //
  //   step   = RTP * (n-j) / (n-m-j)
  //   EV     = ((n-m-j)/(n-j)) * step = RTP,  every step, whatever j is
  //
  // So each individual reveal returns 96% long-run regardless of field
  // size, mine count, or how far into the chain you are — there is no
  // configuration that's a better bet than another, same honesty
  // property Hi-Lo's odds table has. A chain of k successful reveals
  // returns 96%^k overall (see games/GAMES.md for the worked table) —
  // the compounding is the tension the cash-out button exists for.
  function stepMultiplier(n, mines, revealedSoFar) {
    const tilesLeft = n - revealedSoFar;
    const safeLeft = n - mines - revealedSoFar;
    if (safeLeft <= 0) return 0;               // no safe tiles left — board already clear
    return Math.round((RTP * tilesLeft / safeLeft) * 100) / 100;
  }

  function buildField(n, mines) {
    const arr = new Array(n).fill(false);
    let placed = 0;
    while (placed < mines) {
      const i = Math.floor(Math.random() * n);
      if (!arr[i]) { arr[i] = true; placed++; }
    }
    return arr;
  }

  function mount(container, api) {
    let round = null;              // live round from games.js
    let fieldId = "m";
    let n = 25;
    let mines = 3;
    let tiles = [];                 // n booleans, true = mine, set on deal
    let revealed = [];              // n booleans, true = clicked safe or mine
    let revealedCount = 0;
    let mult = 1;                   // running multiplier, compounding
    let lastPayout = 0;
    let lastStakeLost = 0;
    let phase = "idle";             // idle | picking | over
    let message = "Pick a field, choose your mines, and deal.";
    let tone = "";

    const panel = document.createElement("div");
    panel.className = "table-panel";
    container.innerHTML = "";
    container.appendChild(panel);

    const pot = () => Math.floor((round ? round.stake : 0) * mult);
    const stakeNow = () => (round ? round.stake : 0);
    const defaultStake = () => (api.stakeDefault ? api.stakeDefault() : 5);
    const safeTiles = () => n - mines;

    function paint() {
      const cols = Math.round(Math.sqrt(n));
      const nextStep = phase === "picking" ? stepMultiplier(n, mines, revealedCount) : 0;
      const nextPotIf = phase === "picking"
        ? Math.floor(stakeNow() * Math.min(MAX_MULT, mult * nextStep)) : 0;
      const nextGain = nextPotIf - pot();

      panel.innerHTML = `
        <div class="crash-head">
          <div class="stats-section-title">\u{1F4A3} Mines</div>
          <button class="btn-ghost table-close">✕ Close</button>
        </div>

        ${phase !== "idle" ? `
          <div class="chain-bar">
            <span class="chain-mult">${mult.toFixed(2)}×</span>
            <span class="chain-pot">${
              phase === "picking" ? `$${pot()} riding`
              : tone === "lost" ? `lost $${lastStakeLost}`
              : `$${lastPayout} banked`}</span>
            <span class="chain-len">${revealedCount}/${safeTiles()} safe</span>
          </div>` : ""}

        <div class="mines-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
          ${tiles.length ? tiles.map((isMine, i) => {
            const isRevealed = revealed[i];
            const showMine = phase === "over" && isMine;
            if (isRevealed && isMine) return `<button class="mine-tile hit" disabled>\u{1F4A3}</button>`;
            if (isRevealed) return `<button class="mine-tile safe" disabled>✦</button>`;
            if (showMine) return `<button class="mine-tile shown" disabled>\u{1F4A3}</button>`;
            return `<button class="mine-tile" data-tile="${i}" ${phase === "picking" ? "" : "disabled"}></button>`;
          }).join("") : Array.from({ length: n }, () => `<button class="mine-tile" disabled></button>`).join("")}
        </div>

        <div class="table-status ${tone}">${message}</div>

        ${phase === "picking" ? `
          <button class="shop-btn buy cashout" data-act="cash" ${revealedCount ? "" : "disabled"}>
            ${revealedCount
              ? `\u{1F4B0} Cash out $${pot()}`
              : `Cash out · nothing won yet`}
          </button>
          <p class="settings-hint">
            ${mines} mine${mines === 1 ? "" : "s"} left hidden among ${n - revealedCount} covered tiles.
            Next safe tile: ${nextStep ? `${nextStep.toFixed(2)}× · +$${nextGain}` : "board would be clear"}.
            One mine takes the whole chain. Cap ${MAX_MULT}×.
          </p>`
        : phase === "idle" ? `
          <div class="crash-controls">
            <label class="crash-stake">
              <span>Field</span>
              <select id="mines-field" class="modal-input admin-input">
                ${FIELD_SIZES.map(f => `<option value="${f.id}" ${f.id === fieldId ? "selected" : ""}>${f.label} · ${f.n} tiles</option>`).join("")}
              </select>
            </label>
            <label class="crash-stake">
              <span>Mines</span>
              <input id="mines-count" class="modal-input admin-input" type="number"
                     min="1" max="${n - 1}" step="1" value="${mines}" />
            </label>
            <label class="crash-stake">
              <span>Stake</span>
              <input id="mines-stake" class="modal-input admin-input" type="number"
                     min="1" max="${api.MAX_STAKE}" step="1" value="${defaultStake()}" />
            </label>
            <button id="mines-deal" class="btn-primary">Deal</button>
          </div>
          <p class="settings-hint">
            First reveal on this field pays <strong>${stepMultiplier(n, mines, 0).toFixed(2)}×</strong>.
            Every reveal returns ${Math.round(RTP * 100)}% long-run of what's riding at that step, so a
            chain of k safe reveals returns ${Math.round(RTP * 100)}%^k — same shape as Hi-Lo, just with
            a field and mine count you choose instead of a fixed deck. Max stake $${api.MAX_STAKE}.
          </p>`
        : `
          <div class="crash-controls">
            <button id="mines-again" class="btn-primary">Deal again</button>
          </div>`}
      `;

      panel.querySelector(".table-close").addEventListener("click", () => api.renderGames("games"));

      const fieldSel = panel.querySelector("#mines-field");
      if (fieldSel) fieldSel.addEventListener("change", () => {
        const f = FIELD_SIZES.find(x => x.id === fieldSel.value) || FIELD_SIZES[1];
        fieldId = f.id; n = f.n;
        mines = Math.max(1, Math.min(mines, n - 1));
        paint();
      });
      const minesInput = panel.querySelector("#mines-count");
      if (minesInput) minesInput.addEventListener("change", () => {
        mines = Math.max(1, Math.min(n - 1, Math.floor(Number(minesInput.value) || 1)));
        paint();
      });
      const deal = panel.querySelector("#mines-deal");
      if (deal) deal.addEventListener("click", startRound);
      const again = panel.querySelector("#mines-again");
      if (again) again.addEventListener("click", () => { phase = "idle"; tone = ""; message = "Pick a field, choose your mines, and deal."; tiles = []; paint(); });

      panel.querySelectorAll("[data-tile]").forEach(b =>
        b.addEventListener("click", () => reveal(parseInt(b.getAttribute("data-tile")))));
      const cash = panel.querySelector("[data-act='cash']");
      // NOT addEventListener("click", cashOut) — see hilo.js: that hands
      // the click event in as `forced`, which is truthy.
      if (cash) cash.addEventListener("click", () => cashOut(false));
    }

    function startRound() {
      const stakeInput = panel.querySelector("#mines-stake");
      const stake = Math.floor(Number(stakeInput ? stakeInput.value : 0) || 0);
      round = api.beginRound(stake, api.gameId);
      if (!round) {
        tone = "lost";
        message = DB.getTickets() < 1 ? "No tickets left — seven come back every six hours."
          : DB.getWallet() < stake ? "Not enough money for that stake."
          : `Stake must be between $1 and $${api.MAX_STAKE}.`;
        paint();
        return;
      }
      tiles = buildField(n, mines);
      revealed = new Array(n).fill(false);
      revealedCount = 0;
      mult = 1; phase = "picking"; tone = "";
      message = `${mines} mine${mines === 1 ? "" : "s"} hidden among ${n} tiles. Pick one.`;
      if (Dojo.renderVitals) Dojo.renderVitals();
      paint();
    }

    function reveal(i) {
      if (phase !== "picking" || !round || revealed[i]) return;
      revealed[i] = true;

      if (tiles[i]) {
        // The whole chain goes, not just this tile. settle(0) is the
        // loss — the stake was already taken by beginRound. Two
        // different numbers here, same reasoning as hilo.js: what was
        // RIDING (the pot) is not what was LOST (the stake).
        const wasRiding = pot();
        lastStakeLost = round.stake;
        api.settle(round, 0, { game: "mines", n, mines, revealed: revealedCount });
        round = null; phase = "over"; tone = "lost";
        message = `Boom — that was a mine. $${wasRiding} was riding after ${revealedCount} safe tile${revealedCount === 1 ? "" : "s"}; your $${lastStakeLost} stake is gone.`;
        if (Dojo.renderVitals) Dojo.renderVitals();
        paint();
        return;
      }

      const step = stepMultiplier(n, mines, revealedCount);
      revealedCount++;
      mult = Math.min(MAX_MULT, mult * step);

      if (revealedCount >= safeTiles()) {
        message = `Cleared the board — every safe tile found.`;
        cashOut(true);
        return;
      }
      if (mult >= MAX_MULT) {
        message = `Safe — and that's the ${MAX_MULT}× ceiling.`;
        cashOut(true);
        return;
      }
      tone = "";
      message = `Safe. $${pot()} riding at ${mult.toFixed(2)}×. Keep going, or take it?`;
      paint();
    }

    function cashOut(forced) {
      if (!round) return;
      // Cashing out before a single safe reveal just hands the stake
      // straight back and burns the ticket for nothing — the button is
      // disabled for it; this is the belt to that pair of braces.
      if (!revealedCount) return;
      const payout = pot();
      api.settle(round, payout, { game: "mines", n, mines, revealed: revealedCount, mult });
      const revealedN = revealedCount;
      lastPayout = payout;
      round = null; phase = "over"; tone = "won";
      message = `${forced === true ? message + " " : ""}Cashed out at ${mult.toFixed(2)}× after ${revealedN} safe tile${revealedN === 1 ? "" : "s"} — $${payout} back.`;
      if (Dojo.renderVitals) Dojo.renderVitals();
      paint();
    }

    paint();
  }

  Dojo.Games.register({
    id: "mines",
    name: "Mines",
    tagline: "Pick your field, dodge the mines",
    icon: "\u{1F4A3}",
    mount
  });

  Dojo.Mines = { stepMultiplier, buildField, RTP, MAX_MULT, FIELD_SIZES };
})();
