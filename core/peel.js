// ================================================
// Knell — the rank sticker, and the short guide under it
// ------------------------------------------------
// Asked for on 2026-11-22: "rankings (if not cache like user didnt use)
// you need to peel off a shell from ranking line. when done so it starts
// a short guide about the system ... showing a popup screen sliding thru
// answers then it stays peeled off".
//
// So on a browser that has never peeled it, the rank line in the top bar
// (#rank-chip, core/hud.js) wears a foil sticker. Drag it to peel it, or
// just tap it; either way it comes off, and a guide opens: a few cards,
// each a question and its answer, slid through with the arrows, a swipe
// or the keyboard. The last card can take you to the full ladder
// (Career). After that the sticker never comes back on this browser.
//
// Every answer was checked against the code: shop/ranks.js for the
// ladder and its rewards, core/hud.js for what tapping the rank does,
// library.js and core/earn.js for who pays XP. If those change, these
// lines change with them.
// ================================================

(() => {
  const KEY = "knell.rankPeeled";
  const lang = () => (typeof I18N !== "undefined" && I18N.lang && I18N.lang()) || "en";
  const T = v => (v && (v[lang()] || v.en)) || "";

  const S = {
    sticker: { en: "Peel to see your rank", ru: "Отклейте — здесь ваш ранг" },
    keepGoing: { en: "Keep peeling…", ru: "Отклеивайте дальше…" },
    title: { en: "Your rank", ru: "Ваш ранг" },
    back: { en: "Back", ru: "Назад" },
    next: { en: "Next", ru: "Дальше" },
    ladder: { en: "See the ladder", ru: "К лестнице" },
    close: { en: "Close", ru: "Закрыть" },
    step: { en: "{i} of {n}", ru: "{i} из {n}" },
    rankOf: { en: "Rank {n} of {all}", ru: "Ранг {n} из {all}" },
    xpOf: { en: "{into} of {span} XP", ru: "{into} из {span} опыта" },
    toGo: { en: "{n} XP to {name}", ru: "До ранга «{name}» — {n} опыта" },
    top: { en: "The top of the ladder", ru: "Вершина лестницы" },
    nextRank: { en: "Next: {name}", ru: "Следующий ранг: {name}" },
    theme: { en: "{name} theme", ru: "Тема «{name}»" },
    pattern: { en: "{name} background", ru: "Узор фона «{name}»" },
    tokens: { en: "{n} tokens", ru: "{n} жетонов" },
    server: { en: "Paid by the server", ru: "Начисляет сервер" },
    demo: { en: "This demo has no server, so the sample student's rank stays where it is.",
            ru: "У этого демо нет сервера, поэтому ранг учебного профиля не меняется." }
  };
  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  const num = n => Number(n).toLocaleString(lang() === "ru" ? "ru-RU" : "en-US");
  const div = (cls, text) => {
    const n = document.createElement("div");
    n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // What a rank hands out, in words, under the names Custom shows for it
  // (shop/themes.js).
  function reward(r) {
    const w = (r && r.reward) || {};
    const cap = id => id.charAt(0).toUpperCase() + id.slice(1);
    if (w.theme) {
      const t = (Dojo.ALL_THEMES || []).find(x => x.id === w.theme);
      return { icon: "\u{1F3A8}", text: fill(T(S.theme), { name: t ? t.name : cap(w.theme) }) };
    }
    if (w.bgStripe) {
      const s = (Dojo.BG_STRIPES || []).find(x => x.id === w.bgStripe);
      return { icon: "\u{1F9F5}", text: fill(T(S.pattern), { name: s ? s.name : cap(w.bgStripe) }) };
    }
    if (w.tokens) return { icon: "\u{1FA99}", text: fill(T(S.tokens), { n: w.tokens }) };
    return null;
  }

  // Five cards, each a picture drawn from the learner's own numbers over a
  // title and a line or two ("post peel cards are poorly designed", so the
  // first, all-text version was redone the same day). Built afresh every
  // time the guide opens, so the numbers are today's.
  const SLIDES = [
    { title: { en: "This is your rank", ru: "Это ваш ранг" },
      text: { en: "It shows how much you have studied. There are twenty, from Lab Intern to Nobel Laureate.",
              ru: "Он показывает, сколько вы уже выучили. Всего рангов двадцать — от стажёра лаборатории до нобелевского лауреата." },
      art: p => {
        const d = div("rg-rank"), ins = div("rg-insignia");
        ins.innerHTML = Dojo.Ranks.insigniaSvg(p.cur);
        d.append(ins, div("rg-rank-name", p.cur.name),
          div("rg-sub", fill(T(S.rankOf), { n: p.cur.n, all: Dojo.Ranks.RANKS.length })));
        return d;
      } },
    { title: { en: "XP moves it up", ru: "Его поднимает опыт" },
      text: { en: "Chunks, exams and reviews all earn XP. It is never spent, and each rank needs more than the last.",
              ru: "Опыт (XP) дают части уроков, экзамены и повторения. Он никогда не тратится, а каждый следующий ранг требует больше." },
      art: p => {
        const d = div("rg-xp");
        if (!p.next) { d.append(div("rg-big", "⭐"), div("rg-sub", T(S.top))); return d; }
        const bar = div("rg-bar"), f = div("rg-bar-fill");
        f.style.width = p.pct.toFixed(1) + "%";
        bar.appendChild(f);
        d.append(div("rg-xp-num", fill(T(S.xpOf), { into: num(p.into), span: num(p.span) })), bar,
          div("rg-sub", fill(T(S.toGo), { n: num(p.toGo), name: p.next.name })));
        return d;
      } },
    { title: { en: "Every rank gives a reward", ru: "За каждый ранг — награда" },
      text: { en: "A colour theme, a background pattern, or tokens that unlock courses.",
              ru: "Цветовая тема, узор фона или жетоны, которыми открываются курсы." },
      art: p => {
        const d = div("rg-reward"), w = reward(p.next || p.cur);
        d.appendChild(div("rg-sub", p.next ? fill(T(S.nextRank), { name: p.next.name }) : T(S.top)));
        if (w) {
          const chip = div("rg-chip");
          chip.append(div("rg-chip-icon", w.icon), div("rg-chip-text", w.text));
          d.appendChild(chip);
        }
        return d;
      } },
    { title: { en: "The server keeps the score", ru: "Счёт ведёт сервер" },
      text: { en: "Your browser reports what you finished. The server decides what it is worth, so XP cannot be typed in.",
              ru: "Браузер сообщает, что вы прошли, а сколько это стоит, решает сервер. Поэтому опыт нельзя просто вписать." },
      demo: true,
      art: () => {
        const d = div("rg-lock");
        d.append(div("rg-big", "\u{1F512}"), div("rg-sub", T(S.server)));
        return d;
      } },
    { title: { en: "Tap your rank any time", ru: "Нажмите на ранг в любой момент" },
      text: { en: "It shows how far the next one is. The whole ladder, with every reward, is under Career in the lobby.",
              ru: "Он покажет, сколько осталось до следующего. Вся лестница со всеми наградами — в Карьере, в лобби." },
      art: p => {
        const d = div("rg-ladder"), R = Dojo.Ranks.RANKS, k = R.indexOf(p.cur);
        [k + 2, k + 1, k, k - 1].filter(j => j >= 0 && j < R.length).forEach(j => {
          const rung = div("rg-rung" + (j === k ? " here" : j > k ? " ahead" : "")), ins = div("rg-rung-ins");
          ins.innerHTML = Dojo.Ranks.insigniaSvg(R[j]);
          rung.append(ins, div("rg-rung-name", R[j].name));
          d.appendChild(rung);
        });
        return d;
      } }
  ];

  const peeled = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return true; } };
  const remember = () => { try { localStorage.setItem(KEY, "1"); } catch (e) { /* private mode: it peels again next time */ } };

  // ---- The guide -------------------------------------------------------
  let box = null, i = 0;
  function build() {
    box = document.createElement("div");
    box.className = "modal-overlay rank-guide";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", T(S.title));
    box.innerHTML =
      '<div class="modal-card rank-guide-card">' +
        '<button type="button" class="rg-close"></button>' +
        '<div class="rank-guide-view"><div class="rank-guide-track"></div></div>' +
        '<div class="rg-foot">' +
          '<div class="rg-steps"></div>' +
          '<div class="rank-guide-nav">' +
            '<button type="button" class="btn-ghost rank-guide-back"></button>' +
            '<button type="button" class="btn-primary rank-guide-next"></button>' +
          '</div>' +
        '</div>' +
      '</div>';
    const x = box.querySelector(".rg-close");
    x.textContent = "×";
    x.setAttribute("aria-label", T(S.close));
    x.addEventListener("click", close);
    box.querySelector(".rank-guide-back").addEventListener("click", () => go(i - 1));
    box.querySelector(".rank-guide-next").addEventListener("click", () => {
      if (i < SLIDES.length - 1) go(i + 1);
      else { close(); if (Dojo.Router) Dojo.Router.go("shop"); }
    });
    box.addEventListener("click", e => { if (e.target === box) close(); });

    // A swipe slides it, the same as the buttons.
    const view = box.querySelector(".rank-guide-view");
    let x0 = null;
    view.addEventListener("pointerdown", e => { x0 = e.clientX; });
    view.addEventListener("pointerup", e => {
      if (x0 == null) return;
      const dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    });
    document.body.appendChild(box);
  }

  function fillSlides() {
    const track = box.querySelector(".rank-guide-track"), steps = box.querySelector(".rg-steps");
    track.replaceChildren();
    steps.replaceChildren();
    const xp = typeof DB !== "undefined" && DB.getXp ? DB.getXp() : 0;
    const p = Dojo.Ranks ? Dojo.Ranks.progress(xp) : null;
    SLIDES.forEach((s, k) => {
      const slide = document.createElement("section");
      slide.className = "rank-guide-slide";
      const art = div("rg-art");
      if (p) art.appendChild(s.art(p));
      const body = div("rg-body");
      const h = document.createElement("h3");
      h.className = "rg-title";
      h.textContent = T(s.title);
      const t = document.createElement("p");
      t.className = "rg-text";
      t.textContent = T(s.text);
      body.append(div("rg-step", fill(T(S.step), { i: k + 1, n: SLIDES.length })), h, t);
      if (s.demo && Dojo.DEMO) {
        const d = document.createElement("p");
        d.className = "rg-demo";
        d.textContent = T(S.demo);
        body.appendChild(d);
      }
      slide.append(art, body);
      track.appendChild(slide);
      steps.appendChild(document.createElement("span"));
    });
  }

  function go(n) {
    i = Math.max(0, Math.min(SLIDES.length - 1, n));
    box.querySelector(".rank-guide-track").style.transform = `translateX(${-100 * i}%)`;
    box.querySelectorAll(".rg-steps span").forEach((d, k) => d.classList.toggle("on", k <= i));
    const back = box.querySelector(".rank-guide-back"), next = box.querySelector(".rank-guide-next");
    back.textContent = T(S.back);
    back.style.visibility = i === 0 ? "hidden" : "visible";
    next.textContent = T(i === SLIDES.length - 1 ? S.ladder : S.next);
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowLeft") go(i - 1);
  }
  function openRankGuide() {
    if (!box) build();
    fillSlides();
    go(0);
    box.style.display = "flex";
    document.addEventListener("keydown", onKey);
    box.querySelector(".rank-guide-next").focus();
  }
  function close() {
    if (!box) return;
    box.style.display = "none";
    document.removeEventListener("keydown", onKey);
  }

  // ---- The sticker -----------------------------------------------------
  // A sibling of the chip inside the fixed top bar, laid over the chip's
  // own box and kept there as the chip changes size.
  //
  // Peeling is work, on purpose: "a process where you need to spend at
  // least 7 seconds" (2026-11-22). It comes away from the right, a strip
  // at a time, with the rank showing through behind it, and it moves only
  // while it is being worked: pressed and rubbed with the pointer, or
  // with Enter or Space held down. Seven seconds of that and it is off.
  // A tap does nothing much, and letting go leaves it half peeled, to be
  // picked up again where it was left.
  const PEEL_MS = 7000;
  // How long after the last movement a press still counts as peeling:
  // a finger held still is not peeling, a finger rubbing is.
  const STILL_MS = 160;
  function addSticker() {
    const chip = document.getElementById("rank-chip");
    const bar = document.getElementById("charge-bar");
    if (!chip || !bar || peeled() || document.getElementById("rank-peel")) return;
    // Only for someone new here ("if not cache like user didnt use"): no
    // profile yet, or the demo's sample profile seeded on this very visit
    // (core/demo.js sets freshProfile). A browser that already had a
    // profile when this arrived was used before it existed, so it is
    // marked as peeled and never shown the sticker.
    // typeof, not window.DB: data/db.js declares DB with const, which is
    // global but never a property of window.
    const fresh = Dojo.freshProfile || !(typeof DB !== "undefined" && DB.getActiveProfile && DB.getActiveProfile());
    if (!fresh) { remember(); return; }
    const s = document.createElement("div");
    s.id = "rank-peel";
    s.className = "rank-peel";
    s.setAttribute("role", "button");
    s.setAttribute("tabindex", "0");
    s.setAttribute("aria-label", T(S.sticker));
    s.innerHTML = '<span class="rank-peel-label"></span><span class="rank-peel-curl"></span>';
    const label = s.querySelector(".rank-peel-label");
    label.textContent = T(S.sticker);
    bar.appendChild(s);

    const fit = () => {
      s.style.left = chip.offsetLeft + "px";
      s.style.top = chip.offsetTop + "px";
      s.style.width = Math.max(chip.offsetWidth, 150) + "px";
      s.style.height = chip.offsetHeight + "px";
    };
    fit();
    let ro = null;
    if ("ResizeObserver" in window) { ro = new ResizeObserver(fit); ro.observe(chip); }

    // `done` is how much has come away, 0 to 1. It only grows while the
    // sticker is held and moving (or a key is held), at the rate that
    // makes 7 seconds of that the whole job, and it never goes back.
    let done = 0, held = false, keyHeld = false, lastMove = 0, lastTick = 0, raf = 0, finished = false;
    const paint = () => {
      s.style.setProperty("--peel", done.toFixed(4));
      if (done > 0 && !s.classList.contains("started")) {
        s.classList.add("started");
        label.textContent = T(S.keepGoing);
      }
    };
    const off = () => {
      finished = true;
      if (ro) ro.disconnect();
      remember();
      s.classList.add("gone");
      setTimeout(() => s.remove(), 450);
      setTimeout(openRankGuide, 320);
    };
    const tick = now => {
      raf = 0;
      if (finished || !(held || keyHeld)) return;
      const dt = lastTick ? now - lastTick : 0;
      lastTick = now;
      if (keyHeld || now - lastMove < STILL_MS) done = Math.min(1, done + dt / PEEL_MS);
      paint();
      if (done >= 1) { off(); return; }
      raf = requestAnimationFrame(tick);
    };
    const begin = () => {
      s.classList.add("peeling");
      lastTick = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (held || keyHeld) return;
      s.classList.remove("peeling");
    };
    s.addEventListener("pointerdown", e => {
      held = true;
      lastMove = performance.now();
      try { s.setPointerCapture(e.pointerId); } catch (err) { /* not a live pointer */ }
      begin();
    });
    s.addEventListener("pointermove", () => { if (held) lastMove = performance.now(); });
    const release = () => { held = false; stop(); };
    s.addEventListener("pointerup", release);
    s.addEventListener("pointercancel", release);
    s.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (!keyHeld) { keyHeld = true; begin(); }
    });
    s.addEventListener("keyup", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      keyHeld = false;
      stop();
    });
    s.addEventListener("blur", () => { keyHeld = false; stop(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addSticker);
  else addSticker();

  Object.assign(Dojo, { openRankGuide });
})();
