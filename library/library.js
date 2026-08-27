// ================================================
// Knell — LIBRARY (was: Courses)
// ------------------------------------------------
// Courses -> Units -> Topics -> Lesson chunks -> Mastery exam.
// This is the only branch that touches course content. Content
// itself is pure data in library/content/ and is never edited here.
// Emits: chunk:completed, topic:completed, exam:finished, review:finished
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const state = Dojo.state;
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const Bus = Dojo.Bus;
  const shuffled = (...a) => Dojo.shuffled(...a);
  const shuffleQuestion = (...a) => Dojo.shuffleQuestion(...a);
  // Patron tiers discount course prices (shop/tokens.js). Read through
  // this rather than course.priceTokens directly, so what's shown and
  // what's charged can't disagree.
  const coursePrice = c => (Dojo.coursePrice ? Dojo.coursePrice(c) : (c && c.priceTokens) || 0);
  const pickQuote = (...a) => Dojo.pickQuote(...a);
  const quoteHtml = (...a) => Dojo.quoteHtml(...a);
  const awardCharge = (...a) => Dojo.awardCharge(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const showLobby = (...a) => Dojo.showLobby(...a);
  const updateProfileBadge = (...a) => Dojo.updateProfileBadge(...a);

  // Totals other branches ask for instead of walking ALL_TOPICS
  // themselves. Keeps content knowledge inside this branch.
  function libraryTotals() {
    const done = DB.getCompletedTopics();
    return {
      courses: COURSES.length,
      topics: ALL_TOPICS.length,
      completed: ALL_TOPICS.filter(t => done.has(t.id)).length
    };
  }

  // ---- Unit & course completion rewards ----
  // Milestone rewards along the same roadmap spine already drawn for
  // units — a style pass modeled on mobile racing games' career reward
  // tracks (Asphalt Legends and similar): visible chips ON the path
  // itself, not a silent number change. Granted exactly once per unit
  // or course, same inventory-string dedup pattern course ownership
  // and cosmetics already use — see shop/store.js for the live
  // examples (the Arcade unlocks that established it are gone).
  //
  // Deliberately NOT every unit at the same value — see the chat that
  // scoped this for which units carry which reward and why.
  const UNIT_MONEY_REWARD = { 1: 30, 2: 20, 6: 100, 7: 50 };
  // 4/8, not 15/30 — cut ÷4 when intro-cs's priceTokens first dropped
  // 1000 → 250, to keep the Token RETURN roughly proportional to the
  // Token COST. priceTokens dropped again, 250 → 100, without a
  // matching cut here (not requested) — these two plus
  // COURSE_TOKEN_REWARD (below) are now a LARGER share of the course
  // price than that original proportion intended. Doesn't change
  // anything functionally (rank-up Tokens alone already dwarf the
  // course price either way, see shop/ranks.js's comment), but the
  // "stays proportional" framing is now stale — flagging, not
  // re-deriving a new cut without being asked.
  // Money rewards are a separate currency from the course's own price
  // and are untouched.
  const UNIT_TOKEN_REWARD = { 3: 4, 5: 8 };
  // Units 4 and 8 were the two with no completion reward at all — filled
  // with XP instead of money/Tokens on request, since XP is the one
  // thing shop/ranks.js's ladder pacing already accounts for scaling
  // (see its header comment) rather than a currency to balance.
  // 120/240, not 40/80 — scaled up 3x alongside chunk XP (see
  // finishChunk's comment) so a full course lands at a meaningful slice
  // of the ladder instead of ~5% of it.
  const UNIT_XP_REWARD = { 4: 120, 8: 240 };
  // 10, not 40 — same ÷4 cut as the Token unit rewards above.
  const COURSE_TOKEN_REWARD = 10;
  // Separate from FINAL_QUIZ_XP_BASE below, which scales with score and
  // pays out on every attempt — this is a flat, ONE-TIME bonus for the
  // first genuine pass, on top of that. 200, not 100 — scaled up 2x.
  const FINAL_QUIZ_COMPLETION_XP = 200;

  const unitRewardKey = id => `unit_reward_${id}`;
  const courseRewardKey = id => `course_reward_${id}`;

  function unitReward(unitId) {
    if (UNIT_MONEY_REWARD[unitId]) return { type: "money", amount: UNIT_MONEY_REWARD[unitId] };
    if (UNIT_TOKEN_REWARD[unitId]) return { type: "tokens", amount: UNIT_TOKEN_REWARD[unitId] };
    if (UNIT_XP_REWARD[unitId]) return { type: "xp", amount: UNIT_XP_REWARD[unitId] };
    return null;
  }
  const unitRewardClaimed = id => DB.getInventory().includes(unitRewardKey(id));
  const courseRewardClaimed = id => DB.getInventory().includes(courseRewardKey(id));
  // Shared by both reward badges (roadmap chip + list-view badge) so
  // adding a reward type only ever means updating one function.
  function rewardLabel(reward) {
    if (reward.type === "money") return `$${reward.amount}`;
    if (reward.type === "tokens") return `\u{1FA99}${reward.amount}`;
    return `⭐${reward.amount}`;
  }

  // Called right after a topic completes (showExamResults — the only
  // place DB.markTopicComplete runs) — checks whether that topic just
  // finished ITS unit, and whether that unit just finished the whole
  // course, granting each reward exactly once.
  function checkCompletionRewards(topicId) {
    const unit = UNITS.find(u => (UNIT_TOPICS[u.id] || []).some(t => t.id === topicId));
    if (!unit) return;
    const completedTopics = DB.getCompletedTopics();
    const unitTopics = UNIT_TOPICS[unit.id];
    if (!unitTopics.every(t => completedTopics.has(t.id))) return;

    if (!unitRewardClaimed(unit.id)) {
      const reward = unitReward(unit.id);
      if (reward) {
        DB.addInventory(unitRewardKey(unit.id));
        if (reward.type === "money") {
          DB.addMoney(reward.amount);
          Bus.emit("wallet:changed", { delta: reward.amount, reason: "unit-reward" });
        } else if (reward.type === "tokens") {
          DB.addTokens(reward.amount);
          Bus.emit("tokens:changed", { delta: reward.amount, reason: "unit-reward" });
        } else {
          awardCharge(reward.amount, null);
        }
        if (Dojo.celebrateReward) Dojo.celebrateReward(unit.title, reward);
      }
    }

    const course = COURSES.find(c => c.units.includes(unit.id));
    if (course && !courseRewardClaimed(course.id)) {
      const courseUnits = course.units.map(id => UNITS.find(u2 => u2.id === id)).filter(Boolean);
      const courseDone = courseUnits.every(u2 => UNIT_TOPICS[u2.id].every(t => completedTopics.has(t.id)));
      if (courseDone) {
        DB.addInventory(courseRewardKey(course.id));
        DB.addTokens(COURSE_TOKEN_REWARD);
        Bus.emit("tokens:changed", { delta: COURSE_TOKEN_REWARD, reason: "course-reward" });
        if (Dojo.celebrateReward) Dojo.celebrateReward(`${course.title} complete`, { type: "tokens", amount: COURSE_TOKEN_REWARD });
      }
    }
  }

  function renderCourseSelect() {
    const body = document.getElementById("course-select-body");
    body.innerHTML = "";
    const completedTopics = DB.getCompletedTopics();

    // Grouped by TRACK, not one flat grid: mixing a CS course in with
    // four sciences reads as a pile rather than a library, and the
    // problem only gets worse as courses are added. A course with no
    // `track` falls into "other" rather than vanishing.
    const TRACKS = [
      { id: "cs",      label: "\u{1F4BB} " + I18N.t("track.cs") },
      { id: "science", label: "\u{1F52C} " + I18N.t("track.science") },
      { id: "humanities", label: "\u{1F3F5}\uFE0F " + I18N.t("track.humanities") },
      { id: "other",   label: "\u{1F4DA} " + I18N.t("track.other") }
    ];
    const byTrack = new Map(TRACKS.map(t => [t.id, []]));
    COURSES.forEach(c => byTrack.get(byTrack.has(c.track) ? c.track : "other").push(c));

    // Anything not built yet sinks. A shelf that opens with four "Coming
    // soon" cards reads as an empty library, when in fact two courses are
    // finished and sitting below them. Order within each group is left
    // alone — this only moves the unbuilt ones down, it does not sort.
    byTrack.forEach(list => list.sort((a, b) => (a.available === b.available ? 0 : a.available ? -1 : 1)));

    // ...and a whole TRACK with nothing built in it sinks too, for the
    // same reason: Sciences is four scaffolds today, and it should not
    // stand between the reader and the courses they can actually open.
    const ordered = [...TRACKS].sort((a, b) => {
      const has = id => (byTrack.get(id) || []).some(c => c.available);
      return has(a.id) === has(b.id) ? 0 : has(a.id) ? -1 : 1;
    });

    ordered.forEach(t => {
      const list = byTrack.get(t.id);
      if (!list.length) return;          // no empty headings

      const head = document.createElement("div");
      head.className = "course-track-title";
      head.textContent = t.label;
      body.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "topic-grid course-track-grid";

      list.forEach(c => {
      // A lazy course (intro-cs) holds no content in memory until it is
      // opened, so its real topics are simply not here yet. The manifest
      // carries the counts for exactly this moment, and check-content.js
      // holds those numbers to the truth.
      //
      // Progress reading 0 is not a guess: a lazy course is priced, and
      // an unowned course cannot have been studied. Owned ones are
      // preloaded (see preloadOwnedCourses), so they show real numbers.
      const loaded = !Content.isLoaded || Content.isLoaded(c.id);
      const topics = loaded ? c.units.flatMap(id => UNIT_TOPICS[id] || []) : [];
      const unitCount = loaded ? c.units.length : (c.unitOutline || []).length;
      const topicCount = loaded ? topics.length : (Content.declaredTopics(c.id) || 0);
      const done = topics.filter(t => completedTopics.has(t.id)).length;
      const pct = topicCount ? Math.round((done / topicCount) * 100) : 0;

      // A priced course (see registry.js's priceTokens) not yet bought
      // is the second genuine hard-lock, same treatment as "not built
      // yet" below — Dojo.ownsCourse always returns true for a free
      // course, so this is a no-op for every course today.
      const locked = c.priceTokens > 0 && Dojo.ownsCourse && !Dojo.ownsCourse(c.id);

      const card = document.createElement("div");
      // The one genuine hard-lock in the app — everything inside an
      // available course is open (no gate on topic order), but a course
      // that isn't built yet really can't be entered. Red, with a brief
      // reason on hover, same treatment as the roadmap's ahead/yellow
      // explanation below.
      card.className = `topic-card course-card${c.available && !locked ? "" : " ahead restricted"}`;
      if (!c.available) card.setAttribute("data-explain", "Not open yet — this course is still being built.");
      else if (locked) card.setAttribute("data-explain", `Costs 🪙 ${coursePrice(c)} — click to view & buy.`);
      card.innerHTML = `
        <div class="topic-num">${c.icon}</div>
        <div class="topic-title">${c.title}</div>
        <div class="topic-desc">${c.subtitle}</div>
        <div class="topic-meta">
          <span>${unitCount} units</span>
          <span>·</span>
          <span>${topicCount} topics</span>
          <span>·</span>
          <span>${pct}% complete</span>
          ${!c.available ? `<span class="topic-badge ahead-badge">${I18N.t("lib.comingSoon")}</span>` : ""}
          ${c.available && locked ? `<span class="topic-badge ahead-badge">🪙 ${coursePrice(c)}</span>` : ""}
        </div>
        <div class="course-progress"><div class="course-progress-fill" style="width:${pct}%"></div></div>
      `;
      if (c.available && locked) {
        card.addEventListener("click", () => showCourseBuyModal(c));
      } else if (c.available) {
        card.addEventListener("click", () => {
          const enter = () => {
            state.currentCourse = c.id;
            // Resolves immediately for an eager course; for a lazy one
            // this is where its content actually arrives. Rendering
            // before it lands would show a course with no units.
            Content.load(c.id, CONTENT).then(() => {
              renderUnitSelect();
              showScreen("unit-select");
            });
          };
          if (DB.hasSignedContract(c.id)) enter();
          else showContractModal(c, enter);
        });
      }
      grid.appendChild(card);
      });
      body.appendChild(grid);
    });

    showScreen("course-select");
  }

  // ---- Course contract ----
  // A funny, in-theme "sign here" gimmick — an old-school drawable
  // signature pad, shown once the first time a course is entered. Not
  // a real personal-data form: nothing here is validated, required, or
  // sent anywhere. See data/db.js's v9 migration note and
  // DB.signContract for where the drawing actually goes (a downsized
  // dataURL in the profile, same place everything else already lives).
  function showContractModal(course, onSigned) {
    const overlay = document.getElementById("contract-modal");
    if (!overlay) { onSigned(); return; }
    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="modal-card contract-card">
        <div class="modal-close" id="contract-close">✕</div>
        <div class="contract-seal">📜</div>
        <h2 class="modal-title">${I18N.t("contract.title")}</h2>
        <p class="contract-subtitle">${course.icon} ${course.title}</p>
        <div class="contract-body">
          <p>${I18N.t("contract.intro")}</p>
          <ul class="contract-terms">
            <li>${I18N.t("contract.c1")}</li>
            <li>${I18N.t("contract.c2")}</li>
            <li>${I18N.t("contract.c3")}</li>
            <li>${I18N.t("contract.c4")}</li>
          </ul>
          <p class="contract-plant-note">${I18N.t("contract.plantNote")}</p>
          <p class="contract-fineprint">${I18N.t("contract.fineprint")}</p>
        </div>
        <div class="contract-pad-wrap">
          <canvas id="contract-canvas" class="contract-canvas" width="440" height="140"></canvas>
          <div class="contract-pad-line">${I18N.t("contract.signHere")}</div>
        </div>
        <div class="chunk-actions">
          <button id="contract-clear" class="btn-ghost">${I18N.t("contract.clear")}</button>
          <button id="contract-sign" class="btn-primary" disabled>${I18N.t("contract.sign")}</button>
        </div>
      </div>`;

    // Wired after closeContract exists (defined below with the canvas
    // listeners it has to clean up) — function declarations hoist, so
    // this reads in DOM order without a forward-reference problem.
    overlay.querySelector("#contract-close").addEventListener("click", () => closeContract());

    const canvas = document.getElementById("contract-canvas");
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--text").trim() || "#fff";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    let drawing = false, hasInk = false;

    // Canvas backing size vs. CSS size can differ (devicePixelRatio,
    // responsive width) — scale pointer coordinates into canvas space
    // rather than assuming a 1:1 pixel match.
    function posFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      return {
        x: (point.clientX - rect.left) * (canvas.width / rect.width),
        y: (point.clientY - rect.top) * (canvas.height / rect.height)
      };
    }
    function start(e) {
      e.preventDefault();
      drawing = true;
      const p = posFromEvent(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      const p = posFromEvent(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      if (!hasInk) {
        hasInk = true;
        document.getElementById("contract-sign").disabled = false;
      }
    }
    function end() { drawing = false; }

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    // On WINDOW, not the canvas, so releasing the button outside the pad
    // still ends the stroke. That also means it outlives the modal's
    // markup — the canvas listeners die with the element when the
    // overlay is rewritten, this one would not. Every course entry
    // would leave another copy behind, so it is removed explicitly on
    // both ways out (close and sign) via closeContract below.
    window.addEventListener("mouseup", end);
    function closeContract() {
      window.removeEventListener("mouseup", end);
      overlay.style.display = "none";
    }

    document.getElementById("contract-clear").addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasInk = false;
      document.getElementById("contract-sign").disabled = true;
    });

    document.getElementById("contract-sign").addEventListener("click", () => {
      // Downsized JPEG, not a full-resolution PNG — this is a doodle,
      // not a document, and it lives in localStorage next to everything
      // else in the profile.
      DB.signContract(course.id, canvas.toDataURL("image/jpeg", 0.7));
      closeContract();
      onSigned();
    });
  }

  // ---- Locked-course buy modal ----
  // Clicking a locked course used to jump straight to the Token Shop,
  // which turned "buy this course" into a two-step hunt: land on the
  // shop, then find the separate Priced Courses section further down
  // the page — reported live as "it just redirects me to the shop"
  // (read as the purchase not working at all, when it was really just
  // not discoverable). This shows the course's own structure and a buy
  // button right where the course was clicked; the Token Shop is now
  // only where you go to buy MORE Tokens, not to buy a course itself.
  function showCourseBuyModal(course, onUnlocked) {
    const overlay = document.getElementById("course-buy-modal");
    if (!overlay) { Router.go("token-shop"); return; }
    // A lazy course (intro-cs) hasn't loaded its units into memory yet
    // at buy time -- that only happens once it's entered, which is
    // gated BEHIND this very purchase. Same fallback the course-card
    // grid already uses: unitOutline's counts, not the (empty) real
    // units.
    const loaded = !Content.isLoaded || Content.isLoaded(course.id);
    const unitList = loaded
      ? course.units.map(id => UNITS.find(u => u.id === id)).filter(Boolean)
      : (course.unitOutline || []).map(u => ({
          icon: "\u{1F4D8}",
          title: I18N.t("course.unitLine", { id: u.id }),
          subtitle: I18N.t("course.unitTopics", { n: u.topics })
        }));
    const tokens = DB.getTokens();
    const afford = tokens >= coursePrice(course);

    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-close" id="course-buy-close">✕</div>
        <div class="contract-seal">${course.icon}</div>
        <h2 class="modal-title">${course.title}</h2>
        <p class="contract-subtitle">${course.subtitle}</p>
        ${course.about ? `
          <details class="sources-box course-about" open>
            <summary class="sources-label">\u{1F4D3} ${I18N.t("course.about")}</summary>
            <div class="course-about-body">${course.about}</div>
          </details>` : ""}
        <div class="contract-body">
          <p>${I18N.t("course.unitsCount", { n: unitList.length })}</p>
          <ul class="contract-terms">
            ${unitList.map(u => `<li>${u.icon} ${u.title} — ${u.subtitle}</li>`).join("")}
          </ul>
        </div>
        <div class="chunk-actions">
          ${afford
            ? `<button id="course-buy-confirm" class="btn-primary">${I18N.t("course.unlockFor")} 🪙 ${coursePrice(course)}</button>`
            : `<button id="course-buy-getmore" class="btn-primary">${I18N.t("course.needMore", { n: "🪙 " + (coursePrice(course) - tokens) })}</button>`}
        </div>
      </div>`;

    overlay.querySelector("#course-buy-close").addEventListener("click", () => {
      overlay.style.display = "none";
    });
    const confirmBtn = overlay.querySelector("#course-buy-confirm");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        if (Dojo.buyCourse && Dojo.buyCourse(course.id)) {
          overlay.style.display = "none";
          if (Dojo.renderVitals) Dojo.renderVitals();
          if (onUnlocked) onUnlocked(); else renderCourseSelect();
        }
      });
    }
    const getMoreBtn = overlay.querySelector("#course-buy-getmore");
    if (getMoreBtn) {
      getMoreBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        Router.go("token-shop");
      });
    }
  }

  function renderUnitSelect() {
    const body = document.getElementById("unit-select-body");
    body.innerHTML = "";
    const completedTopics = DB.getCompletedTopics();
    const course = COURSES.find(c => c.id === state.currentCourse);
    const unitsToShow = course ? UNITS.filter(u => course.units.includes(u.id)) : UNITS;

    // "What is this course and who is it for" — the course manifest's
    // `about` field, if it has one. Sits above the unit list because
    // this screen is the first thing after entering a course, which is
    // where the question actually gets asked. Collapsed by default:
    // someone on their fifth session does not need the pitch again,
    // and <details> remembers nothing, which is the right amount of
    // memory for this.
    if (course && course.about) {
      const about = document.createElement("details");
      about.className = "sources-box course-about";
      about.innerHTML = `
        <summary class="sources-label">\u{1F4D3} ${I18N.t("course.about")}</summary>
        <div class="course-about-body">${course.about}</div>`;
      body.appendChild(about);
    }

    // Same List/Map toggle as the topic screen, same reason it's
    // session-only — see renderTopicMap.
    if (!state.unitMapView) state.unitMapView = "map";
    const toggle = document.createElement("div");
    toggle.className = "topic-view-toggle";
    toggle.innerHTML = `
      <button class="tvt-btn${state.unitMapView === "map" ? " active" : ""}" data-view="map">\u{1F5FA}\u{FE0F} ${I18N.t("ui.view.map")}</button>
      <button class="tvt-btn${state.unitMapView === "list" ? " active" : ""}" data-view="list">\u{1F4CB} ${I18N.t("ui.view.list")}</button>`;
    toggle.querySelectorAll(".tvt-btn").forEach(b => {
      b.addEventListener("click", () => {
        state.unitMapView = b.getAttribute("data-view");
        renderUnitSelect();
      });
    });
    body.appendChild(toggle);

    // Entry point for the custom deck builder — right after entering a
    // course, alongside the unit picker rather than buried inside a
    // single topic's roadmap bubble.
    const deckBtn = document.createElement("button");
    deckBtn.className = "deck-builder-entry";
    deckBtn.type = "button";
    deckBtn.innerHTML = `\u{1F5C2}️ Build a Custom Deck`;
    deckBtn.addEventListener("click", openDeckBuilder);
    body.appendChild(deckBtn);

    // Mock exam, for a course whose manifest declares one. Built by
    // library/exam-sim.js and asked for rather than constructed here,
    // so this file needs to know nothing about clocks or pass marks —
    // and the whole feature drops out cleanly with its script tag.
    if (Dojo.examSimEntry) {
      const simBtn = Dojo.examSimEntry(course);
      if (simBtn) body.appendChild(simBtn);
    }

    // Cumulative Final Quiz — sits at the BOTTOM of the unit list now
    // (below units, either view), not right next to the unit picker —
    // moved there on request so it reads as "after you've worked
    // through the units" rather than competing with them for the first
    // thing you see.
    //
    // Locked until every unit is complete — a deliberate reversal of
    // this app's usual "no hard locks" rule (PROJECT.md §5), confirmed
    // explicitly before building rather than assumed. Everything else
    // in the Library stays unlocked; this is the one exception, because
    // a CUMULATIVE exam covering all 8 units genuinely doesn't mean
    // anything taken early.
    const addFinalQuizEntry = () => {
      if (typeof FINAL_QUIZ_QUESTIONS === "undefined" || !FINAL_QUIZ_QUESTIONS.length) return;
      const allDone = unitsToShow.every(u => UNIT_TOPICS[u.id].every(t => completedTopics.has(t.id)));
      const fq = DB.getFinalQuiz();
      const sub = !allDone
        ? "Locked — finish every unit first"
        : fq.attempts
          ? `Best: ${fq.bestScore}%${fq.completedAt ? " · passed" : ""}`
          : "All units complete — ready when you are";
      const quizBtn = document.createElement("button");
      quizBtn.className = `deck-builder-entry${allDone ? "" : " locked"}`;
      quizBtn.type = "button";
      if (!allDone) quizBtn.disabled = true;
      quizBtn.innerHTML = `${allDone ? "\u{1F393}" : "\u{1F512}"} Final Quiz <span class="deck-builder-entry-sub">${sub}</span>`;
      if (allDone) quizBtn.addEventListener("click", startFinalQuiz);
      body.appendChild(quizBtn);
    };

    if (state.unitMapView === "map") {
      renderUnitRoadmap(unitsToShow, body, completedTopics);
      addFinalQuizEntry();
      updateProfileBadge();
      return;
    }

    const grid = document.createElement("div");
    grid.className = "topic-grid";

    unitsToShow.forEach((u, i) => {
      const topics = UNIT_TOPICS[u.id];
      const done = topics.filter(t => completedTopics.has(t.id)).length;
      const pct = topics.length > 0 ? Math.round((done / topics.length) * 100) : 0;
      // Locked — see PROJECT.md §5's "No hard locks" reversal note.
      // Same prereq rule renderUnitRoadmap uses: the immediately
      // preceding unit must be fully mastered.
      const prereqDone = i === 0 || DB.getUnitsUnlocked() || UNIT_TOPICS[unitsToShow[i - 1].id].every(t => completedTopics.has(t.id));
      const isAhead = pct < 100 && !prereqDone;

      const reward = unitReward(u.id);
      const rewardBadge = reward
        ? `<span class="topic-badge reward-badge${unitRewardClaimed(u.id) ? " claimed" : ""}">
             ${rewardLabel(reward)}
           </span>`
        : "";

      const card = document.createElement("div");
      card.className = `topic-card${isAhead ? " ahead" : ""}`;
      if (isAhead) card.setAttribute("data-explain", `Locked — finish “${unitsToShow[i - 1].title}” first.`);
      card.innerHTML = `
        <div class="topic-num">${isAhead ? "\u{1F512}" : u.icon}</div>
        <div class="topic-title">${u.title} — ${u.subtitle}</div>
        <div class="topic-desc">${topics.length} topics across ${u.modules.length} module${u.modules.length !== 1 ? "s" : ""}.</div>
        <div class="topic-meta">
          <span>${done}/${topics.length} mastered</span>
          <span>·</span>
          <span>${pct}% complete</span>
          ${pct === 100 ? '<span class="topic-badge mastered">✓ Mastered</span>' : ""}
          ${isAhead ? '<span class="topic-badge ahead-badge">\u{1F512} Locked</span>' : ""}
          ${rewardBadge}
        </div>
      `;
      if (isAhead) {
        card.style.cursor = "not-allowed";
      } else {
        card.addEventListener("click", () => selectUnit(u.id));
      }
      grid.appendChild(card);
    });

    body.appendChild(grid);
    addFinalQuizEntry();
    updateProfileBadge();
  }

  // ---- Unit roadmap (bubble-node map view, one level up from renderRoadmap) ----
  // Same winding-spine idea as the topic roadmap, one level up: each
  // UNIT is a bubble, its TOPICS are the satellite dots orbiting it
  // (instead of a topic's chunks). This is what "connect units and
  // topics to the same map" meant — the unit screen was still the old
  // grid while topics got the roadmap treatment, so the two levels
  // didn't read as one continuous thing. Reuses the exact same CSS
  // classes as renderRoadmap (.roadmap-wrap/-node/-bubble/...) since
  // nothing about them is actually topic-specific.
  function renderUnitRoadmap(unitsToShow, body, completedTopics) {
    const wrap = document.createElement("div");
    wrap.className = "roadmap-wrap";
    body.appendChild(wrap);

    const points = [];
    // Starts at 60, not right at the wrap's own top edge — the first
    // bubble's cluster-ring (116px, centered on the point) pokes about
    // 58px above its own center, so anything shorter than that lets
    // the ring visually overlap whatever sits directly above the
    // roadmap (the "Build a Custom Deck" entry, in unit-select's case).
    let y = 60;
    unitsToShow.forEach((u, i) => {
      const xPct = 50 + ROADMAP_AMP * Math.sin(i * 1.15);
      points.push({ u, i, x: xPct, y });
      y += ROADMAP_ROW;
    });

    // The course-completion chest — the track's actual finish line, one
    // more stop past the last unit. Only drawn when unitsToShow is a
    // real course's full unit list (state.currentCourse set), not the
    // "every course's units at once" fallback renderUnitSelect uses
    // when no course is selected.
    const course = COURSES.find(c => c.id === state.currentCourse);
    const chestPoint = course ? { x: 50, y } : null;
    if (chestPoint) y += ROADMAP_ROW * 0.7;
    wrap.style.height = `${y}px`;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "roadmap-spine");
    svg.setAttribute("viewBox", `0 0 100 ${y}`);
    svg.setAttribute("preserveAspectRatio", "none");
    const spinePoints = chestPoint ? [...points, chestPoint] : points;
    let d = `M${spinePoints[0].x},${spinePoints[0].y} `;
    for (let i = 1; i < spinePoints.length; i++) {
      const p0 = spinePoints[i - 1], p1 = spinePoints[i];
      const midY = (p0.y + p1.y) / 2;
      d += `C${p0.x},${midY} ${p1.x},${midY} ${p1.x},${p1.y} `;
    }
    svg.innerHTML = `<path d="${d}" fill="none" vector-effect="non-scaling-stroke"/>`;
    wrap.appendChild(svg);

    points.forEach(({ u, i, x, y }) => {
      const topics = UNIT_TOPICS[u.id];
      const done = topics.filter(t => completedTopics.has(t.id)).length;
      const isCompleted = topics.length > 0 && done === topics.length;
      const prereqDone = i === 0 || DB.getUnitsUnlocked() || (() => {
        const prevTopics = UNIT_TOPICS[unitsToShow[i - 1].id];
        return prevTopics.every(t => completedTopics.has(t.id));
      })();
      const isCurrent = prereqDone && !isCompleted;
      const isAhead = !prereqDone && !isCompleted;
      // Locked — see PROJECT.md §5's "No hard locks" reversal note.
      const explain = isAhead
        ? `Locked — finish “${unitsToShow[i - 1].title}” first.`
        : "";

      // Milestone reward chip — the "career track" styling: a small
      // badge riding on the node itself showing what this unit pays
      // out, dimmed once claimed rather than disappearing (a claimed
      // milestone is still part of the story of the track, same reason
      // a completed node keeps its ring instead of going bare).
      const reward = unitReward(u.id);
      const rewardChip = reward ? `
        <div class="roadmap-reward-chip${unitRewardClaimed(u.id) ? " claimed" : ""}">
          ${rewardLabel(reward)}
        </div>` : "";

      const node = document.createElement("div");
      node.className = `roadmap-node${isCompleted ? " completed" : ""}${isCurrent ? " current" : ""}${isAhead ? " ahead" : ""}`;
      node.style.left = `${x}%`;
      node.style.top = `${y}px`;
      node.innerHTML = `
        <div class="roadmap-cluster-ring"></div>
        <button class="roadmap-bubble" title="${u.title}"${explain ? ` data-explain="${explain}"` : ""}>
          <span class="roadmap-bubble-inner">${isCompleted ? "✓" : isAhead ? "\u{1F512}" : u.icon}</span>
        </button>
        ${rewardChip}
        <div class="roadmap-label">${u.title}</div>
      `;

      // Topic satellites — one dot per topic, same ring math as a
      // topic's chunk dots. Clicking one jumps straight into that
      // topic (via selectUnit, which is the only thing that can
      // legally populate state.currentTopics first). Locked along
      // with the unit itself — a topic inside a locked unit isn't
      // independently reachable.
      const n = topics.length;
      for (let t = 0; t < n; t++) {
        const angle = (-90 + t * (360 / n)) * Math.PI / 180;
        const dx = 44 * Math.cos(angle), dy = 44 * Math.sin(angle);
        const dot = document.createElement("button");
        dot.className = `roadmap-chunk-dot${completedTopics.has(topics[t].id) ? " done" : ""}${isAhead ? " locked" : ""}`;
        dot.style.transform = `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        dot.title = isAhead ? `${topics[t].title} — locked` : topics[t].title;
        if (!isAhead) {
          dot.addEventListener("click", e => {
            e.stopPropagation();
            selectUnit(u.id);
            startTopic(t);
          });
        }
        node.appendChild(dot);
      }

      if (!isAhead) {
        node.querySelector(".roadmap-bubble").addEventListener("click", () => selectUnit(u.id));
      }
      wrap.appendChild(node);
    });

    if (chestPoint && course) {
      const claimed = courseRewardClaimed(course.id);
      const chestNode = document.createElement("div");
      chestNode.style.position = "absolute";
      chestNode.style.left = `${chestPoint.x}%`;
      chestNode.style.top = `${chestPoint.y}px`;
      chestNode.innerHTML = `
        <div class="roadmap-chest${claimed ? " claimed" : ""}" title="${course.title} complete">
          <span>\u{1F3C6}</span>
          <span class="roadmap-chest-amount">\u{1FA99}${COURSE_TOKEN_REWARD}</span>
        </div>
        <div class="roadmap-chest-label">${I18N.t("lib.courseComplete")}</div>
      `;
      wrap.appendChild(chestNode);
    }
  }

  function selectUnit(unitId) {
    state.currentUnit = unitId;
    state.currentTopics = UNIT_TOPICS[unitId];
    showScreen("topic-map");
    renderTopicMap();
  }

  // ---- Topic Map (scoped to state.currentUnit) ----
  function renderTopicMap() {
    const unit = UNITS.find(u => u.id === state.currentUnit);
    const body = document.getElementById("topic-map-body");
    // state.currentUnit can outlive the unit it names: a course whose
    // script tag was dropped, a unit id that changed, or Router.back()
    // landing here after the state moved on. Without this the next line
    // reads .title off undefined and the screen comes up blank with a
    // console error — the same failure LIBRARY.md's Gotchas already
    // records for renderExamQuestion. renderUnitSelect guards the same
    // way for a missing course; this one was simply missed.
    if (!unit) {
      showScreen("unit-select");
      renderUnitSelect();
      return;
    }
    document.getElementById("topic-map-unit-label").textContent = `${unit.title} · ${unit.subtitle}`;
    body.innerHTML = "";

    // Two views over the same unit, same topics, same nav — List is the
    // original grid-by-module, Map is the bubble-node roadmap
    // (renderRoadmap below). A session-only toggle, not persisted: this
    // is a "how do I want to look at it right now" choice, not a
    // profile setting like theme or lobby style.
    if (!state.topicMapView) state.topicMapView = "map";
    const toggle = document.createElement("div");
    toggle.className = "topic-view-toggle";
    toggle.innerHTML = `
      <button class="tvt-btn${state.topicMapView === "map" ? " active" : ""}" data-view="map">\u{1F5FA}\u{FE0F} ${I18N.t("ui.view.map")}</button>
      <button class="tvt-btn${state.topicMapView === "list" ? " active" : ""}" data-view="list">\u{1F4CB} ${I18N.t("ui.view.list")}</button>`;
    toggle.querySelectorAll(".tvt-btn").forEach(b => {
      b.addEventListener("click", () => {
        state.topicMapView = b.getAttribute("data-view");
        renderTopicMap();
      });
    });
    body.appendChild(toggle);

    const completedTopics = DB.getCompletedTopics();
    const dueIds = DB.getDueTopicIds();
    let globalIdx = 0;

    // Anything due for review is surfaced above the modules. Without
    // this the app is a course you finish once; with it, it's a study
    // system. Spacing is one of only two techniques rated high-utility
    // in the literature, and it needs no new content.
    if (dueIds.length) {
      const dueTopics = state.currentTopics.filter(t => dueIds.includes(t.id));
      if (dueTopics.length) {
        const due = document.createElement("div");
        due.className = "due-section";
        due.innerHTML = `
          <div class="due-header">
            <span class="due-icon">🔁</span>
            <span class="due-title">${I18N.t("lib.dueTitle")}</span>
            <span class="due-count">${dueTopics.length}</span>
          </div>
          <div class="due-hint">${I18N.t("lib.dueHint")}</div>
          <div class="due-grid"></div>`;
        body.appendChild(due);
        const dueGrid = due.querySelector(".due-grid");
        dueTopics.forEach(t => {
          const idx = state.currentTopics.findIndex(x => x.id === t.id);
          const chip = document.createElement("button");
          chip.className = "due-chip";
          chip.innerHTML = `<span>${t.icon}</span> ${t.title}`;
          chip.addEventListener("click", () => startTopic(idx));
          dueGrid.appendChild(chip);
        });
      }
    }

    if (state.topicMapView === "map") {
      renderRoadmap(unit, body, completedTopics, dueIds);
      updateGlobalProgress();
      updateProfileBadge();
      return;
    }

    unit.modules.forEach((mod) => {
      const section = document.createElement("div");
      section.className = "module-section";

      const modDone = mod.topics.filter(t => completedTopics.has(t.id)).length;
      const modPct = Math.round((modDone / mod.topics.length) * 100);

      section.innerHTML = `
        <div class="module-header">
          <span class="module-icon">${mod.icon}</span>
          <span class="module-title">${mod.title}</span>
          <div class="module-progress">
            <div class="module-progress-bar">
              <div class="module-progress-fill" style="width:${modPct}%"></div>
            </div>
            <span>${modDone}/${mod.topics.length}</span>
          </div>
        </div>
        <div class="topic-grid"></div>
      `;

      body.appendChild(section);
      const grid = section.querySelector(".topic-grid");

      mod.topics.forEach((topic) => {
        const flatIdx = globalIdx;
        const isCompleted = completedTopics.has(topic.id);
        const isDue = dueIds.includes(topic.id);
        // Everything is open. The old hard lock enforced blocked
        // practice (the thing interleaving beats) and removed choice
        // (the autonomy need that actually drives motivation). Order
        // is now a recommendation, not a gate.
        const isAvailable = true;
        const prereqDone = flatIdx === 0 || completedTopics.has(state.currentTopics[flatIdx - 1].id);
        const isRecommended = prereqDone && !isCompleted;
        const isAhead = !prereqDone && !isCompleted;
        const isCurrent = isRecommended;
        const dueIn = isCompleted ? DB.daysUntilDue(topic.id) : null;

        const card = document.createElement("div");
        card.className = `topic-card${isCompleted ? " completed" : ""}${isCurrent ? " current" : ""}${isDue ? " due" : ""}${isAhead ? " ahead" : ""}`;
        if (isAhead) card.setAttribute("data-explain", `Locked — finish “${state.currentTopics[flatIdx - 1].title}” first.`);
        card.innerHTML = `
          ${isAhead ? "" : `<button class="topic-cards-btn" title="Flashcards for this topic">\u{1F5C2}\u{FE0F}</button>`}
          <div class="topic-num">${isCompleted ? "✓" : isAhead ? "\u{1F512}" : flatIdx + 1}</div>
          <div class="topic-title">${topic.icon} ${topic.title}</div>
          <div class="topic-desc">${topic.desc}</div>
          <div class="topic-meta">
            <span>${topic.chunks.length} chunks</span>
            <span>·</span>
            <span>${topic.examQuestions.length}-q exam</span>
            ${isDue ? '<span class="topic-badge due-badge">🔁 Due now</span>'
              : isCompleted ? `<span class="topic-badge mastered">✓ Review in ${dueIn}d</span>` : ""}
            ${isRecommended ? '<span class="topic-badge recommended">→ Recommended next</span>' : ""}
            ${isAhead ? '<span class="topic-badge ahead-badge">\u{1F512} Locked</span>' : ""}
          </div>
        `;

        if (isAhead) {
          card.style.cursor = "not-allowed";
        } else {
          card.addEventListener("click", () => startTopic(flatIdx));
          card.querySelector(".topic-cards-btn").addEventListener("click", e => {
            e.stopPropagation();
            startFlashcardReview(topic);
          });
        }
        grid.appendChild(card);
        globalIdx++;
      });
    });

    updateGlobalProgress();
    updateProfileBadge();
  }

  // ---- Roadmap (bubble-node map view) ----
  // Same topics, same nav, same completion/due state as the list above —
  // just laid out as a winding path of topic bubbles instead of a
  // module-grouped grid, with each topic's chunks as small satellite
  // dots orbiting it (same hub-and-spoke idea as the Star lobby layout
  // in core/lobby.js — computed in JS for the same reason: variable
  // content per topic, not a fixed CSS nth-child pattern).
  const ROADMAP_ROW = 158;      // vertical spacing between topic bubbles
  const ROADMAP_DIVIDER = 78;   // extra vertical space for a module label
  const ROADMAP_AMP = 30;       // how far bubbles swing left/right, in %

  function renderRoadmap(unit, body, completedTopics, dueIds) {
    const topics = state.currentTopics;

    // Where each module's label sits: the flatIdx of its first topic.
    const moduleAt = {};
    let running = 0;
    unit.modules.forEach(mod => { moduleAt[running] = mod; running += mod.topics.length; });

    const wrap = document.createElement("div");
    wrap.className = "roadmap-wrap";
    body.appendChild(wrap);

    // Pass 1: positions. y accumulates a row per topic plus a divider
    // whenever a module starts; x swings in a sine wave so consecutive
    // bubbles never sit directly above one another.
    const points = [];
    // See renderUnitRoadmap's identical comment — the cluster-ring pokes
    // above the point it's centered on, so the wrap needs real headroom.
    let y = 60;
    topics.forEach((topic, i) => {
      if (moduleAt[i]) y += ROADMAP_DIVIDER;
      const xPct = 50 + ROADMAP_AMP * Math.sin(i * 1.15);
      points.push({ topic, i, x: xPct, y });
      y += ROADMAP_ROW;
    });
    wrap.style.height = `${y}px`;

    // Connecting spine: one smooth path through every bubble center,
    // each segment an S-curve (control points at the shared vertical
    // midpoint) so it reads as a winding trail, not a zigzag of straight
    // lines.
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "roadmap-spine");
    svg.setAttribute("viewBox", `0 0 100 ${y}`);
    svg.setAttribute("preserveAspectRatio", "none");
    let d = `M${points[0].x},${points[0].y} `;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1], p1 = points[i];
      const midY = (p0.y + p1.y) / 2;
      d += `C${p0.x},${midY} ${p1.x},${midY} ${p1.x},${p1.y} `;
    }
    svg.innerHTML = `<path d="${d}" fill="none" vector-effect="non-scaling-stroke"/>`;
    wrap.appendChild(svg);

    const completedChunks = DB.getCompletedChunks();

    points.forEach(({ topic, i, x, y }) => {
      const mod = moduleAt[i];
      if (mod) {
        const modDone = mod.topics.filter(t => completedTopics.has(t.id)).length;
        const label = document.createElement("div");
        label.className = "roadmap-module-label";
        label.style.top = `${y - ROADMAP_DIVIDER + 6}px`;
        label.innerHTML = `<span class="module-icon">${mod.icon}</span> ${mod.title}
          <span class="roadmap-module-count">${modDone}/${mod.topics.length}</span>`;
        wrap.appendChild(label);
      }

      const isCompleted = completedTopics.has(topic.id);
      const isDue = dueIds.includes(topic.id);
      const prereqDone = i === 0 || completedTopics.has(topics[i - 1].id);
      const isCurrent = prereqDone && !isCompleted;
      const isAhead = !prereqDone && !isCompleted;
      // Locked, not just "further down the list" — see PROJECT.md §5's
      // "No hard locks" section for the reversal note and why this
      // exists now. The reason is still shown on hover; it's just a
      // reason for the lock now; it used to excuse the ABSENCE of one.
      const explain = isAhead
        ? `Locked — finish “${topics[i - 1].title}” first.`
        : "";

      const node = document.createElement("div");
      node.className = `roadmap-node${isCompleted ? " completed" : ""}${isCurrent ? " current" : ""}${isDue ? " due" : ""}${isAhead ? " ahead" : ""}`;
      node.style.left = `${x}%`;
      node.style.top = `${y}px`;
      node.innerHTML = `
        <div class="roadmap-cluster-ring"></div>
        <button class="roadmap-bubble" title="${topic.title}"${explain ? ` data-explain="${explain}"` : ""}>
          <span class="roadmap-bubble-inner">${isCompleted ? "✓" : isAhead ? "\u{1F512}" : topic.icon}</span>
        </button>
        ${isAhead ? "" : `<button class="roadmap-cards-btn" title="Flashcards for this topic">\u{1F5C2}\u{FE0F}</button>`}
        <div class="roadmap-label">${topic.title}</div>
      `;

      // Chunk satellites — one dot per chunk, evenly spaced in a ring
      // around the bubble. Same angle formula as the Star lobby hub.
      // Locked past the furthest chunk actually reached (or every dot,
      // if the whole topic is locked) — see the note above.
      const done = completedChunks[topic.id] || new Set();
      const n = topic.chunks.length;
      let maxReached = 0;
      for (let c = 0; c < n; c++) if (done.has(c)) maxReached = Math.max(maxReached, c + 1);
      maxReached = Math.min(maxReached, n - 1);

      for (let c = 0; c < n; c++) {
        const angle = (-90 + c * (360 / n)) * Math.PI / 180;
        const dx = 44 * Math.cos(angle), dy = 44 * Math.sin(angle);
        const chunkLocked = isAhead || c > maxReached;
        const dot = document.createElement("button");
        dot.className = `roadmap-chunk-dot${done.has(c) ? " done" : ""}${chunkLocked ? " locked" : ""}`;
        dot.style.transform = `translate(-50%, -50%) translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        dot.title = chunkLocked ? `Chunk ${c + 1} — locked` : `Chunk ${c + 1}`;
        if (!chunkLocked) {
          dot.addEventListener("click", e => { e.stopPropagation(); startTopic(i, c); });
        }
        node.appendChild(dot);
      }

      if (!isAhead) {
        node.querySelector(".roadmap-bubble").addEventListener("click", () => startTopic(i));
        node.querySelector(".roadmap-cards-btn").addEventListener("click", e => {
          e.stopPropagation();
          startFlashcardReview(topic);
        });
      }
      wrap.appendChild(node);
    });
  }

  function updateGlobalProgress() {
    // Ring reflects progress within the CURRENTLY SELECTED unit only.
    const completedTopics = DB.getCompletedTopics();
    const total = state.currentTopics.length;
    const done = state.currentTopics.filter(t => completedTopics.has(t.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("global-pct").textContent = pct + "%";
    const circle = document.getElementById("global-progress");
    const circumference = 2 * Math.PI * 20;
    circle.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  }

  // ---- Lesson ----
  function startTopic(flatIdx, forceChunk) {
    state.missedChunks = [];
    state.inRetry = false;
    state.topicCharge = 0;
    // Resets on every fresh walk through a topic, including a redo
    // after exhausting the one exam retry — see showExamResults.
    state.examAttempts = 0;
    state.currentTopicIdx = flatIdx;
    const topic = state.currentTopics[flatIdx];
    // completedChunks has been recorded since the first version and was
    // never read by anything. This is what it was for: come back to the
    // first chunk you haven't finished, not to the start of the topic.
    state.currentChunk = (typeof forceChunk === "number")
      ? forceChunk
      : DB.resumeChunkFor(topic.id, topic.chunks.length);
    state.chunkPhase = phasesFor(topic.chunks[state.currentChunk])[0];
    state.quizAnswer = null;
    state.quizSubmitted = false;
    state.predictAnswer = null;
    DB.setPosition(state.currentUnit, topic.id, state.currentChunk);
    showScreen("lesson");
    renderChunk();
  }

  function getTopic() {
    return state.currentTopics[state.currentTopicIdx];
  }

  // ---- The five-phase chunk flow ----
  //
  //   predict -> explain -> example -> apply -> recall
  //
  // `predict` and `recall` are OPTIONAL. A chunk without them runs the
  // old three-phase flow untouched, so every existing module keeps
  // working and new content can adopt the phases one chunk at a time.
  // This is why the schema was frozen before the remaining Unit 8
  // modules were written — retrofitting ~60 chunks later would have
  // cost far more than an optional field costs now.
  //
  // The evidence, so a later change doesn't undo it by accident:
  //   PREDICT — a question asked BEFORE instruction. Guessing wrong
  //     still improves later retention (the pretesting effect); the
  //     value is in the attempt, not the answer, so it is never scored
  //     and never counts against the learner.
  //   RECALL — a free-text prompt with NO options at the end. Producing
  //     an answer beats recognising one (the generation effect), which
  //     is exactly what multiple choice can't test. Self-graded,
  //     because grading free text offline isn't possible and a wrong
  //     self-grade costs nothing here.
  //
  // `apply` is the existing multiple-choice question, renamed in the
  // flow but still `chunk.quiz` in the data — renaming the field would
  // invalidate saved progress for no gain.
  // Labels read through I18N.t at BUILD of this object, not at render.
  // Safe because the language is fixed for the life of the page \u2014 see
  // core/i18n.js on why switching reloads \u2014 and it keeps the lookup out
  // of the render path, which runs on every click.
  const PHASE_META = {
    predict: { key: "predict", icon: "\u{1F52E}", label: I18N.t("phase.predict"), next: I18N.t("next.predict") },
    explain: { key: "explain", icon: "\u{1F4D6}", label: I18N.t("phase.explain"), next: I18N.t("next.explain") },
    example: { key: "example", icon: "\u{1F9EA}", label: I18N.t("phase.example"), next: I18N.t("next.example") },
    apply:   { key: "quiz",    icon: "\u2753",     label: I18N.t("phase.apply"),   next: I18N.t("next.default") },
    recall:  { key: "recall",  icon: "\u{1F9E0}", label: I18N.t("phase.recall"),  next: I18N.t("next.default") }
  };

  // The phases this chunk actually has, in order.
  function phasesFor(chunk) {
    const list = [];
    if (chunk.predict) list.push("predict");
    list.push("explain", "example", "quiz");
    if (chunk.recall) list.push("recall");
    return list;
  }

  function phaseStep(dir) {
    const topic = getTopic();
    const list = phasesFor(topic.chunks[state.currentChunk]);
    const i = list.indexOf(state.chunkPhase);
    return list[i + dir] || null;
  }

  // ---- Chunk-question shuffling ----
  //
  // Chunk questions used to render in the order they were written, and
  // that order was badly skewed: module 3 answered B on ten of eleven
  // questions, module 4 on sixteen of eighteen. Pressing B cleared
  // units 6-7 without reading a word.
  //
  // Exams have shuffled per attempt since v2 (startExam). This gives
  // chunk questions the same treatment, which fixes every existing
  // module and every future one in one place — the alternative was
  // hand-rebalancing 57 answer keys and hoping the next author is
  // careful. Content standards still ask for a real A-D spread; this
  // just means a lapse can no longer be exploited.
  //
  // Local rather than core's shuffleQuestion because a chunk quiz
  // carries an `explanation` that must survive the copy.
  function shuffleOptions(q) {
    const order = shuffled(q.options.map((_, i) => i));
    return {
      ...q,
      options: order.map(i => q.options[i]),
      correct: order.indexOf(q.correct)
    };
  }

  // Shuffled ON ENTRY to the phase and parked in state — never inside
  // renderQuiz, which runs again on every click. Reshuffling under a
  // selected answer would move the option out from under the cursor.
  function openQuiz() {
    const topic = getTopic();
    state.quizView = shuffleOptions(topic.chunks[state.currentChunk].quiz);
    state.quizViewFor = topic.id + ":" + state.currentChunk;
    state.quizAnswer = null;
    state.quizSubmitted = false;
    state.chunkPhase = "quiz";
  }

  // Falls back to the written order if we somehow arrive at the quiz
  // without going through openQuiz — a wrong order beats a crash.
  function quizView(chunk) {
    const key = getTopic().id + ":" + state.currentChunk;
    return (state.quizViewFor === key && state.quizView) ? state.quizView : chunk.quiz;
  }

  function renderChunk() {
    const topic = getTopic();
    const chunk = topic.chunks[state.currentChunk];
    const body = document.getElementById("lesson-body");

    // Progress counts real phases, so a chunk with predict/recall shows
    // an honest bar instead of one that jumps.
    const totalPhases = topic.chunks.reduce((n, c) => n + phasesFor(c).length, 0);
    const before = topic.chunks.slice(0, state.currentChunk)
      .reduce((n, c) => n + phasesFor(c).length, 0);
    const currentPhase = before + phasesFor(chunk).indexOf(state.chunkPhase) + 1;
    document.getElementById("lesson-progress-fill").style.width = (currentPhase / totalPhases * 100) + "%";
    document.getElementById("chunk-counter").textContent = `${state.currentChunk + 1}/${topic.chunks.length}`;

    if (state.chunkPhase === "predict") renderPredict(body, chunk);
    else if (state.chunkPhase === "explain") renderExplain(body, chunk);
    else if (state.chunkPhase === "example") renderExample(body, chunk);
    else if (state.chunkPhase === "quiz") renderQuiz(body, chunk);
    else if (state.chunkPhase === "recall") renderRecall(body, chunk);
  }

  // ---- Phase 1: PREDICT (optional) ----
  //
  // Asked BEFORE any instruction. Getting it wrong is fine and expected
  // — the pretesting effect comes from the attempt, not the answer. So:
  // never scored, never recorded in stats, never counted as a miss, and
  // the learner is told outright that guessing is the point. Scoring it
  // would turn the strongest thing about this phase into a punishment
  // for not already knowing the material.
  function renderPredict(body, chunk) {
    const topic = getTopic();
    const p = chunk.predict;
    const answered = state.predictAnswer !== null && state.predictAnswer !== undefined;

    body.innerHTML = `
      <div class="chunk-card">
        <div class="chunk-phase predict">\u{1F52E} ${I18N.t("phase.predict")}</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <p class="predict-nudge">${I18N.t("predict.nudge")}</p>
        <div class="quiz-question">${p.question}</div>
        <div class="quiz-options" id="predict-options">
          ${p.options.map((o, i) => `
            <button class="quiz-option${state.predictAnswer === i ? " selected" : ""}" data-idx="${i}">
              <span class="qo-letter">${"ABCD"[i]}</span><span class="qo-text">${o}</span>
            </button>`).join("")}
        </div>
        ${answered ? `<div class="predict-after">${p.reveal || "Hold that thought \u2014 read on and see."}</div>` : ""}
        <div class="chunk-actions">
          <button id="btn-next-phase" class="btn-primary" ${answered ? "" : "disabled"}>
            ${I18N.t("next.predict")} <span class="arrow">\u2192</span>
          </button>
        </div>
      </div>`;

    body.querySelectorAll("#predict-options .quiz-option").forEach(b =>
      b.addEventListener("click", () => {
        state.predictAnswer = Number(b.getAttribute("data-idx"));
        renderChunk();
      }));

    document.getElementById("btn-next-phase").addEventListener("click", () => {
      state.chunkPhase = "explain";
      renderChunk();
    });
  }

  // ---- Phase 5: RECALL (optional) ----
  //
  // Free text, no options, self-graded. Producing an answer beats
  // recognising one, which is the thing multiple choice structurally
  // cannot test. Self-grading is honest about what an offline app can
  // do: nothing here can mark prose, and a generous self-grade costs
  // the learner nothing because it isn't scored either.
  function renderRecall(body, chunk) {
    const topic = getTopic();
    const r = chunk.recall;
    const isLastChunk = state.currentChunk >= topic.chunks.length - 1;

    body.innerHTML = `
      <div class="chunk-card">
        <div class="chunk-phase recall">\u{1F9E0} ${I18N.t("phase.recall")}</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <p class="predict-nudge">${I18N.t("recall.nudge")}</p>
        <div class="quiz-question">${r.prompt}</div>
        <textarea id="recall-input" class="recall-input" rows="4"
                  placeholder="${I18N.t("recall.placeholder")}"></textarea>
        <div class="chunk-actions">
          <button id="btn-prev-phase" class="btn-ghost">${I18N.t("btn.backToQuestion")}</button>
          <button id="btn-reveal-recall" class="btn-primary">${I18N.t("recall.reveal")}</button>
        </div>
        <div id="recall-model"></div>
      </div>`;

    document.getElementById("btn-prev-phase").addEventListener("click", () => {
      state.chunkPhase = phaseStep(-1) || "quiz";
      renderChunk();
    });

    document.getElementById("btn-reveal-recall").addEventListener("click", () => {
      const wrote = (document.getElementById("recall-input").value || "").trim();
      document.getElementById("recall-model").innerHTML = `
        <div class="recall-model">
          <div class="rm-label">${I18N.t("recall.model")}</div>
          <div class="rm-text">${r.answer}</div>
          ${r.points && r.points.length ? `
            <div class="rm-label">${I18N.t("recall.points")}</div>
            <ul class="rm-points">${r.points.map(pt => `<li>${pt}</li>`).join("")}</ul>` : ""}
          ${wrote ? "" : `<div class="rm-nudge">${I18N.t("recall.empty")}</div>`}
        </div>
        <div class="chunk-actions">
          <button id="btn-next-chunk-recall" class="btn-primary">
            ${isLastChunk ? I18N.t("btn.masteryExam") : I18N.t("btn.nextChunk")} <span class="arrow">\u2192</span>
          </button>
        </div>`;
      document.getElementById("btn-next-chunk-recall")
        .addEventListener("click", () => finishChunk(document.getElementById("btn-next-chunk-recall")));
    });
  }

  function renderExplain(body, chunk) {
    // Explanations may be a single `text` string (legacy, modules 1-4) or an
    // array of `blocks` (modules 5+). Blocks let one concept run across several
    // passages with their own sub-headings instead of a single wall of text.
    const blocks = chunk.explain.blocks
      || (chunk.explain.text ? [{ text: chunk.explain.text }] : []);

    const blocksHtml = blocks.map(b => `
      ${b.heading ? `<h3 class="chunk-subhead">${b.heading}</h3>` : ""}
      <div class="chunk-text">${b.text}</div>
    `).join("");

    let analogyHtml = "";
    if (chunk.explain.analogy) {
      analogyHtml = `
        <div class="analogy-box">
          <div class="analogy-label">💡 ${I18N.t("chunk.analogy")}</div>
          <div class="analogy-text">${chunk.explain.analogy}</div>
        </div>`;
    }

    // Citations let a reader verify any claim in the chunk against a real,
    // findable source rather than taking the app's word for it.
    let sourcesHtml = "";
    if (chunk.explain.sources && chunk.explain.sources.length) {
      const items = chunk.explain.sources.map(src => `
        <li class="source-item">
          <span class="source-ref">${src.ref}</span>
          ${src.note ? `<span class="source-note">${src.note}</span>` : ""}
        </li>`).join("");
      sourcesHtml = `
        <details class="sources-box">
          <summary class="sources-label">📚 ${I18N.t("chunk.sources")}</summary>
          <ul class="sources-list">${items}</ul>
        </details>`;
    }

    body.innerHTML = `
      <div class="chunk-section">
        <div class="chunk-phase explain">📖 ${I18N.t("phase.explain")}</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        ${blocksHtml}
        ${analogyHtml}
        ${sourcesHtml}
        <div class="btn-row">
          <button id="btn-next-phase" class="btn-primary">${I18N.t("next.explain")} <span class="arrow">→</span></button>
        </div>
      </div>
    `;
    document.getElementById("btn-next-phase").addEventListener("click", () => {
      state.chunkPhase = "example";
      renderChunk();
    });
  }

  function renderExample(body, chunk) {
    const stepsHtml = chunk.example.steps.map((s, i) =>
      `<div class="flow-step"><span class="flow-num">${i + 1}</span><span>${s}</span></div>`
    ).join("");

    body.innerHTML = `
      <div class="chunk-section">
        <div class="chunk-phase example">🧪 ${I18N.t("phase.example")}</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <div class="example-box">
          <div class="example-label">${chunk.example.label}</div>
          <div class="example-flow">${stepsHtml}</div>
        </div>
        <div class="btn-row">
          <button id="btn-prev-phase" class="btn-ghost">← ${I18N.t("chunk.backToExplain")}</button>
          <button id="btn-next-phase" class="btn-primary">${I18N.t("next.example")} <span class="arrow">→</span></button>
        </div>
      </div>
    `;
    document.getElementById("btn-prev-phase").addEventListener("click", () => {
      state.chunkPhase = phaseStep(-1) || "explain";
      renderChunk();
    });
    document.getElementById("btn-next-phase").addEventListener("click", () => {
      openQuiz();
      renderChunk();
    });
  }

  function renderQuiz(body, chunk) {
    // The shuffled copy, never chunk.quiz — same discipline as the exam
    // grading against state.examQuestions.
    const q = quizView(chunk);
    const letters = ["A", "B", "C", "D", "E", "F"];
    const topic = getTopic();

    const optionsHtml = q.options.map((opt, i) => {
      let cls = "quiz-opt";
      if (state.quizSubmitted) {
        if (i === q.correct) cls += " correct";
        else if (i === state.quizAnswer && i !== q.correct) cls += " wrong";
      } else if (state.quizAnswer === i) {
        cls += " selected";
      }
      return `<div class="${cls}" data-idx="${i}">
        <span class="quiz-letter">${letters[i]}</span>
        <span>${opt}</span>
      </div>`;
    }).join("");

    let feedbackHtml = "";
    if (state.quizSubmitted) {
      const isCorrect = state.quizAnswer === q.correct;
      feedbackHtml = `
        <div class="quiz-feedback ${isCorrect ? "correct" : "wrong"}">
          <div class="fb-title">${isCorrect ? I18N.t("quiz.correct") : I18N.t("quiz.notQuite")}</div>
          <div>${q.explanation}</div>
        </div>`;
    }

    const isLastChunk = state.currentChunk >= topic.chunks.length - 1;
    // A chunk with a recall phase isn't done at the quiz — the button
    // below actually hands off to Recall next (see the click handler),
    // so it must not promise the exam directly, even on the last chunk.
    // Recall's own final button (renderRecall) is the one that
    // genuinely says "Take the Mastery Exam".
    const goesToRecallNext = chunk.recall && !state.inRetry;
    const nextBtnText = goesToRecallNext ? `${I18N.t("btn.continue")} →` : (isLastChunk ? `${I18N.t("btn.masteryExam")} 🏆` : `${I18N.t("btn.nextChunk")} →`);

    body.innerHTML = `
      <div class="chunk-section">
        <div class="chunk-phase quiz">❓ ${I18N.t("phase.apply")}</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">${optionsHtml}</div>
        ${feedbackHtml}
        <div class="btn-row">
          <button id="btn-prev-phase" class="btn-ghost">${I18N.t("btn.backToExample")}</button>
          ${!state.quizSubmitted ? `<button id="btn-submit-quiz" class="btn-primary" ${state.quizAnswer === null ? "disabled" : ""}>${I18N.t("btn.checkAnswer")}</button>` : ""}
          ${state.quizSubmitted ? `<button id="btn-next-chunk" class="btn-primary">${nextBtnText}</button>` : ""}
        </div>
      </div>
    `;

    if (!state.quizSubmitted) {
      body.querySelectorAll(".quiz-opt").forEach(opt => {
        opt.addEventListener("click", () => {
          state.quizAnswer = parseInt(opt.dataset.idx);
          renderChunk();
        });
      });
    }

    const submitBtn = document.getElementById("btn-submit-quiz");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (state.quizAnswer === null) return;
        state.quizSubmitted = true;
        // Record quiz result in DB
        const isCorrect = state.quizAnswer === q.correct;
        DB.recordQuizAnswer(topic.id, state.currentChunk, isCorrect);
        // A wrong answer used to have no consequence at all. Now the
        // chunk is queued to be re-asked before the exam, which turns
        // the question from decoration into practice testing.
        if (!isCorrect && !state.inRetry && !state.missedChunks.includes(state.currentChunk)) {
          state.missedChunks.push(state.currentChunk);
        }
        renderChunk();
      });
    }

    document.getElementById("btn-prev-phase").addEventListener("click", () => {
      state.chunkPhase = phaseStep(-1) || "example";
      renderChunk();
    });

    const nextBtn = document.getElementById("btn-next-chunk");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        // A chunk with a recall phase isn't finished at the question —
        // it's finished after the recall. Hand over instead of closing.
        if (chunk.recall && !state.inRetry) {
          state.chunkPhase = "recall";
          renderChunk();
          return;
        }
        finishChunk(nextBtn);
      });
    }
  }

  // Re-ask the questions that were answered wrong, straight to the
  // quiz phase — no re-reading, which is the technique the research
  // rates near the bottom.
  function startMissedRetry() {
    state.inRetry = true;
    state.currentChunk = state.missedChunks.shift();
    // Fresh shuffle on the re-ask too, so a missed question can't be
    // passed the second time from position memory.
    openQuiz();
    renderChunk();
  }

  // ---- Mastery Exam ----
  // Closes out the current chunk and moves on. Called from the question
  // phase, or from recall when the chunk has one — one place, so the XP
  // award and the completion record can't drift apart.
  function finishChunk(originEl) {
    const topic = getTopic();
    const isLastChunk = state.currentChunk >= topic.chunks.length - 1;

    DB.markChunkComplete(topic.id, state.currentChunk);
    // Streak used to touch here, per chunk — moved to showExamResults
    // (only on an actual topic pass), see the comment there for why.
    Bus.emit("chunk:completed", { topicId: topic.id, chunkIdx: state.currentChunk });

    // 15-21 XP per chunk (was 5-7 — scaled up 3x alongside the rank
    // ladder's 5x, see shop/ranks.js's header comment; a full course
    // was landing at ~5% of the ceiling even after the ladder alone
    // moved, which read as stingy for content that's genuinely most of
    // an afternoon's work). Retries don't pay again — otherwise
    // deliberately failing would be the fastest way to farm it.
    if (!state.inRetry) {
      const gain = 15 + Math.floor(Math.random() * 7);
      state.topicCharge = (state.topicCharge || 0) + gain;
      awardCharge(gain, originEl);
    }

    if (state.inRetry) {
      if (state.missedChunks.length) { startMissedRetry(); } else { startExam(); }
      return;
    }
    if (isLastChunk) {
      if (state.missedChunks.length) { startMissedRetry(); } else { startExam(); }
      return;
    }
    state.currentChunk++;
    state.chunkPhase = phasesFor(topic.chunks[state.currentChunk])[0];
    state.quizAnswer = null;
    state.quizSubmitted = false;
    state.predictAnswer = null;
    DB.setPosition(state.currentUnit, topic.id, state.currentChunk);
    renderChunk();
  }

  function startExam() {
    const topic = getTopic();
    // One retry after a fail, then the topic has to be redone — see
    // showExamResults. Counts real exam starts, not button clicks, so
    // it survives however this got called (finishChunk, btn-retry, a
    // missed-questions retry that falls through to the exam).
    state.examAttempts = (state.examAttempts || 0) + 1;
    // Fresh shuffle on every attempt, including retries.
    state.examQuestions = shuffled(topic.examQuestions).map(shuffleQuestion);
    state.examIndex = 0;
    state.examAnswers = [];
    state.examSubmitted = [];
    state.quizAnswer = null;
    state.quizSubmitted = false;
    showScreen("exam");
    renderExamQuestion();
  }

  // ---- Final Quiz (cumulative, all 8 units) ----
  // Reuses the per-topic exam screen (renderExamQuestion only reads
  // getTopic().icon/.title and state.examQuestions, neither of which
  // cares whether the "topic" is real) by feeding it a pseudo-topic
  // instead of building a second exam UI from scratch. `chunks: []` so
  // the one line in showExamResults that reads topic.chunks for a
  // wisdom-quote tag pool doesn't throw — that branch is skipped
  // entirely for the final quiz anyway (see showFinalQuizResults), this
  // is just insurance against the shape being relied on elsewhere later.
  // `state.finalQuizActive` is what actually diverts the result flow;
  // see showExamResults' first line.
  const FINAL_QUIZ_TOPIC = {
    id: "final-quiz", title: "Final Quiz", icon: "\u{1F393}", chunks: [],
    examQuestions: (typeof FINAL_QUIZ_QUESTIONS !== "undefined" ? FINAL_QUIZ_QUESTIONS : [])
  };

  function startFinalQuiz() {
    state.finalQuizActive = true;
    state.currentTopics = [FINAL_QUIZ_TOPIC];
    state.currentTopicIdx = 0;
    state.examAttempts = (state.examAttempts || 0) + 1;
    state.examQuestions = shuffled(FINAL_QUIZ_TOPIC.examQuestions).map(shuffleQuestion);
    state.examIndex = 0;
    state.examAnswers = [];
    state.examSubmitted = [];
    state.quizAnswer = null;
    state.quizSubmitted = false;
    // Stage 2 of Final Quiz anti-farming — see showFinalQuizResults.
    state.finalQuizStartedAt = Date.now();
    showScreen("exam");
    renderExamQuestion();
  }

  function renderExamQuestion() {
    const topic = getTopic();
    const total = state.examQuestions.length;
    const idx = state.examIndex;
    const q = state.examQuestions[idx];
    const body = document.getElementById("exam-body");
    const letters = ["A", "B", "C", "D", "E", "F"];

    document.getElementById("exam-score-display").textContent = `${idx + 1}/${total}`;

    const optionsHtml = q.options.map((opt, i) => {
      let cls = "quiz-opt";
      if (state.examSubmitted[idx]) {
        if (i === q.correct) cls += " correct";
        else if (i === state.examAnswers[idx] && i !== q.correct) cls += " wrong";
      } else if (state.examAnswers[idx] === i) {
        cls += " selected";
      }
      return `<div class="${cls}" data-idx="${i}">
        <span class="quiz-letter">${letters[i]}</span>
        <span>${opt}</span>
      </div>`;
    }).join("");

    let feedbackHtml = "";
    if (state.examSubmitted[idx]) {
      const isCorrect = state.examAnswers[idx] === q.correct;
      feedbackHtml = `
        <div class="quiz-feedback ${isCorrect ? "correct" : "wrong"}">
          <div class="fb-title">${isCorrect ? I18N.t("quiz.correct") : I18N.t("quiz.wrongIs", { letter: letters[q.correct] })}</div>
        </div>`;
    }

    const isLast = idx === total - 1;

    body.innerHTML = `
      <div class="exam-header">
        <h2>${topic.icon} ${topic.title}${state.finalQuizActive ? "" : I18N.t("exam.suffix")}</h2>
        <p>${state.finalQuizActive
          ? I18N.t("exam.cumulative")
          : I18N.t("exam.scoreToMaster")}</p>
      </div>
      <div class="exam-q-counter">${I18N.t("exam.questionCounter", { n: idx + 1, total })}</div>
      <div class="exam-question-card">
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">${optionsHtml}</div>
        ${feedbackHtml}
        <div class="btn-row">
          ${!state.examSubmitted[idx] ? `<button id="btn-exam-submit" class="btn-primary" ${state.examAnswers[idx] === null ? "disabled" : ""}>${I18N.t("btn.checkAnswer")}</button>` : ""}
          ${state.examSubmitted[idx] && !isLast ? `<button id="btn-exam-next" class="btn-primary">${I18N.t("btn.nextQuestion")} <span class="arrow">→</span></button>` : ""}
          ${state.examSubmitted[idx] && isLast ? `<button id="btn-exam-finish" class="btn-primary">${I18N.t("btn.seeResults")} 🏆</button>` : ""}
        </div>
      </div>
    `;

    if (!state.examSubmitted[idx]) {
      body.querySelectorAll(".quiz-opt").forEach(opt => {
        opt.addEventListener("click", () => {
          state.examAnswers[idx] = parseInt(opt.dataset.idx);
          renderExamQuestion();
        });
      });
    }

    const submitBtn = document.getElementById("btn-exam-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (state.examAnswers[idx] === null) return;
        state.examSubmitted[idx] = true;
        if (Dojo.sfx) { if (state.examAnswers[idx] === q.correct) Dojo.sfx.correct(); else Dojo.sfx.wrong(); }
        renderExamQuestion();
      });
    }

    const nextBtn = document.getElementById("btn-exam-next");
    if (nextBtn) nextBtn.addEventListener("click", () => { state.examIndex++; renderExamQuestion(); });

    const finishBtn = document.getElementById("btn-exam-finish");
    if (finishBtn) finishBtn.addEventListener("click", () => showExamResults());
  }

  function showExamResults() {
    // The Final Quiz gets its own result path entirely — see
    // startFinalQuiz's comment on why it can't safely fall through the
    // rest of this function (topic.chunks, DB.recordExamResult keyed on
    // a real topic id, markTopicComplete, scheduleReview — every one of
    // those assumes a real topic).
    if (state.finalQuizActive) { showFinalQuizResults(); return; }
    const topic = getTopic();
    // So the result screen's retry button knows which flow to relaunch —
    // it's shared with finishFlashcards() below.
    state.lastReviewMode = "exam";
    const total = state.examQuestions.length;
    let correct = 0;
    state.examQuestions.forEach((q, i) => {
      if (state.examAnswers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 80;

    // Record exam result in DB
    DB.recordExamResult(topic.id, correct, total, passed);
    Bus.emit("exam:finished", { topicId: topic.id, correct, total, passed });
    // Map percentage onto SM-2's 0-5 quality scale.
    DB.scheduleReview(topic.id, Math.max(0, Math.min(5, Math.round(pct / 20))));
    if (passed) {
      DB.markTopicComplete(topic.id);
      checkCompletionRewards(topic.id);
      // A completed TOPIC is what counts as a "day" for the streak now
      // — moved off finishChunk, which fired once per chunk and let a
      // single sitting through one topic register as several days'
      // worth of streak progress. `changed` is only true on the first
      // qualifying action of a real day, the one moment worth animating.
      const streak = DB.touchStreak();
      if (Dojo.renderStreak) Dojo.renderStreak();
      if (streak && streak.changed && Dojo.celebrateStreak) Dojo.celebrateStreak(streak.count);
    }
    const nextIn = DB.daysUntilDue(topic.id);
    // One retry after a fail (attempt 2), then the exam stops being
    // directly retriable — the topic has to be walked again first.
    // Blocked practice underperforming isn't the concern here (that's
    // the "no hard locks" fight, a different one); this is closer to
    // "score below 80% twice in a row" being a signal that re-reading
    // the exam questions in a loop isn't the fix, going back through
    // the material is.
    state.examMustRedoTopic = !passed && state.examAttempts >= 2;

    document.getElementById("btn-to-topics").textContent = I18N.t("exam.backToTopics");
    document.getElementById("result-icon").textContent = passed ? "🎉" : (state.examMustRedoTopic ? "🔁" : "📚");
    document.getElementById("result-title").textContent = passed ? I18N.t("exam.mastered") : I18N.t("exam.notYet");
    document.getElementById("btn-retry").textContent = state.examMustRedoTopic ? I18N.t("exam.redoTopic") : I18N.t("exam.retry");
    // "1 day" vs "N days" is handled in JS, not the {var} templater --
    // Russian needs three plural forms (1 / 2-4 / 5+), English only two.
    const dayKey = nextIn === 1 ? "exam.timingDays"
      : (nextIn % 10 >= 2 && nextIn % 10 <= 4 && !(nextIn % 100 >= 12 && nextIn % 100 <= 14)) ? "exam.timingDaysFew"
      : "exam.timingDaysMany";
    const timing = I18N.t(dayKey, { n: nextIn });
    document.getElementById("result-desc").textContent = passed
      ? I18N.t("exam.descPassed", { correct, total, title: topic.title, timing })
      : state.examMustRedoTopic
        ? I18N.t("exam.descRedo", { correct, total, title: topic.title })
        : I18N.t("exam.descRetry", { correct, total, title: topic.title });
    const scoreEl = document.getElementById("result-score");
    scoreEl.textContent = `${pct}%`;
    scoreEl.className = `result-score ${passed ? "pass" : "fail"}`;

    // The reward lands on finishing a TOPIC, not a chunk. One quote per
    // topic means ~6 per module against a pool of 58, so nothing repeats
    // and finishing a topic stays worth something.
    // Topic bonus: what the chunks earned, multiplied by how the exam
    // went. 0% -> x0.7, 100% -> x1.5. Rewards finishing well without
    // making a bad run worthless.
    const mult = 0.7 + (pct / 100) * 0.8;
    const bonus = Math.round((state.topicCharge || 0) * mult);
    const bonusEl = document.getElementById("result-charge");
    if (bonusEl) {
      if (bonus > 0) {
        const scoreCard = document.getElementById("result-score");
        const granted = awardCharge(bonus, scoreCard);
        // XP is uncapped, so a grant always lands; the fallback branch
        // that used to say "charge full" can't happen any more.
        bonusEl.innerHTML = `<span class="charge-award">\u26A1 +${granted} XP <span class="ca-mult">(&times;${mult.toFixed(2)} for ${pct}%)</span></span>`;
      } else {
        bonusEl.innerHTML = "";
      }
    }
    state.topicCharge = 0;

    // Topic finished — there's no half-done chunk to come back to.
    if (passed) DB.clearPosition();

    const wisdomEl = document.getElementById("result-wisdom");
    if (wisdomEl) {
      if (passed) {
        // Pool the wisdomTags of every chunk in the topic, so the quote
        // can speak to anything the topic covered.
        const tags = topic.chunks.flatMap(c => c.wisdomTags || []);
        wisdomEl.innerHTML = quoteHtml(pickQuote(tags));
      } else {
        wisdomEl.innerHTML = "";
      }
    }

    showScreen("exam-result");
  }

  // Flat XP bonus rather than the per-topic exam's topicCharge-based
  // one — there's no chunk-walking session to scale off (this can be
  // taken cold, any time), so the reward has to stand on its own. Sized
  // roughly like a strong topic exam finish, not a whole course's worth.
  // 120, not 40 — scaled up 3x alongside chunk XP, see that comment.
  const FINAL_QUIZ_XP_BASE = 120;

  function showFinalQuizResults() {
    state.lastReviewMode = "final-quiz";
    const total = state.examQuestions.length;
    let correct = 0;
    state.examQuestions.forEach((q, i) => { if (state.examAnswers[i] === q.correct) correct++; });
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 80;

    // Checked BEFORE recordFinalQuizResult mutates completedAt — that
    // field is set once, on the first passing attempt, and never again
    // (see data/db.js), which makes it the exact dedup signal a
    // one-time completion bonus needs.
    const isFirstPass = passed && !DB.getFinalQuiz().completedAt;
    const { xpEligible } = DB.recordFinalQuizResult(correct, total, passed);
    Bus.emit("final-quiz:finished", { correct, total, passed });

    // Stage 2 of Final Quiz anti-farming: a genuine cumulative read
    // takes real time, even skimming — a full guess-through clicking
    // options as fast as the UI allows finishes in a couple of
    // seconds. 4s/question is generous (a real fast reader still
    // clears it) while catching that. Stage 1 (data/db.js's daily
    // xpEligible cap) and this are independent checks; either one
    // withholding the per-attempt bonus is enough.
    const elapsedMs = Date.now() - (state.finalQuizStartedAt || Date.now());
    const tooFast = elapsedMs < total * 4000;

    document.getElementById("btn-to-topics").textContent = "Back to Library";
    document.getElementById("result-icon").textContent = passed ? "\u{1F393}" : "\u{1F4DA}";
    document.getElementById("result-title").textContent = passed ? "Final Quiz Passed!" : "Not Quite Yet";
    document.getElementById("btn-retry").textContent = "Retry Final Quiz";
    document.getElementById("result-desc").textContent = passed
      ? `You scored ${correct}/${total} across all 8 units — that's a genuine cumulative pass, not just one topic.`
      : `You scored ${correct}/${total}. 80% passes. Nothing here is graded against you — retry whenever you're ready.`;
    const scoreEl = document.getElementById("result-score");
    scoreEl.textContent = `${pct}%`;
    scoreEl.className = `result-score ${passed ? "pass" : "fail"}`;

    const mult = 0.7 + (pct / 100) * 0.8;
    const bonus = Math.round(FINAL_QUIZ_XP_BASE * mult);
    const bonusEl = document.getElementById("result-charge");
    if (bonusEl) {
      let html = "";
      if (xpEligible && !tooFast) {
        const granted = awardCharge(bonus, scoreEl);
        html = `<span class="charge-award">⚡ +${granted} XP <span class="ca-mult">(&times;${mult.toFixed(2)} for ${pct}%)</span></span>`;
      } else {
        // Withheld, not hidden — explain why rather than silently
        // giving 0, same "no hard locks, but be honest about limits"
        // shape as everywhere else in this app.
        html = `<span class="charge-award full">${tooFast
          ? "No XP this time — that finished too fast for a genuine read."
          : "No XP this time — today's Final Quiz XP cap is used up."}</span>`;
      }
      // One-time completion bonus, on top of the scaled per-attempt one
      // above — separate from it because this one only ever fires once,
      // the first time the Final Quiz is actually passed. Not gated by
      // the daily cap (it can only ever fire once, ever), but still
      // gated by tooFast — a guessed-through "pass" shouldn't be able
      // to claim it either.
      if (isFirstPass && !tooFast) {
        const completionGranted = awardCharge(FINAL_QUIZ_COMPLETION_XP, scoreEl);
        html += `<br><span class="charge-award">\u{1F393} +${completionGranted} XP <span class="ca-mult">first Final Quiz pass</span></span>`;
      }
      bonusEl.innerHTML = html;
    }

    // No per-topic wisdom quote — a cumulative quiz doesn't belong to
    // any one topic's tag pool.
    const wisdomEl = document.getElementById("result-wisdom");
    if (wisdomEl) wisdomEl.innerHTML = "";

    state.finalQuizActive = false;
    showScreen("exam-result");
  }

  // ---- Custom flashcard deck builder ----
  // A learner-curated deck spanning any chunks across any units in the
  // current course, as opposed to buildFlashDeck's whole-topic auto
  // deck below. Cards are still built from each chunk's existing quiz
  // (no separate flashcard content to author, same as the single-topic
  // flow) but ordering and the DB write-back differ — see
  // buildCustomDeck / finishCustomDeck.
  function chunkKey(topicId, idx) { return `${topicId}::${idx}`; }

  // Whether a chunk has the source material a given deck mode needs.
  // "quiz" decks pull the existing chunk.quiz (question/options/
  // correct); "glossary" decks pull chunk.glossary, an optional
  // [{term, definition}] array with no separate content to author
  // beyond that — minimalistic by design (no explanation, no MCQ).
  function chunkHasSource(c, mode) {
    return mode === "glossary" ? !!(c.glossary && c.glossary.length) : !!c.quiz;
  }

  // Worst-known-first: a chunk answered wrong last time surfaces before
  // one never attempted, which surfaces before one answered right last
  // time. There's no chunk-level SM-2 (only topics get an interval —
  // see data/db.js), so this reuses the one per-chunk signal that
  // already exists: DB.getChunkResult's last-mini-quiz-attempt boolean.
  function chunkWeakness(topicId, chunkIdx) {
    const result = DB.getChunkResult(topicId, chunkIdx);
    if (result === false) return 0;
    if (result === undefined) return 1;
    return 2;
  }

  function initDeckBuilderState(course) {
    // Defaults to chunks already completed — reviewing material never
    // studied yet isn't a review. The picker still lets a learner add
    // or remove anything, this is just the starting selection.
    const completed = DB.getCompletedChunks();
    const chunks = new Set();
    course.units.forEach(uid => {
      (UNIT_TOPICS[uid] || []).forEach(t => {
        const done = completed[t.id];
        if (done) done.forEach(idx => chunks.add(chunkKey(t.id, idx)));
      });
    });
    // Empty = no filter, show everything (the common case). Non-empty =
    // only chunks whose last flashcard confidence rating (DB.
    // getChunkConfidence) is in this set — an unrated chunk (never
    // reviewed as a flashcard) is excluded once a filter is active,
    // same as "pick only this subcategory" implies.
    state.deckBuilder = { courseId: course.id, unitIds: new Set(course.units), chunks, mode: "quiz", confidenceFilter: new Set() };
  }

  function openDeckBuilder() {
    const course = COURSES.find(c => c.id === state.currentCourse);
    if (!course) return;
    if (!state.deckBuilder || state.deckBuilder.courseId !== course.id) initDeckBuilderState(course);
    renderDeckBuilder();
    showScreen("deck-builder");
  }

  // Lobby-level entry point — promotes the deck builder out from behind
  // "pick a course first," per the standalone-screen decision (see
  // BACKLOG.md). Only one course exists today, so this just selects it;
  // if a second course ever ships, this is the seam that would need a
  // course picker in front of it. Tracks how the screen was entered so
  // its back button can return to the right place either way.
  function openFlashcardsHub() {
    const course = COURSES[0];
    if (!course) return;
    state.currentCourse = course.id;
    state.deckBuilderFromLobby = true;
    const backBtn = document.getElementById("btn-back-deckbuilder");
    if (backBtn) backBtn.textContent = "← Lobby";

    // A priced, unowned course used to fall straight through into the
    // deck builder anyway — openFlashcardsHub always grabbed COURSES[0]
    // with no ownership check, so pricing intro-cs (Batch 29) silently
    // opened a side door around the Library's own buy gate. Shows an
    // empty/prompt state instead: buy right here (same modal the
    // Library uses), and land straight in the deck builder the moment
    // it's bought — no need to back out and re-enter through Library.
    if (Dojo.ownsCourse && !Dojo.ownsCourse(course.id)) {
      const body = document.getElementById("deck-builder-body");
      if (body) {
        body.innerHTML = `
          <div class="deck-builder-intro" style="text-align:center; padding: 3rem 1rem;">
            <div style="font-size:2.4rem; margin-bottom:0.75rem;">${course.icon}</div>
            <p style="margin-bottom:1rem;">Flashcards are built from ${course.title}'s content — unlock the course to start reviewing.</p>
            <button id="flashcards-void-buy" class="btn-primary">View & buy — 🪙 ${coursePrice(course)}</button>
          </div>`;
        const buyBtn = document.getElementById("flashcards-void-buy");
        if (buyBtn) buyBtn.addEventListener("click", () => showCourseBuyModal(course, openFlashcardsHub));
      }
      showScreen("deck-builder");
      return;
    }
    openDeckBuilder();
  }

  // The lobby tile's one-line summary — same "ask the branch, don't
  // compute it in lobby.js" rule every other tile follows.
  function flashcardsSummary() {
    if (!COURSES.length) return null;
    if (Dojo.ownsCourse && !Dojo.ownsCourse(COURSES[0].id)) return "🔒 " + I18N.t("ui.sum.buyToUnlock");
    const completed = DB.getCompletedChunks();
    let total = 0;
    Object.values(completed).forEach(set => { total += set ? set.size : 0; });
    return total > 0
      ? I18N.t("ui.sum.reviewed", { n: total })
      : I18N.t("ui.sum.flashIdle");
  }

  function renderDeckBuilder() {
    const body = document.getElementById("deck-builder-body");
    const course = COURSES.find(c => c.id === state.currentCourse);
    if (!body || !course) return;
    if (!state.deckBuilder || state.deckBuilder.courseId !== course.id) initDeckBuilderState(course);
    const picker = state.deckBuilder;
    const completed = DB.getCompletedChunks();
    const completedTopics = DB.getCompletedTopics();
    body.innerHTML = "";

    const intro = document.createElement("p");
    intro.className = "deck-builder-intro";
    intro.textContent = "Pick units and chunks to build a review deck. Weakest cards come up first.";
    body.appendChild(intro);

    if (!picker.mode) picker.mode = "quiz";
    const modeToggle = document.createElement("div");
    modeToggle.className = "topic-view-toggle";
    modeToggle.innerHTML = `
      <button class="tvt-btn${picker.mode === "quiz" ? " active" : ""}" data-mode="quiz">❓ Quiz cards</button>
      <button class="tvt-btn${picker.mode === "glossary" ? " active" : ""}" data-mode="glossary">\u{1F4D6} Definitions</button>`;
    modeToggle.querySelectorAll(".tvt-btn").forEach(b => {
      b.addEventListener("click", () => {
        picker.mode = b.getAttribute("data-mode");
        renderDeckBuilder();
      });
    });
    body.appendChild(modeToggle);
    if (picker.mode === "glossary") {
      const note = document.createElement("p");
      note.className = "deck-builder-intro";
      note.textContent = "Term on the front, a short definition on the back — no options, no explanation. Minimalistic, for quick recall drilling.";
      body.appendChild(note);
    }

    // Optional confidence filter — requested explicitly ("make it
    // optional to pick only chosen subcategory"). Empty selection means
    // no filter (default, shows everything); toggling one or more chips
    // narrows the chunk list below to only chunks last rated at one of
    // the selected levels (DB.getChunkConfidence). A chunk never
    // reviewed as a flashcard has no rating and drops out once any
    // filter chip is active — there's no "unrated" category to pick.
    if (!picker.confidenceFilter) picker.confidenceFilter = new Set();
    const filterRow = document.createElement("div");
    filterRow.className = "deck-confidence-filter";
    filterRow.innerHTML = `
      <span class="deck-confidence-filter-label">Filter by confidence:</span>
      ${CONFIDENCE.map(c => `
        <button type="button" class="deck-conf-chip conf-${c.id}${picker.confidenceFilter.has(c.level) ? " active" : ""}" data-level="${c.level}">
          ${c.icon} ${c.label}
        </button>`).join("")}
    `;
    filterRow.querySelectorAll(".deck-conf-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const level = parseInt(chip.getAttribute("data-level"), 10);
        if (picker.confidenceFilter.has(level)) picker.confidenceFilter.delete(level);
        else picker.confidenceFilter.add(level);
        renderDeckBuilder();
      });
    });
    body.appendChild(filterRow);

    // Same prereq rule as renderUnitSelect's list view and
    // renderUnitRoadmap — a locked unit can't supply cards, so it
    // can't be selected here either. Content already reached stays
    // pickable even if the unit ahead of it is locked (nothing about
    // building a review deck should un-complete anything).
    const unitLocked = {};
    course.units.forEach((uid, i) => {
      unitLocked[uid] = i > 0 && !DB.getUnitsUnlocked() && !UNIT_TOPICS[course.units[i - 1]].every(t => completedTopics.has(t.id));
      if (unitLocked[uid]) picker.unitIds.delete(uid);
    });

    const unitRow = document.createElement("div");
    unitRow.className = "deck-unit-row";
    course.units.forEach(uid => {
      const u = UNITS.find(x => x.id === uid);
      if (!u) return;
      const locked = unitLocked[uid];
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = `deck-unit-pill${picker.unitIds.has(uid) ? " active" : ""}${locked ? " locked" : ""}`;
      pill.textContent = locked ? `\u{1F512} ${u.title}` : `${u.icon} ${u.title}`;
      if (locked) {
        pill.disabled = true;
        pill.title = "Locked — finish the previous unit first.";
      } else {
        pill.addEventListener("click", () => {
          if (picker.unitIds.has(uid)) picker.unitIds.delete(uid); else picker.unitIds.add(uid);
          renderDeckBuilder();
        });
      }
      unitRow.appendChild(pill);
    });
    body.appendChild(unitRow);

    const list = document.createElement("div");
    list.className = "deck-topic-list";
    let totalSelected = 0;

    const mode = picker.mode;
    // A term count per chunk, so "Start Review" shows the real card
    // total in glossary mode (one chunk can hold several terms) rather
    // than counting chunks and quietly under-reporting.
    const cardsIn = c => mode === "glossary" ? (c.glossary ? c.glossary.length : 0) : (c.quiz ? 1 : 0);
    // Confidence filter applies on top of chunkHasSource, not instead
    // of it — a chunk still needs real content for this mode either way.
    const passesFilter = (t, idx) => {
      if (picker.confidenceFilter.size === 0) return true;
      return picker.confidenceFilter.has(DB.getChunkConfidence(t.id, idx));
    };

    course.units.filter(uid => picker.unitIds.has(uid)).forEach(uid => {
      const topics = UNIT_TOPICS[uid] || [];
      topics.forEach((t, ti) => {
        const sourceChunks = t.chunks.filter((c, idx) => chunkHasSource(c, mode) && passesFilter(t, idx)).length;
        if (!sourceChunks) return;

        // Within-unit prereq — same rule renderRoadmap uses for a
        // topic's own "ahead" state. A locked topic contributes no
        // chunk toggles; any stale selection in one is dropped rather
        // than silently building a deck from it.
        const topicLocked = ti > 0 && !completedTopics.has(topics[ti - 1].id);
        if (topicLocked) {
          t.chunks.forEach((c, idx) => picker.chunks.delete(chunkKey(t.id, idx)));
          const lockedSection = document.createElement("div");
          lockedSection.className = "deck-topic-section locked";
          lockedSection.innerHTML = `
            <div class="deck-topic-header">
              <span class="deck-topic-title">\u{1F512} ${t.title}</span>
              <span class="deck-topic-count">Locked</span>
            </div>`;
          list.appendChild(lockedSection);
          return;
        }

        const section = document.createElement("div");
        section.className = "deck-topic-section";
        const selectedInTopic = t.chunks.filter((c, idx) => chunkHasSource(c, mode) && passesFilter(t, idx) && picker.chunks.has(chunkKey(t.id, idx))).length;

        const header = document.createElement("div");
        header.className = "deck-topic-header";
        header.innerHTML = `
          <span class="deck-topic-title">${t.title}</span>
          <span class="deck-topic-count">${selectedInTopic}/${sourceChunks}</span>
          <button class="deck-topic-toggle-all" type="button">${selectedInTopic === sourceChunks ? "Clear" : "All"}</button>
        `;
        header.querySelector(".deck-topic-toggle-all").addEventListener("click", () => {
          const allSelected = selectedInTopic === sourceChunks;
          t.chunks.forEach((c, idx) => {
            if (!chunkHasSource(c, mode) || !passesFilter(t, idx)) return;
            const key = chunkKey(t.id, idx);
            if (allSelected) picker.chunks.delete(key); else picker.chunks.add(key);
          });
          renderDeckBuilder();
        });
        section.appendChild(header);

        const chunkRow = document.createElement("div");
        chunkRow.className = "deck-chunk-row";
        t.chunks.forEach((c, idx) => {
          if (!chunkHasSource(c, mode) || !passesFilter(t, idx)) return;
          const key = chunkKey(t.id, idx);
          const selected = picker.chunks.has(key);
          if (selected) totalSelected += cardsIn(c);
          const isDone = completed[t.id] && completed[t.id].has(idx);
          const result = DB.getChunkResult(t.id, idx);
          const stateClass = result === false ? "weak" : result === true ? "known" : "new";
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = `deck-chunk-chip ${stateClass}${selected ? " selected" : ""}`;
          chip.title = c.title;
          chip.innerHTML = `
            <span class="dcc-dot"></span>
            <span class="dcc-title">${c.title}</span>
            ${mode === "glossary" ? `<span class="dcc-new-badge">${c.glossary.length} term${c.glossary.length === 1 ? "" : "s"}</span>` : !isDone ? '<span class="dcc-new-badge">new</span>' : ""}
          `;
          chip.addEventListener("click", () => {
            if (picker.chunks.has(key)) picker.chunks.delete(key); else picker.chunks.add(key);
            renderDeckBuilder();
          });
          chunkRow.appendChild(chip);
        });
        section.appendChild(chunkRow);
        list.appendChild(section);
      });
    });
    body.appendChild(list);

    if (!list.children.length) {
      const empty = document.createElement("p");
      empty.className = "deck-builder-intro";
      empty.textContent = mode === "glossary"
        ? "No definitions written for the selected units yet."
        : "No quiz-backed chunks in the selected units.";
      body.appendChild(empty);
    }

    const footer = document.createElement("div");
    footer.className = "deck-builder-footer";
    footer.innerHTML = `<button id="btn-start-custom-deck" class="btn-primary"${totalSelected === 0 ? " disabled" : ""}>Start Review (${totalSelected} card${totalSelected === 1 ? "" : "s"})</button>`;
    body.appendChild(footer);

    const startBtn = document.getElementById("btn-start-custom-deck");
    if (startBtn && totalSelected > 0) {
      startBtn.addEventListener("click", () => {
        const refs = [];
        course.units.filter(uid => picker.unitIds.has(uid)).forEach(uid => {
          (UNIT_TOPICS[uid] || []).forEach(t => {
            t.chunks.forEach((c, idx) => {
              if (chunkHasSource(c, mode) && picker.chunks.has(chunkKey(t.id, idx))) refs.push({ topic: t, chunkIdx: idx });
            });
          });
        });
        startCustomDeckReview(refs, mode);
      });
    }
  }

  function buildCustomDeck(refs, mode) {
    let cards;
    if (mode === "glossary") {
      // One card PER TERM, not per chunk — a chunk can define several
      // terms, and each is its own minimalistic front/back card with
      // no explanation. The self-report ("knew it"/"didn't") still
      // writes back to the CHUNK's result (DB.recordQuizAnswer takes a
      // chunk index, not a term index — there's no finer-grained slot
      // in the schema), so the last term graded from a multi-term
      // chunk is what that chunk's weakness reflects afterward. Same
      // last-attempt-wins simplification the quiz-card deck already
      // has, just visible across more cards per chunk here.
      cards = [];
      refs.forEach(({ topic, chunkIdx }) => {
        const c = topic.chunks[chunkIdx];
        if (!c || !c.glossary) return;
        c.glossary.forEach(g => {
          cards.push({
            q: g.term,
            a: g.definition,
            explanation: null,
            topicId: topic.id,
            topicTitle: topic.title,
            chunkIdx
          });
        });
      });
    } else {
      cards = refs
        .map(({ topic, chunkIdx }) => {
          const c = topic.chunks[chunkIdx];
          if (!c || !c.quiz) return null;
          return {
            q: c.quiz.question,
            a: c.quiz.options[c.quiz.correct],
            explanation: c.quiz.explanation,
            topicId: topic.id,
            topicTitle: topic.title,
            chunkIdx
          };
        })
        .filter(Boolean);
    }
    // Sort by weakness; ties keep selection order so re-running the
    // same deck doesn't visibly reshuffle cards that didn't change.
    return cards
      .map((card, i) => ({ card, i, w: chunkWeakness(card.topicId, card.chunkIdx) }))
      .sort((a, b) => a.w - b.w || a.i - b.i)
      .map(x => x.card);
  }

  function startCustomDeckReview(refs, mode) {
    state.flashCustom = true;
    state.flashCustomRefs = refs;
    state.flashCustomMode = mode;
    state.flashTopic = null;
    state.flashDeck = buildCustomDeck(refs, mode);
    state.flashIndex = 0;
    state.flashFlipped = false;
    state.flashResults = [];
    state.flashTimings = [];
    state.flashConfidence = {};
    state.flashCardShownAt = Date.now();
    const title = document.getElementById("flashcard-title");
    if (title) title.textContent = mode === "glossary" ? "\u{1F4D6} Definitions" : "\u{1F5C2}️ Custom Deck";
    renderFlashcard();
    showScreen("flashcards");
  }

  // ---- Flashcard review ----
  // What watering a due plant launches (see garden/GARDEN.md) instead of
  // replaying the whole topic. One card per chunk, built from that
  // chunk's existing quiz — no separate flashcard content to author.
  // Self-reported (four levels, not just knew-it/didn't), because
  // there's no multiple-choice to grade automatically; the tally still
  // feeds the same SM-2 quality scale showExamResults() uses, so a
  // review advances the interval exactly like retaking the exam used to.
  //
  // Four self-assessment levels, replacing the old binary "Knew it" /
  // "Didn't know it" — requested explicitly, and also the thing the
  // requeue logic below and the deck builder's category filter both key
  // off. Worst first, matching how they read left-to-right as buttons.
  const CONFIDENCE = [
    { level: 0, id: "difficult",      label: I18N.t("conf.difficult"),      icon: "\u{1F616}" },
    { level: 1, id: "still-learning", label: I18N.t("conf.still-learning"), icon: "\u{1F4D6}" },
    { level: 2, id: "has-idea",       label: I18N.t("conf.has-idea"),       icon: "\u{1F4A1}" },
    { level: 3, id: "known-best",     label: I18N.t("conf.known-best"),     icon: "✅" }
  ];

  // A card that maps onto a chunk, and therefore onto stored progress.
  // Exam-question cards do not: they carry chunkIdx null and are drill
  // material only. Everything that writes to the DB from a deck asks
  // this first.
  const isChunkCard = card => typeof card.chunkIdx === "number";

  function buildFlashDeck(topic) {
    const cards = [];
    topic.chunks.forEach((c, idx) => {
      if (!c.quiz) return;
      cards.push({
        q: c.quiz.question,
        a: c.quiz.options[c.quiz.correct],
        explanation: c.quiz.explanation,
        topicId: topic.id,
        topicTitle: topic.title,
        chunkIdx: idx
      });
    });

    // Then the topic's EXAM questions. They were never cards before,
    // which mattered most where the exam questions are the real study
    // material: the A3 course carries the Ministry's 40 published
    // questions, only 10 of them as chunk quizzes, so thirty of the
    // forty could be met in an exam and nowhere else. Now a topic's
    // deck is its three chunks plus its five exam questions.
    //
    // chunkIdx is null on these ON PURPOSE and every write-back checks
    // for it (see isChunkCard). An exam question does not belong to a
    // chunk, so grading one must not rewrite some chunk's weakness or
    // its spaced-review schedule — that would make the Garden wilt for
    // material the learner never actually failed.
    (topic.examQuestions || []).forEach((q, idx) => {
      cards.push({
        q: q.question,
        a: q.options[q.correct],
        explanation: q.explanation || null,
        topicId: topic.id,
        topicTitle: topic.title,
        chunkIdx: null,
        examIdx: idx
      });
    });

    return cards;
  }

  function startFlashcardReview(topic) {
    state.flashCustom = false;
    state.flashTopic = topic;
    state.flashDeck = buildFlashDeck(topic);
    state.flashIndex = 0;
    state.flashFlipped = false;
    state.flashResults = [];
    state.flashTimings = [];
    state.flashConfidence = {};
    state.flashCardShownAt = Date.now();
    const title = document.getElementById("flashcard-title");
    if (title) title.textContent = "\u{1F4A7} Review";
    renderFlashcard();
    showScreen("flashcards");
  }

  // Both control rows (flip button, the confidence row) are in the DOM
  // from the start now, toggled with display rather than rebuilt — the
  // CSS 3D flip (styles/library.css's .flashcard.flipped) transitions
  // the SAME element over 0.5s; replacing the whole body's innerHTML on
  // flip (the old approach) destroyed and recreated the node already in
  // its flipped state, so the card just popped instead of turning. The
  // confidence row is revealed partway through the turn rather than the
  // instant it starts, so it doesn't appear on the still-front-facing
  // card.
  //
  // Flip is two-way once revealed — reported live: forgetting what was
  // on the other side and having no way back to check without ending
  // the card. Clicking the card face itself toggles front/back freely;
  // the original "Show Answer" button is still what triggers the FIRST
  // reveal (so a fresh card doesn't look interactive before you've
  // engaged with it), and stays hidden once the confidence row is up —
  // no reason to show two different ways to do the same "look at the
  // other side" thing at once.
  function renderFlashcard() {
    const body = document.getElementById("flashcard-body");
    const counter = document.getElementById("flashcard-counter");
    const deck = state.flashDeck;
    const card = deck[state.flashIndex];
    if (counter) counter.textContent = `${state.flashIndex + 1}/${deck.length}`;
    state.flashFlipped = false;

    body.innerHTML = `
      <div class="flashcard-topic">${card.topicTitle}</div>
      <div class="flashcard" id="flashcard-el">
        <div class="flashcard-face flashcard-front">${card.q}</div>
        <div class="flashcard-face flashcard-back">
          <div class="flashcard-answer">${card.a}</div>
          ${card.explanation ? `<div class="flashcard-explain">${card.explanation}</div>` : ""}
        </div>
      </div>
      <button id="btn-flash-flip" class="btn-primary flashcard-flip-btn">${I18N.t("btn.showAnswer")}</button>
      <div id="flashcard-confidence-row" class="flashcard-confidence-row" style="display:none;">
        ${CONFIDENCE.map(c => `
          <button class="flashcard-conf-btn conf-${c.id}" data-level="${c.level}">
            <span class="conf-icon">${c.icon}</span><span class="conf-label">${c.label}</span>
          </button>`).join("")}
      </div>
    `;

    const cardEl = document.getElementById("flashcard-el");
    const flipBtn = document.getElementById("btn-flash-flip");
    const confRow = document.getElementById("flashcard-confidence-row");
    function reveal() {
      state.flashFlipped = true;
      cardEl.classList.add("flipped");
      flipBtn.style.display = "none";
      setTimeout(() => { confRow.style.display = "flex"; }, 260);
    }
    flipBtn.addEventListener("click", reveal);
    // Free flip back and forth once revealed — tapping the card again
    // just turns it, doesn't answer anything.
    cardEl.addEventListener("click", () => {
      if (!state.flashFlipped) return;
      cardEl.classList.toggle("flipped");
    });
    confRow.querySelectorAll(".flashcard-conf-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        answerFlashcard(parseInt(btn.getAttribute("data-level")));
      });
    });
  }

  // 5-10 cards later, then once more at the very end of the stack if
  // it's still rated "Difficult" then — requested explicitly. Deck
  // length grows in place (spliced/pushed straight into state.flashDeck),
  // so the "X/Y" counter and the final-card check both pick the new
  // total up for free on their next read, no separate bookkeeping.
  // Capped at 2 requeues (the card can appear at most 3 times total) so
  // a card that's STILL "Difficult" on its third pass doesn't loop
  // forever — it's a review session, not a punishment.
  function scheduleRequeue(card) {
    card._requeues = (card._requeues || 0) + 1;
    if (card._requeues > 2) return;
    const deck = state.flashDeck;
    if (card._requeues === 1) {
      const spacing = 5 + Math.floor(Math.random() * 6); // 5..10
      deck.splice(Math.min(deck.length, state.flashIndex + 1 + spacing), 0, card);
    } else {
      deck.push(card);
    }
  }

  // A card's own elapsed time (front shown -> answered), not counting the
  // flip. Anyone can tap through a deck claiming the top rating; that
  // costs nothing when a review paid no reward. Now that it does, this
  // is the guard — see MIN_CARD_MS in finishFlashcards. `level` is one
  // of CONFIDENCE's 0-3; "knew" (kept for the XP/pass-rate math every
  // finish function already does) is just level >= 2 ("has an idea" or
  // better) — a genuine self-report, not a coin flip on 4 buttons.
  function answerFlashcard(level) {
    const knew = level >= 2;
    const card = state.flashDeck[state.flashIndex];
    // Brief glow/shake on the card itself (styles/library.css's
    // .fc-correct / .fc-wrong) before moving on — long enough to read as
    // feedback, short enough not to feel like a delay.
    const cardEl = document.getElementById("flashcard-el");
    if (cardEl) {
      cardEl.classList.remove("fc-correct", "fc-wrong");
      void cardEl.offsetWidth;
      cardEl.classList.add(knew ? "fc-correct" : "fc-wrong");
    }
    if (Dojo.sfx) { if (knew) Dojo.sfx.correct(); else Dojo.sfx.wrong(); }
    state.flashResults.push(knew);
    state.flashTimings.push(Date.now() - state.flashCardShownAt);
    state.flashConfidence = state.flashConfidence || {};
    // Last rating for this chunk wins if it appears more than once in
    // this session (a requeue, or two glossary terms off the same
    // chunk) — same "last attempt wins" rule chunkResults already uses.
    if (isChunkCard(card)) {
      state.flashConfidence[chunkKey(card.topicId, card.chunkIdx)] = level;
    }
    if (level === 0) scheduleRequeue(card);
    setTimeout(() => {
      if (state.flashIndex + 1 < state.flashDeck.length) {
        state.flashIndex++;
        state.flashCardShownAt = Date.now();
        renderFlashcard();
      } else {
        finishFlashcards();
      }
    }, 320);
  }

  // A card answered faster than this couldn't have been read, let alone
  // recalled — the front alone typically runs a full sentence or two.
  // 2.5s is generous (a real "I know this instantly" case still clears
  // it) while catching a rushed tap-through.
  const MIN_CARD_MS = 2500;
  // Per genuinely-known card (real timing, not rushed) — deliberately
  // less than a chunk's own 15-21 XP, since a review isn't new
  // learning, but PER CARD, not a flat session cap. Used to be a flat
  // REVIEW_XP_BASE (5) applied to a whole session regardless of size —
  // a 4-card single-topic review and a 50-card custom deck spanning
  // every unit paid the exact same 5 XP, which made review strictly
  // WORSE value the more of it you did. That's backwards for the one
  // activity meant to carry a "long run" habit once the one-time
  // course content is finished — flagged live as "way too poor" and
  // traced to this. Scaling per card instead means reviewing MORE
  // pays MORE, same as original learning already works. 6, not 2 —
  // scaled up 3x alongside chunk XP, staying proportionally under it.
  const REVIEW_XP_PER_CARD = 6;

  // Shared by both finish functions — writes every chunk's LAST rating
  // this session into DB.recordChunkConfidence. A chunkKey-format map
  // ("topicId::chunkIdx" -> level) rather than a list, so a card seen
  // twice (a requeue, or two glossary terms off the same chunk) only
  // writes its final answer, same "last attempt wins" rule chunkResults
  // already follows elsewhere.
  function writeFlashConfidence() {
    Object.entries(state.flashConfidence || {}).forEach(([key, level]) => {
      const sep = key.lastIndexOf("::");
      const topicId = key.slice(0, sep);
      const chunkIdx = parseInt(key.slice(sep + 2), 10);
      DB.recordChunkConfidence(topicId, chunkIdx, level);
    });
  }

  function finishFlashcards() {
    if (state.flashCustom) return finishCustomDeck();
    const topic = state.flashTopic;
    state.lastReviewMode = "flashcards";
    document.getElementById("btn-to-topics").textContent = "Back to Topics";
    const total = state.flashResults.length;
    const known = state.flashResults.filter(Boolean).length;
    const pct = total ? Math.round((known / total) * 100) : 0;
    const passed = pct >= 80;
    const rushed = state.flashTimings.filter(ms => ms < MIN_CARD_MS).length;
    // Only cards that were both genuinely timed AND marked known count
    // toward the reward — rushing to "Knew it" shouldn't pay the same as
    // actually knowing it.
    const genuineKnown = state.flashResults.filter((knew, i) => knew && state.flashTimings[i] >= MIN_CARD_MS).length;
    writeFlashConfidence();

    // The one DB write a review needs: advance (or lapse) the SM-2
    // interval, same mapping showExamResults() uses. No recordExamResult
    // and no markTopicComplete — this isn't an exam, and the topic is
    // already mastered (that's why it was due).
    DB.scheduleReview(topic.id, Math.max(0, Math.min(5, Math.round(pct / 20))));
    Bus.emit("review:finished", { topicId: topic.id, known, total, passed });
    const nextIn = DB.daysUntilDue(topic.id);

    document.getElementById("result-icon").textContent = passed ? "💧" : "🌱";
    document.getElementById("result-title").textContent = passed ? "Watered!" : "Still Thirsty";
    document.getElementById("btn-retry").textContent = "Review Again";
    // Don't assert HOW the interval moved (reset vs. still advanced but
    // slower) — the 80% shown here is a display threshold, not the SM-2
    // quality<3 lapse threshold underneath, so pct 50-79% still nudges
    // the interval forward even though it reads as "failed" on screen.
    // nextIn is always the true outcome; only claim the number.
    document.getElementById("result-desc").textContent = (passed
      ? `You knew ${known}/${total} on "${topic.title}". Back for review in ${nextIn} day${nextIn === 1 ? "" : "s"} — that's when it does the most good.`
      : `You knew ${known}/${total} — below the 80% that keeps it growing. "${topic.title}" comes back for review in ${nextIn} day${nextIn === 1 ? "" : "s"}.`)
      + (rushed ? ` ${rushed} card${rushed === 1 ? "" : "s"} answered too fast to count toward XP.` : "");
    const scoreEl = document.getElementById("result-score");
    scoreEl.textContent = `${pct}%`;
    scoreEl.className = `result-score ${passed ? "pass" : "fail"}`;

    // Per genuinely-known card (see genuineKnown above) — a review
    // isn't new learning, and per-card stays well under a chunk's own
    // 5-7 XP, so it must not be a faster source of XP than actually
    // studying the topic was.
    const bonus = genuineKnown * REVIEW_XP_PER_CARD;
    const bonusEl = document.getElementById("result-charge");
    if (bonusEl) {
      if (bonus > 0) {
        const granted = awardCharge(bonus, scoreEl);
        bonusEl.innerHTML = `<span class="charge-award">⭐ +${granted} XP</span>`;
      } else {
        bonusEl.innerHTML = "";
      }
    }
    // Same reward as a fresh topic pass — a review is still "you sat
    // with this topic and it stuck," and skipping the quote here was
    // the one place that made finishing a topic's review feel worth
    // less than finishing it the first time.
    const wisdomEl = document.getElementById("result-wisdom");
    if (wisdomEl) {
      const tags = topic.chunks.flatMap(c => c.wisdomTags || []);
      wisdomEl.innerHTML = quoteHtml(pickQuote(tags));
    }

    showScreen("exam-result");
    if (Dojo.burstConfetti) Dojo.burstConfetti(document.getElementById("result-icon"));
  }

  // A custom deck can span many topics, so there's no single topic id
  // to hand DB.scheduleReview's SM-2 interval to. What it CAN honestly
  // update is the one per-chunk signal that exists — see
  // DB.getChunkResult — which is also exactly what feeds the next
  // deck's worst-known-first ordering. No markTopicComplete either:
  // a custom deck reviews chunks, it doesn't complete topics.
  function finishCustomDeck() {
    state.lastReviewMode = "custom-flashcards";
    document.getElementById("btn-to-topics").textContent = "Back to Deck Builder";
    const deck = state.flashDeck;
    const total = state.flashResults.length;
    const known = state.flashResults.filter(Boolean).length;
    const pct = total ? Math.round((known / total) * 100) : 0;
    const passed = pct >= 80;
    const rushed = state.flashTimings.filter(ms => ms < MIN_CARD_MS).length;
    const genuineKnown = state.flashResults.filter((knew, i) => knew && state.flashTimings[i] >= MIN_CARD_MS).length;
    writeFlashConfidence();

    deck.forEach((card, i) => {
      if (!isChunkCard(card)) return;   // exam cards own no chunk result
      DB.recordQuizAnswer(card.topicId, card.chunkIdx, state.flashResults[i]);
    });
    Bus.emit("review:finished", { custom: true, known, total, passed });

    document.getElementById("result-icon").textContent = passed ? "\u{1F5C2}️" : "\u{1F4DD}";
    document.getElementById("result-title").textContent = passed ? "Deck Cleared!" : "Good Rep";
    document.getElementById("btn-retry").textContent = "Review Again";
    document.getElementById("result-desc").textContent = `You knew ${known}/${total} on this custom deck.`
      + (rushed ? ` ${rushed} card${rushed === 1 ? "" : "s"} answered too fast to count toward XP.` : "");
    const scoreEl = document.getElementById("result-score");
    scoreEl.textContent = `${pct}%`;
    scoreEl.className = `result-score ${passed ? "pass" : "fail"}`;

    // Per genuinely-known card, not a flat session cap — a 50-card
    // deck spanning every unit used to pay the exact same 5 XP as a
    // 4-card single-topic review, making review strictly worse value
    // the more of it you did. Now scales with actual volume reviewed,
    // same as original learning already does per chunk.
    const bonus = genuineKnown * REVIEW_XP_PER_CARD;
    const bonusEl = document.getElementById("result-charge");
    if (bonusEl) {
      if (bonus > 0) {
        const granted = awardCharge(bonus, scoreEl);
        bonusEl.innerHTML = `<span class="charge-award">⭐ +${granted} XP</span>`;
      } else {
        bonusEl.innerHTML = "";
      }
    }
    // Deck cards only carry topicId/chunkIdx (see buildCustomDeck), not
    // the chunk object itself, so the tag pool is looked back up
    // through ALL_TOPICS rather than flatMapped straight off the deck
    // the way a single-topic review can.
    const wisdomEl = document.getElementById("result-wisdom");
    if (wisdomEl) {
      const tags = deck.flatMap(card => {
        if (!isChunkCard(card)) return [];
        const t = ALL_TOPICS.find(x => x.id === card.topicId);
        const c = t && t.chunks[card.chunkIdx];
        return (c && c.wisdomTags) || [];
      });
      wisdomEl.innerHTML = quoteHtml(pickQuote(tags));
    }

    showScreen("exam-result");
    if (Dojo.burstConfetti) Dojo.burstConfetti(document.getElementById("result-icon"));
  }


  // ---- Branch-owned navigation ----
  // These never leave the Library, so they are wired here and not in
  // core/boot.js.
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };
  on("btn-back-courses", renderCourseSelect);
  on("btn-back-units",  () => { showScreen("unit-select"); renderUnitSelect(); });
  on("btn-back-deckbuilder", () => {
    if (state.deckBuilderFromLobby) {
      state.deckBuilderFromLobby = false;
      document.getElementById("btn-back-deckbuilder").textContent = "← Unit";
      Dojo.showLobby();
    } else {
      showScreen("unit-select"); renderUnitSelect();
    }
  });
  on("btn-back-topics", () => { showScreen("topic-map"); renderTopicMap(); });
  on("btn-back-topics2",() => { showScreen("topic-map"); renderTopicMap(); });
  // The result screen (and the "back" out of it) is shared across three
  // flows now — a single-topic review, an exam, and a custom deck —
  // each needing a different "where does this actually lead" answer.
  on("btn-to-topics", () => {
    if (state.lastReviewMode === "custom-flashcards") openDeckBuilder();
    else if (state.lastReviewMode === "final-quiz") { showScreen("unit-select"); renderUnitSelect(); }
    else { showScreen("topic-map"); renderTopicMap(); }
  });
  on("btn-back-flashcards", () => {
    if (state.flashCustom) openDeckBuilder();
    else { showScreen("topic-map"); renderTopicMap(); }
  });
  on("btn-retry", () => {
    if (state.lastReviewMode === "custom-flashcards" && state.flashCustomRefs) startCustomDeckReview(state.flashCustomRefs, state.flashCustomMode);
    else if (state.lastReviewMode === "flashcards" && state.flashTopic) startFlashcardReview(state.flashTopic);
    else if (state.lastReviewMode === "final-quiz") startFinalQuiz();
    else if (state.lastReviewMode === "exam" && state.examMustRedoTopic) startTopic(state.currentTopicIdx, 0);
    else startExam();
  });

  // ---- Entry points other branches use ----
  // The lobby owns the Resume and Review tiles but must not know how
  // to walk a course, so it hands the request over here.
  function resumeAt(pos) {
    const course = COURSES.find(c => c.units.includes(pos.unitId));
    state.currentCourse = course ? course.id : null;
    selectUnit(pos.unitId);
    const idx = state.currentTopics.findIndex(t => t.id === pos.topicId);
    if (idx >= 0) startTopic(idx, pos.chunkIdx);
  }

  function startNextDueReview() {
    const due = DB.getDueTopicIds();
    if (!due.length) return false;
    const topic = ALL_TOPICS.find(t => due.includes(t.id));
    if (!topic) return false;
    const course = COURSES.find(c => c.units.includes(topic.unit));
    state.currentCourse = course ? course.id : null;
    // Still walks unit context so "Back to Topics" lands somewhere sane —
    // just launches the flashcard deck instead of the full topic replay.
    selectUnit(topic.unit);
    startFlashcardReview(topic);
    return true;
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { phasesFor, finishChunk, renderCourseSelect, renderUnitSelect, selectUnit, renderTopicMap, updateGlobalProgress, startTopic, getTopic, startExam, startFinalQuiz, libraryTotals, resumeAt, startNextDueReview, openDeckBuilder, renderDeckBuilder, openFlashcardsHub, flashcardsSummary, CONFIDENCE });
})();
