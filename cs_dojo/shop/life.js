// ================================================
// CS Dojo — SHOP / life goods + vitals
// ------------------------------------------------
// The survival half of the sim. Owns three things:
//   1. the vitals decay model      (DECAY)
//   2. the goods catalogue         (LIFE_ITEMS)
//   3. the vitals strip + shop tab (render*)
//
// Two currencies, kept strictly apart:
//   charge (\u26A1)  earned by studying  -> cosmetic themes only  (shop.js)
//   money  ($)   earned in the Garden -> life goods            (this file)
// Never let one buy the other.
//
// Emits: wallet:changed, vitals:changed
// ================================================

(() => {
  const Bus = Dojo.Bus;

  // ---- Decay model ----
  //
  // DECAY IS PER ACTIVITY, NOT PER CLOCK. This is the important
  // decision in this file and it should not be quietly reversed.
  //
  // A pure real-time drain would mean coming back after a week away to
  // a starving character — i.e. the app would punish taking days off.
  // Spacing is the whole point of the review system; PROJECT.md §5
  // rejected streaks for exactly this reason, and clock-based vitals
  // are a streak wearing a different hat.
  //
  // So: vitals fall when you DO things, plus one small tick per day
  // you actually open the app. Two weeks away costs one tick, not
  // fourteen. Being away is free; playing costs.
  const DECAY = {
    chunk:  { thirst: -3, hunger: -2, hygiene: -1 },   // a lesson chunk completed
    exam:   { thirst: -5, hunger: -4, hygiene: -2 },   // a mastery exam finished
    arcade: { thirst: -2, hunger: -2, hygiene: -2 },   // one arcade round
    story:  { thirst: -8, hunger: -8, hygiene: -6 },   // one story scene
    daily:  { thirst: -10, hunger: -8, hygiene: -5 }   // once per day opened
  };

  // ---- Night theft ----
  //
  // Sleep on the street and there is a 1-in-3 chance somebody goes
  // through your pockets overnight, taking 20-50% of your cash.
  //
  // This is the economy's main sink, and it is the reason shelter is
  // worth buying at all. Without it money only ever goes up: the Garden
  // pays every day forever while upkeep is a few dollars, so a long-term
  // player ends up with a number that means nothing. Theft is a
  // percentage rather than a flat amount precisely so it keeps biting
  // at any wealth level.
  //
  // It only fires on the daily tick, never on a timer, and only for a
  // day you actually opened the app — same rule as decay. Being away
  // costs nothing.
  const THEFT = {
    street:    { chance: 1 / 3, min: 0.20, max: 0.50 },
    hostel:    { chance: 1 / 12, min: 0.10, max: 0.25 },
    car:       { chance: 1 / 20, min: 0.10, max: 0.20 },
    apartment: { chance: 0, min: 0, max: 0 }
  };

  // What happened last night, for the UI to show once. Session-only on
  // purpose: it's a notification, not a record.
  let nightReport = null;

  function rollTheft() {
    const tier = DB.getVitals().shelterTier || "street";
    const rule = THEFT[tier] || THEFT.street;
    const purse = DB.getWallet();
    if (purse <= 0 || Math.random() >= rule.chance) return null;
    const share = rule.min + Math.random() * (rule.max - rule.min);
    const taken = Math.max(1, Math.floor(purse * share));
    DB.addMoney(-taken);
    Bus.emit("wallet:changed", { delta: -taken, reason: "theft" });
    return { taken, share, tier, left: DB.getWallet() };
  }

  // Arbitrary vital/shelter changes from another branch (story outcomes).
  // Vitals still only ever move through this file.
  function effect(patch) {
    const after = DB.patchVitals(patch || {});
    Bus.emit("vitals:changed", after);
    return after;
  }

  function demoteShelter() {
    const i = LADDER.indexOf(DB.getVitals().shelterTier || "street");
    if (i <= 0) return null;
    return effect({ shelterTier: LADDER[i - 1] });
  }

  function lastNight() { return nightReport; }
  function clearNightReport() { nightReport = null; }

  // Shelter softens the daily tick — the whole point of climbing out.
  const SHELTER = {
    street:    { label: "Street",    mult: 1.0 },
    hostel:    { label: "Hostel",    mult: 0.7 },
    car:       { label: "Car",       mult: 0.55 },
    apartment: { label: "Apartment", mult: 0.35 }
  };

  // The shelter ladder, worst to best. Used by demotion and to stop a
  // purchase moving you backwards along it.
  const LADDER = ["street", "hostel", "car", "apartment"];

  const VITALS = [
    { key: "hunger",  icon: "\u{1F35E}", label: "Hunger",  adj: "hungry" },
    { key: "thirst",  icon: "\u{1F4A7}", label: "Thirst",  adj: "thirsty" },
    { key: "hygiene", icon: "\u{1F9FC}", label: "Hygiene", adj: "filthy" }
  ];

  function shelter() {
    return SHELTER[DB.getVitals().shelterTier] || SHELTER.street;
  }

  // Called by other branches when something happened. Never call
  // DB.patchVitals directly from outside this file.
  function cost(kind, times) {
    const base = DECAY[kind];
    if (!base) return null;
    const n = times || 1;
    const patch = {};
    for (const [k, v] of Object.entries(base)) patch[k] = Math.round(v * n);
    const after = DB.patchVitals(patch);
    Bus.emit("vitals:changed", after);
    return after;
  }

  // One tick per calendar day the app is opened, regardless of how long
  // the gap was. Runs at boot.
  function dailyTick() {
    const today = new Date().toISOString().slice(0, 10);
    if (DB.getLastVitalTick() === today) return false;
    const first = DB.getLastVitalTick() === null;
    DB.setLastVitalTick(today);
    if (first) return false;              // don't dock a brand-new profile
    const m = shelter().mult;
    const patch = {};
    for (const [k, v] of Object.entries(DECAY.daily)) patch[k] = Math.round(v * m);
    Bus.emit("vitals:changed", DB.patchVitals(patch));
    nightReport = rollTheft();
    return true;
  }

  // ---- Consequences ----
  //
  // Running empty NEVER touches the Library. You can always study.
  // It gates the optional systems only: no arcade, no story scenes.
  const WEAK_AT = 15;

  function weakest() {
    const v = DB.getVitals();
    return VITALS.reduce((lo, x) => (v[x.key] < v[lo.key] ? x : lo), VITALS[0]);
  }

  function isWeak() {
    const v = DB.getVitals();
    return VITALS.some(x => v[x.key] <= WEAK_AT);
  }

  function weakReason() {
    if (!isWeak()) return null;
    return `Too ${weakest().adj} — sort that out first`;
  }

  // ---- Catalogue ----
  // `effect` numbers are added to the vital and clamped 0-100.
  // `once` marks a permanent unlock rather than a consumable.
  //
  // Rough daily maths at the intended pace (~10 chunks plus a tick):
  // about 40 thirst, 28 hunger, 15 hygiene to replace — roughly $9/day.
  // A three-plant Garden pays $9/day, a full one pays $78, so early
  // play is tight and later play is comfortable. That is deliberate.
  const LIFE_ITEMS = [
    { id: "water",     cat: "consumable", icon: "\u{1F4A7}", name: "Bottle of water",  price: 2,   effect: { thirst: 35 } },
    { id: "bread",     cat: "consumable", icon: "\u{1F35E}", name: "Bread",            price: 3,   effect: { hunger: 25 } },
    { id: "hot_meal",  cat: "consumable", icon: "\u{1F372}", name: "Hot meal",         price: 9,   effect: { hunger: 60, thirst: 10 } },

    { id: "soap",      cat: "hygiene",    icon: "\u{1F9FC}", name: "Soap",             price: 4,   effect: { hygiene: 20 } },
    { id: "bathhouse", cat: "hygiene",    icon: "\u{1F6C1}", name: "Public bath",      price: 8,   effect: { hygiene: 70 } },

    { id: "hostel",    cat: "unlock",     icon: "\u{1F6CF}", name: "Hostel bed",       price: 25,  effect: { shelterTier: "hostel", hygiene: 15 } },
    { id: "id_card",   cat: "unlock",     icon: "\u{1F194}", name: "Replacement ID",   price: 60,  effect: {}, once: true },
    { id: "licence",   cat: "unlock",     icon: "\u{1F4C3}", name: "Driver's licence", price: 150, effect: {}, once: true },
    { id: "deposit",   cat: "unlock",     icon: "\u{1F3E0}", name: "Apartment deposit",price: 250, effect: { shelterTier: "apartment", hygiene: 25 }, once: true },
    { id: "car",       cat: "unlock",     icon: "\u{1F697}", name: "A used car",       price: 400, effect: { shelterTier: "car" }, once: true }
  ];

  const CATS = [
    { id: "consumable", title: "\u{1F35E} Food & water" },
    { id: "hygiene",    title: "\u{1F9FC} Hygiene" },
    { id: "unlock",     title: "\u{1F511} Shelter & papers" }
  ];

  function item(id) { return LIFE_ITEMS.find(i => i.id === id) || null; }
  function owns(id) { return DB.getInventory().includes(id); }

  // Consumables are CARRIED, not swallowed at the till.
  //
  // Until now `inventory` was written on every purchase and read by
  // nothing: buying water applied +35 thirst instantly, so the field was
  // a receipt log. Two things were wrong with that. You couldn't stock
  // up when you were rich and eat when you were broke — which is the
  // actual survival decision — and buying at full thirst wasted the
  // money silently.
  //
  // So: `unlock` items still apply on purchase (a hostel bed is a night,
  // not a thing in a bag); consumables and hygiene go into the bag and
  // are spent with use().
  const CARRIED = ["consumable", "hygiene"];
  const isCarried = it => CARRIED.includes(it.cat);

  // The ONLY path that may touch the wallet from a purchase.
  function buy(id) {
    const it = item(id);
    if (!it) return false;
    if (it.once && owns(id)) return false;
    if (!DB.spendMoney(it.price)) return false;
    DB.addInventory(id);
    // Unlocks land immediately; carried goods wait for use().
    if (!isCarried(it) && it.effect && Object.keys(it.effect).length) {
      const effect = { ...it.effect };
      // A shelter purchase must never move you DOWN the ladder. Buying a
      // hostel bed while you have a lease used to demote you to hostel,
      // which reads as the app taking your flat away for $25.
      if (effect.shelterTier) {
        const now = LADDER.indexOf(DB.getVitals().shelterTier || "street");
        const to = LADDER.indexOf(effect.shelterTier);
        if (to <= now) delete effect.shelterTier;
      }
      if (Object.keys(effect).length) Bus.emit("vitals:changed", DB.patchVitals(effect));
    }
    Bus.emit("wallet:changed", { delta: -it.price, reason: "life-shop" });
    return true;
  }

  // Consume one carried item. Returns false if there isn't one, so the
  // UI can never show an effect that didn't land.
  function use(id) {
    const it = item(id);
    if (!it || !isCarried(it)) return false;
    if (!DB.consumeInventory(id)) return false;
    Bus.emit("vitals:changed", DB.patchVitals(it.effect || {}));
    return true;
  }

  // How many of each carried thing is in the bag.
  function bag() {
    const counts = {};
    DB.getInventory().forEach(id => {
      const it = item(id);
      if (it && isCarried(it)) counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }

  // ---- Vitals strip (sits under the charge bar) ----
  function renderVitals() {
    const strip = document.getElementById("vitals-strip");
    if (!strip) return;
    if (!DB.getActiveProfile()) { strip.style.display = "none"; return; }
    strip.style.display = "flex";
    const v = DB.getVitals();
    strip.innerHTML =
      VITALS.map(x => {
        const val = v[x.key];
        const level = val <= WEAK_AT ? "critical" : val <= 40 ? "low" : "";
        return `<span class="vital ${level}" title="${x.label}: ${val}">
          <span class="v-icon">${x.icon}</span>
          <span class="v-track"><span class="v-fill" style="width:${val}%"></span></span>
        </span>`;
      }).join("") +
      `<span class="vital-shelter" title="Where you sleep">${shelter().label}</span>` +
      `<span class="vital-wallet">$${DB.getWallet()}</span>`;
  }

  function theftBlurb() {
    const rule = THEFT[DB.getVitals().shelterTier] || THEFT.street;
    if (!rule.chance) return "nothing gets taken here";
    return `${Math.round(rule.chance * 100)}% nightly robbery risk (${Math.round(rule.min * 100)}\u2013${Math.round(rule.max * 100)}%)`;
  }

  function effectText(it) {
    const parts = [];
    for (const [k, val] of Object.entries(it.effect || {})) {
      if (k === "shelterTier") parts.push(`sleep in a ${SHELTER[val].label.toLowerCase()}`);
      else parts.push(`+${val} ${k}`);
    }
    if (!parts.length) parts.push("a document you'll need later");
    return parts.join(", ");
  }

  // ---- The Life panel (a guest on the Arcade's Story tab) ----
  let mountedIn = null;

  function renderLifeTab(body) {
    if (!body) return;
    mountedIn = body;
    const v = DB.getVitals();
    const weak = weakReason();

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">$${DB.getWallet()}</div>
        <div class="sw-meta">Sleeping: ${shelter().label} \u00b7 daily wear \u00d7${shelter().mult} \u00b7 ${theftBlurb()}</div>
        <div class="vitals-detail">
          ${VITALS.map(x => `
            <div class="vd-row">
              <span class="vd-label">${x.icon} ${x.label}</span>
              <span class="v-track wide"><span class="v-fill${v[x.key] <= WEAK_AT ? " critical" : ""}" style="width:${v[x.key]}%"></span></span>
              <span class="vd-num">${v[x.key]}</span>
            </div>`).join("")}
        </div>
        ${nightReport ? `<div class="vitals-warn theft">\u{1F576} Someone went through your pockets last night \u2014
          $${nightReport.taken} gone (${Math.round(nightReport.share * 100)}% of what you had).
          ${nightReport.tier === "street" ? "Sleeping rough costs more than it looks." : ""}</div>` : ""}
        ${weak ? `<div class="vitals-warn">\u26A0 ${weak}. The Arcade and Story are shut until you do \u2014 studying never is.</div>` : ""}
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          Vitals fall when you do things \u2014 lessons, exams, arcade rounds, story scenes \u2014
          plus one small tick per day you open the app. Time away costs nothing.
          Food, water and soap go in your bag; shelter and papers apply straight away.
        </p>
      </div>`;

    // ---- The bag ----
    const carried = bag();
    const ids = Object.keys(carried);
    const bagSec = document.createElement("div");
    bagSec.className = "settings-section";
    bagSec.innerHTML = `
      <div class="stats-section-title">\u{1F392} In your bag</div>
      ${ids.length
        ? `<div class="bag-grid" id="bag-grid"></div>`
        : `<p class="settings-hint">Empty. Food, water and soap are carried \u2014 buy them
           when you have money and use them when you need them.</p>`}`;
    body.appendChild(bagSec);

    if (ids.length) {
      const grid = bagSec.querySelector("#bag-grid");
      ids.forEach(id => {
        const it = item(id);
        const row = document.createElement("button");
        row.className = "bag-item";
        row.innerHTML = `
          <span class="bag-icon">${it.icon}</span>
          <span class="bag-name">${it.name}</span>
          <span class="bag-effect">${effectText(it)}</span>
          <span class="bag-count">\u00d7${carried[id]}</span>
          <span class="bag-use">Use</span>`;
        row.addEventListener("click", () => {
          if (use(id)) { renderVitals(); renderLifeTab(mountedIn || body); }
        });
        grid.appendChild(row);
      });
    }

    CATS.forEach(c => {
      const items = LIFE_ITEMS.filter(i => i.cat === c.id);
      if (!items.length) return;
      const sec = document.createElement("div");
      sec.className = "settings-section";
      sec.innerHTML = `<div class="stats-section-title">${c.title}</div>`;
      const grid = document.createElement("div");
      grid.className = "shop-grid";

      items.forEach(it => {
        const have = it.once && owns(it.id);
        const afford = DB.getWallet() >= it.price;
        const card = document.createElement("div");
        card.className = `shop-card${have ? " owned" : ""}`;
        card.innerHTML = `
          <div class="shop-card-preview game-preview"><span class="gp-icon">${it.icon}</span></div>
          <div class="shop-card-body">
            <div class="shop-name">${it.name}</div>
            <div class="shop-tagline">${effectText(it)}</div>
            ${have
              ? `<button class="shop-btn equipped" disabled>\u2713 Owned</button>`
              : `<button class="shop-btn buy${afford ? "" : " short"}" ${afford ? "" : "disabled"}>
                   ${isCarried(it) ? "Buy " : ""}$${it.price}</button>`}
          </div>`;
        const btn = card.querySelector("button");
        if (btn && !btn.disabled) {
          btn.addEventListener("click", () => {
            // Re-render IN PLACE. Going through Dojo.renderGames would
            // re-run the whole tab and end in showScreen -> scrollTo(0,0),
            // which threw the page to the top on every purchase.
            if (buy(it.id)) { renderVitals(); renderLifeTab(mountedIn || body.parentElement); }
          });
        }
        grid.appendChild(card);
      });

      sec.appendChild(grid);
      body.appendChild(sec);
    });
  }

  Dojo.LifeShop = {
    LIFE_ITEMS, SHELTER, DECAY, VITALS, WEAK_AT, THEFT,
    item, owns, buy, use, bag, isCarried, cost, dailyTick, isWeak, weakReason, shelter,
    rollTheft, lastNight, clearNightReport, effect, demoteShelter, LADDER
  };
  Object.assign(Dojo, { renderVitals, renderLifeTab });
})();
