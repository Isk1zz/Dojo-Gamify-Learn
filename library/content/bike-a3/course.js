// ================================================
// Course: Теория A3 — электровелосипед (Израиль)
// ------------------------------------------------
// Manifest only. Содержание — в data_m1.js рядом.
//
// Единственный курс на русском, и это не оплошность: экзамен A3
// сдаётся на русском или на иврите, а официальный банк вопросов
// Министерства транспорта опубликован по-русски дословно. Перевод на
// английский учил бы не тому тексту, который человек увидит на экране
// в экзаменационном зале.
//
// track: "other" — library.js группирует курсы по трекам "cs",
// "science" и "other"; всё остальное падает в "other" само, но здесь
// это указано явно, потому что выбор осознанный, а не умолчание.
//
// ---- Unit id ----
// 31. Intro to CS занимает 1-8, CURRICULUM-PLAN.md §2 резервирует
// 9-30 за четырьмя научными курсами. Id глобальны: на них завязаны
// прогресс, повторения и Garden, и повторное использование id молча
// склеивает прогресс двух разных тем.
//
// ---- Про guard ----
// Модуль читается через typeof, а не по имени напрямую: пропущенный
// или неправильно упорядоченный <script> иначе роняет ReferenceError,
// который прерывает ЭТОТ файл — Content.course() не вызывается, курс
// не регистрируется, и Библиотека приходит пустой. Та же схема, что
// в intro-cs/course.js, и по той же причине.
// ================================================

(() => {
  const m1 = typeof MODULE_A3 === "undefined" ? null : MODULE_A3;

  if (!m1) {
    console.error(
      "[bike-a3] MODULE_A3 never loaded, so the course has no units.\n" +
      "  Add this to index.html BEFORE library/content/bike-a3/course.js:\n" +
      "    <script src=\"library/content/bike-a3/data_m1.js\"></script>"
    );
    return;
  }

  Content.course({
    id: "bike-a3",
    // {en, ru} bags — resolved by I18N at registration, so everything
    // downstream still sees a plain string. See core/i18n.js.
    title: { en: "A3 Theory — Electric Bicycle", ru: "Теория A3 — электровелосипед" },
    track: "other",
    subtitle: {
      en: "The Ministry of Transport's official question bank, Israel",
      ru: "Официальный банк вопросов Министерства транспорта, Израиль"
    },
    icon: "\u{1F6B2}",
    available: true,
    // 100 Tokens — exactly the starter pack ($3.99), so buying it leaves
    // no unspendable dust behind. Was free until 2026-08-24; see
    // UPDATESTACK.md on what pricing it costs, because this course was
    // the app's only no-purchase way in.
    priceTokens: 100,
    // The real test's terms, and the reason they live here rather than
    // in library/exam-sim.js: 30/40/26 is a fact about the Israeli A3
    // exam, not about this app. draw comes out of the pool of official
    // questions the course carries (40 for A3 — see data_m1.js), pass
    // is the mark, minutes is the clock.
    examSim: { draw: 30, minutes: 40, pass: 26 },
    units: [
      {
        id: 31,
        title: { en: "Block A3", ru: "Блок A3" },
        subtitle: {
          en: "Electric bicycles: the law, the road, staying alive",
          ru: "Электровелосипед: закон, дорога, безопасность"
        },
        icon: "\u{1F6B2}",
        modules: [m1]
      }
    ]
  });
})();
