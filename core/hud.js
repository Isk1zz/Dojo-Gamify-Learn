// ================================================
// CS Dojo — CORE / heads-up display
// ------------------------------------------------
// The always-on top strip: lightning charge, and (v5) wallet and
// energy. Charge is EARNED here and SPENT in shop/. This file never
// decides what charge is worth — it only renders and animates.
// Emits: charge:earned
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.

  // Tapping the chip toggles the expand panel \u2014 CSS :hover/:focus-within
  // already covers mouse and keyboard, but touch has neither, so this is
  // the belt to that pair of braces. One delegated listener, bound once
  // at load, since #rank-chip exists in the static HTML from the start.
  document.addEventListener("click", e => {
    if (e.target.closest && e.target.closest("#rank-chip")) {
      const bar = document.getElementById("charge-bar");
      if (bar) bar.classList.toggle("show");
    }
  });

  let revealTimer = null;
  // Shows the full track/value panel for a few seconds, then lets it
  // collapse again (unless the user is still hovering/focused on it \u2014
  // the CSS handles that case on its own).
  function revealBar(ms) {
    const bar = document.getElementById("charge-bar");
    if (!bar) return;
    bar.classList.add("show");
    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => bar.classList.remove("show"), ms);
  }

  // ---- Lightning charge ----
  function renderCharge() {
    const bar = document.getElementById("charge-bar");
    if (!bar) return;
    if (!DB.getActiveProfile()) { bar.style.display = "none"; return; }
    bar.style.display = "flex";
    // The bar shows progress toward the NEXT RANK, not a balance. XP
    // has no ceiling, so there is nothing to fill up and stall at.
    const xp = DB.getXp();
    const p = Dojo.Ranks ? Dojo.Ranks.progress(xp) : null;
    const fill = document.getElementById("charge-fill");
    const value = document.getElementById("charge-value");
    const label = document.getElementById("rank-label");
    const insignia = document.getElementById("rank-insignia");
    const nickname = document.getElementById("hud-nickname");
    const profile = DB.getActiveProfile();
    if (nickname) nickname.textContent = profile && profile.name ? profile.name : "";

    if (!p) { fill.style.width = "0%"; value.textContent = `${xp} XP`; return; }
    fill.style.width = `${p.pct}%`;
    // Full name only \u2014 showing the abbreviation here too, next to the
    // full name already sitting in the chip, read as a duplicate
    // ("GEN General"). The next-rank abbreviation stays: it names
    // something DIFFERENT from what's on screen, so it's not a repeat.
    value.textContent = p.next ? `${p.into}/${p.span} \u2192 ${p.next.abbr}` : `${xp} XP`;
    if (label) label.textContent = p.cur.name;
    if (insignia && Dojo.Ranks.insigniaSvg) insignia.innerHTML = Dojo.Ranks.insigniaSvg(p.cur);
    bar.classList.toggle("full", !p.next);
  }

  // ---- Streak ----
  // Top-right of the charge bar. Renewed once per real day (see
  // DB.touchStreak) — a completed chunk, not this render, decides that;
  // this only ever reflects whatever DB currently holds.
  function renderStreak() {
    const chip = document.getElementById("streak-chip");
    const countEl = document.getElementById("streak-count");
    if (!chip) return;
    const streak = DB.getActiveProfile() ? DB.getStreak() : null;
    if (!streak || streak.count <= 0) { chip.style.display = "none"; hideStreakPopover(); return; }
    chip.style.display = "flex";
    if (countEl) countEl.textContent = streak.count;
  }

  function hideStreakPopover() {
    const pop = document.getElementById("streak-popover");
    if (pop) pop.style.display = "none";
  }

  function toggleStreakPopover() {
    const pop = document.getElementById("streak-popover");
    const chip = document.getElementById("streak-chip");
    if (!pop || !chip) return;
    if (pop.style.display === "block") { hideStreakPopover(); return; }
    const streak = DB.getStreak();
    if (!streak) return;
    pop.innerHTML = `<strong>${streak.count}-day streak</strong><br>`
      + `${streak.freezes} freeze${streak.freezes === 1 ? "" : "s"} left this week`
      + `<br>Freezes cover a missed day automatically — up to ${streak.freezes} in a row before it resets.`;
    const r = chip.getBoundingClientRect();
    pop.style.display = "block";
    pop.style.top = `${r.bottom + 6}px`;
    pop.style.right = `${window.innerWidth - r.right}px`;
  }

  document.addEventListener("click", e => {
    if (e.target.closest && e.target.closest("#streak-chip")) { toggleStreakPopover(); return; }
    if (e.target.closest && !e.target.closest("#streak-popover")) hideStreakPopover();
  });

  // ---- Wallet strip ----
  // Moved here from the now-removed shop/life.js (see BACKLOG.md's life-
  // sim removal) — this file's own header already claimed "wallet and
  // energy" as its job, life.js just got there first historically. The
  // wallet itself (DB.getWallet/addMoney/spendMoney) is core economy,
  // untouched by the life-sim's removal: Garden dividends and Arcade
  // wins/losses still run through it. Only the survival gate is gone —
  // the strip now shows whenever a profile is active, full stop.
  const WALLET_HIDDEN_SCREENS = new Set([
    "course-select", "unit-select", "topic-map", "deck-builder",
    "lesson", "exam", "exam-result", "flashcards"
  ]);

  function renderVitals() {
    const strip = document.getElementById("vitals-strip");
    if (!strip) return;
    if (!DB.getActiveProfile()) { strip.style.display = "none"; return; }
    // Router.current() only tracks screens reached through Router.go —
    // lesson/exam/flashcards/deck-builder are shown via a direct
    // showScreen() call inside library.js and never register there, so
    // the active .screen element is the only thing that's always right.
    const activeEl = document.querySelector(".screen.active");
    if (activeEl && WALLET_HIDDEN_SCREENS.has(activeEl.id)) { strip.style.display = "none"; return; }
    strip.style.display = "flex";
    // Reputation, not money — see data/db.js's getReputation. Same
    // stored number, new meaning: the Arcade it used to pay for is the
    // Forum now, and cosmetics are free, so `$` had nothing left to buy.
    const moneyTip = "Reputation, earned in the Garden. Spent on other people's Forum posts — never on your own.";
    const tokenTip = "Earned free from rank-ups, or bought in the Token Shop. Spent to unlock courses. Never converts to or from $ money. — tap to open the Token Shop";
    // Day/night toggle. Shows the state you'd switch TO, which is the
    // usual toggle idiom and the only thing that makes a single icon
    // unambiguous. It flips the SKY, which is its own setting and has
    // nothing to do with whether the theme is light or dark — see
    // data/db.js's getSky.
    const isDay = (DB.getSky ? DB.getSky() : "night") === "day";
    const dnTip = isDay ? "Switch to night" : "Switch to day";
    strip.innerHTML = `<span id="vital-wallet-chip" class="vital-wallet" role="button" tabindex="0" title="${moneyTip}"><span class="vw-icon">🏅</span>${DB.getReputation()}</span>`
      + `<span id="vital-tokens-chip" class="vital-tokens" role="button" tabindex="0" title="${tokenTip}"><span class="vw-icon">🪙</span>${DB.getTokens()}</span>`
      + `<button id="vital-daynight" class="vital-daynight" type="button" title="${dnTip}" aria-label="${dnTip}">${isDay ? "🌙" : "☀️"}</button>`;

    const dn = document.getElementById("vital-daynight");
    if (dn) dn.addEventListener("click", () => {
      if (Dojo.toggleSky) Dojo.toggleSky();
    });
  }

  // Tap the wallet, get a one-line reminder of what it's for. Same
  // popover element doubles for the Tokens chip — one at a time,
  // whoever was tapped last, same as the wallet always worked.
  function hideWalletPopover() {
    const pop = document.getElementById("wallet-popover");
    if (pop) pop.style.display = "none";
  }
  function toggleWalletPopover(chip) {
    const pop = document.getElementById("wallet-popover");
    if (!pop || !chip) return;
    // Only a click on the SAME chip that's already open should close it —
    // tapping the OTHER chip while one is open used to just close
    // whichever was open (this check didn't know which chip that was),
    // so switching from $ to 🪙 looked like the popover "didn't show."
    // It should switch straight to the new chip's content instead.
    if (pop.style.display === "block" && pop.dataset.forChip === chip.id) {
      hideWalletPopover();
      return;
    }
    pop.dataset.forChip = chip.id;
    const isTokens = chip.classList.contains("vital-tokens");
    pop.innerHTML = isTokens
      ? `<strong>🪙 ${DB.getTokens()}</strong><br>`
        + `Earned free from rank-ups, or bought in 🪙 Token Shop (Library). Spent `
        + `to unlock courses.`
      : `<strong>🏅 ${DB.getReputation()}</strong><br>`
        + `Earned in the Garden. Spent on other people's Forum posts — `
        + `never on your own.`;
    const r = chip.getBoundingClientRect();
    pop.style.display = "block";
    pop.style.top = `${r.bottom + 6}px`;
    pop.style.right = `${window.innerWidth - r.right}px`;
  }
  // The chips are now doors, not labels: $ opens Career (the Shop) and
  // 🪙 opens the Token Shop. The explanatory popover they used to open
  // moved to `title` on each chip — the text is still one hover away,
  // but a currency badge that goes to the place you spend that currency
  // is worth more than a badge that describes itself.
  document.addEventListener("click", e => {
    const chip = e.target.closest && e.target.closest(".vital-wallet, .vital-tokens");
    if (chip) {
      hideWalletPopover();
      const R = Dojo.Router;
      if (!R) return;
      R.go("store", { cat: chip.classList.contains("vital-tokens") ? "packs" : "custom" });
      return;
    }
    if (e.target.closest && !e.target.closest("#wallet-popover")) hideWalletPopover();
  });

  // The "renewed" moment — first qualifying action of a real day, per
  // DB.touchStreak's `changed` flag. Callers pass the count straight
  // from that return value so this never has to re-derive it.
  function celebrateStreak(count) {
    const layer = document.getElementById("streak-toast-layer");
    if (!layer) return;
    const toast = document.createElement("div");
    toast.className = "streak-toast";
    toast.innerHTML = `<span>\u{1F525}</span><span>${count}-day streak!</span>`;
    layer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("in"));
    setTimeout(() => {
      toast.classList.remove("in");
      setTimeout(() => toast.remove(), 350);
    }, 2600);
    burstConfetti(document.getElementById("streak-chip"));
  }

  // ---- Save-failure warning ----
  // data/db.js's save() catches quota exhaustion (and Safari private
  // mode) and emits "db:saveFailed" rather than throwing — but until
  // now NOTHING listened to it, so a full disk meant progress silently
  // stopped persisting while the user kept studying and lost the lot.
  // The plumbing existed; this is the missing last mile.
  //
  // Deliberately NOT the 2.6s auto-dismiss the celebration toasts use:
  // losing work is not a thing to mention in passing. This one stays
  // until it's dismissed by hand. Throttled to one visible warning at a
  // time, because save() can fail on every subsequent write and a
  // stack of identical panics helps nobody.
  let saveWarningOpen = false;
  function warnSaveFailed() {
    if (saveWarningOpen) return;
    const layer = document.getElementById("streak-toast-layer");
    if (!layer) return;
    saveWarningOpen = true;
    const toast = document.createElement("div");
    toast.className = "streak-toast save-failed";
    toast.innerHTML =
      `<span>\u{26A0}\u{FE0F}</span>`
      + `<span><strong>Progress isn't saving.</strong><br>`
      + `Device storage is full or unavailable — recent work may be lost. `
      + `Free up space, then reload.</span>`
      + `<button class="save-failed-x" type="button" aria-label="Dismiss">✕</button>`;
    layer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("in"));
    toast.querySelector(".save-failed-x").addEventListener("click", () => {
      toast.classList.remove("in");
      setTimeout(() => { toast.remove(); saveWarningOpen = false; }, 350);
    });
  }

  // Unit/course completion rewards (library.js's checkCompletionRewards)
  // — same toast layer and confetti burst as the streak celebration
  // above, just aimed at whichever wallet chip the reward actually
  // landed in ($ for a money reward, 🪙 for a Token one, the rank chip
  // for XP), so the burst visually originates from where the balance
  // actually changed.
  function celebrateReward(label, reward) {
    const layer = document.getElementById("streak-toast-layer");
    if (!layer) return;
    const icon = reward.type === "money" ? "\u{1F4B0}" : reward.type === "tokens" ? "\u{1FA99}" : "⭐";
    const amountText = reward.type === "money" ? `$${reward.amount}`
      : reward.type === "tokens" ? `${reward.amount} Tokens` : `${reward.amount} XP`;
    const toast = document.createElement("div");
    toast.className = "streak-toast";
    toast.innerHTML = `<span>${icon}</span><span>${label}: +${amountText}</span>`;
    layer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("in"));
    setTimeout(() => {
      toast.classList.remove("in");
      setTimeout(() => toast.remove(), 350);
    }, 2600);
    const burstSelector = reward.type === "money" ? ".vital-wallet" : reward.type === "tokens" ? ".vital-tokens" : "#rank-chip";
    burstConfetti(document.querySelector(burstSelector));
  }

  const CONFETTI_COLORS = ["#f97316", "#f43f5e", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];

  // Small CSS-only burst from the streak badge — no canvas, no library,
  // just a handful of divs animated with a CSS custom-property end state
  // and removed once the animation finishes. Reuses #bolt-layer rather
  // than adding a fourth fixed overlay for one more effect.
  function burstConfetti(originEl) {
    const layer = document.getElementById("bolt-layer");
    if (!layer) return;
    const rect = originEl && originEl.getBoundingClientRect
      ? originEl.getBoundingClientRect()
      : { left: window.innerWidth - 40, top: 16, width: 0, height: 0 };
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;

    for (let i = 0; i < 18; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;   // upward-ish spread
      const dist = 40 + Math.random() * 70;
      piece.style.left = `${cx}px`;
      piece.style.top = `${cy}px`;
      piece.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      piece.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      piece.style.setProperty("--rot", `${Math.random() * 480 - 240}deg`);
      piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 900);
    }
  }

  // ---- Money VFX ----
  // Called from games.js's settle() — the one choke point every arcade
  // payout already goes through — so every game gets this for free
  // instead of each file rolling its own. "win" bursts a few coins up
  // from the wallet badge; "loss" just gives the badge a quick red
  // shake. Both are cheap CSS, no sound (see games/GAMES.md — the
  // requested SFX packs need a purchased license this session doesn't
  // have, so audio stays out of scope here).
  function moneyBurst(kind) {
    const wallet = document.querySelector(".vital-wallet");
    if (!wallet) return;
    if (kind === "loss") {
      wallet.classList.remove("shake");
      void wallet.offsetWidth;   // restart the animation if it's still running
      wallet.classList.add("shake");
      setTimeout(() => wallet.classList.remove("shake"), 420);
      return;
    }
    wallet.classList.remove("pulse-win");
    void wallet.offsetWidth;
    wallet.classList.add("pulse-win");
    setTimeout(() => wallet.classList.remove("pulse-win"), 500);

    const layer = document.getElementById("bolt-layer");
    if (!layer) return;
    const rect = wallet.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    for (let i = 0; i < 6; i++) {
      const coin = document.createElement("span");
      coin.className = "coin-piece";
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
      const dist = 26 + Math.random() * 34;
      coin.style.left = `${cx}px`;
      coin.style.top = `${cy}px`;
      coin.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      coin.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      coin.textContent = "$";
      layer.appendChild(coin);
      setTimeout(() => coin.remove(), 700);
    }
  }

  // Rank-ups are worth announcing, and a reward arriving silently would
  // be worse than no reward. Returns the new rank if one was crossed.
  function checkRankUp(before, after) {
    if (!Dojo.Ranks) return null;
    const a = Dojo.Ranks.rankFor(before), b = Dojo.Ranks.rankFor(after);
    if (a.n === b.n) return null;
    Dojo.Bus.emit("rank:up", { from: a, to: b });
    return b;
  }

  // Awards XP and flies a bolt up to the bar. There is no cap any more,
  // so the granted amount always equals the requested one — the return
  // value is kept because callers animate it.
  function awardCharge(amount, originEl) {
    const before = DB.getXp();
    const gained = DB.addXp(amount);
    if (gained > 0) {
      flyBolt(originEl, gained);
      revealBar(3200);
      if (Dojo.sfx) Dojo.sfx.reward();
    }
    checkRankUp(before, DB.getXp());
    renderCharge();
    return gained;
  }

  function flyBolt(originEl, amount) {
    const layer = document.getElementById("bolt-layer");
    const bar = document.getElementById("charge-bar");
    if (!layer || !bar) return;

    const from = originEl && originEl.getBoundingClientRect
      ? originEl.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight * 0.7, width: 0, height: 0 };
    const to = bar.getBoundingClientRect();

    const bolt = document.createElement("div");
    bolt.className = "flying-bolt";
    bolt.innerHTML = `<span class="fb-icon">\u2B50</span><span class="fb-amount">+${amount}</span>`;
    bolt.style.left = `${from.left + from.width / 2}px`;
    bolt.style.top = `${from.top + from.height / 2}px`;
    layer.appendChild(bolt);

    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);

    requestAnimationFrame(() => {
      bolt.style.transform = `translate(${dx}px, ${dy}px) scale(0.55)`;
      bolt.style.opacity = "0";
    });

    setTimeout(() => {
      bolt.remove();
      bar.classList.add("pulse");
      setTimeout(() => bar.classList.remove("pulse"), 420);
    }, 900);
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { renderCharge, awardCharge, flyBolt, checkRankUp, renderStreak, celebrateStreak, celebrateReward, warnSaveFailed, moneyBurst, burstConfetti, renderVitals });
})();
