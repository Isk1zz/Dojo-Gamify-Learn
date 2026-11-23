// ================================================
// Knell — scene recipe: Philosophy · Rome: Cicero
// ------------------------------------------------
// The Roman Forum at night. Data only: scenes/scene.js draws it.
//
// The course is one unit with three topics, and each pin stands where its
// topic happened (asked for 2026-11-22: "add a scene for philosophy like
// for all other courses"):
//
//   1. The Man Killed for Words, at the Rostra: the speakers' platform
//      where Cicero spoke, and where his head and hands were nailed up
//      after he was killed (the topic's first chunk, "The Hands").
//   2. What He Left, at a table of scrolls before the archive: his
//      speeches, his books and his letters.
//   3. What He Argued, at the Curia, the Senate house: the republic he
//      wanted, duty, and how to face death.
//
// Units are world units on a 12 x 12 block. The fronts of the buildings
// face the viewer, because only the two near faces of a box are drawn:
// the Curia stands along the back right edge with its door on its front,
// the temple along the back left with its columns and pediment toward the
// forum.
// ================================================
(() => {
  // Joints between the paving slabs: a line every 1.5 units across the
  // paved part, faint. Generated rather than written out.
  const joints = [];
  for (let v = 1.5; v < 11.7; v += 1.5) {
    joints.push({ kind: "line", from: [v, 0.3], to: [v, v < 3.8 ? 9.2 : 11.7], stroke: "joint", width: 1, opacity: 0.35 });
    joints.push({ kind: "line", from: [0.3, v], to: [11.7, v], stroke: "joint", width: 1, opacity: 0.35 });
  }

  Dojo.Scenes.register("philosophy", {
    title: { en: "The Roman Forum at night", ru: "Римский форум ночью" },
    seed: 23,
    spriteScale: 1.2,

    palette: {
      grass: "#2f4a34", topsoil: "#3a3324", soil: "#4a3828",
      paving: "#8a8172", joint: "#5e574c", pavingEdge: "#6e655a",
      via: "#4a4a50", viaEdge: "#38383d",
      marble: "#d8d2c4", brick: "#8a4f3a", tuff: "#8a8070",
      roof: "#7a3e2a", bronze: "#a07a3a", parchment: "#e9dcb8",
      toga: "#ece6d6", cypress: "#1f3d2c", fire: "#ffb347",
      accent: "#f2c14e", light: "#ffcf7a", window: "#f5d77a",
      runner: "#7b6cff", haze: "#f2c14e", skyline: "#141a27",
      leaf: "#2f5e3c", trunk: "#4a3526"
    },

    // By day: warm stone in the sun, the braziers out.
    day: {
      palette: {
        grass: "#5a9e4e", topsoil: "#7a5a3a",
        paving: "#d9cfbb", joint: "#b3a893", pavingEdge: "#a89d88",
        via: "#7a7a80", viaEdge: "#66666b",
        marble: "#f2eee6", brick: "#b5664a", tuff: "#c2b6a0",
        roof: "#b5583a", toga: "#f7f3ea", cypress: "#2f6b45", leaf: "#4c8a4f"
      }
    },

    block: {
      w: 12, d: 12, top: 230, skin: 0.12,
      // Under the forum: its foundations, Roman concrete over older ground.
      strata: [
        { t: 0.25, c: "#6e655a", grain: true },
        { t: 0.45, c: "#5a4a3a" },
        { t: 0.5, c: "#3a3028", grain: true }
      ]
    },

    surface: [
      { kind: "rect", x0: 0, y0: 0, x1: 12, y1: 12, fill: "grass", edge: "topsoil" },
      // The paved forum, an L that leaves a garden of cypresses in the
      // front left corner.
      { kind: "rect", x0: 0.3, y0: 0.3, x1: 11.7, y1: 9.2, fill: "paving", edge: "pavingEdge" },
      { kind: "rect", x0: 3.8, y0: 9.2, x1: 11.7, y1: 11.7, fill: "paving", edge: "pavingEdge" },
      ...joints,
      // The Via Sacra, the sacred way, running in from the front and
      // turning off to the right.
      { kind: "rect", x0: 4.9, y0: 4.8, x1: 6.3, y1: 12, fill: "via", edge: "viaEdge" },
      { kind: "rect", x0: 6.3, y0: 8.6, x1: 12, y1: 9.8, fill: "via", edge: "viaEdge" },
      // Firelight under the braziers.
      { kind: "pool", at: [4.45, 4.75], r: 0.9 },
      { kind: "pool", at: [7.05, 4.75], r: 0.9 },
      { kind: "pool", at: [2.45, 2.85], r: 0.8 },
      { kind: "pool", at: [3.85, 2.85], r: 0.8 }
    ],

    objects: [
      // ---- The Curia, the Senate house, back right, its door toward the forum ----
      { kind: "box", x0: 1.4, y0: 0.6, x1: 4.4, y1: 2.6, h: 3.4, wall: "brick", windows: false, door: "y",
        roof: { h: 1.3, gable: "x", end: "brick" } },
      { kind: "brazier", at: [2.2, 3.0] },
      { kind: "brazier", at: [3.6, 3.0] },

      // ---- The archive, and a table of scrolls before it ----
      { kind: "box", x0: 6.2, y0: 0.5, x1: 8.8, y1: 2.2, h: 2.2, wall: "tuff", windows: false, door: "y",
        roof: { h: 0.8, gable: "x", end: "tuff" } },
      { kind: "box", x0: 6.7, y0: 2.8, x1: 7.9, y1: 3.6, h: 0.75, wall: "trunk", windows: false },
      { kind: "scrolls", at: [7.3, 3.2], z: 0.75, depth: 10.6 },
      { kind: "person", at: [8.3, 3.6], toga: true, hair: "#8a8a8a" },

      // ---- The Rostra, the speakers' platform, with an orator on it ----
      { kind: "box", x0: 4.6, y0: 3.6, x1: 6.6, y1: 4.6, h: 0.9, wall: "marble", windows: false },
      { kind: "person", at: [5.6, 4.1], z: 0.9, toga: true, arm: "up", hair: "#5a5a5a", depth: 9.8 },
      { kind: "brazier", at: [4.3, 4.9] },
      { kind: "brazier", at: [6.9, 4.9] },
      // His audience, below.
      { kind: "person", at: [4.7, 6.0], toga: true, hair: "#3a2a22" },
      { kind: "person", at: [6.6, 6.0], toga: true, hair: "#1b1b1b", skin: "#c99a7a" },
      { kind: "person", at: [7.4, 6.6], toga: true, shirt: "#b5483c" },

      // ---- A temple, back left, its columns and pediment toward the forum ----
      // Depths by hand: podium, cella, columns, then the beam and roof over
      // the columns, which by footprint would sort before them.
      { kind: "box", x0: 0.6, y0: 5.4, x1: 4.2, y1: 7.8, h: 0.8, wall: "tuff", windows: false, depth: 8.0 },
      { kind: "box", x0: 0.8, y0: 5.6, x1: 3.3, y1: 7.6, z0: 0.8, h: 2.4, wall: "marble", windows: false, depth: 8.6 },
      { kind: "column", at: [3.9, 5.7], z: 0.8, h: 72 },
      { kind: "column", at: [3.9, 6.3], z: 0.8, h: 72 },
      { kind: "column", at: [3.9, 6.9], z: 0.8, h: 72 },
      { kind: "column", at: [3.9, 7.5], z: 0.8, h: 72 },
      { kind: "box", x0: 0.8, y0: 5.5, x1: 4.15, y1: 7.7, z0: 3.2, h: 0.3, wall: "marble", windows: false,
        roof: { h: 1.0, gable: "x", end: "marble" }, depth: 12 },

      // ---- A statue, cypresses, and the garden corner ----
      { kind: "statue", at: [1.6, 4.2] },
      { kind: "cypress", at: [10.6, 1.2] },
      { kind: "cypress", at: [11.2, 2.6], size: 0.9 },
      { kind: "cypress", at: [0.8, 9.9] },
      { kind: "cypress", at: [1.9, 10.9], size: 0.85 },
      { kind: "cypress", at: [0.9, 11.3], size: 0.75 },
      { kind: "person", at: [8.4, 10.6], toga: true, shirt: "#9d8cff" }
    ],

    // The topics' own titles. Each stands at its place in the forum.
    pins: [
      { n: 1, at: [5.6, 4.1], z0: 0.9, z1: 3.1, stand: "r", topic: "cicero-man",
        label: { en: "The Man Killed for Words", ru: "Человек, которого убили за слова" } },
      { n: 2, at: [7.3, 3.2], z0: 0.75, z1: 2.4, stand: "t", topic: "cicero-work",
        label: { en: "What He Left", ru: "Что он оставил" } },
      { n: 3, at: [2.9, 1.6], z0: 4.7, z1: 5.3, stand: "c", topic: "cicero-thought",
        label: { en: "What He Argued", ru: "Что он думал" } }
    ],

    // In along the Via Sacra, then round the Rostra to the Curia or to the
    // scrolls.
    walk: {
      nodes: {
        gate: [5.6, 11.6], via: [5.6, 8.0], r: [5.6, 5.5],
        w: [3.9, 5.0], c: [2.9, 3.3], e: [7.3, 5.2], t: [7.3, 4.2]
      },
      edges: [["gate", "via"], ["via", "r"], ["r", "w"], ["w", "c"], ["r", "e"], ["e", "t"]],
      start: "r"
    },

    backdrop: { kind: "none", stars: 50 }
  });
})();
