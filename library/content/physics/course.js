// ================================================
// Course: Physics
// ------------------------------------------------
// SCAFFOLD — registered but not written. `available: false` renders a
// locked "coming soon" card rather than an empty course, so the plan is
// visible in the app without pretending there is content behind it.
//
// Unit ids 9–14 are reserved for this course. They are global across
// every course: reusing one silently shares progress, reviews and Garden
// plants. Intro to CS holds 1-8. See library/content/CURRICULUM-PLAN.md
// for the full unit and topic breakdown.
//
// Best fit for worked examples; slowest chunks to write well.
//
// ---- To start writing ----
//  1. Add data_m*.js modules here (schema: _template/course.js).
//  2. List them in `units` below and flip `available` to true.
//  3. Add their <script> tags to index.html BEFORE this file.
//  4. node library/content/check-content.js physics
//
// Sources: OpenStax (CC BY) is the spine — see CURRICULUM-PLAN.md §1.
// Never invent a citation.
// ================================================

Content.course({
  id: "physics",
  title: "Physics",
  track: "science",
  subtitle: "Motion, energy, waves, electricity and light",
  icon: "\u{1F3D7}\u{FE0F}",
  available: false,
  units: []
});
