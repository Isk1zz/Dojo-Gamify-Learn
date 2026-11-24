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
    title: { en: "A letter", ru: "Письмо", he: "מכתב" },
    date: { en: "November 2026", ru: "Ноябрь 2026", he: "נובמבר 2026" },
    // The author's own words (2026-11-22), tidied but not rewritten. The
    // second paragraph says what the author's part was, in concrete
    // terms, as asked ("add some reassuring words that im not nobody"):
    // decisions the author made and the rest of the app is built on, and
    // nothing claimed that was not done.
    hello: { en: "Hello, adventurer.", ru: "Привет, путник.", he: "שלום, הרפתקן." },
    what: {
      en: "I hear you have come a long way before stumbling upon Knell. In short, it is a study app, built to keep you engaged from the first lesson to the last. The Garden is its heart: every topic you pass becomes a plant, and it grows each time you come back to it, so that nothing you learned is left to fade.",
      ru: "Говорят, вы проделали долгий путь, прежде чем наткнуться на Knell. Если коротко, это приложение для учёбы, устроенное так, чтобы держать интерес от первого урока до последнего. Его сердце — Сад: каждая сданная тема становится растением и растёт всякий раз, когда вы к ней возвращаетесь, чтобы ничто выученное не забылось.", he: "שמעתי שעברת דרך ארוכה לפני שנתקלת ב־Knell. בקצרה, זו אפליקציה ללימוד, שנבנתה כדי שהלמידה תמשוך אותך מהשיעור הראשון ועד האחרון. הגינה היא הלב שלה: כל נושא שעוברים הופך לצמח, והוא גדל בכל פעם שחוזרים אליו, כך ששום דבר שלמדת לא נשאר לדעוך."
    },
    who: {
      en: "I designed Knell and lived inside it, in my head, for a month of full-time work. Every screen, every rule and every trade-off was my call: what a lesson is, when an exam lets a topic into review, how the garden grows and withers, and what the server must never trust a browser with. The code was written with Claude, under my direction. I tested it as it grew, and nothing went in without my say.",
      ru: "Я придумал Knell и месяц жил им с утра до ночи. Каждый экран, каждое правило и каждый компромисс — моё решение: что такое урок, когда экзамен пускает тему в повторение, как сад растёт и вянет и чего сервер никогда не доверит браузеру. Код написан с Claude под моим руководством. Я проверял его по ходу, и ничего не попало в приложение без моего решения.", he: "תכננתי את Knell וחייתי בתוכו, בראש שלי, חודש של עבודה במשרה מלאה. כל מסך, כל כלל וכל פשרה היו ההחלטה שלי: מה זה שיעור, מתי מבחן מכניס נושא לחזרות, איך הגינה גדלה ונובלת, ובמה השרת לעולם לא יסמוך על הדפדפן. הקוד נכתב עם Claude, בהנחיה שלי. בדקתי אותו בזמן שגדל, ושום דבר לא נכנס בלי אישור שלי."
    },
    demo: {
      en: "You are in the demo. There is no server behind it to keep accounts or rankings, so the Forum stands in the museum and your progress stays in this browser. The Museum, in the lobby, explains how the rest was meant to work.",
      ru: "Вы в демо. За ним нет сервера, который хранил бы аккаунты и рейтинги, поэтому форум стоит в музее, а прогресс хранится только в этом браузере. Как было задумано остальное, рассказывает Музей в лобби.", he: "זה הדמו. אין מאחוריו שרת שישמור חשבונות או דירוגים, ולכן הפורום עומד במוזיאון וההתקדמות שלך נשארת בדפדפן הזה. המוזיאון, שבלובי, מסביר איך כל השאר היה אמור לעבוד."
    },
    real: {
      en: "This is the real app. Its server has been switched off since 2026, so signing in no longer works. The demo opens without an account: isk1zz.github.io/knell_demo",
      ru: "Это настоящее приложение. Его сервер выключен с 2026 года, поэтому войти уже не получится. Демо открывается без аккаунта: isk1zz.github.io/knell_demo", he: "זו האפליקציה האמיתית. השרת שלה כבוי מאז 2026, ולכן כבר אי אפשר להיכנס לחשבון. הדמו נפתח בלי חשבון: isk1zz.github.io/knell_demo"
    },
    // No link to the source repository: its author does not plan to carry
    // it on, so the letter does not point there (2026-11-22).
    sign: { en: "Illia “isk1zz” Polianskyi", ru: "Illia «isk1zz» Polianskyi", he: "Illia “isk1zz” Polianskyi" },
    // Asked 2026-11-24: the author's email and Instagram, in the museum
    // and here, for whoever wants to answer. The address is put together
    // from two halves so a script combing the source does not find it.
    ps: { en: "P.S. If you want to write back:", ru: "P.S. Если захотите ответить:", he: "נ.ב. אם תרצה לענות לי:" },
    close: { en: "Close", ru: "Закрыть", he: "סגירה" }
  };
  const MAIL = ["reveralrise", "gmail.com"].join("@");
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
    add("p", "letter-sign", "— " + t("sign"));
    const ps = add("p", "letter-ps", t("ps") + " ");
    [["mailto:" + MAIL, MAIL], ["https://www.instagram.com/isk1zz/", "Instagram @isk1zz"]].forEach(([href, text], i) => {
      if (i) ps.appendChild(document.createTextNode(" · "));
      const a = document.createElement("a");
      a.href = href;
      a.textContent = text;
      a.dir = "ltr";
      if (href.startsWith("http")) { a.target = "_blank"; a.rel = "noopener"; }
      ps.appendChild(a);
    });
    const ok = add("button", "btn-primary letter-close", t("close"));
    ok.addEventListener("click", closeLetter);
    box.addEventListener("click", e => { if (e.target === box) closeLetter(); });
    box.appendChild(card);
    document.body.appendChild(box);
  }
  function onKey(e) { if (e.key === "Escape") closeLetter(); }
  function openLetter() {
    if (!box) build();
    // Paper sliding out and unfolding (core/sfx.js), from the mailbox or
    // from the museum alike.
    if (Dojo.sfx && Dojo.sfx.letter) Dojo.sfx.letter();
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
