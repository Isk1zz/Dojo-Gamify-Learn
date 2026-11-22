// ================================================
// Knell — scene recipe: Intro to Computer Science
// ------------------------------------------------
// A computer lab at night, as a cut-away room. Data only: scenes/scene.js
// draws it.
//
// Intro to CS has 8 units and 48 topics. Forty-eight pins do not fit on
// one picture, so here a pin is a UNIT (`unit`, not `topic`), placed on
// the thing in the room that unit is about: number systems on the
// whiteboard, the operating system on the wall screen, networks on the
// server rack. Arriving opens that unit's topic map (library.js).
//
// Units on the 12 x 12 floor, roughly 0.4 m each — a lab, not a hall.
// ================================================
(() => {
  // Floor tiles: one seam a unit each way. Generated rather than listed;
  // it is still only shapes for the engine to paint.
  const seams = [];
  for (let i = 1; i < 12; i++) {
    seams.push({ kind: "line", from: [i, 0], to: [i, 12], stroke: "floorLine", width: 1, opacity: 0.7 });
    seams.push({ kind: "line", from: [0, i], to: [12, i], stroke: "floorLine", width: 1, opacity: 0.7 });
  }

  Dojo.Scenes.register("intro-cs", {
    title: { en: "A computer lab at night", ru: "Компьютерный класс ночью" },
    seed: 7,
    spriteScale: 1.2,

    palette: {
      floor: "#2b3346", floorEdge: "#3a4357", floorLine: "#343d53", rug: "#33476b",
      wall: "#3b4663", cap: "#5a6789", rack: "#1c2130", desk: "#5a4637",
      accent: "#5ec2ff", runner: "#7b6cff", light: "#bfe7ff", window: "#9fd3ff",
      leaf: "#2f7a52", trunk: "#6b4a35", haze: "#5ec2ff", skyline: "#141a27"
    },

    // A raised floor: thin tiles over a dark cable void over concrete.
    block: {
      w: 12, d: 12, top: 250, skin: 0.1,
      strata: [
        { t: 0.2, c: "#171b26" },
        { t: 0.32, c: "#4a4f5c", grain: true }
      ]
    },

    walls: {
      height: 3.6, thickness: 0.22, color: "wall", cap: "cap",
      art: [
        // Back wall, left to right: the whiteboard, then the wall screen.
        { wall: "back", from: 1.0, to: 4.6, z0: 0.95, z1: 3.15, art: "whiteboard",
          lines: ["1011₂ = 11", "0xFF = 255", "'A' = 65"] },
        { wall: "back", from: 4.9, to: 7.9, z0: 1.3, z1: 3.1, art: "screen",
          lines: ["$ ps", "  PID CMD", "    1 init"] },
        // Left wall, back to front: the processor, the network, a window.
        { wall: "left", from: 1.2, to: 3.9, z0: 0.8, z1: 3.3, art: "poster",
          title: "VON NEUMANN", diagram: "cpu", bg: "#1e2a44" },
        { wall: "left", from: 4.6, to: 7.2, z0: 1.1, z1: 3.2, art: "poster",
          title: "NEURAL NET", diagram: "net", bg: "#251e3e" },
        { wall: "left", from: 8.4, to: 10.8, z0: 1.4, z1: 3.0, art: "window" }
      ]
    },

    surface: [
      { kind: "rect", x0: 0, y0: 0, x1: 12, y1: 12, fill: "floor", edge: "floorEdge" },
      ...seams,
      // A walkway round the middle of the room: the runner's path.
      { kind: "rect", x0: 3.2, y0: 3.0, x1: 9.2, y1: 3.8, fill: "rug" },
      { kind: "rect", x0: 8.4, y0: 3.0, x1: 9.2, y1: 8.0, fill: "rug" },
      { kind: "rect", x0: 3.2, y0: 7.2, x1: 9.2, y1: 8.0, fill: "rug" },
      { kind: "rect", x0: 3.2, y0: 3.0, x1: 4.0, y1: 8.0, fill: "rug" }
    ],

    objects: [
      { kind: "box", x0: 10.0, y0: 0.3, x1: 11.6, y1: 2.1, h: 3.2, wall: "rack", windows: false, leds: true },
      { kind: "box", x0: 1.2, y0: 9.0, x1: 4.0, y1: 10.3, h: 0.85, wall: "desk", windows: false },
      { kind: "monitor", at: [2.6, 9.65], z: 0.85 },
      { kind: "chair", at: [4.6, 9.7] },
      { kind: "box", x0: 5.5, y0: 4.9, x1: 6.9, y1: 6.3, h: 0.75, wall: "desk", windows: false },
      { kind: "logicSign", at: [6.2, 5.6], z: 0.75 },
      { kind: "database", at: [10.9, 5.6] },
      { kind: "robot", at: [1.4, 5.9] },
      { kind: "plant", at: [0.75, 0.75] },
      { kind: "plant", at: [11.2, 11.1] }
    ],

    pins: [
      { n: 1, unit: 1, at: [0.6, 3.1], z1: 4.6, stand: "f", label: { en: "Fundamentals", ru: "Основы" } },
      { n: 2, unit: 2, at: [1.8, 0.6], z1: 4.8, stand: "n", label: { en: "Number systems", ru: "Системы счисления" } },
      { n: 3, unit: 3, at: [6.2, 5.6], z0: 0.75, z1: 2.0, stand: "l", label: { en: "Logic gates", ru: "Логика" } },
      { n: 4, unit: 4, at: [6.8, 0.6], z1: 5.4, stand: "o", label: { en: "Operating systems", ru: "Операционные системы" } },
      { n: 5, unit: 5, at: [10.9, 5.6], z1: 1.8, stand: "d", label: { en: "Databases", ru: "Базы данных" } },
      { n: 6, unit: 6, at: [10.8, 1.2], z0: 3.2, z1: 6.1, stand: "r", label: { en: "Networks & security", ru: "Сети и безопасность" } },
      { n: 7, unit: 7, at: [2.6, 9.65], z0: 0.85, z1: 2.1, stand: "p", label: { en: "Programming", ru: "Программирование" } },
      { n: 8, unit: 8, at: [1.4, 5.9], z1: 5.5, stand: "e", label: { en: "Emerging tech", ru: "Новые технологии" } }
    ],

    // The walkway's four corners and a stop beside each thing in the room.
    walk: {
      nodes: {
        A: [3.6, 3.4], B: [8.8, 3.4], C: [8.8, 7.6], D: [3.6, 7.6],
        f: [1.2, 2.8], n: [2.8, 1.3], o: [6.4, 1.3], r: [9.5, 2.6],
        d: [9.8, 6.3], l: [6.2, 7.6], p: [3.0, 8.4], e: [2.4, 6.2]
      },
      edges: [
        ["A", "B"], ["B", "C"], ["C", "l"], ["l", "D"], ["D", "A"],
        ["f", "A"], ["n", "A"], ["o", "B"], ["r", "B"],
        ["d", "C"], ["p", "D"], ["e", "D"], ["e", "A"]
      ]
    },

    backdrop: { kind: "none", stars: 40 }
  });
})();
