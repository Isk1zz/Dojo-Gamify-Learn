// ================================================
// Knell — scene recipe: A3 Theory · Electric Bicycle
// ------------------------------------------------
// A junction at night. Data only: scenes/scene.js draws it.
//
// The pins are the course's seven topics, each standing where that
// topic happens. That is the Atlas's central move: a place in the scene
// and a piece of the course are the same thing, so the picture is a map
// of what there is to learn instead of a decoration behind it.
//
// Units are world units on a 12 x 12 block, roughly 2.3 m each: the
// road is 3 wide, about two 3.5 m lanes. Objects are drawn a little
// larger than life, the way a diorama is, so that a sign can be read.
// ================================================
Dojo.Scenes.register("bike-a3", {
  title: { en: "A junction at night", ru: "Перекрёсток ночью" },
  seed: 31,
  spriteScale: 1.2,

  palette: {
    grass: "#30603f", topsoil: "#3a3324",
    sidewalk: "#626874", concrete: "#7d838d", curb: "#959ba5",
    road: "#2a2e36", asphalt: "#23262c", marking: "#ebe8de",
    bikePath: "#8c4a3b",
    accent: "#f2c14e", light: "#ffe2a0", window: "#f5d77a",
    runner: "#7b6cff",   // the learner, in Knell's own purple, not the course's yellow
    haze: "#f2c14e", skyline: "#141a27",
    wall: "#3b4356", wall2: "#323a4c",
    leaf: "#2d6744", trunk: "#4b3527"
  },

  block: {
    w: 12, d: 12, top: 196, skin: 0.14,
    // Under the surface: the road's own layers, the way a cut through a
    // street actually looks.
    strata: [
      { t: 0.30, c: "#5f5547", grain: true },   // base course, gravel
      { t: 0.62, c: "#46372a" },                // subgrade
      { t: 0.54, c: "#2c2620", grain: true }    // older ground
    ]
  },

  // Painted in order, later shapes over earlier ones.
  surface: [
    { kind: "rect", x0: 0, y0: 0, x1: 12, y1: 12, fill: "grass", edge: "topsoil" },

    // Sidewalks. The front one is wider because it carries the bike path.
    { kind: "rect", x0: 0, y0: 3.0, x1: 12, y1: 4.5, fill: "sidewalk", edge: "concrete" },
    { kind: "rect", x0: 0, y0: 7.5, x1: 12, y1: 9.6, fill: "sidewalk", edge: "concrete" },
    { kind: "rect", x0: 3.0, y0: 0, x1: 4.5, y1: 12, fill: "sidewalk", edge: "concrete" },
    { kind: "rect", x0: 7.5, y0: 0, x1: 9.0, y1: 12, fill: "sidewalk", edge: "concrete" },

    { kind: "rect", x0: 0, y0: 8.7, x1: 4.5, y1: 9.4, fill: "bikePath" },
    { kind: "rect", x0: 7.5, y0: 8.7, x1: 12, y1: 9.4, fill: "bikePath" },

    { kind: "rect", x0: 0, y0: 4.5, x1: 12, y1: 7.5, fill: "road", edge: "asphalt" },
    { kind: "rect", x0: 4.5, y0: 0, x1: 7.5, y1: 12, fill: "road", edge: "asphalt" },

    // Curbs, broken where the other road crosses.
    { kind: "line", from: [0, 4.5], to: [4.5, 4.5], stroke: "curb", width: 1.6 },
    { kind: "line", from: [7.5, 4.5], to: [12, 4.5], stroke: "curb", width: 1.6 },
    { kind: "line", from: [0, 7.5], to: [4.5, 7.5], stroke: "curb", width: 1.6 },
    { kind: "line", from: [7.5, 7.5], to: [12, 7.5], stroke: "curb", width: 1.6 },
    { kind: "line", from: [4.5, 0], to: [4.5, 4.5], stroke: "curb", width: 1.6 },
    { kind: "line", from: [4.5, 7.5], to: [4.5, 12], stroke: "curb", width: 1.6 },
    { kind: "line", from: [7.5, 0], to: [7.5, 4.5], stroke: "curb", width: 1.6 },
    { kind: "line", from: [7.5, 7.5], to: [7.5, 12], stroke: "curb", width: 1.6 },

    // Centre lines, stopping short of the crossings.
    { kind: "line", from: [0.15, 6], to: [2.95, 6], stroke: "marking", width: 1.6, opacity: 0.85, dash: [0.45, 0.35] },
    { kind: "line", from: [9.05, 6], to: [11.85, 6], stroke: "marking", width: 1.6, opacity: 0.85, dash: [0.45, 0.35] },
    { kind: "line", from: [6, 0.15], to: [6, 2.95], stroke: "marking", width: 1.6, opacity: 0.85, dash: [0.45, 0.35] },
    { kind: "line", from: [6, 9.65], to: [6, 11.85], stroke: "marking", width: 1.6, opacity: 0.85, dash: [0.45, 0.35] },

    // Zebra crossings on all four arms.
    { kind: "zebra", axis: "x", along: [3.15, 4.15], across: [4.5, 7.5], stripe: 0.3, gap: 0.24 },
    { kind: "zebra", axis: "x", along: [7.85, 8.85], across: [4.5, 7.5], stripe: 0.3, gap: 0.24 },
    { kind: "zebra", axis: "y", along: [3.15, 4.15], across: [4.5, 7.5], stripe: 0.3, gap: 0.24 },
    { kind: "zebra", axis: "y", along: [7.65, 8.5], across: [4.5, 7.5], stripe: 0.3, gap: 0.24 },

    // The bike path crosses the road beside the zebra, not on it.
    { kind: "rect", x0: 4.5, y0: 8.7, x1: 7.5, y1: 9.4, fill: "bikePath", opacity: 0.55 },
    { kind: "line", from: [4.5, 8.7], to: [7.5, 8.7], stroke: "marking", width: 1.3, dash: [0.22, 0.18] },
    { kind: "line", from: [4.5, 9.4], to: [7.5, 9.4], stroke: "marking", width: 1.3, dash: [0.22, 0.18] },

    // Light on the ground under the two street lamps.
    { kind: "pool", at: [9.15, 3.0], r: 1.25 },
    { kind: "pool", at: [3.15, 7.5], r: 1.25 }
  ],

  objects: [
    // The building whose pin is the law: the one with the flag.
    { kind: "box", x0: 0.4, y0: 0.4, x1: 2.8, y1: 2.6, h: 2.6, wall: "wall", flag: true },
    { kind: "box", x0: 9.3, y0: 0.4, x1: 11.6, y1: 2.7, h: 3.4, wall: "wall2", unit: [10.0, 1.0, 10.8, 1.6] },

    // Off the x = y diagonal on purpose. Every point with x = y projects
    // to the same screen column, and the junction's pin already stands
    // there: on the diagonal, both lights and the pin stacked into one
    // vertical smear.
    { kind: "trafficLight", at: [3.4, 4.3], phase: 0 },
    { kind: "trafficLight", at: [8.6, 7.7], phase: 5 },
    { kind: "lamp", at: [8.9, 3.25] },
    { kind: "lamp", at: [2.9, 7.75] },

    // Signs the course actually teaches. "No bicycles" stands on the
    // sidewalk, which is the point: an e-bike does not belong there.
    { kind: "sign", at: [2.55, 4.1], face: "giveWay" },
    { kind: "sign", at: [4.05, 1.4], face: "noBikes" },
    { kind: "sign", at: [9.25, 4.15], face: "crossing" },
    { kind: "sign", at: [0.85, 9.55], face: "bike" },

    { kind: "tree", at: [0.9, 11.0] },
    { kind: "bush", at: [2.2, 11.3] },
    { kind: "tree", at: [10.4, 10.5] },
    { kind: "tree", at: [11.3, 11.4], size: 0.8 },
    { kind: "bush", at: [9.7, 11.5] }
  ],

  // A rider on the bike path, lights on, helmet on.
  movers: [
    { kind: "rider", from: 0.3, to: 11.7, y: 9.05, speed: 0.9 }
  ],

  // `stand` is the walk node the runner goes to for that chapter. It is
  // not always the pin's own spot: the junction's pin is in the middle of
  // the road, and in this course nobody stands in the middle of the road.
  pins: [
    { n: 1, at: [1.6, 1.5], z0: 2.6, z1: 3.75, stand: "law", topic: "bike-law", label: { en: "Law & status", ru: "Закон и статус" } },
    { n: 2, at: [1.7, 9.05], z1: 2.3, stand: "who", topic: "bike-rider", label: { en: "Who may ride", ru: "Кто может ездить" } },
    { n: 3, at: [6.0, 9.05], z1: 2.0, stand: "where", topic: "bike-where", label: { en: "Where to ride", ru: "Где ездить" } },
    { n: 4, at: [6.0, 6.0], z1: 3.0, stand: "junction", topic: "bike-traffic", label: { en: "Junctions", ru: "Перекрёстки" } },
    { n: 5, at: [10.6, 5.25], z1: 2.4, stand: "speed", topic: "bike-control", label: { en: "Speed & brakes", ru: "Скорость и тормоза" } },
    { n: 6, at: [9.15, 3.0], z1: 3.2, stand: "lights", topic: "bike-hazards", label: { en: "Lights & gear", ru: "Свет и экипировка" } },
    { n: 7, at: [2.4, 3.7], z1: 3.0, stand: "signs", topic: "bike-signs", label: { en: "Your signs", ru: "Ваши знаки" } }
  ],

  // Where the runner may go: the centre lines of the sidewalks, and the
  // four zebras joining the corners of the junction. Every road crossing
  // in this graph is on a zebra, so every route he takes is one a
  // pedestrian may legally take.
  walk: {
    nodes: {
      nw: [3.75, 3.75], ne: [8.25, 3.75], sw: [3.75, 8.1], se: [8.25, 8.1],
      law: [1.6, 3.75], signs: [2.4, 3.75], junction: [4.3, 4.3],
      lights: [9.3, 3.75], speed: [10.6, 3.75],
      who: [1.7, 8.1], where: [4.2, 8.1]
    },
    edges: [
      ["law", "signs"], ["signs", "nw"], ["nw", "junction"],
      ["nw", "ne"],                       // north zebra
      ["nw", "sw"],                       // west zebra
      ["ne", "se"],                       // east zebra
      ["sw", "where"], ["where", "se"],   // south zebra
      ["ne", "lights"], ["lights", "speed"],
      ["sw", "who"]
    ],
    start: "law"
  },

  backdrop: { kind: "skyline" }
});
