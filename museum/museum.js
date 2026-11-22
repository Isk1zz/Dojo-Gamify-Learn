// ================================================
// Knell — MUSEUM  (shown in the demo only)
// ------------------------------------------------
// What Knell has built and set aside.
//
// The demo has no Forum. It needs a server the demo does not have, so
// tools/make-demo.js leaves forum/ out of the copy, and the Forum's
// lobby tile opens this screen instead (wired in core/boot.js). It is
// the same tile, with the same id, rather than a new one, because two
// of the Star looks count tiles exactly (core/lobby.js, RING_TRIM):
// one tile fewer and the Star of David turns back into spokes, while
// the pentagram is drawn lopsided.
//
// It has one exhibit so far, the Forum itself, so the demo still says
// the Forum is built and not launched. Retired looks and a walk through
// the project's history are queued in UPDATESTACK.md, and each one is
// another entry in EXHIBITS.
//
// In the real app nothing routes here, and the Forum keeps its tile.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;

  const INTRO = {
    en: "What Knell has built and set aside.",
    ru: "То, что в Knell построено и отложено."
  };

  // An icon, a title and a few plain sentences. Text only, on purpose:
  // an exhibit has to stay true however long it sits here.
  const EXHIBITS = [
    {
      icon: "\u{1F4AC}",
      title: { en: "The Forum: built, not launched yet",
               ru: "Форум: построен, ещё не запущен" },
      body: {
        en: "Posts, replies, praise, reports and moderation are in the code, and were tested against a live database. The Forum needs that server and the demo has none, so here it is an exhibit.",
        ru: "Посты, ответы, похвала, жалобы и модерация есть в коде и проверялись на живой базе. Форуму нужен этот сервер, а у демо его нет, поэтому здесь он экспонат."
      }
    }
  ];

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  function renderMuseum() {
    const body = document.getElementById("museum-body");
    if (body) {
      body.replaceChildren(el("p", "museum-intro", I18N.resolve(INTRO)));
      EXHIBITS.forEach(x => {
        const card = el("article", "museum-exhibit");
        card.append(
          el("div", "museum-icon", x.icon),
          el("h3", "museum-title", I18N.resolve(x.title)),
          el("p", "museum-text", I18N.resolve(x.body))
        );
        body.appendChild(card);
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
