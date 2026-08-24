// ================================================
// CS Dojo — KERNEL / language
// ------------------------------------------------
// Two separate jobs that people conflate, kept apart here on purpose:
//
//   I18N.resolve(v)  CONTENT. Course data may carry {en, ru} instead of
//                    a bare string. Resolved once, at Content.build().
//   I18N.t(key)      CHROME. The app's own buttons and labels, which
//                    live in library.js and not in any course.
//
// A course written in one language stays a plain string and is not
// touched by any of this — that is why adding the layer changed no
// existing content file. Intro to CS is still 500KB of bare English
// strings and renders exactly as it did.
//
// ---- Why the language reloads the page ----
// build.js publishes MODULES / UNITS / COURSES / ALL_TOPICS as `const`
// bindings. They cannot be reassigned, and mutating the arrays in place
// would leave state.currentTopics pointing at the old topic objects
// mid-lesson — a switch would appear to work and then serve stale
// chunks. So the language is resolved ONCE per page load and changing
// it reloads.
//
// That is not a workaround, it is the cheap correct option: a reload
// costs nothing here (static files, all cached by the service worker,
// progress is in the DB) and it makes it impossible to hold a
// half-switched app. The alternative — threading a resolver through
// ~60 render call sites — is more code and more places to forget one.
//
// ---- Why localStorage and not the profile ----
// The language must be known before Content.build() runs, which is band
// 2 of the load order; profiles come up later, in boot. Reading it from
// localStorage directly keeps this file dependency-free and lets it sit
// in band 1 next to core.js. The consequence is that language is a
// per-DEVICE choice, not per-profile — which is the honest model
// anyway: it is about who is reading, not which save file is open.
// ================================================

