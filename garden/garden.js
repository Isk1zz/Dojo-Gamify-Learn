// ================================================
// Knell — GARDEN
// ------------------------------------------------
// Plants = topics. Growth stage is driven by the SM-2 review
// interval, so the Garden pictures RETENTION, not coverage.
// v5 adds daily dividends: each plant pays into the wallet once
// per 24h. Reads reviews from DB; writes only wallet + claim time.
// Emits: wallet:changed
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const showScreen = Dojo.showScreen;
  const Bus = Dojo.Bus;
  const startNextDueReview = (...a) => Dojo.startNextDueReview(...a);

  // Which course plots are expanded. Kept across renders so watering a
  // plant doesn't fold the garden up under you.
  const openCourses = new Set();
  let seeded = false;

  // ---- Garden ----
  // Growth stage is driven by the SPACED REVIEW interval, not by
  // whether a topic was passed once. A topic you've held on to for
  // months is a tree; one you passed yesterday is a sprout. That makes
  // the garden a picture of retention rather than of coverage — which
  // is the whole point of the review system.
  // Thresholds are review-interval days. Updated in v5 to land on
  // rounder, more reachable numbers — the old 45d/120d tail meant
  // almost nobody would ever see a Tree or a Blossom.
  // `pays` is the daily dividend in $ (see claimDividends).
  const GROWTH = I18N.resolve([
    { min: -1, icon: "\u{1F311}", name: { en: "Fallow", ru: "Пар" },   hint: { en: "Not started", ru: "Не начата" },                 pays: 0 },
    { min: 0,  icon: "\u{1F330}", name: { en: "Seed", ru: "Семя" },     hint: { en: "Attempted, not yet mastered", ru: "Начата, не освоена" }, pays: 1 },
    { min: 1,  icon: "\u{1F331}", name: { en: "Sprout", ru: "Росток" },   hint: { en: "Mastered, held up to 2 days", ru: "Освоена, держится до 2 дней" }, pays: 3 },
    { min: 7,  icon: "\u{1F33F}", name: { en: "Seedling", ru: "Саженец" }, hint: { en: "Held a week", ru: "Держится неделю" },                 pays: 5 },
    { min: 21, icon: "\u{1F33E}", name: { en: "Growing", ru: "Рост" },  hint: { en: "Held three weeks", ru: "Держится три недели" },            pays: 7 },
    { min: 30, icon: "\u{1F333}", name: { en: "Tree", ru: "Дерево" },     hint: { en: "Held a month", ru: "Держится месяц" },                pays: 13 },
    { min: 60, icon: "\u{1F338}", name: { en: "Blossom", ru: "Цветение" },  hint: { en: "Held two months", ru: "Держится два месяца" },             pays: 17 }
  ]);
  function growthFor(topicId) {
    const completed = DB.getCompletedTopics();
    const reviews = DB.getReviews();
    const r = reviews[topicId];
    if (!completed.has(topicId)) {
      const stats = DB.getStats();
      const attempted = stats && stats.topicStats[topicId] && stats.topicStats[topicId].attempts > 0;
      return attempted ? GROWTH[1] : GROWTH[0];
    }
    const interval = (r && r.interval) || 1;
    let stage = GROWTH[2];
    GROWTH.forEach(g => { if (g.min >= 1 && interval >= g.min) stage = g; });
    return stage;
  }


  // ---- Dividends ----
  // Every plant pays once per 24h. This is the main non-gambling
  // income line, and it is deliberately tied to REVIEW INTERVAL:
  // the way to earn more is to keep remembering things, not to grind.
  const DIVIDEND_COOLDOWN_MS = 24 * 60 * 60 * 1000;

  function dividendPreview() {
    const rows = {};
    let total = 0;
    ALL_TOPICS.forEach(t => {
      const g = growthFor(t.id);
      if (!g.pays) return;
      rows[g.name] = rows[g.name] || { icon: g.icon, name: g.name, pays: g.pays, count: 0 };
      rows[g.name].count++;
      total += g.pays;
    });
    return { rows: Object.values(rows), total };
  }

  function msUntilClaim() {
    const last = DB.getLastDividendClaim();
    if (!last) return 0;
    const elapsed = Date.now() - new Date(last).getTime();
    return Math.max(0, DIVIDEND_COOLDOWN_MS - elapsed);
  }

  // Returns the amount actually paid. 0 means "nothing to pay" or
  // "too soon" — the caller must not animate a payout that didn't land.
  function claimDividends() {
    if (msUntilClaim() > 0) return 0;
    const { total } = dividendPreview();
    if (total <= 0) return 0;
    DB.addMoney(total);
    DB.setLastDividendClaim(new Date().toISOString());
    Bus.emit("wallet:changed", { delta: total, reason: "dividends" });
    return total;
  }

  function fmtWait(ms) {
    // Round to whole minutes FIRST, then split — otherwise a ceil on the
    // remainder can produce "23h 60m".
    const mins = Math.ceil(ms / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }

  // What the lobby tile shows. The lobby must not compute this itself.
  function gardenSummary() {
    const grown = ALL_TOPICS.filter(t => growthFor(t.id) !== GROWTH[0]).length;
    if (!grown) return I18N.t("ui.sum.gardenEmpty");

    const due = DB.getDueTopicIds().length;
    const wait = msUntilClaim();
    const bits = [I18N.t("ui.sum.planted", { n: grown, of: ALL_TOPICS.length })];
    // Watering comes first: it's the thing with a deadline.
    // The English plural is dropped rather than translated: Russian
    // needs three forms where English needs two, so both strings were
    // reworded to carry the count after a colon instead.
    if (due) bits.push(I18N.t("ui.sum.needWater", { n: due }));
    if (wait === 0) bits.push(I18N.t("ui.sum.toClaim", { n: dividendPreview().total }));
    else bits.push(`payout in ${fmtWait(wait)}`);
    return bits.join(" \u00b7 ");
  }

  function renderGarden() {
    const body = document.getElementById("garden-body");
    body.innerHTML = "";

    const grown = ALL_TOPICS.filter(t => growthFor(t.id) !== GROWTH[0]).length;
    const mature = ALL_TOPICS.filter(t => {
      const g = growthFor(t.id);
      return g === GROWTH[5] || g === GROWTH[6];
    }).length;

    // ---- Review lives here now ----
    // A plant that's due IS a plant that needs watering. The lobby used
    // to carry a separate "Review what's due" tile, which made review a
    // chore in a list; here it's the thing the picture is already about.
    const due = DB.getDueTopicIds();
    const dueTopics = ALL_TOPICS.filter(t => due.includes(t.id));

    if (!seeded) {
      seeded = true;
      // Open the course that needs watering; failing that, the one with
      // anything planted; failing that, the first. Never all of them —
      // opening everything is the same wall of beds with extra clicks.
      const pick =
        COURSES.find(c => (c.unitObjects || []).some(u =>
          (UNIT_TOPICS[u.id] || []).some(t => due.includes(t.id)))) ||
        COURSES.find(c => (c.unitObjects || []).some(u =>
          (UNIT_TOPICS[u.id] || []).some(t => growthFor(t.id) !== GROWTH[0]))) ||
        COURSES[0];
      if (pick) openCourses.add(pick.id);
    }

    const header = document.createElement("div");
    header.className = "garden-header";
    header.innerHTML = `
      <div class="garden-summary">
        <span class="gs-num">${grown}</span> ${I18N.t("garden.planted", { total: ALL_TOPICS.length })}
        ${mature ? `<span class="gs-mature">${I18N.t("garden.fullyGrown", { n: mature })}</span>` : ""}
      </div>
      <p class="garden-note">
        ${I18N.t("garden.note")}
      </p>`;
    body.appendChild(header);

    const water = document.createElement("div");
    water.className = `garden-water${dueTopics.length ? " due" : ""}`;
    water.innerHTML = dueTopics.length
      ? `<div class="gw-left">
           <div class="gd-title">\u{1F6BF} ${dueTopics.length} plant${dueTopics.length === 1 ? "" : "s"} need${dueTopics.length === 1 ? "s" : ""} watering</div>
           <div class="gw-list">${dueTopics.slice(0, 4).map(t => `${t.icon} ${t.title}`).join(" \u00b7 ")}${dueTopics.length > 4 ? ` \u00b7 +${dueTopics.length - 4} more` : ""}</div>
         </div>
         <button id="btn-garden-review" class="btn-primary">${I18N.t("garden.waterFirst")} <span class="arrow">\u2192</span></button>`
      : `<div class="gw-left">
           <div class="gd-title">\u2713 ${I18N.t("garden.nothingToWater")}</div>
           <div class="gw-list">${I18N.t("garden.allHolding")}</div>
         </div>`;
    body.appendChild(water);
    const reviewBtn = water.querySelector("#btn-garden-review");
    if (reviewBtn) reviewBtn.addEventListener("click", () => startNextDueReview());

    // ---- One plot per COURSE, collapsed ----
    //
    // With a single course a flat list of units was fine. With several
    // it becomes a wall of beds you scroll past to reach the one you're
    // actually studying. So the garden is a row per course that slides
    // open, and only the course needing attention opens by default.
    //
    // Grouped by course rather than unit because a course is what a
    // person thinks they're studying; units are how it's filed.
    COURSES.forEach(c => {
      const units = (c.unitObjects || []).filter(u => (UNIT_TOPICS[u.id] || []).length);
      if (!units.length) return;

      const topics = units.flatMap(u => UNIT_TOPICS[u.id] || []);
      const planted = topics.filter(t => growthFor(t.id) !== GROWTH[0]).length;
      const dueHere = topics.filter(t => due.includes(t.id)).length;
      const open = openCourses.has(c.id);

      const wrap = document.createElement("div");
      wrap.className = `garden-course${open ? " open" : ""}`;
      wrap.innerHTML = `
        <button class="gc-head" aria-expanded="${open}">
          <span class="gc-caret">\u25B8</span>
          <span class="gc-icon">${c.icon || "\u{1F4DA}"}</span>
          <span class="gc-title">${c.title}</span>
          <span class="gc-stat">${planted}/${topics.length} planted</span>
          ${dueHere ? `<span class="gc-duecount">\u{1F4A7} ${dueHere}</span>` : ""}
        </button>`;

      // One wrapper inside gc-inner: the grid-rows 0fr -> 1fr slide
      // animates a single child, so beds go in a box, not side by side.
      const inner = document.createElement("div");
      inner.className = "gc-inner";
      const beds = document.createElement("div");
      if (open) units.forEach(u => beds.appendChild(unitPlot(u, due)));
      inner.appendChild(beds);
      wrap.appendChild(inner);

      wrap.querySelector(".gc-head").addEventListener("click", () => {
        if (openCourses.has(c.id)) openCourses.delete(c.id);
        else openCourses.add(c.id);
        renderGarden();
      });

      body.appendChild(wrap);
    });

    // Dividend panel
    const wait = msUntilClaim();
    const preview = dividendPreview();
    const claim = document.createElement("div");
    claim.className = "garden-dividends";
    claim.innerHTML = `
      <div class="gd-left">
        <div class="gd-title">${I18N.t("garden.dailyHarvest")}</div>
        <div class="gd-rows">${preview.rows.length
          ? preview.rows.map(r => `<span class="gd-row">${r.icon} ${r.count} \u00d7 $${r.pays}</span>`).join("")
          : `<span class="gd-row">${I18N.t("garden.nothingPaying")}</span>`}</div>
      </div>
      <button id="btn-claim-dividends" class="btn-primary" ${wait > 0 || !preview.total ? "disabled" : ""}>
        ${preview.total
          ? (wait > 0 ? `Next in ${fmtWait(wait)}` : `Claim $${preview.total}`)
          : I18N.t("garden.nothingToClaim")}
      </button>`;
    body.appendChild(claim);
    const claimBtn = claim.querySelector("#btn-claim-dividends");
    if (claimBtn && !claimBtn.disabled) {
      claimBtn.addEventListener("click", () => {
        if (claimDividends() > 0) renderGarden();
      });
    }

    const legend = document.createElement("div");
    legend.className = "garden-legend";
    legend.innerHTML = GROWTH.slice(1).map(g =>
      `<span class="gl-item">${g.icon} ${g.name}</span>`).join("");
    body.appendChild(legend);

    showScreen("garden");
  }

  // One unit's bed of plants. Returns the element; the caller decides
  // where it goes.
  function unitPlot(u, due) {
    const topics = UNIT_TOPICS[u.id] || [];
    const plot = document.createElement("div");
    plot.className = "garden-plot";
    plot.innerHTML = `<div class="plot-title">${u.icon} ${u.title} \u2014 ${u.subtitle}</div>`;
    const bed = document.createElement("div");
    bed.className = "garden-bed";
    topics.forEach(t => {
      const g = growthFor(t.id);
      const isDue = due.includes(t.id);
      const cell = document.createElement("div");
      cell.className = `garden-cell${g === GROWTH[0] ? " fallow" : ""}${isDue ? " due" : ""}`;
      cell.setAttribute("title", `${t.title} \u2014 ${g.name}: ${g.hint}${isDue ? " \u2014 due for review" : ""}`);
      cell.innerHTML = `
        ${isDue ? `<span class="gc-due" title="${I18N.t("garden.due")}">\u{1F4A7}</span>` : ""}
        <span class="gc-plant">${g.icon}</span>
        <span class="gc-label">${t.title}</span>
        <span class="gc-stage">${g.name}</span>`;
      bed.appendChild(cell);
    });
    plot.appendChild(bed);
    return plot;
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { GROWTH, growthFor, renderGarden, gardenSummary,
                        dividendPreview, claimDividends, msUntilClaim });
})();
