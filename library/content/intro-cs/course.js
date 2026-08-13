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
// ================================================

(() => {
  // typeof is the only safe way to ask about an undeclared name.
  const m1 = typeof MODULE_1 === "undefined" ? null : MODULE_1;
  const m2 = typeof MODULE_2 === "undefined" ? null : MODULE_2;
  const m3 = typeof MODULE_3 === "undefined" ? null : MODULE_3;
  const m4 = typeof MODULE_4 === "undefined" ? null : MODULE_4;
  const m5 = typeof MODULE_5 === "undefined" ? null : MODULE_5;
  const m6 = typeof MODULE_6 === "undefined" ? null : MODULE_6;
  const m7 = typeof MODULE_7 === "undefined" ? null : MODULE_7;
  const m8 = typeof MODULE_8 === "undefined" ? null : MODULE_8;
  const m9 = typeof MODULE_9 === "undefined" ? null : MODULE_9;
  const m10 = typeof MODULE_10 === "undefined" ? null : MODULE_10;

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

  const units = [
    {
      // Same reason units 2-4 sort where they do — numbered to match
      // the real course, built after 5-8.
      id: 1,
      title: "Unit 1",
      subtitle: "Computer Fundamentals",
      icon: "\u{1F9EE}",
      modules: mod(10, m10)
    },
    {
      // Added after 5-8 were already built, numbered 2 to match the real
      // course. Listed first for the same reason unit 5 is: the map
      // should read in course order, not build order.
      id: 2,
      title: "Unit 2",
      subtitle: "Number Systems & Data Representation",
      icon: "\u{1F522}",
      modules: mod(7, m7)
    },
    {
      // Same reason unit 2 sorts where it does \u2014 numbered to match the
      // real course, built after 5-8.
      id: 3,
      title: "Unit 3",
      subtitle: "Boolean Algebra & Logic Gates",
      icon: "\u{1F500}",
      modules: mod(8, m8)
    },
    {
      // Same reason units 2-3 sort where they do — numbered to match
      // the real course, built after 5-8.
      id: 4,
      title: "Unit 4",
      subtitle: "Operating Systems",
      icon: "\u{1F5A5}️",
      modules: mod(9, m9)
    },
    {
      // Added after 6-8 were already built, and numbered 5 to match the
      // course's own numbering rather than the order it was written in.
      // Listed first so the map reads in course order, not build order.
      id: 5,
      title: "Unit 5",
      subtitle: "Databases",
      icon: "\u{1F5C4}\uFE0F",
      modules: mod(6, m6)
    },
    {
      id: 6,
      title: "Unit 6",
      subtitle: "Networks, Internet & Security",
      icon: "\u{1F5A7}",
      modules: [...mod(1, m1), ...mod(2, m2), ...mod(3, m3)]
    },
    {
      id: 7,
      title: "Unit 7",
      subtitle: "Programming Fundamentals",
      icon: "\u{1F4BB}",
      modules: mod(4, m4)
    },
    {
      id: 8,
      title: "Unit 8",
      subtitle: "Emerging Technologies",
      icon: "\u{1F9E0}",
      modules: mod(5, m5)
      // Unit 8 continues: Cloud Computing, Big Data, Blockchain, IoT.
      // Open question in PROJECT.md §11: does Unit 8 stay one entry, or
      // split? Five modules is ~75 chunks in one track.
    }
  // A unit with no modules would render as an empty card, which is worse
  // than not rendering — the console error above is the honest signal.
  ].filter(u => u.modules.length);

  Content.course({
    id: "intro-cs",
    title: "Intro to CS",
    subtitle: "Networks, programming and emerging technologies",
    icon: "\u{1F4BB}",
    available: true,
    // 250 -- was 1000 (~$21), dropped to lower the barrier to entry
    // (the ROI conversation surfaced that the app is competing against
    // genuinely free alternatives, and $21 to even try the one course
    // that exists is a real friction point). 250 is comfortably covered
    // by even the smallest $6.99/350-Token pack. Locks the only course
    // behind the Token Shop's demo buyPack() until real payment exists.
    priceTokens: 250,
    units
  });
})();
