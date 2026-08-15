// ================================================
// COURSE TEMPLATE — copy this folder to start a course
// ------------------------------------------------
// Not loaded. Nothing here is in index.html; copy the folder, rename
// it, fill it in, and add the script tags.
//
// >>> READ library/content/CONTENT-MODEL.md FIRST. <<<
// That file is the standard: how long a chunk is, how many blocks it
// gets, where citations go, where predict/recall go. This file is only
// the mechanics. Module 5 (intro-cs/data_m5.js) is the reference
// implementation — open it next to whatever you're writing.
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
//  5. node library/content/check-content.js <slug>
//     Fix everything it marks ✗ before committing.
//
// No branch changes. No edits to any other course.
//
// ---- Module schema ----
//
// const MODULE_N = {
//   id: "slug", unit: 9, title: "...", icon: "...",
//   topics: [{                        // 6 topics per module
//     id: "slug",                     // GLOBALLY unique across every course
//     title, desc, icon,
//     chunks: [{                      // 3 chunks per topic
//       title,
//       predict: {                    // FIRST chunk of the topic only
//         question, options: [4], reveal
//       },
//       explain: {
//         blocks: [                   // 3 blocks, ~200 words total
//           { text },                 // the lede — NO heading
//           { heading, text },
//           { heading, text }
//         ],
//         analogy: "...",             // ~45 words, YOUR OWN, never the book's
//         sources: [{ ref, note }]    // 2 per chunk; `note` names the claim
//       },
//       example: { label, steps: [] },        // 3-4, contrasting not listing
//       quiz: { question, options: [4], correct: 0-3, explanation },
//       recall: {                     // LAST chunk of the topic only
//         prompt, answer, points: []
//       },
//       wisdomTags: []                // 1-2, biases the topic's quote
//     }],
//     examQuestions: [{ question, options: [4], correct: 0-3 }]   // 5 per topic
//   }]
// };
//
// `predict` and `recall` are optional fields — a chunk without them
// runs the three-phase flow untouched. CONTENT-MODEL.md §3 says which
// chunks get them and why. The schema is frozen; don't add phases.
//
// ---- The rules most often broken ----
// * ~200 words of explanation per chunk. Modules 1-4 average 84, which
//   is a definition rather than a lesson, and is the main thing the
//   backfill is fixing.
// * Every chunk carries 2 real citations. Never invent one — not a page
//   number, not an edition, not a quote. Same rule as quotes.js.
// * Questions test APPLICATION. "Which of these is overfitting?" is
//   recognition. "This model scores 98% on training and 61% on new
//   data — what happened?" is not.
// * All four distractors are real misconceptions. A joke option turns a
//   4-way question into a 3-way one.
// * Licensing (CONTENT-MODEL.md §5): teach the concepts, cite
//   authoritative or public-domain sources, write your OWN analogies
//   and examples. The course textbooks are all-rights-reserved and one
//   is CC BY-NC-ND.
//
// ---- Unique ids ----
// Unit ids and topic ids are global across all courses. Progress,
// reviews and the Garden are keyed on them, so a reused id silently
// shares progress between two topics. registry.js checks and logs a
// console error, but don't rely on that — pick fresh ids.
// >>> UNIT IDS 1-8 ARE ALL TAKEN by Intro to CS. Start at 9. <<<
//
// This line used to say only 6, 7 and 8 were taken, which was true when
// the course had three units and dangerously wrong once it grew to
// eight. Reusing an id does not error - it silently shares progress,
// reviews and Garden plants between two unrelated topics, and the
// symptom would appear weeks later as a plant growing for a lesson
// nobody studied. Verified 2026-08-16: intro-cs occupies 1 through 8.
//
// Note on answer keys: chunk-question OPTIONS are shuffled on entry to
// the question phase, and exam questions and their options are shuffled
// on every attempt. A skewed `correct` column can no longer be
// exploited — but still write a real A-D spread, because the shuffle is
// a safety net and not a licence to stop thinking about distractors.
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
      id: 9,                // first free id - 1-8 belong to intro-cs
      title: "Unit 9",
      subtitle: "<what this unit covers>",
      icon: "\u{1F4D0}",
      modules: [MODULE_6]
    }
  ]
});
*/
