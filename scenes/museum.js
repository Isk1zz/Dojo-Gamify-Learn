// ================================================
// Knell — scene recipes: the museum's halls
// ------------------------------------------------
// A small scene over each hall of the museum, a pin for each of its
// cards, in the cards' order (asked 2026-11-24: «как на счет визуальных
// сцен в музей?»; then one scene for the whole museum was «скучная», and
// of the choices offered, «Мини-сцена в каждом зале»). museum/museum.js
// mounts each one over its hall: a tap sends the runner to an exhibit,
// the exhibit answers (most hop; the bell swings, the cloud rains), and
// that card opens below.
//
//   museum-how      How it works: a study garden, an exhibit per idea
//   museum-behind   Behind the scenes: the workshop
//   museum-history  History, by date: a road through time, a stop a card
//   museum-aside    Set aside: the storeroom
//   museum-howto    How to: the garden gate, the mailbox, a red postbox
//
// Data only: scenes/scene.js draws them. Pins fold to numbers (`compact`)
// and show their name on a hover, on focus, or where the runner stands.
// ================================================
(() => {
  const DEEP = [{ t: 0.22, c: "#3b2c20" }, { t: 0.3, c: "#4f4a45", grain: true }];
  const FLOOR = [{ t: 0.18, c: "#1b1720" }, { t: 0.3, c: "#4f4a45", grain: true }];
  const PINS = "#f2c14e";
  const seams = (n, len, axis, stroke) => Array.from({ length: n - 1 }, (_, i) => axis === "x"
    ? { kind: "line", from: [i + 1, 0], to: [i + 1, len], stroke, width: 1, opacity: 0.45 }
    : { kind: "line", from: [0, i + 1], to: [len, i + 1], stroke, width: 1, opacity: 0.45 });

  // ---- How it works: a study garden ------------------------------------
  // A path round a lawn, and on its edges a piece for each card: the
  // calendar page a month on, books, the review intervals on a board, the
  // Garden's stages on a bed, flashcards, a reader with scrolls, the rank
  // podium, a painted scene on an easel.
  Dojo.Scenes.register("museum-how", {
    title: { en: "How it works, as a study garden", ru: "Как это устроено: учебный сад", he: "איך זה עובד, כגינת לימוד" },
    seed: 21, spriteScale: 1.45, compact: true,
    frame: { x: 100, y: 64, w: 800, h: 640 },
    palette: {
      grass: "#2f5a3e", grassEdge: "#35664a", path: "#7d6f57", pathEdge: "#6e624d", soil: "#4a3828",
      leaf: "#2f7a4c", trunk: "#5a3f2c", blossom: "#f4a8c6", desk: "#5a4637", toga: "#e9e4d8",
      parchment: "#e8dcb8", accent: PINS, runner: "#7b6cff", light: "#ffe2a0", window: "#9fd3ff",
      haze: "#f2c14e", skyline: "#141a27"
    },
    day: {
      palette: { grass: "#5a9e4e", grassEdge: "#4d8a43", path: "#d8c7a0", pathEdge: "#c4b28a", soil: "#8a6845",
        leaf: "#4caa55", trunk: "#7a5a3a", desk: "#a9805e" },
      hide: ["fireflies"]
    },
    block: { w: 9, d: 6, top: 210, skin: 0.12, strata: DEEP },
    surface: [
      { kind: "rect", x0: 0, y0: 0, x1: 9, y1: 6, fill: "grass", edge: "grassEdge" },
      { kind: "rect", x0: 1.6, y0: 1.4, x1: 7.4, y1: 2.0, fill: "path" },
      { kind: "rect", x0: 6.8, y0: 1.4, x1: 7.4, y1: 4.6, fill: "path" },
      { kind: "rect", x0: 1.6, y0: 4.0, x1: 7.4, y1: 4.6, fill: "path" },
      { kind: "rect", x0: 1.6, y0: 1.4, x1: 2.2, y1: 4.6, fill: "path" },
      { kind: "rect", x0: 4.2, y0: 4.6, x1: 4.8, y1: 6.0, fill: "path", edge: "pathEdge" },
      { kind: "pool", at: [4.9, 2.7], r: 1.3 },
      { kind: "pool", at: [8.3, 3.0], r: 1.2 }
    ],
    objects: [
      // 1. The one idea: a calendar page thirty days on, and still a tick.
      { kind: "board", at: [1.0, 0.8], big: "30", tick: true, w: 30, h: 24, actor: "idea" },
      // 2. Courses: books on a table.
      { kind: "box", x0: 2.8, y0: 0.5, x1: 3.9, y1: 1.1, h: 0.42, wall: "desk", windows: false },
      { kind: "books", at: [3.35, 0.8], z: 0.42, depth: 4.2, actor: "books" },
      // 3. How remembering works: the review intervals, as on a board.
      { kind: "board", at: [5.4, 0.8], lines: ["1 → 6 → 15", "× 2.5"], w: 40, actor: "board" },
      // 4. The Garden: every stage on one bed, from sprout to tree in
      // bloom. On top of the bed, so each sorts after it by hand.
      { kind: "box", x0: 7.85, y0: 0.9, x1: 8.75, y1: 5.1, h: 0.14, wall: "soil", windows: false },
      { kind: "sprout", at: [8.3, 1.3], z: 0.14, scale: 1.6, depth: 11.31, actor: "garden" },
      { kind: "seedling", at: [8.3, 2.1], z: 0.14, scale: 1.4, depth: 11.32, actor: "garden", delay: 0.15 },
      { kind: "stalks", at: [8.3, 2.9], z: 0.14, scale: 1.2, depth: 11.33, actor: "garden", delay: 0.3 },
      { kind: "tree", at: [8.3, 3.8], z: 0.14, size: 0.5, depth: 12.11, actor: "garden", delay: 0.45 },
      { kind: "tree", at: [8.3, 4.7], z: 0.14, size: 0.62, blossom: true, depth: 13.01, actor: "garden", delay: 0.6 },
      { kind: "fireflies", at: [8.2, 2.6], z: 0.8, depth: 13.5 },
      // 5. Flashcards, fanned on a stand.
      { kind: "cards", at: [6.2, 5.3], actor: "cards" },
      // 6. Quotes after learning: a reader in a toga, scrolls beside him.
      { kind: "bench", at: [2.8, 5.3] },
      { kind: "person", at: [2.8, 5.3], sit: true, toga: true, hold: "book", hair: "#1b1b1b", skin: "#c99a7a", depth: 8.11, actor: "quotes" },
      { kind: "box", x0: 3.5, y0: 5.1, x1: 4.05, y1: 5.65, h: 0.4, wall: "desk", windows: false },
      { kind: "scrolls", at: [3.78, 5.38], z: 0.4, depth: 9.2 },
      // 7. Ranks and rewards: the podium.
      { kind: "trophy", at: [0.9, 3.6], actor: "trophy" },
      // 8. Scenes: a little landscape on an easel.
      { kind: "board", at: [0.8, 2.1], art: "picture", w: 30, actor: "scenes" },
      // The lawn in the middle, its lamp, a cat by the way in.
      { kind: "flowers", at: [4.0, 3.2] },
      { kind: "lamp", at: [4.5, 2.6] }
    ],
    pins: [
      { n: 1, act: "idea", icon: "💡", at: [1.0, 0.8], z1: 2.4, stand: "A", label: { en: "The one idea", ru: "Главная идея", he: "הרעיון האחד" } },
      { n: 2, act: "books", icon: "📚", at: [3.35, 0.8], z0: 0.42, z1: 2.0, stand: "B1", label: { en: "Courses", ru: "Курсы", he: "קורסים" } },
      { n: 3, act: "board", icon: "🧠", at: [5.4, 0.8], z1: 2.4, stand: "B2", label: { en: "Remembering", ru: "Запоминание", he: "הזיכרון" } },
      { n: 4, act: "garden", icon: "🌱", at: [8.3, 3.8], z0: 0.14, z1: 2.5, stand: "R", label: { en: "The Garden", ru: "Сад", he: "הגינה" } },
      { n: 5, act: "cards", icon: "🃏", at: [6.2, 5.3], z1: 1.7, stand: "F1", label: { en: "Flashcards", ru: "Карточки", he: "כרטיסיות" } },
      { n: 6, act: "quotes", icon: "📜", at: [2.8, 5.3], z1: 1.5, stand: "F2", label: { en: "Quotes", ru: "Цитаты", he: "ציטוטים" } },
      { n: 7, act: "trophy", icon: "🎖️", at: [0.9, 3.6], z1: 1.8, stand: "L1", label: { en: "Ranks", ru: "Ранги", he: "דרגות" } },
      { n: 8, act: "scenes", icon: "🗺️", at: [0.8, 2.1], z1: 2.4, stand: "L2", label: { en: "Scenes", ru: "Сцены", he: "סצנות" } }
    ],
    walk: {
      start: "door",
      nodes: {
        A: [1.9, 1.7], B1: [3.35, 1.7], B2: [5.4, 1.7], B: [7.1, 1.7], R: [7.1, 3.0], C: [7.1, 4.3],
        F1: [6.2, 4.3], G: [4.5, 4.3], F2: [3.0, 4.3], D: [1.9, 4.3], L1: [1.9, 3.6], L2: [1.9, 2.3],
        door: [4.5, 5.8]
      },
      edges: [
        ["A", "B1"], ["B1", "B2"], ["B2", "B"], ["B", "R"], ["R", "C"], ["C", "F1"], ["F1", "G"],
        ["G", "F2"], ["F2", "D"], ["D", "L1"], ["L1", "L2"], ["L2", "A"], ["G", "door"]
      ]
    },
    backdrop: { kind: "none", stars: 30 }
  });

  // ---- Behind the scenes: the workshop ---------------------------------
  // The code on a screen over the desk, the sync rules on a whiteboard by
  // the database, the Forum roped off, the demo on a monitor, the author
  // directing a robot, and the data side on the wall and an easel.
  Dojo.Scenes.register("museum-behind", {
    title: { en: "Behind the scenes, as a workshop", ru: "За кадром: мастерская", he: "מאחורי הקלעים, כבית מלאכה" },
    seed: 22, spriteScale: 1.35, compact: true,
    frame: { x: 100, y: 38, w: 800, h: 660 },
    palette: {
      floor: "#3d3a44", floorEdge: "#4a4652", floorLine: "#4a4652", rug: "#2f4a5a",
      wall: "#26324a", cap: "#3d4d6b", desk: "#5a4637", stand: "#3b4458",
      leaf: "#2f7a4c", trunk: "#5a3f2c", accent: PINS, runner: "#7b6cff", light: "#ffe2a0",
      window: "#9fd3ff", haze: "#f2c14e", skyline: "#141a27"
    },
    day: {
      palette: { floor: "#9a8f80", floorEdge: "#857a6c", floorLine: "#8a7f70", rug: "#5b8299",
        wall: "#d9dde6", cap: "#c2c8d4", desk: "#a9805e", stand: "#7d8698", leaf: "#4caa55", window: "#d6ecff" }
    },
    block: { w: 8, d: 6, top: 220, skin: 0.1, strata: FLOOR },
    walls: {
      height: 2.6, thickness: 0.2, color: "wall", cap: "cap",
      art: [
        { wall: "back", from: 0.5, to: 3.2, z0: 0.9, z1: 2.3, art: "screen",
          lines: ["<script src=", "  \"core/i18n.js\">", "<script src=", "  \"data/db.js\">"] },
        { wall: "back", from: 5.9, to: 7.5, z0: 1.0, z1: 2.2, art: "window" },
        { wall: "left", from: 0.2, to: 1.7, z0: 0.9, z1: 2.1, art: "whiteboard", lines: ["A ∪ B", "max(a, b)"] },
        { wall: "left", from: 3.4, to: 5.6, z0: 0.9, z1: 2.3, art: "poster",
          title: "DATA SCIENCE", diagram: "net", bg: "#2a2140", ink: "#f2c14e" }
      ]
    },
    surface: [
      { kind: "rect", x0: 0, y0: 0, x1: 8, y1: 6, fill: "floor", edge: "floorEdge" },
      ...seams(8, 6, "x", "floorLine"),
      { kind: "rect", x0: 3.1, y0: 3.0, x1: 5.7, y1: 5.0, fill: "rug" },
      { kind: "pool", at: [1.8, 1.0], r: 1.2 },
      { kind: "pool", at: [4.4, 3.9], r: 1.3 }
    ],
    objects: [
      // 1. How the code is built: the desk and its two screens.
      { kind: "box", x0: 0.5, y0: 0.3, x1: 3.1, y1: 0.95, h: 0.5, wall: "desk", windows: false },
      { kind: "monitor", at: [1.2, 0.62], z: 0.5, depth: 2.5, actor: "code" },
      { kind: "monitor", at: [2.35, 0.62], z: 0.5, depth: 2.51, actor: "code" },
      // 2. Accounts: the database under the whiteboard of sync rules.
      { kind: "database", at: [0.9, 2.7], actor: "db" },
      // 3. The Forum: built, roped off, not open yet.
      { kind: "board", at: [4.6, 0.75], art: "forum", w: 32, h: 26, actor: "forum" },
      { kind: "rope", at: [4.6, 1.45], len: 1.8 },
      // 4. This demo, on a monitor of its own.
      { kind: "box", x0: 6.5, y0: 2.3, x1: 7.3, y1: 3.1, h: 0.55, wall: "stand", windows: false },
      { kind: "monitor", at: [6.9, 2.7], z: 0.55, text: "DEMO", depth: 9.7, actor: "demo" },
      // 5. How it was made: the author directing, the robot at work.
      { kind: "robot", at: [4.8, 3.7], actor: "made" },
      { kind: "person", at: [3.9, 4.0], arm: "up", shirt: "#4a8a8c", hair: "#2a1d16" },
      // 6. The author, and the data side: a chart on an easel.
      { kind: "board", at: [1.0, 4.7], art: "chart", w: 30, actor: "data" }
    ],
    pins: [
      { n: 1, act: "code", icon: "🧩", at: [1.78, 0.62], z0: 0.5, z1: 2.9, stand: "a", label: { en: "The code", ru: "Код", he: "הקוד" } },
      { n: 2, act: "db", icon: "🔐", at: [0.9, 2.7], z1: 1.9, stand: "b", label: { en: "Accounts", ru: "Аккаунты", he: "חשבונות" } },
      { n: 3, act: "forum", icon: "💬", at: [4.6, 0.75], z1: 2.4, stand: "c", label: { en: "The Forum", ru: "Форум", he: "הפורום" } },
      { n: 4, act: "demo", icon: "🧪", at: [6.9, 2.7], z0: 0.55, z1: 2.0, stand: "d", label: { en: "This demo", ru: "Это демо", he: "הדמו הזה" } },
      { n: 5, act: "made", icon: "🛠️", at: [4.8, 3.7], z1: 1.9, stand: "e", label: { en: "How it was made", ru: "Как сделано", he: "איך זה נעשה" } },
      { n: 6, act: "data", icon: "📊", at: [1.0, 4.7], z1: 2.0, stand: "f", label: { en: "The author", ru: "Автор", he: "המחבר" } }
    ],
    walk: {
      start: "door",
      nodes: {
        door: [4.2, 5.7], e: [4.3, 4.7], hub: [4.0, 2.4], a: [1.8, 1.8], b: [1.9, 2.9],
        c: [4.6, 1.9], d: [6.0, 3.0], f: [1.9, 4.6]
      },
      edges: [["door", "e"], ["e", "hub"], ["hub", "c"], ["hub", "a"], ["a", "b"], ["b", "f"], ["f", "e"], ["hub", "d"], ["d", "e"]]
    },
    backdrop: { kind: "none", stars: 24 }
  });

  // ---- History, by date: a road through time ---------------------------
  // A long strip with a road down it, and behind the road a stop for each
  // card, first to last: the hourglass, the dojo, the coins, the
  // raincloud, the bell, the server's door asleep, the one constant's
  // numbers, the portfolio's picture, the signpost in three alphabets.
  // All on one side of the road, so that left to right on the screen is
  // first to last in time (by turns on both sides, the order zigzagged).
  const X = Array.from({ length: 9 }, (_, i) => Math.round((0.9 + i * 1.55) * 100) / 100);
  Dojo.Scenes.register("museum-history", {
    title: { en: "History, as a road through time", ru: "История: дорога через время", he: "היסטוריה, כשביל לאורך הזמן" },
    seed: 23, spriteScale: 1.4, compact: true,
    frame: { x: 100, y: 60, w: 800, h: 600 },
    palette: {
      ground: "#33402f", groundEdge: "#3b4a36", road: "#6c717d", roadEdge: "#5d626d", mark: "#e9e4d8",
      dojo: "#8a3b2e", dojoRoof: "#2b2f38", stone: "#7d828c", marble: "#dcd6cc", bell: "#c99a3e",
      roof: "#36506a", soil: "#4a3828", leaf: "#2f7a4c", trunk: "#5a3f2c", accent: PINS, runner: "#7b6cff",
      light: "#ffe2a0", window: "#9fd3ff", haze: "#f2c14e", skyline: "#141a27"
    },
    day: {
      palette: { ground: "#6aa356", groundEdge: "#5b8e4a", road: "#a2a7b0", roadEdge: "#8d939c",
        dojo: "#b5543f", roof: "#5b7fa6", bell: "#d9ad4a", soil: "#8a6845", leaf: "#4caa55", trunk: "#7a5a3a" }
    },
    block: { w: 14.5, d: 3.2, top: 170, skin: 0.12, strata: DEEP },
    surface: [
      { kind: "rect", x0: 0, y0: 0, x1: 14.5, y1: 3.2, fill: "ground", edge: "groundEdge" },
      { kind: "rect", x0: 0, y0: 1.6, x1: 14.5, y1: 2.2, fill: "road", edge: "roadEdge" },
      ...X.map(x => ({ kind: "line", from: [x, 1.65], to: [x, 2.15], stroke: "mark", width: 2, opacity: 0.7 })),
      { kind: "pool", at: [X[4], 1.2], r: 1.1 },
      { kind: "pool", at: [X[5], 1.3], r: 0.8 }
    ],
    objects: [
      // 1. What went into it: the hourglass.
      { kind: "hourglass", at: [X[0], 0.85], scale: 1.2, actor: "time" },
      // 2. 10–12 August, Dojo: a small dojo, and someone in white mid-kata.
      { kind: "box", x0: X[1] - 0.42, y0: 0.4, x1: X[1] + 0.42, y1: 1.1, h: 0.55, wall: "dojo", windows: false, door: true,
        roof: { h: 0.4, gable: "x", color: "dojoRoof" } },
      { kind: "person", at: [X[1] + 0.3, 1.42], arm: "up", shirt: "#f4f1ea", pants: "#f4f1ea", hair: "#1b1b1b", actor: "dojo" },
      // 3. 13–14 August, an economy: coins.
      { kind: "coins", at: [X[2], 0.85], scale: 1.15, actor: "coins" },
      // 4. 15–16 August, the sky: a raincloud over flowers; it rains when reached.
      { kind: "flowers", at: [X[3], 0.85] },
      { kind: "cloud", at: [X[3], 0.85], z: 1.55, actor: "rain", depth: 30 },
      // 5. 24–26 August, Knell: the bell under its roof. Plinth, posts
      // with no front one, bell, roof, by hand so it hangs between them.
      { kind: "box", x0: X[4] - 0.55, y0: 0.3, x1: X[4] + 0.55, y1: 1.4, h: 0.3, wall: "marble", windows: false, depth: X[4] + 0.5 },
      { kind: "box", x0: X[4] - 0.48, y0: 0.37, x1: X[4] - 0.3, y1: 0.55, z0: 0.3, h: 1.1, wall: "stone", windows: false, depth: X[4] + 0.51 },
      { kind: "box", x0: X[4] - 0.48, y0: 1.15, x1: X[4] - 0.3, y1: 1.33, z0: 0.3, h: 1.1, wall: "stone", windows: false, depth: X[4] + 0.52 },
      { kind: "box", x0: X[4] + 0.3, y0: 0.37, x1: X[4] + 0.48, y1: 0.55, z0: 0.3, h: 1.1, wall: "stone", windows: false, depth: X[4] + 0.52 },
      { kind: "bell", at: [X[4], 0.85], z: 0.34, scale: 0.85, depth: X[4] + 0.53 },
      { kind: "box", x0: X[4] - 0.55, y0: 0.3, x1: X[4] + 0.55, y1: 1.4, z0: 1.4, h: 0.12, wall: "stone", windows: false, roof: { h: 0.65 }, depth: X[4] + 0.54 },
      // 6. 27 August – 3 September, the server: everything went behind
      // this door, and the door is asleep now.
      { kind: "door", at: [X[5], 0.85], sleep: true, actor: "door" },
      // 7. 13 October, one constant: the measured interval, before and after.
      { kind: "board", at: [X[6], 0.8], lines: ["238 → 153"], w: 38, h: 14, actor: "constant" },
      // 8. 19–22 November, a portfolio piece: a picture in a gilt frame.
      { kind: "board", at: [X[7], 0.85], art: "picture", w: 30, actor: "portfolio" },
      // 9. 23–24 November, three languages: a signpost in three alphabets.
      { kind: "signpost", at: [X[8], 0.8], arms: [["Aa", "#5b8def"], ["Яя", "#e86a5c"], ["אב", "#2fa35a"]], actor: "langs" },
      // In front of the road: two lamps, set where they stand between
      // two stops on the screen rather than in front of one, and trees.
      { kind: "lamp", at: [5.12, 2.75] },
      { kind: "lamp", at: [11.32, 2.75] },
      { kind: "tree", at: [0.6, 2.7], size: 0.55 },
      { kind: "tree", at: [14.0, 2.6], size: 0.5 }
    ],
    // Someone walking a dog down the years.
    movers: [{ kind: "walker", from: 0.3, to: 14.2, y: 2.45, speed: 0.3 }],
    pins: [
      { n: 1, act: "time", icon: "⏳", at: [X[0], 0.85], z1: 1.9, stand: "n1", label: { en: "What went in", ru: "Сколько вложено", he: "כמה הושקע" } },
      { n: 2, act: "dojo", icon: "🥋", at: [X[1], 0.75], z1: 1.9, stand: "n2", label: { en: "Dojo", ru: "Dojo", he: "Dojo" } },
      { n: 3, act: "coins", icon: "🪙", at: [X[2], 0.85], z1: 1.4, stand: "n3", label: { en: "An economy", ru: "Экономика", he: "כלכלה" } },
      { n: 4, act: "rain", icon: "☁️", at: [X[3], 0.85], z1: 2.6, stand: "n4", label: { en: "The sky", ru: "Небо", he: "השמיים" } },
      { n: 5, act: "bell", icon: "🔔", at: [X[4], 0.85], z0: 0.3, z1: 2.9, stand: "n5", label: { en: "Knell", ru: "Knell", he: "Knell" } },
      { n: 6, act: "door", icon: "🔑", at: [X[5], 0.85], z1: 2.0, stand: "n6", label: { en: "The server", ru: "Сервер", he: "השרת" } },
      { n: 7, act: "constant", icon: "📐", at: [X[6], 0.8], z1: 1.8, stand: "n7", label: { en: "One constant", ru: "Одна константа", he: "קבוע אחד" } },
      { n: 8, act: "portfolio", icon: "🖼️", at: [X[7], 0.85], z1: 2.0, stand: "n8", label: { en: "Portfolio", ru: "Портфолио", he: "תיק עבודות" } },
      { n: 9, act: "langs", icon: "🌍", at: [X[8], 0.8], z1: 2.1, stand: "n9", label: { en: "Three languages", ru: "Три языка", he: "שלוש שפות" } }
    ],
    walk: {
      start: "t0",
      nodes: Object.assign({ t0: [0.25, 1.9] }, ...X.map((x, i) => ({ ["n" + (i + 1)]: [x, 1.9] }))),
      edges: X.map((_, i) => [i ? "n" + i : "t0", "n" + (i + 1)])
    },
    backdrop: { kind: "none", stars: 36 }
  });

  // ---- Set aside: the storeroom -----------------------------------------
  // What was retired is kept, not thrown out: the old start screen's
  // junction on a plinth behind a rope, the Arcade's cabinet with its
  // lights still on, crates, something under a dust sheet, a cat asleep.
  Dojo.Scenes.register("museum-aside", {
    title: { en: "Set aside, as a storeroom", ru: "На покое: кладовая", he: "הונח בצד, כמחסן" },
    seed: 24, spriteScale: 1.15, compact: true,
    frame: { x: 100, y: 16, w: 800, h: 700 },
    palette: {
      floor: "#4a3c30", floorEdge: "#56463a", floorLine: "#56463a", wall: "#3a3530", cap: "#5a5048",
      asphalt: "#3b3f48", marking: "#e9e4d8", crate: "#8a6a44", sheet: "#cfc8b8", arcade: "#5b2a7a",
      accent: PINS, runner: "#7b6cff", light: "#ffe2a0", window: "#9fd3ff", haze: "#f2c14e", skyline: "#141a27"
    },
    day: {
      palette: { floor: "#a08468", floorEdge: "#8c735a", floorLine: "#927860", wall: "#cfc4b2", cap: "#b8ab96",
        asphalt: "#6d727c", crate: "#b08a5a", window: "#d6ecff" }
    },
    block: { w: 6, d: 5, top: 230, skin: 0.1, strata: FLOOR },
    walls: {
      height: 2.4, thickness: 0.2, color: "wall", cap: "cap",
      art: [
        { wall: "back", from: 3.3, to: 5.5, z0: 1.4, z1: 2.15, art: "poster", title: "INSERT COIN", bg: "#1b1030", ink: "#ff6ad5" },
        { wall: "left", from: 1.4, to: 2.8, z0: 1.0, z1: 2.0, art: "window" }
      ]
    },
    surface: [
      { kind: "rect", x0: 0, y0: 0, x1: 6, y1: 5, fill: "floor", edge: "floorEdge" },
      ...seams(6, 5, "x", "floorLine"),
      { kind: "pool", at: [1.9, 2.5], r: 1.2 },
      { kind: "pool", at: [4.7, 1.6], r: 0.9 }
    ],
    objects: [
      // Crates in the corner, the cat asleep on top, a dust sheet.
      { kind: "box", x0: 0.25, y0: 0.25, x1: 1.05, y1: 1.05, h: 0.75, wall: "crate", windows: false },
      { kind: "box", x0: 0.32, y0: 0.32, x1: 0.98, y1: 0.98, z0: 0.75, h: 0.5, wall: "crate", windows: false, depth: 1.31 },
      { kind: "cat", at: [0.65, 0.65], z: 1.25, color: "#e8a65a", depth: 1.4 },
      { kind: "box", x0: 1.4, y0: 0.25, x1: 2.5, y1: 0.85, h: 0.8, wall: "sheet", windows: false },
      // 1. The first start screen: the e-bike junction on an asphalt
      // plinth, its zebra, the rider, the light and a sign; a rope in front.
      { kind: "box", x0: 0.6, y0: 1.6, x1: 3.2, y1: 3.4, h: 0.22, wall: "asphalt", windows: false },
      ...[2.2, 2.45, 2.7].map((x, i) =>
        ({ kind: "box", x0: x, y0: 2.6, x1: x + 0.12, y1: 3.3, z0: 0.22, h: 0.01, wall: "marking", windows: false, depth: 5.2 + i * 0.01 })),
      { kind: "rider", at: [1.4, 2.3], z: 0.22, depth: 4.6, actor: "rider" },
      { kind: "trafficLight", at: [2.9, 1.8], z: 0.22, depth: 4.75 },
      { kind: "sign", at: [0.9, 3.1], z: 0.22, face: "bike", depth: 4.8 },
      { kind: "rope", at: [1.9, 3.85], len: 2.2 },
      // 2. The Arcade: the cabinet, lights still on, and the coins it took.
      { kind: "box", x0: 4.3, y0: 0.5, x1: 5.1, y1: 1.3, h: 1.2, wall: "arcade", windows: false, leds: true },
      { kind: "monitor", at: [4.7, 0.9], z: 1.2, game: true, depth: 5.7, actor: "arcade" },
      { kind: "coins", at: [4.0, 1.9] },
      { kind: "box", x0: 5.0, y0: 3.6, x1: 5.6, y1: 4.2, h: 0.6, wall: "crate", windows: false }
    ],
    pins: [
      { n: 1, act: "rider", icon: "🚦", at: [1.4, 2.3], z0: 0.22, z1: 1.9, stand: "a", label: { en: "First start screen", ru: "Первый экран", he: "מסך הפתיחה הראשון" } },
      { n: 2, act: "arcade", icon: "🕹️", at: [4.7, 1.45], z1: 2.5, stand: "b", label: { en: "The Arcade", ru: "Аркада", he: "הארקייד" } }
    ],
    walk: {
      start: "door",
      nodes: { door: [3.6, 4.6], a: [2.2, 4.25], m: [3.7, 3.4], b: [4.4, 2.4] },
      edges: [["door", "m"], ["m", "a"], ["m", "b"], ["door", "a"]]
    },
    backdrop: { kind: "none", stars: 20 }
  });

  // ---- How to: the garden gate ------------------------------------------
  // In through the gate: a signpost with arms for the lobby's three
  // circles, a hot-air balloon drifting over, the mailbox with the letter,
  // and a red postbox for writing back.
  Dojo.Scenes.register("museum-howto", {
    title: { en: "How to, at the garden gate", ru: "Как пользоваться: у калитки сада", he: "איך משתמשים, בשער הגינה" },
    seed: 25, spriteScale: 1.35, compact: true,
    frame: { x: 100, y: 64, w: 800, h: 650 },
    palette: {
      grass: "#2f5a3e", grassEdge: "#35664a", path: "#7d6f57", pathEdge: "#6e624d", fence: "#6b4a33",
      stone: "#7d828c", soil: "#4a3828", leaf: "#2f7a4c", trunk: "#5a3f2c", accent: PINS, runner: "#7b6cff",
      light: "#ffe2a0", window: "#9fd3ff", haze: "#f2c14e", skyline: "#141a27"
    },
    day: {
      palette: { grass: "#5a9e4e", grassEdge: "#4d8a43", path: "#d8c7a0", pathEdge: "#c4b28a", fence: "#a07850",
        stone: "#a2a7b0", soil: "#8a6845", leaf: "#4caa55", trunk: "#7a5a3a" },
      hide: ["fireflies"]
    },
    block: { w: 8, d: 5, top: 220, skin: 0.12, strata: DEEP },
    surface: [
      { kind: "rect", x0: 0, y0: 0, x1: 8, y1: 5, fill: "grass", edge: "grassEdge" },
      { kind: "rect", x0: 1.4, y0: 1.8, x1: 7.2, y1: 2.4, fill: "path" },
      { kind: "rect", x0: 3.7, y0: 2.4, x1: 4.3, y1: 5.0, fill: "path", edge: "pathEdge" },
      { kind: "pool", at: [4.8, 3.9], r: 1.1 },
      { kind: "pool", at: [6.4, 1.6], r: 0.9 }
    ],
    objects: [
      // The fence along the front, and the gate's two posts.
      { kind: "box", x0: 0.2, y0: 4.6, x1: 3.45, y1: 4.72, h: 0.3, wall: "fence", windows: false },
      { kind: "box", x0: 4.55, y0: 4.6, x1: 7.8, y1: 4.72, h: 0.3, wall: "fence", windows: false },
      { kind: "box", x0: 3.45, y0: 4.55, x1: 3.65, y1: 4.75, h: 0.85, wall: "stone", windows: false },
      { kind: "box", x0: 4.35, y0: 4.55, x1: 4.55, y1: 4.75, h: 0.85, wall: "stone", windows: false },
      // 1. Finding your way: a signpost, an arm for each of the lobby's
      // circles (the Library, the Garden, Career).
      { kind: "signpost", at: [1.5, 1.2], arms: [["", "#5b8def"], ["", "#4caa55"], ["", "#f2c14e"]], scale: 1.15, actor: "way" },
      // 2. Small joys: the hot-air balloon, drifting over the garden.
      { kind: "balloon", at: [4.0, 0.9], z: 2.0, depth: 99, actor: "joy" },
      // 3. The letter, in the mailbox, a cat keeping it company.
      { kind: "mailbox", at: [6.5, 1.5], scale: 1.2, actor: "letter" },
      { kind: "cat", at: [7.0, 2.0], color: "#2b2b33" },
      // 4. Feedback: a red postbox, for writing back.
      { kind: "postbox", at: [6.3, 3.5], scale: 1.15, actor: "post" },
      // The garden's own things.
      { kind: "tree", at: [0.8, 3.4], size: 0.75 },
      { kind: "bush", at: [7.4, 0.5] },
      { kind: "flowers", at: [2.4, 3.3] },
      { kind: "lamp", at: [4.8, 4.0] },
      { kind: "fireflies", at: [1.2, 3.0], z: 0.6 }
    ],
    pins: [
      { n: 1, act: "way", icon: "🧭", at: [1.5, 1.2], z1: 2.3, stand: "a", label: { en: "Finding your way", ru: "Куда что ведёт", he: "איך מתמצאים" } },
      { n: 2, act: "joy", icon: "✨", at: [4.0, 0.9], z1: 3.9, stand: "b", label: { en: "Small joys", ru: "Радости", he: "שמחות קטנות" } },
      { n: 3, act: "letter", icon: "✉️", at: [6.5, 1.5], z1: 1.7, stand: "c", label: { en: "The letter", ru: "Письмо", he: "המכתב" } },
      { n: 4, act: "post", icon: "📨", at: [6.3, 3.5], z1: 1.7, stand: "d", label: { en: "Feedback", ru: "Обратная связь", he: "משוב" } }
    ],
    walk: {
      start: "gate",
      nodes: { gate: [4.0, 4.9], m: [4.0, 3.2], b: [4.0, 2.1], a: [2.3, 2.1], c: [5.8, 2.1], d: [5.5, 3.3] },
      edges: [["gate", "m"], ["m", "b"], ["b", "a"], ["b", "c"], ["m", "d"], ["d", "c"]]
    },
    backdrop: { kind: "none", stars: 30 }
  });
})();