const I18N = (() => {
  const LANGS = ["en", "ru"];
  const KEY = "cs-dojo-lang";
  const FALLBACK = "en";

  function detect() {
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    if (LANGS.includes(saved)) return saved;
    // First run: follow the browser rather than dropping a Russian
    // speaker into an English app and making them go find the toggle.
    const nav = (navigator.language || "").slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : FALLBACK;
  }

  let lang = detect();

  function set(next) {
    if (!LANGS.includes(next) || next === lang) return false;
    try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
    location.reload();
    return true;
  }

  // ---- Content ----
  // A "language bag" is an object whose keys are ALL language codes.
  // That test is what keeps `{heading, text}` and `{term, definition}`
  // from being mistaken for one — a content object always carries at
  // least one key that isn't a language code, so the check is exact
  // rather than a guess, and no content shape is off-limits.
  function isBag(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    const keys = Object.keys(v);
    return keys.length > 0 && keys.every(k => LANGS.includes(k));
  }

  function pick(bag) {
    if (bag[lang] !== undefined) return bag[lang];
    if (bag[FALLBACK] !== undefined) return bag[FALLBACK];
    return bag[LANGS.find(l => bag[l] !== undefined)];
  }

  // Deep, and it re-resolves what a bag yields: a bag holding an array
  // of blocks per language is a legitimate thing to write, and stopping
  // at the first unwrap would hand back unresolved children.
  //
  // Returns the ORIGINAL reference when nothing beneath it was a bag.
  // That is what keeps this free for single-language courses: Intro to
  // CS is around a megabyte of plain strings, and a resolver that
  // deep-copied unconditionally would clone all of it at every boot to
  // produce something identical. Now it walks it once and hands back
  // the same objects.
  function resolve(v) {
    if (isBag(v)) return resolve(pick(v));

    if (Array.isArray(v)) {
      let changed = false;
      const out = v.map(item => {
        const r = resolve(item);
        if (r !== item) changed = true;
        return r;
      });
      return changed ? out : v;
    }

    if (v && typeof v === "object") {
      let changed = false;
      const out = {};
      for (const k in v) {
        const r = resolve(v[k]);
        if (r !== v[k]) changed = true;
        out[k] = r;
      }
      return changed ? out : v;
    }

    return v;
  }

  // ---- Chrome ----
  // Only the study flow is in here: the chunk phases, the quiz, the
  // flashcards. That is a deliberate boundary, not an unfinished job —
  // it is the screen a learner reads for twenty minutes at a stretch,
  // and it is where an English button next to a Russian paragraph
  // actually costs something. The lobby, Shop, Garden and Settings are
  // navigation you learn once and stop reading; translating them is a
  // bigger job with a much smaller payoff, and it can be done later by
  // adding keys here without touching this file's shape.
  const STRINGS = {
    // Phase labels and the button that leaves each phase
    "phase.predict":        { en: "Predict",            ru: "Прогноз" },
    "phase.explain":        { en: "Explanation",        ru: "Объяснение" },
    "phase.example":        { en: "Example",            ru: "Пример" },
    "phase.apply":          { en: "Question",           ru: "Вопрос" },
    "phase.recall":         { en: "Recall",             ru: "Вспомнить" },
    "next.predict":         { en: "See the explanation", ru: "К объяснению" },
    "next.explain":         { en: "See Example",        ru: "К примеру" },
    "next.example":         { en: "Answer Question",    ru: "К вопросу" },
    "next.default":         { en: "Next",               ru: "Дальше" },

    // Nudges
    "predict.nudge":        { en: "Before you read anything — what's your guess? Being wrong here helps as much as being right, and nothing is scored.",
                              ru: "Прежде чем что-то читать — как думаете? Ошибиться здесь так же полезно, как угадать, и это не оценивается." },
    "recall.nudge":         { en: "No options this time. Write it out from memory — that effort is what makes it stick.",
                              ru: "На этот раз без вариантов. Напишите по памяти — именно это усилие и закрепляет материал." },
    "recall.placeholder":   { en: "In your own words...", ru: "Своими словами…" },
    "recall.reveal":        { en: "Show a model answer", ru: "Показать образец ответа" },
    "recall.model":         { en: "A model answer",      ru: "Образец ответа" },
    "recall.points":        { en: "Did you get these?",  ru: "Всё ли вы назвали?" },
    "recall.empty":         { en: "You didn't write anything — next time try, even badly. Reading a model answer you never attempted is just re-reading, which is one of the weakest things you can do.",
                              ru: "Вы ничего не написали — в следующий раз попробуйте, пусть даже плохо. Читать образец ответа, не попытавшись самому, — это просто перечитывание, один из самых слабых способов учиться." },

    // Buttons
    "btn.checkAnswer":      { en: "Check Answer",       ru: "Проверить ответ" },
    "btn.backToQuestion":   { en: "← Back to the question", ru: "← Назад к вопросу" },
    "btn.backToExample":    { en: "← Back to example",  ru: "← Назад к примеру" },
    "btn.topics":           { en: "← Topics",           ru: "← К темам" },
    "btn.nextChunk":        { en: "Next chunk",         ru: "Следующий блок" },
    "btn.masteryExam":      { en: "Take the Mastery Exam", ru: "Перейти к экзамену" },
    "btn.showAnswer":       { en: "Show Answer",        ru: "Показать ответ" },

    // Flashcard self-assessment
    "conf.difficult":       { en: "I'm struggling",     ru: "Совсем не помню" },
    "conf.still-learning":  { en: "I'm still learning", ru: "Ещё учу" },
    "conf.has-idea":        { en: "I have an idea",     ru: "Примерно помню" },
    "conf.known-best":      { en: "I know this well",   ru: "Знаю уверенно" },

    // Static chrome in index.html, filled in by applyStatic() below
    "btn.backToTopics":     { en: "Back to Topics",     ru: "К списку тем" },
    "btn.backToCourse":     { en: "← Course",           ru: "← К курсу" },

    // ---- Mock exam (library/exam-sim.js) ----
    // {n} / {min} / {pass} / {i} / {of} / {score} are filled by t(key, vars).
    "sim.entry":            { en: "Mock Exam",          ru: "Пробный экзамен" },
    "sim.entrySub":         { en: "{n} questions · {min} min · {pass} to pass",
                              ru: "{n} вопросов · {min} мин · порог {pass}" },
    "sim.best":             { en: "best {score}/{n}",   ru: "лучший {score}/{n}" },
    "sim.title":            { en: "Mock Exam",          ru: "Пробный экзамен" },
    "sim.introTitle":       { en: "Before you start",   ru: "Перед началом" },
    "sim.introBody":        { en: "{n} questions drawn at random from the Ministry's published bank of 40. {min} minutes. You pass on {pass} correct — that is at most {wrong} mistakes.<br><br>You can move back and forth between questions and change answers. The clock does not stop, and it does not stop for the review either: when it runs out the paper is submitted as it stands.",
                              ru: "{n} вопросов, взятых случайно из опубликованного министерством банка в 40. {min} минут. Проходной балл — {pass} правильных, то есть не больше {wrong} ошибок.<br><br>По вопросам можно ходить вперёд и назад и менять ответы. Часы при этом не останавливаются, и на проверку их тоже не останавливают: когда время выйдет, работа уйдёт в том виде, в каком есть." },
    "sim.introNote":        { en: "Nothing here is scored into your progress. It is a rehearsal, and you may sit it as often as you like.",
                              ru: "Ничего из этого не идёт в ваш прогресс. Это репетиция, и проходить её можно сколько угодно раз." },
    "sim.begin":            { en: "Start the exam",     ru: "Начать экзамен" },
    "sim.counter":          { en: "Question {i} of {of}", ru: "Вопрос {i} из {of}" },
    "sim.prev":             { en: "← Previous",         ru: "← Назад" },
    "sim.next":             { en: "Next →",             ru: "Дальше →" },
    "sim.finish":           { en: "Finish",             ru: "Завершить" },
    "sim.unanswered":       { en: "{n} unanswered",     ru: "без ответа: {n}" },
    "sim.confirm":          { en: "Finish now? {n} question(s) still have no answer, and unanswered counts as wrong.",
                              ru: "Завершить сейчас? Без ответа осталось: {n}. Пустой ответ считается ошибкой." },
    "sim.timeUp":           { en: "Time is up — the paper was submitted as it stood.",
                              ru: "Время вышло — работа принята в том виде, в каком была." },
    "sim.passed":           { en: "Passed",             ru: "Сдано" },
    "sim.failed":           { en: "Not passed",         ru: "Не сдано" },
    "sim.result":           { en: "{score} of {of} correct — you needed {pass}.",
                              ru: "{score} из {of} правильных — требовалось {pass}." },
    "sim.timeSpent":        { en: "Time taken: {t}",    ru: "Затрачено времени: {t}" },
    "sim.reviewTitle":      { en: "What you got wrong", ru: "Что вы ответили неверно" },
    "sim.allCorrect":       { en: "Every answer correct. Nothing to review.",
                              ru: "Все ответы верны. Разбирать нечего." },
    "sim.yourAnswer":       { en: "Your answer",        ru: "Ваш ответ" },
    "sim.noAnswer":         { en: "left blank",         ru: "без ответа" },
    "sim.correctAnswer":    { en: "Correct answer",     ru: "Правильный ответ" },
    "sim.again":            { en: "Sit it again",       ru: "Пройти ещё раз" },
    "sim.leave":            { en: "Back to the course", ru: "Вернуться к курсу" },
    "sim.abandon":          { en: "Leave the exam? The attempt will not be saved.",
                              ru: "Выйти с экзамена? Попытка не сохранится." },

    // The language control itself
    "lang.label":           { en: "Language",           ru: "Язык" },
    "lang.note":            { en: "Switching reloads the app. Progress is saved.",
                              ru: "Переключение перезагрузит приложение. Прогресс сохранится." }
  };

  // Missing key returns the key itself rather than "" — a visible
  // `btn.whatever` on screen is a bug report; a blank button is a
  // mystery. Same reasoning as registry.js shouting about id collisions.
  // `vars` fills {name} placeholders. Kept this dumb on purpose: no
  // pluralisation engine, because Russian needs three forms and English
  // two, and every string that would have needed it was rewritten to
  // dodge the problem ("без ответа: 3" rather than "3 вопроса").
  // An unknown placeholder is left standing rather than blanked — same
  // reasoning as a missing key returning the key.
  function t(key, vars) {
    const s = STRINGS[key];
    if (!s) { console.warn(`[I18N] no string for "${key}"`); return key; }
    const out = s[lang] || s[FALLBACK] || key;
    if (!vars) return out;
    return out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  }

  // Real lang attribute, not decoration: it drives hyphenation, the
  // right quotation marks, spellcheck in the recall textarea, and what
  // a screen reader's voice sounds like reading a Russian paragraph.
  document.documentElement.lang = lang;

  // Buttons that live in index.html rather than in a render function
  // (the back buttons on the lesson, exam and flashcard screens) carry
  // data-i18n="key" and are filled in here. They are above the script
  // band in the document, so they are already parsed by the time this
  // runs — no DOMContentLoaded needed, and the label never flashes in
  // the wrong language.
  function applyStatic(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
  }
  applyStatic();

  return {
    langs: () => LANGS.slice(),
    lang: () => lang,
    set, resolve, t, applyStatic,
    // Exposed for the toggle's own label, which must name the language
    // you'd be switching TO, in that language — "Русский", not "Russian".
    nativeName: l => ({ en: "English", ru: "Русский" })[l] || l
  };
})();
