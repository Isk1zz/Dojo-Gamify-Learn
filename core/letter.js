// ================================================
// Knell — a letter to whoever opens this
// ------------------------------------------------
// Asked for on 2026-11-22: "imagine i open up or someone random now or in
// 10 years. would've been good to get filled in with some note? or a
// letter that could be pressed". So the start screen's garden has a
// mailbox at its gate, and the runner fetches this from it
// (scenes/knell-garden.js, act: "letter"). The museum shows it too.
//
// Written to still be true in ten years: it is dated, and it says what
// was already switched off when it was written. One paragraph has two
// versions, for the demo and for the real app, chosen by Dojo.DEMO.
//
// The words are the author's. Change them here, in both languages.
// ================================================

(() => {
  const L = {
    title: { en: "A letter", ru: "Письмо" },
    date: { en: "November 2026", ru: "Ноябрь 2026" },
    hello: { en: "Hello, whoever you are, and whenever this is.",
             ru: "Здравствуйте — кто бы вы ни были и когда бы это ни читали." },
    what: {
      en: "This is Knell, a study app. It teaches in short chunks, checks what you learned with an exam, and then keeps asking about it at growing intervals, so that it stays remembered. The garden outside is that idea: every topic you pass is a plant, and it grows while you keep remembering it.",
      ru: "Это Knell, приложение для учёбы. Оно учит короткими частями, проверяет выученное экзаменом, а потом спрашивает о нём снова через всё более длинные промежутки, чтобы оно не забылось. Сад за окном и есть эта идея: каждая сданная тема — растение, и оно растёт, пока вы её помните."
    },
    who: {
      en: "I designed Knell and made every decision in it. The code was written with AI (Claude), under my direction.",
      ru: "Я придумал Knell и принял в нём каждое решение. Код написан с помощью ИИ (Claude) под моим руководством."
    },
    demo: {
      en: "You are in the demo. It has no server: there are no accounts, the Forum stands in the museum, and your progress stays in this browser. The Museum, in the lobby, explains how the rest was meant to work.",
      ru: "Вы в демо. У него нет сервера: аккаунтов нет, форум стоит в музее, а прогресс хранится только в этом браузере. Как было задумано остальное, рассказывает Музей в лобби."
    },
    real: {
      en: "This is the real app. Its server has been switched off since 2026, so signing in no longer works. The demo opens without an account: isk1zz.github.io/knell_demo",
      ru: "Это настоящее приложение. Его сервер выключен с 2026 года, поэтому войти уже не получится. Демо открывается без аккаунта: isk1zz.github.io/knell_demo"
    },
    source: { en: "The full source and its history: github.com/Isk1zz/Dojo-Gamify-Learn",
              ru: "Весь код и его история: github.com/Isk1zz/Dojo-Gamify-Learn" },
    sign: { en: "Illia", ru: "Illia" },
    close: { en: "Close", ru: "Закрыть" }
  };
  const t = key => {
    const lang = (typeof I18N !== "undefined" && I18N.lang && I18N.lang()) || "en";
    return L[key][lang] || L[key].en;
  };

  // Built on first open and kept: a dialog in the app's own modal frame,
  // dressed as paper. Escape, the button or a click outside closes it.
  let box = null;
  function build() {
    box = document.createElement("div");
    box.id = "knell-letter";
    box.className = "modal-overlay";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", t("title"));
    const card = document.createElement("div");
    card.className = "modal-card letter-card";
    const add = (tag, cls, text) => {
      const n = document.createElement(tag);
      n.className = cls;
      n.textContent = text;
      card.appendChild(n);
      return n;
    };
    add("p", "letter-date", t("date"));
    add("p", "letter-hello", t("hello"));
    add("p", "letter-p", t("what"));
    add("p", "letter-p", t("who"));
    add("p", "letter-p", t(Dojo.DEMO ? "demo" : "real"));
    add("p", "letter-p", t("source"));
    add("p", "letter-sign", "— " + t("sign"));
    const ok = add("button", "btn-primary letter-close", t("close"));
    ok.addEventListener("click", closeLetter);
    box.addEventListener("click", e => { if (e.target === box) closeLetter(); });
    box.appendChild(card);
    document.body.appendChild(box);
  }
  function onKey(e) { if (e.key === "Escape") closeLetter(); }
  function openLetter() {
    if (!box) build();
    box.style.display = "flex";
    document.addEventListener("keydown", onKey);
    const ok = box.querySelector(".letter-close");
    if (ok) ok.focus();
  }
  function closeLetter() {
    if (!box) return;
    box.style.display = "none";
    document.removeEventListener("keydown", onKey);
  }

  Object.assign(Dojo, { openLetter });
})();
