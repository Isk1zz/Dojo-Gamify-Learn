// ================================================
// Knell — scene recipe: the start screen
// ------------------------------------------------
// A garden at night with a bell tower. Data only: scenes/scene.js draws it.
//
// The Garden is Knell's central picture: every topic you pass becomes a
// plant, and its growth stage is its review interval (garden/garden.js).
// Here the five stages stand along one path, smallest at the gate and in
// bloom by the tower, so the start screen shows the idea before anyone
// has passed anything. Tapping one sends the runner there, and the start
// screen shows that stage's symbol from the Garden and what it means.
// The tower is the name: a knell is the toll of a bell, and the sixth
// pin rings it. A mailbox at the gate holds a letter (core/letter.js).
//
// Chosen 2026-11-22 ("bc": the garden and the bell tower together). It
// replaced the e-bike junction, which showed one course, not the app.
// The same day it gained people, a beach, a buffet, a café and a reading
// corner ("scene looks raw"), and was then laid out again in zones with
// the stages drawn larger ("they are way too little", "looks a little
// messy"). The stages are the heroes; everything else keeps to its zone.
//
// The stage names, symbols and day counts are the Garden's own (GROWTH
// in garden/garden.js: sprout from 1 day, seedling 7, growing 21, tree
// 30, blossom 60). If those change, the pins here change with them.
// ================================================
Dojo.Scenes.register("knell-garden", {
  title: { en: "A garden at night, with a bell tower", ru: "Ночной сад с колокольней", he: "גינה בלילה, עם מגדל פעמון" },
  seed: 11,
  spriteScale: 1.2,

  palette: {
    mist: "#8fa1bb",
    grass: "#27503a", topsoil: "#3a3324", soil: "#4a3828",
    path: "#7d776b", gravel: "#5f594f",
    rim: "#59606d", water: "#1c3a55",
    stone: "#6c717d", roof: "#36506a", bell: "#c99a3e",
    hedge: "#1f4a33",
    accent: "#f2c14e", light: "#ffe2a0", window: "#f5d77a",
    runner: "#7b6cff",
    haze: "#f2c14e", skyline: "#141a27",
    leaf: "#2f7a4c", trunk: "#5a3f2c", blossom: "#f4a8c6", grain: "#d8b45a",
    cloth: "#e9e4d8", cart: "#6b4a33", orange: "#f28c28",
    sand: "#cdb27a", blanket: "#b5483c"
  },

  // The same garden by day, for the app's day sky ("unrealistically dark
  // with sunny theme", 2026-11-22): sunlit colours over the night ones,
  // no stars, the lamps out, and no fireflies.
  day: {
    palette: {
      mist: "#f2f5f9",
      grass: "#5a9e4e", topsoil: "#7a5a3a", soil: "#8a6845",
      path: "#cfc6b0", gravel: "#a59c87",
      rim: "#aab0b8", water: "#4fa3d6",
      stone: "#a2a7b0", roof: "#5b7fa6", bell: "#d9ad4a",
      hedge: "#3f8a4a",
      leaf: "#4caa55", trunk: "#7a5a3a", blossom: "#f7b8d2", grain: "#e6c25a",
      sand: "#efdca5", blanket: "#d9534f", cloth: "#ffffff", cart: "#8a5a3a"
    },
    hide: ["fireflies"]
  },

  block: {
    w: 12, d: 12, top: 236, skin: 0.12,
    strata: [
      { t: 0.28, c: "#4a3a2a", grain: true },   // topsoil
      { t: 0.5, c: "#3a2e24" },                  // clay
      { t: 0.46, c: "#2a2420", grain: true }     // older ground
    ]
  },

  // Painted in order, later shapes over earlier ones. The path is one
  // rect per straight run, a unit wide, turning at each stage.
  surface: [
    { kind: "rect", x0: 0, y0: 0, x1: 12, y1: 12, fill: "grass", edge: "topsoil" },

    { kind: "rect", x0: 9.0, y0: 10.0, x1: 12, y1: 11.0, fill: "path", edge: "gravel" },
    { kind: "rect", x0: 9.0, y0: 7.0, x1: 10.0, y1: 11.0, fill: "path" },
    { kind: "rect", x0: 6.0, y0: 7.0, x1: 10.0, y1: 8.0, fill: "path" },
    { kind: "rect", x0: 6.0, y0: 4.0, x1: 7.0, y1: 8.0, fill: "path" },
    { kind: "rect", x0: 3.5, y0: 4.0, x1: 7.0, y1: 5.0, fill: "path" },
    { kind: "rect", x0: 3.5, y0: 1.3, x1: 4.5, y1: 5.0, fill: "path" },
    { kind: "rect", x0: 2.6, y0: 1.3, x1: 4.5, y1: 2.3, fill: "path" },

    // A pond with a stone rim, and between it and the tower a strip of
    // beach ("between bell and pool add sand") with a picnic blanket.
    { kind: "rect", x0: 1.0, y0: 7.4, x1: 4.6, y1: 10.8, fill: "rim" },
    { kind: "rect", x0: 1.2, y0: 7.6, x1: 4.4, y1: 10.6, fill: "water" },
    { kind: "rect", x0: 0.6, y0: 2.9, x1: 3.45, y1: 7.3, fill: "sand" },
    { kind: "rect", x0: 1.0, y0: 3.7, x1: 2.1, y1: 4.5, fill: "blanket" },

    // Light on the ground under the two lamps.
    { kind: "pool", at: [10.5, 8.5], r: 1.2 },
    { kind: "pool", at: [3.45, 3.15], r: 1.1 }
  ],

  objects: [
    // Light mist lying on the ground (2026-11-24, «оставь легкий туман по
    // земле»): over the pond, on the lawns, along the path. Each sits just
    // past its spot in depth, so what stands right behind it stands in it.
    { kind: "mist", at: [2.9, 9.3], w: 95, depth: 12.8 },
    { kind: "mist", at: [5.6, 7.4], w: 80, depth: 13.6, delay: -6 },
    { kind: "mist", at: [8.3, 9.9], w: 75, depth: 18.8, delay: -11 },
    { kind: "mist", at: [8.6, 5.6], w: 70, depth: 14.8, delay: -3 },
    { kind: "mist", at: [2.3, 5.6], w: 60, depth: 8.5, delay: -8 },
    // ---- The tower, piece by piece ----
    // Depths are set by hand so the bell hangs between its posts and
    // under its roof: body, back post, side posts, bell, roof. There is
    // no front post on purpose: in this view the front corner stands
    // exactly in front of the bell and would cut it in half.
    { kind: "box", x0: 1.0, y0: 1.0, x1: 2.6, y1: 2.6, h: 3.3, wall: "stone", windows: false, door: "x", depth: 3.5 },
    { kind: "box", x0: 1.0, y0: 1.0, x1: 1.28, y1: 1.28, z0: 3.3, h: 1.35, wall: "stone", windows: false, depth: 3.6 },
    { kind: "box", x0: 1.0, y0: 2.32, x1: 1.28, y1: 2.6, z0: 3.3, h: 1.35, wall: "stone", windows: false, depth: 3.7 },
    { kind: "box", x0: 2.32, y0: 1.0, x1: 2.6, y1: 1.28, z0: 3.3, h: 1.35, wall: "stone", windows: false, depth: 3.7 },
    { kind: "bell", at: [1.8, 1.8], z: 3.36, depth: 3.8 },
    { kind: "box", x0: 0.88, y0: 0.88, x1: 2.72, y1: 2.72, z0: 4.65, h: 0.22, wall: "stone", windows: false, roof: { h: 1.5 }, depth: 3.9 },

    // ---- The five stages, smallest at the gate, drawn larger than life ----
    { kind: "sprout", at: [10.6, 9.4], scale: 3.0 },
    { kind: "seedling", at: [8.3, 8.7], scale: 2.5 },
    { kind: "stalks", at: [7.7, 6.3], scale: 1.9 },
    { kind: "tree", at: [5.1, 5.9], size: 1.1 },
    { kind: "tree", at: [5.5, 2.9], size: 1.35, blossom: true },

    // ---- The frame: hedges, lamps, corner trees ----
    { kind: "box", x0: 3.3, y0: 0.15, x1: 11.8, y1: 0.6, h: 0.6, wall: "hedge", windows: false },
    { kind: "box", x0: 0.15, y0: 3.3, x1: 0.6, y1: 11.8, h: 0.6, wall: "hedge", windows: false },
    { kind: "lamp", at: [10.25, 8.75] },
    { kind: "lamp", at: [3.2, 3.4] },
    { kind: "tree", at: [11.1, 1.2], fruit: "orange" },
    { kind: "parrot", at: [11.35, 1.15], z: 1.45, color: "#2f6fd6", wing: "#f2c14e" },
    { kind: "tree", at: [1.0, 11.2], size: 0.9 },
    { kind: "parrot", at: [0.8, 11.3], z: 1.2, color: "#d93a2b", wing: "#3aa65b", delay: 1.7 },

    // ---- Zone: the buffet, back right ----
    // What stands on the table gets a depth just past the table's, so the
    // tabletop never covers it.
    { kind: "box", x0: 7.8, y0: 2.0, x1: 10.2, y1: 2.8, h: 0.75, wall: "cloth", windows: false },
    { kind: "plate", at: [8.2, 2.4], z: 0.75, depth: 11.45 },
    { kind: "fountain", at: [8.95, 2.4], z: 0.75, depth: 11.46 },
    { kind: "plate", at: [9.55, 2.4], z: 0.75, food: "#f4dce6", depth: 11.47 },
    { kind: "plate", at: [9.95, 2.4], z: 0.75, food: "#f2b13e", depth: 11.48 },
    { kind: "person", at: [8.4, 3.4], shirt: "#e86a5c", hold: "plate", hair: "#c98b4a" },
    { kind: "person", at: [9.9, 3.3], shirt: "#4a8a8c", hold: "plate", skin: "#a8775a" },

    // ---- Zone: the café, right ----
    { kind: "person", at: [10.9, 4.0], shirt: "#2b2f38", hair: "#1b1b1b" },
    { kind: "box", x0: 10.4, y0: 4.3, x1: 11.4, y1: 5.1, h: 0.85, wall: "cart", windows: false },
    { kind: "coffee", at: [10.9, 4.7], z: 0.85, depth: 15.65 },
    { kind: "cafe", at: [11.0, 6.7] },
    { kind: "person", at: [10.8, 6.9], sit: true, shirt: "#f2c14e", hold: "cup", depth: 17.71 },
    { kind: "person", at: [11.2, 6.5], sit: true, shirt: "#5bb3a8", hold: "cup", hair: "#c98b4a", depth: 17.72 },

    // ---- Zone: the reading corner, front ----
    // Three giant books stacked as a seat with a cat asleep on top, and
    // someone reading on the bench beside them.
    { kind: "box", x0: 6.3, y0: 9.5, x1: 7.9, y1: 10.7, h: 0.32, wall: "#8e3b2f", windows: false, book: true },
    { kind: "box", x0: 6.45, y0: 9.6, x1: 7.75, y1: 10.55, z0: 0.32, h: 0.28, wall: "#2f5b8e", windows: false, book: true },
    { kind: "box", x0: 6.6, y0: 9.7, x1: 7.6, y1: 10.45, z0: 0.6, h: 0.26, wall: "#3f7a4a", windows: false, book: true },
    { kind: "cat", at: [7.1, 10.08], z: 0.86, depth: 17.25 },
    { kind: "bench", at: [5.2, 9.3] },
    { kind: "person", at: [5.2, 9.3], sit: true, shirt: "#5b8def", hold: "book", hair: "#7a4a2c", depth: 14.51 },

    // ---- Zone: the beach and the pond, left ----
    { kind: "person", at: [1.35, 4.05], sit: "ground", shirt: "#f2c14e", hair: "#7a4a2c" },
    { kind: "person", at: [1.85, 4.2], sit: "ground", shirt: "#9d8cff", skin: "#a8775a" },
    { kind: "plate", at: [1.6, 4.4], food: "#f28c28" },
    { kind: "parasol", at: [2.7, 4.5] },
    { kind: "sandcastle", at: [2.2, 6.4] },
    { kind: "cat", at: [4.45, 7.55], color: "#e8a65a" },
    { kind: "fireflies", at: [2.8, 9.1], z: 0.5 },

    // ---- The gate: a mailbox with a letter in it (the last pin) ----
    { kind: "mailbox", at: [11.5, 11.4] }
  ],

  // Someone walking a dog along the front of the garden, over and over.
  movers: [
    { kind: "walker", from: 0.6, to: 8.8, y: 11.55, speed: 0.55 }
  ],

  // Short labels, the Garden's own stage names and symbols. `icon`, the
  // label and `say` make the note the start screen pins to a tapped pin.
  pins: [
    { n: 1, at: [10.6, 9.4], z1: 2.0, stand: "s1", icon: "\u{1F331}", label: { en: "Sprout", ru: "Росток", he: "נבט" },
      say: { en: "A topic you have just passed. Its first review is tomorrow.",
             ru: "Тема, которую вы только что сдали. Первое повторение — завтра.", he: "נושא שעברתם זה עתה. החזרה הראשונה שלו מחר." } },
    { n: 2, at: [8.3, 8.7], z1: 2.5, stand: "s2", icon: "\u{1F33F}", label: { en: "Seedling", ru: "Саженец", he: "שתיל" },
      say: { en: "Still remembered after a week. Each review you get right moves the next one further away.",
             ru: "Помнится уже неделю. Каждое верное повторение отодвигает следующее дальше.", he: "עדיין זכור אחרי שבוע. כל חזרה שמצליחים בה מרחיקה את הבאה." } },
    { n: 3, at: [7.7, 6.3], z1: 3.0, stand: "s3", icon: "\u{1F33E}", label: { en: "Growing", ru: "Рост", he: "צומח" },
      say: { en: "Three weeks and still there. Its reviews are weeks apart now.",
             ru: "Три недели — и всё ещё помнится. Между повторениями теперь недели.", he: "שלושה שבועות והוא עדיין שם. בין החזרות שלו יש עכשיו שבועות." } },
    { n: 4, at: [5.1, 5.9], z1: 3.3, stand: "s4", icon: "\u{1F333}", label: { en: "Tree", ru: "Дерево", he: "עץ" },
      say: { en: "Remembered for a month. A topic this sturdy comes up rarely.",
             ru: "Помнится месяц. Такую крепкую тему повторяют редко.", he: "זכור כבר חודש. נושא יציב כזה עולה לחזרה רק לעיתים רחוקות." } },
    { n: 5, at: [5.5, 2.9], z1: 3.9, stand: "s5", icon: "\u{1F338}", label: { en: "Blossom", ru: "Цветение", he: "פריחה" },
      say: { en: "Two months and longer. Even a plant in bloom shrinks if its review is left more than a week overdue.",
             ru: "Два месяца и дольше. Но и цветущее растение уменьшается, если повторение просрочено больше чем на неделю.", he: "חודשיים ויותר. גם צמח בפריחה מתכווץ אם החזרה שלו מתעכבת יותר משבוע." } },
    { n: 6, at: [1.8, 1.8], z0: 6.37, z1: 6.85, stand: "door", act: "bell", icon: "\u{1F514}", label: { en: "The bell", ru: "Колокол", he: "הפעמון" },
      say: { en: "A knell is the toll of a bell.", ru: "Knell — по-английски «звон колокола».", he: "Knell באנגלית הוא צלצול של פעמון." } },
    // Not a stage: a letter for whoever opens this, now or years from now
    // (asked 2026-11-22). The start screen opens it when he gets there.
    { n: "✉", at: [11.5, 11.4], z1: 1.6, stand: "gate", act: "letter", label: { en: "A letter", ru: "Письмо", he: "מכתב" } }
  ],

  // The path's centre line: the gate, a node at every turn, the door.
  walk: {
    nodes: {
      gate: [11.7, 10.5],
      s1: [9.5, 10.5], s2: [9.5, 7.5], s3: [6.5, 7.5], s4: [6.5, 4.5], s5: [4.0, 4.5],
      turn: [4.0, 1.8], door: [2.95, 1.8]
    },
    edges: [
      ["gate", "s1"], ["s1", "s2"], ["s2", "s3"], ["s3", "s4"], ["s4", "s5"],
      ["s5", "turn"], ["turn", "door"]
    ],
    start: "gate"
  },

  backdrop: { kind: "none", stars: 54 }
});
