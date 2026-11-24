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
// costs little here (static files; progress is in the DB) and it
// makes it impossible to hold a
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
  const LANGS = ["en", "ru", "he"];
  // Languages written right to left. The page takes dir="rtl" from this
  // (below, next to lang); code that places things by hand asks isRtl().
  const RTL = ["he"];
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
    // "iw" is Hebrew's old code, and some browsers still report it.
    let nav = (navigator.language || "").slice(0, 2).toLowerCase();
    if (nav === "iw") nav = "he";
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
    if (next === lang) { markLangs(); return true; }
    location.reload();
    return true;
  }

  // ---- The language buttons on the start screen ----
  // Until 2026-11-24 a first visit opened a modal asking for a language
  // («this is unattractive»). Now the start screen carries three small
  // buttons, each naming its language in that language, the one in use
  // lit. Nothing is asked: the first visit opens in the browser's
  // language (detect()), and a tap switches. The buttons' own words never
  // go through t(): a picker written in a language you may not read is a
  // locked door with the key inside.
  const NAMES = { en: "English", ru: "Русский", he: "עברית" };
  function markLangs() {
    document.querySelectorAll(".landing-lang").forEach(btn =>
      btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang)));
  }
  function mountLangs() {
    const host = document.getElementById("landing-langs");
    if (!host || host.childElementCount) return;
    LANGS.forEach(l => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "landing-lang";
      btn.dataset.lang = l;
      btn.lang = l;
      if (RTL.includes(l)) btn.dir = "rtl";
      btn.textContent = NAMES[l];
      btn.addEventListener("click", () => choose(l));
      host.appendChild(btn);
    });
    markLangs();
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
    "phase.predict":        { en: "Predict",            ru: "Прогноз", he: "ניבוי" },
    "phase.explain":        { en: "Explanation",        ru: "Объяснение", he: "הסבר" },
    "phase.example":        { en: "Example",            ru: "Пример", he: "דוגמה" },
    "phase.apply":          { en: "Question",           ru: "Вопрос", he: "שאלה" },
    "phase.recall":         { en: "Recall",             ru: "Вспомнить", he: "היזכרות" },
    "next.predict":         { en: "See the explanation", ru: "К объяснению", he: "להסבר" },
    "next.explain":         { en: "See Example",        ru: "К примеру", he: "לדוגמה" },
    "next.example":         { en: "Answer Question",    ru: "К вопросу", he: "לשאלה" },
    "next.default":         { en: "Next",               ru: "Дальше", he: "הבא" },

    // Nudges
    "predict.nudge":        { en: "Before you read anything — what's your guess? Being wrong here helps as much as being right, and nothing is scored.",
                              ru: "Прежде чем что-то читать — как думаете? Ошибиться здесь так же полезно, как угадать, и это не оценивается.", he: "לפני שקוראים משהו — מה הניחוש שלכם? טעות כאן מועילה בדיוק כמו תשובה נכונה, ושום דבר לא נכנס לציון." },
    "recall.nudge":         { en: "No options this time. Write it out from memory — that effort is what makes it stick.",
                              ru: "На этот раз без вариантов. Напишите по памяти — именно это усилие и закрепляет материал.", he: "הפעם בלי אפשרויות. כתבו מהזיכרון — המאמץ הזה הוא מה שגורם לחומר להיקלט." },
    "recall.placeholder":   { en: "In your own words...", ru: "Своими словами…", he: "במילים שלכם..." },
    "recall.reveal":        { en: "Show a model answer", ru: "Показать образец ответа", he: "להציג תשובה לדוגמה" },
    "recall.model":         { en: "A model answer",      ru: "Образец ответа", he: "תשובה לדוגמה" },
    "recall.points":        { en: "Did you get these?",  ru: "Всё ли вы назвали?", he: "הזכרתם את כל אלה?" },
    "recall.empty":         { en: "You didn't write anything — next time try, even badly. Reading a model answer you never attempted is just re-reading, which is one of the weakest things you can do.",
                              ru: "Вы ничего не написали — в следующий раз попробуйте, пусть даже плохо. Читать образец ответа, не попытавшись самому, — это просто перечитывание, один из самых слабых способов учиться.", he: "לא כתבתם כלום — בפעם הבאה נסו, גם אם לא טוב. לקרוא תשובה לדוגמה בלי לנסות קודם זו פשוט קריאה חוזרת, וזה אחד הדברים החלשים ביותר שאפשר לעשות." },

    // Buttons
    "btn.checkAnswer":      { en: "Check Answer",       ru: "Проверить ответ", he: "בדיקת תשובה" },
    "btn.backToQuestion":   { en: "← Back to the question", ru: "← Назад к вопросу", he: "→ חזרה לשאלה" },
    "btn.backToExample":    { en: "← Back to example",  ru: "← Назад к примеру", he: "→ חזרה לדוגמה" },
    "btn.topics":           { en: "← Topics",           ru: "← К темам", he: "→ לנושאים" },
    "btn.nextChunk":        { en: "Next chunk",         ru: "Следующий блок", he: "לחלק הבא" },
    "btn.masteryExam":      { en: "Take the Mastery Exam", ru: "Перейти к экзамену", he: "למבחן השליטה" },
    "btn.continue":         { en: "Continue",           ru: "Далее", he: "המשך" },
    "btn.showAnswer":       { en: "Show Answer",        ru: "Показать ответ", he: "הצגת התשובה" },

    // Flashcard self-assessment
    "conf.difficult":       { en: "I'm struggling",     ru: "Совсем не помню", he: "קשה לי עם זה" },
    "conf.still-learning":  { en: "I'm still learning", ru: "Ещё учу", he: "עוד בתהליך" },
    "conf.has-idea":        { en: "I have an idea",     ru: "Примерно помню", he: "יש לי מושג" },
    "conf.known-best":      { en: "I know this well",   ru: "Знаю уверенно", he: "זה ברור לי" },

    // Static chrome in index.html, filled in by applyStatic() below
    "btn.backToTopics":     { en: "Back to Topics",     ru: "К списку тем", he: "חזרה לנושאים" },
    "btn.backToCourse":     { en: "← Course",           ru: "← К курсу", he: "→ לקורס" },

    // ---- Static chrome: landing, first run, lobby, screen titles ----
    // Pass one of the interface translation. These are the screens seen
    // every session; the Shop catalogue, Garden and Stats text are still
    // English and are the next pass.
    "ui.landing.sub":       { en: "A study system that keeps what you learn from fading — chunk by chunk, day by day.",
                              ru: "Система занятий, которая не даёт выученному выветриться — по кусочку, изо дня в день.", he: "מערכת לימוד ששומרת שמה שלמדתם לא יתפוגג — חלק אחר חלק, יום אחר יום." },
    // ui.landing.feat1-3 are defined ONCE, further down. They used to be
    // here as well, and in an object literal the later key wins, so these
    // copies were dead text that looked editable.
    "ui.landing.begin":     { en: "Begin Training",     ru: "Начать", he: "להתחיל" },
    // Shown instead of ui.landing.hint while sign-in is switched off
    // (Dojo.OPEN_ACCESS, core/core.js) — see boot.js. The account line
    // below promises sync to any device, which is false in that mode.
    "ui.landing.demo":      { en: "Demo · no account · everything unlocked · progress stays in this browser",
                              ru: "Демо · без аккаунта · открыто всё · прогресс хранится в этом браузере", he: "דמו · בלי חשבון · הכול פתוח · ההתקדמות נשמרת בדפדפן הזה" },
    // Was "No account needed — progress saves automatically, on this
    // device". That stopped being true when the sign-in gate shipped,
    // and it was the first thing a new visitor read. It then said an
    // account was required and bought progress on every device. Since the
    // server was switched off (2026) it says that, and points to the demo.
    "ui.landing.hint":      { en: "Accounts are closed: the server was switched off in 2026. The demo opens without one: isk1zz.github.io/knell_demo",
                              ru: "Аккаунты закрыты: сервер выключен в 2026 году. Демо открывается без аккаунта: isk1zz.github.io/knell_demo", he: "החשבונות סגורים: השרת כובה ב־2026. הדמו נפתח בלי חשבון: isk1zz.github.io/knell_demo" },

    "ui.profile.welcome":   { en: "Welcome to",         ru: "Добро пожаловать в", he: "ברוכים הבאים אל" },
    "ui.profile.desc":      { en: "Enter your name to create a profile. Your progress and stats will be saved locally.",
                              ru: "Введите имя, чтобы создать профиль. Прогресс и статистика сохранятся на этом устройстве.", he: "הזינו שם כדי ליצור פרופיל. ההתקדמות והסטטיסטיקה יישמרו במכשיר הזה." },
    "ui.profile.name":      { en: "Your name...",       ru: "Ваше имя…", he: "השם שלכם..." },
    "ui.profile.start":     { en: "Start Learning",     ru: "Начать учиться", he: "להתחיל ללמוד" },

    // ---- Accounts (core/auth.js) ----
    "auth.welcome":         { en: "Welcome to",          ru: "Добро пожаловать в", he: "ברוכים הבאים אל" },
    "auth.tabSignIn":       { en: "Sign in",             ru: "Вход", he: "כניסה" },
    "auth.tabSignUp":       { en: "Create account",      ru: "Регистрация", he: "יצירת חשבון" },
    "auth.email":           { en: "Email",               ru: "Эл. почта", he: "אימייל" },
    "auth.emailOrNick":     { en: "Email or nickname",   ru: "Почта или никнейм", he: "אימייל או כינוי" },
    "auth.nicknameTaken":   { en: "That nickname is taken — pick another.",
                              ru: "Этот никнейм занят — выберите другой.", he: "הכינוי הזה תפוס — בחרו אחר." },
    "auth.nicknameNote":    { en: "You'll be able to sign in with this instead of your email.",
                              ru: "По нему тоже можно будет входить, вместо почты.", he: "אפשר יהיה להיכנס גם איתו, במקום האימייל." },
    "auth.password":        { en: "Password",            ru: "Пароль", he: "סיסמה" },
    "auth.nickname":        { en: "Nickname",            ru: "Никнейм", he: "כינוי" },
    "auth.country":         { en: "Country — optional",  ru: "Страна — необязательно", he: "מדינה — לא חובה" },
    "auth.countryNote":     { en: "Some courses are written for one country's rules. Telling us yours surfaces the right ones — you can skip this.",
                              ru: "Некоторые курсы написаны под правила конкретной страны. Указав свою, вы увидите подходящие — можно пропустить.", he: "חלק מהקורסים נכתבו לפי הכללים של מדינה מסוימת. אם תציינו את שלכם, יוצגו הקורסים המתאימים — אפשר לדלג." },
    "auth.signInBtn":       { en: "Sign in",             ru: "Войти", he: "כניסה" },
    "auth.signUpBtn":       { en: "Create account",      ru: "Создать аккаунт", he: "יצירת חשבון" },
    "auth.working":         { en: "Working…",            ru: "Секунду…", he: "רגע..." },
    "auth.needEmailPass":   { en: "Email and password are both required.",
                              ru: "Нужны и почта, и пароль.", he: "צריך גם אימייל וגם סיסמה." },
    "auth.needNickname":    { en: "Pick a nickname — it's the name you'll study under.",
                              ru: "Выберите никнейм — под этим именем вы будете учиться.", he: "בחרו כינוי — זה השם שתחתיו תלמדו." },
    "auth.shortPassword":   { en: "Password needs at least 6 characters.",
                              ru: "Пароль — минимум 6 символов.", he: "הסיסמה צריכה להיות באורך 6 תווים לפחות." },
    "auth.checkInboxTitle": { en: "Confirm your email",  ru: "Подтвердите почту", he: "אשרו את האימייל" },
    "auth.checkInboxBody":  { en: "We sent a confirmation link to <strong>{email}</strong>. Open it, then come back and sign in.",
                              ru: "Мы отправили ссылку для подтверждения на <strong>{email}</strong>. Откройте её, затем вернитесь и войдите.", he: "שלחנו קישור אישור אל <strong>{email}</strong>. פתחו אותו, ואז חזרו לכאן והיכנסו." },
    "auth.backToSignIn":    { en: "Back to sign in",     ru: "Вернуться ко входу", he: "חזרה לכניסה" },
    "auth.badLogin":        { en: "That email and password don't match an account.",
                              ru: "Такая пара почта/пароль не подходит.", he: "האימייל והסיסמה האלה לא תואמים לאף חשבון." },
    "auth.notConfirmed":    { en: "This account isn't confirmed yet — check your inbox for the link.",
                              ru: "Аккаунт ещё не подтверждён — проверьте почту.", he: "החשבון עדיין לא אושר — בדקו את תיבת הדואר." },
    "auth.emailTaken":      { en: "There's already an account on that email. Try signing in.",
                              ru: "На эту почту аккаунт уже есть. Попробуйте войти.", he: "כבר קיים חשבון עם האימייל הזה. נסו להיכנס." },
    "auth.offline":         { en: "No connection. Check your internet and try again.",
                              ru: "Нет соединения. Проверьте интернет и попробуйте снова.", he: "אין חיבור. בדקו את האינטרנט ונסו שוב." },
    "auth.rateLimited":     { en: "Too many attempts just now. Wait a minute and try again.",
                              ru: "Слишком много попыток. Подождите минуту.", he: "יותר מדי ניסיונות ברגע זה. חכו דקה ונסו שוב." },
    "auth.signedInAs":      { en: "Signed in as",        ru: "Вы вошли как", he: "מחוברים בתור" },
    "auth.signOut":         { en: "Sign out",            ru: "Выйти", he: "התנתקות" },
    // Lobby clickability hint — index.html #lobby-hint, core/lobby.js.
    // True as written: the circles are the navigation, and the moon or
    // sun, clouds and birds react to a tap (shop/decor.js). "Some of it"
    // because the stars do not.
    "lobby.hint":           { en: "Circles take you somewhere. Poke the sky: some of it answers.",
                              ru: "Круги — это переходы. Потыкайте в небо — кое-что ответит.", he: "העיגולים מובילים למקומות. געו בשמיים: משהו שם עונה." },
    // Course scene — library/library.js renderCourseScene, scenes/scene.js.
    "scene.hint":           { en: "Pick a chapter: your runner goes there and opens it.",
                              ru: "Выберите главу — человечек добежит туда и откроет её.", he: "בחרו פרק: הדמות רצה אליו ופותחת אותו." },
    "scene.landingCaption": { en: "Every topic you pass is a plant, and it grows while you keep remembering it. Tap one.",
                              ru: "Каждая сданная тема — растение, и оно растёт, пока вы её помните. Нажмите на любое.", he: "כל נושא שעברתם הוא צמח, והוא גדל כל עוד אתם זוכרים אותו. געו באחד." },
    // Sign-in switched off — Dojo.OPEN_ACCESS in core/core.js.
    "auth.offTitle":        { en: "Sign-in is switched off",  ru: "Вход отключён", he: "הכניסה כבויה" },
    "auth.offBody":         { en: "Accounts are turned off for now. Everyone uses one open profile with everything unlocked, and your progress is saved on this device.",
                              ru: "Аккаунты сейчас выключены. Все пользуются одним открытым профилем, где открыто всё, а прогресс сохраняется на этом устройстве.", he: "החשבונות כבויים כרגע. כולם משתמשים בפרופיל פתוח אחד שבו הכול פתוח, וההתקדמות נשמרת במכשיר הזה." },
    "auth.offOk":           { en: "Got it",                   ru: "Понятно", he: "הבנתי" },
    "auth.offButton":       { en: "Sign in — switched off",   ru: "Вход — отключён", he: "כניסה — כבויה" },
    "auth.openAccount":     { en: "Open access · everything unlocked", ru: "Открытый доступ · всё открыто", he: "גישה פתוחה · הכול פתוח" },
    "auth.offlineNote":     { en: "Offline — your progress is saved on this device and will sync when you're back.",
                              ru: "Оффлайн — прогресс сохраняется на устройстве и синхронизируется позже.", he: "אין חיבור — ההתקדמות נשמרת במכשיר הזה ותסונכרן כשהחיבור יחזור." },

    // ---- Legal (settings/settings.js) ----
    // These are the app's actual privacy and terms text, in both
    // languages. They were previously untranslated English inline in
    // settings.js AND factually wrong — they described a local-only app
    // with no account and no server, which stopped being true when
    // accounts shipped. Legally meaningful text should not be the one
    // place the app skips translation.
    "legal.privacyIntro":   { en: "Knell stores two copies of your data: one in this browser, and one in your account.",
                              ru: "Knell хранит две копии ваших данных: одну в этом браузере, другую в вашем аккаунте.", he: "Knell שומר שני עותקים של הנתונים שלכם: אחד בדפדפן הזה, ואחד בחשבון שלכם." },
    "legal.privacyLocal":   { en: "<strong>On this device.</strong> Your profile, progress, review schedule, statistics and settings are kept in this browser's local storage. That is what lets you keep studying if the connection drops, on a device you have already signed in on.",
                              ru: "<strong>На этом устройстве.</strong> Профиль, прогресс, расписание повторений, статистика и настройки хранятся в локальном хранилище браузера. Благодаря этому можно продолжать учиться, если пропала связь, — на устройстве, где вы уже входили.", he: "<strong>במכשיר הזה.</strong> הפרופיל, ההתקדמות, לוח החזרות, הסטטיסטיקה וההגדרות נשמרים באחסון המקומי של הדפדפן. בזכות זה אפשר להמשיך ללמוד אם החיבור נופל, במכשיר שכבר נכנסתם בו." },
    "legal.privacyCloud":   { en: "<strong>In your account.</strong> To sign in and keep progress across devices, we store your email, your nickname, your country if you gave one, and the same study data listed above. It is held by Supabase on servers in the EU (Ireland). Your password is never stored by us — it is hashed by the authentication provider, and this app never sees it after you type it.",
                              ru: "<strong>В вашем аккаунте.</strong> Чтобы вы могли входить и сохранять прогресс на разных устройствах, мы храним вашу почту, никнейм, страну (если вы её указали) и те же учебные данные, что перечислены выше. Всё это находится в Supabase на серверах в ЕС (Ирландия). Пароль мы не храним: его хеширует провайдер аутентификации, и приложение не видит его после ввода.", he: "<strong>בחשבון שלכם.</strong> כדי שתוכלו להיכנס ולשמור על ההתקדמות בין מכשירים, אנחנו שומרים את האימייל, הכינוי, המדינה (אם ציינתם) ואת אותם נתוני לימוד שפורטו למעלה. הם מאוחסנים אצל Supabase, בשרתים באיחוד האירופי (אירלנד). את הסיסמה אנחנו לא שומרים לעולם — ספק האימות שומר רק גיבוב שלה, והאפליקציה לא רואה אותה אחרי שהקלדתם." },
    "legal.privacyForum":   { en: "<strong>What other people can see.</strong> If you post on the Forum, that post and its replies are visible to everyone signed in, together with your nickname, avatar and any badges you pinned. Nothing else about you is shown to them — not your email, not your country, not your progress or settings. Reputation you give is recorded, so an author can see their own total, but who gave it is not displayed.",
                              ru: "<strong>Что видят другие.</strong> Если вы пишете на форуме, запись и ответы к ней видны всем вошедшим — вместе с ником, аватаром и закреплёнными значками. Больше о вас им не показывают ничего: ни почту, ни страну, ни прогресс, ни настройки. Отданное признание записывается, поэтому автор видит свой итог, но кто именно дал — не отображается.", he: "<strong>מה אחרים יכולים לראות.</strong> אם תפרסמו בפורום, הפוסט והתגובות אליו גלויים לכל המחוברים, יחד עם הכינוי, האווטאר והתגים שהצמדתם. שום דבר אחר עליכם לא מוצג להם — לא האימייל, לא המדינה, לא ההתקדמות ולא ההגדרות. מוניטין שאתם נותנים נרשם, כך שכותב רואה את הסכום שלו, אבל לא מוצג מי נתן." },
    "legal.privacyNoTrack": { en: "There is no analytics, no telemetry, no advertising and no third-party tracking of any kind. Nothing about you is sold or handed to anyone else, and apart from what you deliberately post on the Forum, your data is used only to show it back to you.",
                              ru: "Нет аналитики, телеметрии, рекламы и никакого стороннего отслеживания. Ничего о вас не продаётся и не передаётся третьим лицам, и кроме того, что вы сами публикуете на форуме, ваши данные используются только чтобы показать их вам.", he: "אין אנליטיקה, אין טלמטריה, אין פרסומות ואין מעקב של צד שלישי מכל סוג. שום דבר עליכם לא נמכר ולא נמסר לאחרים, ומלבד מה שאתם מפרסמים בכוונה בפורום, הנתונים שלכם משמשים רק כדי להציג אותם לכם." },
    "legal.privacyRights":  { en: "<strong>Your rights.</strong> Export Data writes a file you control, at any time — that covers the right to a copy of your data. Delete Account erases your account and everything in it from the server permanently, and it cannot be undone.",
                              ru: "<strong>Ваши права.</strong> «Экспорт данных» в любой момент создаёт файл, который принадлежит вам, — это право на копию ваших данных. «Удалить аккаунт» безвозвратно стирает аккаунт и всё его содержимое с сервера.", he: "<strong>הזכויות שלכם.</strong> ייצוא נתונים כותב קובץ שנמצא בשליטתכם, בכל רגע — זו הזכות לקבל עותק של הנתונים. מחיקת חשבון מוחקת לצמיתות מהשרת את החשבון ואת כל מה שבו, ואי אפשר לבטל אותה." },

    "legal.termsAsIs":      { en: "Knell is provided as-is, with no warranty. It is a study aid, not accredited instruction, and passing a mastery exam here is not a qualification. Course material is written to be accurate and carries its sources so you can check it, but mistakes are possible — don't rely on it as your only source for anything that matters.",
                              ru: "Knell предоставляется «как есть», без гарантий. Это учебный инструмент, а не аккредитованное обучение: сданный здесь экзамен не является квалификацией. Материалы пишутся с опорой на источники, которые указаны, чтобы их можно было проверить, но ошибки возможны — не полагайтесь на них как на единственный источник в важных вопросах.", he: "Knell מסופק כמות שהוא, ללא אחריות. זה כלי עזר ללימוד, לא הוראה מוסמכת, ומעבר מבחן שליטה כאן אינו הסמכה. חומרי הקורסים נכתבים בקפידה ומציינים את המקורות שלהם כדי שתוכלו לבדוק, אבל טעויות אפשריות — אל תסתמכו עליהם כמקור יחיד לשום דבר חשוב." },
    "legal.termsContent":   { en: "The course content is not yours to redistribute or resell. Your own exported data is entirely yours.",
                              ru: "Содержимое курсов нельзя распространять или перепродавать. Ваши собственные экспортированные данные полностью ваши.", he: "תוכן הקורסים אינו שלכם להפצה או למכירה חוזרת. הנתונים שייצאתם בעצמכם שלכם לגמרי." },
    "legal.termsCurrency":  { en: "<strong>Tokens have no cash value.</strong> They are a licence to open course content, not money. They cannot be exchanged for currency, transferred to another person, or refunded once spent, and no in-app balance of any kind can be cashed out.",
                              ru: "<strong>Токены не имеют денежной ценности.</strong> Это право открыть материалы курса, а не деньги. Их нельзя обменять на валюту, передать другому человеку или вернуть после траты; никакой внутренний баланс нельзя вывести.", he: "<strong>לאסימונים אין ערך כספי.</strong> הם רישיון לפתוח תוכן קורסים, לא כסף. אי אפשר להמיר אותם למטבע, להעביר אותם לאדם אחר או לקבל עליהם החזר אחרי שנוצלו, ואי אפשר לפדות שום יתרה פנימית מכל סוג." },
    "legal.termsAccount":   { en: "You are responsible for keeping your password to yourself. Tell us if you think someone else has it.",
                              ru: "Вы отвечаете за сохранность своего пароля. Сообщите нам, если считаете, что он попал к кому-то ещё.", he: "האחריות לשמור את הסיסמה לעצמכם היא שלכם. ספרו לנו אם אתם חושבים שמישהו אחר יודע אותה." },

    // ---- Account deletion ----
    "del.title":            { en: "Delete account",      ru: "Удалить аккаунт", he: "מחיקת חשבון" },
    "del.note":             { en: "Permanently erases your account and all its data from the server. This cannot be undone.",
                              ru: "Безвозвратно удаляет аккаунт и все его данные с сервера. Отменить это нельзя.", he: "מוחק לצמיתות את החשבון ואת כל הנתונים שלו מהשרת. אי אפשר לבטל את זה." },
    "del.button":           { en: "Delete my account",   ru: "Удалить мой аккаунт", he: "למחוק את החשבון שלי" },
    "del.confirmTitle":     { en: "Delete your account?", ru: "Удалить аккаунт?", he: "למחוק את החשבון?" },
    "del.confirmBody":      { en: "This erases your account, your progress, your review schedule and anything you've unlocked — from the server and from this device. It cannot be undone and there is no backup on our side.",
                              ru: "Будут стёрты аккаунт, прогресс, расписание повторений и всё открытое — и с сервера, и с этого устройства. Отменить нельзя, резервной копии у нас нет.", he: "זה מוחק את החשבון, את ההתקדמות, את לוח החזרות וכל מה שפתחתם — מהשרת ומהמכשיר הזה. אי אפשר לבטל, ואין אצלנו גיבוי." },
    "del.exportFirst":      { en: "Export my data first",  ru: "Сначала экспортировать данные", he: "קודם לייצא את הנתונים שלי" },
    "del.typeToConfirm":    { en: "Type DELETE to confirm", ru: "Введите DELETE для подтверждения", he: "הקלידו DELETE לאישור" },
    "del.cancel":           { en: "Cancel",              ru: "Отмена", he: "ביטול" },
    "del.working":          { en: "Deleting…",           ru: "Удаляем…", he: "מוחקים..." },
    "del.failed":           { en: "Could not delete the account. You may be offline — try again when you have a connection.",
                              ru: "Не удалось удалить аккаунт. Возможно, вы офлайн — попробуйте при подключении.", he: "לא הצלחנו למחוק את החשבון. ייתכן שאין חיבור — נסו שוב כשיהיה." },
    "del.notSignedIn":      { en: "You're not signed in on this device, so there's no account here to delete.",
                              ru: "На этом устройстве вы не вошли в аккаунт — удалять нечего.", he: "לא נכנסתם לחשבון במכשיר הזה, אז אין כאן חשבון למחוק." },

    "shop.buyFailed":       { en: "Purchase failed — check your connection",
                              ru: "Покупка не прошла — проверьте соединение", he: "הרכישה נכשלה — בדקו את החיבור" },

    // ---- First-run appearance (core/onboard.js) ----
    // The "why" lines are one sentence each on purpose. This is three
    // decisions before someone has studied anything, so each step gets
    // exactly enough to make the choice meaningful and not a word more.
    "onb.stepTheme":        { en: "Pick a colour",      ru: "Выберите цвет", he: "בחרו צבע" },
    "onb.whyTheme":         { en: "The whole app changes as you flick through — take the one you'd want to look at daily.",
                              ru: "Всё приложение меняется, пока вы листаете — выберите то, на что приятно смотреть каждый день.", he: "כל האפליקציה משתנה בזמן שאתם מדפדפים — בחרו את מה שתרצו לראות כל יום." },
    "onb.stepStar":         { en: "Colour the star",    ru: "Цвет звезды", he: "צבע הכוכב" },
    "onb.whyStar":          { en: "The lines of your star. Neutral follows the app's colour; the rest are palettes and flags.",
                              ru: "Линии вашей звезды. Нейтральный следует цвету приложения, остальные — палитры и флаги.",
                              he: "הקווים של הכוכב שלכם. ניטרלי הולך אחרי צבע האפליקציה; השאר הם פלטות ודגלים." },
    "onb.stepLayout":       { en: "Pick a layout",      ru: "Выберите вид", he: "בחרו פריסה" },
    "onb.whyLayout":        { en: "How the lobby arranges itself. Star rings the tiles and can wire them three different ways; the others are lists.",
                              ru: "Как устроено главное меню. «Звезда» ставит плитки в кольцо и умеет соединять их тремя способами; остальные — списки.", he: "איך הלובי מסדר את עצמו. \"כוכב\" מסדר את האריחים בטבעת ויכול לחבר אותם בשלוש דרכים; האחרים הם רשימות." },
    "onb.next":             { en: "Next",               ru: "Далее", he: "הבא" },
    "onb.done":             { en: "Lock it in",         ru: "Оставить так", he: "לשמור כך" },
    "onb.skip":             { en: "Skip",               ru: "Пропустить", he: "דילוג" },
    "onb.changeLater":      { en: "Change any of this later in Custom",
                              ru: "Всё это можно поменять позже в «Кастоме»", he: "את כל זה אפשר לשנות אחר כך בהתאמה האישית" },
    "onb.reopen":           { en: "Preview looks",     ru: "Примерить вид", he: "לנסות מראה" },

    // ---- Cloud sync (core/sync.js) ----
    "sync.offline":         { en: "Cloud sync failed — working locally. Your progress is safe on this device.",
                              ru: "Синхронизация не удалась — работаем локально. Прогресс сохранён на устройстве.", he: "הסנכרון לענן נכשל — עובדים מקומית. ההתקדמות שמורה במכשיר הזה." },

    "ui.warn.title":        { en: "Administrative Notice", ru: "Административное уведомление", he: "הודעה מנהלית" },
    "ui.warn.desc":         { en: "You have received a warning from a moderator.",
                              ru: "Вы получили предупреждение от модератора.", he: "קיבלתם אזהרה ממודרטור." },
    "ui.warn.ack":          { en: "I understand",       ru: "Понятно", he: "הבנתי" },

    "ui.stats.title":       { en: "Your Profile",       ru: "Ваш профиль", he: "הפרופיל שלכם" },
    "ui.stats.export":      { en: "Export Data",        ru: "Выгрузить данные", he: "ייצוא נתונים" },
    "ui.stats.import":      { en: "Import Data",        ru: "Загрузить данные", he: "ייבוא נתונים" },
    "ui.pd.profile":        { en: "Profile",            ru: "Профиль", he: "פרופיל" },
    "ui.pd.avatar":         { en: "Avatar",             ru: "Аватар", he: "אווטאר" },
    "ui.pd.stats":          { en: "View Statistics",    ru: "Статистика", he: "סטטיסטיקה" },
    "ui.pd.admin":          { en: "Admin & Logs",       ru: "Админка и логи", he: "ניהול ויומנים" },

    // Lobby tiles
    "ui.tile.library":      { en: "Library",            ru: "Библиотека", he: "ספרייה" },
    "ui.tile.librarySub":   { en: "Choose a course and start training", ru: "Выберите курс и начните", he: "בחרו קורס והתחילו להתאמן" },
    "ui.tile.resume":       { en: "Continue where you left off", ru: "Продолжить с того же места", he: "להמשיך מאיפה שעצרתם" },
    "ui.tile.garden":       { en: "Garden",             ru: "Сад", he: "גינה" },
    "ui.tile.career":       { en: "Career",             ru: "Карьера", he: "קריירה" },
    "ui.tile.careerSub":    { en: "Rank, rewards and the ladder", ru: "Ранг, награды и лестница", he: "דרגה, פרסים והסולם" },
    "ui.tile.flashcards":   { en: "Flashcards",         ru: "Карточки", he: "כרטיסיות" },
    "ui.tile.forum":        { en: "Forum",              ru: "Форум", he: "פורום" },
    "ui.tile.museum":       { en: "Museum",             ru: "Музей", he: "מוזיאון" },
    "ui.sum.museum":        { en: "How it works, and what was set aside", ru: "Как всё устроено и что отложено", he: "איך הכול בנוי, ומה הונח בצד" },
    "ui.tile.custom":       { en: "Custom",             ru: "Кастом", he: "התאמה אישית" },
    "ui.tile.customSub":    { en: "Everything you've unlocked, ready to equip",
                              ru: "Всё открытое, готовое к использованию", he: "כל מה שפתחתם, מוכן לשימוש" },
    "ui.tile.settings":     { en: "Settings",           ru: "Настройки", he: "הגדרות" },
    "ui.tile.settingsSub":  { en: "Colour theme and data", ru: "Оформление и данные", he: "ערכת צבעים ונתונים" },

    // Screen titles and their back buttons
    "ui.back.lobby":        { en: "← Lobby",            ru: "← В лобби", he: "→ ללובי" },
    "ui.back.courses":      { en: "← Courses",          ru: "← К курсам", he: "→ לקורסים" },
    "ui.back.unit":         { en: "← Unit",             ru: "← К блоку", he: "→ ליחידה" },
    "ui.back.unitList":     { en: "← Units",            ru: "← К блокам", he: "→ ליחידות" },
    "ui.view.map":          { en: "Map",                ru: "Карта", he: "מפה" },
    "ui.view.list":         { en: "List",               ru: "Список", he: "רשימה" },
    "course.about":         { en: "About this course",  ru: "О курсе", he: "על הקורס" },
    "course.unitsCount":    { en: "{n} units:",         ru: "Блоков: {n}", he: "{n} יחידות:" },
    "course.unlockFor":     { en: "Unlock for",         ru: "Открыть за", he: "לפתוח תמורת" },
    "course.needMore":      { en: "Need {n} more — Token Shop", ru: "Не хватает {n} — в магазин", he: "חסרים עוד {n} — לחנות האסימונים" },
    "course.unitLine":      { en: "Unit {id}",             ru: "Блок {id}", he: "יחידה {id}" },
    "course.unitTopics":    { en: "{n} topics",             ru: "тем: {n}", he: "{n} נושאים" },
    "chunk.analogy":        { en: "Analogy",            ru: "Аналогия", he: "אנלוגיה" },
    "chunk.sources":        { en: "Sources & further reading", ru: "Источники и дополнительное чтение", he: "מקורות וקריאה נוספת" },
    "chunk.backToExplain":  { en: "Back to explanation", ru: "К объяснению", he: "חזרה להסבר" },

    // Mastery-exam result screen — found untranslated in a live
    // walkthrough of the Philosophy course, 2026-08-25. The two
    // description sentences build a "{timing}" / day-count phrase in
    // JS rather than fighting the {var} templating over pluralisation.
    "exam.backToTopics":    { en: "Back to Topics",      ru: "К темам", he: "חזרה לנושאים" },
    "exam.mastered":        { en: "Topic Mastered!",     ru: "Тема освоена!", he: "שלטתם בנושא!" },
    "exam.notYet":          { en: "Not Quite Yet",       ru: "Пока не совсем", he: "עוד לא לגמרי" },
    "exam.retry":           { en: "Retry Exam",          ru: "Пересдать", he: "לנסות שוב את המבחן" },
    "exam.redoTopic":       { en: "Redo Topic",          ru: "Пройти тему заново", he: "לעבור על הנושא מחדש" },
    "exam.descPassed":      { en: "You scored {correct}/{total} on \"{title}\". It'll come back for review {timing} — that's when it does the most good.",
                              ru: "Вы набрали {correct}/{total} по теме «{title}». Она вернётся на повторение {timing} — вот тогда от этого будет больше всего пользы.", he: "קיבלתם {correct}/{total} בנושא \"{title}\". הוא יחזור אליכם לחזרה {timing} — בדיוק כשזה מועיל הכי הרבה." },
    "exam.timingDays":      { en: "in {n} day",          ru: "через {n} день", he: "בעוד יום" },
    "exam.timingDaysFew":   { en: "in {n} days",         ru: "через {n} дня", he: "בעוד {n} ימים" },
    "exam.timingDaysMany":  { en: "in {n} days",         ru: "через {n} дней", he: "בעוד {n} ימים" },
    "exam.descRedo":        { en: "You scored {correct}/{total} — that's two attempts under 80%. Rather than a third try at the same exam, go back through \"{title}\" from the start.",
                              ru: "Вы набрали {correct}/{total} — это уже вторая попытка ниже 80%. Вместо третьего захода на тот же экзамен пройдите тему «{title}» заново, с начала.", he: "קיבלתם {correct}/{total} — זה כבר ניסיון שני מתחת ל־80%. במקום ניסיון שלישי באותו מבחן, עברו שוב על \"{title}\" מההתחלה." },
    "exam.descRetry":       { en: "You scored {correct}/{total}, and 80% masters the topic. Rather than re-reading, go straight back to the questions you missed — that's what actually moves the needle.",
                              ru: "Вы набрали {correct}/{total}, а для освоения темы нужно 80%. Вместо перечитывания сразу возвращайтесь к вопросам, где ошиблись, — именно это и сдвигает результат.", he: "קיבלתם {correct}/{total}, ו־80% הם שליטה בנושא. במקום לקרוא שוב, חזרו ישר לשאלות שטעיתם בהן — זה מה שבאמת מזיז את התוצאה." },
    // "8" is not a placeholder -- FINAL_QUIZ_TOPIC is a single global
    // constant tied to intro-cs specifically, and 8 was a literal in
    // the original English too. No course object is in scope here to
    // compute it from, so this stays a fixed fact, not a template.
    "exam.suffix":          { en: " — Mastery Exam",     ru: " — экзамен на освоение", he: " — מבחן שליטה" },
    "exam.cumulative":      { en: "Cumulative — drawn from all 8 units. Score 80% or higher to pass.",
                              ru: "Итоговый — вопросы из всех 8 блоков. Наберите 80% или больше, чтобы сдать.", he: "מסכם — שאלות מכל 8 היחידות. כדי לעבור צריך 80% ומעלה." },
    "exam.scoreToMaster":   { en: "Score 80% or higher to master this topic and start its review schedule.",
                              ru: "Наберите 80% или больше, чтобы освоить тему и запустить график её повторения.", he: "צריך 80% ומעלה כדי לשלוט בנושא ולהתחיל את לוח החזרות שלו." },
    "exam.questionCounter": { en: "Question {n} of {total}", ru: "Вопрос {n} из {total}", he: "שאלה {n} מתוך {total}" },

    // Quiz feedback -- two independent render sites (chunk quiz, exam
    // question) that had each hardcoded their own copy of this text.
    "quiz.correct":         { en: "✅ Correct!",       ru: "✅ Верно!", he: "✅ נכון!" },
    "quiz.notQuite":        { en: "❌ Not quite.",     ru: "❌ Не совсем.", he: "❌ לא בדיוק." },
    "quiz.wrongIs":         { en: "❌ Wrong — the answer is {letter}.", ru: "❌ Неверно — правильный ответ: {letter}.", he: "❌ לא נכון — התשובה היא {letter}." },
    "btn.nextQuestion":     { en: "Next Question",     ru: "Следующий вопрос", he: "לשאלה הבאה" },
    "btn.seeResults":       { en: "See Results",       ru: "К результатам", he: "לתוצאות" },
    "ui.screen.garden":     { en: "Your Garden",        ru: "Ваш сад", he: "הגינה שלכם" },
    "ui.screen.settings":   { en: "Settings",           ru: "Настройки", he: "הגדרות" },
    "ui.screen.career":     { en: "Career",             ru: "Карьера", he: "קריירה" },
    "ui.screen.forum":      { en: "The Forum",          ru: "Форум", he: "הפורום" },
    "ui.screen.museum":     { en: "The Museum",         ru: "Музей", he: "המוזיאון" },
    "ui.screen.library":    { en: "Library",            ru: "Библиотека", he: "ספרייה" },
    "ui.screen.unit":       { en: "Choose a Unit",      ru: "Выберите блок", he: "בחרו יחידה" },
    "ui.screen.deck":       { en: "Custom Deck",        ru: "Своя колода", he: "חפיסה משלכם" },
    "ui.btn.tokenShop":     { en: "Shop",               ru: "Магазин", he: "חנות" },

    // Lobby tile subtitles. Computed by their own branch (lobby.js must
    // not know what a plant or a rank is), so the branch does the lookup
    // and the plural-dodging phrasing lives here.
    "ui.sum.gardenEmpty":  { en: "Nothing planted yet — finish a topic to grow something",
                              ru: "Пока ничего не посажено — пройдите тему, и что-нибудь взойдёт", he: "עוד לא נשתל כלום — סיימו נושא כדי שמשהו יצמח" },
    "ui.sum.planted":      { en: "{n} of {of} planted", ru: "посажено: {n} из {of}", he: "{n} מתוך {of} נשתלו" },
    "ui.sum.needWater":    { en: "{n} need watering",   ru: "требуют полива: {n}", he: "{n} צריכים השקיה" },
    "ui.sum.rankToGo":     { en: "{cur} · {n} XP to {next}", ru: "{cur} · до «{next}» ещё {n} XP", he: "{cur} · עוד {n} XP עד {next}" },
    "ui.sum.rankTop":      { en: "{cur} · top of the ladder", ru: "{cur} · вершина лестницы", he: "{cur} · בראש הסולם" },
    "ui.sum.buyToUnlock":  { en: "Buy a course to unlock", ru: "Купите курс, чтобы открыть", he: "קנו קורס כדי לפתוח" },
    "ui.sum.reviewed":     { en: "{n} chunks reviewed so far — build a deck",
                              ru: "повторено блоков: {n} — соберите колоду", he: "חזרתם כבר על {n} חלקים — בנו חפיסה" },
    "ui.sum.flashIdle":    { en: "Pick any chunks, drill your weak spots",
                              ru: "Выберите блоки и прогоняйте слабые места", he: "בחרו חלקים ותרגלו את הנקודות החלשות" },
    "ui.sum.forumIdle":    { en: "Reputation, and the rule it runs on",
                            ru: "Признание и правило, по которому оно живёт", he: "מוניטין, והכלל שלפיו הוא עובד" },
    "ui.sum.forum":        { en: "{n} left to give today",
                              ru: "осталось раздать сегодня: {n}", he: "נשארו לתת היום: {n}" },
    // ---- Mock exam (library/exam-sim.js) ----
    // {n} / {min} / {pass} / {i} / {of} / {score} are filled by t(key, vars).
    "sim.entry":            { en: "Mock Exam",          ru: "Пробный экзамен", he: "מבחן תרגול" },
    "sim.entrySub":         { en: "{n} questions · {min} min · {pass} to pass",
                              ru: "{n} вопросов · {min} мин · порог {pass}", he: "{n} שאלות · {min} דק׳ · {pass} למעבר" },
    "sim.best":             { en: "best {score}/{n}",   ru: "лучший {score}/{n}", he: "הכי טוב {score}/{n}" },
    "sim.title":            { en: "Mock Exam",          ru: "Пробный экзамен", he: "מבחן תרגול" },
    "sim.introTitle":       { en: "Before you start",   ru: "Перед началом", he: "לפני שמתחילים" },
    "sim.introBody":        { en: "{n} questions drawn at random from the Ministry's published bank of 40. {min} minutes. You pass on {pass} correct — that is at most {wrong} mistakes.<br><br>You can move back and forth between questions and change answers. The clock does not stop, and it does not stop for the review either: when it runs out the paper is submitted as it stands.",
                              ru: "{n} вопросов, взятых случайно из опубликованного министерством банка в 40. {min} минут. Проходной балл — {pass} правильных, то есть не больше {wrong} ошибок.<br><br>По вопросам можно ходить вперёд и назад и менять ответы. Часы при этом не останавливаются, и на проверку их тоже не останавливают: когда время выйдет, работа уйдёт в том виде, в каком есть.", he: "{n} שאלות שנבחרו באקראי מתוך 40 השאלות שפרסם המשרד. {min} דקות. עוברים עם {pass} תשובות נכונות — כלומר לכל היותר {wrong} טעויות.<br><br>אפשר לעבור קדימה ואחורה בין השאלות ולשנות תשובות. השעון לא עוצר, וגם לא בזמן הבדיקה: כשהזמן נגמר, הטופס מוגש כמו שהוא." },
    "sim.introNote":        { en: "Nothing here is scored into your progress. It is a rehearsal, and you may sit it as often as you like.",
                              ru: "Ничего из этого не идёт в ваш прогресс. Это репетиция, и проходить её можно сколько угодно раз.", he: "שום דבר כאן לא נכנס להתקדמות שלכם. זו חזרה גנרלית, ואפשר לגשת אליה כמה פעמים שרוצים." },
    "sim.begin":            { en: "Start the exam",     ru: "Начать экзамен", he: "להתחיל את המבחן" },
    "sim.counter":          { en: "Question {i} of {of}", ru: "Вопрос {i} из {of}", he: "שאלה {i} מתוך {of}" },
    "sim.prev":             { en: "← Previous",         ru: "← Назад", he: "→ הקודמת" },
    "sim.next":             { en: "Next →",             ru: "Дальше →", he: "הבאה ←" },
    "sim.finish":           { en: "Finish",             ru: "Завершить", he: "סיום" },
    "sim.unanswered":       { en: "{n} unanswered",     ru: "без ответа: {n}", he: "בלי תשובה: {n}" },
    "sim.timeUp":           { en: "Time is up — the paper was submitted as it stood.",
                              ru: "Время вышло — работа принята в том виде, в каком была.", he: "הזמן נגמר — הטופס הוגש כמו שהיה." },
    "sim.passed":           { en: "Passed",             ru: "Сдано", he: "עברתם" },
    "sim.failed":           { en: "Not passed",         ru: "Не сдано", he: "לא עברתם" },
    "sim.result":           { en: "{score} of {of} correct — you needed {pass}.",
                              ru: "{score} из {of} правильных — требовалось {pass}.", he: "{score} מתוך {of} נכונות — היה צריך {pass}." },
    "sim.timeSpent":        { en: "Time taken: {t}",    ru: "Затрачено времени: {t}", he: "זמן: {t}" },
    "sim.reviewTitle":      { en: "What you got wrong", ru: "Что вы ответили неверно", he: "במה טעיתם" },
    "sim.allCorrect":       { en: "Every answer correct. Nothing to review.",
                              ru: "Все ответы верны. Разбирать нечего.", he: "כל התשובות נכונות. אין מה לבדוק." },
    "sim.yourAnswer":       { en: "Your answer",        ru: "Ваш ответ", he: "התשובה שלכם" },
    "sim.noAnswer":         { en: "left blank",         ru: "без ответа", he: "נשאר ריק" },
    "sim.correctAnswer":    { en: "Correct answer",     ru: "Правильный ответ", he: "התשובה הנכונה" },
    "sim.again":            { en: "Sit it again",       ru: "Пройти ещё раз", he: "לנסות שוב" },
    "sim.leave":            { en: "Back to the course", ru: "Вернуться к курсу", he: "חזרה לקורס" },
    "sim.abandon":          { en: "Leave? Tap again",   ru: "Выйти? Нажмите ещё раз", he: "לצאת? לחצו שוב" },
    "sim.finishAnyway":     { en: "{n} blank — finish?", ru: "без ответа: {n} — завершить?", he: "{n} ריקות — לסיים?" },

    // The language control itself
    "lang.label":           { en: "Language",           ru: "Язык", he: "שפה" },
    "lang.note":            { en: "Switching reloads the app. Progress is saved.",
                              ru: "Переключение перезагрузит приложение. Прогресс сохранится.", he: "החלפה טוענת את האפליקציה מחדש. ההתקדמות נשמרת." },
