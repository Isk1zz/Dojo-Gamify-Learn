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

  // Fixed, hand-scattered positions rather than Math.random() at render
  // time — a re-mount (switching tabs and back) shouldn't reshuffle the
  // sky every time, and a small hardcoded list reads as "stars", a fresh
  // random one every render just reads as flicker.
  const STAR_SPOTS = [
    [8, 15], [18, 55], [27, 8], [34, 70], [42, 30], [50, 85], [58, 12],
    [65, 60], [72, 40], [80, 20], [88, 75], [93, 45], [15, 90], [60, 92]
  ];
  function starsHtml(count, cls) {
    return STAR_SPOTS.slice(0, count).map(([l, t]) =>
      `<span class="sky-star ${cls}" style="left:${l}%;top:${t}%;"></span>`).join("");
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
      <div class="crash-stage" id="crash-stage">
        <div class="crash-sky">
          <div class="sky-layer sky-ground" id="sky-ground">
            <span class="sky-river"></span>
            <span class="sky-mountains"></span>
            <span class="sky-city"></span>
          </div>
          <div class="sky-layer sky-clouds" id="sky-clouds">
            <span class="sky-cloud c1"></span><span class="sky-cloud c2"></span><span class="sky-cloud c3"></span>
          </div>
          <div class="sky-layer sky-atmo" id="sky-atmo">
            ${starsHtml(10, "dim")}
          </div>
          <div class="sky-layer sky-space" id="sky-space">
            <span class="sky-planet pl1"></span><span class="sky-planet pl2"></span>
            ${starsHtml(14, "")}
          </div>
        </div>
        <svg class="crash-curve" viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="crashAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--accent-light)" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="var(--accent-light)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path id="crash-area" fill="url(#crashAreaGrad)" d=""></path>
          <path id="crash-line" fill="none" stroke-width="2.5" stroke-linecap="round" d=""></path>
        </svg>
        <div class="crash-rocket" id="crash-rocket">\u{1F680}</div>
        <div class="crash-mult" id="crash-mult">1.00\u00d7</div>
        <div class="crash-status" id="crash-status">Set a stake and go.</div>
      </div>
      <div class="crash-controls">
        <label class="crash-stake">
          <span>Stake</span>
          <input id="crash-stake" class="modal-input admin-input" type="number"
                 min="1" max="${api.MAX_STAKE}" step="1"
                 value="${api.stakeDefault ? api.stakeDefault() : 5}" />
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

    const multEl    = panel.querySelector("#crash-mult");
    const statusEl  = panel.querySelector("#crash-status");
    const stageEl   = panel.querySelector("#crash-stage");
    const rocketEl  = panel.querySelector("#crash-rocket");
    const lineEl    = panel.querySelector("#crash-line");
    const areaEl    = panel.querySelector("#crash-area");
    const skyLayers = {
      ground: panel.querySelector("#sky-ground"),
      clouds: panel.querySelector("#sky-clouds"),
      atmo: panel.querySelector("#sky-atmo"),
      space: panel.querySelector("#sky-space")
    };
    const stakeEl  = panel.querySelector("#crash-stake");
    const autoEl   = panel.querySelector("#crash-auto");
    const goEl     = panel.querySelector("#crash-go");
    const histEl   = panel.querySelector("#crash-history");
    const history  = [];

    // ---- The curve + rocket + parallax sky ----
    //
    // Purely visual — none of this touches rollCrashPoint/multAt, which
    // stay the one source of truth for the odds. `samples` stores RAW
    // (elapsed ms, multiplier) pairs, not pre-scaled pixel coordinates.
    //
    // X = elapsed time, Y = multiplier VALUE (not log) — genuinely
    // exponential curvature, which is the point.
    //
    // The axis ceilings are DERIVED FRESH from the tip sample every
    // redraw — `xMax`/`yMax` are functions, not stored state that jumps
    // when a threshold is crossed. A first version doubled them in
    // discrete steps once the round outgrew 82% of the current ceiling;
    // every existing point's pixel position is re-derived from raw data
    // each frame, so a discrete jump moved the ENTIRE curve inward all
    // at once — it visibly teleported instead of growing. Deriving the
    // ceiling continuously (always ~15% above the current tip) means
    // every frame's rescale is as small as that frame's actual progress,
    // which reads as smooth, continuous growth instead of a snap.
    const CURVE_W = 300, CURVE_H = 160;
    let samples = [];
    let lastPushT = -Infinity;
    let startedAt = 0;   // hoisted so both start()'s loop and finish() can read it

    function skyOpacity(m, lo, hi) {
      return Math.max(0, Math.min(1, (m - lo) / (hi - lo)));
    }
    function paintSky(m) {
      const inClouds = skyOpacity(m, 1.15, 1.8);
      const outClouds = skyOpacity(m, 2.8, 3.8);
      const inAtmo = skyOpacity(m, 2.4, 3.4);
      const outAtmo = skyOpacity(m, 4.4, 5.4);
      skyLayers.ground.style.opacity = 1 - inClouds;
      skyLayers.clouds.style.opacity = inClouds * (1 - outClouds);
      skyLayers.atmo.style.opacity = inAtmo * (1 - outAtmo);
      skyLayers.space.style.opacity = skyOpacity(m, 4.2, 5.6);
    }

    function redrawCurve(crashed) {
      if (!samples.length) return;
      const last = samples[samples.length - 1];
      const xMax = Math.max(5000, last.t * 1.15);
      const yMax = Math.max(3, (last.m - 1) * 1.15 + 1);
      const toPoint = s => ({
        x: Math.min(1, s.t / xMax) * CURVE_W,
        y: CURVE_H - Math.min(1, (s.m - 1) / (yMax - 1)) * CURVE_H
      });
      const pts = samples.map(toPoint);
      const d = "M" + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L");
      lineEl.setAttribute("d", d);
      const tip = pts[pts.length - 1];
      areaEl.setAttribute("d", `${d} L${tip.x.toFixed(1)},${CURVE_H} L0,${CURVE_H} Z`);
      lineEl.setAttribute("stroke", crashed ? "var(--red)" : "var(--accent-light)");

      // Rocket heading is the curve's actual direction AT the tip — the
      // last two points, nothing smoothed or averaged further back.
      // Samples are throttled to ~1 per 45ms (see pushSample), so
      // adjacent points are far enough apart in pixels for this to be a
      // stable reading rather than the sub-pixel noise a same-frame
      // pair would have been before that throttle existed.
      const tail = pts.length > 1 ? pts[pts.length - 2] : tip;
      const angle = Math.atan2(tip.y - tail.y, tip.x - tail.x) * 180 / Math.PI;
      rocketEl.style.left = `${(tip.x / CURVE_W) * 100}%`;
      rocketEl.style.top = `${(tip.y / CURVE_H) * 100}%`;
      // Rotate by the raw travel angle — turned back 90deg (CCW) from an
      // earlier +90 offset that looked right on paper (rocket glyph
      // measured pointing straight up in isolation) but was visibly
      // wrong in flight. Whatever the actual glyph/baseline mismatch
      // was, this is the offset that matches what's on screen.
      rocketEl.style.transform = `translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)`;
    }

    function resetCurve() {
      samples = [{ t: 0, m: 1 }];
      lastPushT = -Infinity;
      rocketEl.textContent = "\u{1F680}";
      rocketEl.classList.remove("exploded");
      redrawCurve(false);
      paintSky(1);
    }

    // Throttled to roughly one sample per 45ms (~22/s) rather than every
    // animation frame (~60/s cramming 1000+ points into a few-second
    // round). Fewer, more time-spaced points is what makes the tail
    // lookback above meaningful instead of a sub-pixel-wide window.
    function pushSample(t, m, force) {
      if (!force && t - lastPushT < 45) return;
      lastPushT = t;
      samples.push({ t, m });
      redrawCurve(false);
      paintSky(m);
    }

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
      // One last sample right at the crash/cash-out point, so the curve
      // visibly reaches exactly where it ended rather than stopping at
      // whatever the last animation frame happened to sample.
      pushSample(Date.now() - startedAt, mult, true);
      redrawCurve(!won);
      if (!won) {
        rocketEl.textContent = "\u{1F4A5}";
        rocketEl.classList.add("exploded");
        stageEl.classList.remove("shake"); void stageEl.offsetWidth; stageEl.classList.add("shake");
      } else {
        stageEl.classList.remove("flash-win"); void stageEl.offsetWidth; stageEl.classList.add("flash-win");
      }
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
      startedAt = Date.now();
      resetCurve();
      live = { raf: null, timer: null };
      setPhase("running");
      statusEl.textContent = "Climbing\u2026";
      if (Dojo.renderVitals) Dojo.renderVitals();

      const tick = () => {
        if (!live) return;
        const elapsed = Date.now() - startedAt;
        const m = multAt(elapsed);
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
        pushSample(elapsed, m);
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
      else start();
    });

    resetCurve();
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
