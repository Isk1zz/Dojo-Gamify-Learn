// ================================================
// Course: Intro to CS
// ------------------------------------------------
// Manifest only. The teaching content is in the data_m*.js files
// alongside this one; this file just says how they group up.
//
// Unit ids are global across all courses — see content/registry.js.
// Ids 6, 7 and 8 are historical (they were literally units 6-8 of a
// module) and are kept because saved progress is keyed on them.
// Units 2 and 5 were written later but numbered to match the real
// course, so the ids are not in build order and that is deliberate.
//
// ---- Why this file guards its module references ----
// A course file names MODULE_N constants directly, so a module whose
// <script> tag is missing — or ordered AFTER this file — used to be a
// bare ReferenceError. That aborts THIS script, so Content.course()
// never runs, so NO course registers, so the entire Library renders
// empty. The symptom ("the library won't load") points nowhere near
// the cause, and it has now cost two round trips.
//
// So each module is read through `mod()`, which returns null instead of
// throwing and prints the exact <script> tag to add. A missing module
// now drops its own unit and nothing else.
//
// ---- Why the units are a factory (2026-08-24) ----
// This course is ~700KB, and it used to be parsed on every boot whether
// or not anyone opened it — nobody owns it by default, it costs 700
// Tokens. Its data_m*.js files now have NO <script> tag in index.html;
// registry.js injects them when the course is opened.
//
// That is why `units` became `unitsFactory`. A value would be computed
// at registration, when MODULE_1..10 do not exist yet and every unit
// would drop itself through mod(). A function is read later, after the
// files have run, which is the whole point.
//
// `unitOutline` carries the topic counts so the course card can say
// "8 units · 48 topics" before any of that content is in memory.
// check-content.js verifies those numbers against the real modules, so
// they cannot quietly drift.
// ================================================

