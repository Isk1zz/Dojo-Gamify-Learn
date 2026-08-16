// ================================================
// Course: Science Literacy
// ------------------------------------------------
// SCAFFOLD — registered but not written. `available: false` renders a
// locked "coming soon" card rather than an empty course, so the plan is
// visible in the app without pretending there is content behind it.
//
// Unit ids 27–30 are reserved for this course. They are global across
// every course: reusing one silently shares progress, reviews and Garden
// plants. Intro to CS holds 1-8. See library/content/CURRICULUM-PLAN.md
// for the full unit and topic breakdown.
//
// Recommended first: no maths dependency, and it teaches the reasoning the other three lean on.
//
// ---- To start writing ----
//  1. Add data_m*.js modules here (schema: _template/course.js).
//  2. List them in `units` below and flip `available` to true.
//  3. Add their <script> tags to index.html BEFORE this file.
//  4. node library/content/check-content.js science-literacy
//
// Sources: OpenStax (CC BY) is the spine — see CURRICULUM-PLAN.md §1.
// Never invent a citation.
// ================================================

Content.course({
  id: "science-literacy",
  title: "Science Literacy",
  subtitle: "How science actually works — evidence, data, reasoning",
  icon: "\u{1F9EA}",
  available: false,
  units: []
});
