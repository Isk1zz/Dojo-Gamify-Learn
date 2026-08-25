// ================================================
// Course: Biology
// ------------------------------------------------
// SCAFFOLD — registered but not written. `available: false` renders a
// locked "coming soon" card rather than an empty course, so the plan is
// visible in the app without pretending there is content behind it.
//
// Unit ids 21–26 are reserved for this course. They are global across
// every course: reusing one silently shares progress, reviews and Garden
// plants. Intro to CS holds 1-8. See library/content/CURRICULUM-PLAN.md
// for the full unit and topic breakdown.
//
// Highest concept density — the material spaced review helps most.
//
// ---- To start writing ----
//  1. Add data_m*.js modules here (schema: _template/course.js).
//  2. List them in `units` below and flip `available` to true.
//  3. Add their <script> tags to index.html BEFORE this file.
//  4. node library/content/check-content.js biology
//
// Sources: OpenStax (CC BY) is the spine — see CURRICULUM-PLAN.md §1.
// Never invent a citation.
// ================================================

Content.course({
  id: "biology",
  title: { en: "Biology", ru: "Биология" },
  track: "science",
  subtitle: { en: "Cells, genetics, evolution and human systems", ru: "Клетки, генетика, эволюция и системы человека" },
  icon: "\u{1F9EC}",
  available: false,
  units: []
});
