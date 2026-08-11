// ================================================
// CS Dojo — STORY ("bomj simulator") — engine
// ------------------------------------------------
// A survival arc: you start on the street with nothing and climb back
// to papers, a lease and a road out. It shares the Arcade screen as a
// tab but stays its own folder.
//
// This file is the ENGINE. The graph lives in story/scenes.js and is
// pure data — writing the narrative means touching that file only.
//
// What the engine does:
//   * works out each node's state from DB.getStoryProgress()
//   * renders the act map and the scene view
//   * resolves a choice: checks requirements, charges, rolls, applies
//     effects, records the attempt
//
// Rules it must keep:
//   * vitals move ONLY through Dojo.LifeShop (effect / demoteShelter)
//   * nothing here reads course progress or touches the Library
//   * costs are in $, never charge
//
// Emits: story:node, story:outcome, wallet:changed
// ================================================

(() => {
  const Bus = Dojo.Bus;

  const ACTS = typeof STORY_ACTS !== "undefined" ? STORY_ACTS : [];
  const NODES = typeof STORY_SCENES !== "undefined" ? STORY_SCENES : [];

  const node = id => NODES.find(n => n.id === id) || null;

  // ---- State ----
  function nodeState(n, progress) {
    const p = progress || DB.getStoryProgress();
    if (p.completedNodes.includes(n.id)) return "done";
    const deps = (n.requires || []).every(r => p.completedNodes.includes(r));
    const flags = (n.needFlags || []).every(f => p.flags.includes(f));
    if (!deps || !flags) return "locked";
    return (p.attempts[n.id] && p.attempts[n.id].tries) ? "failed" : "open";
  }

  function nextOpen() {
    const p = DB.getStoryProgress();
    return NODES.find(n => ["open", "failed"].includes(nodeState(n, p))) || null;
  }

  function storySummary() {
    const p = DB.getStoryProgress();
    const done = p.completedNodes.length;
    if (!done) return "The street \u2014 not started";
    if (done >= NODES.length) return `Arc complete \u00b7 ${done}/${NODES.length} scenes`;
    const nx = nextOpen();
    return `Act ${nx ? nx.act : 4} \u00b7 ${done}/${NODES.length} scenes`;
  }

  // ---- Requirements ----
  // Returns null if the choice is takeable, or a reason string if not.
  function blockedReason(choice) {
    const need = choice.need || {};
    if (need.money && DB.getWallet() < need.money) return `Need $${need.money}`;
    if (need.item && !DB.getInventory().includes(need.item)) {
      const it = Dojo.LifeShop && Dojo.LifeShop.item(need.item);
      return `Need ${it ? it.name.toLowerCase() : need.item}`;
    }
    if (need.vital) {
      const v = DB.getVitals()[need.vital.key] || 0;
      if (v < need.vital.min) return `Need ${need.vital.key} above ${need.vital.min}`;
    }
    return null;
  }

  function entryCost(n) { return (n.cost && n.cost.money) || 0; }

  // ---- Resolution ----
  //
  // The single place money leaves the wallet in this branch, and the
  // single place a scene's effects are applied. A losing branch that
  // omits `complete` leaves the node retryable — and the entry cost is
  // charged again on the retry. That is what failing costs.
  function resolveChoice(n, choice) {
    if (Dojo.LifeShop && Dojo.LifeShop.isWeak()) {
      return { ok: false, reason: Dojo.LifeShop.weakReason() };
    }
    const blocked = blockedReason(choice);
    if (blocked) return { ok: false, reason: blocked };

    const fee = entryCost(n);
    if (fee && !DB.spendMoney(fee)) return { ok: false, reason: `Need $${fee}` };
    if (fee) Bus.emit("wallet:changed", { delta: -fee, reason: "story" });

    const won = choice.roll == null ? true : Math.random() < choice.roll;
    const branch = (won ? choice.win : choice.lose) || {};

    // Scenes are the most expensive thing in the app, win or lose.
    if (Dojo.LifeShop) Dojo.LifeShop.cost("story");
    // A resolved scene IS a story day now — this is what used to be the
    // real-calendar-day tick (nightly theft roll). See life.js's
    // storyDayTick(). Not real time: leaving the app costs nothing, only
    // playing through a scene does.
    if (Dojo.LifeShop) Dojo.LifeShop.storyDayTick();

    if (branch.money) {
      DB.addMoney(branch.money);
      Bus.emit("wallet:changed", { delta: branch.money, reason: "story" });
    }
    if (branch.vitals && Dojo.LifeShop) Dojo.LifeShop.effect(branch.vitals);
    if (branch.shelter && Dojo.LifeShop) Dojo.LifeShop.effect({ shelterTier: branch.shelter });
    if (branch.demote && Dojo.LifeShop) Dojo.LifeShop.demoteShelter();
    if (branch.item) DB.addInventory(branch.item);
    if (branch.flag) DB.addStoryFlag(branch.flag);

    DB.recordNodeAttempt(n.id, won ? "win" : "lose");
    if (branch.complete) {
      DB.completeNode(n.id);
      (branch.unlock || []).forEach(id => DB.unlockNode(id));
      Bus.emit("story:node", { id: n.id });
    }

    Bus.emit("story:outcome", { id: n.id, choice: choice.id, won, complete: !!branch.complete });
    return { ok: true, won, branch, fee };
  }

  // ---- Rendering ----
  let openNodeId = null;    // which scene view is showing, if any

  function needLabel(choice) {
    const bits = [];
    const need = choice.need || {};
    if (need.money) bits.push(`$${need.money}`);
    if (need.item) {
      const it = Dojo.LifeShop && Dojo.LifeShop.item(need.item);
      bits.push(it ? it.name : need.item);
    }
    if (need.vital) bits.push(`${need.vital.key} ${need.vital.min}+`);
    if (choice.roll != null) bits.push(`${Math.round(choice.roll * 100)}% odds`);
    return bits.join(" \u00b7 ");
  }

  function renderScene(body, n, result) {
    const st = nodeState(n);
    const fee = entryCost(n);
    const tries = (DB.getStoryProgress().attempts[n.id] || {}).tries || 0;

    const wrap = document.createElement("div");
    wrap.className = "scene-view";
    wrap.innerHTML = `
      <div class="crash-head">
        <div class="stats-section-title">Act ${n.act} \u00b7 ${n.title}</div>
        <button class="btn-ghost scene-close">\u2715 Back to the map</button>
      </div>
      <div class="scene-body">
        ${n.body && n.body.length
          ? n.body.map(par => `<p>${par}</p>`).join("")
          : `<p class="scene-todo">This scene has no words yet. The choices below are real \u2014
             they charge you, roll, and change your situation \u2014 but the prose is stage 6.</p>`}
      </div>
      ${fee ? `<div class="scene-fee">Opening this costs <strong>$${fee}</strong>${tries ? ` \u2014 and you've already paid it ${tries} time${tries === 1 ? "" : "s"}` : ""}.</div>` : ""}
      ${result ? `<div class="table-status ${result.won ? "won" : "lost"}">
          ${(result.branch && result.branch.text) || (result.won ? "That worked." : "That didn't work.")}
          ${outcomeSummary(result.branch)}
        </div>` : ""}
      ${st === "done"
        ? `<div class="table-status won">Done. ${nextAfter(n)}</div>`
        : `<div class="scene-choices"></div>`}`;

    body.appendChild(wrap);
    wrap.querySelector(".scene-close").addEventListener("click", () => { openNodeId = null; paintModal(); });

    const choiceBox = wrap.querySelector(".scene-choices");
    if (!choiceBox) return;

    n.choices.forEach(c => {
      const blocked = blockedReason(c);
      const btn = document.createElement("button");
      btn.className = `scene-choice${blocked ? " blocked" : ""}`;
      btn.disabled = !!blocked;
      btn.innerHTML = `
        <span class="sc-label">${c.label}</span>
        <span class="sc-need">${blocked ? `\u{1F512} ${blocked}` : (needLabel(c) || "no cost")}</span>`;
      btn.addEventListener("click", () => {
        const r = resolveChoice(n, c);
        if (!r.ok) { btn.querySelector(".sc-need").textContent = `\u{1F512} ${r.reason}`; return; }
        rerender(r);
      });
      choiceBox.appendChild(btn);
    });
  }

  function outcomeSummary(branch) {
    if (!branch) return "";
    const bits = [];
    if (branch.money) bits.push(`${branch.money > 0 ? "+" : "\u2212"}$${Math.abs(branch.money)}`);
    if (branch.item) bits.push(`got: ${branch.item.replace(/_/g, " ")}`);
    if (branch.shelter) bits.push(`now sleeping: ${branch.shelter}`);
    if (branch.demote) bits.push("knocked back down a rung");
    if (branch.vitals) {
      const v = Object.entries(branch.vitals).map(([k, n2]) => `${n2 > 0 ? "+" : ""}${n2} ${k}`);
      bits.push(...v);
    }
    if (!branch.complete) bits.push("scene not cleared \u2014 you can try again");
    return bits.length ? ` <span class="sc-delta">(${bits.join(", ")})</span>` : "";
  }

  function nextAfter(n) {
    const nx = NODES.find(x => (x.requires || []).includes(n.id));
    return nx ? `Next: ${nx.title}.` : "That's the end of the arc as written.";
  }

  // One act at a time. The others are behind their own tab.
  function renderAct(body, actId, progress) {
    const act = ACTS.find(a => a.id === actId) || ACTS[0];
    const scenes = NODES.filter(n => n.act === act.id);
    const weak = Dojo.LifeShop && Dojo.LifeShop.weakReason();

    body.innerHTML = "";
    const head = document.createElement("div");
    head.className = "story-act";
    head.innerHTML = `
      <div class="plot-title">Act ${act.id} \u2014 ${act.title}</div>
      <p class="settings-hint">${act.sub}</p>
      ${weak ? `<div class="vitals-warn">\u26A0 ${weak} \u2014 no scenes until you do.</div>` : ""}`;
    body.appendChild(head);

    {
      const wrap = document.createElement("div");
      wrap.className = "story-act";
      const row = document.createElement("div");
      row.className = "story-row";

      scenes.forEach((n, i, arr) => {
        const st = nodeState(n, progress);
        const fee = entryCost(n);
        const btn = document.createElement("button");
        btn.className = `story-node ${st}`;
        btn.disabled = st === "locked";
        btn.innerHTML = `
          <span class="sn-dot"></span>
          <span class="sn-title">${n.title}</span>
          <span class="sn-meta">${
            st === "done" ? "\u2713 done"
            : st === "failed" ? `retry${fee ? ` \u00b7 $${fee}` : ""}`
            : st === "locked" ? "locked"
            : fee ? `$${fee}` : "free"}</span>`;
        btn.addEventListener("click", () => { openNodeId = n.id; paintModal(); });
        row.appendChild(btn);
        if (i < arr.length - 1) {
          const link = document.createElement("span");
          link.className = "story-link";
          row.appendChild(link);
        }
      });

      wrap.appendChild(row);
      body.appendChild(wrap);
    }

    const note = document.createElement("p");
    note.className = "settings-hint";
    note.innerHTML = `Scenes charge you to open and can be <strong>failed</strong>. Failing costs
      the fee, sometimes more, and leaves the scene to try again \u2014 money raises your odds,
      it doesn't buy the outcome.`;
    body.appendChild(note);
  }

  let lastResult = null;

  // Re-render ONLY the story overlay, never the whole screen.
  //
  // This used to call Dojo.renderGames("story"), which re-ran the Arcade
  // tab and ended in showScreen() -> window.scrollTo(0, 0). Every choice
  // therefore threw you back to the top of the page mid-scene. A branch
  // redrawing itself must not go through a screen render to do it.
  function rerender(result) {
    lastResult = result || null;
    if (Dojo.renderVitals) Dojo.renderVitals();
    if (modalOpen) paintModal();
  }

  // ---- Story mode overlay ----
  //
  // The acts are no longer laid out on the tab. The tab is a door; the
  // arc lives behind it, one act at a time. Showing four acts of node
  // chains at once spoiled the shape of the thing and made a tab that
  // is mostly life-shop feel like a wall of map.
  let modalOpen = false;
  let activeAct = 1;

  function openStoryMode() {
    modalOpen = true;
    const p = DB.getStoryProgress();
    const nx = nextOpen();
    activeAct = nx ? nx.act : (ACTS[ACTS.length - 1] || { id: 1 }).id;
    paintModal();
  }

  function closeStoryMode() {
    modalOpen = false;
    openNodeId = null;
    lastResult = null;
    const overlay = document.getElementById("story-modal");
    if (overlay) overlay.style.display = "none";
  }

  function paintModal() {
    const overlay = document.getElementById("story-modal");
    if (!overlay) return;
    overlay.style.display = "flex";

    const progress = DB.getStoryProgress();
    const done = progress.completedNodes.length;

    overlay.innerHTML = `
      <div class="modal-card modal-card-wide story-modal-card">
        <div class="modal-close" id="story-modal-close">\u2715</div>
        <h2 class="modal-title" style="font-size:1.25rem;">Story mode
          <span class="sm-count">${done}/${NODES.length}</span></h2>
        <div class="tab-row" id="story-act-tabs"></div>
        <div class="story-modal-body" id="story-modal-body"></div>
      </div>`;

    overlay.querySelector("#story-modal-close").addEventListener("click", closeStoryMode);

    const tabs = overlay.querySelector("#story-act-tabs");
    ACTS.forEach(act => {
      const scenes = NODES.filter(n => n.act === act.id);
      if (!scenes.length) return;
      const reachable = scenes.some(n => nodeState(n, progress) !== "locked");
      const cleared = scenes.every(n => progress.completedNodes.includes(n.id));
      const b = document.createElement("button");
      b.className = `tab-btn${act.id === activeAct ? " active" : ""}${reachable ? "" : " locked"}`;
      b.disabled = !reachable;
      b.innerHTML = `${cleared ? "\u2713 " : ""}Act ${act.id}
        <span class="tab-note">${reachable ? act.title : "locked"}</span>`;
      b.addEventListener("click", () => { activeAct = act.id; openNodeId = null; paintModal(); });
      tabs.appendChild(b);
    });

    const body = overlay.querySelector("#story-modal-body");
    const open = openNodeId && node(openNodeId);
    if (open && nodeState(open) !== "locked") {
      renderScene(body, open, lastResult);
      lastResult = null;
    } else {
      openNodeId = null;
      renderAct(body, activeAct, progress);
    }
  }

  // Entry point the Arcade calls with the container to draw into.
  function renderStory(target) {
    const body = target || document.getElementById("arcade-tab-body");
    if (!body) return;
    body.innerHTML = "";

    // Staying alive and getting somewhere are the same coin and the same
    // fiction, so they share one surface.
    const intro = document.createElement("p");
    intro.className = "settings-hint";
    intro.style.maxWidth = "62ch";
    intro.innerHTML = `You start with nothing and work back to a door of your own.
      Everything here runs on money you earn in the Garden.`;
    body.appendChild(intro);

    const life = document.createElement("div");
    body.appendChild(life);
    if (Dojo.renderLifeTab) Dojo.renderLifeTab(life);

    const progress = DB.getStoryProgress();
    const done = progress.completedNodes.length;
    const nx = nextOpen();

    const door = document.createElement("div");
    door.className = "settings-section";
    door.innerHTML = `
      <button id="btn-open-story" class="lobby-tile primary" style="width:100%;">
        <span class="lt-icon">\u{1F4D6}</span>
        <span class="lt-body">
          <span class="lt-title">Enter story mode</span>
          <span class="lt-sub">${done
            ? (nx ? `Act ${nx.act} \u00b7 next: ${nx.title} \u00b7 ${done}/${NODES.length} scenes`
                  : `Arc complete \u00b7 ${done}/${NODES.length} scenes`)
            : "The street. Start where it starts."}</span>
        </span>
        <span class="arrow">\u2192</span>
      </button>`;
    body.appendChild(door);
    door.querySelector("#btn-open-story").addEventListener("click", openStoryMode);
  }

  // Share the Arcade screen instead of taking a lobby slot of its own.
  if (Dojo.Arcade && Dojo.Arcade.registerTab) {
    Dojo.Arcade.registerTab({ id: "story", label: "\u{1F4D6} Story", render: renderStory });
  }

  Dojo.Story = { ACTS, NODES, node, nodeState, nextOpen, resolveChoice, blockedReason, entryCost,
                 openStoryMode, closeStoryMode };
  Object.assign(Dojo, { renderStory, storySummary });
})();
