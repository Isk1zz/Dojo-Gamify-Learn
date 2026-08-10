// ================================================
// Course: Intro to CS
// ------------------------------------------------
// Manifest only. The teaching content is in the data_m*.js files
// alongside this one; this file just says how they group up.
//
// Unit ids are global across all courses — see content/registry.js.
// Ids 6, 7 and 8 are historical (they were literally units 6-8 of a
// module) and are kept because saved progress is keyed on them.
// ================================================

Content.course({
  id: "intro-cs",
  title: "Intro to CS",
  subtitle: "Networks, programming and emerging technologies",
  icon: "\u{1F4BB}",
  available: true,
  units: [
    {
      id: 6,
      title: "Unit 6",
      subtitle: "Networks, Internet & Security",
      icon: "\u{1F5A7}",
      modules: [MODULE_1, MODULE_2, MODULE_3]
    },
    {
      id: 7,
      title: "Unit 7",
      subtitle: "Programming Fundamentals",
      icon: "\u{1F4BB}",
      modules: [MODULE_4]
    },
    {
      id: 8,
      title: "Unit 8",
      subtitle: "Emerging Technologies",
      icon: "\u{1F9E0}",
      modules: [MODULE_5]
      // Unit 8 continues: Cloud Computing, Big Data, Blockchain, IoT.
      // Open question in PROJECT.md §11: does Unit 8 stay one entry, or
      // split? Five modules is ~75 chunks in one track.
    }
  ]
});
