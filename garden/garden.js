// ================================================
// Knell — GARDEN
// ------------------------------------------------
// Plants = topics. Growth stage is driven by the SM-2 review
// interval, so the Garden pictures RETENTION, not coverage.
// v6 removes the daily dividend payout and puts an explainer where it
// stood. The Garden no longer pays anything directly: it sets the
// daily REPUTATION allowance for the forum, and its surplus is what
// exchanges into $ for cosmetics. Read-only — it writes nothing.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const showScreen = Dojo.showScreen;
  // Bus is gone from this seam: the Garden emitted wallet:changed only
  // for the dividend payout, and it no longer pays anything.
  const startNextDueReview = (...a) => Dojo.startNextDueReview(...a);

  // Which course plots are expanded. Kept across renders so watering a
  // plant doesn't fold the garden up under you.
  const openCourses = new Set();
  let seeded = false;

  // The explainer folds shut by default and stays however the reader
  // left it for the session. Folded by default because it is reference
  // material: someone who already knows the rules should not have to
  // scroll past them every visit to reach their plants.
  let explainOpen = false;

  // ---- Garden ----
  // Growth stage is driven by the SPACED REVIEW interval, not by
  // whether a topic was passed once. A topic you've held on to for
  // months is a tree; one you passed yesterday is a sprout. That makes
  // the garden a picture of retention rather than of coverage — which
  // is the whole point of the review system.
  // Thresholds are review-interval days. Updated in v5 to land on
  // rounder, more reachable numbers — the old 45d/120d tail meant
  // almost nobody would ever see a Tree or a Blossom.
  //
  // `weight` is what the plant contributes to the daily reputation
  // allowance. It MIRRORS the server's garden_weight() and is here only
  // so the Garden can explain itself and show a live figure — the
  // server decides, and it never trusts a number sent from here.
  //
  // Server tiers are interval-based: >=60 pays 3, >=21 pays 2, anything
  // else mastered pays 1, and a topic not in completed_topics pays
  // nothing. That lands on 1/1/2/2/3 across the five mastered stages,
  // which is the split that was decided for the forum.
  const GROWTH = I18N.resolve([
    { min: -1, icon: "\u{1F311}", name: { en: "Fallow", ru: "Пар" },   hint: { en: "Not started", ru: "Не начата" },                 weight: 0 },
    { min: 0,  icon: "\u{1F330}", name: { en: "Seed", ru: "Семя" },     hint: { en: "Attempted, not yet mastered", ru: "Начата, не освоена" }, weight: 0 },
    { min: 1,  icon: "\u{1F331}", name: { en: "Sprout", ru: "Росток" },   hint: { en: "Mastered, held up to 2 days", ru: "Освоена, держится до 2 дней" }, weight: 1 },
    { min: 7,  icon: "\u{1F33F}", name: { en: "Seedling", ru: "Саженец" }, hint: { en: "Held a week", ru: "Держится неделю" },                 weight: 1 },
    { min: 21, icon: "\u{1F33E}", name: { en: "Growing", ru: "Рост" },  hint: { en: "Held three weeks", ru: "Держится три недели" },            weight: 2 },
    { min: 30, icon: "\u{1F333}", name: { en: "Tree", ru: "Дерево" },     hint: { en: "Held a month", ru: "Держится месяц" },                weight: 2 },
    { min: 60, icon: "\u{1F338}", name: { en: "Blossom", ru: "Цветение" },  hint: { en: "Held two months", ru: "Держится два месяца" },             weight: 3 }
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


  // ---- What the Garden is worth ----
  //
  // This REPLACES the daily dividend panel that used to live here.
  // Dividends were cut by decision, but the panel outlived the
  // decision and kept paying — client-side, straight into the wallet,
  // with no server RPC behind it and nothing able to confirm it. That
  // was harmless only for as long as $ bought nothing. The moment
  // themes move into the shop it would have been a money printer, and
  // it flatly contradicts the rule that $ comes from reputation
  // overflow. So it is gone rather than disabled: a panel that pays
  // for a system nobody kept is worse than no panel.
  //
  // What stands in its place is an explanation, because the Garden now
  // feeds something real — the daily reputation allowance.
  //
  // Everything below is ADVISORY. The server recomputes all of it in
  // garden_weight() and rep_allowance() from its own copy of the
  // progress, and takes nothing from the client. If the two ever
  // disagree, the server is right and this display is the bug.

  const REP_DAILY_CAP = 5;   // mirrors least(5, ...) in rep_allowance()
  const WEIGHT_PER_POINT = 5; // mirrors garden_weight() / 5

  // Walks COMPLETED TOPICS, not ALL_TOPICS. That distinction is the
  // whole correctness of this figure: ALL_TOPICS holds only the courses
  // whose content is currently loaded, so a person with six mastered
  // topics in a course they aren't studying right now read as weight 0
  // while the server said 10. The server counts completed_topics and
  // has no idea what the client happens to have loaded; counting
  // anything else here guarantees the two disagree.
  function gardenWeight() {
    let total = 0;
    const rows = {};
    DB.getCompletedTopics().forEach(id => {
      const g = growthFor(id);
      if (!g.weight) return;
      rows[g.name] = rows[g.name] || { icon: g.icon, name: g.name, weight: g.weight, count: 0 };
      rows[g.name].count++;
      total += g.weight;
    });
    return { rows: Object.values(rows), total };
  }

  function repAllowance(weight) {
    return Math.min(REP_DAILY_CAP, Math.floor(weight / WEIGHT_PER_POINT));
  }

  // What the lobby tile shows. The lobby must not compute this itself.
  function gardenSummary() {
    const grown = ALL_TOPICS.filter(t => growthFor(t.id) !== GROWTH[0]).length;
    if (!grown) return I18N.t("ui.sum.gardenEmpty");

    const due = DB.getDueTopicIds().length;
    const bits = [I18N.t("ui.sum.planted", { n: grown, of: ALL_TOPICS.length })];
    // Watering comes first: it's the thing with a deadline.
    // The English plural is dropped rather than translated: Russian
    // needs three forms where English needs two, so both strings were
    // reworded to carry the count after a colon instead.
    if (due) bits.push(I18N.t("ui.sum.needWater", { n: due }));
    // The payout countdown used to sit here. It is not replaced by an
    // allowance figure: the tile is a nudge to come back, and "you can
    // give 3 points today" is not something you act on from the lobby.
    // The Garden itself explains that; a tile repeating it is noise.
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
      // No blind COURSES[0] fallback: a freshly-bought course with
      // nothing planted (e.g. intro-cs the moment you enter it) has no
      // reason to spring open on the very first paint. Fold by default;
      // open only a course that actually has something to show for it.
      const pick =
        COURSES.find(c => (c.unitObjects || []).some(u =>
          (UNIT_TOPICS[u.id] || []).some(t => due.includes(t.id)))) ||
        COURSES.find(c => (c.unitObjects || []).some(u =>
          (UNIT_TOPICS[u.id] || []).some(t => growthFor(t.id) !== GROWTH[0])));
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

    body.appendChild(explainPanel());

    const legend = document.createElement("div");
    legend.className = "garden-legend";
    legend.innerHTML = GROWTH.slice(1).map(g =>
      `<span class="gl-item">${g.icon} ${g.name}</span>`).join("");
    body.appendChild(legend);

    showScreen("garden");
  }

  // ---- The explainer ----
  //
  // Why this exists at all: the Garden is about to stop being only a
  // picture. It sets how much reputation a person may hand out each
  // day, and its overflow is where customisation money comes from.
  // None of that is guessable from looking at plants, and a currency
  // whose rules are not written down reads as arbitrary.
  //
  // It reuses the course-plot fold (.gc-head / .gc-inner) rather than
  // inventing a second kind of collapsible. One fold behaviour on the
  // screen, one caret, one animation.
  function explainPanel() {
    const { rows, total } = gardenWeight();
    const allowance = repAllowance(total);
    const toNext = total >= REP_DAILY_CAP * WEIGHT_PER_POINT
      ? 0
      : WEIGHT_PER_POINT - (total % WEIGHT_PER_POINT);

    const wrap = document.createElement("div");
    wrap.className = `garden-explain${explainOpen ? " open" : ""}`;

    // The head carries the two live numbers, so it is worth reading
    // even folded — the same reason course heads carry planted/due.
    wrap.innerHTML = `
      <button class="gc-head" aria-expanded="${explainOpen}">
        <span class="gc-caret">▸</span>
        <span class="gc-icon">⚖️</span>
        <span class="gc-title">${I18N.t("garden.ex.title")}</span>
        <span class="gc-stat">${I18N.t("garden.ex.weight", { n: total })}</span>
        <span class="gc-duecount">${I18N.t("garden.ex.perDay", { n: allowance })}</span>
      </button>`;

    const inner = document.createElement("div");
    inner.className = "gc-inner";
    const box = document.createElement("div");
    box.className = "gx-box";

    if (explainOpen) {
      box.innerHTML = `
        <p class="gx-lead">${I18N.t("garden.ex.lead")}</p>

        <h4 class="gx-h">${I18N.t("garden.ex.h1")}</h4>
        <p>${I18N.t("garden.ex.give")}</p>
        <ul class="gx-rules">
          <li>${I18N.t("garden.ex.rule1")}</li>
          <li>${I18N.t("garden.ex.rule2")}</li>
          <li>${I18N.t("garden.ex.rule3")}</li>
        </ul>

        <h4 class="gx-h">${I18N.t("garden.ex.h2")}</h4>
        <p>${I18N.t("garden.ex.earn", { per: WEIGHT_PER_POINT, cap: REP_DAILY_CAP })}</p>
        <table class="gx-weights">
          <tbody>${GROWTH.filter(g => g.weight).map(g => `
            <tr><td class="gx-ic">${g.icon}</td>
                <td class="gx-nm">${g.name}</td>
                <td class="gx-hn">${g.hint}</td>
                <td class="gx-wt">${g.weight}</td></tr>`).join("")}
          </tbody>
        </table>
        <p class="gx-you">${rows.length
          ? I18N.t("garden.ex.youHave", { w: total, n: allowance }) +
            (toNext ? " " + I18N.t("garden.ex.toNext", { n: toNext }) : "")
          : I18N.t("garden.ex.youHaveNone")}</p>

        <h4 class="gx-h">${I18N.t("garden.ex.h3")}</h4>
        <p>${I18N.t("garden.ex.overflow", { cap: REP_DAILY_CAP })}</p>
        <p>${I18N.t("garden.ex.oneWay")}</p>

        <p class="gx-soon">${I18N.t("garden.ex.soon")}</p>`;
    }

    inner.appendChild(box);
    wrap.appendChild(inner);
    wrap.querySelector(".gc-head").addEventListener("click", () => {
      explainOpen = !explainOpen;
      renderGarden();
    });
    return wrap;
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
  // gardenWeight is exported because the forum will need the same
  // figure to show an allowance; it must not recompute it from GROWTH
  // itself, or the two displays drift the first time a tier moves.
  Object.assign(Dojo, { GROWTH, growthFor, renderGarden, gardenSummary,
                        gardenWeight, repAllowance });
})();
