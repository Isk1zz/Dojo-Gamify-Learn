// ================================================
// Knell — CORE / first-run appearance
// ------------------------------------------------
// Offers a new account a look before they start studying. Small steps,
// shape before paint: layout, then (only in Star) how its tiles are
// wired, then colour.
//
// ---- Why a bottom bar and not a modal with thumbnails ----
// The obvious build is a grid of preview images. It is also the worst
// one here: every thumbnail is a second copy of the design that goes
// stale the moment a theme changes, and a 120px picture cannot show
// what a theme actually feels like at full size.
//
// So the APP is the preview. The bar sits at the bottom, everything
// above it stays live, and cycling with < > applies the real theme to
// the real lobby immediately. Nothing to keep in sync, and what you see
// is exactly what you get because it IS what you get.
//
// ---- Why it is skippable and non-blocking ----
// Someone who came here to study should not have to make three
// aesthetic decisions first. Skip is always visible, every choice is
// changeable later in Custom, and the bar says so — an onboarding step
// that feels permanent is one people freeze on.
//
// ---- Why it only runs once ----
// Keyed on its own localStorage marker rather than "does this profile
// look default", because someone can legitimately choose the defaults
// and should not be asked again for having good taste.
// ================================================

(() => {
  const SEEN_KEY = "knell-appearance-set";

  function alreadySeen() {
    try { return localStorage.getItem(SEEN_KEY) === "1"; }
    catch (e) { return true; }   // storage blocked: never nag
  }
  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* non-fatal */ }
  }

  // ---- What can be chosen -------------------------------------------
  // Read from the live catalogues rather than a private list, so a theme
  // added later shows up here for free. Only ungated entries: an
  // onboarding step that offers something locked is a shop, not a
  // welcome.
  function themeChoices() {
    const all = (Dojo.THEMES || []).filter(t =>
      !Dojo.isPremium || !Dojo.isPremium(t.id) || (Dojo.ownsTheme && Dojo.ownsTheme(t.id)));
    return all.map(t => ({ id: t.id, name: t.name, swatch: t.swatch }));
  }

  const LAYOUT_CHOICES = () => I18N.resolve([
    { id: "star",    name: { en: "Star",    ru: "Звезда" } },
    { id: "cards",   name: { en: "Cards",   ru: "Карточки" } },
    { id: "classic", name: { en: "Classic", ru: "Классика" } }
  ]);

  const LINK_CHOICES = () => I18N.resolve([
    { id: "spokes",    name: { en: "Spokes",        ru: "Лучи" } },
    { id: "hexagram",  name: { en: "Star of David", ru: "Звезда Давида" } },
    { id: "pentagram", name: { en: "Pentagram",     ru: "Пентаграмма" } }
  ]);

  // ---- Steps ---------------------------------------------------------
  // Each step owns its list, how to read the current value, and how to
  // apply one. Applying goes through the SAME functions Custom uses, so
  // there is no second write path to keep correct.
  // ---- Order: SHAPE first, then paint ----
  // Layout leads, colour comes last. Two reasons, and the second is the
  // one that actually forces it:
  //
  //   1. Shape is the bigger commitment. Star and Classic are different
  //      products to navigate; a colour is a coat of paint on whichever
  //      you chose. Deciding the paint before the object is backwards.
  //   2. The layout DETERMINES whether the wiring step exists at all —
  //      links only mean anything in Star. Asking colour first meant the
  //      step count could grow underneath someone mid-flow, which is
  //      exactly the kind of thing that makes a wizard feel unstable.
  //
  // So: layout -> wiring (only in Star) -> colour. Wiring sits next to
  // layout because it is a property OF the layout, not a peer of it.
  function steps() {
    const list = [
      {
        key: "layout",
        label: () => I18N.t("onb.stepLayout"),
        why:   () => I18N.t("onb.whyLayout"),
        items: LAYOUT_CHOICES,
        get:   () => DB.getLobbyStyle(),
        set:   id => { DB.setLobbyStyle(id); if (Dojo.showLobby) Dojo.showLobby(); }
      }
    ];

    // Only asked when it can matter — the links are invisible in Classic
    // and Cards, so offering them there is a question with no visible
    // answer. This is the "mini chunks" rule doing real work: the step
    // count adapts rather than padding itself out.
    if (DB.getLobbyStyle() === "star") {
      list.push({
        key: "links",
        label: () => I18N.t("onb.stepLinks"),
        why:   () => I18N.t("onb.whyLinks"),
        items: LINK_CHOICES,
        get:   () => (DB.getStarLinks && DB.getStarLinks()) || "spokes",
        set:   id => { DB.setStarLinks(id); if (Dojo.showLobby) Dojo.showLobby(); }
      });
    }

    list.push({
      key: "theme",
      label: () => I18N.t("onb.stepTheme"),
      why:   () => I18N.t("onb.whyTheme"),
      items: themeChoices,
      get:   () => DB.getTheme(),
      set:   id => { if (Dojo.equipTheme) Dojo.equipTheme(id); else DB.setTheme(id); }
    });

    return list;
  }

  let stepIdx = 0;

  function el(id) { return document.getElementById(id); }

  function render() {
    const bar = el("onboard-bar");
    if (!bar) return;
    const all = steps();
    if (stepIdx >= all.length) return finish();

    const step = all[stepIdx];
    const items = step.items();
    const cur = step.get();
    const at = Math.max(0, items.findIndex(i => i.id === cur));
    const item = items[at] || items[0];

    el("onb-step").textContent = step.label();
    el("onb-why").textContent = step.why();
    el("onb-value").textContent = item ? (item.name || item.id) : "";
    el("onb-count").textContent = `${at + 1} / ${items.length}`;
    el("onb-progress").textContent = `${stepIdx + 1} / ${all.length}`;
    el("onb-next").textContent = stepIdx === all.length - 1
      ? I18N.t("onb.done") : I18N.t("onb.next");
  }

  // Cycling wraps in both directions — a picker that dead-ends at the
  // last item makes people click back through everything to reach the
  // first one.
  function cycle(dir) {
    const all = steps();
    const step = all[stepIdx];
    if (!step) return;
    const items = step.items();
    if (!items.length) return;
    const cur = step.get();
    const at = Math.max(0, items.findIndex(i => i.id === cur));
    const next = items[(at + dir + items.length) % items.length];
    step.set(next.id);
    render();
  }

  function finish() {
    markSeen();
    const bar = el("onboard-bar");
    if (bar) bar.style.display = "none";
    if (Dojo.showLobby) Dojo.showLobby();

    // Send the choices up immediately instead of waiting for the next
    // study checkpoint. This is the one moment someone has deliberately
    // set their appearance, and it is also the most likely moment for
    // them to open the app somewhere else and expect it to match.
    // Fire-and-forget: sync failing must never make "Lock it in" feel
    // like it did not work.
    if (Dojo.Sync && Dojo.Sync.syncNow) Dojo.Sync.syncNow();
  }

  function open() {
    const bar = el("onboard-bar");
    if (!bar) return;
    stepIdx = 0;
    bar.style.display = "flex";
    render();
  }

  // Called from the lobby. Runs only for someone who has never chosen,
  // and only once they are actually in the app — asking before sign-in
  // would be a decision in front of the thing they came for.
  function maybeOffer() {
    if (alreadySeen()) return false;
    if (!DB.getActiveProfile()) return false;
    // Already up: do NOT reopen. The layout and links steps call
    // showLobby() to repaint the preview, and showLobby() is where this
    // is invoked from -- so without this guard, changing the layout
    // re-entered open(), reset stepIdx to 0 and threw the person back to
    // step one. Caught in testing: cycling to Cards on step 2 bounced
    // the bar to "Pick a colour, 1/3".
    const bar = el("onboard-bar");
    if (bar && bar.style.display === "flex") return false;
    open();
    return true;
  }

  function bind() {
    if (!el("onboard-bar")) return;
    el("onb-prev").addEventListener("click", () => cycle(-1));
    el("onb-next-item").addEventListener("click", () => cycle(1));
    el("onb-skip").addEventListener("click", finish);
    el("onb-next").addEventListener("click", () => {
      stepIdx++;
      const all = steps();
      if (stepIdx >= all.length) return finish();
      render();
    });
    // Arrow keys drive it too — this is a "flick through options"
    // control, and reaching for the mouse to compare two themes breaks
    // the comparison.
    document.addEventListener("keydown", e => {
      const bar = el("onboard-bar");
      if (!bar || bar.style.display === "none") return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); cycle(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); cycle(1); }
      if (e.key === "Enter")      { e.preventDefault(); el("onb-next").click(); }
      if (e.key === "Escape")     { e.preventDefault(); finish(); }
    });
  }
  bind();

  Dojo.Onboard = { maybeOffer, open, alreadySeen };
})();
