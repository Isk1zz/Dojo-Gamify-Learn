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
    en: "How Knell works, and what it has built and set aside. Tap a card to open it; “Read more” inside goes deeper.",
    ru: "Как устроен Knell и что в нём построено и отложено. Нажмите на карточку, чтобы открыть; «Подробнее» внутри — глубже."
  };
  const MORE = { en: "Read more", ru: "Подробнее" };
  const CLOSE = { en: "Close", ru: "Закрыть" };
  const IN_CODE = { en: "In the code:", ru: "В коде:" };

  // A hall is a title and its exhibits. An exhibit is an icon, a title
  // and paragraphs; `images` are pictures with captions, `more` is its
  // "Read more" (paragraphs, or { list } for a list), `code` the files it
  // lives in, `scene` runs a scene inside it, and `action` adds a button
  // (the letter, the rank guide).
  // A picture: its file, its caption, and its size in pixels, so the page
  // keeps its place while the picture loads. Full screenshots are 775 by
  // 517; the Arcade's are cropped to the game.
  const shot = (src, en, ru, w = 775, h = 517) => ({ src, caption: { en, ru }, w, h });
  const HALLS = [
    {
      title: { en: "How it works", ru: "Как это устроено" },
      exhibits: [
        {
          icon: "\u{1F4A1}", title: { en: "The one idea", ru: "Главная идея" },
          body: [
            { en: "Knowing something is not having passed it once. It is still having it a month later. Knell measures that, and does not count the rest.",
              ru: "Знать — это не сдать однажды, а помнить через месяц. Knell измеряет именно это и не засчитывает остальное." }
          ],
          more: [
            { en: "Progress here is not how many topics you finished. It is how long each topic stays in your memory before it needs a refresh: its review interval.",
              ru: "Прогресс здесь — не число пройденных тем, а то, как долго каждая тема держится в памяти, прежде чем её нужно освежить: промежуток до повторения." },
            { en: "So the Garden pictures those intervals, and almost nothing is offered for rereading. In the research, rereading is one of the weakest ways to study, and being asked is one of the strongest.",
              ru: "Поэтому Сад рисует именно эти промежутки, а перечитывать почти ничего не предлагается. В исследованиях перечитывание — один из самых слабых способов учиться, а ответ на вопрос — один из самых сильных." },
            { en: "The path of a topic: read it, pass its exam, then review it further and further apart. A sprout appears when you pass, and the plant grows with the interval.",
              ru: "Путь темы: прочитать, сдать экзамен и повторять всё реже. Росток появляется после сдачи, а растение растёт вместе с промежутком." }
          ],
          code: "docs/HOW-IT-WORKS.md"
        },
        {
          icon: "\u{1F4DA}", title: { en: "Courses", ru: "Курсы" },
          body: [
            { en: "A course is made of units, a unit of topics, and a topic is taught in chunks.",
              ru: "Курс состоит из блоков, блок — из тем, а тема преподаётся частями." },
            { en: "Each chunk explains one idea, shows a worked example and asks a question. A question you miss comes back before the exam, with its options in a new order.",
              ru: "Каждая часть объясняет одну идею, показывает разобранный пример и задаёт вопрос. Вопрос, на который вы ошиблись, вернётся перед экзаменом, с вариантами в новом порядке." },
            { en: "A topic ends in a five-question exam, and four right passes it. Fail it twice and the topic has to be worked through again.",
              ru: "Тема заканчивается экзаменом из пяти вопросов: четыре верных ответа — тема сдана. Провалите его дважды — тему придётся пройти заново." }
          ],
          more: [
            { en: "A chunk runs in up to five steps, and the order matters:",
              ru: "Часть идёт в пять шагов, и порядок важен:" },
            { list: [
              { en: "Predict: a question before any explanation, never scored. Even a wrong guess helps you remember what follows.",
                ru: "Прогноз: вопрос до всякого объяснения, без оценки. Даже неверная догадка помогает запомнить то, что будет дальше." },
              { en: "Explain: the idea in short blocks with headings, and two cited sources.",
                ru: "Объяснение: идея короткими блоками с подзаголовками и двумя источниками." },
              { en: "Example: a worked example, step by step.",
                ru: "Пример: разбор по шагам." },
              { en: "Apply: a multiple-choice question, its options reshuffled every time.",
                ru: "Применение: вопрос с вариантами, которые каждый раз перемешиваются." },
              { en: "Recall: your own answer with no options, checked against its key points. Producing an answer holds better than recognising one.",
                ru: "Воспроизведение: свой ответ без вариантов, сверка с ключевыми пунктами. Породить ответ прочнее, чем узнать его." }
            ] },
            { en: "Predict opens each topic's first chunk, and recall closes every chunk. Some older Intro to CS chunks still run without one or both.",
              ru: "Прогноз открывает первую часть каждой темы, воспроизведение завершает каждую часть. В некоторых старых частях Intro to CS одного или обоих шагов пока нет." },
            { en: "Units, topics and chunks open in order. That was argued against first, because a fixed order takes away choice, and added by request, with the objection kept in the project's notes. A due review, and going back to where you stopped, are never locked.",
              ru: "Блоки, темы и части открываются по порядку. Сначала против этого были доводы — жёсткий порядок отнимает выбор, — потом его добавили по просьбе, а возражение сохранили в записях проекта. Повторение по сроку и возврат туда, где вы остановились, не запираются никогда." },
            { en: "The first time you enter a course you sign an enrolment contract with the mouse. It is a joke: nothing is checked, and the drawing never leaves your browser.",
              ru: "При первом входе в курс вы подписываете мышкой договор о зачислении. Это шутка: ничего не проверяется, и подпись не покидает браузер." },
            { en: "Three courses have lessons: Intro to Computer Science (48 topics), A3 Theory — Electric Bicycle (7, built on the Israeli Ministry of Transport's question bank) and Philosophy: Cicero (3). Four more have a plan and no lessons yet.",
              ru: "Уроки есть в трёх курсах: Intro to Computer Science (48 тем), A3 Theory — Electric Bicycle (7, по банку вопросов Министерства транспорта Израиля) и Philosophy: Cicero (3). Ещё у четырёх есть план, но пока нет уроков." }
          ],
          code: "library/library.js, library/content/"
        },
        {
          icon: "\u{1F9E0}", title: { en: "How remembering works", ru: "Как работает запоминание" },
          body: [
            { en: "Passing a topic does not finish it. It schedules a review: the first a day later, the next six days after that, and from then on each gap is the one before multiplied by an “ease” number.",
              ru: "Сданная тема не заканчивается. Для неё назначается повторение: первое через день, следующее ещё через шесть дней, а дальше каждый промежуток — это предыдущий, умноженный на число «лёгкости»." },
            { en: "Get a review right and the gaps keep growing. Get it wrong and the topic comes back tomorrow. You meet each thing again just before you would have forgotten it.",
              ru: "Вспомнили на повторении — промежутки растут дальше. Ошиблись — тема вернётся завтра. Так вы встречаете материал снова как раз перед тем, как забыли бы его." },
            { en: "The schedule is SM-2, a well-known method for spaced review, with one constant changed: barely passing a review no longer counts the same as getting it perfect.",
              ru: "Расписание — это SM-2, известный метод интервальных повторений, с одной изменённой константой: еле сданное повторение больше не считается так же, как идеальное." }
          ],
          more: [
            { en: "The ease number starts at 2.5. A good review raises it and a shaky one lowers it, never below 1.3. Under half right counts as a lapse: back to one day, and the ease drops.",
              ru: "Лёгкость начинается с 2,5. Хорошее повторение её повышает, неуверенное — понижает, но не ниже 1,3. Меньше половины верных ответов — это срыв: снова через день, и лёгкость падает." },
            { en: "The changed constant, in numbers: someone who barely passes every review now gets their sixth review at 153 days instead of 238, while a perfect learner stays at 393. Checked by running the real function, not by algebra.",
              ru: "Изменённая константа в цифрах: у того, кто каждое повторение сдаёт еле-еле, шестое теперь наступает через 153 дня вместо 238, а у идеального ученика остаётся 393. Проверено запуском настоящей функции, а не подсчётом на бумаге." },
            { en: "Why SM-2 and not the newer FSRS: FSRS needs hundreds of reviews before its model fits, and a small app never gives it that many.",
              ru: "Почему SM-2, а не более новый FSRS: FSRS нужны сотни повторений, прежде чем его модель настроится, а небольшое приложение столько не даёт." },
            { en: "Weak spots answer the question a learner really has, what to study now: your last score, minus ten for every lapsed review.",
              ru: "Слабые места отвечают на главный вопрос учащегося — что учить сейчас: последний балл минус десять за каждый срыв повторения." },
            { en: "The e-bike course also has a mock exam on the real test's terms: 30 questions, 40 minutes, 26 to pass.",
              ru: "В курсе по электровелосипеду есть ещё пробный экзамен на условиях настоящего: 30 вопросов, 40 минут, для сдачи нужно 26." }
          ],
          code: "data/db.js (scheduleReview, getWeakSpots), library/exam-sim.js"
        },
        {
          icon: "\u{1F331}", title: { en: "The Garden", ru: "Сад" },
          body: [
            { en: "Every topic you have passed is a plant, and its size is its review interval: a sprout at a day, a tree at a month, in bloom at two months and more.",
              ru: "Каждая сданная тема — растение, и его размер — это промежуток до повторения: росток — день, дерево — месяц, цветение — два месяца и больше." },
            { en: "Leave a topic overdue for more than a week and it starts to shrink, a day for every day it waits. Holiday mode pauses that, for up to 60 days a year.",
              ru: "Если повторение просрочено больше чем на неделю, растение начинает уменьшаться — на день за каждый день ожидания. Режим отпуска это останавливает, до 60 дней в году." },
            { en: "It is a picture of what you still remember, not of what you once finished.",
              ru: "Это картина того, что вы ещё помните, а не того, что когда-то прошли." }
          ],
          more: [
            { en: "The stages, by review interval:",
              ru: "Стадии по промежутку до повторения:" },
            { list: [
              { en: "🌑 Fallow — not started", ru: "🌑 Пар — тема не начата" },
              { en: "🌰 Seed — started, exam not passed yet", ru: "🌰 Семя — начата, экзамен ещё не сдан" },
              { en: "🌱 Sprout — 1 day or more", ru: "🌱 Росток — от 1 дня" },
              { en: "🌿 Seedling — 7 days or more", ru: "🌿 Саженец — от 7 дней" },
              { en: "🌾 Growing — 21 days or more", ru: "🌾 Рост — от 21 дня" },
              { en: "🌳 Tree — 30 days or more", ru: "🌳 Дерево — от 30 дней" },
              { en: "🌸 Blossom — 60 days or more", ru: "🌸 Цветение — от 60 дней" }
            ] },
            { en: "The Garden lists what needs watering today, and starts the first review in one tap.",
              ru: "Сад показывает, что пора полить сегодня, и одним нажатием запускает первое повторение." },
            { en: "Each stage also has a weight: 1 for a sprout or a seedling, 2 for growing or a tree, 3 in bloom. Every 5 points of weight fund one point of reputation a day, five at most. Reputation was for praising other people's posts in the Forum, so that right came from what you remember, not from how much you opened.",
              ru: "У каждой стадии есть ещё и вес: 1 у ростка и саженца, 2 у роста и дерева, 3 у цветения. Каждые 5 единиц веса дают одно очко репутации в день, но не больше пяти. Репутацией хвалили чужие посты на форуме, так что право хвалить шло от того, что вы помните, а не от того, сколько открыли." }
          ],
          code: "garden/garden.js"
        },
        {
          icon: "\u{1F0CF}", title: { en: "Flashcards", ru: "Карточки" },
          body: [
            { en: "A topic due for review is reviewed as a deck of cards built from questions the course already has: one card for each chunk's question and one for each exam question.",
              ru: "Тема, которую пора повторить, повторяется колодой карточек из вопросов, которые в курсе уже есть: по карточке на вопрос каждой части и на каждый вопрос экзамена." },
            { en: "After each card you rate how well you remembered it. That self-rating is the weakest measurement in the app. The fix is decided but not built yet: type the answer first, then tick off its key points.",
              ru: "После каждой карточки вы сами оцениваете, насколько хорошо вспомнили. Эта самооценка — самое слабое измерение в приложении. Замена решена, но ещё не сделана: сначала напечатать ответ, потом отметить его ключевые пункты." }
          ],
          more: [
            { en: "Each card is rated on four levels, from “difficult” to “known”, and “have an idea” or better counts as knowing it. Know 80% of the deck and the review is passed; that share becomes its grade for the schedule.",
              ru: "Каждую карточку оценивают по четырём уровням, от «сложно» до «знаю», и «есть идея» или выше считается «знаю». Знаете 80% колоды — повторение сдано, и эта доля становится его оценкой для расписания." },
            { en: "Reviews pay a little XP for each card, so a card answered in under 2.5 seconds earns nothing: tapping through a deck for the reward does not pay.",
              ru: "За каждую карточку повторение даёт немного опыта, поэтому карточка, отвеченная быстрее чем за 2,5 секунды, не даёт ничего: пролистать колоду ради награды не выйдет." },
            { en: "You can also build your own deck from chunks of different topics and units, and filter it by those four levels. Mixing topics is interleaved practice, which beats practising one block at a time.",
              ru: "Можно собрать и свою колоду из частей разных тем и блоков и отфильтровать её по тем же четырём уровням. Смешивать темы — это перемежающаяся практика, она работает лучше, чем учить блок за блоком." }
          ],
          code: "library/library.js (flashcards, MIN_CARD_MS, the deck builder)"
        },
        {
          icon: "\u{1F396}️", title: { en: "Ranks and rewards", ru: "Ранги и награды" },
          body: [
            { en: "Studying earns XP, XP raises your rank, and each of the twenty ranks hands out a reward. A newcomer finds the rank line under a sticker; peeling it opens a short guide, which this button shows again.",
              ru: "Учёба приносит опыт, опыт поднимает ранг, а каждый из двадцати рангов даёт награду. Новичок видит строку ранга под наклейкой; если её отклеить, откроется короткое знакомство. Эта кнопка показывает его снова." }
          ],
          more: [
            { en: "XP comes from finishing chunks and passing exams. It is never spent and has no ceiling. The ranks run from Lab Intern at 0 XP to Nobel Laureate at 100,000, and each one brings a background pattern, a colour theme or tokens.",
              ru: "Опыт дают пройденные части и сданные экзамены. Он не тратится и не имеет потолка. Ранги идут от Стажёра лаборатории на 0 опыта до Нобелевского лауреата на 100 000, и каждый приносит фоновый узор, цветовую тему или токены." },
            { en: "Badges, ten of them, each for something real: a first topic mastered; a quarter, half or all of a course; a perfect exam; five exams without a fail; 90% accuracy over 50 questions; a 7- or 30-day streak; reaching rank 8.",
              ru: "Значков десять, и каждый за настоящее достижение: первая освоенная тема; четверть, половина или весь курс; идеальный экзамен; пять экзаменов без провала; 90% точности на 50 вопросах; серия в 7 или 30 дней; 8-й ранг." },
            { en: "A streak day counts when a topic is mastered, not when the app is opened, and two freezes a week bridge missed days.",
              ru: "День серии засчитывается, когда освоена тема, а не когда открыто приложение, и две «заморозки» в неделю закрывают пропущенные дни." },
            { en: "There are no leaderboards. XP, badges and streaks were each argued against first: studies find their effect small and unstable, and some find they lower motivation. Each was added by request anyway, with the objection kept beside it. Nothing ranks you against other people.",
              ru: "Таблиц лидеров нет. Против опыта, значков и серий сначала были доводы: исследования находят у них малый и неустойчивый эффект, а некоторые — что они снижают мотивацию. Каждое добавили по просьбе, а возражение оставили рядом. Ничто не сравнивает вас с другими." },
            { en: "Three currencies are kept apart. Tokens are bought with real money and open courses. $ is earned by studying and was meant for cosmetics, but every cosmetic is now free or comes with a rank. Reputation is the Garden's daily allowance, for praising other people only. Nothing earned by studying turns back into Tokens, so studying never becomes a way to make money.",
              ru: "Три валюты держатся отдельно. Токены покупаются за настоящие деньги и открывают курсы. $ зарабатывается учёбой и задумывался для оформления, но всё оформление теперь бесплатное или приходит с рангом. Репутация — дневной запас от Сада, только чтобы хвалить других. Заработанное учёбой не превращается обратно в токены, поэтому учёба не становится способом зарабатывать деньги." },
            { en: "In this demo there is no server to pay XP, so the rank stays where the sample profile starts.",
              ru: "В этом демо нет сервера, который начислял бы опыт, поэтому ранг остаётся тем, с которого начинается пример профиля." }
          ],
          code: "shop/ranks.js, core/peel.js, library/stats.js, core/earn.js",
          action: { label: { en: "Show the guide", ru: "Показать знакомство" }, run: () => Dojo.openRankGuide && Dojo.openRankGuide() }
        },
        {
          icon: "\u{1F5FA}️", title: { en: "Scenes", ru: "Сцены" },
          body: [
            { en: "Some courses are drawn as places: the e-bike course is a junction, Intro to CS a computer lab, Philosophy the Roman Forum at night, and the start screen a garden. Pick a chapter and a small figure walks there along the paths, then opens it.",
              ru: "Некоторые курсы нарисованы как места: курс по электровелосипеду — перекрёсток, Intro to CS — компьютерный класс, философия — ночной Римский форум, а стартовый экран — сад. Выберите главу, и человечек дойдёт до неё по дорожкам и откроет её." },
            { en: "Every scene is drawn by one engine from a recipe, which is plain data: what stands where, and in what colours. A new scene is a new recipe. When it needs a new kind of thing, the engine learns it once, for every scene.",
              ru: "Все сцены рисует один движок по рецепту — это просто данные: что где стоит и каких цветов. Новая сцена — это новый рецепт. Если ей нужна новая вещь, движок учится рисовать её один раз, для всех сцен сразу." }
          ],
          more: [
            { en: "What the engine does: an isometric projection with three layers of depth, a cut-away of the ground under each scene, things sorted by depth so near ones cover far ones, and shortest-path walking (Dijkstra) over a graph of paths. In the e-bike course the figure keeps to the sidewalks and crosses only at the zebras.",
              ru: "Что делает движок: изометрическая проекция с тремя слоями глубины, срез земли под каждой сценой, сортировка по глубине, чтобы ближнее закрывало дальнее, и кратчайший путь (алгоритм Дейкстры) по графу дорожек. В курсе по электровелосипеду человечек идёт по тротуарам и переходит дорогу только по зебрам." },
            { en: "Every scene follows the sky: by day the lamps go out and the lab's window shows the sun. Pins can be reached with the keyboard, reduced motion is respected, and nothing animates while a scene is off screen.",
              ru: "Каждая сцена следует за небом: днём фонари гаснут, а в окне класса светит солнце. До меток можно добраться с клавиатуры, режим уменьшенного движения соблюдается, а сцена вне экрана не анимируется." },
            { en: "Intro to CS has a pin per unit rather than per topic, because 48 topics do not fit in one picture. On the start screen each stage of the Garden plays its own note of a pentatonic scale, and the figure plays them as it passes.",
              ru: "В Intro to CS метка стоит на каждый блок, а не на тему: 48 тем в одну картинку не помещаются. На стартовом экране каждая стадия Сада звучит своей нотой пентатоники, а человечек проигрывает их, когда проходит мимо." },
            { en: "The rule that keeps scenes cheap: never a drawing per course. The lab taught the engine walls and pictures on them; the forum taught it pitched roofs, columns and togas, for every scene after.",
              ru: "Правило, которое делает сцены дешёвыми: никогда не рисовать каждый курс отдельно. Класс научил движок стенам и картинкам на них, форум — двускатным крышам, колоннам и тогам, для всех следующих сцен." }
          ],
          code: "scenes/scene.js, and one recipe per scene in scenes/"
        }
      ]
    },
    {
      title: { en: "Behind the scenes", ru: "За кадром" },
      exhibits: [
        {
          icon: "\u{1F9E9}", title: { en: "How the code is built", ru: "Как устроен код" },
          body: [
            { en: "Plain JavaScript with no framework, no build step and no packages: script tags in a fixed order. Any static server runs it.",
              ru: "Обычный JavaScript без фреймворка, без сборки и без пакетов: теги script в заданном порядке. Запустит любой статический сервер." }
          ],
          more: [
            { en: "A small core carries storage, events, screens, and one place where each feature publishes what it offers. Features live in their own folders and talk only through that core, so deleting a folder and its script tags takes the feature out and the rest keeps running.",
              ru: "Небольшое ядро отвечает за хранение, события, экраны и за одно место, где каждая функция публикует, что она умеет. Функции живут в своих папках и общаются только через ядро, поэтому если удалить папку и её теги script, функция исчезнет, а остальное продолжит работать." },
            { en: "Your data is one document in the browser's storage, with a version number. When it loads it is upgraded step by step, so an old save always opens in a new build.",
              ru: "Ваши данные — один документ в хранилище браузера с номером версии. При загрузке он обновляется шаг за шагом, поэтому старое сохранение всегда открывается в новой версии." },
            { en: "Two languages: course text is chosen once per page load, and the interface has about 350 keyed strings. Switching the language reloads the page, which is cheap and makes a half-translated screen impossible.",
              ru: "Два языка: текст курсов выбирается один раз при загрузке страницы, а у интерфейса около 350 строк по ключам. Смена языка перезагружает страницу — это дёшево и исключает наполовину переведённый экран." },
            { en: "Sounds are made by the browser as they play, with no audio files, and respect the mute switch.",
              ru: "Звуки браузер создаёт сам в момент проигрывания, без аудиофайлов, и соблюдает выключение звука." },
            { en: "Three scripts check the work from the command line: lessons against the content standard, the app's fields against the database's columns, and the demo build against any production key.",
              ru: "Три скрипта проверяют работу из командной строки: уроки — по стандарту контента, поля приложения — по столбцам базы данных, а сборку демо — на любые рабочие ключи." }
          ],
          code: "core/, data/db.js, core/i18n.js, core/sfx.js, docs/ARCHITECTURE.md"
        },
        {
          icon: "\u{1F510}", title: { en: "How accounts were meant to work", ru: "Как должны были работать аккаунты" },
          body: [
            { en: "In the real app you sign in, and your progress lives on a server (Supabase, a hosted Postgres database) as well as on your device.",
              ru: "В настоящем приложении вы входите в аккаунт, и прогресс хранится и на устройстве, и на сервере (Supabase — облачная база данных Postgres)." },
            { en: "Syncing merges field by field instead of letting the newest save win: finished topics are combined, each topic's review keeps whichever device is further ahead, and counters keep the higher number. Syncing twice changes nothing.",
              ru: "Синхронизация сливает данные поле за полем, а не по принципу «последнее сохранение победило»: пройденные темы объединяются, у каждой темы остаётся то повторение, которое ушло дальше, а счётчики берут большее значение. Повторная синхронизация ничего не меняет." },
            { en: "Rewards are paid by the server, never by the browser, because anything kept in a browser can be edited by whoever owns it.",
              ru: "Награды начисляет сервер, а не браузер: всё, что хранится в браузере, его владелец может изменить." },
            { en: "The server went to sleep in 2026 after two months without use, which is what its free tier does. So the real app stops at sign-in, and this demo runs with no server at all.",
              ru: "В 2026 году сервер уснул после двух месяцев без использования — так работает бесплатный тариф. Поэтому настоящее приложение останавливается на входе, а это демо работает вовсе без сервера." }
          ],
          more: [
            { en: "No browser can write money, XP, reputation or the Forum. Those tables accept no direct writes at all; every change goes through a database function that takes the user from the signed-in session, never from what the browser sends.",
              ru: "Ни один браузер не может записать деньги, опыт, репутацию или форум. Эти таблицы вообще не принимают прямых записей: любое изменение идёт через функцию базы данных, которая берёт пользователя из сессии входа, а не из того, что прислал браузер." },
            { en: "Rewards are a ledger: each piece of work is paid once, only if it is a real item from the catalogue, only at a human pace, and under a daily ceiling. An older endpoint that let the browser name an amount paid 800 XP in four calls, and was removed.",
              ru: "Награды ведутся как журнал: каждая работа оплачивается один раз, только если это настоящий пункт каталога, только в человеческом темпе и в пределах дневного потолка. Старый способ, где браузер сам называл сумму, выдал 800 опыта за четыре вызова, и его убрали." },
            { en: "Two bugs found by attacking it: granting reputation many times at once let 8 of 8 grants through where 2 were allowed, until a lock fixed it; and a uniqueness rule Postgres did not enforce let one person report the same post again and again.",
              ru: "Две ошибки, найденные атакой на сервер: при одновременных выдачах репутации проходили 8 из 8 там, где можно было 2, пока это не закрыли блокировкой; а правило уникальности, которое Postgres не соблюдал, позволяло одному человеку жаловаться на один пост снова и снова." },
            { en: "The known weakness is written down in the code: your own progress has to be writable, because that is how it syncs, and the Garden's weight is counted from it. Forging it buys at most five reputation points a day.",
              ru: "Известная слабость записана прямо в коде: ваш собственный прогресс должен быть доступен для записи, иначе он не синхронизируется, а вес Сада считается по нему. Подделка даёт не больше пяти очков репутации в день." }
          ],
          code: "core/auth.js, core/sync.js, core/earn.js, supabase/migrations/"
        },
        {
          icon: "\u{1F4AC}", title: { en: "The Forum: built, not launched yet", ru: "Форум: построен, ещё не запущен" },
          body: [
            { en: "Posts, replies, praise, reports and moderation are in the code, and were tested against a live database. The Forum needs that server and the demo has none, so here it is an exhibit.",
              ru: "Посты, ответы, похвала, жалобы и модерация есть в коде и проверялись на живой базе. Форуму нужен этот сервер, а у демо его нет, поэтому здесь он экспонат." }
          ]
        },
        {
          icon: "\u{1F9EA}", title: { en: "This demo", ru: "Это демо" },
          body: [
            { en: "This is a copy of the real app, made by a script that switches the demo on and takes the server out.",
              ru: "Это копия настоящего приложения. Её делает скрипт: он включает режим демо и убирает сервер." }
          ],
          more: [
            { en: "The script blanks the server's address and key, drops the server's client and the Forum, and keeps the demo's old cache apart from the real app's. Then it searches the copy for any production key before it finishes.",
              ru: "Скрипт стирает адрес и ключ сервера, убирает клиент сервера и форум и держит старый кэш демо отдельно от кэша настоящего приложения. Потом он ищет в копии любые рабочие ключи и только после этого заканчивает." },
            { en: "With the demo on, nobody signs in. A first visit loads a sample student, Alex: Lab Intern, most of the way to the next rank, a nine-day streak, a topic half done and a plant at every stage.",
              ru: "В режиме демо никто не входит в аккаунт. При первом визите загружается пример ученика, Alex: стажёр лаборатории, почти дошедший до следующего ранга, серия в девять дней, тема пройдена наполовину и по растению на каждой стадии." },
            { en: "Your progress stays in this browser, apart from the real app's, and this museum stands where the Forum's tile was.",
              ru: "Ваш прогресс остаётся в этом браузере, отдельно от настоящего приложения, а этот музей стоит на месте плитки форума." }
          ],
          code: "tools/make-demo.js, core/demo.js"
        },
        {
          icon: "\u{1F6E0}️", title: { en: "How it was made", ru: "Как это сделано" },
          body: [
            { en: "Designed and directed by its author: what a lesson is, when an exam lets a topic into review, how the Garden grows and withers, what the server must never trust a browser with. The code was written with Claude, under that direction.",
              ru: "Задумано и направлено автором: что такое урок, когда экзамен пускает тему в повторения, как Сад растёт и вянет, чего сервер никогда не должен доверять браузеру. Код написан с Claude под этим руководством." }
          ],
          more: [
            { en: "Claims are checked against the code. Numbers in the documents were measured, not remembered, and a wrong one is corrected in place, with a date, rather than quietly rewritten.",
              ru: "Утверждения сверяются с кодом. Числа в документах измерены, а не взяты по памяти, а ошибочное исправляется на месте, с датой, а не переписывается тихо." },
            { en: "Research is checked, not trusted. Three research reports were commissioned. The first quoted the project's own documents back as findings, so the next two were asked to look for what is wrong. Ten decisions came out of the third; one is built, and each is kept with the case against it.",
              ru: "Исследования проверяются, а не принимаются на веру. Было заказано три исследовательских отчёта. Первый вернул собственные документы проекта как находки, поэтому следующие два попросили искать, что не так. Из третьего вышло десять решений; одно построено, и каждое хранится вместе с доводами против." },
            { en: "What would come next: a longer exam with a short check a day or two later, typed answers instead of self-rated cards, and a server that checks progress against the work it actually paid for.",
              ru: "Что дальше: экзамен длиннее и короткая проверка через день-два, напечатанный ответ вместо самооценки карточек и сервер, который сверяет прогресс с работой, за которую он действительно заплатил." }
          ],
          code: "docs/HOW-IT-WORKS.md, docs/SHOWCASE.md, docs/INTERVIEW.md"
        }
      ]
    },
    {
      title: { en: "History, by date", ru: "История по датам" },
      exhibits: [
        {
          icon: "⏳", title: { en: "What went into it", ru: "Сколько в это вложено" },
          body: [
            { en: "For about a month, Knell was its author's full-time work, by day and by night. The dates in this hall are when work reached the repository; reading, thinking and testing went on around them.",
              ru: "Около месяца Knell был основной работой автора, днём и ночью. Даты в этом зале — это когда работа попадала в репозиторий; чтение, обдумывание и проверки шли вокруг них." },
            { list: [
              { en: "216 commits on 19 days of work, from 10 August to 23 November.",
                ru: "216 коммитов за 19 рабочих дней, с 10 августа по 23 ноября." },
              { en: "The busiest day, 13 August: 43 commits between 03:27 and 23:57.",
                ru: "Самый плотный день, 13 августа: 43 коммита между 03:27 и 23:57." },
              { en: "13,514 lines were already written before the first commit: the repository starts after twelve stages of the app's own changelog.",
                ru: "13 514 строк были написаны ещё до первого коммита: репозиторий начинается после двенадцати стадий собственного журнала изменений." },
              { en: "About 54,000 lines today: 19,800 of code, 12,600 of lessons, 5,400 of styles, 4,000 of database, 9,800 of documents and 2,800 of research notes.",
                ru: "Около 54 000 строк сегодня: 19 800 кода, 12 600 уроков, 5 400 стилей, 4 000 базы данных, 9 800 документов и 2 800 исследований." }
            ] }
          ],
          images: [
            shot("museum/history/hours.svg", "Commits by hour of the day, 10 August to 22 November. Nearly a third came between midnight and six in the morning.", "Коммиты по часам суток, с 10 августа по 22 ноября. Почти треть — между полуночью и шестью утра.", 600, 170)
          ],
          more: [
            { en: "Attention to detail, in small things that were not left alone:",
              ru: "Внимание к мелочам — в вещах, которые не оставили как есть:" },
            { list: [
              { en: "In the e-bike course the figure crosses only at the zebras: its path is computed over a graph of sidewalks and crossings.",
                ru: "В курсе по электровелосипеду человечек переходит дорогу только по зебрам: его путь считается по графу тротуаров и переходов." },
              { en: "Questions and their options reshuffle on every attempt, because hand-written answer keys drift: in one module the right answer was B in 10 of 11 questions.",
                ru: "Вопросы и варианты перемешиваются при каждой попытке, потому что ключи, написанные вручную, перекашиваются: в одном модуле верным был вариант B в 10 вопросах из 11." },
              { en: "A flashcard answered in under 2.5 seconds earns nothing, so tapping through a deck does not pay.",
                ru: "Карточка, отвеченная быстрее чем за 2,5 секунды, ничего не приносит — пролистать колоду ради награды не выйдет." },
              { en: "One constant of SM-2 was changed only after measuring it: a marginal learner's sixth review moves from 238 days to 153, a perfect learner's stays at 393.",
                ru: "Одну константу SM-2 изменили только после замера: шестое повторение у еле сдающего переезжает с 238 дней на 153, у идеального остаётся 393." },
              { en: "Five facts in the e-bike course were corrected against the regulation itself, and one crossing rule after reading the road sign.",
                ru: "Пять фактов в курсе по электровелосипеду исправлены по самим правилам, а одно правило перехода — после чтения дорожного знака." },
              { en: "A Forum view counts only after five seconds on screen: a scroll past counts nothing, a second visit does not count twice, and your own post never counts.",
                ru: "Просмотр на форуме засчитывается только после пяти секунд на экране: пролистывание не считается, повторный визит не считается дважды, а свой пост — никогда." },
              { en: "A uniqueness rule the database was not enforcing was found by asking the database's own catalogue, not by rereading the rule.",
                ru: "Правило уникальности, которое база не соблюдала, нашли, спросив собственный каталог базы, а не перечитав правило." },
              { en: "The demo's sample student has every date relative to today, so a visit a year from now still finds three reviews due and nothing withered.",
                ru: "У ученика из демо все даты отсчитываются от сегодняшнего дня, поэтому и через год найдутся три повторения на сегодня, и ничего не завянет." },
              { en: "A cloud drifting over a button never steals its click, and the sky cannot be aimed at through the garden that hides it.",
                ru: "Облако, проплывающее над кнопкой, никогда не крадёт её нажатие, а в небо нельзя прицелиться сквозь сад, который его закрывает." },
              { en: "The rank sticker takes seven seconds of real rubbing to peel; a finger held still does not count.",
                ru: "Наклейку на ранге нужно тереть семь секунд по-настоящему; если просто держать палец, это не считается." }
            ] },
            { en: "The logic of the work: one decision at a time, each written down with the case against it; a queue of what is still owed and a record of what is done; numbers measured rather than remembered, and a wrong one corrected in place, with a date; features in folders that can be removed without breaking the rest; and nothing counted as done until it was seen working in a browser.",
              ru: "Логика работы: одно решение за раз, и каждое записано вместе с доводами против; очередь того, что ещё не сделано, и журнал сделанного; числа измеряются, а не берутся по памяти, а ошибочное исправляется на месте, с датой; функции живут в папках, которые можно убрать, не сломав остального; и ничто не считается готовым, пока не проверено в браузере." }
          ],
          code: "git log; docs/CHANGELOG.md for the stages before the first commit"
        },
        {
          icon: "\u{1F94B}", title: { en: "10–12 August: Dojo", ru: "10–12 августа: Dojo" },
          body: [
            { en: "It started at the Open University. Two versions of the same textbook had drifted apart, and studying from them was irritating enough to try another way: to gamify studying, automate it and optimise it. That attempt was called Dojo.",
              ru: "Всё началось в Открытом университете. Две версии одного учебника разошлись между собой, и учиться по ним было так досадно, что захотелось попробовать иначе: геймифицировать учёбу, автоматизировать её и оптимизировать. Эта попытка называлась Dojo." },
            { en: "Dojo道場 had no account and kept everything in the browser. Its tagline called it “an offline study system”, a word dropped two days later. The lobby was a plain list.",
              ru: "У Dojo道場 не было аккаунта, всё хранилось в браузере. Слоган называл его «офлайн-системой для учёбы», и это слово убрали через два дня. Лобби было простым списком." },
            { en: "Inside: the first Intro to CS lessons, a rank ladder shaped like a research lab, from Lab Intern up, and an Arcade of small games bought with dollars earned by studying (see “The Arcade” in Set aside).",
              ru: "Внутри: первые уроки Intro to CS, лестница рангов в виде научной лаборатории, от стажёра и выше, и Аркада мини-игр, которые покупались за доллары, заработанные учёбой (см. «Аркаду» в зале «На покое»)." }
          ],
          images: [
            shot("museum/history/0812-start.jpg", "The start screen on 12 August.", "Стартовый экран 12 августа."),
            shot("museum/history/0812-lobby.jpg", "The lobby: a list, with the Arcade and Statistics as doors of their own.", "Лобби: список, у Аркады и Статистики свои двери.")
          ],
          more: [
            { en: "There was also a life simulation: food, shelter and “vitals” that went down as you played, with a shop to keep them up. It was taken out on 13 August, a day after a story mode.",
              ru: "Была и симуляция жизни: еда, жильё и «жизненные показатели», которые таяли во время игры, и магазин, чтобы их поддерживать. Её убрали 13 августа, на день позже режима истории." },
            { en: "Much of the first week went into games and an economy around studying, and most of that was taken out later.",
              ru: "Немалая часть первой недели ушла на игры и экономику вокруг учёбы, и бо́льшую часть этого потом убрали." }
          ],
          code: "git fb7b3e2 … 09dfde2"
        },
        {
          icon: "\u{1FA99}", title: { en: "13–14 August: an economy", ru: "13–14 августа: экономика" },
          body: [
            { en: "Two days, 62 commits. Tokens arrived as a third currency for buying courses, first named Stars, with a Token Shop, packs and patron tiers. Flashcards got four levels of confidence, and a Final Quiz closed the course.",
              ru: "Два дня, 62 коммита. Появились токены — третья валюта для покупки курсов, сначала называвшаяся «звёздами», — с магазином токенов, наборами и уровнями патронов. Карточки получили четыре уровня уверенности, а курс — итоговый тест." },
            { en: "The lobby became the Star: tiles on a ring with a spark orbiting it, and a Magen David mode in Ukrainian and Israeli colours. A security audit found that everything lived in the browser, which is what later sent rewards to a server.",
              ru: "Лобби стало «Звездой»: плитки на кольце, вокруг которого кружит искра, и режим Звезды Давида в цветах Украины и Израиля. Аудит безопасности показал, что всё живёт в браузере, — именно это позже увело награды на сервер." }
          ],
          images: [
            shot("museum/history/0814-lobby.jpg", "The Star lobby on 14 August. The Arcade still has its tile, emptied that day.", "Лобби-«Звезда» 14 августа. У Аркады ещё есть плитка — в тот день её опустошили.")
          ],
          more: [
            { en: "On 14 August the casino games were removed and the Arcade left empty. The same day brought synthesized sound effects, an inventory where things are tried on by dragging them, and a ban that wipes an account.",
              ru: "14 августа казино-игры убрали, и Аркада опустела. В тот же день появились синтезированные звуки, инвентарь, где вещи примеряются перетаскиванием, и бан, который стирает аккаунт." }
          ],
          code: "git 19e270a … 201337b"
        },
        {
          icon: "☁️", title: { en: "15–16 August: the sky, and a turn", ru: "15–16 августа: небо и поворот" },
          body: [
            { en: "For nine days the app had no name: its start screen said “Unnamed App”. It got a sky you can poke: clouds that rain, birds, a sun by day and, by night, a moon that answers with bats.",
              ru: "Девять дней у приложения не было имени: на стартовом экране так и было написано — «Unnamed App». Появилось небо, в которое можно тыкать: облака проливаются дождём, птицы, днём солнце, а ночью луна, которая отвечает летучими мышами." },
            { en: "Then the turn: every paid cosmetic became free, and the Arcade gave its tile to a Forum, where reputation earned by remembering is spent only on other people.",
              ru: "А потом поворот: всё платное оформление стало бесплатным, а Аркада отдала свою плитку Форуму, где репутацию, заработанную запоминанием, тратят только на других." }
          ],
          images: [
            shot("museum/history/0816-start.jpg", "“Unnamed App”, 16 August. The start screen still promises the Arcade.", "«Unnamed App», 16 августа. Стартовый экран ещё обещает Аркаду."),
            shot("museum/history/0816-lobby.jpg", "The lobby under the night sky, with the Forum where the Arcade was.", "Лобби под ночным небом, Форум на месте Аркады.")
          ],
          more: [
            { en: "The documents were rewritten around the real goal, the source was put under an all-rights-reserved licence, Supabase was chosen for the server over Firebase, and four science courses were planned.",
              ru: "Документы переписали вокруг настоящей цели, код закрыли лицензией «все права защищены», для сервера выбрали Supabase вместо Firebase и спланировали четыре научных курса." }
          ],
          code: "git 4a9c3c3 … 74535f8"
        },
        {
          icon: "\u{1F514}", title: { en: "24–26 August: Knell", ru: "24–26 августа: Knell" },
          body: [
            { en: "The app was named Knell, the sound of a bell. A second course arrived, A3 Theory for electric bicycles, built on the Israeli Ministry of Transport's question bank, with a mock exam on the real test's terms, and the interface learned Russian.",
              ru: "Приложение назвали Knell — это звон колокола. Появился второй курс, A3 Theory для электровелосипедов, по банку вопросов Министерства транспорта Израиля, с пробным экзаменом на условиях настоящего, а интерфейс заговорил по-русски." },
            { en: "A third followed: Philosophy, on Cicero, researched from books before a word of it was written.",
              ru: "За ним третий: философия, о Цицероне, — сначала исследование по книгам, и только потом текст." }
          ],
          images: [
            shot("museum/history/0826-start.jpg", "The first start screen called Knell, 26 August.", "Первый стартовый экран с именем Knell, 26 августа."),
            shot("museum/history/0826-library.jpg", "The Library: three courses, and Intro to CS still for sale at 700 tokens.", "Библиотека: три курса, и Intro to CS ещё продаётся за 700 токенов.")
          ],
          more: [
            { en: "The e-bike course was the first written to the content standard from its first line. Five of its facts were corrected against the regulation text itself, and one crossing rule after reading the road sign.",
              ru: "Курс по электровелосипеду первым написан по стандарту контента с первой строки. Пять его фактов исправлены по самому тексту правил, а одно правило перехода — после чтения дорожного знака." },
            { en: "Intro to CS started loading only when opened, which took 43% of the JavaScript off every visit.",
              ru: "Intro to CS стал загружаться только при открытии — это сняло 43% JavaScript с каждого визита." }
          ],
          code: "git dd0bc30 … 81b3773"
        },
        {
          icon: "\u{1F511}", title: { en: "27 August – 3 September: the server", ru: "27 августа – 3 сентября: сервер" },
          body: [
            { en: "Accounts became mandatory, and everything went behind this door. Behind it: sync across devices, rewards the server pays from its own ledger, and the Forum, built in six steps from schema to moderation.",
              ru: "Аккаунты стали обязательными, и всё оказалось за этой дверью. За ней — синхронизация между устройствами, награды, которые сервер платит из собственного журнала, и Форум, построенный в шесть шагов от схемы до модерации." },
            { en: "This door is also where the real app stops today: the database went to sleep after two months without use.",
              ru: "На этой же двери сегодня останавливается настоящее приложение: база уснула после двух месяцев без использования." }
          ],
          images: [
            shot("museum/history/0903-signin.jpg", "Sign-in, 3 September: an email or a nickname, and a password.", "Вход, 3 сентября: почта или ник и пароль.")
          ],
          more: [
            { en: "Found on the way: a reward endpoint that paid 800 XP in four calls, a race that let 8 of 8 simultaneous reputation grants through where 2 were allowed, and a signup broken for everyone but the first user. All three were closed.",
              ru: "Найдено по дороге: способ получать награду, который выдал 800 опыта за четыре вызова; гонка, при которой проходили 8 из 8 одновременных выдач репутации вместо 2; и регистрация, сломанная для всех, кроме первого пользователя. Все три закрыты." },
            { en: "The Garden learned to wither when neglected, and to go on holiday. The learning engine was researched, and the research was checked rather than trusted.",
              ru: "Сад научился вянуть без ухода и уходить в отпуск. Движок обучения исследовали, а исследование проверяли, а не принимали на веру." }
          ],
          code: "git 5108c38 … 2dab4f3"
        },
        {
          icon: "\u{1F4D0}", title: { en: "13 October: one constant", ru: "13 октября: одна константа" },
          body: [
            { en: "A single commit after six quiet weeks: a review that only just passes stops earning an expert's intervals. Measured, that learner's sixth review moves from 238 days to 153, while a perfect one stays at 393. Ten decisions for the learning engine were written down the same day.",
              ru: "Один коммит после шести тихих недель: повторение, сданное еле-еле, больше не получает промежутков отличника. Измерено: шестое повторение такого ученика переезжает с 238 дней на 153, а у идеального остаётся 393. В тот же день записали десять решений для движка обучения." }
          ],
          code: "git fcd81ae"
        },
        {
          icon: "\u{1F5BC}️", title: { en: "19–22 November: a portfolio piece", ru: "19–22 ноября: работа для портфолио" },
          body: [
            { en: "With the server asleep, the app became something anyone can open: this demo, with no account and no production key in it. Courses became places, the start screen became a garden, and this museum took the Forum's tile.",
              ru: "Пока сервер спит, приложение стало тем, что может открыть каждый: этим демо, без аккаунта и без рабочих ключей внутри. Курсы стали местами, стартовый экран — садом, а этот музей занял плитку Форума." }
          ],
          images: [
            shot("museum/history/1122-scene.jpg", "The e-bike course as a place: a junction at night, each chapter where it happens.", "Курс по электровелосипеду как место: ночной перекрёсток, каждая глава там, где она происходит.")
          ],
          more: [
            { en: "Also in these days: the service worker's cache was retired, because it served returning visitors an old copy; a letter went into the mailbox at the garden gate; and the rank line got a sticker to peel.",
              ru: "А ещё в эти дни сняли кэш service worker — он показывал вернувшимся старую копию; в почтовый ящик у входа в сад положили письмо, а на строку ранга — наклейку, которую надо отклеить." }
          ],
          code: "git 77a563a … today"
        }
      ]
    },
    {
      title: { en: "Set aside", ru: "На покое" },
      exhibits: [
        {
          icon: "\u{1F6A6}", title: { en: "The first start screen", ru: "Первый стартовый экран" },
          body: [
            { en: "Until November 2026 the start screen showed the e-bike course's junction. It gave way to the garden because it showed one course, not the idea behind all of them. It still lives in the e-bike course, and here it still runs: tap a chapter.",
              ru: "До ноября 2026 года на стартовом экране был перекрёсток из курса по электровелосипеду. Его сменил сад: перекрёсток показывал один курс, а не идею всех курсов. Он по-прежнему живёт в курсе, а здесь его можно запустить: нажмите на главу." }
          ],
          scene: "bike-a3"
        },
        {
          icon: "\u{1F579}️", title: { en: "The Arcade", ru: "Аркада" },
          body: [
            { en: "Knell once had an Arcade of four small games, each bought once with dollars earned by studying. It was removed on purpose and replaced by the Forum, where what you earn by remembering is given to other people.",
              ru: "Когда-то в Knell была Аркада из четырёх мини-игр, каждую покупали один раз за доллары, заработанные учёбой. Её убрали намеренно и заменили форумом, где заработанное запоминанием отдают другим людям." }
          ],
          images: [
            shot("museum/arcade/arcade.jpg", "The Arcade as a newcomer saw it, 12 August: $0, seven tickets, four games to buy.", "Аркада глазами новичка, 12 августа: $0, семь билетов, четыре игры на покупку.", 576, 350),
            shot("museum/arcade/crash.jpg", "Crash ($75): the multiplier climbs until the curve breaks. Cash out before it does.", "Crash ($75): множитель растёт, пока кривая не сломается. Успейте забрать раньше.", 576, 385),
            shot("museum/arcade/hilo.jpg", "Hi-Lo ($150): call higher or lower. A wrong call takes the whole chain.", "Hi-Lo ($150): выше или ниже. Ошибка забирает всю цепочку.", 485, 325),
            shot("museum/arcade/mines.jpg", "Mines ($200): choose the field and the mines, open safe tiles, stop when you like.", "Mines ($200): выберите поле и число мин, открывайте безопасные клетки и остановитесь, когда захотите.", 492, 422),
            shot("museum/arcade/blackjack.jpg", "Blackjack ($300): classic 21, the dealer stands on 17.", "Blackjack ($300): классическое очко, дилер останавливается на 17.", 395, 325)
          ],
          more: [
            { en: "Every round cost one ticket, seven tickets came back every six hours, and a stake was capped at $50. The Arcade's own screen said why: a break between study sessions, not an income.",
              ru: "Каждый раунд стоил билет, семь билетов возвращались каждые шесть часов, а ставка была не больше $50. Сам экран Аркады объяснял зачем: это перерыв между учёбой, а не заработок." },
            { en: "The house kept a small edge in every game, and the games said so: Crash, for one, paid back 96% of what was staked in the long run. A dearer game was a better game, not one with a bigger cut.",
              ru: "В каждой игре у заведения было небольшое преимущество, и игры об этом говорили: Crash, например, в долгую возвращал 96% поставленного. Игра подороже была лучше, а не с большей долей заведения." },
            { en: "The casino games were removed on 14 August, and two days later the Forum took the tile. These pictures come from the version of 12 August, run again for this museum.",
              ru: "Казино-игры убрали 14 августа, а через два дня плитку занял Форум. Эти снимки сделаны с версии от 12 августа, запущенной заново для этого музея." }
          ],
          code: "games/ in commit 09dfde2: crash.js, hilo.js, mines.js, blackjack.js"
        }
      ]
    },
    {
      title: { en: "How to", ru: "Как пользоваться" },
      exhibits: [
        {
          icon: "\u{1F9ED}", title: { en: "Finding your way", ru: "Куда что ведёт" },
          body: [
            { en: "The circles in the lobby take you somewhere: the Library to the courses, the Garden to what is due today, Career to your rank.",
              ru: "Круги в лобби ведут в разные места: Библиотека — к курсам, Сад — к тому, что пора повторить сегодня, Карьера — к вашему рангу." },
            { en: "In a course, tap a chapter and the runner goes there and opens it. In the Garden, water a plant to review its topic.",
              ru: "В курсе нажмите на главу — человечек добежит туда и откроет её. В Саду полейте растение, чтобы повторить его тему." },
            { en: "Poke the sky: clouds rain, birds dodge arrows, and the wheel in the lobby takes darts.",
              ru: "Потыкайте в небо: облака проливаются дождём, птицы уворачиваются от стрел, а колесо в лобби принимает дротики." }
          ]
        },
        {
          icon: "✉️", title: { en: "The letter", ru: "Письмо" },
          body: [
            { en: "A letter for whoever opens Knell, now or years from now. It is also in the mailbox at the garden gate on the start screen.",
              ru: "Письмо тому, кто откроет Knell, сейчас или через годы. Оно же лежит в почтовом ящике у входа в сад на стартовом экране." }
          ],
          action: { label: { en: "Read it", ru: "Прочитать" }, run: () => Dojo.openLetter && Dojo.openLetter() }
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
      where.appendChild(el("code", null, x.code));
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
      HALLS.forEach(h => {
        body.appendChild(el("h3", "museum-hall", R(h.title)));
        h.exhibits.forEach(x => body.appendChild(exhibitCard(x)));
      });
    }
    showScreen("museum");
  }

  // The lobby tile's subtitle, the same seam every branch uses.
  function museumSummary() {
    return I18N.t("ui.sum.museum");
  }

  Object.assign(Dojo, { renderMuseum, museumSummary });
})();