// Garden (pass 2)
    "garden.waterFirst":    { en: "Water the first",    ru: "Полить первое", he: "להשקות את הראשון" },
    "garden.allHolding":    { en: "Every plant is holding. Come back when one comes due.",
                              ru: "Все растения держатся. Возвращайтесь, когда подойдёт срок.", he: "כל הצמחים מחזיקים. חזרו כשאחד מהם יגיע לזמן החזרה." },
    "garden.due":           { en: "Due for review",     ru: "Пора повторить", he: "הגיע זמן לחזור" },

    // Shop / Custom (pass 2)
    "shop.emptyAisle":      { en: "Nothing here yet.",  ru: "Здесь пока пусто.", he: "אין כאן כלום עדיין." },
    "inv.clickToEquip":     { en: "Click an owned tile to switch it on",
                              ru: "Нажмите на купленную плитку, чтобы включить", he: "לחצו על אריח שבבעלותכם כדי להפעיל אותו" },
    "inv.dragHere":         { en: "Drag something here to wear it",
                              ru: "Перетащите сюда, чтобы надеть", he: "גררו לכאן משהו כדי ללבוש אותו" },

    // Settings (pass 2)
    "set.openCustom":       { en: "Open Custom",        ru: "Открыть кастом", he: "לפתוח את ההתאמה האישית" },
    "set.hintsExample":     { en: "The small explainer text under section titles across the app — like this one.",
                              ru: "Мелкие пояснения под заголовками разделов — вот такие.", he: "טקסט ההסבר הקטן שמתחת לכותרות הסעיפים — כמו זה." },
    "set.showHints":        { en: "Show hints",         ru: "Показывать подсказки", he: "להציג רמזים" },
    "set.terms":            { en: "Terms of Service",   ru: "Условия использования", he: "תנאי שימוש" },

    // Forum (pass 2)
    "forum.notYourself":    { en: "You cannot spend reputation on yourself.",
                              ru: "Нельзя тратить репутацию на себя.", he: "אי אפשר לתת מוניטין לעצמכם." },

    // Stats (pass 2)
    "stats.weakSpots":      { en: "Your weak spots",    ru: "Ваши слабые места", he: "הנקודות החלשות שלכם" },
    "stats.weakHint":       { en: "Lowest recent scores. Tap one to start there.",
                              ru: "Самые низкие недавние результаты. Нажмите, чтобы начать оттуда.", he: "הציונים הנמוכים האחרונים. לחצו על אחד כדי להתחיל משם." },
