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
// Every claim here was checked against the code and docs/SHOWCASE.md
// on the day it was written. If the app changes, these change with it.
//
// In the real app nothing routes here, and the Forum keeps its tile.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;

  const INTRO = {
    en: "How Knell works, and what it has built and set aside. Tap a card to open it.",
    ru: "Как устроен Knell и что в нём построено и отложено. Нажмите на карточку, чтобы открыть."
  };

  // A hall is a title and its exhibits. An exhibit is an icon, a title
  // and paragraphs; `scene` runs a scene inside it, and `action` adds a
  // button (the letter, the rank guide).
  const HALLS = [
    {
      title: { en: "How it works", ru: "Как это устроено" },
      exhibits: [
        {
          icon: "\u{1F4DA}", title: { en: "Courses", ru: "Курсы" },
          body: [
            { en: "A course is made of units, a unit of topics, and a topic is taught in chunks.",
              ru: "Курс состоит из блоков, блок — из тем, а тема преподаётся частями." },
            { en: "Each chunk explains one idea, shows a worked example and asks a question. A question you miss comes back before the exam, with its options in a new order.",
              ru: "Каждая часть объясняет одну идею, показывает разобранный пример и задаёт вопрос. Вопрос, на который вы ошиблись, вернётся перед экзаменом, с вариантами в новом порядке." },
            { en: "A topic ends in a five-question exam, and four right passes it. Fail it twice and the topic has to be worked through again.",
              ru: "Тема заканчивается экзаменом из пяти вопросов: четыре верных ответа — тема сдана. Провалите его дважды — тему придётся пройти заново." }
          ]
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
          ]
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
          ]
        },
        {
          icon: "\u{1F0CF}", title: { en: "Flashcards", ru: "Карточки" },
          body: [
            { en: "A topic due for review is reviewed as a deck of cards built from questions the course already has: one card for each chunk's question and one for each exam question.",
              ru: "Тема, которую пора повторить, повторяется колодой карточек из вопросов, которые в курсе уже есть: по карточке на вопрос каждой части и на каждый вопрос экзамена." },
            { en: "After each card you rate how well you remembered it. That self-rating is the weakest measurement in the app. The fix is decided but not built yet: type the answer first, then tick off its key points.",
              ru: "После каждой карточки вы сами оцениваете, насколько хорошо вспомнили. Эта самооценка — самое слабое измерение в приложении. Замена решена, но ещё не сделана: сначала напечатать ответ, потом отметить его ключевые пункты." }
          ]
        },
        {
          icon: "\u{1F396}️", title: { en: "Ranks", ru: "Ранги" },
          body: [
            { en: "Studying earns XP, XP raises your rank, and each of the twenty ranks hands out a reward. A newcomer finds the rank line under a sticker; peeling it opens a short guide, which this button shows again.",
              ru: "Учёба приносит опыт, опыт поднимает ранг, а каждый из двадцати рангов даёт награду. Новичок видит строку ранга под наклейкой; если её отклеить, откроется короткое знакомство. Эта кнопка показывает его снова." }
          ],
          action: { label: { en: "Show the guide", ru: "Показать знакомство" }, run: () => Dojo.openRankGuide && Dojo.openRankGuide() }
        },
        {
          icon: "\u{1F5FA}️", title: { en: "Scenes", ru: "Сцены" },
          body: [
            { en: "Some courses are drawn as places: the e-bike course is a junction, Intro to CS a computer lab, and the start screen a garden. Pick a chapter and a small figure walks there along the paths, then opens it.",
              ru: "Некоторые курсы нарисованы как места: курс по электровелосипеду — перекрёсток, Intro to CS — компьютерный класс, а стартовый экран — сад. Выберите главу, и человечек дойдёт до неё по дорожкам и откроет её." },
            { en: "Every scene is drawn by one engine from a recipe, which is plain data: what stands where, and in what colours. A new scene is a new recipe. When it needs a new kind of thing, the engine learns it once, for every scene.",
              ru: "Все сцены рисует один движок по рецепту — это просто данные: что где стоит и каких цветов. Новая сцена — это новый рецепт. Если ей нужна новая вещь, движок учится рисовать её один раз, для всех сцен сразу." }
          ]
        }
      ]
    },
    {
      title: { en: "Behind the scenes", ru: "За кадром" },
      exhibits: [
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
          ]
        },
        {
          icon: "\u{1F4AC}", title: { en: "The Forum: built, not launched yet", ru: "Форум: построен, ещё не запущен" },
          body: [
            { en: "Posts, replies, praise, reports and moderation are in the code, and were tested against a live database. The Forum needs that server and the demo has none, so here it is an exhibit.",
              ru: "Посты, ответы, похвала, жалобы и модерация есть в коде и проверялись на живой базе. Форуму нужен этот сервер, а у демо его нет, поэтому здесь он экспонат." }
          ]
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
            { en: "Knell once had an Arcade of small games, unlocked with points earned by studying. It was removed on purpose and replaced by the Forum, where what you earn by remembering is given to other people.",
              ru: "Когда-то в Knell была Аркада с мини-играми, которые открывались за очки, заработанные учёбой. Её убрали намеренно и заменили форумом, где заработанное запоминанием отдают другим людям." }
          ]
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

  function exhibitCard(x) {
    const card = el("details", "museum-exhibit");
    const sum = el("summary", "museum-summary");
    sum.append(el("span", "museum-icon", x.icon), el("span", "museum-title", R(x.title)));
    card.appendChild(sum);
    const body = el("div", "museum-body");
    x.body.forEach(p => body.appendChild(el("p", "museum-text", R(p))));
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
