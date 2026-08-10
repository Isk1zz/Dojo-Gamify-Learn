// ================================================
// CS Dojo — ARCADE / Crash
// ------------------------------------------------
// A multiplier climbs from 1.00x and breaks at a hidden point. Cash
// out before it breaks and you keep stake x multiplier; too slow and
// the stake is gone.
//
// This file owns the MATHS. games.js owns the gate and the wallet —
// this file must never call DB.addMoney or DB.spendMoney directly.
// ================================================

(() => {
  // ---- The distribution ----
  //
  // crash = 1 / (1 - u), u uniform on [0, 1).
  //
  // That gives P(crash >= m) = 1/m, so cashing out at any target m has
  // expected return m x (1/m) = 1. A flat 1.0 is a fair game with no
  // house edge at all, so HOUSE_EDGE of the rounds are forced to bust
  // instantly at 1.00x. Expected return is then exactly (1 - HOUSE_EDGE)
  // whatever multiplier you aim for — you cannot out-think it by
  // picking a lucky target, which is the honest way to build this.
  //
  //   RTP = 96%. Over many rounds the arcade takes 4c per dollar staked.
  //
  // MAX_MULT bounds the tail. Without it, one lucky round at the $50
  // stake cap could pay four figures and make the Garden pointless.
  // 25x x $50 = $1,250 is already the biggest number in the app.
  const HOUSE_EDGE = 0.04;
  const MAX_MULT = 25;

  // ---- Auto cash-out ----
  //
  // Set a target and the round takes itself off the table there. This
  // does NOT change the odds: expected return is (1 - HOUSE_EDGE) at
  // every target, so an auto target is a convenience and a discipline
  // aid, never an edge. What it actually removes is reaction time —
  // a manual cash-out at 1.05x is impossible to hit, an auto one isn't.
  //
  // It is checked in the same frame loop as the crash, and the crash is
  // checked FIRST. If the crash point is below the target, the round is
  // lost — the auto never gets to jump the queue.
  const MIN_AUTO = 1.01;

  // Speed of the climb: doubles every GROWTH_SECONDS.
  const GROWTH_SECONDS = 4;
  const K = Math.LN2 / GROWTH_SECONDS;

  function rollCrashPoint() {
    if (Math.random() < HOUSE_EDGE) return 1.00;
    const u = Math.random();
    const raw = 1 / (1 - u);
    return Math.min(MAX_MULT, Math.floor(raw * 100) / 100);
  }

  function multAt(elapsedMs) {
    return Math.exp(K * (elapsedMs / 1000));
  }

  // ---- State for one round ----
  // Deliberately module-scoped and reset on mount: only one round can
  // be in flight, and leaving the screen must not leave a timer running.
  let live = null;

  function stop() {
    if (live && live.raf) cancelAnimationFrame(live.raf);
    if (live && live.timer) clearInterval(live.timer);
    live = null;
  }

  function mount(container, api) {
    stop();

    const panel = document.createElement("div");
    panel.className = "crash-panel";
    panel.innerHTML = `
      <div class="crash-head">
        <div class="stats-section-title">\u{1F4C8} Crash</div>
        <button class="btn-ghost crash-close">\u2715 Close</button>
      </div>
      <div class="crash-stage">
        <div class="crash-mult" id="crash-mult">1.00\u00d7</div>
        <div class="crash-status" id="crash-status">Set a stake and go.</div>
        <div class="crash-track"><div class="crash-fill" id="crash-fill"></div></div>
      </div>
      <div class="crash-controls">
        <label class="crash-stake">
          <span>Stake</span>
          <input id="crash-stake" class="modal-input admin-input" type="number"
                 min="1" max="${api.MAX_STAKE}" step="1" value="5" />
        </label>
        <label class="crash-stake">
          <span>Auto cash out (optional)</span>
          <input id="crash-auto" class="modal-input admin-input" type="number"
                 min="${MIN_AUTO}" max="${MAX_MULT}" step="0.05" placeholder="off" />
        </label>
        <button id="crash-go" class="btn-primary">Start</button>
      </div>
      <div class="crash-presets">
        <span class="cp-label">Auto:</span>
        ${[1.2, 1.5, 2, 3, 5].map(v => `<button class="crash-preset" data-auto="${v}">${v.toFixed(2)}\u00d7</button>`).join("")}
        <button class="crash-preset off" data-auto="">off</button>
      </div>
      <div class="crash-history" id="crash-history"></div>
      <p class="settings-hint">
        Costs 1 ticket and a little upkeep per round.
        Max stake $${api.MAX_STAKE}, max multiplier ${MAX_MULT}\u00d7.
        Long-run return is ${Math.round((1 - HOUSE_EDGE) * 100)}% of what you stake at
        <em>any</em> target, auto or manual \u2014 the house keeps the rest, so this is a
        break, not an income.
      </p>`;

    container.innerHTML = "";
    container.appendChild(panel);

    const multEl   = panel.querySelector("#crash-mult");
    const statusEl = panel.querySelector("#crash-status");
    const fillEl   = panel.querySelector("#crash-fill");
    const stakeEl  = panel.querySelector("#crash-stake");
    const autoEl   = panel.querySelector("#crash-auto");
    const goEl     = panel.querySelector("#crash-go");
    const histEl   = panel.querySelector("#crash-history");
    const history  = [];

    panel.querySelectorAll(".crash-preset").forEach(b =>
      b.addEventListener("click", () => {
        autoEl.value = b.getAttribute("data-auto");
        markPresets();
      }));

    function markPresets() {
      const v = autoEl.value;
      panel.querySelectorAll(".crash-preset").forEach(b =>
        b.classList.toggle("active", b.getAttribute("data-auto") === v));
    }
    autoEl.addEventListener("input", markPresets);

    panel.querySelector(".crash-close").addEventListener("click", () => {
      stop();
      api.renderGames("games");
    });

    function paintHistory() {
      histEl.innerHTML = history.slice(-8).map(h =>
        `<span class="crash-chip ${h.won ? "won" : "lost"}">${h.at.toFixed(2)}\u00d7</span>`).join("");
    }

    function setPhase(phase) {
      panel.className = `crash-panel ${phase}`;
      const running = phase === "running";
      stakeEl.disabled = running;
      autoEl.disabled = running;
      goEl.textContent = running ? "Cash out" : "Start";
    }

    function finish(mult, won, payout, wasAuto) {
      stop();
      history.push({ at: mult, won });
      paintHistory();
      setPhase(won ? "won" : "lost");
      multEl.textContent = `${mult.toFixed(2)}\u00d7`;
      statusEl.textContent = won
        ? `${wasAuto ? "Auto-cashed" : "Cashed out"} at ${mult.toFixed(2)}\u00d7 \u2014 $${payout} back.`
        : `Broke at ${mult.toFixed(2)}\u00d7. Stake gone.`;
      if (Dojo.renderVitals) Dojo.renderVitals();
    }

    function start() {
      const stake = Math.floor(Number(stakeEl.value) || 0);
      const round = api.beginRound(stake, api.gameId);
      if (!round) {
        statusEl.textContent = Dojo.LifeShop && Dojo.LifeShop.isWeak()
          ? Dojo.LifeShop.weakReason() + "."
          : DB.getTickets() < 1 ? "No tickets left \u2014 seven come back every six hours."
          : DB.getWallet() < stake ? "Not enough money for that stake."
          : `Stake must be between $1 and $${api.MAX_STAKE}.`;
        return;
      }

      // Rolled once, up front, and never touched again — the number
      // cannot be nudged by how long the player waits.
      const crashAt = rollCrashPoint();
      const rawAuto = Number(autoEl.value);
      const autoAt = rawAuto >= MIN_AUTO ? Math.min(MAX_MULT, rawAuto) : null;
      const startedAt = Date.now();
      live = { raf: null, timer: null };
      setPhase("running");
      statusEl.textContent = "Climbing\u2026";
      if (Dojo.renderVitals) Dojo.renderVitals();

      const tick = () => {
        if (!live) return;
        const m = multAt(Date.now() - startedAt);
        // Crash first, always. If the curve broke below the auto target
        // the round is lost, and the auto must not sneak in ahead of it.
        if (m >= crashAt) {
          finish(crashAt, false, 0);
          return;
        }
        if (autoAt && m >= autoAt) {
          cashOut(autoAt);
          return;
        }
        multEl.textContent = `${m.toFixed(2)}\u00d7`;
        fillEl.style.width = `${Math.min(100, (Math.log(m) / Math.log(MAX_MULT)) * 100)}%`;
        live.raf = requestAnimationFrame(tick);
      };

      // `at` is passed by the auto trigger so the payout is the target
      // exactly, not whatever the frame happened to land on.
      const cashOut = (at) => {
        if (!live) return;
        const m = at || multAt(Date.now() - startedAt);
        if (m >= crashAt) { finish(crashAt, false, 0); return; }
        const payout = Math.floor(round.stake * m);
        api.settle(round, payout, { game: "crash", mult: m, auto: !!at });
        finish(m, true, payout, !!at);
      };

      live.cashOut = cashOut;
      live.raf = requestAnimationFrame(tick);
    }

    goEl.addEventListener("click", () => {
      if (live && live.cashOut) live.cashOut();
      else { fillEl.style.width = "0%"; start(); }
    });

    setPhase("idle");
  }

  Dojo.Games.register({
    id: "crash",
    name: "Crash",
    tagline: "Cash out before the curve breaks",
    icon: "\u{1F4C8}",
    mount
  });

  // Exposed for testing the maths without a DOM.
  Dojo.Crash = { rollCrashPoint, multAt, HOUSE_EDGE, MAX_MULT, MIN_AUTO };
})();