// ---- Interface pass 3 ----
    // Garden
    "garden.planted":       { en: "of {total} planted",  ru: "из {total} посажено", he: "מתוך {total} נשתלו" },
    "garden.fullyGrown":    { en: "· {n} fully grown", ru: "· {n} выросли полностью", he: "· {n} גדלו לגמרי" },
    "garden.note":          { en: "Plants grow with the <strong>review interval</strong>, not with how many topics you've finished. Something you passed once is a sprout; something you've held on to for months is a tree. Skip reviews and a plant drops back.",
                              ru: "Растения растут не от числа пройденных тем, а от <strong>интервала повторения</strong>. То, что вы сдали один раз, — росток; то, что держите месяцами, — дерево. Пропустите повторения, и растение откатится назад.", he: "הצמחים גדלים לפי <strong>מרווח החזרה</strong>, לא לפי כמה נושאים סיימתם. משהו שעברתם פעם אחת הוא נבט; משהו שאתם מחזיקים חודשים הוא עץ. דלגו על חזרות, והצמח נסוג." },

    // Garden — the explainer. Folded by default; see explainPanel().
    "garden.ex.title":      { en: "What the Garden is worth", ru: "Что даёт Сад", he: "כמה הגינה שווה" },
    "garden.ex.weight":     { en: "weight {n}",           ru: "вес {n}", he: "משקל {n}" },
    "garden.ex.perDay":     { en: "{n}/day",              ru: "{n}/день", he: "{n} ליום" },
    "garden.ex.lead":       { en: "The Garden is not only a picture of what you remember. It sets how much <strong>standing</strong> you may hand out each day, and its surplus is where customisation money comes from.",
                              ru: "Сад — не только картинка того, что вы помните. Он задаёт, сколько <strong>признания</strong> вы можете раздать за день, и его излишек — источник денег на оформление.", he: "הגינה היא לא רק תמונה של מה שאתם זוכרים. היא קובעת כמה <strong>הכרה</strong> אפשר לחלק בכל יום, והעודף שלה הוא המקור לכסף על עיצוב." },

    "garden.ex.h1":         { en: "Standing is something you give away", ru: "Признание — это то, что вы отдаёте", he: "הכרה היא משהו שנותנים" },
    "garden.ex.give":       { en: "It is not a score you collect. It is the right to point at someone else's post and say <em>this was worth reading</em>. Your own standing is only ever what other people gave you — which is precisely what stops it being farmable alone.",
                              ru: "Это не счёт, который вы копите. Это право указать на чужую запись и сказать: <em>вот это стоило прочесть</em>. Ваше собственное положение — всегда только то, что дали вам другие. Именно поэтому его нельзя нафармить в одиночку.", he: "זה לא ניקוד שאוספים. זו הזכות להצביע על פוסט של מישהו אחר ולומר <em>היה שווה לקרוא את זה</em>. ההכרה שלכם היא תמיד רק מה שאחרים נתנו לכם — ובדיוק זה מה שמונע לצבור אותה לבד." },
    "garden.ex.rule1":      { en: "One point per post, and never to your own.",
                              ru: "Одно очко на запись, и никогда — на свою.", he: "נקודה אחת לכל פוסט, ואף פעם לא לפוסט שלכם." },
    "garden.ex.rule2":      { en: "At most ten to any one author per month, so a pair of friends cannot lift each other.",
                              ru: "Не больше десяти одному автору за месяц — чтобы пара друзей не подняла друг друга.", he: "לכל היותר עשר לאותו כותב בחודש, כדי שזוג חברים לא יוכל להרים זה את זה." },
    "garden.ex.rule3":      { en: "Unspent points do not pile up. The day resets; the allowance does not carry.",
                              ru: "Непотраченные очки не копятся. День обнуляется, норма не переносится.", he: "נקודות שלא נוצלו לא מצטברות. היום מתאפס; המכסה לא עוברת הלאה." },

    "garden.ex.h2":         { en: "Where the daily allowance comes from", ru: "Откуда берётся дневная норма", he: "מאיפה מגיעה המכסה היומית" },
    "garden.ex.earn":       { en: "Every mastered plant carries a weight, and a plant you have held longer weighs more. Every <strong>{per}</strong> of weight is one point a day, up to <strong>{cap}</strong>. Coverage does not count — only what you have kept.",
                              ru: "Каждое освоенное растение имеет вес, и то, что вы держите дольше, весит больше. Каждые <strong>{per}</strong> веса — это одно очко в день, максимум <strong>{cap}</strong>. Охват не считается: считается только то, что вы удержали.", he: "לכל צמח שלמדתם יש משקל, וצמח שהחזקתם זמן רב יותר כבד יותר. כל <strong>{per}</strong> משקל הם נקודה אחת ליום, עד <strong>{cap}</strong>. כיסוי לא נחשב — רק מה ששמרתם." },
    "garden.ex.youHave":    { en: "Your garden weighs <strong>{w}</strong>, which is <strong>{n}</strong> a day.",
                              ru: "Ваш сад весит <strong>{w}</strong> — это <strong>{n}</strong> в день.", he: "הגינה שלכם שוקלת <strong>{w}</strong>, כלומר <strong>{n}</strong> ליום." },
    "garden.ex.toNext":     { en: "Another {n} of weight adds one more.",
                              ru: "Ещё {n} веса добавят одно.", he: "עוד {n} משקל יוסיפו נקודה." },
    "garden.ex.youHaveNone":{ en: "Nothing is mastered yet, so there is no allowance to give. Finish a topic and hold it through a review.",
                              ru: "Пока ничего не освоено, поэтому и раздавать нечего. Пройдите тему и удержите её через повторение.", he: "עוד לא שלטתם בשום נושא, אז אין מכסה לחלק. סיימו נושא והחזיקו אותו דרך חזרה אחת." },

    "garden.ex.h3":         { en: "Surplus becomes money for looks", ru: "Излишек превращается в деньги на внешний вид", he: "העודף הופך לכסף על מראה" },
    "garden.ex.overflow":   { en: "A garden can easily weigh more than the <strong>{cap}</strong> a day cap can use. That surplus is not wasted: it exchanges into <strong>$</strong>, which buys themes and other cosmetics.",
                              ru: "Сад легко может весить больше, чем нужно для потолка в <strong>{cap}</strong> в день. Излишек не пропадает: он меняется на <strong>$</strong>, а на них покупаются темы и прочее оформление.", he: "גינה יכולה בקלות לשקול יותר ממה שהתקרה של <strong>{cap}</strong> ליום מנצלת. העודף לא הולך לאיבוד: הוא מומר ל־<strong>$</strong>, שבהם קונים ערכות נושא ופריטי עיצוב אחרים." },
    "garden.ex.oneWay":     { en: "The exchange runs one way only. <strong>$</strong> never turn back into Tokens and never leave the app, because Tokens cost real money — and studying must never become a way to earn it.",
                              ru: "Обмен работает только в одну сторону. <strong>$</strong> никогда не превращаются обратно в Токены и не покидают приложение: Токены стоят настоящих денег, а учёба не должна становиться способом их заработать.", he: "ההמרה פועלת רק בכיוון אחד. <strong>$</strong> לעולם לא חוזרים להיות אסימונים ולא יוצאים מהאפליקציה, כי אסימונים עולים כסף אמיתי — ולימוד לעולם לא אמור להפוך לדרך להרוויח אותו." },
    "garden.ex.soon":       { en: "The forum and the exchange are still being built. The weights above are already live and already counting — nothing you grow now is lost.",
                              ru: "Форум и обменник ещё строятся. Веса выше уже работают и уже считаются — ничто из выращенного сейчас не пропадёт.", he: "הפורום וההמרה עדיין בבנייה. המשקלים למעלה כבר פעילים וכבר נספרים — שום דבר שאתם מגדלים עכשיו לא הולך לאיבוד." },

    // Custom
    "inv.preview":          { en: "Preview",             ru: "Предпросмотр", he: "תצוגה מקדימה" },

    // Settings
    "set.sound":            { en: "Sound effects",       ru: "Звуки", he: "אפקטים קוליים" },

    // Holiday (migrations 0026/0027). Every number here comes from the
    // server; the section stays hidden until it answers.
    "set.holidayTitle":     { en: "Holiday",            ru: "Отпуск", he: "חופשה" },
    "set.holidayNote":      { en: "Away for a while? Nothing in the Garden withers while holiday is on, and your reviews wait for you rather than piling up. Your reputation allowance is zero while it lasts — that is what makes it safe to offer with no strings.",
                              ru: "Уезжаете или заболели? Пока отпуск включён, в Саду ничего не вянет, а повторения ждут вас, а не копятся. Норма признания на это время — ноль: именно поэтому отпуск можно давать без оговорок.", he: "יוצאים לזמן מה? כל עוד החופשה פעילה, שום דבר בגינה לא נובל, והחזרות מחכות לכם במקום להצטבר. מכסת המוניטין שלכם בזמן הזה היא אפס — זה מה שמאפשר להציע את החופשה בלי תנאים." },
    "set.holidayStart":     { en: "Start holiday",      ru: "Уйти в отпуск", he: "לצאת לחופשה" },
    "set.holidayEnd":       { en: "I'm back",           ru: "Я вернулся", he: "חזרתי" },
    "set.holidayAway":      { en: "<strong>You are away.</strong> The Garden is holding.",
                              ru: "<strong>Вы в отпуске.</strong> Сад держится.", he: "<strong>אתם בחופשה.</strong> הגינה מחזיקה." },
    "set.holidayLeft":      { en: "{n} of {of} holiday days left this year",
                              ru: "осталось дней отпуска в этом году: {n} из {of}", he: "נשארו {n} מתוך {of} ימי חופשה השנה" },
    "set.holidayNoBudget":  { en: "No holiday days left this year",
                              ru: "Дни отпуска на этот год кончились", he: "לא נשארו ימי חופשה השנה" },
    "set.privacy":          { en: "Privacy Policy",      ru: "Политика конфиденциальности", he: "מדיניות פרטיות" },
    "set.draftNote":        { en: "Draft. Being reviewed before any paid release.",
                              ru: "Черновик. Будет проверен до любого платного выпуска.", he: "טיוטה. תיבדק לפני כל השקה בתשלום." },

    // Forum
    "forum.repNote":        { en: "Earned in the Garden. It is not a score you keep — it is the right to <strong>give</strong>. Spend it on posts worth reading and the person who wrote them goes up.",
                              ru: "Зарабатывается в Саду. Это не счёт, который вы копите, а право <strong>отдавать</strong>. Тратьте её на записи, которые стоит читать, — и их автор поднимется.", he: "נצבר בגינה. זה לא ניקוד שאתם שומרים — זו הזכות <strong>לתת</strong>. הוציאו אותו על פוסטים ששווה לקרוא, והכותב שלהם עולה." },
    "forum.ruleRest":       { en: "Standing is only ever what other people gave you, which is what stops it becoming a number you can farm alone.",
                              ru: "Ваше положение — это всегда только то, что вам дали другие. Именно поэтому его нельзя нафармить в одиночку.", he: "ההכרה היא תמיד רק מה שאחרים נתנו לכם, וזה מה שמונע ממנה להפוך למספר שאפשר לצבור לבד." },

    // Stats tiles
    "stats.overall":        { en: "Overall Progress",    ru: "Общий прогресс", he: "התקדמות כללית" },
    "stats.mastered":       { en: "Topics Mastered",     ru: "Тем освоено", he: "נושאים שנלמדו" },
    "stats.qAccuracy":      { en: "Question Accuracy",   ru: "Точность по вопросам", he: "דיוק בשאלות" },
    "stats.eAccuracy":      { en: "Exam Accuracy",       ru: "Точность на экзаменах", he: "דיוק במבחנים" },
    "stats.qScore":         { en: "Question Score",      ru: "Счёт по вопросам", he: "ניקוד בשאלות" },
    "stats.examsPassed":    { en: "Exams Passed",        ru: "Экзаменов сдано", he: "מבחנים שעברתם" },

    // Library chrome
    "lib.inEnglish":        { en: "In English", ru: "На английском", he: "באנגלית" },
    "lib.comingSoon":       { en: "Placeholder",         ru: "Муляж", he: "לתצוגה בלבד" },
    "lib.courseComplete":   { en: "Course complete",     ru: "Курс пройден", he: "הקורס הושלם" },
    "lib.dueTitle":         { en: "Due for review",      ru: "Пора повторить", he: "הגיע זמן לחזור" },
    "lib.dueHint":          { en: "Coming back to these now is worth more than new material.",
                              ru: "Вернуться к ним сейчас полезнее, чем брать новое.", he: "לחזור לאלה עכשיו שווה יותר מחומר חדש." },

    // The enrollment contract
    "contract.title":       { en: "Trainee Enrollment Contract", ru: "Договор о зачислении", he: "חוזה קבלה לחניכים" },
    "contract.intro":       { en: "By signing below, you (the <strong>Trainee</strong>) solemnly swear to:",
                              ru: "Подписывая ниже, вы (<strong>Ученик</strong>) торжественно обязуетесь:", he: "בחתימתכם למטה, אתם (<strong>החניכים</strong>) נשבעים חגיגית:" },
    "contract.c1":          { en: "Read the material before guessing on the quiz",
                              ru: "Читать материал до того, как гадать в вопросе", he: "לקרוא את החומר לפני שמנחשים בשאלה" },
    "contract.c2":          { en: "Accept that 80% is mastery, not 79.9%",
                              ru: "Признать, что освоение — это 80%, а не 79,9%", he: "לקבל ש־80% זו שליטה, ולא 79.9%" },
    "contract.c3":          { en: "Never blame the app for a fact you skimmed past",
                              ru: "Не винить приложение в факте, который вы пролистали", he: "לעולם לא להאשים את האפליקציה בעובדה שדילגתם עליה" },
    "contract.c4":          { en: "Take a water break at least once per streak",
                              ru: "Хотя бы раз за серию сделать перерыв на воду", he: "לעשות הפסקת מים לפחות פעם אחת בכל רצף" },
    "contract.clear":       { en: "Clear",               ru: "Стереть", he: "ניקוי" },
    "contract.sign":        { en: "Sign & Enter",       ru: "Подписать и войти", he: "לחתום ולהיכנס" },
    "contract.signHere":    { en: "Sign here ✍️",       ru: "Распишитесь здесь ✍️", he: "חתמו כאן ✍️" },
    "contract.plantNote":   { en: "Signing is what plants this course's first seed in your <strong>Garden</strong> — nothing grows there before it.",
                              ru: "Подпись — это то, что сажает первое зерно этого курса в вашем <strong>Саду</strong>: раньше там расти нечему.", he: "החתימה היא מה ששותל את הזרע הראשון של הקורס הזה <strong>בגינה</strong> שלכם — לפני כן לא צומח שם כלום." },
    "contract.fineprint":   { en: "Legally binding in absolutely no jurisdiction. Knell will remember anyway.",
                              ru: "Юридической силы не имеет ни в одной юрисдикции. Knell всё равно запомнит.", he: "חסר כל תוקף משפטי בכל מערכת משפט שהיא. Knell יזכור בכל זאת." },
