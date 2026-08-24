// ================================================
// Knell — KERNEL / language
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
  // Keeps the old brand in the key on purpose. Renaming a storage key
  // does not move the data, it orphans it — everyone would silently
  // lose their language choice on the next load. Same reason db.js is
  // still on "unit6-dojo-db". The name in a key is an address, not a
  // label.
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

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  // The first-run gate's own commit. NOT set() — set() bails out when
  // the pick matches the language already active, which is the right
  // thing for the Settings toggle and exactly wrong here: a Russian
  // browser detects "ru", the person presses Русский, set() returns
  // false, nothing is written and the gate never closes. A locked door
  // with the key inside.
  //
  // So this always records the choice, and only reloads when the choice
  // actually differs from what is running. Recording it is the whole
  // point: `detect()` guesses from navigator.language but stores
  // nothing, so without this write the gate would reappear every visit.
  function choose(next) {
    if (!LANGS.includes(next)) return false;
    try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
    if (next === lang) { hideGate(); return true; }
    location.reload();
    return true;
  }

  function hideGate() {
    const gate = document.getElementById("lang-gate");
    if (gate) gate.style.display = "none";
  }

  // Shown only when nothing was ever chosen on this device. A guessed
  // language is not a choice, which is why detect()'s navigator fallback
  // does not count as one.
  function openGateIfUnset() {
    if (stored()) return;
    const gate = document.getElementById("lang-gate");
    if (!gate) return;
    gate.style.display = "flex";
    gate.querySelectorAll(".lang-gate-btn").forEach(btn => {
      btn.addEventListener("click", () => choose(btn.dataset.lang));
    });
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

    // ---- Static chrome: landing, first run, lobby, screen titles ----
    // Pass one of the interface translation. These are the screens seen
    // every session; the Shop catalogue, Garden and Stats text are still
    // English and are the next pass.
    "ui.landing.sub":       { en: "A study system that keeps what you learn from fading — chunk by chunk, day by day.",
                              ru: "Система занятий, которая не даёт выученному выветриться — по кусочку, изо дня в день." },
    "ui.landing.feat1":     { en: "Any course, one chunk at a time", ru: "Любой курс, по одному блоку за раз" },
    "ui.landing.feat2":     { en: "Spaced review that adapts to you", ru: "Повторение с интервалами, подстроенное под вас" },
    "ui.landing.feat3":     { en: "A garden that wilts when you stop", ru: "Сад, который вянет, когда вы бросаете" },
    "ui.landing.begin":     { en: "Begin Training",     ru: "Начать" },
    "ui.landing.hint":      { en: "No account needed — progress saves automatically, on this device",
                              ru: "Аккаунт не нужен — прогресс сохраняется сам, на этом устройстве" },

    "ui.profile.welcome":   { en: "Welcome to",         ru: "Добро пожаловать в" },
    "ui.profile.desc":      { en: "Enter your name to create a profile. Your progress and stats will be saved locally.",
                              ru: "Введите имя, чтобы создать профиль. Прогресс и статистика сохранятся на этом устройстве." },
    "ui.profile.name":      { en: "Your name...",       ru: "Ваше имя…" },
    "ui.profile.start":     { en: "Start Learning",     ru: "Начать учиться" },

    "ui.warn.title":        { en: "Administrative Notice", ru: "Административное уведомление" },
    "ui.warn.desc":         { en: "You have received a warning from a moderator.",
                              ru: "Вы получили предупреждение от модератора." },
    "ui.warn.ack":          { en: "I understand",       ru: "Понятно" },

    "ui.stats.title":       { en: "Your Profile",       ru: "Ваш профиль" },
    "ui.stats.export":      { en: "Export Data",        ru: "Выгрузить данные" },
    "ui.stats.import":      { en: "Import Data",        ru: "Загрузить данные" },
    "ui.pd.profile":        { en: "Profile",            ru: "Профиль" },
    "ui.pd.avatar":         { en: "Avatar",             ru: "Аватар" },
    "ui.pd.newProfile":     { en: "New Profile",        ru: "Новый профиль" },
    "ui.pd.stats":          { en: "View Statistics",    ru: "Статистика" },
    "ui.pd.admin":          { en: "Admin & Logs",       ru: "Админка и логи" },

    // Lobby tiles
    "ui.tile.library":      { en: "Library",            ru: "Библиотека" },
    "ui.tile.librarySub":   { en: "Choose a course and start training", ru: "Выберите курс и начните" },
    "ui.tile.resume":       { en: "Continue where you left off", ru: "Продолжить с того же места" },
    "ui.tile.garden":       { en: "Garden",             ru: "Сад" },
    "ui.tile.career":       { en: "Career",             ru: "Карьера" },
    "ui.tile.careerSub":    { en: "Rank, rewards and the ladder", ru: "Ранг, награды и лестница" },
    "ui.tile.flashcards":   { en: "Flashcards",         ru: "Карточки" },
    "ui.tile.forum":        { en: "Forum",              ru: "Форум" },
    "ui.tile.custom":       { en: "Custom",             ru: "Кастом" },
    "ui.tile.customSub":    { en: "Everything you've unlocked, ready to equip",
                              ru: "Всё открытое, готовое к использованию" },
    "ui.tile.settings":     { en: "Settings",           ru: "Настройки" },
    "ui.tile.settingsSub":  { en: "Colour theme and data", ru: "Оформление и данные" },
    "ui.lobby.welcomeBack": { en: "Welcome back.",      ru: "С возвращением." },

    // Screen titles and their back buttons
    "ui.back.lobby":        { en: "← Lobby",            ru: "← В лобби" },
    "ui.back.courses":      { en: "← Courses",          ru: "← К курсам" },
    "ui.back.unit":         { en: "← Unit",             ru: "← К блоку" },
    "ui.screen.garden":     { en: "Your Garden",        ru: "Ваш сад" },
    "ui.screen.settings":   { en: "Settings",           ru: "Настройки" },
    "ui.screen.career":     { en: "Career",             ru: "Карьера" },
    "ui.screen.forum":      { en: "The Forum",          ru: "Форум" },
    "ui.screen.library":    { en: "Library",            ru: "Библиотека" },
    "ui.screen.unit":       { en: "Choose a Unit",      ru: "Выберите блок" },
    "ui.screen.deck":       { en: "Custom Deck",        ru: "Своя колода" },
    "ui.btn.tokenShop":     { en: "Shop",               ru: "Магазин" },

    // Lobby tile subtitles. Computed by their own branch (lobby.js must
    // not know what a plant or a rank is), so the branch does the lookup
    // and the plural-dodging phrasing lives here.
    "ui.sum.gardenEmpty":  { en: "Nothing planted yet — finish a topic to grow something",
                              ru: "Пока ничего не посажено — пройдите тему, и что-нибудь взойдёт" },
    "ui.sum.planted":      { en: "{n} of {of} planted", ru: "посажено: {n} из {of}" },
    "ui.sum.needWater":    { en: "{n} need watering",   ru: "требуют полива: {n}" },
    "ui.sum.toClaim":      { en: "${n} to claim",      ru: "к получению: ${n}" },
    "ui.sum.rankToGo":     { en: "{cur} · {n} XP to {next}", ru: "{cur} · до «{next}» ещё {n} XP" },
    "ui.sum.rankTop":      { en: "{cur} · top of the ladder", ru: "{cur} · вершина лестницы" },
    "ui.sum.buyToUnlock":  { en: "Buy a course to unlock", ru: "Купите курс, чтобы открыть" },
    "ui.sum.reviewed":     { en: "{n} chunks reviewed so far — build a deck",
                              ru: "повторено блоков: {n} — соберите колоду" },
    "ui.sum.flashIdle":    { en: "Pick any chunks, drill your weak spots",
                              ru: "Выберите блоки и прогоняйте слабые места" },
    "ui.sum.forum":        { en: "{n} reputation · opens with accounts",
                              ru: "репутация: {n} · откроется с аккаунтами" },
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
    "sim.abandon":          { en: "Leave? Tap again",   ru: "Выйти? Нажмите ещё раз" },
    "sim.finishAnyway":     { en: "{n} blank — finish?", ru: "без ответа: {n} — завершить?" },

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
  // data-i18n sets textContent, so it must go on an element that owns
  // NOTHING but that text. Several places in index.html therefore got a
  // wrapper <span> rather than the attribute on the parent: the Import
  // Data label holds a hidden <input>, and the Avatar row holds the
  // wallet note — textContent on either would delete the child.
  //
  // data-i18n-placeholder is separate because an <input>'s visible text
  // is an attribute, not a child node.
  function applyStatic(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });
  }
  applyStatic();

  // After applyStatic so the rest of the chrome is already in the
  // detected language behind the overlay — if someone dismisses by
  // choosing what was guessed, there is no flash of the wrong labels.
  openGateIfUnset();

  return {
    langs: () => LANGS.slice(),
    lang: () => lang,
    set, resolve, t, applyStatic, choose,
    // Exposed for the toggle's own label, which must name the language
    // you'd be switching TO, in that language — "Русский", not "Russian".
    nativeName: l => ({ en: "English", ru: "Русский" })[l] || l
  };
})();
