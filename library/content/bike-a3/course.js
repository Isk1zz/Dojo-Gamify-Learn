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

    about: {
      ru: `<p><strong>Курс существует ради одного результата: сдать теоретический
        экзамен категории A3</strong> — на электровелосипед — в Израиле.</p>
      <p>Внутри <strong>все 40 официальных вопросов</strong> из банка Министерства
        транспорта, каждый ровно один раз: 30 разложены по экзаменационным блокам,
        10 встроены в главы как проверочные. Формулировки взяты с сайта министерства,
        а не переведены — если вопрос звучит криво, он криво звучит и на экзамене.</p>
      <p>Но одного банка мало, и курс это не скрывает. Экзамен не спрашивает про
        <strong>дорожные знаки</strong>, а ездить, не зная их, нельзя — поэтому есть
        отдельная глава на двенадцать знаков, сверенных с официальной таблицей
        тамруров. И там, где банк вопросов расходится с законом, курс идёт за
        законом: несколько правил здесь исправлены по первоисточнику —
        <em>таканот ха-тнуа</em>, — а не по тому, как их пересказывает тест.</p>
      <p>Есть <strong>пробный экзамен</strong> по настоящим условиям: 30 вопросов,
        40 минут, проходной балл 26. В него попадают только министерские вопросы —
        главу про знаки в него намеренно не пускают, чтобы симуляция оставалась
        симуляцией.</p>
      <span class="ca-for"><strong>Для кого:</strong> для тех, кто сдаёт A3 —
        в том числе без водительских прав. Курс не предполагает, что вы уже
        что-то знаете о дорожном движении.</span>`,
      en: `<p><strong>This course exists for one outcome: passing the Israeli A3
        theory exam</strong> for electric bicycles.</p>
      <p>It contains <strong>all 40 official questions</strong> from the Ministry of
        Transport's bank, each used exactly once: 30 distributed across the topic
        exams, 10 built into chapters as chunk quizzes. The wording is taken from the
        ministry's own site, not translated — if a question reads awkwardly, it reads
        awkwardly on the exam too.</p>
      <p>But the bank alone is not enough, and the course does not pretend otherwise.
        The exam never asks about <strong>road signs</strong>, and you cannot ride
        without knowing them — so there is a separate chapter on twelve signs, checked
        against the official sign-table notice. And where the question bank and the law
        disagree, the course follows the law: several rules here are corrected against
        the primary source — the <em>Traffic Regulations</em> — rather than against the
        test's paraphrase of them.</p>
      <p>There is a <strong>mock exam</strong> under the real conditions: 30 questions,
        40 minutes, 26 to pass. Only ministry questions enter it — the signs chapter is
        deliberately kept out, so the simulation stays a simulation.</p>
      <span class="ca-for"><strong>Who it is for:</strong> anyone sitting the A3,
        including without a driving licence. The course assumes no prior knowledge of
        road traffic.</span>`
    },
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