(() => {
  // Read inside the factory, not at file scope: at file scope these run
  // before the data files are injected and every one would be null.
  //
  // These MUST be direct identifier reads. A data file declares
  // `const MODULE_1`, and a top-level const creates a global LEXICAL
  // binding — it is not a property of globalThis. A lookup like
  // globalThis["MODULE_" + n] therefore returns undefined even when the
  // module loaded perfectly, which drops every unit and leaves the
  // course empty with no error worth reading. typeof remains the only
  // safe way to ask about a name that may not be declared.
  const M = n => {
    switch (n) {
      case 1:  return typeof MODULE_1  === "undefined" ? null : MODULE_1;
      case 2:  return typeof MODULE_2  === "undefined" ? null : MODULE_2;
      case 3:  return typeof MODULE_3  === "undefined" ? null : MODULE_3;
      case 4:  return typeof MODULE_4  === "undefined" ? null : MODULE_4;
      case 5:  return typeof MODULE_5  === "undefined" ? null : MODULE_5;
      case 6:  return typeof MODULE_6  === "undefined" ? null : MODULE_6;
      case 7:  return typeof MODULE_7  === "undefined" ? null : MODULE_7;
      case 8:  return typeof MODULE_8  === "undefined" ? null : MODULE_8;
      case 9:  return typeof MODULE_9  === "undefined" ? null : MODULE_9;
      case 10: return typeof MODULE_10 === "undefined" ? null : MODULE_10;
      default: return null;
    }
  };

  // Loud, not silent — the same rule registry.js applies to id collisions.
  function mod(n, m) {
    if (m) return [m];
    console.error(
      `[intro-cs] MODULE_${n} never loaded, so its unit is missing from the Library.\n` +
      `  Add this to index.html BEFORE library/content/intro-cs/course.js:\n` +
      `    <script src="library/content/intro-cs/data_m${n}.js"></script>`
    );
    return [];
  }

  const buildUnits = () => [
    {
      // Same reason units 2-4 sort where they do — numbered to match
      // the real course, built after 5-8.
      id: 1,
      title: "Unit 1",
      subtitle: "Computer Fundamentals",
      icon: "\u{1F9EE}",
      modules: mod(10, M(10))
    },
    {
      // Added after 5-8 were already built, numbered 2 to match the real
      // course. Listed first for the same reason unit 5 is: the map
      // should read in course order, not build order.
      id: 2,
      title: "Unit 2",
      subtitle: "Number Systems & Data Representation",
      icon: "\u{1F522}",
      modules: mod(7, M(7))
    },
    {
      // Same reason unit 2 sorts where it does \u2014 numbered to match the
      // real course, built after 5-8.
      id: 3,
      title: "Unit 3",
      subtitle: "Boolean Algebra & Logic Gates",
      icon: "\u{1F500}",
      modules: mod(8, M(8))
    },
    {
      // Same reason units 2-3 sort where they do — numbered to match
      // the real course, built after 5-8.
      id: 4,
      title: "Unit 4",
      subtitle: "Operating Systems",
      icon: "\u{1F5A5}️",
      modules: mod(9, M(9))
    },
    {
      // Added after 6-8 were already built, and numbered 5 to match the
      // course's own numbering rather than the order it was written in.
      // Listed first so the map reads in course order, not build order.
      id: 5,
      title: "Unit 5",
      subtitle: "Databases",
      icon: "\u{1F5C4}\uFE0F",
      modules: mod(6, M(6))
    },
    {
      id: 6,
      title: "Unit 6",
      subtitle: "Networks, Internet & Security",
      icon: "\u{1F5A7}",
      modules: [...mod(1, M(1)), ...mod(2, M(2)), ...mod(3, M(3))]
    },
    {
      id: 7,
      title: "Unit 7",
      subtitle: "Programming Fundamentals",
      icon: "\u{1F4BB}",
      modules: mod(4, M(4))
    },
    {
      id: 8,
      title: "Unit 8",
      subtitle: "Emerging Technologies",
      icon: "\u{1F9E0}",
      modules: mod(5, M(5))
      // Unit 8 continues: Cloud Computing, Big Data, Blockchain, IoT.
      // Open question in PROJECT.md §11: does Unit 8 stay one entry, or
      // split? Five modules is ~75 chunks in one track.
    }
  // A unit with no modules would render as an empty card, which is worse
  // than not rendering — the console error above is the honest signal.
  // attach() applies the same filter, so a module that fails to load
  // still drops only its own unit.
  ].filter(u => u.modules.length);

  Content.course({
    id: "intro-cs",
    title: "Intro to CS",
  track: "cs",
    subtitle: "Networks, programming and emerging technologies",
    icon: "\u{1F4BB}",
    available: true,
    // 700 -- raised from 100 on 2026-08-24. Was 250 before that, and
    // 1000 (~$21) before that. Lands exactly on the medium pack
    // ($11.99), so it buys clean with nothing left over, same principle
    // the old 100 followed against the starter pack.
    //
    // Worth knowing what 700 means against the FREE supply: rank-up
    // rewards total 545 Tokens across ranks 6/8/12/15/18 (the last at
    // 81,000 XP), plus 12 from unit completions. Roughly 557 lifetime,
    // which is BELOW 700 — so this course cannot be reached by playing
    // alone, at any amount of effort. That is a pricing decision, not an
    // oversight; if it should be earnable, either the price comes down
    // or the rank rewards go up.
    priceTokens: 700,

    // No <script> tags for these — registry.js injects them on open.
    // Order matters only in that unit 6 wants 1-3 together; they are
    // loaded in sequence, so any order that lists all ten is correct.
    lazyFiles: [
      "library/content/intro-cs/data_m1.js",
      "library/content/intro-cs/data_m2.js",
      "library/content/intro-cs/data_m3.js",
      "library/content/intro-cs/data_m4.js",
      "library/content/intro-cs/data_m5.js",
      "library/content/intro-cs/data_m6.js",
      "library/content/intro-cs/data_m7.js",
      "library/content/intro-cs/data_m8.js",
      "library/content/intro-cs/data_m9.js",
      "library/content/intro-cs/data_m10.js"
    ],

    // Counts for the card before the content exists. Verified against
    // the real modules by check-content.js — if you add a topic and
    // forget the number here, the checker fails.
    unitOutline: [
      { id: 1, topics: 4 },
      { id: 2, topics: 4 },
      { id: 3, topics: 4 },
      { id: 4, topics: 4 },
      { id: 5, topics: 6 },
      { id: 6, topics: 14 },
      { id: 7, topics: 6 },
      { id: 8, topics: 6 }
    ],

    units: [],          // filled by Content.attach() on first open
    unitsFactory: buildUnits
  });
})();
