// ================================================
// Knell — MUSEUM  (shown in the demo only)
// ------------------------------------------------
// How Knell works, and what it has built and set aside.
//
// The demo has no Forum. It needs a server the demo does not have, so
// tools/make-demo.js leaves forum/ out of the copy, and the Forum's
// lobby tile opens this screen instead (wired in core/boot.js). It is
// the same tile, with the same id, rather than a new one, because two
// of the Star looks count tiles exactly (core/lobby.js, RING_TRIM):
// one tile fewer and the Star of David turns back into spokes, while
// the pentagram is drawn lopsided.
//
// Halls of exhibits, each exhibit a card that opens on a tap, so the
// screen is a list of titles until something is chosen. Asked for on
// 2026-11-22: retired looks kept instead of deleted, and plain words on
// how the courses, memory, flashcards and accounts work, for anyone
// who opens this, an employer included. A retired scene runs live: a
// scene is a recipe, and the engine still draws old ones.
//
// A card stays short; its "Read more" holds the longer version (asked
// 2026-11-23: the written walk-through, docs/HOW-IT-WORKS.md, brought
// into the halls in both languages, «а»: short cards, depth on demand).
// The last line of a "Read more" names the files, for whoever wants to
// look at the code.
//
// The history hall and the Arcade show pictures of old versions (asked
// 2026-11-23: halls by date, «добавь эти аркады в музей»). Old versions
// cannot run here: they write the real app's storage keys on the shared
// isk1zz.github.io origin. So each was exported from git and run locally,
// on an address of its own, only to be photographed. Pictures load the
// first time their card opens, so a visitor who never opens one never
// downloads it.
//
// Every claim here was checked against the code and docs/SHOWCASE.md
// on the day it was written. If the app changes, these change with it.
//
// In the real app nothing routes here, and the Forum keeps its tile.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;

  const INTRO = {
    en: "How Knell works, and what it has built and set aside. Over each hall is a small scene: tap a numbered pin and the runner goes to that exhibit and opens its card. Or tap a card itself; “Read more” inside goes deeper.",
    ru: "Как устроен Knell и что в нём построено и отложено. Над каждым залом — маленькая сцена: нажмите на метку с номером, и человечек добежит до экспоната и откроет его карточку. Или нажмите на саму карточку; «Подробнее» внутри — глубже.", he: "איך Knell עובד, מה נבנה בו ומה הונח בצד. מעל כל אולם יש סצנה קטנה: געו בסיכה עם מספר, והדמות תרוץ אל המוצג ותפתח את הכרטיס שלו. או געו בכרטיס עצמו; \"לקריאה נוספת\" שבתוכו מעמיק יותר."
  };
  const MORE = { en: "Read more", ru: "Подробнее", he: "לקריאה נוספת" };
  const CLOSE = { en: "Close", ru: "Закрыть", he: "סגירה" };
  const IN_CODE = { en: "In the code:", ru: "В коде:", he: "בקוד:" };

  // A hall is a title and its exhibits. An exhibit is an icon, a title
  // and paragraphs; `images` are pictures with captions, `more` is its
  // "Read more" (paragraphs, or { list } for a list), `code` the files it
  // lives in, `scene` runs a scene inside it, and `action` adds a button
  // (the letter, the rank guide).
  // A picture: its file, its caption (a language bag), and its size in pixels, so the page
  // keeps its place while the picture loads. Full screenshots are 775 by
  // 517; the Arcade's are cropped to the game.
  const shot = (src, caption, w = 775, h = 517) => ({ src, caption, w, h });
  // The feedback card's address, put together from two halves so that a
  // script combing the source for addresses does not find it whole.
  const MAIL = ["reveralrise", "gmail.com"].join("@");
  const HALLS = [
    {
      title: { en: "How it works", ru: "Как это устроено", he: "איך זה עובד" },
      scene: "museum-how",
      exhibits: [
        {
          icon: "\u{1F4A1}", title: { en: "The one idea", ru: "Главная идея", he: "הרעיון האחד" },
          body: [
            { en: "Knowing something is not having passed it once. It is still having it a month later. Knell measures that, and does not count the rest.",
              ru: "Знать — это не сдать однажды, а помнить через месяц. Knell измеряет именно это и не засчитывает остальное.", he: "לדעת משהו זה לא לעבור אותו פעם אחת. זה לזכור אותו גם אחרי חודש. Knell מודד את זה, ולא סופר את השאר." }
          ],
          more: [
            { en: "Progress here is not how many topics you finished. It is how long each topic stays in your memory before it needs a refresh: its review interval.",
              ru: "Прогресс здесь — не число пройденных тем, а то, как долго каждая тема держится в памяти, прежде чем её нужно освежить: промежуток до повторения.", he: "ההתקדמות כאן היא לא כמה נושאים סיימתם, אלא כמה זמן כל נושא נשאר בזיכרון לפני שצריך לרענן אותו: מרווח החזרה שלו." },
            { en: "So the Garden pictures those intervals, and almost nothing is offered for rereading. In the research, rereading is one of the weakest ways to study, and being asked is one of the strongest.",
              ru: "Поэтому Сад рисует именно эти промежутки, а перечитывать почти ничего не предлагается. В исследованиях перечитывание — один из самых слабых способов учиться, а ответ на вопрос — один из самых сильных.", he: "לכן הגינה מציירת את המרווחים האלה, וכמעט שום דבר לא מוצע לקריאה חוזרת. במחקר, קריאה חוזרת היא אחת הדרכים החלשות ביותר ללמוד, ומענה על שאלה — אחת החזקות ביותר." },
            { en: "The path of a topic: read it, pass its exam, then review it further and further apart. A sprout appears when you pass, and the plant grows with the interval.",
              ru: "Путь темы: прочитать, сдать экзамен и повторять всё реже. Росток появляется после сдачи, а растение растёт вместе с промежутком.", he: "הדרך של נושא: לקרוא אותו, לעבור את המבחן שלו, ואז לחזור עליו במרווחים הולכים וגדלים. כשעוברים, מופיע נבט, והצמח גדל יחד עם המרווח." }
          ],
          code: "docs/HOW-IT-WORKS.md"
        },
        {
          icon: "\u{1F4DA}", title: { en: "Courses", ru: "Курсы", he: "קורסים" },
          body: [
            { en: "A course is made of units, a unit of topics, and a topic is taught in chunks.",
              ru: "Курс состоит из блоков, блок — из тем, а тема преподаётся частями.", he: "קורס בנוי מיחידות, יחידה מנושאים, ונושא נלמד בחלקים." },
            { en: "Each chunk explains one idea, shows a worked example and asks a question. A question you miss comes back before the exam, with its options in a new order.",
              ru: "Каждая часть объясняет одну идею, показывает разобранный пример и задаёт вопрос. Вопрос, на который вы ошиблись, вернётся перед экзаменом, с вариантами в новом порядке.", he: "כל חלק מסביר רעיון אחד, מראה דוגמה פתורה ושואל שאלה. שאלה שטעיתם בה חוזרת לפני המבחן, עם האפשרויות בסדר חדש." },
            { en: "A topic ends in a five-question exam, and four right passes it. Fail it twice and the topic has to be worked through again.",
              ru: "Тема заканчивается экзаменом из пяти вопросов: четыре верных ответа — тема сдана. Провалите его дважды — тему придётся пройти заново.", he: "נושא מסתיים במבחן של חמש שאלות, וארבע נכונות מספיקות כדי לעבור. נכשלים פעמיים — ועוברים על הנושא מחדש." }
          ],
          more: [
            { en: "A chunk runs in up to five steps, and the order matters:",
              ru: "Часть идёт в пять шагов, и порядок важен:", he: "חלק עובר עד חמישה שלבים, והסדר חשוב:" },
            { list: [
              { en: "Predict: a question before any explanation, never scored. Even a wrong guess helps you remember what follows.",
                ru: "Прогноз: вопрос до всякого объяснения, без оценки. Даже неверная догадка помогает запомнить то, что будет дальше.", he: "ניבוי: שאלה לפני כל הסבר, בלי ציון. גם ניחוש שגוי עוזר לזכור את מה שבא אחריו." },
              { en: "Explain: the idea in short blocks with headings, and two cited sources.",
                ru: "Объяснение: идея короткими блоками с подзаголовками и двумя источниками.", he: "הסבר: הרעיון בקטעים קצרים עם כותרות, ושני מקורות מצוטטים." },
              { en: "Example: a worked example, step by step.",
                ru: "Пример: разбор по шагам.", he: "דוגמה: דוגמה פתורה, צעד אחר צעד." },
              { en: "Apply: a multiple-choice question, its options reshuffled every time.",
                ru: "Применение: вопрос с вариантами, которые каждый раз перемешиваются.", he: "שאלה: שאלה אמריקאית, והאפשרויות מעורבבות מחדש בכל פעם." },
              { en: "Recall: your own answer with no options, checked against its key points. Producing an answer holds better than recognising one.",
                ru: "Воспроизведение: свой ответ без вариантов, сверка с ключевыми пунктами. Породить ответ прочнее, чем узнать его.", he: "היזכרות: תשובה משלכם בלי אפשרויות, שנבדקת מול נקודות המפתח שלה. להפיק תשובה נקלט טוב יותר מלזהות אותה." }
            ] },
            { en: "Predict opens each topic's first chunk, and recall closes every chunk. Some older Intro to CS chunks still run without one or both.",
              ru: "Прогноз открывает первую часть каждой темы, воспроизведение завершает каждую часть. В некоторых старых частях Intro to CS одного или обоих шагов пока нет.", he: "ניבוי פותח את החלק הראשון של כל נושא, והיזכרות סוגרת כל חלק. בחלק מהחלקים הישנים של Intro to CS עדיין חסר אחד מהם או שניהם." },
            { en: "Units, topics and chunks open in order. That was argued against first, because a fixed order takes away choice, and added by request, with the objection kept in the project's notes. A due review, and going back to where you stopped, are never locked.",
              ru: "Блоки, темы и части открываются по порядку. Сначала против этого были доводы — жёсткий порядок отнимает выбор, — потом его добавили по просьбе, а возражение сохранили в записях проекта. Повторение по сроку и возврат туда, где вы остановились, не запираются никогда.", he: "יחידות, נושאים וחלקים נפתחים לפי הסדר. בהתחלה היו נימוקים נגד, כי סדר קבוע לוקח את הבחירה, וזה נוסף לפי בקשה, וההתנגדות נשמרה ברשימות הפרויקט. חזרה שמועדה הגיע, והמשך מהמקום שבו עצרתם, לעולם לא ננעלים." },
            { en: "The first time you enter a course you sign an enrolment contract with the mouse. It is a joke: nothing is checked, and the drawing never leaves your browser.",
              ru: "При первом входе в курс вы подписываете мышкой договор о зачислении. Это шутка: ничего не проверяется, и подпись не покидает браузер.", he: "בפעם הראשונה שנכנסים לקורס חותמים בעכבר על חוזה הרשמה. זו בדיחה: שום דבר לא נבדק, והציור לא יוצא מהדפדפן." },
            { en: "Three courses have lessons: Intro to Computer Science (48 topics), A3 Theory — Electric Bicycle (7, built on the Israeli Ministry of Transport's question bank) and Philosophy: Cicero (3). Four more have a plan and no lessons yet.",
              ru: "Уроки есть в трёх курсах: Intro to Computer Science (48 тем), A3 Theory — Electric Bicycle (7, по банку вопросов Министерства транспорта Израиля) и Philosophy: Cicero (3). Ещё у четырёх есть план, но пока нет уроков.", he: "בשלושה קורסים יש שיעורים: Intro to Computer Science (48 נושאים), תאוריה A3 — אופניים חשמליים (7, על בסיס מאגר השאלות של משרד התחבורה) ופילוסופיה: קיקרו (3). לעוד ארבעה יש תוכנית, אבל עוד אין שיעורים." }
          ],
          code: "library/library.js, library/content/"
        },
        {
          icon: "\u{1F9E0}", title: { en: "How remembering works", ru: "Как работает запоминание", he: "איך עובד הזיכרון" },
          body: [
            { en: "Passing a topic does not finish it. It schedules a review: the first a day later, the next six days after that, and from then on each gap is the one before multiplied by an “ease” number.",
              ru: "Сданная тема не заканчивается. Для неё назначается повторение: первое через день, следующее ещё через шесть дней, а дальше каждый промежуток — это предыдущий, умноженный на число «лёгкости».", he: "מעבר נושא לא מסיים אותו. הוא קובע חזרה: הראשונה אחרי יום, הבאה שישה ימים אחר כך, ומשם כל מרווח הוא הקודם כפול מספר \"קלות\"." },
            { en: "Get a review right and the gaps keep growing. Get it wrong and the topic comes back tomorrow. You meet each thing again just before you would have forgotten it.",
              ru: "Вспомнили на повторении — промежутки растут дальше. Ошиблись — тема вернётся завтра. Так вы встречаете материал снова как раз перед тем, как забыли бы его.", he: "מצליחים בחזרה — והמרווחים ממשיכים לגדול. טועים — והנושא חוזר מחר. כך פוגשים כל דבר שוב בדיוק לפני שהייתם שוכחים אותו." },
            { en: "The schedule is SM-2, a well-known method for spaced review, with one constant changed: barely passing a review no longer counts the same as getting it perfect.",
              ru: "Расписание — это SM-2, известный метод интервальных повторений, с одной изменённой константой: еле сданное повторение больше не считается так же, как идеальное.", he: "לוח הזמנים הוא SM-2, שיטה מוכרת לחזרה מרווחת, עם קבוע אחד ששונה: חזרה שעוברים בקושי כבר לא נחשבת כמו חזרה מושלמת." }
          ],
          more: [
            { en: "The ease number starts at 2.5. A good review raises it and a shaky one lowers it, never below 1.3. Under half right counts as a lapse: back to one day, and the ease drops.",
              ru: "Лёгкость начинается с 2,5. Хорошее повторение её повышает, неуверенное — понижает, но не ниже 1,3. Меньше половины верных ответов — это срыв: снова через день, и лёгкость падает.", he: "מספר הקלות מתחיל ב־2.5. חזרה טובה מעלה אותו וחזרה רעועה מורידה אותו, אבל לא מתחת ל־1.3. פחות מחצי נכון נחשב כשל: חוזרים ליום אחד, והקלות יורדת." },
            { en: "The changed constant, in numbers: someone who barely passes every review now gets their sixth review at 153 days instead of 238, while a perfect learner stays at 393. Checked by running the real function, not by algebra.",
              ru: "Изменённая константа в цифрах: у того, кто каждое повторение сдаёт еле-еле, шестое теперь наступает через 153 дня вместо 238, а у идеального ученика остаётся 393. Проверено запуском настоящей функции, а не подсчётом на бумаге.", he: "הקבוע ששונה, במספרים: מי שעובר כל חזרה בקושי מקבל עכשיו את החזרה השישית אחרי 153 יום במקום 238, ולומד מושלם נשאר על 393. נבדק בהרצה של הפונקציה האמיתית, לא באלגברה." },
            { en: "Why SM-2 and not the newer FSRS: FSRS needs hundreds of reviews before its model fits, and a small app never gives it that many.",
              ru: "Почему SM-2, а не более новый FSRS: FSRS нужны сотни повторений, прежде чем его модель настроится, а небольшое приложение столько не даёт.", he: "למה SM-2 ולא FSRS החדש יותר: FSRS צריך מאות חזרות עד שהמודל שלו מתכוונן, ואפליקציה קטנה אף פעם לא נותנת לו כל כך הרבה." },
            { en: "Weak spots answer the question a learner really has, what to study now: your last score, minus ten for every lapsed review.",
              ru: "Слабые места отвечают на главный вопрос учащегося — что учить сейчас: последний балл минус десять за каждый срыв повторения.", he: "הנקודות החלשות עונות על השאלה האמיתית של מי שלומד — מה ללמוד עכשיו: הציון האחרון שלכם, פחות עשר על כל חזרה שנכשלה." },
            { en: "The e-bike course also has a mock exam on the real test's terms: 30 questions, 40 minutes, 26 to pass.",
              ru: "В курсе по электровелосипеду есть ещё пробный экзамен на условиях настоящего: 30 вопросов, 40 минут, для сдачи нужно 26.", he: "בקורס האופניים החשמליים יש גם מבחן תרגול בתנאי המבחן האמיתי: 30 שאלות, 40 דקות, 26 למעבר." }
          ],
          code: "data/db.js (scheduleReview, getWeakSpots), library/exam-sim.js"
        },
        {
          icon: "\u{1F331}", title: { en: "The Garden", ru: "Сад", he: "הגינה" },
          body: [
            { en: "Every topic you have passed is a plant, and its size is its review interval: a sprout at a day, a tree at a month, in bloom at two months and more.",
              ru: "Каждая сданная тема — растение, и его размер — это промежуток до повторения: росток — день, дерево — месяц, цветение — два месяца и больше.", he: "כל נושא שעברתם הוא צמח, והגודל שלו הוא מרווח החזרה: נבט אחרי יום, עץ אחרי חודש, ופריחה אחרי חודשיים ויותר." },
            { en: "Leave a topic overdue for more than a week and it starts to shrink, a day for every day it waits. Holiday mode pauses that, for up to 60 days a year.",
              ru: "Если повторение просрочено больше чем на неделю, растение начинает уменьшаться — на день за каждый день ожидания. Режим отпуска это останавливает, до 60 дней в году.", he: "נושא שמחכה לחזרה יותר משבוע מתחיל להתכווץ, יום על כל יום של המתנה. מצב חופשה עוצר את זה, עד 60 יום בשנה." },
            { en: "It is a picture of what you still remember, not of what you once finished.",
              ru: "Это картина того, что вы ещё помните, а не того, что когда-то прошли.", he: "זו תמונה של מה שאתם עדיין זוכרים, לא של מה שסיימתם פעם." }
          ],
          more: [
            { en: "The stages, by review interval:",
              ru: "Стадии по промежутку до повторения:", he: "השלבים, לפי מרווח החזרה:" },
            { en: "Since 24 November the Garden screen draws it: a bed for each course, each plant at its stage, and a drop over every plant that needs water. Tap the drop, and the runner goes there and its review begins.",
              ru: "С 24 ноября экран Сада рисует его: по грядке на курс, каждое растение в своей стадии, а над каждым, которое пора полить, — капля. Нажмите на каплю, и человечек дойдёт до растения, и начнётся его повторение.", he: "מאז 24 בנובמבר מסך הגינה מצייר אותה: ערוגה לכל קורס, כל צמח בשלב שלו, וטיפה מעל כל צמח שצריך השקיה. געו בטיפה, והדמות תלך אליו והחזרה שלו תתחיל." },
            { list: [
              { en: "🌑 Fallow — not started", ru: "🌑 Пар — тема не начата", he: "🌑 בור — לא התחיל" },
              { en: "🌰 Seed — started, exam not passed yet", ru: "🌰 Семя — начата, экзамен ещё не сдан", he: "🌰 זרע — התחיל, המבחן עוד לא עבר" },
              { en: "🌱 Sprout — 1 day or more", ru: "🌱 Росток — от 1 дня", he: "🌱 נבט — מיום אחד" },
              { en: "🌿 Seedling — 7 days or more", ru: "🌿 Саженец — от 7 дней", he: "🌿 שתיל — מ־7 ימים" },
              { en: "🌾 Growing — 21 days or more", ru: "🌾 Рост — от 21 дня", he: "🌾 צומח — מ־21 יום" },
              { en: "🌳 Tree — 30 days or more", ru: "🌳 Дерево — от 30 дней", he: "🌳 עץ — מ־30 יום" },
              { en: "🌸 Blossom — 60 days or more", ru: "🌸 Цветение — от 60 дней", he: "🌸 פריחה — מ־60 יום" }
            ] },
            { en: "The Garden lists what needs watering today, and starts the first review in one tap.",
              ru: "Сад показывает, что пора полить сегодня, и одним нажатием запускает первое повторение.", he: "הגינה מראה מה צריך השקיה היום, ומתחילה את החזרה הראשונה בנגיעה אחת." },
            { en: "Each stage also has a weight: 1 for a sprout or a seedling, 2 for growing or a tree, 3 in bloom. Every 5 points of weight fund one point of reputation a day, five at most. Reputation was for praising other people's posts in the Forum, so that right came from what you remember, not from how much you opened.",
              ru: "У каждой стадии есть ещё и вес: 1 у ростка и саженца, 2 у роста и дерева, 3 у цветения. Каждые 5 единиц веса дают одно очко репутации в день, но не больше пяти. Репутацией хвалили чужие посты на форуме, так что право хвалить шло от того, что вы помните, а не от того, сколько открыли.", he: "לכל שלב יש גם משקל: 1 לנבט או לשתיל, 2 לצומח או לעץ, 3 לפריחה. כל 5 נקודות משקל מממנות נקודת מוניטין אחת ליום, עד חמש. במוניטין שיבחו פוסטים של אחרים בפורום, כך שהזכות הזאת באה ממה שאתם זוכרים, לא מכמה פתחתם." }
          ],
          code: "garden/garden.js"
        },
        {
          icon: "\u{1F0CF}", title: { en: "Flashcards", ru: "Карточки", he: "כרטיסיות" },
          body: [
            { en: "A topic due for review is reviewed as a deck of cards built from questions the course already has: one card for each chunk's question and one for each exam question.",
              ru: "Тема, которую пора повторить, повторяется колодой карточек из вопросов, которые в курсе уже есть: по карточке на вопрос каждой части и на каждый вопрос экзамена.", he: "על נושא שהגיע זמנו חוזרים כחפיסת כרטיסים שנבנית משאלות שכבר יש בקורס: כרטיס לשאלה של כל חלק וכרטיס לכל שאלת מבחן." },
            { en: "After each card you rate how well you remembered it. That self-rating is the weakest measurement in the app. The fix is decided but not built yet: type the answer first, then tick off its key points.",
              ru: "После каждой карточки вы сами оцениваете, насколько хорошо вспомнили. Эта самооценка — самое слабое измерение в приложении. Замена решена, но ещё не сделана: сначала напечатать ответ, потом отметить его ключевые пункты.", he: "אחרי כל כרטיס מדרגים כמה טוב זכרתם. הדירוג העצמי הזה הוא המדידה החלשה ביותר באפליקציה. התיקון הוחלט אבל עוד לא נבנה: קודם להקליד את התשובה, ואז לסמן את נקודות המפתח שלה." }
          ],
          more: [
            { en: "Each card is rated on four levels, from “difficult” to “known”, and “have an idea” or better counts as knowing it. Know 80% of the deck and the review is passed; that share becomes its grade for the schedule.",
              ru: "Каждую карточку оценивают по четырём уровням, от «сложно» до «знаю», и «есть идея» или выше считается «знаю». Знаете 80% колоды — повторение сдано, и эта доля становится его оценкой для расписания.", he: "כל כרטיס מדורג בארבע רמות, מ\"קשה לי\" ועד \"ברור לי\", ו\"יש לי מושג\" ומעלה נחשב כידיעה. יודעים 80% מהחפיסה — והחזרה עברה; החלק הזה הופך לציון שלה בלוח הזמנים." },
            { en: "Reviews pay a little XP for each card, so a card answered in under 2.5 seconds earns nothing: tapping through a deck for the reward does not pay.",
              ru: "За каждую карточку повторение даёт немного опыта, поэтому карточка, отвеченная быстрее чем за 2,5 секунды, не даёт ничего: пролистать колоду ради награды не выйдет.", he: "חזרות נותנות קצת XP על כל כרטיס, ולכן כרטיס שנענה בפחות מ־2.5 שניות לא מזכה בכלום: לדפדף בחפיסה בשביל הפרס לא משתלם." },
            { en: "You can also build your own deck from chunks of different topics and units, and filter it by those four levels. Mixing topics is interleaved practice, which beats practising one block at a time.",
              ru: "Можно собрать и свою колоду из частей разных тем и блоков и отфильтровать её по тем же четырём уровням. Смешивать темы — это перемежающаяся практика, она работает лучше, чем учить блок за блоком.", he: "אפשר גם לבנות חפיסה משלכם מחלקים של נושאים ויחידות שונים, ולסנן אותה לפי אותן ארבע רמות. ערבוב נושאים הוא תרגול משולב, והוא עדיף על תרגול של בלוק אחד בכל פעם." }
          ],
          code: { en: "library/library.js (flashcards, MIN_CARD_MS, the deck builder)", ru: "library/library.js (карточки, MIN_CARD_MS, сборка колоды)", he: "library/library.js (כרטיסיות, MIN_CARD_MS, בניית החפיסה)" }
        },
        {
          icon: "\u{1F4DC}", title: { en: "Quotes after learning", ru: "Цитаты после учёбы", he: "ציטוטים אחרי הלמידה" },
          body: [
            { en: "Pass a topic's exam, or finish a review, and a short quote closes the screen: 58 of them, by 32 authors, from Confucius and Marcus Aurelius to Hillel, Rabbi Nachman and Richard Feynman.",
              ru: "Сдайте экзамен по теме или закончите повторение — и экран закроет короткая цитата: всего их 58, от 32 авторов, от Конфуция и Марка Аврелия до Гиллеля, рабби Нахмана и Ричарда Фейнмана.", he: "עוברים מבחן של נושא או מסיימים חזרה — וציטוט קצר סוגר את המסך: 58 ציטוטים של 32 כותבים, מקונפוציוס ומרקוס אורליוס ועד הלל, רבי נחמן וריצ'רד פיינמן." },
            { en: "Each one names where it comes from, because famous lines are made up more often than people think: “If you can't explain it simply…” was never Einstein's, and “We are what we repeatedly do” is Will Durant's, not Aristotle's.",
              ru: "У каждой указано, откуда она, потому что знаменитые фразы выдумывают чаще, чем кажется: «Если не можешь объяснить просто…» Эйнштейн не говорил, а «Мы — то, что мы постоянно делаем» принадлежит Уиллу Дюранту, а не Аристотелю.", he: "לכל אחד מצוין מאיפה הוא, כי משפטים מפורסמים מומצאים יותר ממה שנדמה: \"אם אינך יכול להסביר את זה בפשטות...\" מעולם לא היה של איינשטיין, ו\"אנחנו מה שאנחנו עושים שוב ושוב\" הוא של וויל דוראנט, לא של אריסטו." }
          ],
          more: [
            { en: "The quote is drawn from the whole pool rather than from a list per topic, so they do not run out, and the last twelve shown are left out. A lesson can name themes to steer the choice; none does yet, so for now the draw is random.",
              ru: "Цитата берётся из всего пула, а не из списка для темы, поэтому они не кончаются, а двенадцать последних показанных пропускаются. Урок может назвать темы, чтобы направить выбор; пока ни один этого не делает, так что выбор случайный.", he: "הציטוט נבחר מכל המאגר ולא מרשימה לכל נושא, ולכן הם לא נגמרים, ושנים־עשר האחרונים שהוצגו לא חוזרים. שיעור יכול לציין נושאים כדי לכוון את הבחירה; אף שיעור עוד לא עושה זאת, כך שבינתיים הבחירה אקראית." },
            { en: "49 of the 58 cite a specific work, section or occasion. The other 9 are marked in the code as attributions whose primary source was not found.",
              ru: "49 из 58 ссылаются на конкретное сочинение, раздел или случай. Остальные 9 помечены в коде как приписываемые: первоисточник не найден.", he: "49 מתוך 58 מפנים ליצירה, לפרק או לאירוע מסוימים. 9 האחרים מסומנים בקוד כמיוחסים, ומקורם הראשוני לא נמצא." },
            { en: "Translations are chosen with copyright in mind: George Long's Marcus Aurelius (1862) and Thomas Common's Nietzsche (1911), not the modern translations still under copyright.",
              ru: "Переводы выбраны с оглядкой на авторское право: Марк Аврелий в переводе Джорджа Лонга (1862) и Ницше в переводе Томаса Коммона (1911), а не современные переводы, ещё защищённые правом.", he: "התרגומים נבחרו עם תשומת לב לזכויות יוצרים: מרקוס אורליוס בתרגום ג'ורג' לונג (1862) וניטשה בתרגום תומאס קומון (1911), ולא תרגומים מודרניים שעדיין מוגנים." },
            { en: "A list of 95 more candidate authors was approved for growing the pool about five times, under the same rules: a real citation for every new quote, and Goodreads is not a source. Cicero shows why: the line about balancing the budget that circulates as his comes from a 1965 novel. The growth itself has not been done yet.",
              ru: "Для роста пула примерно в пять раз утвердили список ещё из 95 авторов, с теми же правилами: у каждой новой цитаты настоящая ссылка, а Goodreads — не источник. Цицерон показывает почему: фраза о сбалансированном бюджете, которая ходит как его, взята из романа 1965 года. Сам рост пока не сделан.", he: "רשימה של עוד 95 כותבים מועמדים אושרה כדי להגדיל את המאגר פי חמישה בערך, באותם כללים: מקור אמיתי לכל ציטוט חדש, ו־Goodreads אינו מקור. קיקרו מראה למה: המשפט על איזון התקציב שמסתובב בשמו לקוח מרומן משנת 1965. ההגדלה עצמה עוד לא נעשתה." }
          ],
          code: "library/content/quotes.js, core/core.js (pickQuote), docs/research/quote-authors.md"
        },
        {
          icon: "\u{1F396}️", title: { en: "Ranks and rewards", ru: "Ранги и награды", he: "דרגות ופרסים" },
          body: [
            { en: "Studying earns XP, XP raises your rank, and each of the twenty ranks hands out a reward. A newcomer finds the rank line under a sticker; peeling it opens a short guide, which this button shows again.",
              ru: "Учёба приносит опыт, опыт поднимает ранг, а каждый из двадцати рангов даёт награду. Новичок видит строку ранга под наклейкой; если её отклеить, откроется короткое знакомство. Эта кнопка показывает его снова.", he: "הלמידה מזכה ב־XP, ה־XP מעלה את הדרגה, וכל אחת מעשרים הדרגות מעניקה פרס. משתמשים חדשים מוצאים את שורת הדרגה מתחת למדבקה; קילוף שלה פותח הדרכה קצרה, והכפתור הזה מציג אותה שוב." }
          ],
          more: [
            { en: "XP comes from finishing chunks and passing exams. It is never spent and has no ceiling. The ranks run from Lab Intern at 0 XP to Nobel Laureate at 100,000, and each one brings a background pattern, a colour theme or tokens.",
              ru: "Опыт дают пройденные части и сданные экзамены. Он не тратится и не имеет потолка. Ранги идут от Стажёра лаборатории на 0 опыта до Нобелевского лауреата на 100 000, и каждый приносит фоновый узор, цветовую тему или токены.", he: "XP מגיע מסיום חלקים ומעבר מבחנים. הוא לא מוצא לעולם ואין לו תקרה. הדרגות נמשכות ממתמחה במעבדה ב־0 XP ועד זוכה פרס נובל ב־100,000, וכל אחת מביאה דוגמת רקע, ערכת צבעים או אסימונים." },
            { en: "Badges, ten of them, each for something real: a first topic mastered; a quarter, half or all of a course; a perfect exam; five exams without a fail; 90% accuracy over 50 questions; a 7- or 30-day streak; reaching rank 8.",
              ru: "Значков десять, и каждый за настоящее достижение: первая освоенная тема; четверть, половина или весь курс; идеальный экзамен; пять экзаменов без провала; 90% точности на 50 вопросах; серия в 7 или 30 дней; 8-й ранг.", he: "תגים — עשרה, כל אחד על משהו אמיתי: נושא ראשון שנלמד; רבע, חצי או קורס שלם; מבחן מושלם; חמישה מבחנים בלי כישלון; 90% דיוק ב־50 שאלות; רצף של 7 או 30 יום; הגעה לדרגה 8." },
            { en: "A streak day counts when a topic is mastered, not when the app is opened, and two freezes a week bridge missed days.",
              ru: "День серии засчитывается, когда освоена тема, а не когда открыто приложение, и две «заморозки» в неделю закрывают пропущенные дни.", he: "יום ברצף נחשב כשנושא נלמד, לא כשפותחים את האפליקציה, ושתי הקפאות בשבוע מגשרות על ימים שהוחמצו." },
            { en: "There are no leaderboards. XP, badges and streaks were each argued against first: studies find their effect small and unstable, and some find they lower motivation. Each was added by request anyway, with the objection kept beside it. Nothing ranks you against other people.",
              ru: "Таблиц лидеров нет. Против опыта, значков и серий сначала были доводы: исследования находят у них малый и неустойчивый эффект, а некоторые — что они снижают мотивацию. Каждое добавили по просьбе, а возражение оставили рядом. Ничто не сравнивает вас с другими.", he: "אין טבלאות מובילים. נגד XP, תגים ורצפים היו בהתחלה נימוקים: מחקרים מוצאים שההשפעה שלהם קטנה ולא יציבה, וחלקם מוצאים שהם מורידים מוטיבציה. כל אחד נוסף בכל זאת לפי בקשה, וההתנגדות נשמרה לצידו. שום דבר לא מדרג אתכם מול אנשים אחרים." },
            { en: "Three currencies are kept apart. Tokens are bought with real money and open courses. $ is earned by studying and was meant for cosmetics, but every cosmetic is now free or comes with a rank. Reputation is the Garden's daily allowance, for praising other people only. Nothing earned by studying turns back into Tokens, so studying never becomes a way to make money.",
              ru: "Три валюты держатся отдельно. Токены покупаются за настоящие деньги и открывают курсы. $ зарабатывается учёбой и задумывался для оформления, но всё оформление теперь бесплатное или приходит с рангом. Репутация — дневной запас от Сада, только чтобы хвалить других. Заработанное учёбой не превращается обратно в токены, поэтому учёба не становится способом зарабатывать деньги.", he: "שלושה מטבעות נשמרים בנפרד. אסימונים נקנים בכסף אמיתי ופותחים קורסים. $ מרוויחים בלמידה והם נועדו לעיצוב, אבל כל פריט עיצוב היום חינמי או מגיע עם דרגה. מוניטין הוא המכסה היומית של הגינה, רק לשבח אחרים. שום דבר שהורווח בלמידה לא חוזר להיות אסימונים, כך שלמידה לעולם לא הופכת לדרך להרוויח כסף." },
            { en: "In this demo there is no server to pay XP, so the rank stays where the sample profile starts.",
              ru: "В этом демо нет сервера, который начислял бы опыт, поэтому ранг остаётся тем, с которого начинается пример профиля.", he: "בדמו הזה אין שרת שמשלם XP, ולכן הדרגה נשארת במקום שבו מתחיל הפרופיל לדוגמה." }
          ],
          code: "shop/ranks.js, core/peel.js, library/stats.js, core/earn.js",
          action: { label: { en: "Show the guide", ru: "Показать знакомство", he: "להציג את ההדרכה" }, run: () => Dojo.openRankGuide && Dojo.openRankGuide() }
        },
        {
          icon: "\u{1F5FA}️", title: { en: "Scenes", ru: "Сцены", he: "סצנות" },
          body: [
            { en: "Some courses are drawn as places: the e-bike course is a junction, Intro to CS a computer lab, Philosophy the Roman Forum at night, the start screen a garden in a light ground mist, and the Garden screen your own garden, a drop on each plant that is due. Each hall of this museum has a small scene of its own, a pin for each card. Pick a chapter and a small figure walks there along the paths, then opens it.",
              ru: "Некоторые курсы нарисованы как места: курс по электровелосипеду — перекрёсток, Intro to CS — компьютерный класс, философия — ночной Римский форум, стартовый экран — сад в лёгком тумане, а экран Сада — ваш собственный сад, с каплей над каждым растением, которое пора полить. У каждого зала этого музея своя маленькая сцена, с меткой на каждую карточку. Выберите главу, и человечек дойдёт до неё по дорожкам и откроет её.", he: "חלק מהקורסים מצוירים כמקומות: קורס האופניים החשמליים הוא צומת, Intro to CS מעבדת מחשבים, הפילוסופיה הפורום הרומי בלילה, מסך הפתיחה גינה בערפל קל על הקרקע, ומסך הגינה הוא הגינה שלכם, עם טיפה מעל כל צמח שצריך השקיה. לכל אולם במוזיאון הזה יש סצנה קטנה משלו, עם סיכה לכל כרטיס. בוחרים פרק, ודמות קטנה הולכת אליו בשבילים ופותחת אותו." },
            { en: "Every scene is drawn by one engine from a recipe, which is plain data: what stands where, and in what colours. A new scene is a new recipe. When it needs a new kind of thing, the engine learns it once, for every scene.",
              ru: "Все сцены рисует один движок по рецепту — это просто данные: что где стоит и каких цветов. Новая сцена — это новый рецепт. Если ей нужна новая вещь, движок учится рисовать её один раз, для всех сцен сразу.", he: "כל סצנה מצוירת על ידי מנוע אחד לפי מתכון, שהוא נתונים פשוטים: מה עומד איפה, ובאילו צבעים. סצנה חדשה היא מתכון חדש. כשהיא צריכה סוג חדש של דבר, המנוע לומד אותו פעם אחת, לכל הסצנות." }
          ],
          more: [
            { en: "What the engine does: an isometric projection with three layers of depth, a cut-away of the ground under each scene, things sorted by depth so near ones cover far ones, and shortest-path walking (Dijkstra) over a graph of paths. In the e-bike course the figure keeps to the sidewalks and crosses only at the zebras.",
              ru: "Что делает движок: изометрическая проекция с тремя слоями глубины, срез земли под каждой сценой, сортировка по глубине, чтобы ближнее закрывало дальнее, и кратчайший путь (алгоритм Дейкстры) по графу дорожек. В курсе по электровелосипеду человечек идёт по тротуарам и переходит дорогу только по зебрам.", he: "מה המנוע עושה: הטלה איזומטרית עם שלוש שכבות עומק, חתך של האדמה מתחת לכל סצנה, מיון לפי עומק כך שקרוב מסתיר רחוק, והליכה במסלול הקצר ביותר (דייקסטרה) על גרף של שבילים. בקורס האופניים הדמות נשארת על המדרכות וחוצה רק במעברי חצייה." },
            { en: "Every scene follows the sky: by day the lamps go out and the lab's window shows the sun. Pins can be reached with the keyboard, reduced motion is respected, and nothing animates while a scene is off screen.",
              ru: "Каждая сцена следует за небом: днём фонари гаснут, а в окне класса светит солнце. До меток можно добраться с клавиатуры, режим уменьшенного движения соблюдается, а сцена вне экрана не анимируется.", he: "כל סצנה עוקבת אחרי השמיים: ביום הפנסים כבים, ובחלון המעבדה נראית השמש. לסיכות אפשר להגיע במקלדת, העדפת תנועה מופחתת נשמרת, ושום דבר לא זז כשהסצנה מחוץ למסך." },
            { en: "Intro to CS has a pin per unit rather than per topic, because 48 topics do not fit in one picture. On the start screen each stage of the Garden plays its own note of a pentatonic scale, and the figure plays them as it passes.",
              ru: "В Intro to CS метка стоит на каждый блок, а не на тему: 48 тем в одну картинку не помещаются. На стартовом экране каждая стадия Сада звучит своей нотой пентатоники, а человечек проигрывает их, когда проходит мимо.", he: "ב־Intro to CS יש סיכה לכל יחידה ולא לכל נושא, כי 48 נושאים לא נכנסים לתמונה אחת. במסך הפתיחה כל שלב של הגינה מנגן תו משלו בסולם פנטטוני, והדמות מנגנת אותם כשהיא עוברת." },
            { en: "The rule that keeps scenes cheap: never a drawing per course. The lab taught the engine walls and pictures on them; the forum taught it pitched roofs, columns and togas; the museum's halls taught it easels, a signpost, a raincloud and a hot-air balloon, for every scene after.",
              ru: "Правило, которое делает сцены дешёвыми: никогда не рисовать каждый курс отдельно. Класс научил движок стенам и картинкам на них, форум — двускатным крышам, колоннам и тогам, залы музея — мольбертам, указателю, дождевому облаку и воздушному шару, для всех следующих сцен.", he: "הכלל ששומר על סצנות זולות: אף פעם לא ציור לכל קורס. המעבדה לימדה את המנוע קירות ותמונות עליהם; הפורום לימד אותו גגות משופעים, עמודים וטוגות; אולמות המוזיאון לימדו אותו כני ציור, שלט הכוונה, ענן גשם וכדור פורח, לכל הסצנות שאחריו." }
          ],
          code: { en: "scenes/scene.js, and one recipe per scene in scenes/", ru: "scenes/scene.js и по рецепту на сцену в scenes/", he: "scenes/scene.js, ומתכון אחד לכל סצנה ב־scenes/" }
        }
      ]
    },
    {
      title: { en: "Behind the scenes", ru: "За кадром", he: "מאחורי הקלעים" },
      scene: "museum-behind",
      exhibits: [
        {
          icon: "\u{1F9E9}", title: { en: "How the code is built", ru: "Как устроен код", he: "איך הקוד בנוי" },
          body: [
            { en: "Plain JavaScript with no framework, no build step and no packages: script tags in a fixed order. Any static server runs it.",
              ru: "Обычный JavaScript без фреймворка, без сборки и без пакетов: теги script в заданном порядке. Запустит любой статический сервер.", he: "JavaScript פשוט בלי פריימוורק, בלי שלב בנייה ובלי חבילות: תגי script בסדר קבוע. כל שרת סטטי מריץ אותו." }
          ],
          more: [
            { en: "A small core carries storage, events, screens, and one place where each feature publishes what it offers. Features live in their own folders and talk only through that core, so deleting a folder and its script tags takes the feature out and the rest keeps running.",
              ru: "Небольшое ядро отвечает за хранение, события, экраны и за одно место, где каждая функция публикует, что она умеет. Функции живут в своих папках и общаются только через ядро, поэтому если удалить папку и её теги script, функция исчезнет, а остальное продолжит работать.", he: "ליבה קטנה אחראית על אחסון, אירועים, מסכים ועל מקום אחד שבו כל תכונה מפרסמת מה היא מציעה. תכונות גרות בתיקיות משלהן ומדברות רק דרך הליבה, ולכן מחיקת תיקייה ותגי ה־script שלה מוציאה את התכונה, והשאר ממשיך לעבוד." },
            { en: "Your data is one document in the browser's storage, with a version number. When it loads it is upgraded step by step, so an old save always opens in a new build.",
              ru: "Ваши данные — один документ в хранилище браузера с номером версии. При загрузке он обновляется шаг за шагом, поэтому старое сохранение всегда открывается в новой версии.", he: "הנתונים שלכם הם מסמך אחד באחסון של הדפדפן, עם מספר גרסה. כשהוא נטען הוא משודרג צעד אחר צעד, כך ששמירה ישנה תמיד נפתחת בגרסה חדשה." },
            { en: "Three languages: English, Russian and Hebrew. Course text is chosen once per page load, and the interface has about 500 keyed strings. Switching the language reloads the page, which is cheap and makes a half-translated screen impossible; Hebrew also turns the whole page to read right to left.",
              ru: "Три языка: английский, русский и иврит. Текст курсов выбирается один раз при загрузке страницы, а у интерфейса около 500 строк по ключам. Смена языка перезагружает страницу — это дёшево и исключает наполовину переведённый экран; а с ивритом вся страница ещё и читается справа налево.", he: "שלוש שפות: אנגלית, רוסית ועברית. טקסט הקורסים נבחר פעם אחת בטעינת הדף, ולממשק יש כ־500 מחרוזות לפי מפתח. החלפת שפה טוענת את הדף מחדש — זה זול ומונע מסך שתורגם רק בחלקו; ועברית גם הופכת את כל הדף לקריאה מימין לשמאל." },
            { en: "Sounds are made by the browser as they play, with no audio files, and respect the mute switch.",
              ru: "Звуки браузер создаёт сам в момент проигрывания, без аудиофайлов, и соблюдает выключение звука.", he: "הצלילים נוצרים בדפדפן בזמן הניגון, בלי קובצי שמע, ומכבדים את מתג ההשתקה." },
            { en: "Three scripts check the work from the command line: lessons against the content standard, the app's fields against the database's columns, and the demo build against any production key.",
              ru: "Три скрипта проверяют работу из командной строки: уроки — по стандарту контента, поля приложения — по столбцам базы данных, а сборку демо — на любые рабочие ключи.", he: "שלושה סקריפטים בודקים את העבודה משורת הפקודה: שיעורים מול תקן התוכן, השדות של האפליקציה מול עמודות מסד הנתונים, ואת בניית הדמו מול כל מפתח של הייצור." }
          ],
          code: "core/, data/db.js, core/i18n.js, core/sfx.js, docs/ARCHITECTURE.md"
        },
        {
          icon: "\u{1F510}", title: { en: "How accounts were meant to work", ru: "Как должны были работать аккаунты", he: "איך חשבונות היו אמורים לעבוד" },
          body: [
            { en: "In the real app you sign in, and your progress lives on a server (Supabase, a hosted Postgres database) as well as on your device.",
              ru: "В настоящем приложении вы входите в аккаунт, и прогресс хранится и на устройстве, и на сервере (Supabase — облачная база данных Postgres).", he: "באפליקציה האמיתית נכנסים לחשבון, וההתקדמות נשמרת גם בשרת (Supabase, מסד נתונים Postgres מאוחסן) וגם במכשיר." },
            { en: "Syncing merges field by field instead of letting the newest save win: finished topics are combined, each topic's review keeps whichever device is further ahead, and counters keep the higher number. Syncing twice changes nothing.",
              ru: "Синхронизация сливает данные поле за полем, а не по принципу «последнее сохранение победило»: пройденные темы объединяются, у каждой темы остаётся то повторение, которое ушло дальше, а счётчики берут большее значение. Повторная синхронизация ничего не меняет.", he: "הסנכרון ממזג שדה אחר שדה במקום לתת לשמירה האחרונה לנצח: נושאים שהושלמו מתאחדים, החזרה של כל נושא לוקחת את המכשיר שהתקדם יותר, ומונים שומרים את המספר הגבוה. סנכרון כפול לא משנה כלום." },
            { en: "Rewards are paid by the server, never by the browser, because anything kept in a browser can be edited by whoever owns it.",
              ru: "Награды начисляет сервер, а не браузер: всё, что хранится в браузере, его владелец может изменить.", he: "את הפרסים משלם השרת, אף פעם לא הדפדפן, כי כל מה ששמור בדפדפן ניתן לעריכה בידי מי שמחזיק בו." },
            { en: "The server went to sleep in 2026 after two months without use, which is what its free tier does. So the real app stops at sign-in, and this demo runs with no server at all.",
              ru: "В 2026 году сервер уснул после двух месяцев без использования — так работает бесплатный тариф. Поэтому настоящее приложение останавливается на входе, а это демо работает вовсе без сервера.", he: "השרת נרדם ב־2026 אחרי חודשיים בלי שימוש — כך עובד המסלול החינמי שלו. לכן האפליקציה האמיתית נעצרת בכניסה, והדמו הזה רץ בלי שרת בכלל." }
          ],
          more: [
            { en: "No browser can write money, XP, reputation or the Forum. Those tables accept no direct writes at all; every change goes through a database function that takes the user from the signed-in session, never from what the browser sends.",
              ru: "Ни один браузер не может записать деньги, опыт, репутацию или форум. Эти таблицы вообще не принимают прямых записей: любое изменение идёт через функцию базы данных, которая берёт пользователя из сессии входа, а не из того, что прислал браузер.", he: "אף דפדפן לא יכול לכתוב כסף, XP, מוניטין או פורום. הטבלאות האלה לא מקבלות שום כתיבה ישירה; כל שינוי עובר דרך פונקציה של מסד הנתונים שלוקחת את המשתמש מהחיבור המאומת, לעולם לא ממה שהדפדפן שולח." },
            { en: "Rewards are a ledger: each piece of work is paid once, only if it is a real item from the catalogue, only at a human pace, and under a daily ceiling. An older endpoint that let the browser name an amount paid 800 XP in four calls, and was removed.",
              ru: "Награды ведутся как журнал: каждая работа оплачивается один раз, только если это настоящий пункт каталога, только в человеческом темпе и в пределах дневного потолка. Старый способ, где браузер сам называл сумму, выдал 800 опыта за четыре вызова, и его убрали.", he: "פרסים הם יומן חשבונות: כל עבודה משולמת פעם אחת, רק אם היא פריט אמיתי מהקטלוג, רק בקצב אנושי ומתחת לתקרה יומית. נקודת קצה ישנה שאפשרה לדפדפן לנקוב בסכום שילמה 800 XP בארבע קריאות, והוסרה." },
            { en: "Two bugs found by attacking it: granting reputation many times at once let 8 of 8 grants through where 2 were allowed, until a lock fixed it; and a uniqueness rule Postgres did not enforce let one person report the same post again and again.",
              ru: "Две ошибки, найденные атакой на сервер: при одновременных выдачах репутации проходили 8 из 8 там, где можно было 2, пока это не закрыли блокировкой; а правило уникальности, которое Postgres не соблюдал, позволяло одному человеку жаловаться на один пост снова и снова.", he: "שני באגים שנמצאו בתקיפה: מתן מוניטין הרבה פעמים בבת אחת העביר 8 מתוך 8 הענקות כשמותר היה 2, עד שנעילה תיקנה את זה; וכלל ייחודיות ש־Postgres לא אכף אפשר לאדם אחד לדווח על אותו פוסט שוב ושוב." },
            { en: "The known weakness is written down in the code: your own progress has to be writable, because that is how it syncs, and the Garden's weight is counted from it. Forging it buys at most five reputation points a day.",
              ru: "Известная слабость записана прямо в коде: ваш собственный прогресс должен быть доступен для записи, иначе он не синхронизируется, а вес Сада считается по нему. Подделка даёт не больше пяти очков репутации в день.", he: "החולשה הידועה כתובה בקוד עצמו: ההתקדמות שלכם חייבת להיות ניתנת לכתיבה, כי כך היא מסתנכרנת, ומשקל הגינה מחושב ממנה. זיוף שלה קונה לכל היותר חמש נקודות מוניטין ביום." }
          ],
          code: "core/auth.js, core/sync.js, core/earn.js, supabase/migrations/"
        },
        {
          icon: "\u{1F4AC}", title: { en: "The Forum: built, not launched yet", ru: "Форум: построен, ещё не запущен", he: "הפורום: נבנה, עוד לא הושק" },
          body: [
            { en: "Posts, replies, praise, reports and moderation are in the code, and were tested against a live database. The Forum needs that server and the demo has none, so here it is an exhibit.",
              ru: "Посты, ответы, похвала, жалобы и модерация есть в коде и проверялись на живой базе. Форуму нужен этот сервер, а у демо его нет, поэтому здесь он экспонат.", he: "פוסטים, תגובות, שבחים, דיווחים ומודרציה נמצאים בקוד, ונבדקו מול מסד נתונים חי. הפורום צריך את השרת הזה, ולדמו אין שרת, ולכן כאן הוא מוצג במוזיאון." }
          ]
        },
        {
          icon: "\u{1F9EA}", title: { en: "This demo", ru: "Это демо", he: "הדמו הזה" },
          body: [
            { en: "This is a copy of the real app, made by a script that switches the demo on and takes the server out.",
              ru: "Это копия настоящего приложения. Её делает скрипт: он включает режим демо и убирает сервер.", he: "זה עותק של האפליקציה האמיתית, שנוצר בסקריפט שמפעיל את מצב הדמו ומוציא את השרת." }
          ],
          more: [
            { en: "The script blanks the server's address and key, drops the server's client and the Forum, and keeps the demo's old cache apart from the real app's. Then it searches the copy for any production key before it finishes.",
              ru: "Скрипт стирает адрес и ключ сервера, убирает клиент сервера и форум и держит старый кэш демо отдельно от кэша настоящего приложения. Потом он ищет в копии любые рабочие ключи и только после этого заканчивает.", he: "הסקריפט מוחק את הכתובת והמפתח של השרת, מסיר את הלקוח של השרת ואת הפורום, ומפריד את המטמון הישן של הדמו מזה של האפליקציה האמיתית. אחר כך הוא מחפש בעותק כל מפתח של הייצור, ורק אז מסיים." },
            { en: "With the demo on, nobody signs in. A first visit loads a sample student, Sunshine: Lab Intern, most of the way to the next rank, a nine-day streak, a topic half done and a plant at every stage.",
              ru: "В режиме демо никто не входит в аккаунт. При первом визите загружается пример ученика, Sunshine: стажёр лаборатории, почти дошедший до следующего ранга, серия в девять дней, тема пройдена наполовину и по растению на каждой стадии.", he: "במצב דמו אף אחד לא נכנס לחשבון. ביקור ראשון טוען תלמיד לדוגמה, Sunshine: מתמחה במעבדה, קרוב לדרגה הבאה, רצף של תשעה ימים, נושא שהושלם בחציו וצמח בכל שלב." },
            { en: "Your progress stays in this browser, apart from the real app's, and this museum stands where the Forum's tile was.",
              ru: "Ваш прогресс остаётся в этом браузере, отдельно от настоящего приложения, а этот музей стоит на месте плитки форума.", he: "ההתקדמות שלכם נשארת בדפדפן הזה, בנפרד מזו של האפליקציה האמיתית, והמוזיאון הזה עומד במקום שבו היה האריח של הפורום." }
          ],
          code: "tools/make-demo.js, core/demo.js"
        },
        {
          icon: "\u{1F6E0}️", title: { en: "How it was made", ru: "Как это сделано", he: "איך זה נעשה" },
          body: [
            { en: "Designed and directed by its author: what a lesson is, when an exam lets a topic into review, how the Garden grows and withers, what the server must never trust a browser with. The code was written with Claude, under that direction.",
              ru: "Задумано и направлено автором: что такое урок, когда экзамен пускает тему в повторения, как Сад растёт и вянет, чего сервер никогда не должен доверять браузеру. Код написан с Claude под этим руководством.", he: "תוכנן והונחה על ידי המחבר: מה זה שיעור, מתי מבחן מכניס נושא לחזרות, איך הגינה גדלה ונובלת, ובמה השרת לעולם לא יסמוך על הדפדפן. הקוד נכתב עם Claude, בהנחיה הזאת." }
          ],
          more: [
            { en: "Claims are checked against the code. Numbers in the documents were measured, not remembered, and a wrong one is corrected in place, with a date, rather than quietly rewritten.",
              ru: "Утверждения сверяются с кодом. Числа в документах измерены, а не взяты по памяти, а ошибочное исправляется на месте, с датой, а не переписывается тихо.", he: "טענות נבדקות מול הקוד. המספרים במסמכים נמדדו, לא נכתבו מהזיכרון, ומספר שגוי מתוקן במקום, עם תאריך, ולא נכתב מחדש בשקט." },
            { en: "Research is checked, not trusted. Three research reports were commissioned. The first quoted the project's own documents back as findings, so the next two were asked to look for what is wrong. Ten decisions came out of the third; one is built, and each is kept with the case against it.",
              ru: "Исследования проверяются, а не принимаются на веру. Было заказано три исследовательских отчёта. Первый вернул собственные документы проекта как находки, поэтому следующие два попросили искать, что не так. Из третьего вышло десять решений; одно построено, и каждое хранится вместе с доводами против.", he: "מחקר נבדק, לא מתקבל כמובן מאליו. הוזמנו שלושה דוחות מחקר. הראשון ציטט את מסמכי הפרויקט עצמו כממצאים, ולכן מהשניים הבאים התבקש לחפש מה לא בסדר. מהשלישי יצאו עשר החלטות; אחת נבנתה, וכל אחת נשמרת יחד עם הנימוקים נגדה." },
            { en: "What would come next: a longer exam with a short check a day or two later, typed answers instead of self-rated cards, and a server that checks progress against the work it actually paid for.",
              ru: "Что дальше: экзамен длиннее и короткая проверка через день-два, напечатанный ответ вместо самооценки карточек и сервер, который сверяет прогресс с работой, за которую он действительно заплатил.", he: "מה היה בא אחר כך: מבחן ארוך יותר עם בדיקה קצרה יום־יומיים אחריו, תשובות מוקלדות במקום כרטיסים עם דירוג עצמי, ושרת שבודק את ההתקדמות מול העבודה שהוא באמת שילם עליה." }
          ],
          code: "docs/HOW-IT-WORKS.md, docs/SHOWCASE.md, docs/INTERVIEW.md"
        },
        {
          icon: "\u{1F4CA}", title: { en: "The author, and the data side", ru: "Автор и данные", he: "המחבר, וצד הנתונים" },
          body: [
            { en: "Knell was made by Illia (github.com/Isk1zz), who studies computer science at the Open University and is learning data science. It shows in what the app measures: not how many topics were finished, but how long each one stays remembered.",
              ru: "Knell сделал Illia (github.com/Isk1zz): он изучает компьютерные науки в Открытом университете и учит data science. Это видно по тому, что приложение измеряет: не сколько тем пройдено, а как долго каждая держится в памяти.", he: "את Knell בנה Illia (github.com/Isk1zz), שלומד מדעי המחשב באוניברסיטה הפתוחה ולומד מדע נתונים. רואים את זה במה שהאפליקציה מודדת: לא כמה נושאים הסתיימו, אלא כמה זמן כל אחד נשאר בזיכרון." }
          ],
          more: [
            { en: "The data work in it:",
              ru: "Работа с данными в нём:", he: "עבודת הנתונים שבו:" },
            { list: [
              { en: "Memory is modelled with SM-2, and one of its constants was changed only after simulating learners: someone who barely passes every review now meets their sixth review at 153 days instead of 238.",
              ru: "Память моделируется по SM-2, и одну из её констант изменили только после симуляции учеников: тот, кто еле сдаёт каждое повторение, теперь встречает шестое через 153 дня вместо 238.", he: "הזיכרון ממודל לפי SM-2, ואחד הקבועים שלו שונה רק אחרי הדמיה של לומדים: מי שעובר כל חזרה בקושי פוגש עכשיו את החזרה השישית אחרי 153 ימים במקום 238." },
              { en: "SM-2 rather than the newer FSRS, because FSRS needs hundreds of reviews per learner before its model fits: more data than a small app ever collects.",
              ru: "SM-2, а не более новый FSRS, потому что FSRS нужны сотни повторений на ученика, прежде чем модель подстроится: больше данных, чем соберёт маленькое приложение.", he: "SM-2 ולא FSRS החדש יותר, כי FSRS צריך מאות חזרות לכל לומד עד שהמודל שלו מתכייל: יותר נתונים משאפליקציה קטנה תאסוף אי פעם." },
              { en: "The one metric is retention, the review interval, not completion; the Garden is that metric drawn as plants.",
              ru: "Метрика одна — удержание, то есть промежуток до повторения, а не завершённость; Сад — это та же метрика, нарисованная растениями.", he: "המדד האחד הוא שימור, כלומר מרווח החזרה, ולא השלמה; הגינה היא אותו מדד, מצויר כצמחים." },
              { en: "Weak spots are ranked by a score from the last result and the reviews that lapsed, so the app can answer what to study now.",
              ru: "Слабые места ранжируются по оценке из последнего результата и сорванных повторений, чтобы приложение могло ответить, что учить сейчас.", he: "הנקודות החלשות מדורגות לפי ציון מהתוצאה האחרונה ומהחזרות שהוחמצו, כדי שהאפליקציה תוכל לענות מה ללמוד עכשיו." },
              { en: "The weakest measurement is named, not hidden: a flashcard rated by its own learner. The fix, typed answers checked against key points, is written down.",
              ru: "Самое слабое измерение названо, а не спрятано: карточка, которую оценивает сам ученик. Исправление — набранный ответ, сверенный с ключевыми пунктами, — записано.", he: "המדידה החלשה ביותר מוצגת ולא מוסתרת: כרטיסייה שהלומד מדרג בעצמו. התיקון, תשובה מוקלדת שנבדקת מול נקודות מפתח, כתוב." },
              { en: "Numbers in the documents are measured, not remembered, and three research reports were checked against their sources before any was believed.",
              ru: "Числа в документах измерены, а не взяты по памяти, а три исследовательских отчёта сверены с источниками, прежде чем им поверили.", he: "המספרים במסמכים נמדדו ולא נשלפו מהזיכרון, ושלושה דוחות מחקר נבדקו מול המקורות שלהם לפני שהאמינו לאחד מהם." }
            ] }
          ]
        }
      ]
    },
    {
      title: { en: "History, by date", ru: "История по датам", he: "היסטוריה, לפי תאריכים" },
      scene: "museum-history",
      exhibits: [
        {
          icon: "⏳", title: { en: "What went into it", ru: "Сколько в это вложено", he: "כמה הושקע בזה" },
          body: [
            // Reworded 2026-11-24 after «12 600 уроков, 5 600 стилей ????»:
            // the line counts read as counts of lessons and styles. Each
            // number now stands after the name of what it measures, and
            // the lead says they are lines. Every figure re-measured that
            // day: git log for the commits, tracked files for the lines.
            { en: "Knell took about a month of full-time work, by day and by night: from 10 August to 3 September, and again from 19 to 24 November. The dates in this hall are when work reached the repository; reading, thinking and testing went on around them.",
              ru: "На Knell ушёл примерно месяц работы с утра до ночи: с 10 августа по 3 сентября и ещё раз с 19 по 24 ноября. Даты в этом зале — это когда работа попадала в репозиторий; чтение, обдумывание и проверки шли вокруг них.", he: "העבודה על Knell נמשכה כחודש במשרה מלאה, ביום ובלילה: מ־10 באוגוסט עד 3 בספטמבר, ושוב מ־19 עד 24 בנובמבר. התאריכים באולם הזה הם הרגעים שבהם העבודה הגיעה למאגר; קריאה, חשיבה ובדיקות נמשכו סביבם." },
            { list: [
              { en: "223 commits as of 24 November. 207 of them came between 10 August and 3 September, on 14 days; one on 13 October; and fifteen in November, fewer but larger: the demo, the scenes, this museum, Hebrew.",
                ru: "223 коммита на 24 ноября. Из них 207 — с 10 августа по 3 сентября, за 14 дней; один — 13 октября; пятнадцать — в ноябре: реже, но крупнее (демо, сцены, этот музей, иврит).", he: "223 קומיטים נכון ל־24 בנובמבר. 207 מהם נעשו בין 10 באוגוסט ל־3 בספטמבר, ב־14 ימים; אחד ב־13 באוקטובר; וחמישה־עשר בנובמבר, מעטים אבל גדולים יותר: הדמו, הסצנות, המוזיאון הזה, העברית." },
              { en: "The busiest day was 13 August: 43 commits, from 03:27 to 23:57.",
                ru: "Самый плотный день — 13 августа: 43 коммита, с 03:27 до 23:57.", he: "היום העמוס ביותר היה 13 באוגוסט: 43 קומיטים, מ־03:27 עד 23:57." },
              { en: "The repository did not start empty: its first upload, on 10 August, already held 13,514 lines, the twelve stages of work that the app's own changelog records.",
                ru: "Репозиторий начался не с нуля: первая загрузка, 10 августа, уже содержала 13 514 строк — двенадцать этапов работы, которые записаны в журнале изменений самого приложения.", he: "המאגר לא התחיל ריק: ההעלאה הראשונה, ב־10 באוגוסט, כבר הכילה 13,514 שורות — שנים־עשר שלבי העבודה שמתועדים ביומן השינויים של האפליקציה עצמה." },
              { en: "About 58,800 lines in all today (measured 24 November). By kind: code 22,800 · courses (lessons and questions) 13,000 · styles (CSS) 5,600 · database 4,600 · documentation 10,000 · research notes 2,800.",
                ru: "Всего сейчас около 58 800 строк (замер 24 ноября). Из них: код — 22 800, курсы (уроки и вопросы) — 13 000, оформление (CSS) — 5 600, база данных — 4 600, документация — 10 000, заметки исследований — 2 800.", he: "כ־58,800 שורות בסך הכול היום (נמדד ב־24 בנובמבר). לפי סוג: קוד — 22,800, קורסים (שיעורים ושאלות) — 13,000, עיצוב (CSS) — 5,600, מסד נתונים — 4,600, תיעוד — 10,000, רשימות מחקר — 2,800." }
            ] }
          ],
          images: [
            shot("museum/history/hours.svg", { en: "Commits by hour of the day, 10 August to 24 November. A third came between midnight and six in the morning.", ru: "Коммиты по часам суток, с 10 августа по 24 ноября. Треть — между полуночью и шестью утра.", he: "קומיטים לפי שעה ביממה, מ־10 באוגוסט עד 24 בנובמבר. שליש נעשו בין חצות לשש בבוקר." }, 600, 170)
          ],
          more: [
            { en: "Attention to detail, in small things that were not left alone:",
              ru: "Внимание к мелочам — в вещах, которые не оставили как есть:", he: "תשומת לב לפרטים, בדברים קטנים שלא נשארו כמו שהם:" },
            { list: [
              { en: "In the e-bike course the figure crosses only at the zebras: its path is computed over a graph of sidewalks and crossings.",
                ru: "В курсе по электровелосипеду человечек переходит дорогу только по зебрам: его путь считается по графу тротуаров и переходов.", he: "בקורס האופניים החשמליים הדמות חוצה רק במעברי חצייה: המסלול שלה מחושב על גרף של מדרכות ומעברים." },
              { en: "Questions and their options reshuffle on every attempt, because hand-written answer keys drift: in one module the right answer was B in 10 of 11 questions.",
                ru: "Вопросы и варианты перемешиваются при каждой попытке, потому что ключи, написанные вручную, перекашиваются: в одном модуле верным был вариант B в 10 вопросах из 11.", he: "שאלות והאפשרויות שלהן מעורבבות בכל ניסיון, כי מפתחות תשובות שנכתבים ביד נוטים להטות: במודול אחד התשובה הנכונה הייתה B ב־10 מתוך 11 שאלות." },
              { en: "A Forum view counts only after five seconds on screen: a scroll past counts nothing, a second visit does not count twice, and your own post never counts.",
                ru: "Просмотр на форуме засчитывается только после пяти секунд на экране: пролистывание не считается, повторный визит не считается дважды, а свой пост — никогда.", he: "צפייה בפורום נספרת רק אחרי חמש שניות על המסך: גלילה חולפת לא נספרת, ביקור שני לא נספר פעמיים, והפוסט שלכם לעולם לא נספר." },
              { en: "A uniqueness rule the database was not enforcing was found by asking the database's own catalogue, not by rereading the rule.",
                ru: "Правило уникальности, которое база не соблюдала, нашли, спросив собственный каталог базы, а не перечитав правило.", he: "כלל ייחודיות שמסד הנתונים לא אכף נמצא בשאילתה לקטלוג של מסד הנתונים עצמו, לא בקריאה חוזרת של הכלל." },
              { en: "The demo's sample student has every date relative to today, so a visit a year from now still finds three reviews due and nothing withered.",
                ru: "У ученика из демо все даты отсчитываются от сегодняшнего дня, поэтому и через год найдутся три повторения на сегодня, и ничего не завянет.", he: "לתלמיד לדוגמה בדמו כל התאריכים יחסיים להיום, כך שגם ביקור בעוד שנה ימצא שלוש חזרות להיום ושום דבר שנבל." },
              { en: "A cloud drifting over a button never steals its click, and the sky cannot be aimed at through the garden that hides it.",
                ru: "Облако, проплывающее над кнопкой, никогда не крадёт её нажатие, а в небо нельзя прицелиться сквозь сад, который его закрывает.", he: "ענן שחולף מעל כפתור לעולם לא גונב את הלחיצה שלו, ואי אפשר לכוון אל השמיים דרך הגינה שמסתירה אותם." },
              { en: "The rank sticker takes seven seconds of real rubbing to peel; a finger held still does not count.",
                ru: "Наклейку на ранге нужно тереть семь секунд по-настоящему; если просто держать палец, это не считается.", he: "כדי לקלף את מדבקת הדרגה צריך שבע שניות של שפשוף אמיתי; אצבע שעומדת במקום לא נחשבת." }
            ] },
            { en: "The logic of the work: one decision at a time, each written down with the case against it; a queue of what is still owed and a record of what is done; numbers measured rather than remembered, and a wrong one corrected in place, with a date; features in folders that can be removed without breaking the rest; and nothing counted as done until it was seen working in a browser.",
              ru: "Логика работы: одно решение за раз, и каждое записано вместе с доводами против; очередь того, что ещё не сделано, и журнал сделанного; числа измеряются, а не берутся по памяти, а ошибочное исправляется на месте, с датой; функции живут в папках, которые можно убрать, не сломав остального; и ничто не считается готовым, пока не проверено в браузере.", he: "ההיגיון של העבודה: החלטה אחת בכל פעם, וכל אחת כתובה יחד עם הנימוקים נגדה; תור של מה שעוד חייבים ויומן של מה שנעשה; מספרים שנמדדים ולא נזכרים, ומספר שגוי שמתוקן במקום, עם תאריך; תכונות בתיקיות שאפשר להסיר בלי לשבור את השאר; ושום דבר לא נחשב גמור עד שנראה עובד בדפדפן." }
          ],
          code: { en: "git log; docs/CHANGELOG.md for the stages before the first commit", ru: "git log; docs/CHANGELOG.md — этапы до первого коммита", he: "git log; docs/CHANGELOG.md לשלבים שלפני הקומיט הראשון" }
        },
        {
          icon: "\u{1F94B}", title: { en: "10–12 August: Dojo", ru: "10–12 августа: Dojo", he: "10–12 באוגוסט: Dojo" },
          body: [
            { en: "It started at the Open University. Two versions of the same textbook had drifted apart, and studying from them was irritating enough to try another way: to gamify studying, automate it and optimise it. That attempt was called Dojo.",
              ru: "Всё началось в Открытом университете. Две версии одного учебника разошлись между собой, и учиться по ним было так досадно, что захотелось попробовать иначе: геймифицировать учёбу, автоматизировать её и оптимизировать. Эта попытка называлась Dojo.", he: "זה התחיל באוניברסיטה הפתוחה. שתי גרסאות של אותו ספר לימוד התרחקו זו מזו, וללמוד מהן היה מעצבן מספיק כדי לנסות דרך אחרת: להפוך את הלימוד למשחק, לאוטומט אותו ולייעל אותו. הניסיון הזה נקרא Dojo." },
            { en: "Dojo道場 had no account and kept everything in the browser. Its tagline called it “an offline study system”, a word dropped two days later. The lobby was a plain list.",
              ru: "У Dojo道場 не было аккаунта, всё хранилось в браузере. Слоган называл его «офлайн-системой для учёбы», и это слово убрали через два дня. Лобби было простым списком.", he: "ל־Dojo道場 לא היה חשבון, והכול נשמר בדפדפן. הסלוגן קרא לו \"מערכת לימוד אופליין\", מילה שהוסרה כעבור יומיים. הלובי היה רשימה פשוטה." },
            { en: "Inside: the first Intro to CS lessons, a rank ladder shaped like a research lab, from Lab Intern up, and an Arcade of small games bought with dollars earned by studying (see “The Arcade” in Set aside).",
              ru: "Внутри: первые уроки Intro to CS, лестница рангов в виде научной лаборатории, от стажёра и выше, и Аркада мини-игр, которые покупались за доллары, заработанные учёбой (см. «Аркаду» в зале «На покое»).", he: "בפנים: השיעורים הראשונים של Intro to CS, סולם דרגות בצורת מעבדת מחקר, ממתמחה במעבדה ומעלה, וארקייד של משחקונים שנקנו בדולרים שהורווחו בלמידה (ראו \"הארקייד\" באולם \"הונח בצד\")." }
          ],
          images: [
            shot("museum/history/0812-start.jpg", { en: "The start screen on 12 August.", ru: "Стартовый экран 12 августа.", he: "מסך הפתיחה ב־12 באוגוסט." }),
            shot("museum/history/0812-lobby.jpg", { en: "The lobby: a list, with the Arcade and Statistics as doors of their own.", ru: "Лобби: список, у Аркады и Статистики свои двери.", he: "הלובי: רשימה, עם דלתות נפרדות לארקייד ולסטטיסטיקה." })
          ],
          more: [
            { en: "There was also a life simulation: food, shelter and “vitals” that went down as you played, with a shop to keep them up. It was taken out on 13 August, a day after a story mode.",
              ru: "Была и симуляция жизни: еда, жильё и «жизненные показатели», которые таяли во время игры, и магазин, чтобы их поддерживать. Её убрали 13 августа, на день позже режима истории.", he: "הייתה גם סימולציית חיים: אוכל, מחסה ו\"מדדים חיוניים\" שירדו בזמן המשחק, עם חנות לשמור עליהם. היא הוצאה ב־13 באוגוסט, יום אחרי מצב הסיפור." },
            { en: "Much of the first week went into games and an economy around studying, and most of that was taken out later.",
              ru: "Немалая часть первой недели ушла на игры и экономику вокруг учёбы, и бо́льшую часть этого потом убрали.", he: "חלק גדול מהשבוע הראשון הלך על משחקים וכלכלה סביב הלימוד, ורובם הוצאו אחר כך." }
          ],
          code: "git fb7b3e2 … 09dfde2"
        },
        {
          icon: "\u{1FA99}", title: { en: "13–14 August: an economy", ru: "13–14 августа: экономика", he: "13–14 באוגוסט: כלכלה" },
          body: [
            { en: "Two days, 62 commits. Tokens arrived as a third currency for buying courses, first named Stars, with a Token Shop, packs and patron tiers. Flashcards got four levels of confidence, and a Final Quiz closed the course.",
              ru: "Два дня, 62 коммита. Появились токены — третья валюта для покупки курсов, сначала называвшаяся «звёздами», — с магазином токенов, наборами и уровнями патронов. Карточки получили четыре уровня уверенности, а курс — итоговый тест.", he: "יומיים, 62 קומיטים. הגיעו אסימונים — מטבע שלישי לקניית קורסים, שנקרא בהתחלה \"כוכבים\" — עם חנות אסימונים, חבילות ודרגות תומכים. הכרטיסיות קיבלו ארבע רמות ביטחון, ומבחן מסכם סגר את הקורס." },
            { en: "The lobby became the Star: tiles on a ring with a spark orbiting it, and a Magen David mode in Ukrainian and Israeli colours. A security audit found that everything lived in the browser, which is what later sent rewards to a server.",
              ru: "Лобби стало «Звездой»: плитки на кольце, вокруг которого кружит искра, и режим Звезды Давида в цветах Украины и Израиля. Аудит безопасности показал, что всё живёт в браузере, — именно это позже увело награды на сервер.", he: "הלובי הפך ל\"כוכב\": אריחים על טבעת שניצוץ מקיף אותה, ומצב מגן דוד בצבעי אוקראינה וישראל. בדיקת אבטחה מצאה שהכול חי בדפדפן, ובגלל זה הפרסים עברו מאוחר יותר לשרת." }
          ],
          images: [
            shot("museum/history/0814-lobby.jpg", { en: "The Star lobby on 14 August. The Arcade still has its tile, emptied that day.", ru: "Лобби-«Звезда» 14 августа. У Аркады ещё есть плитка — в тот день её опустошили.", he: "לובי ה\"כוכב\" ב־14 באוגוסט. לארקייד עוד יש אריח, שהתרוקן באותו יום." })
          ],
          more: [
            { en: "On 14 August the casino games were removed and the Arcade left empty. The same day brought synthesized sound effects, an inventory where things are tried on by dragging them, and a ban that wipes an account.",
              ru: "14 августа казино-игры убрали, и Аркада опустела. В тот же день появились синтезированные звуки, инвентарь, где вещи примеряются перетаскиванием, и бан, который стирает аккаунт.", he: "ב־14 באוגוסט משחקי הקזינו הוסרו והארקייד נשאר ריק. באותו יום הגיעו אפקטים קוליים מסונתזים, מלאי שבו מודדים פריטים בגרירה, וחסימה שמוחקת חשבון." }
          ],
          code: "git 19e270a … 201337b"
        },
        {
          icon: "☁️", title: { en: "15–16 August: the sky, and a turn", ru: "15–16 августа: небо и поворот", he: "15–16 באוגוסט: השמיים, ותפנית" },
          body: [
            { en: "For nine days the app had no name: its start screen said “Unnamed App”. It got a sky you can poke: clouds that rain, birds, a sun by day and, by night, a moon that answers with bats.",
              ru: "Девять дней у приложения не было имени: на стартовом экране так и было написано — «Unnamed App». Появилось небо, в которое можно тыкать: облака проливаются дождём, птицы, днём солнце, а ночью луна, которая отвечает летучими мышами.", he: "במשך תשעה ימים לאפליקציה לא היה שם: במסך הפתיחה היה כתוב \"Unnamed App\". היא קיבלה שמיים שאפשר לגעת בהם: עננים שממטירים, ציפורים, שמש ביום, ובלילה ירח שעונה בעטלפים." },
            { en: "Then the turn: every paid cosmetic became free, and the Arcade gave its tile to a Forum, where reputation earned by remembering is spent only on other people.",
              ru: "А потом поворот: всё платное оформление стало бесплатным, а Аркада отдала свою плитку Форуму, где репутацию, заработанную запоминанием, тратят только на других.", he: "ואז התפנית: כל פריט עיצוב בתשלום הפך לחינמי, והארקייד מסר את האריח שלו לפורום, שבו מוניטין שהורווח בזכירה מוציאים רק על אחרים." }
          ],
          images: [
            shot("museum/history/0816-start.jpg", { en: "“Unnamed App”, 16 August. The start screen still promises the Arcade.", ru: "«Unnamed App», 16 августа. Стартовый экран ещё обещает Аркаду.", he: "\"Unnamed App\", 16 באוגוסט. מסך הפתיחה עוד מבטיח את הארקייד." }),
            shot("museum/history/0816-lobby.jpg", { en: "The lobby under the night sky, with the Forum where the Arcade was.", ru: "Лобби под ночным небом, Форум на месте Аркады.", he: "הלובי תחת שמי הלילה, עם הפורום במקום שבו היה הארקייד." })
          ],
          more: [
            { en: "The documents were rewritten around the real goal, the source was put under an all-rights-reserved licence, Supabase was chosen for the server over Firebase, and four science courses were planned.",
              ru: "Документы переписали вокруг настоящей цели, код закрыли лицензией «все права защищены», для сервера выбрали Supabase вместо Firebase и спланировали четыре научных курса.", he: "המסמכים נכתבו מחדש סביב המטרה האמיתית, הקוד קיבל רישיון \"כל הזכויות שמורות\", Supabase נבחר לשרת במקום Firebase, ותוכננו ארבעה קורסים במדעים." }
          ],
          code: "git 4a9c3c3 … 74535f8"
        },
        {
          icon: "\u{1F514}", title: { en: "24–26 August: Knell", ru: "24–26 августа: Knell", he: "24–26 באוגוסט: Knell" },
          body: [
            { en: "The app was named Knell, the sound of a bell. A second course arrived, A3 Theory for electric bicycles, built on the Israeli Ministry of Transport's question bank, with a mock exam on the real test's terms, and the interface learned Russian.",
              ru: "Приложение назвали Knell — это звон колокола. Появился второй курс, A3 Theory для электровелосипедов, по банку вопросов Министерства транспорта Израиля, с пробным экзаменом на условиях настоящего, а интерфейс заговорил по-русски.", he: "האפליקציה נקראה Knell — צליל של פעמון. הגיע קורס שני, תאוריה A3 לאופניים חשמליים, על בסיס מאגר השאלות של משרד התחבורה, עם מבחן תרגול בתנאי המבחן האמיתי, והממשק למד רוסית." },
            { en: "A third followed: Philosophy, on Cicero, researched from books before a word of it was written.",
              ru: "За ним третий: философия, о Цицероне, — сначала исследование по книгам, и только потом текст.", he: "אחריו בא שלישי: פילוסופיה, על קיקרו, שנחקר מתוך ספרים לפני שנכתבה בו מילה." }
          ],
          images: [
            shot("museum/history/0826-start.jpg", { en: "The first start screen called Knell, 26 August.", ru: "Первый стартовый экран с именем Knell, 26 августа.", he: "מסך הפתיחה הראשון בשם Knell, 26 באוגוסט." }),
            shot("museum/history/0826-library.jpg", { en: "The Library: three courses, and Intro to CS still for sale at 700 tokens.", ru: "Библиотека: три курса, и Intro to CS ещё продаётся за 700 токенов.", he: "הספרייה: שלושה קורסים, ו־Intro to CS עוד נמכר ב־700 אסימונים." })
          ],
          more: [
            { en: "The e-bike course was the first written to the content standard from its first line. Five of its facts were corrected against the regulation text itself, and one crossing rule after reading the road sign.",
              ru: "Курс по электровелосипеду первым написан по стандарту контента с первой строки. Пять его фактов исправлены по самому тексту правил, а одно правило перехода — после чтения дорожного знака.", he: "קורס האופניים החשמליים היה הראשון שנכתב לפי תקן התוכן משורתו הראשונה. חמש מהעובדות שלו תוקנו מול נוסח התקנות עצמו, וכלל חצייה אחד — אחרי קריאת תמרור הדרך." },
            { en: "Intro to CS started loading only when opened, which took 43% of the JavaScript off every visit.",
              ru: "Intro to CS стал загружаться только при открытии — это сняло 43% JavaScript с каждого визита.", he: "Intro to CS התחיל להיטען רק כשפותחים אותו, וזה הוריד 43% מה־JavaScript מכל ביקור." }
          ],
          code: "git dd0bc30 … 81b3773"
        },
        {
          icon: "\u{1F511}", title: { en: "27 August – 3 September: the server", ru: "27 августа – 3 сентября: сервер", he: "27 באוגוסט – 3 בספטמבר: השרת" },
          body: [
            { en: "Accounts became mandatory, and everything went behind this door. Behind it: sync across devices, rewards the server pays from its own ledger, and the Forum, built in six steps from schema to moderation.",
              ru: "Аккаунты стали обязательными, и всё оказалось за этой дверью. За ней — синхронизация между устройствами, награды, которые сервер платит из собственного журнала, и Форум, построенный в шесть шагов от схемы до модерации.", he: "חשבונות הפכו לחובה, והכול עבר אל מאחורי הדלת הזאת. מאחוריה: סנכרון בין מכשירים, פרסים שהשרת משלם מיומן החשבונות שלו, והפורום, שנבנה בשישה שלבים מהסכמה ועד המודרציה." },
            { en: "This door is also where the real app stops today: the database went to sleep after two months without use.",
              ru: "На этой же двери сегодня останавливается настоящее приложение: база уснула после двух месяцев без использования.", he: "באותה דלת האפליקציה האמיתית נעצרת היום: מסד הנתונים נרדם אחרי חודשיים בלי שימוש." }
          ],
          images: [
            shot("museum/history/0903-signin.jpg", { en: "Sign-in, 3 September: an email or a nickname, and a password.", ru: "Вход, 3 сентября: почта или ник и пароль.", he: "כניסה, 3 בספטמבר: אימייל או כינוי, וסיסמה." })
          ],
          more: [
            { en: "Found on the way: a reward endpoint that paid 800 XP in four calls, a race that let 8 of 8 simultaneous reputation grants through where 2 were allowed, and a signup broken for everyone but the first user. All three were closed.",
              ru: "Найдено по дороге: способ получать награду, который выдал 800 опыта за четыре вызова; гонка, при которой проходили 8 из 8 одновременных выдач репутации вместо 2; и регистрация, сломанная для всех, кроме первого пользователя. Все три закрыты.", he: "נמצאו בדרך: נקודת קצה לפרסים ששילמה 800 XP בארבע קריאות, מרוץ שהעביר 8 מתוך 8 הענקות מוניטין בו־זמניות כשמותר היה 2, והרשמה שהייתה שבורה לכולם חוץ מהמשתמש הראשון. שלושתם נסגרו." },
            { en: "The Garden learned to wither when neglected, and to go on holiday. The learning engine was researched, and the research was checked rather than trusted.",
              ru: "Сад научился вянуть без ухода и уходить в отпуск. Движок обучения исследовали, а исследование проверяли, а не принимали на веру.", he: "הגינה למדה לנבול כשמזניחים אותה, ולצאת לחופשה. מנוע הלמידה נחקר, והמחקר נבדק במקום להתקבל כמובן מאליו." }
          ],
          code: "git 5108c38 … 2dab4f3"
        },
        {
          icon: "\u{1F4D0}", title: { en: "13 October: one constant", ru: "13 октября: одна константа", he: "13 באוקטובר: קבוע אחד" },
          body: [
            { en: "A single commit after six quiet weeks: a review that only just passes stops earning an expert's intervals. Measured, that learner's sixth review moves from 238 days to 153, while a perfect one stays at 393. Ten decisions for the learning engine were written down the same day.",
              ru: "Один коммит после шести тихих недель: повторение, сданное еле-еле, больше не получает промежутков отличника. Измерено: шестое повторение такого ученика переезжает с 238 дней на 153, а у идеального остаётся 393. В тот же день записали десять решений для движка обучения.", he: "קומיט יחיד אחרי שישה שבועות שקטים: חזרה שעוברת בקושי מפסיקה לקבל מרווחים של מומחה. במדידה, החזרה השישית של לומד כזה זזה מ־238 יום ל־153, ושל לומד מושלם נשארת על 393. באותו יום נכתבו עשר החלטות למנוע הלמידה." }
          ],
          code: "git fcd81ae"
        },
        {
          icon: "\u{1F5BC}️", title: { en: "19–22 November: a portfolio piece", ru: "19–22 ноября: работа для портфолио", he: "19–22 בנובמבר: עבודה לתיק העבודות" },
          body: [
            { en: "With the server asleep, the app became something anyone can open: this demo, with no account and no production key in it. Courses became places, the start screen became a garden, and this museum took the Forum's tile.",
              ru: "Пока сервер спит, приложение стало тем, что может открыть каждый: этим демо, без аккаунта и без рабочих ключей внутри. Курсы стали местами, стартовый экран — садом, а этот музей занял плитку Форума.", he: "כשהשרת ישן, האפליקציה הפכה למשהו שכל אחד יכול לפתוח: הדמו הזה, בלי חשבון ובלי שום מפתח ייצור. קורסים הפכו למקומות, מסך הפתיחה הפך לגינה, והמוזיאון הזה לקח את האריח של הפורום." }
          ],
          images: [
            shot("museum/history/1122-scene.jpg", { en: "The e-bike course as a place: a junction at night, each chapter where it happens.", ru: "Курс по электровелосипеду как место: ночной перекрёсток, каждая глава там, где она происходит.", he: "קורס האופניים כמקום: צומת בלילה, וכל פרק במקום שבו הוא קורה." })
          ],
          more: [
            { en: "Also in these days: the service worker's cache was retired, because it served returning visitors an old copy; a letter went into the mailbox at the garden gate; and the rank line got a sticker to peel.",
              ru: "А ещё в эти дни сняли кэш service worker — он показывал вернувшимся старую копию; в почтовый ящик у входа в сад положили письмо, а на строку ранга — наклейку, которую надо отклеить.", he: "גם בימים האלה: המטמון של ה־service worker הוסר, כי הוא הגיש למבקרים חוזרים עותק ישן; מכתב נכנס לתיבת הדואר בשער הגינה; ושורת הדרגה קיבלה מדבקה לקלף." }
          ],
          code: "git 77a563a … 20c698a"
        },
        {
          icon: "\u{1F30D}", title: { en: "23–24 November: three languages", ru: "23–24 ноября: три языка", he: "23–24 בנובמבר: שלוש שפות" },
          body: [
            { en: "Hebrew arrived, the first language read right to left: every screen in three languages, both written courses translated, and the e-bike course's forty official questions taken in the Ministry's own Hebrew wording rather than translated, their answer keys checked against all forty. A course written only in English stays English inside the Hebrew app, left to right, lettered A to D.",
              ru: "Пришёл иврит, первый язык, который читается справа налево: каждый экран на трёх языках, оба написанных курса переведены, а сорок официальных вопросов курса по электровелосипеду взяты в ивритской формулировке самого министерства, а не переведены, и их ключи сверены все сорок. Курс, написанный только по-английски, внутри ивритского приложения остаётся английским: слева направо, с буквами от A до D.", he: "הגיעה העברית, השפה הראשונה שנקראת מימין לשמאל: כל מסך בשלוש שפות, שני הקורסים הכתובים תורגמו, וארבעים השאלות הרשמיות של קורס האופניים החשמליים נלקחו בנוסח העברי של המשרד עצמו ולא תורגמו, ומפתחות התשובות נבדקו מול כל הארבעים. קורס שנכתב רק באנגלית נשאר באנגלית גם בתוך האפליקציה בעברית: משמאל לימין, עם האותיות A עד D." }
          ],
          more: [
            { en: "And the last of the sky: the clouds, the sun and the moon got sounds of their own, darts a hit, and a hot-air balloon came to drift over the lobby, bursting into confetti and fireworks when tapped, followed now and then by a plane towing a banner, ☮ da plane, and a rocket.",
              ru: "И последнее в небе: облака, солнце и луна получили свои звуки, дротики — попадание, а над лобби поплыл воздушный шар, который по тапу рассыпается конфетти и фейерверком; за ним иногда пролетают самолёт с баннером «☮ da plane» и ракета.", he: "והאחרונים בשמיים: העננים, השמש והירח קיבלו צלילים משלהם, חצי הקליעה — פגיעה, ומעל הלובי התחיל לשוט כדור פורח שמתפוצץ לקונפטי ולזיקוקים בנגיעה, ואחריו מדי פעם חולפים מטוס שגורר שלט, ☮ da plane, וטיל." }
          ],
          code: { en: "git fe1ea30 … today", ru: "git fe1ea30 … сегодня", he: "git fe1ea30 … היום" }
        }
      ]
    },
    {
      title: { en: "Set aside", ru: "На покое", he: "הונח בצד" },
      scene: "museum-aside",
      exhibits: [
        {
          icon: "\u{1F6A6}", title: { en: "The first start screen", ru: "Первый стартовый экран", he: "מסך הפתיחה הראשון" },
          body: [
            { en: "Until November 2026 the start screen showed the e-bike course's junction. It gave way to the garden because it showed one course, not the idea behind all of them. It still lives in the e-bike course, and here it still runs: tap a chapter.",
              ru: "До ноября 2026 года на стартовом экране был перекрёсток из курса по электровелосипеду. Его сменил сад: перекрёсток показывал один курс, а не идею всех курсов. Он по-прежнему живёт в курсе, а здесь его можно запустить: нажмите на главу.", he: "עד נובמבר 2026 מסך הפתיחה הראה את הצומת של קורס האופניים. הוא פינה את מקומו לגינה כי הראה קורס אחד, ולא את הרעיון שמאחורי כולם. הוא עדיין חי בקורס האופניים, וכאן הוא עדיין רץ: געו בפרק." }
          ],
          scene: "bike-a3"
        },
        {
          icon: "\u{1F579}️", title: { en: "The Arcade", ru: "Аркада", he: "הארקייד" },
          body: [
            { en: "Knell once had an Arcade of four small games, each bought once with dollars earned by studying. It was removed on purpose and replaced by the Forum, where what you earn by remembering is given to other people.",
              ru: "Когда-то в Knell была Аркада из четырёх мини-игр, каждую покупали один раз за доллары, заработанные учёбой. Её убрали намеренно и заменили форумом, где заработанное запоминанием отдают другим людям.", he: "פעם היה ב־Knell ארקייד של ארבעה משחקונים, וכל אחד נקנה פעם אחת בדולרים שהורווחו בלמידה. הוא הוסר בכוונה והוחלף בפורום, שבו את מה שמרוויחים בזכירה נותנים לאחרים." }
          ],
          images: [
            shot("museum/arcade/arcade.jpg", { en: "The Arcade as a newcomer saw it, 12 August: $0, seven tickets, four games to buy.", ru: "Аркада глазами новичка, 12 августа: $0, семь билетов, четыре игры на покупку.", he: "הארקייד כמו שמשתמש חדש ראה אותו, 12 באוגוסט: $0, שבעה כרטיסים, ארבעה משחקים לקנייה." }, 576, 350),
            shot("museum/arcade/crash.jpg", { en: "Crash ($75): the multiplier climbs until the curve breaks. Cash out before it does.", ru: "Crash ($75): множитель растёт, пока кривая не сломается. Успейте забрать раньше.", he: "Crash ($75): המכפיל עולה עד שהעקומה נשברת. פדו לפני שזה קורה." }, 576, 385),
            shot("museum/arcade/hilo.jpg", { en: "Hi-Lo ($150): call higher or lower. A wrong call takes the whole chain.", ru: "Hi-Lo ($150): выше или ниже. Ошибка забирает всю цепочку.", he: "Hi-Lo ($150): גבוה או נמוך. ניחוש שגוי לוקח את כל השרשרת." }, 485, 325),
            shot("museum/arcade/mines.jpg", { en: "Mines ($200): choose the field and the mines, open safe tiles, stop when you like.", ru: "Mines ($200): выберите поле и число мин, открывайте безопасные клетки и остановитесь, когда захотите.", he: "Mines ($200): בוחרים שדה ומספר מוקשים, פותחים משבצות בטוחות ועוצרים מתי שרוצים." }, 492, 422),
            shot("museum/arcade/blackjack.jpg", { en: "Blackjack ($300): classic 21, the dealer stands on 17.", ru: "Blackjack ($300): классическое очко, дилер останавливается на 17.", he: "Blackjack ($300): עשרים ואחת קלאסי, הדילר עוצר ב־17." }, 395, 325)
          ],
          more: [
            { en: "Every round cost one ticket, seven tickets came back every six hours, and a stake was capped at $50. The Arcade's own screen said why: a break between study sessions, not an income.",
              ru: "Каждый раунд стоил билет, семь билетов возвращались каждые шесть часов, а ставка была не больше $50. Сам экран Аркады объяснял зачем: это перерыв между учёбой, а не заработок.", he: "כל סיבוב עלה כרטיס אחד, שבעה כרטיסים חזרו כל שש שעות, וההימור הוגבל ל־$50. המסך של הארקייד עצמו הסביר למה: הפסקה בין שיעורים, לא מקור הכנסה." },
            { en: "The house kept a small edge in every game, and the games said so: Crash, for one, paid back 96% of what was staked in the long run. A dearer game was a better game, not one with a bigger cut.",
              ru: "В каждой игре у заведения было небольшое преимущество, и игры об этом говорили: Crash, например, в долгую возвращал 96% поставленного. Игра подороже была лучше, а не с большей долей заведения.", he: "לבית היה יתרון קטן בכל משחק, והמשחקים אמרו את זה: Crash, למשל, החזיר בטווח הארוך 96% ממה שהומר. משחק יקר יותר היה משחק טוב יותר, לא כזה עם נתח גדול יותר לבית." },
            { en: "The casino games were removed on 14 August, and two days later the Forum took the tile. These pictures come from the version of 12 August, run again for this museum.",
              ru: "Казино-игры убрали 14 августа, а через два дня плитку занял Форум. Эти снимки сделаны с версии от 12 августа, запущенной заново для этого музея.", he: "משחקי הקזינו הוסרו ב־14 באוגוסט, ויומיים אחר כך הפורום לקח את האריח. התמונות האלה מגיעות מהגרסה של 12 באוגוסט, שהורצה שוב בשביל המוזיאון הזה." }
          ],
          code: { en: "games/ in commit 09dfde2: crash.js, hilo.js, mines.js, blackjack.js", ru: "games/ в коммите 09dfde2: crash.js, hilo.js, mines.js, blackjack.js", he: "games/ בקומיט 09dfde2: crash.js, hilo.js, mines.js, blackjack.js" }
        }
      ]
    },
    {
      title: { en: "How to", ru: "Как пользоваться", he: "איך משתמשים" },
      scene: "museum-howto",
      exhibits: [
        {
          icon: "\u{1F9ED}", title: { en: "Finding your way", ru: "Куда что ведёт", he: "איך מתמצאים" },
          body: [
            { en: "The circles in the lobby take you somewhere: the Library to the courses, the Garden to what is due today, Career to your rank.",
              ru: "Круги в лобби ведут в разные места: Библиотека — к курсам, Сад — к тому, что пора повторить сегодня, Карьера — к вашему рангу.", he: "העיגולים בלובי מובילים למקומות: הספרייה לקורסים, הגינה למה שצריך לחזור עליו היום, הקריירה לדרגה שלכם." },
            { en: "In a course, tap a chapter and the runner goes there and opens it. In the Garden, water a plant to review its topic.",
              ru: "В курсе нажмите на главу — человечек добежит туда и откроет её. В Саду полейте растение, чтобы повторить его тему.", he: "בקורס, געו בפרק והדמות רצה אליו ופותחת אותו. בגינה, השקו צמח כדי לחזור על הנושא שלו." },
            { en: "Poke the sky: clouds rain, birds dodge arrows, the wheel in the lobby takes darts, and the hot-air balloon that drifts by now and then bursts into fireworks.",
              ru: "Потыкайте в небо: облака проливаются дождём, птицы уворачиваются от стрел, колесо в лобби принимает дротики, а воздушный шар, который иногда проплывает мимо, рассыпается фейерверком.", he: "געו בשמיים: עננים מורידים גשם, ציפורים מתחמקות מחצים, הגלגל בלובי סופג חצי קליעה, והכדור הפורח שחולף מדי פעם מתפוצץ לזיקוקים." }
          ]
        },
        {
          icon: "\u{2728}", title: { en: "Small joys", ru: "Маленькие радости", he: "שמחות קטנות" },
          body: [
            { en: "Things in Knell that are there for the fun of it:",
              ru: "То, что в Knell есть просто для удовольствия:", he: "דברים ב־Knell שקיימים רק בשביל הכיף:" },
            { list: [
              { en: "Peel the rank sticker: seven seconds of real rubbing.",
              ru: "Отклейте наклейку с рангом: семь секунд честного трения.", he: "קלפו את מדבקת הדרגה: שבע שניות של שפשוף אמיתי." },
              { en: "Sign the enrolment contract with the mouse. Nothing checks it.",
              ru: "Подпишите договор о зачислении мышкой. Его никто не проверяет.", he: "חתמו על חוזה ההרשמה בעכבר. אף אחד לא בודק אותו." },
              { en: "On the start screen, send the runner to ring the bell the app is named after, and take the letter from the mailbox.",
              ru: "На стартовом экране отправьте человечка звонить в колокол, в честь которого названо приложение, и достаньте письмо из почтового ящика.", he: "במסך הפתיחה שלחו את הרץ לצלצל בפעמון שעל שמו נקראת האפליקציה, וקחו את המכתב מתיבת הדואר." },
              { en: "Shoot arrows at the eagles; some dodge. Throw darts at the lobby's wheel.",
              ru: "Стреляйте в орлов: некоторые уворачиваются. Бросайте дротики в колесо лобби.", he: "ירו חצים בנשרים; חלקם מתחמקים. זרקו חצי קליעה על הגלגל בלובי." },
              { en: "Wait for the hot-air balloon, then tap it. Look out for da plane ☮.",
              ru: "Дождитесь воздушного шара и тапните его. Высматривайте da plane ☮.", he: "חכו לכדור הפורח ואז געו בו. חפשו את da plane ☮." },
              { en: "Switch day and night: the scenes' lamps follow, and their windows can keep the stars by day.",
              ru: "Переключайте день и ночь: фонари в сценах следуют за небом, а окна могут и днём показывать звёзды.", he: "החליפו בין יום ללילה: הפנסים בסצנות הולכים אחרי השמיים, והחלונות יכולים להשאיר כוכבים גם ביום." }
            ] }
          ]
        },
        {
          icon: "✉️", title: { en: "The letter", ru: "Письмо", he: "המכתב" },
          body: [
            { en: "A letter for whoever opens Knell, now or years from now. It is also in the mailbox at the garden gate on the start screen.",
              ru: "Письмо тому, кто откроет Knell, сейчас или через годы. Оно же лежит в почтовом ящике у входа в сад на стартовом экране.", he: "מכתב למי שיפתח את Knell, עכשיו או בעוד שנים. הוא גם בתיבת הדואר בשער הגינה במסך הפתיחה." }
          ],
          action: { label: { en: "Read it", ru: "Прочитать", he: "לקרוא" }, run: () => Dojo.openLetter && Dojo.openLetter() }
        },
        // Asked 2026-11-24: «Оставь в музее обратная связь … (почту) и
        // инстаграм isk1zz». The author's own choice to publish both.
        {
          icon: "\u{1F4E8}", title: { en: "Feedback", ru: "Обратная связь", he: "משוב" },
          body: [
            { en: "Found a bug, have an idea, or want to say what you think of Knell? Write to its author, by email or on Instagram.",
              ru: "Нашли ошибку, есть идея или хотите сказать, что думаете о Knell? Напишите автору — на почту или в Instagram.", he: "מצאתם באג, יש לכם רעיון, או שאתם רוצים לומר מה אתם חושבים על Knell? כתבו למחבר, במייל או באינסטגרם." }
          ],
          links: [
            { href: "mailto:" + MAIL, text: MAIL },
            { href: "https://www.instagram.com/isk1zz/", text: "Instagram @isk1zz" }
          ]
        }
      ]
    }
  ];

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };
  const R = v => I18N.resolve(v);

  // Scenes running inside open exhibits, destroyed on every re-render.
  let running = [];

  // A paragraph, or { list } for a bulleted list: the same in a card's
  // short text and in its "Read more".
  function block(item) {
    if (!item.list) return el("p", "museum-text", R(item));
    const ul = el("ul", "museum-list");
    item.list.forEach(li => ul.appendChild(el("li", null, R(li))));
    return ul;
  }

  // The "Read more" inside a card: a fold of its own, closed until asked
  // for, so a card reads short first. Paragraphs, lists, then the files.
  function moreFold(x) {
    const fold = el("details", "museum-more");
    fold.appendChild(el("summary", "museum-more-summary", R(MORE)));
    x.more.forEach(item => fold.appendChild(block(item)));
    if (x.code) {
      const where = el("p", "museum-code", R(IN_CODE) + " ");
      where.appendChild(el("code", null, R(x.code)));
      fold.appendChild(where);
    }
    return fold;
  }

  // A picture opens over the page, not in place of it (2026-11-23, «i cant
  // close the pic i opened in museum»). It used to be a link to a new tab,
  // and a new tab is not always one: the preview pane and an installed app
  // open it in the same window, leaving a bare image with no way back.
  // Closed by its ×, by Escape, or by a tap anywhere; focus goes back to
  // the picture it came from.
  let zoom = null;
  function closeZoom() {
    if (!zoom) return;
    const z = zoom;
    zoom = null;
    document.removeEventListener("keydown", z.onKey);
    z.box.remove();
    if (z.from && z.from.focus) z.from.focus();
  }
  function openZoom(im, from) {
    closeZoom();
    const box = el("div", "museum-zoom");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", R(im.caption));
    const close = el("button", "museum-zoom-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", R(CLOSE));
    const img = document.createElement("img");
    img.src = im.src;
    img.alt = R(im.caption);
    img.width = im.w;
    img.height = im.h;
    box.append(close, img, el("p", "museum-zoom-caption", R(im.caption)));
    box.addEventListener("click", closeZoom);
    const onKey = e => { if (e.key === "Escape") closeZoom(); };
    document.addEventListener("keydown", onKey);
    document.body.appendChild(box);
    zoom = { box, from, onKey };
    close.focus();
  }

  // Pictures, made the first time their card opens. A plain click opens
  // one over the page (openZoom); a link stays underneath, so a middle or
  // ctrl click still opens the file in a new tab where a browser can. The
  // caption doubles as the alt text.
  function gallery(x, card) {
    const wrap = el("div", "museum-gallery");
    card.addEventListener("toggle", () => {
      if (!card.open || wrap.childNodes.length) return;
      x.images.forEach(im => {
        const fig = el("figure", "museum-figure");
        const link = el("a");
        link.href = im.src;
        link.addEventListener("click", e => {
          if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          openZoom(im, link);
        });
        const img = document.createElement("img");
        img.src = im.src;
        img.alt = R(im.caption);
        img.width = im.w;
        img.height = im.h;
        img.decoding = "async";
        link.appendChild(img);
        fig.append(link, el("figcaption", null, R(im.caption)));
        wrap.appendChild(fig);
      });
    });
    return wrap;
  }

  function exhibitCard(x) {
    const card = el("details", "museum-exhibit");
    const sum = el("summary", "museum-summary");
    sum.append(el("span", "museum-icon", x.icon), el("span", "museum-title", R(x.title)));
    card.appendChild(sum);
    const body = el("div", "museum-body");
    x.body.forEach(item => body.appendChild(block(item)));
    if (x.images) body.appendChild(gallery(x, card));
    if (x.more) body.appendChild(moreFold(x));
    if (x.action) {
      const b = el("button", "btn-ghost museum-action", R(x.action.label));
      b.addEventListener("click", x.action.run);
      body.appendChild(b);
    }
    if (x.links) {
      // Addresses read left to right in every language, Hebrew included.
      const row = el("p", "museum-links");
      x.links.forEach(l => {
        const a = el("a", "btn-ghost museum-link", l.text);
        a.href = l.href;
        a.dir = "ltr";
        if (/^https?:/.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; }
        row.appendChild(a);
      });
      body.appendChild(row);
    }
    if (x.scene) {
      // Drawn the first time the card opens, not before: a scene costs
      // something, and most visitors will not open this one.
      const host = el("div", "museum-scene");
      body.appendChild(host);
      card.addEventListener("toggle", () => {
        if (!card.open || host.childNodes.length) return;
        if (Dojo.Scenes && Dojo.Scenes.has(x.scene)) running.push(Dojo.Scenes.render(host, x.scene, { lang: I18N.lang() }));
      });
    }
    card.appendChild(body);
    return card;
  }

  function renderMuseum() {
    const body = document.getElementById("museum-body");
    if (body) {
      running.forEach(s => s && s.destroy && s.destroy());
      running = [];
      body.replaceChildren(el("p", "museum-intro", R(INTRO)));
      // Each hall opens with a small scene of its own (scenes/museum.js),
      // a pin for each of its cards, in the cards' order. The runner
      // starts at the way in; when he reaches an exhibit, it answers in
      // the scene and with a sound, and its card opens and comes into view.
      HALLS.forEach(h => {
        body.appendChild(el("h3", "museum-hall", R(h.title)));
        const cards = h.exhibits.map(exhibitCard);
        if (h.scene && Dojo.Scenes && Dojo.Scenes.has(h.scene)) {
          const host = el("div", "museum-hall-scene");
          body.appendChild(host);
          // Sounds as on the start screen (2026-11-24, «я не слышу звуков
          // как в прескрине»): a pin's own note on the tap, softer notes
          // for the pins he runs past, and the exhibit's voice on arrival.
          running.push(Dojo.Scenes.render(host, h.scene, {
            lang: I18N.lang(),
            start: -1,
            onPick: ({ n }) => { if (Dojo.sfx && Dojo.sfx.stage) Dojo.sfx.stage(note(n)); },
            onPass: ({ n }) => { if (Dojo.sfx && Dojo.sfx.stage) Dojo.sfx.stage(note(n), true); },
            onChapter: ({ index, n, act }) => {
              arrivalSound(act, n);
              const card = cards[index];
              if (!card) return;
              card.open = true;
              setTimeout(() => card.scrollIntoView({ behavior: "smooth", block: "nearest" }), act === "bell" ? 700 : 300);
            }
          }));
        }
        cards.forEach(c => body.appendChild(c));
      });
    }
    showScreen("museum");
  }

  // A pin's note: the start screen's six-note pentatonic scale, round
  // again from the seventh pin, so any order of taps sounds right.
  const note = n => ((n - 1) % 6) + 1;
  // What each exhibit sounds like when the runner reaches it
  // (core/sfx.js, act): the act names come from scenes/museum.js.
  const ACT_SOUND = {
    idea: "flip", books: "page", board: "chalk", garden: "grow", cards: "flip", quotes: "page",
    trophy: "fanfare", scenes: "chime",
    code: "type", db: "sync", forum: "chat", demo: "chime", made: "beep", data: "grow",
    time: "flip", dojo: "kiai", coins: "coins", door: "knock", constant: "chalk", portfolio: "chime", langs: "spin",
    rider: "bike", arcade: "arcade", way: "spin"
  };
  function arrivalSound(act, n) {
    const s = Dojo.sfx;
    if (!s) return;
    if (act === "bell" && s.bell) s.bell();
    else if (act === "rain" && s.sky) s.sky("drizzle");
    else if (act === "joy" && s.sky) s.sky("balloon");
    else if (act === "letter" && s.mailbox) s.mailbox();
    else if (act === "post" && s.letter) s.letter();
    else if (ACT_SOUND[act] && s.act) s.act(ACT_SOUND[act]);
    else if (s.stage) s.stage(note(n), true);
  }

  // The lobby tile's subtitle, the same seam every branch uses.
  function museumSummary() {
    return I18N.t("ui.sum.museum");
  }

  Object.assign(Dojo, { renderMuseum, museumSummary });
})();