// ---- Interface pass 4: section titles and the prose under them ----
    // These were missed by the earlier sweeps because the title starts
    // with an emoji, so a "does this begin with a Latin letter" filter
    // walked straight past every one of them.
    "set.appearance":       { en: "Appearance",          ru: "Оформление", he: "מראה" },
    "set.appearanceNote":   { en: "Themes, lobby layout, colours, stripes, decorations and scenery all live in Custom now — one place to equip everything you own, instead of the same controls in two screens.",
                              ru: "Темы, раскладка лобби, цвета, узоры, украшения и пейзаж теперь живут в Кастоме — одно место, где надевается всё ваше, вместо одних и тех же настроек на двух экранах.", he: "ערכות נושא, פריסת הלובי, צבעים, פסים, קישוטים ונוף — כולם נמצאים עכשיו בהתאמה האישית: מקום אחד ללבוש בו כל מה ששלכם, במקום אותן הגדרות בשני מסכים." },
    "set.hintsTitle":       { en: "Hints",               ru: "Подсказки", he: "רמזים" },
    "set.soundTitle":       { en: "Sound",               ru: "Звук", he: "צליל" },
    "set.soundNote":        { en: "Short synthesized click/answer/reward sounds across the app — no audio files, generated on the fly.",
                              ru: "Короткие синтезированные звуки нажатий, ответов и наград — без аудиофайлов, генерируются на лету.", he: "צלילי לחיצה, תשובה ופרס קצרים בכל האפליקציה — בלי קובצי שמע, נוצרים תוך כדי." },
    "set.legal":            { en: "Legal",               ru: "Правовое", he: "משפטי" },
    "set.yourData":         { en: "Your data",           ru: "Ваши данные", he: "הנתונים שלכם" },
    // Corrected 2026-09-03. This said "stored in this browser only.
    // Export before clearing browser data or switching machines" —
    // written before accounts existed, and left standing for a session
    // after progress started syncing. It advised the opposite of the
    // truth about the one thing people most need to be right about:
    // whether their work is safe.
    "set.dataNote":         { en: "Your progress is kept in this browser AND in your account, and the two sync whenever you are online — so signing in on another device brings it with you. Export gives you a copy of your own, for keeping or for leaving.",
                              ru: "Прогресс хранится и в этом браузере, и в вашем аккаунте, и они синхронизируются при подключении — поэтому вход с другого устройства приносит его с собой. «Экспорт» даёт вам собственную копию: чтобы хранить или чтобы уйти.", he: "ההתקדמות נשמרת גם בדפדפן הזה וגם בחשבון שלכם, והשניים מסתנכרנים בכל פעם שאתם מחוברים — כך שכניסה ממכשיר אחר מביאה אותה איתכם. הייצוא נותן לכם עותק משלכם, לשמירה או לעזיבה." },
    "set.export":           { en: "Export Data",         ru: "Выгрузить данные", he: "ייצוא נתונים" },
    "set.import":           { en: "Import Data",         ru: "Загрузить данные", he: "ייבוא נתונים" },

    // Forum
    "forum.repTitle":       { en: "Your reputation",     ru: "Ваша репутация", he: "המוניטין שלכם" },

    // Step 3: the three figures. All are queries against the rep_grants
    // journal, so the season resets by itself — see forum/forum.js.
    "forum.given":          { en: "Given",              ru: "Отдано", he: "ניתן" },

    // Step 4: the feed.
    "forum.feedTitle":      { en: "The feed",           ru: "Лента", he: "הפיד" },

    // The bell (core/hud.js). Three things only: a reply, a point, or a
    // moderator hiding your post. Who gave a point is never named — the
    // privacy policy says so, and a notification that named them would
    // make that false.
    "bell.tip":             { en: "Replies, points and moderation",
                              ru: "Ответы, признание и модерация", he: "תגובות, נקודות ומודרציה" },
    "bell.empty":           { en: "Nothing new. Anything that happens to your posts shows up here.",
                              ru: "Ничего нового. Всё, что произойдёт с вашими записями, появится здесь.", he: "אין חדש. כל מה שיקרה לפוסטים שלכם יופיע כאן." },
    "bell.reply":           { en: "{who} replied to your post",
                              ru: "{who} ответил(а) на вашу запись", he: "{who} הגיב/ה לפוסט שלכם" },
    "bell.point":           { en: "Your post was given a point — {n} in total",
                              ru: "Вашей записи дали очко — всего {n}", he: "הפוסט שלכם קיבל נקודה — {n} בסך הכול" },
    "bell.hidden":          { en: "A moderator hid your post",
                              ru: "Модератор скрыл вашу запись", he: "מודרטור הסתיר את הפוסט שלכם" },
    "bell.andMore":         { en: "and {n} more",
                              ru: "и ещё {n}", he: "ועוד {n}" },

    // Step 5: writing.
    "forum.composeTitle":   { en: "Write something",    ru: "Написать", he: "לכתוב משהו" },
    "forum.composePlaceholder": { en: "Something worth someone else's time.",
                              ru: "Что-то, на что не жалко чужого времени.", he: "משהו ששווה את הזמן של מישהו אחר." },
    "forum.composeSpent":   { en: "You have used today's posts. The count refills tomorrow.",
                              ru: "Записи на сегодня кончились. Счётчик обновится завтра.", he: "ניצלתם את הפוסטים של היום. המונה מתמלא מחר." },
    "forum.publish":        { en: "Publish",            ru: "Опубликовать", he: "לפרסם" },
    "forum.postsLeft":      { en: "{n} of {of} posts left today",
                              ru: "осталось записей сегодня: {n} из {of}", he: "נשארו {n} מתוך {of} פוסטים היום" },
    "forum.showThread":     { en: "Replies",            ru: "Ответы", he: "תגובות" },
    "forum.hideThread":     { en: "Hide replies",       ru: "Скрыть ответы", he: "להסתיר תגובות" },
    "forum.noReplies":      { en: "No replies yet.",    ru: "Ответов пока нет.", he: "עוד אין תגובות." },
    "forum.reply":          { en: "Reply",              ru: "Ответить", he: "להגיב" },
    "forum.replyPlaceholder": { en: "Add to the thread…", ru: "Добавить к обсуждению…", he: "להוסיף לשרשור..." },
    "forum.replySpent":     { en: "You have used today's replies.",
                              ru: "Ответы на сегодня кончились.", he: "ניצלתם את התגובות של היום." },
    "forum.loading":        { en: "Loading…",           ru: "Загружаю…", he: "טוען..." },
    "forum.give":           { en: "Give a point",       ru: "Дать очко", he: "לתת נקודה" },
    "forum.giving":         { en: "Giving…",            ru: "Отдаю…", he: "נותנים..." },
    "forum.gave":           { en: "Given",              ru: "Отдано", he: "ניתן" },
    "forum.yours":          { en: "Your post",          ru: "Ваша запись", he: "הפוסט שלכם" },
    "forum.noAllowance":    { en: "Nothing left to give today — it refills tomorrow",
                              ru: "На сегодня раздавать нечего — обновится завтра", he: "לא נשאר מה לתת היום — המכסה מתמלאת מחר" },
    "forum.viewsTip":       { en: "People who actually read this - scrolling past does not count",
                              ru: "Сколько людей действительно прочли — пролистывание не считается", he: "אנשים שבאמת קראו את זה — גלילה מהירה לא נחשבת" },
    "forum.scoreTip":       { en: "Points this post has been given",
                              ru: "Сколько очков дали этой записи", he: "נקודות שהפוסט הזה קיבל" },
    "forum.unknownAuthor":  { en: "Someone",            ru: "Кто-то", he: "מישהו" },
    "forum.feedUnavailable":{ en: "The feed could not be loaded.",
                              ru: "Ленту не удалось загрузить.", he: "לא הצלחנו לטעון את הפיד." },
    "forum.justNow":        { en: "just now",           ru: "только что", he: "עכשיו" },
    "forum.minsAgo":        { en: "{n} min ago",        ru: "{n} мин назад", he: "לפני {n} דק׳" },
    "forum.hoursAgo":       { en: "{n} h ago",          ru: "{n} ч назад", he: "לפני {n} שע׳" },
    "forum.daysAgo":        { en: "{n} d ago",          ru: "{n} дн назад", he: "לפני {n} ימים" },
    "forum.gotMonth":       { en: "Got this month",     ru: "Получено за месяц", he: "התקבל החודש" },
    "forum.gotTotal":       { en: "Got in total",       ru: "Получено всего", he: "התקבל בסך הכול" },
    "forum.todayHave":      { en: "<strong>{left}</strong> of {of} left to give today",
                              ru: "Осталось раздать сегодня: <strong>{left}</strong> из {of}", he: "נשארו לתת היום <strong>{left}</strong> מתוך {of}" },
    "forum.todayNone":      { en: "Nothing to give yet — the Garden sets the daily allowance, and yours is still 0",
                              ru: "Пока раздавать нечего — дневную норму задаёт Сад, и у вас она пока 0", he: "עוד אין מה לתת — הגינה קובעת את המכסה היומית, ושלכם עדיין 0" },
    "forum.fromGarden":     { en: "Garden weight {w} · every 5 is one point a day, up to 5",
                              ru: "Вес Сада {w} · каждые 5 дают одно очко в день, максимум 5", he: "משקל הגינה {w} · כל 5 הם נקודה אחת ליום, עד 5" },
    "forum.seasonNote":     { en: "The month resets on its own. Nothing expires except today's unspent allowance — what you were given is kept for good.",
                              ru: "Месяц обнуляется сам. Ничего не сгорает, кроме сегодняшней нераспределённой нормы — то, что дали вам, остаётся навсегда.", he: "החודש מתאפס מעצמו. שום דבר לא פג, חוץ מהמכסה של היום שלא נוצלה — מה שקיבלתם נשאר לתמיד." },
    "forum.figuresOffline": { en: "These numbers live on the server, and it cannot be reached right now. Nothing is lost — sign in or reconnect and they will be here.",
                              ru: "Эти числа живут на сервере, и до него сейчас не достучаться. Ничего не потеряно — войдите или дождитесь связи.", he: "המספרים האלה נמצאים בשרת, ואי אפשר להגיע אליו כרגע. שום דבר לא אבד — היכנסו או התחברו מחדש והם יופיעו כאן." },
    "forum.figuresNoBackend": { en: "This build has no backend configured, so there is nothing to count.",
                              ru: "В этой сборке сервер не настроен, поэтому считать нечего.", he: "בגרסה הזו לא מוגדר שרת, אז אין מה לספור." },
    "forum.ruleTitle":      { en: "The one rule",        ru: "Единственное правило", he: "הכלל היחיד" },
    "forum.emptyTitle":     { en: "No posts yet",
                              ru: "Записей пока нет", he: "עוד אין פוסטים" },
    "forum.empty1":         { en: "The parts that had to be built first are done: accounts, the reputation ledger, and the rules about who may give what to whom — all enforced on the server, where they cannot be edited from a browser.",
                              ru: "То, что нужно было построить сначала, готово: аккаунты, журнал признания и правила о том, кто кому и сколько может дать — всё это держит сервер, где их нельзя переписать из браузера.", he: "החלקים שהיה צריך לבנות קודם מוכנים: חשבונות, יומן המוניטין והכללים מי רשאי לתת מה ולמי — כולם נאכפים בשרת, שם אי אפשר לשנות אותם מהדפדפן." },
    "forum.empty2":         { en: "What is left is the reading and the writing. Until that lands the room stays empty on purpose — seeding it with invented posts would look like a community and be a stage set.",
                              ru: "Осталось чтение и письмо. Пока их нет, комната пуста намеренно: набить её выдуманными записями значило бы изобразить сообщество, а получить декорацию.", he: "מה שנשאר זה הקריאה והכתיבה. עד שזה יגיע, החדר נשאר ריק בכוונה — למלא אותו בפוסטים מומצאים היה נראה כמו קהילה ובפועל היה תפאורה." },

    // Stats
    "stats.badges":         { en: "Badges ({n}/{total})", ru: "Значки ({n}/{total})", he: "תגים ({n}/{total})" },

    // Garden
    "garden.nothingToWater":{ en: "Nothing needs watering", ru: "Поливать нечего", he: "אין מה להשקות" },

    // Lobby greeting
    "lobby.welcomeBack":    { en: "Welcome back, {name}.", ru: "С возвращением, {name}.", he: "ברוכים השבים, {name}." },
    "lobby.welcome":        { en: "Welcome.",             ru: "Добро пожаловать.", he: "ברוכים הבאים." },

    // Screen titles that had no data-i18n at all
    "ui.screen.mastery":    { en: "Mastery Exam",        ru: "Экзамен на освоение", he: "מבחן שליטה" },
    "ui.screen.review":     { en: "Review",              ru: "Повторение", he: "חזרה" },

    // Landing features. Each one is a claim a visitor can check inside
    // the app, so each is worded to be exactly true:
    //   feat1 — every one of the 171 chunks has explain, example and quiz.
    //           NOT "guess first": predict is on 57% of topics, not all.
    //   feat2 — SM-2 spacing. "Just before you forget" overclaims; a
    //           schedule built on the forgetting curve is what it is.
    //   feat3 — a plant's stage IS its review interval (garden/garden.js).
    "ui.landing.feat1":     { en: "Every lesson: read it, see it worked, prove it",
                              ru: "Каждый урок: прочитать, увидеть на примере, доказать", he: "כל שיעור: לקרוא, לראות דוגמה, להוכיח" },
    "ui.landing.feat2":     { en: "Reviews timed to the forgetting curve",
                              ru: "Повторения по кривой забывания", he: "חזרות לפי עקומת השכחה" },
    "ui.landing.feat3":     { en: "A garden that grows from what you remember",
                              ru: "Сад, который растёт из того, что вы помните", he: "גינה שצומחת ממה שאתם זוכרים" },

    // The name a brand-new profile gets before anyone types one. This is
    // SAVED data, not chrome: an existing profile keeps whatever it was
    // created with, and switching language later does not rename anybody.
    "profile.defaultName":  { en: "Student",             ru: "Ученик", he: "תלמיד/ה" },

    // Library shelves
    "track.cs":             { en: "Computer Science",   ru: "Информатика", he: "מדעי המחשב" },
    "track.science":        { en: "Sciences",           ru: "Естественные науки", he: "מדעים" },
    "track.humanities":     { en: "Humanities",         ru: "Гуманитарные науки", he: "מדעי הרוח" },
    "track.other":          { en: "Other",              ru: "Прочее", he: "אחר" },
    // ---- The Library's own words (library/library.js), moved here from
    // the code on 2026-11-23 so Russian and Hebrew get them too. A key
    // ending in "1" is the same line for a count of one (I18N.tn). ----
    "lib.unit":             { en: "Unit", ru: "Блок", he: "יחידה" },
    "lib.courseDone":       { en: "{title} complete", ru: "Курс «{title}» пройден", he: "הקורס \"{title}\" הושלם" },
    "lib.notOpen":          { en: "A placeholder — this course was never written.", ru: "Муляж — этот курс так и не написан.", he: "לתצוגה בלבד — הקורס הזה לא נכתב." },
    "lib.costs":            { en: "Costs 🪙 {n} — click to view & buy.", ru: "Стоит 🪙 {n} — нажмите, чтобы посмотреть и купить.", he: "עולה 🪙 {n} — לחצו כדי לראות ולקנות." },
    "lib.units":            { en: "{n} units", ru: "блоков: {n}", he: "{n} יחידות" },
    "lib.units1":           { en: "1 unit", ru: "блоков: 1", he: "יחידה אחת" },
    "lib.topics":           { en: "{n} topics", ru: "тем: {n}", he: "{n} נושאים" },
    "lib.topics1":          { en: "1 topic", ru: "тем: 1", he: "נושא אחד" },
    "lib.pctDone":          { en: "{n}% complete", ru: "пройдено {n}%", he: "{n}% הושלמו" },
    "lib.buildDeck":        { en: "Build a Custom Deck", ru: "Собрать свою колоду", he: "לבנות חפיסה משלכם" },
    "lib.finalQuiz":        { en: "Final Quiz", ru: "Итоговый тест", he: "מבחן מסכם" },
    "lib.fqLocked":         { en: "Locked — finish every unit first", ru: "Закрыто — сначала пройдите все блоки", he: "נעול — קודם סיימו את כל היחידות" },
    "lib.fqBest":           { en: "Best: {n}%", ru: "Лучший результат: {n}%", he: "התוצאה הטובה ביותר: {n}%" },
    "lib.fqPassed":         { en: "passed", ru: "сдан", he: "עברתם" },
    "lib.fqReady":          { en: "All units complete — ready when you are", ru: "Все блоки пройдены — начинайте, когда будете готовы", he: "כל היחידות הושלמו — מתחילים כשתהיו מוכנים" },
    "lib.lockedAfter":      { en: "Locked — finish “{title}” first.", ru: "Закрыто — сначала пройдите «{title}».", he: "נעול — קודם סיימו את \"{title}\"." },
    "lib.unitDesc":         { en: "{n} topics across {m} modules.", ru: "Тем: {n}, модулей: {m}.", he: "{n} נושאים ב־{m} מודולים." },
    "lib.unitDesc1":        { en: "{n} topics in one module.", ru: "Тем: {n}, модуль один.", he: "{n} נושאים במודול אחד." },
    "lib.doneOf":           { en: "{done}/{total} mastered", ru: "освоено {done}/{total}", he: "{done}/{total} נלמדו" },
    "lib.badgeMastered":    { en: "Mastered", ru: "Освоено", he: "שליטה מלאה" },
    "lib.badgeLocked":      { en: "Locked", ru: "Закрыто", he: "נעול" },
    "lib.titleLocked":      { en: "{title} — locked", ru: "{title} — закрыто", he: "{title} — נעול" },
    "lib.topicCards":       { en: "Flashcards for this topic", ru: "Карточки по этой теме", he: "כרטיסיות לנושא הזה" },
    "lib.chunks":           { en: "{n} chunks", ru: "блоков: {n}", he: "{n} חלקים" },
    "lib.chunks1":          { en: "1 chunk", ru: "блоков: 1", he: "חלק אחד" },
    "lib.examQ":            { en: "{n}-q exam", ru: "экзамен: {n} вопр.", he: "מבחן של {n} שאלות" },
    "lib.dueNow":           { en: "Due now", ru: "Пора повторить", he: "הגיע זמן לחזור" },
    "lib.reviewIn":         { en: "Review in {n}d", ru: "Повтор через {n} дн.", he: "חזרה בעוד {n} ימים" },
    "lib.reviewIn1":        { en: "Review in 1d", ru: "Повтор завтра", he: "חזרה מחר" },
    "lib.recommended":      { en: "→ Recommended next", ru: "→ Рекомендуем дальше", he: "← מומלץ להמשך" },
    "lib.chunkN":           { en: "Chunk {n}", ru: "Блок {n}", he: "חלק {n}" },
    "lib.holdThought":      { en: "Hold that thought — read on and see.", ru: "Запомните эту мысль — читайте дальше и увидите.", he: "שמרו את המחשבה הזאת — המשיכו לקרוא ותראו." },
    "lib.multFor":          { en: "(×{mult} for {pct}%)", ru: "(×{mult} за {pct}%)", he: "(×{mult} על {pct}%)" },
    "lib.backToLibrary":    { en: "Back to Library", ru: "В библиотеку", he: "חזרה לספרייה" },
    "lib.fqPassedTitle":    { en: "Final Quiz Passed!", ru: "Итоговый тест сдан!", he: "עברתם את המבחן המסכם!" },
    "lib.fqRetry":          { en: "Retry Final Quiz", ru: "Пересдать итоговый тест", he: "לנסות שוב את המבחן המסכם" },
    "lib.fqDescPass":       { en: "You scored {correct}/{total} across all 8 units — that's a genuine cumulative pass, not just one topic.", ru: "Вы набрали {correct}/{total} по всем 8 блокам — это настоящий итоговый зачёт, а не одна тема.", he: "קיבלתם {correct}/{total} בכל 8 היחידות — זה מעבר מסכם אמיתי, לא רק נושא אחד." },
    "lib.fqDescFail":       { en: "You scored {correct}/{total}. 80% passes. Nothing here is graded against you — retry whenever you're ready.", ru: "Вы набрали {correct}/{total}. Для зачёта нужно 80%. Здесь ничего не идёт вам в минус — пересдавайте, когда будете готовы.", he: "קיבלתם {correct}/{total}. כדי לעבור צריך 80%. שום דבר כאן לא נזקף לחובתכם — נסו שוב כשתהיו מוכנים." },
    "lib.noXpFast":         { en: "No XP this time — that finished too fast for a genuine read.", ru: "В этот раз без XP — слишком быстро для настоящего прочтения.", he: "הפעם בלי XP — זה נגמר מהר מדי בשביל קריאה אמיתית." },
    "lib.noXpCap":          { en: "No XP this time — today's Final Quiz XP cap is used up.", ru: "В этот раз без XP — дневной лимит XP за итоговый тест исчерпан.", he: "הפעם בלי XP — מכסת ה־XP היומית של המבחן המסכם נוצלה." },
    "lib.fqFirst":          { en: "first Final Quiz pass", ru: "первая сдача итогового теста", he: "מעבר ראשון במבחן המסכם" },
    "lib.cardsLocked":      { en: "Flashcards are built from {title}'s content — unlock the course to start reviewing.", ru: "Карточки собираются из материала курса «{title}» — откройте курс, чтобы начать повторение.", he: "הכרטיסיות נבנות מהתוכן של \"{title}\" — פתחו את הקורס כדי להתחיל לחזור." },
    "lib.viewBuy":          { en: "View & buy — 🪙 {n}", ru: "Посмотреть и купить — 🪙 {n}", he: "לצפייה ולרכישה — 🪙 {n}" },
    "deck.intro":           { en: "Pick units and chunks to build a review deck. Weakest cards come up first.", ru: "Отметьте блоки и их части, чтобы собрать колоду для повторения. Самые слабые карточки идут первыми.", he: "בחרו יחידות וחלקים כדי לבנות חפיסה לחזרה. הכרטיסים החלשים ביותר עולים ראשונים." },
    "deck.modeQuiz":        { en: "Quiz cards", ru: "Карточки-вопросы", he: "כרטיסי שאלות" },
    "deck.modeDefs":        { en: "Definitions", ru: "Определения", he: "הגדרות" },
    "deck.defsNote":        { en: "Term on the front, a short definition on the back — no options, no explanation. Minimalistic, for quick recall drilling.", ru: "Термин на лицевой стороне, короткое определение на обороте — без вариантов и без объяснений. Минимум, чтобы быстро вспоминать.", he: "המונח מלפנים, הגדרה קצרה מאחור — בלי אפשרויות ובלי הסבר. מינימליסטי, לתרגול שליפה מהיר." },
    "deck.filterConf":      { en: "Filter by confidence:", ru: "Фильтр по уверенности:", he: "סינון לפי ביטחון:" },
    "deck.unitLocked":      { en: "Locked — finish the previous unit first.", ru: "Закрыто — сначала пройдите предыдущий блок.", he: "נעול — קודם סיימו את היחידה הקודמת." },
    "deck.clear":           { en: "Clear", ru: "Снять", he: "ניקוי" },
    "deck.all":             { en: "All", ru: "Все", he: "הכול" },
    "deck.terms":           { en: "{n} terms", ru: "терминов: {n}", he: "{n} מונחים" },
    "deck.terms1":          { en: "1 term", ru: "терминов: 1", he: "מונח אחד" },
    "deck.new":             { en: "new", ru: "новое", he: "חדש" },
    "deck.noDefs":          { en: "No definitions written for the selected units yet.", ru: "Для выбранных блоков определений пока нет.", he: "עדיין אין הגדרות ליחידות שנבחרו." },
    "deck.noQuiz":          { en: "No quiz-backed chunks in the selected units.", ru: "В выбранных блоках нет частей с вопросами.", he: "אין ביחידות שנבחרו חלקים עם שאלות." },
    "deck.start":           { en: "Start Review ({n} cards)", ru: "Начать повторение (карточек: {n})", he: "להתחיל חזרה ({n} כרטיסים)" },
    "deck.start1":          { en: "Start Review (1 card)", ru: "Начать повторение (карточек: 1)", he: "להתחיל חזרה (כרטיס אחד)" },
    "fc.watered":           { en: "Watered!", ru: "Полито!", he: "השקיתם!" },
    "fc.thirsty":           { en: "Still Thirsty", ru: "Всё ещё хочет пить", he: "עדיין צמא" },
    "fc.again":             { en: "Review Again", ru: "Повторить ещё раз", he: "לחזור שוב" },
    "fc.descPass":          { en: "You knew {known}/{total} on \"{title}\". Back for review {timing} — that's when it does the most good.", ru: "Вы знали {known}/{total} по теме «{title}». Она вернётся на повторение {timing} — тогда от этого больше всего пользы.", he: "ידעתם {known}/{total} בנושא \"{title}\". הוא יחזור לחזרה {timing} — בדיוק כשזה מועיל הכי הרבה." },
    "fc.descFail":          { en: "You knew {known}/{total} — below the 80% that keeps it growing. \"{title}\" comes back for review {timing}.", ru: "Вы знали {known}/{total} — ниже 80%, при которых растение растёт. «{title}» вернётся на повторение {timing}.", he: "ידעתם {known}/{total} — פחות מ־80%, שהם מה שמשאיר אותו גדל. \"{title}\" יחזור לחזרה {timing}." },
    "fc.rushed":            { en: "{n} cards answered too fast to count toward XP.", ru: "Слишком быстрых ответов, не засчитанных в XP: {n}.", he: "{n} כרטיסים נענו מהר מדי מכדי להיחשב ל־XP." },
    "fc.rushed1":           { en: "1 card answered too fast to count toward XP.", ru: "Слишком быстрых ответов, не засчитанных в XP: 1.", he: "כרטיס אחד נענה מהר מדי מכדי להיחשב ל־XP." },
    "fc.backToDeck":        { en: "Back to Deck Builder", ru: "К сборке колоды", he: "חזרה לבניית החפיסה" },
    "fc.deckCleared":       { en: "Deck Cleared!", ru: "Колода пройдена!", he: "סיימתם את החפיסה!" },
    "fc.goodRep":           { en: "Good Rep", ru: "Хороший подход", he: "אימון טוב" },
    "fc.deckDesc":          { en: "You knew {known}/{total} on this custom deck.", ru: "Вы знали {known}/{total} в этой колоде.", he: "ידעתם {known}/{total} בחפיסה הזאת." },
    // ---- The screens behind the lobby tiles (HUD, lobby, Career, Shop,
    // Custom, Garden, profile), moved here from the code on 2026-11-23. ----
    "hud.rankAria":         { en: "Show rank progress", ru: "Показать прогресс звания", he: "הצגת ההתקדמות בדרגה" },
    "hud.streakAria":       { en: "Show streak detail", ru: "Показать серию", he: "הצגת פרטי הרצף" },
    "hud.streakDays":       { en: "{n}-day streak", ru: "Дней подряд: {n}", he: "רצף של {n} ימים" },
    "hud.streakDays1":      { en: "1-day streak", ru: "Дней подряд: 1", he: "רצף של יום אחד" },
    "hud.freezes":          { en: "{n} freezes left this week", ru: "Заморозок на этой неделе: {n}", he: "נשארו {n} הקפאות השבוע" },
    "hud.freezes1":         { en: "1 freeze left this week", ru: "Заморозок на этой неделе: 1", he: "נשארה הקפאה אחת השבוע" },
    "hud.freezeNote":       { en: "Freezes cover a missed day automatically — up to {n} in a row before it resets.", ru: "Заморозка сама закрывает пропущенный день — до {n} подряд, потом серия обнуляется.", he: "הקפאה מכסה אוטומטית יום שפספסתם — עד {n} ברצף, ואז הרצף מתאפס." },
    "hud.moneyTip":         { en: "Reputation, earned in the Garden. Spent on other people's Forum posts — never on your own.", ru: "Репутация, её приносит Сад. Тратится на чужие посты на форуме — никогда на свои.", he: "מוניטין, שמרוויחים בגינה. מוציאים אותו על פוסטים של אחרים בפורום — אף פעם לא על שלכם." },
    "hud.tokenTip":         { en: "Earned free from rank-ups, or bought in the Token Shop. Spent to unlock courses.", ru: "Даются бесплатно за новые звания или покупаются в магазине токенов. Тратятся на открытие курсов.", he: "מקבלים אותם בחינם כשעולים בדרגה, או קונים בחנות האסימונים. משתמשים בהם כדי לפתוח קורסים." },
    "hud.toNight":          { en: "Switch to night", ru: "Включить ночь", he: "מעבר ללילה" },
    "hud.toDay":            { en: "Switch to day", ru: "Включить день", he: "מעבר ליום" },
    "hud.streakToast":      { en: "{n}-day streak!", ru: "Дней подряд: {n}!", he: "רצף של {n} ימים!" },
    "hud.streakToast1":     { en: "1-day streak!", ru: "Дней подряд: 1!", he: "רצף של יום אחד!" },
    "hud.saveFailTitle":    { en: "Progress isn't saving.", ru: "Прогресс не сохраняется.", he: "ההתקדמות לא נשמרת." },
    "hud.saveFailBody":     { en: "Device storage is full or unavailable — recent work may be lost. Free up space, then reload.", ru: "Память устройства заполнена или недоступна — последние изменения могут пропасть. Освободите место и перезагрузите страницу.", he: "האחסון במכשיר מלא או לא זמין — ייתכן שהעבודה האחרונה תאבד. פנו מקום ואז טענו את הדף מחדש." },
    "hud.tokensN":          { en: "{n} Tokens", ru: "Токенов: {n}", he: "{n} אסימונים" },
    "hud.tokensN1":         { en: "1 Token", ru: "Токенов: 1", he: "אסימון אחד" },
    "ui.dismiss":           { en: "Dismiss", ru: "Закрыть", he: "סגירה" },
    "ui.prev":              { en: "Previous", ru: "Назад", he: "הקודם" },
    "lobby.resumeSub":      { en: "{icon} {title} — chunk {n}", ru: "{icon} {title} — блок {n}", he: "{icon} {title} — חלק {n}" },
    "lobby.resumeAria":     { en: "Continue", ru: "Продолжить", he: "להמשיך" },
    "lobby.spinAria":       { en: "Spin the star layout", ru: "Повернуть звезду", he: "סיבוב הכוכב" },
    "lobby.fewerSparks":    { en: "Fewer sparks", ru: "Меньше искр", he: "פחות ניצוצות" },
    "lobby.moreSparks":     { en: "More sparks", ru: "Больше искр", he: "יותר ניצוצות" },
    "ui.title.shop":        { en: "The <span class=\"accent\">Shop</span>", ru: "<span class=\"accent\">Магазин</span>", he: "<span class=\"accent\">החנות</span>" },
    "ui.title.custom":      { en: "Your <span class=\"accent\">Custom</span>", ru: "<span class=\"accent\">Кастом</span>", he: "<span class=\"accent\">התאמה אישית</span>" },
    "career.total":         { en: "{xp} XP total", ru: "Всего {xp} XP", he: "סך הכול {xp} XP" },
    "career.toGo":          { en: "{n} to {next}", ru: "ещё {n} до «{next}»", he: "עוד {n} עד {next}" },
    "career.top":           { en: "top of the ladder", ru: "вершина лестницы", he: "בראש הסולם" },
    "career.hint":          { en: "XP comes from finishing chunks and passing exams, and is never spent. Rewards arrive when you reach the rank — there is nothing to buy. Themes and background stripes are equipped from Custom once they're unlocked.", ru: "XP дают за пройденные блоки и сданные экзамены, и он никогда не тратится. Награды приходят, когда вы достигаете звания, — покупать ничего не нужно. Темы и фоновые узоры надеваются в «Кастоме», как только откроются.", he: "XP מקבלים על סיום חלקים ועל מעבר מבחנים, והוא אף פעם לא נגמר. הפרסים מגיעים כשמגיעים לדרגה — אין מה לקנות. ערכות צבעים ופסי רקע מפעילים מתוך ההתאמה האישית, ברגע שהם נפתחים." },
    "career.ranks":         { en: "Ranks", ru: "Звания", he: "דרגות" },
    "store.tokens":         { en: "Tokens", ru: "Токены", he: "אסימונים" },
    "store.support":        { en: "Support", ru: "Поддержка", he: "תמיכה" },
    "tok.packs":            { en: "Token packs", ru: "Наборы токенов", he: "חבילות אסימונים" },
    "tok.demoNote":         { en: "Buying is a DEMO — packs credit instantly, no real payment happens yet.", ru: "Покупка здесь — ДЕМО: набор зачисляется сразу, настоящей оплаты пока нет.", he: "הקנייה כאן היא דמו — החבילה נזקפת מיד, ואין עדיין תשלום אמיתי." },
    "tok.bonus":            { en: "{n}% more per $ than the smallest pack", ru: "на {n}% больше за каждый $, чем в самом маленьком наборе", he: "{n}% יותר על כל $ מאשר בחבילה הקטנה ביותר" },
    "tok.demoBuy":          { en: "Demo purchase — no real payment", ru: "Демо-покупка — без настоящей оплаты", he: "קנייה לדוגמה — בלי תשלום אמיתי" },
    "tok.demo":             { en: "demo", ru: "демо", he: "דמו" },
    "tok.supportTitle":     { en: "Support Knell", ru: "Поддержать Knell", he: "לתמוך ב־Knell" },
    "tok.supportBody":      { en: "Not a subscription and not a paywall — closer to a whip-round. Knell is priced to be genuinely affordable, and supporters are what keeps it that way for people who can't pay. <strong>Every tier makes courses permanently cheaper for you too</strong> — −10% / −20% / −30% off every course price, applied wherever it's shown and charged. Plus a star by your name and an XP boost. No real billing yet; a tier can only go up.", ru: "Не подписка и не платный барьер — скорее сбор в складчину. Knell задуман по-настоящему доступным, и именно сторонники сохраняют его таким для тех, кто не может платить. <strong>Каждый уровень ещё и навсегда удешевляет курсы для вас</strong> — −10% / −20% / −30% от цены любого курса, везде, где она показана и списывается. Плюс звезда у имени и прибавка к XP. Настоящих списаний пока нет; уровень можно только повысить.", he: "לא מנוי ולא חומת תשלום — יותר כמו מגבית קטנה. Knell מתומחר כך שיהיה באמת נגיש, והתומכים הם מה ששומר עליו כזה בשביל מי שלא יכול לשלם. <strong>כל רמה גם מוזילה לכם את הקורסים לתמיד</strong> — \u2066−10% / −20% / −30%\u2069 מכל מחיר של קורס, בכל מקום שבו הוא מוצג ונגבה. ובנוסף כוכב ליד השם ותוספת XP. עדיין אין חיוב אמיתי; אפשר רק לעלות ברמה." },
    "tok.yourDiscount":     { en: "Your discount: −{n}% on every course.", ru: "Ваша скидка: −{n}% на каждый курс.", he: "ההנחה שלכם: \u2066−{n}%\u2069 על כל קורס." },
    "tok.coursesOff":       { en: "−{n}% courses", ru: "−{n}% на курсы", he: "\u2066−{n}%\u2069 על קורסים" },
    "tok.current":          { en: "Current tier", ru: "Текущий уровень", he: "הרמה הנוכחית" },
    "tok.choose":           { en: "Choose (demo)", ru: "Выбрать (демо)", he: "לבחור (דמו)" },
    "profile.patronThanks": { en: "{tier} — thank you for supporting Knell", ru: "{tier} — спасибо, что поддерживаете Knell", he: "{tier} — תודה שאתם תומכים ב־Knell" },
    "inv.rankN":            { en: "Rank {n}", ru: "Звание {n}", he: "דרגה {n}" },
    "inv.lockedReach":      { en: "Locked — reach {req}", ru: "Закрыто — достигните: {req}", he: "נעול — הגיעו אל {req}" },
    "inv.lockedPrice":      { en: "Locked — {n} in the Shop", ru: "Закрыто — {n} в магазине", he: "נעול — {n} בחנות" },
    "inv.unlocked":         { en: "{n} unlocked", ru: "открыто: {n}", he: "{n} פתוחים" },
    "inv.shop":             { en: "Shop", ru: "Магазин", he: "חנות" },
    "inv.on":               { en: "on", ru: "включено", he: "פעיל" },
    "inv.equipped":         { en: "equipped", ru: "надето", he: "בשימוש" },
    "inv.previewAria":      { en: "Live lobby preview", ru: "Живой предпросмотр лобби", he: "תצוגה חיה של הלובי" },
    "inv.previewing":       { en: "Previewing \"{name}\" — not yours", ru: "Предпросмотр «{name}» — пока не ваше", he: "תצוגה מקדימה של \"{name}\" — עוד לא שלכם" },
    "inv.reach":            { en: "Reach {req}", ru: "Достигните: {req}", he: "הגיעו אל {req}" },
    "inv.buy":              { en: "Buy — ${n}", ru: "Купить — ${n}", he: "לקנייה — ${n}" },
    "inv.restore":          { en: "Restore", ru: "Вернуть", he: "שחזור" },
    "garden.needWater":     { en: "{n} plants need watering", ru: "Нужно полить растений: {n}", he: "{n} צמחים צריכים השקיה" },
    "garden.needWater1":    { en: "1 plant needs watering", ru: "Нужно полить растений: 1", he: "צמח אחד צריך השקיה" },
    "garden.more":          { en: "+{n} more", ru: "ещё {n}", he: "ועוד {n}" },
    "garden.plantedOf":     { en: "{n}/{of} planted", ru: "посажено {n}/{of}", he: "{n}/{of} נשתלו" },
    "garden.dueLower":      { en: "due for review", ru: "пора повторить", he: "הגיע זמן לחזור" },
    "stats.tapPin":         { en: "tap to pin to your name", ru: "нажмите, чтобы закрепить у имени", he: "הקישו כדי להצמיד ליד השם שלכם" },
    "stats.tapUnpin":       { en: "tap to unpin", ru: "нажмите, чтобы открепить", he: "הקישו כדי לבטל את ההצמדה" },
    "stats.badgeNote":      { en: "Earned from real progress — nothing here is handed out for just opening the app. Tap an earned badge to pin it next to your name (up to 3).", ru: "Зарабатываются настоящим прогрессом — за одно открытие приложения здесь ничего не дают. Нажмите на полученный значок, чтобы закрепить его у имени (до 3).", he: "מרוויחים אותם מהתקדמות אמיתית — שום דבר כאן לא ניתן רק על פתיחת האפליקציה. הקישו על תג שהרווחתם כדי להצמיד אותו ליד השם שלכם (עד 3)." },
    "stats.attempts":       { en: "{n} attempts", ru: "попыток: {n}", he: "{n} ניסיונות" },
    "stats.attempts1":      { en: "1 attempt", ru: "попыток: 1", he: "ניסיון אחד" },
    "stats.notReviewed":    { en: "Not yet reviewed", ru: "Ещё не повторяли", he: "עוד לא חזרתם עליהם" },
    "stats.allCourses":     { en: "All courses", ru: "Все курсы", he: "כל הקורסים" },
    "stats.summary":        { en: "{done}/{total} topics mastered · {pct}%", ru: "освоено тем: {done}/{total} · {pct}%", he: "{done}/{total} נושאים נלמדו · {pct}%" },
    "stats.dueN":           { en: "{n} topics due for review", ru: "Пора повторить тем: {n}", he: "{n} נושאים ממתינים לחזרה" },
    "stats.dueN1":          { en: "1 topic due for review", ru: "Пора повторить тем: 1", he: "נושא אחד ממתין לחזרה" },
    "stats.importOk":       { en: "Data imported successfully!", ru: "Данные импортированы!", he: "הנתונים יובאו בהצלחה!" },
    "stats.importFail":     { en: "Import failed: {msg}", ru: "Импорт не удался: {msg}", he: "הייבוא נכשל: {msg}" },
    "ui.warn.descN":        { en: "You have received {n} warnings from a moderator.", ru: "Модератор вынес вам предупреждений: {n}.", he: "קיבלתם {n} אזהרות ממנהל." },
    "set.readFail":         { en: "Could not read that file.", ru: "Не удалось прочитать этот файл.", he: "לא הצלחנו לקרוא את הקובץ הזה." },
    // Import errors (data/db.js), shown in an alert.
    "db.badFile":           { en: "Invalid database file — no profiles found.", ru: "Неверный файл базы — профилей в нём нет.", he: "קובץ נתונים לא תקין — לא נמצאו בו פרופילים." },
    "db.noProfiles":        { en: "That backup contains no profiles.", ru: "В этой резервной копии нет профилей.", he: "בגיבוי הזה אין פרופילים." },
    "db.newer":             { en: "That backup is from a newer version (v{v}); this build understands up to v{max}.", ru: "Эта копия из более новой версии (v{v}); эта сборка понимает только до v{max}.", he: "הגיבוי הזה מגרסה חדשה יותר (v{v}); הגרסה הזאת מבינה רק עד v{max}." },
    "db.readFail":          { en: "Failed to read file", ru: "Не удалось прочитать файл", he: "לא הצלחנו לקרוא את הקובץ" }
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
  // While a lesson, exam or flashcard deck of an English-only course is on
  // screen in the Hebrew app, its own words follow the material, not the
  // app ("убери иврит с курса", 2026-11-24): library.js sets this, and
  // core.js's showScreen clears it on the way out of those screens.
  let contentLang = null;
  function t(key, vars) {
    const s = STRINGS[key];
    if (!s) { console.warn(`[I18N] no string for "${key}"`); return key; }
    const out = s[contentLang || lang] || s[FALLBACK] || key;
    if (!vars) return out;
    return out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  }

  // Real lang attribute, not decoration: it drives hyphenation, the
  // right quotation marks, spellcheck in the recall textarea, and what
  // a screen reader's voice sounds like reading a Russian paragraph.
  document.documentElement.lang = lang;
  // Direction follows the language: Hebrew lays the whole page out right
  // to left. Numbers, code and the isometric scenes keep their own
  // direction (styles/base.css says how).
  document.documentElement.dir = RTL.includes(lang) ? "rtl" : "ltr";

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
    // A heading whose words are styled in two parts ("The <span>Shop</span>")
    // takes the whole line from one key, markup and all. Only our own
    // strings go through here, never anything a user typed.
    scope.querySelectorAll("[data-i18n-html]").forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    // Hover text and the names a screen reader announces.
    scope.querySelectorAll("[data-i18n-title]").forEach(el => {
      el.setAttribute("title", t(el.dataset.i18nTitle));
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach(el => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
  }
  applyStatic();

  mountLangs();

  return {
    langs: () => LANGS.slice(),
    lang: () => lang,
    set, resolve, t, applyStatic, choose,
    // A count: the "key1" line when n is 1 and the key has one (English
    // and Hebrew say "1 unit", "יחידה אחת"), the key itself otherwise.
    // Russian lines dodge their three forms ("блоков: {n}"), as above.
    tn: (key, n, vars) => t(n === 1 && STRINGS[key + "1"] ? key + "1" : key, Object.assign({ n }, vars)),
    // Exposed for the toggle's own label, which must name the language
    // you'd be switching TO, in that language — "Русский", not "Russian".
    nativeName: l => ({ en: "English", ru: "Русский", he: "עברית" })[l] || l,
    isRtl: () => RTL.includes(lang),
    setContentLang: l => { contentLang = LANGS.includes(l) ? l : null; },
    // Answer options are lettered in the reader's alphabet: A-F, or
    // alef to vav in Hebrew. letter(i) for one, letters() for the set.
    letter: i => (RTL.includes(lang) ? "אבגדהו" : "ABCDEF")[i],
    letters: () => [...(RTL.includes(lang) ? "אבגדהו" : "ABCDEF")]
  };
})();
