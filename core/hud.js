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
    const rank = document.getElementById("rank-label");

    if (!p) { fill.style.width = "0%"; value.textContent = `${xp} XP`; return; }
    fill.style.width = `${p.pct}%`;
    value.textContent = p.next ? `${p.into}/${p.span} \u2192 ${p.next.abbr}` : `${xp} XP`;
    if (rank) rank.textContent = `${p.cur.abbr} \u00b7 ${p.cur.name}`;
    bar.classList.toggle("full", !p.next);
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
    if (gained > 0) flyBolt(originEl, gained);
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
    bolt.innerHTML = `<span class="fb-icon">\u26A1</span><span class="fb-amount">+${amount}</span>`;
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
  Object.assign(Dojo, { renderCharge, awardCharge, flyBolt, checkRankUp });
})();
