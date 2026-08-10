// ================================================
// COURSE TEMPLATE — copy this folder to start a course
// ------------------------------------------------
// Not loaded. Nothing here is in index.html; copy the folder, rename
// it, fill it in, and add the script tags.
//
// ---- Steps ----
//  1. cp -r library/content/_template library/content/<slug>
//  2. Write one data_m*.js per module (see the schema below).
//  3. Fill in the manifest at the bottom of this file.
//  4. In index.html, between registry.js and build.js, add:
//       <script src="library/content/<slug>/data_m1.js"></script>
//       ... one per module ...
//       <script src="library/content/<slug>/course.js"></script>
//     Module files must come BEFORE the course file — the manifest
//     references the MODULE_N constants directly.
//
// No branch changes. No edits to any other course.
//
// ---- Module schema ----
//
// const MODULE_N = {
//   id: "slug", unit: 9, title: "...", icon: "...",
//   topics: [{
//     id: "slug",                 // GLOBALLY unique across every course
//     title, desc, icon,
//     chunks: [{
//       title,
//       explain: {
//         blocks: [{ heading, text }],        // HTML; always use blocks
//         analogy: "...",
//         sources: [{ ref, note }]            // every block gets citations
//       },
//       example: { label, steps: [] },
//       quiz: { question, options: [4], correct: 0-3, explanation },
//       wisdomTags: []                        // optional, biases quotes
//     }],
//     examQuestions: [{ question, options: [4], correct: 0-3 }]   // 5 per topic
//   }]
// };
//
// ---- Content standards (PROJECT.md §9) ----
// * Answer keys must use the full A-D spread. Modules 1-4 shipped with
//   88% of answers on B or C, which is guessable without reading.
//   Check:  grep -ho "correct: [0-3]" data_mN.js | sort | uniq -c
// * Questions test APPLICATION, not restatement. "Which of these is
//   overfitting?" is recognition. "This model scores 98% on training
//   and 61% on new data — what happened?" is not.
// * Distractors should be real misconceptions, so answering needs
//   discrimination rather than eliminating nonsense.
// * Every explanation block carries citations in `explain.sources`.
// * Licensing (PROJECT.md §10): teach the concepts, cite authoritative
//   or public-domain sources, write your OWN analogies and examples.
//   The course textbooks are all-rights-reserved and one is CC BY-NC-ND.
//
// ---- Unique ids ----
// Unit ids and topic ids are global across all courses. Progress,
// reviews and the Garden are keyed on them, so a reused id silently
// shares progress between two topics. registry.js checks and logs a
// console error, but don't rely on that — pick fresh ids.
// ================================================

/*
Content.course({
  id: "<slug>",
  title: "<Course name>",
  subtitle: "<one line shown on the course card>",
  icon: "\u{1F4DA}",
  available: true,          // false renders a locked "coming soon" card
  units: [
    {
      id: 9,                // must not clash with 6, 7, 8
      title: "Unit 9",
      subtitle: "<what this unit covers>",
      icon: "\u{1F4D0}",
      modules: [MODULE_6]
    }
  ]
});
*/
