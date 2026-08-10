// ================================================
// Unit 8 Dojo — Machine Learning
// What ML is, why it needs data, and the three learning
// paradigms: supervised, unsupervised, reinforcement.
//
// SCHEMA NOTE (new in module 5):
//   explain.blocks[]  — an array of { heading?, text } instead of a
//                       single `text` string. Long concepts get room to
//                       breathe. app.js falls back to `text` for m1–m4.
//   explain.sources[] — { ref, note } citations, rendered in a
//                       collapsible box so a reader can verify claims.
//
// ANSWER KEYS: `correct` is deliberately spread across 0–3.
// Modules 1–4 put 88% of answers on B or C, which made them guessable.
// Keep new content balanced — check with:
//   grep -ho "correct: [0-3]" data_m5.js | sort | uniq -c
// ================================================

const MODULE_5 = {
  id: "machine-learning",
  unit: 8,
  title: "Machine Learning",
  icon: "🧠",
  topics: [
    // ────────────────────────────────────────────────
    {
      id: "what-is-machine-learning",
      title: "What Machine Learning Is",
      desc: "Improvement from experience — and the two things that requires.",
      icon: "🌱",
      chunks: [
        {
        // ---- Five-phase flow demo ----
        // `predict` and `recall` are optional; this chunk is the worked
        // example of the frozen schema (library/LIBRARY.md). Everything
        // without them still runs the three-phase flow untouched.
        predict: {
          question: "A model gets 98% of its training examples right but only 61% of new ones. Before reading on — what's your guess about what went wrong?",
          options: [
            "It wasn't trained for long enough",
            "It memorised the training set instead of learning the pattern",
            "The training data was too small to train on at all",
            "Its predictions are random"
          ],
          reveal: "Hold on to whichever you picked. The explanation names this exact gap."
        },
        recall: {
          prompt: "Without looking back: explain in your own words what machine learning is, and what makes it different from writing the rules by hand.",
          answer: "A program learns a rule from examples rather than being given the rule. You supply data and a target, and the algorithm searches for a function that maps one to the other well enough to work on examples it has never seen.",
          points: [
            "Learned from data, not hand-written",
            "The goal is performance on UNSEEN examples, not memorising the ones you have",
            "You choose the data and the target; the algorithm finds the rule"
          ]
        },
          title: "Learning as Improvement, Not Knowledge",
          explain: {
            blocks: [
              {
                text: `Ordinary software is <strong>told</strong> what to do. A programmer works out the rules in advance and writes them down, and the program applies them the same way forever. If the rules were wrong, they stay wrong until a human edits them.<br><br>Machine learning inverts this. Instead of being given the rules, the system is given <strong>examples and a way to measure how well it did</strong>, and it adjusts its own behaviour to score better. Nobody writes the rule; the rule is what the system arrives at.`
              },
              {
                heading: "The formal version",
                text: `Tom Mitchell's textbook definition is the one most often quoted, and it's worth knowing because it names three separate ingredients: a program learns from experience <strong>E</strong> with respect to some task <strong>T</strong> and performance measure <strong>P</strong>, if its performance at T, as measured by P, improves with E.<br><br>Notice what that rules out. A program that performs brilliantly but never changes isn't learning. A program that changes constantly but never improves isn't learning either. <strong>Learning is the specific combination of change plus measured improvement.</strong>`
              },
              {
                heading: "Why this matters in practice",
                text: `This definition is what separates machine learning from a very large lookup table or a very clever set of hand-written rules. A spam filter with 10,000 hand-written keyword rules is not doing machine learning, no matter how good it is. A spam filter that adjusts its own weights based on which mails you marked as spam <em>is</em> — even if it starts out worse than the hand-written one.`
              }
            ],
            analogy: `A recipe tells you exactly what to do and never changes. A cook who tastes each dish, notices it came out flat, and uses less water next time is learning. The recipe can be excellent and still not be learning — what makes it learning is the tasting and the adjustment, not the quality of the result.`,
            sources: [
              { ref: `Mitchell, T. M. (1997). <em>Machine Learning</em> (p. 2). McGraw-Hill.`, note: `The E / T / P definition quoted above.` },
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Frames ML as "practice makes perfect" — improvement over time from past results.` }
            ]
          },
          example: {
            label: "Is It Learning? Three Cases",
            steps: [
              `<strong>Not learning:</strong> a thermostat switches the heating on below 18°C. It has a task and a rule, but no performance measure and no adjustment.`,
              `<strong>Not learning:</strong> a chess program that plays perfectly from an opening book someone else compiled. Excellent performance, zero improvement from its own games.`,
              `<strong>Learning:</strong> a chess program that records which openings led to losses and shifts away from them. Worse than the book at first — but E, T and P are all present.`
            ]
          },
          quiz: {
            question: "A translation app has 50,000 hand-written grammar rules and translates very accurately. It has never changed since release. Under Mitchell's definition, is this machine learning?",
            options: [
              "Yes — it performs a task accurately, which is what matters",
              "Yes — 50,000 rules is far too many for a human to have written without ML",
              "No — accuracy is too low to qualify as learning",
              "No — it has a task and a performance level, but no improvement from experience"
            ],
            correct: 3,
            explanation: "Mitchell's definition requires improvement with experience. Accuracy alone isn't learning — a fixed system that never adjusts fails the definition no matter how well it performs."
          }
        },
        {
          title: "The First Requirement: Feedback",
          explain: {
            blocks: [
              {
                text: `You cannot improve at something if you never find out how you did. That sounds obvious for humans, and it's the first hard constraint on machine learning: the system needs some signal telling it whether an attempt was good or bad.<br><br>This signal is called <strong>feedback</strong>, and where it comes from is the single biggest design decision in an ML system. It's also what the three learning paradigms actually differ on.`
              },
              {
                heading: "Feedback is not always available",
                text: `It's tempting to assume feedback is easy to get. Often it isn't.<br><br>A speech recognizer can only improve if something tells it which words it got right. That "something" might be a human correcting it, a later action that implies the guess was wrong, or a labelled dataset prepared in advance. If none of those exist, the system has no way to know it is failing — and it will keep failing in exactly the same way indefinitely.`
              },
              {
                heading: "Degrees of feedback",
                text: `Feedback also varies in <em>quality</em>, not just presence. Knowing "that was wrong" is weaker than knowing "that was wrong, and here is the right answer." Knowing the right answer is weaker still than knowing <em>how far off</em> you were.<br><br>Most practical ML depends on that last, richest kind — a numerical measure of error, not just a verdict. That's why so much of ML turns out to be arithmetic rather than logic.`
              }
            ],
            analogy: `Studying with an answer key beats studying without one. But an answer key that only says "wrong" is far less useful than one that shows the worked solution — and a tutor who says "you're close, your sign is flipped" is more useful still. Same task, three grades of feedback, three very different learning speeds.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Identifies feedback as the crucial component shared by human and machine learning.` },
              { ref: `Russell, S., &amp; Norvig, P. (2021). <em>Artificial Intelligence: A Modern Approach</em> (4th ed.), Ch. 19. Pearson.`, note: `Treats the available feedback signal as what distinguishes the forms of learning.` }
            ]
          },
          example: {
            label: "Three Grades of Feedback on One Task",
            steps: [
              `<strong>Verdict only:</strong> a handwriting reader is told its guess of "5" was wrong. It now knows to try something else, but not what.`,
              `<strong>Correct answer:</strong> it's told the character was actually "6". It can now compare its representation of 5 and 6 and adjust.`,
              `<strong>Distance:</strong> it's told its confidence in "6" should have been 0.9 but was 0.2. It knows the direction <em>and</em> size of the correction — the most useful case, and the one most algorithms are built around.`
            ]
          },
          quiz: {
            question: "A recommendation system logs which items users click but never records which recommendations users saw and ignored. What has it lost?",
            options: [
              "Feedback on its failures — it only learns from successes, so it can't tell a bad recommendation from an unseen one",
              "Nothing important, since clicks are the only outcome that matters commercially",
              "The ability to store data, because ignored recommendations take up most of the storage",
              "Its performance measure, which can only be defined using ignored items"
            ],
            correct: 0,
            explanation: "Recording only clicks gives feedback on hits but none on misses. Without knowing what was shown and ignored, the system can't distinguish a genuinely bad recommendation from one the user never noticed."
          }
        },
        {
          title: "The Second Requirement: Knowing What to Change",
          explain: {
            blocks: [
              {
                text: `Feedback tells you that something went wrong. It doesn't tell you <strong>what to do differently</strong> — and that second problem is much harder than the first.<br><br>When a human cook produces a bad meal, they don't randomly change everything. They reason about which factor was probably responsible: too much salt, too long in the oven, wrong pan. That reasoning depends on already understanding how cooking works.`
              },
              {
                heading: "Machines start without that understanding",
                text: `A machine has no prior sense of which of its many adjustable quantities caused the error. This is why ML systems are described by their parameters: the numbers the system is allowed to change. A modest model might have thousands; a large one, billions.<br><br>Given an error, the system must work out which parameters to move, in which direction, and by how much. <strong>This is the crux of machine learning</strong> — the part that took decades to solve well, and the part that consumes the computation.`
              },
              {
                heading: "How the problem is made tractable",
                text: `The general solution is to make the error measurable as a smooth function of the parameters, so that calculus can indicate which direction reduces it. That's what gradient-based methods do, and it's why performance is expressed as a number rather than a verdict (previous chunk).<br><br>The alternative — trying changes at random and keeping whatever helps — does work, but scales badly. That trade-off is the subject of the next topic.`
              }
            ],
            analogy: `A mixing desk with a hundred sliders and a sound that's slightly wrong. Knowing it's wrong is easy. Knowing which slider to move is the whole skill — and a novice who moves sliders at random will eventually get there, just far more slowly than an engineer who knows what each one does.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Calls deciding what to change "the crux of ML" and links it to ML's dependency on data.` },
              { ref: `Goodfellow, I., Bengio, Y., &amp; Courville, A. (2016). <em>Deep Learning</em>, Ch. 4 &amp; 8. MIT Press.`, note: `Freely readable at deeplearningbook.org; covers gradient-based optimisation in depth.` }
            ]
          },
          example: {
            label: "Why the Second Problem Is Harder",
            steps: [
              `<strong>Detecting the error:</strong> the model predicted a house would sell for £200k; it sold for £320k. Error established in one subtraction.`,
              `<strong>Assigning blame:</strong> the model weighs floor area, postcode, age, garden size and twelve other factors. Which weight was wrong? The error alone doesn't say.`,
              `<strong>Resolving it:</strong> measure how the error would change if each weight were nudged slightly, then move every weight a little in the direction that reduces it. Repeat thousands of times.`
            ]
          },
          quiz: {
            question: "Why is a numerical error measure preferred over a simple correct/incorrect verdict?",
            options: [
              "Numbers are faster for computers to store than true/false values",
              "A number indicates both direction and size of the needed correction, so the system can work out which parameters to move and by how much",
              "A verdict cannot be recorded without a database, whereas numbers can",
              "Numerical measures are required by most programming languages for comparison operations"
            ],
            correct: 1,
            explanation: "A verdict says only that something is wrong. A numerical error can be measured against each parameter, revealing which ones to adjust and in which direction — that's what makes systematic improvement possible."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which of these is NOT one of the three ingredients in Mitchell's definition of learning?",
          options: ["A task", "The number of parameters", "A performance measure", "Experience"],
          correct: 1
        },
        {
          question: "A fraud detector is retrained monthly on newly confirmed fraud cases and its catch rate rises each quarter. Which ingredient does the confirmed-fraud data supply?",
          options: [
            "Experience — the record of past attempts the system improves from",
            "The task, since fraud detection is defined by the cases",
            "The performance measure, since each case is either fraud or not",
            "None; retraining on new data is not part of the definition"
          ],
          correct: 0
        },
        {
          question: "An image classifier is deployed into an environment where no one ever confirms or corrects its outputs. What follows?",
          options: [
            "It will slowly degrade because models decay without use",
            "It will improve, because real-world data is richer than training data",
            "Its accuracy will fluctuate randomly as inputs vary",
            "It cannot improve, because it has no feedback signal to learn from"
          ],
          correct: 3
        },
        {
          question: "Which best describes why 'deciding what to change' is harder than 'detecting an error'?",
          options: [
            "Detecting errors requires more computation than adjusting parameters",
            "Errors are usually too small to measure accurately",
            "An error is a single value, but it must be attributed among many parameters that could each be responsible",
            "Most systems have only one parameter, making the choice arbitrary"
          ],
          correct: 2
        },
        {
          question: "Which feedback signal is the most useful for learning?",
          options: [
            "How far the output was from the correct answer, and in which direction",
            "Whether the output was right or wrong",
            "The correct answer, with no indication of how close the guess was",
            "How long the system took to produce the output"
          ],
          correct: 0
        }
      ]
    },

    // ────────────────────────────────────────────────
    {
      id: "why-ml-needs-data",
      title: "Why Machines Need So Much Data",
      desc: "Search, repetition, and the cost of having no intuition.",
      icon: "📈",
      chunks: [
        {
          title: "No Intuition Means Exhaustive Search",
          explain: {
            blocks: [
              {
                text: `An experienced human improving at something doesn't consider every possible change. They rule most out immediately, because they understand the activity well enough to know which adjustments are plausible. That intuition is doing enormous work, and it's invisible precisely because it's so fast.<br><br>A machine has none of it. Starting out, it genuinely does not know which of its available adjustments is promising, so it has to <strong>evaluate them rather than guess between them</strong>.`
              },
              {
                heading: "Where the data goes",
                text: `Each evaluation costs data. To find out whether a change improved things, the system needs examples to test the changed behaviour against — and it needs them for <em>every</em> change it evaluates, at <em>every</em> step it's adjusting.<br><br>Multiply those together and you have the reason ML is data-hungry. It isn't that the algorithms are complicated. It's that <strong>the search is wide, and every point in the search has to be paid for in examples.</strong>`
              },
              {
                heading: "The common misconception",
                text: `People often assume ML needs lots of data because the problems are hard or the maths is elaborate. That's the wrong causal story, and it leads to the wrong conclusions.<br><br>The volume requirement comes from the <em>breadth of the search</em>. This is why techniques that narrow the search — better initialisation, transfer from a related task, architectural constraints that rule out implausible solutions — reduce data requirements so dramatically. They restore some of the intuition the machine started without.`
              }
            ],
            analogy: `Finding a light switch in an unfamiliar dark room. Someone who knows the building checks beside the door first. A stranger has to sweep the walls. The stranger isn't slower because the task is harder for them — they're slower because they can't rule anything out, so they must check everything.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `States that a computer doesn't initially know which steps are likely to succeed, so it must try all of them — and identifies this as why data matters so much.` },
              { ref: `Russell, S., &amp; Norvig, P. (2021). <em>Artificial Intelligence: A Modern Approach</em> (4th ed.), Ch. 19. Pearson.`, note: `On inductive bias — the assumptions that narrow a learner's search space.` }
            ]
          },
          example: {
            label: "Recognising a Letter, Step by Step",
            steps: [
              `The system has an image and must decide which letter it is. It has no notion of what letters look like, so it cannot shortlist.`,
              `It compares the image against a reference for <strong>every</strong> letter of the alphabet, scoring each on closeness of match.`,
              `It keeps the highest score. Twenty-six comparisons for one character — and it needs many labelled characters before those references are any good.`
            ]
          },
          quiz: {
            question: "A team narrows their model's search by building in the constraint that nearby pixels are related. What effect would you expect on the amount of training data needed?",
            options: [
              "It increases, because constraints add parameters that must be learned",
              "It stays the same, since data requirements depend only on the size of the input",
              "It decreases, because fewer candidate solutions have to be evaluated",
              "It becomes unpredictable, since constraints interfere with the error measure"
            ],
            correct: 2,
            explanation: "Data is consumed by evaluating candidates. A constraint that rules out implausible solutions shrinks the search, so fewer examples are needed — this is the reasoning behind convolutional architectures for images."
          }
        },
        {
          title: "Telling Improvement From Luck",
          explain: {
            blocks: [
              {
                text: `Finding a change that appears to help is not the same as finding one that does. Any single test can come out well by accident, and a system that accepts every apparent improvement will accumulate changes that were really just noise.<br><br>So a second cost appears: <strong>each promising change must be repeated enough times to establish it wasn't a fluke.</strong> Data is spent not only on searching, but on confirming.`
              },
              {
                heading: "Overfitting is this failure at scale",
                text: `When a system mistakes coincidence for pattern systematically, it <strong>overfits</strong>: it performs excellently on the data it was trained on and poorly on anything new. It has effectively memorised the accidents of its training set.<br><br>This is the most common way ML projects fail, and it fails <em>invisibly</em> — training accuracy looks superb right up until deployment.`
              },
              {
                heading: "The standard defence",
                text: `The remedy is structural: hold data back. A portion of the data is never used for training and is used only to check performance. If a model does well on data it has never seen, the improvement was probably real.<br><br>Note this makes the data problem worse, not better — held-out data can't be trained on. Trustworthy evaluation is bought with data you deliberately decline to use.`
              }
            ],
            analogy: `A coin that comes up heads three times running doesn't prove it's weighted. You'd want a few hundred more flips before believing anything — and crucially, flips you haven't already used to form the theory.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Notes that an apparent improvement must be repeated enough to confirm it isn't a fluke or coincidence.` },
              { ref: `Hastie, T., Tibshirani, R., &amp; Friedman, J. (2009). <em>The Elements of Statistical Learning</em> (2nd ed.), Ch. 7. Springer.`, note: `Freely available from the authors; the standard treatment of overfitting and validation.` }
            ]
          },
          example: {
            label: "How Overfitting Hides",
            steps: [
              `A model is trained to spot pneumonia in chest X-rays and reaches 99% accuracy on its training set. The team celebrates.`,
              `On X-rays from a different hospital, accuracy collapses. The model had learned to recognise a marker one hospital printed on its images, not the disease.`,
              `A held-out set from a second hospital would have exposed this before deployment — which is exactly why data is set aside rather than all spent on training.`
            ]
          },
          quiz: {
            question: "A model scores 98% on training data and 61% on data it hasn't seen. What is the most likely explanation?",
            options: [
              "The training set was too small to reach 98%",
              "The performance measure is miscalculated, since both figures should match",
              "The model needs more parameters to close the gap",
              "It has overfitted — it learned accidents of the training set rather than generalisable patterns"
            ],
            correct: 3,
            explanation: "A large gap between training and unseen performance is the signature of overfitting. Adding parameters typically widens that gap rather than closing it."
          }
        },
        {
          title: "Trial and Error, and Why It Survives",
          explain: {
            blocks: [
              {
                text: `Changing things at random and keeping whatever helps is a poor way for a person to improve. It's slow, it's frustrating, and people only fall back on it when they don't understand the thing they're trying to fix.<br><br>For a machine, two of those three objections disappear. A computer doesn't get frustrated, and it can run enormous numbers of attempts quickly. <strong>Random trial and error is therefore genuinely viable for machines in a way it isn't for humans</strong> — a rare case where a strategy that's bad for people is acceptable for computers.`
              },
              {
                heading: "But it's still inefficient",
                text: `Viable is not the same as good. Pure trial and error can't identify the best available option until it has evaluated all of them, and the number of options grows explosively with the number of parameters.<br><br>So the practical goal isn't to eliminate trial and error but to <strong>reduce the number of trials required</strong>. Mathematical techniques that indicate which direction to move — rather than testing every direction — are what make modern ML feasible.`
              },
              {
                heading: "What this leads to",
                text: `Those techniques, combined with different answers to "where does feedback come from?", produce the three ways of designing an ML system: <strong>supervised</strong>, <strong>unsupervised</strong> and <strong>reinforcement</strong> learning.<br><br>Each suits particular kinds of problem and particular kinds of data. The next three topics take them one at a time.`
              }
            ],
            analogy: `Guessing a 4-digit PIN by trying every combination works — 10,000 attempts, and a machine does it in seconds. Extend it to a 20-character password and the same method needs longer than the universe has existed. The method didn't change; the search space did.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Argues random trial and error is viable for machines because they don't feel frustration and work quickly — but is inefficient because the best option isn't known until all are evaluated.` },
              { ref: `Goodfellow, I., Bengio, Y., &amp; Courville, A. (2016). <em>Deep Learning</em>, Ch. 8. MIT Press.`, note: `On why gradient methods replace exhaustive search in practice.` }
            ]
          },
          example: {
            label: "Two Ways to Reach the Bottom of a Valley in Fog",
            steps: [
              `<strong>Trial and error:</strong> take a step in a random direction. If you're lower, stay; if higher, go back. Repeat. It works, and it's slow.`,
              `<strong>Gradient method:</strong> feel which way the ground slopes beneath your feet and step downhill. Same goal, far fewer steps, and no need to sample every direction.`,
              `<strong>The catch:</strong> the second only works if the ground slopes smoothly. Making the error measure smooth is what buys the shortcut.`
            ]
          },
          quiz: {
            question: "Random trial and error is described as viable for machines but not humans. Which pair of reasons explains the difference?",
            options: [
              "Machines don't experience frustration, and they can perform very large numbers of attempts quickly",
              "Machines have more memory, and they can store every attempt permanently",
              "Machines are more accurate per attempt, and they make fewer mistakes",
              "Machines can work without supervision, and they don't need feedback"
            ],
            correct: 0,
            explanation: "The two stated advantages are the absence of frustration and sheer speed. Accuracy per attempt is unchanged — a machine's individual random guesses are no better than anyone else's; it simply makes vastly more of them."
          }
        }
      ],
      examQuestions: [
        {
          question: "What is the primary reason machine learning consumes large volumes of data?",
          options: [
            "Modern algorithms are mathematically complex",
            "Storage has become cheap, so more data is collected by default",
            "Data must be duplicated across servers for reliability",
            "Every candidate change must be evaluated on examples, and the space of candidates is wide"
          ],
          correct: 3
        },
        {
          question: "Which of these would you expect to REDUCE a model's data requirement?",
          options: [
            "Increasing the number of parameters",
            "Building in a constraint that rules out implausible solutions",
            "Collecting inputs from a wider variety of sources",
            "Lengthening the training time"
          ],
          correct: 1
        },
        {
          question: "Why is a portion of the available data deliberately withheld from training?",
          options: [
            "To provide an honest check on whether improvements generalise beyond the training set",
            "To reduce the computational cost of each training run",
            "Because using all data at once would exceed available memory",
            "To keep a backup in case the training data is corrupted"
          ],
          correct: 0
        },
        {
          question: "A model achieves near-perfect training accuracy but fails on new data. Adding more parameters would most likely:",
          options: [
            "Fix the problem by increasing the model's capacity",
            "Have no effect, since the issue lies in the data",
            "Reduce training accuracy while improving unseen accuracy",
            "Make it worse, since greater capacity increases the tendency to memorise accidents of the training set"
          ],
          correct: 3
        },
        {
          question: "Gradient-based methods improve on random trial and error mainly because they:",
          options: [
            "Guarantee finding the single best possible solution",
            "Remove the need for any training data",
            "Indicate which direction reduces error, so far fewer candidates need testing",
            "Work on problems where the error measure is not smooth"
          ],
          correct: 2
        }
      ]
    },

    // ────────────────────────────────────────────────
    {
      id: "supervised-learning",
      title: "Supervised Learning",
      desc: "Learning from labelled examples — and where the labels run out.",
      icon: "🏷️",
      chunks: [
        {
          title: "Learning With the Answers Provided",
          explain: {
            blocks: [
              {
                text: `In supervised learning, the system is given data that already carries the correct answers. Each example is a pair: an input, and the output that input should produce. This is called <strong>labelled training data</strong>, and it is the defining feature of the approach.<br><br>The system makes a prediction for each input, compares it to the label, and adjusts. Feedback is immediate, specific, and available for every single example.`
              },
              {
                heading: "Where the labels come from",
                text: `Labels don't appear on their own. Someone or something has to supply them — usually people, drawing boxes around objects, marking emails as spam, or transcribing audio.<br><br>This is the approach's central practical constraint. <strong>Supervised learning converts a technical problem into a labour problem.</strong> The algorithm may be freely available; the labelled data usually isn't, and for many valuable tasks it doesn't exist at any price.`
              },
              {
                heading: "The two shapes of supervised problem",
                text: `Supervised tasks divide by what kind of answer the label is.<br><br><strong>Classification</strong> — the label is a category from a fixed set. Spam or not spam; which of ten digits; which of a thousand object types.<br><br><strong>Regression</strong> — the label is a quantity on a continuous scale. Tomorrow's temperature; a property's sale price; time until a component fails.<br><br>The same underlying loop drives both; what differs is how error is measured.`
              }
            ],
            analogy: `Working through a problem set with the answers printed at the back. You attempt each question, check, and correct your method where you were wrong. You couldn't do this at all if the back of the book were blank — and someone had to work out those answers first.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Compares supervised learning to a teacher marking each answer as you work.` },
              { ref: `Russell, S., &amp; Norvig, P. (2021). <em>Artificial Intelligence: A Modern Approach</em> (4th ed.), Ch. 19. Pearson.`, note: `Formal treatment of classification and regression as the two supervised task types.` }
            ]
          },
          example: {
            label: "Training a Vehicle Detector",
            steps: [
              `<strong>Label:</strong> people draw boxes around every car in thousands of traffic images and tag each one. This is the expensive part, and it happens before any training.`,
              `<strong>Predict and compare:</strong> the model proposes boxes; each is scored against the human-drawn ones. Disagreements produce a measurable error.`,
              `<strong>Adjust and repeat:</strong> parameters shift to reduce that error, over many passes, until the model's boxes match the labels closely enough to be useful on new images.`
            ]
          },
          quiz: {
            question: "A team wants to predict how many days a machine part will last before failing. Which supervised task type is this?",
            options: [
              "Classification, because parts either fail or they don't",
              "Neither — predicting the future is outside supervised learning",
              "Regression, because the label is a quantity on a continuous scale",
              "Classification, because each part belongs to a category of component"
            ],
            correct: 2,
            explanation: "The answer being predicted is a number of days — a continuous quantity — which makes it regression. It would be classification if the question were 'will this part fail this month, yes or no?'"
          }
        },
        {
          title: "Training, Then Generalising",
          explain: {
            blocks: [
              {
                text: `Training and using a model are two distinct phases, and confusing them causes most misunderstandings about supervised learning.<br><br>During <strong>training</strong>, the model sees inputs alongside their correct answers and adjusts. During <strong>inference</strong> — actual use — it sees inputs alone and must produce answers without any label to check against. The whole point of training is to prepare for that second phase.`
              },
              {
                heading: "Why training data must be representative",
                text: `A model can only handle inputs resembling those it trained on. This makes the <em>composition</em> of the training set as important as its size.<br><br>A detector trained only on daylight images will fail at night. One trained only on one country's road signs will fail elsewhere. The model isn't broken in these cases — it's being asked about a world it was never shown, and it has no way to know it's out of its depth.`
              },
              {
                heading: "Confidence is not correctness",
                text: `A trained model outputs a score expressing how strongly it favours an answer. It's natural to read this as certainty. It isn't.<br><br>A model given an input unlike anything in its training data will still produce a confident-looking number, because it has no mechanism for representing "I have never seen anything like this." <strong>High confidence on unfamiliar input is one of the most dangerous failure modes in deployed ML</strong>, precisely because it looks identical to success.`
              }
            ],
            analogy: `Someone who learned to drive entirely in one quiet town will pass every test there and still be dangerous on a motorway. They aren't a bad driver — they're a driver operating outside what they were trained on, and nothing in their experience tells them so.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Emphasises that training data should be representative of the data used in real situations.` },
              { ref: `Hastie, T., Tibshirani, R., &amp; Friedman, J. (2009). <em>The Elements of Statistical Learning</em> (2nd ed.), Ch. 7. Springer.`, note: `On generalisation error and the limits of training-set performance.` }
            ]
          },
          example: {
            label: "The Same Model, Two Phases",
            steps: [
              `<strong>Training:</strong> 50,000 emails, each already marked spam or not. The model predicts, is corrected, and adjusts — thousands of times.`,
              `<strong>Inference:</strong> a new email arrives with no label. The model outputs "spam, confidence 0.94". Nothing verifies this; the answer is acted on as-is.`,
              `<strong>The gap:</strong> if the email is in a language absent from training, the model still returns a confident number. It cannot report that the input is unfamiliar.`
            ]
          },
          quiz: {
            question: "A model trained on English-language emails is shown an email in Finnish. What is the most likely behaviour?",
            options: [
              "It will output a low confidence score, correctly signalling unfamiliarity",
              "It will refuse to classify the input and return an error",
              "It will retrain itself on the new language automatically",
              "It will return a confident answer, because it has no way to represent having seen nothing like this"
            ],
            correct: 3,
            explanation: "Confidence scores reflect how strongly the model favours one output over others, not whether the input resembles anything it was trained on. Unfamiliar inputs commonly produce confident — and wrong — answers."
          }
        },
        {
          title: "Where Supervised Learning Runs Out",
          explain: {
            blocks: [
              {
                text: `Supervised learning is the best-understood and most widely deployed form of ML. It's also the most easily blocked, and always for the same reason: <strong>no labels.</strong>`
              },
              {
                heading: "Three ways labels fail you",
                text: `<strong>They don't exist.</strong> Nobody knows the right answer. Which customers will turn out valuable in five years? There is no key to consult.<br><br><strong>They're unaffordable.</strong> The answer is knowable but obtaining it at scale isn't practical. Expert medical annotation of a million scans is possible in principle and impossible in budget.<br><br><strong>They're wrong.</strong> Labels are produced by people, and people are inconsistent, rushed, and occasionally mistaken. A model trained on flawed labels learns the flaws faithfully — it has no way to distinguish a bad label from a hard example.`
              },
              {
                heading: "What follows from this",
                text: `The third case deserves particular attention because it's invisible. A model trained on systematically biased labels will reproduce that bias while reporting excellent accuracy, since accuracy is measured against the same biased labels.<br><br>When labels are unavailable rather than merely flawed, a different approach is required — one that doesn't need correct answers at all. That's the next topic.`
              }
            ],
            analogy: `A problem set with the answer key missing, or written by someone who rushed it. In the first case you can't check your work at all. In the second you can — and you'll confidently learn the wrong method, scoring full marks against a key that's wrong.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Identifies two reasons labelled examples may be unavailable: not knowing what's being looked for, and insufficient labelled data.` },
              { ref: `Northcutt, C. G., Athalye, A., &amp; Mueller, J. (2021). Pervasive label errors in test sets destabilize machine learning benchmarks. <em>NeurIPS Datasets and Benchmarks</em>.`, note: `Documents substantial label error rates in widely used benchmark datasets.` }
            ]
          },
          example: {
            label: "Three Blocked Projects",
            steps: [
              `<strong>No answer exists:</strong> predicting which research proposals will produce breakthroughs. Nobody can label the training set, because nobody knows.`,
              `<strong>Too expensive:</strong> a rare-disease detector needs specialist review of every scan. Roughly 300 exist worldwide with the expertise, and they have day jobs.`,
              `<strong>Labels are wrong:</strong> a hiring model trained on past decisions learns whatever biases those decisions contained — and scores highly, because it's graded against them.`
            ]
          },
          quiz: {
            question: "A recruitment model is trained on ten years of a company's hiring decisions and reports 94% accuracy. What does that figure actually establish?",
            options: [
              "That the model agrees with past decisions — which says nothing about whether those decisions were good",
              "That the model will make better hiring decisions than the humans did",
              "That the training data contained no errors, since accuracy is high",
              "That 94% of future candidates will be correctly assessed"
            ],
            correct: 0,
            explanation: "Accuracy is measured against the labels, and here the labels are the company's past decisions. High accuracy means faithful reproduction of those decisions, including any bias in them — the metric cannot see the problem."
          }
        }
      ],
      examQuestions: [
        {
          question: "What single feature defines supervised learning?",
          options: [
            "Training examples arrive with their correct answers attached",
            "A human monitors the system while it runs",
            "The system is retrained on a fixed schedule",
            "Its outputs are always categories rather than numbers"
          ],
          correct: 0
        },
        {
          question: "Predicting tomorrow's electricity demand in megawatts is an example of:",
          options: ["Classification", "Unsupervised learning", "Reinforcement learning", "Regression"],
          correct: 3
        },
        {
          question: "Why is the composition of a training set as important as its size?",
          options: [
            "Larger sets are always slower to process",
            "A model can only handle inputs resembling what it was trained on, so gaps in coverage become blind spots",
            "Composition determines how many parameters the model needs",
            "Uneven composition prevents the error measure from being calculated"
          ],
          correct: 1
        },
        {
          question: "A deployed classifier returns high confidence on an input unlike anything in its training data. Why?",
          options: [
            "Because the input must actually be similar to the training data",
            "Because confidence is calculated after checking the input against training examples",
            "Because confidence reflects preference among possible outputs, not familiarity with the input",
            "Because the model has silently retrained itself on the new input"
          ],
          correct: 2
        },
        {
          question: "Which of these makes label errors especially dangerous?",
          options: [
            "They cause training to fail with an explicit error message",
            "They can be detected reliably by measuring training accuracy",
            "They only affect regression tasks, not classification",
            "The model is graded against the same flawed labels, so accuracy looks high while the model reproduces the flaws"
          ],
          correct: 3
        }
      ]
    },

    // ────────────────────────────────────────────────
    {
      id: "unsupervised-learning",
      title: "Unsupervised Learning",
      desc: "Finding structure when no correct answer exists.",
      icon: "🔍",
      chunks: [
        {
          title: "When There Is No Answer Key",
          explain: {
            blocks: [
              {
                text: `Unsupervised learning operates on data with no labels attached. There is no correct output to compare against, so the feedback loop that drives supervised learning simply isn't available.<br><br>Instead of learning to reproduce known answers, the system looks for <strong>structure in the data itself</strong>: groupings, associations, and things that don't fit.`
              },
              {
                heading: "Two different reasons for the absence",
                text: `It matters which reason applies, because they call for different responses.<br><br><strong>The answer is unknown.</strong> We don't yet know what we're looking for, so no key could be written. What kinds of customer are there? Nobody has the list — discovering it <em>is</em> the task.<br><br><strong>The answer is known but unlabelled.</strong> Correct answers exist in principle, but not enough data carries them. Here unsupervised methods are a workaround for a labelling shortfall rather than a discovery tool.`
              },
              {
                heading: "What it produces",
                text: `Because there's no key, the output isn't "right" or "wrong" — it's a proposed structure. Common forms:<br><br><strong>Clusters</strong> — groups of examples more similar to each other than to the rest.<br><strong>Associations</strong> — things that tend to occur together.<br><strong>Anomalies</strong> — examples that fit no pattern, which is often the valuable output rather than a nuisance.`
              }
            ],
            analogy: `Handing someone a box of unlabelled photographs and asking them to sort it. There's no correct arrangement — by date, by place, by who's in them are all defensible. What they hand back is a proposal about how the box is organised, not an answer.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Gives both reasons feedback may be unavailable, and describes the search for patterns, associations and exceptions.` },
              { ref: `Hastie, T., Tibshirani, R., &amp; Friedman, J. (2009). <em>The Elements of Statistical Learning</em> (2nd ed.), Ch. 14. Springer.`, note: `Standard reference on clustering and unsupervised structure discovery.` }
            ]
          },
          example: {
            label: "Three Outputs From One Dataset",
            steps: [
              `<strong>Clustering:</strong> shoppers separate into groups — weekly bulk buyers, frequent small-basket visitors, seasonal one-offs. Nobody defined these categories in advance.`,
              `<strong>Association:</strong> two products are bought together far more often than chance would predict.`,
              `<strong>Anomaly:</strong> one account's purchasing resembles nothing else in the dataset. In fraud detection, this is the result you were after.`
            ]
          },
          quiz: {
            question: "A bank wants to find transactions unlike any normal pattern, without a list of known fraud types. Which output is it after?",
            options: [
              "Anomalies — examples that fit no established pattern",
              "Regression, since transaction amounts are continuous",
              "Clusters, since fraud forms its own natural group",
              "Associations, since fraudulent transactions occur together"
            ],
            correct: 0,
            explanation: "Without a list of known fraud types there are no labels to learn from, and novel fraud won't resemble past cases. Anomaly detection targets exactly this: what fits nothing else."
          }
        },
        {
          title: "Patterns, Associations, and Exceptions",
          explain: {
            blocks: [
              {
                text: `With no key to check against, an unsupervised system needs a different basis for grouping things. That basis is <strong>similarity</strong> — and how similarity gets defined turns out to be the most consequential decision in the whole approach.`
              },
              {
                heading: "Similarity is a choice, not a fact",
                text: `Whether two customers are "similar" depends entirely on which attributes you measure and how you weigh them. Compare by spending and you get one set of groups; compare by product category and you get a different one. Neither is wrong.<br><br>This means <strong>unsupervised results are not discoveries about the world so much as consequences of your measurement choices.</strong> Change the definition of similarity and the structure changes with it.`
              },
              {
                heading: "The system will always find something",
                text: `A clustering algorithm asked for five groups will return five groups. It has no way to report that the data has no natural grouping, or that four would have been better, or that the structure is an artefact of how you measured.<br><br><strong>Output is guaranteed; meaning is not.</strong> This is the discipline unsupervised learning demands and the reason its results need more scrutiny than supervised ones, not less.`
              }
            ],
            analogy: `Sort a bookshelf by height and you get one arrangement; by colour, another; by subject, a third. Every arrangement is real, none is the "true" order, and the sorter will always produce something even if the books have nothing meaningful in common.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Describes unsupervised learning as examining data for patterns, associations and exceptions to surface possible answers.` },
              { ref: `von Luxburg, U., Williamson, R. C., &amp; Guyon, I. (2012). Clustering: Science or art? <em>JMLR Workshop and Conference Proceedings</em>, 27, 65–79.`, note: `On why clustering results depend on the chosen similarity measure and cannot be validated objectively.` }
            ]
          },
          example: {
            label: "One Dataset, Two Similarity Measures",
            steps: [
              `<strong>By total spend:</strong> customers split into high, medium and low spenders. Useful for pricing; blind to what anyone actually buys.`,
              `<strong>By product mix:</strong> the same customers split into parents, students and hobbyists. Useful for recommendations; blind to budget.`,
              `<strong>The point:</strong> both are correct. The algorithm didn't discover which grouping matters — the choice of measurement decided it before the algorithm ran.`
            ]
          },
          quiz: {
            question: "An analyst runs clustering on data with no natural grouping at all. What does the algorithm return?",
            options: [
              "An error indicating no clusters were found",
              "A single cluster containing every example",
              "The requested number of clusters, since it has no mechanism to report that none are meaningful",
              "Random output that changes completely on every run"
            ],
            correct: 2,
            explanation: "Clustering algorithms partition whatever they're given. Asked for k groups, they return k groups. Nothing in the output distinguishes meaningful structure from an arbitrary partition of unstructured data."
          }
        },
        {
          title: "Insight or Coincidence?",
          explain: {
            blocks: [
              {
                text: `Suppose an unsupervised system reports that buyers of a particular product are disproportionately likely to work in one industry. Is that an insight, or a coincidence in this dataset?<br><br><strong>The system cannot tell you.</strong> It has no notion of meaning, plausibility or causation. It reports that a pattern is present; whether the pattern signifies anything is outside what it can compute.`
              },
              {
                heading: "The two available responses",
                text: `A human can bring judgement, domain knowledge, or independent investigation — asking whether the finding makes sense, and testing it another way.<br><br>The system has one option: <strong>see whether the pattern recurs.</strong> Run it on fresh data. A pattern that repeats across independent samples is more likely to be real; one that vanishes was probably noise. This is weaker than understanding, but it's checkable and automatable.`
              },
              {
                heading: "Why the approach is still worth it",
                text: `Given all these caveats, why use unsupervised learning at all?<br><br>Because it can generate answers to questions nobody can answer confidently themselves. A human analyst can only test hypotheses they thought of. An unsupervised system surfaces structure nobody was looking for — including structure that would never have occurred to anyone.<br><br><strong>It is a generator of candidates, not a producer of conclusions.</strong> Used that way it is powerful. Used as an oracle it is misleading.`
              }
            ],
            analogy: `A metal detector on a beach. It reliably tells you something is buried; it cannot tell you whether it's a coin or a bottle cap. Treating every beep as treasure means a lot of digging. Ignoring the beeps means finding nothing at all.`,
            sources: [
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `States there's no immediate way to know whether findings are insights or coincidences, and that the system's only recourse is repetition with further data.` },
              { ref: `Ioannidis, J. P. A. (2005). Why most published research findings are false. <em>PLoS Medicine</em>, 2(8), e124.`, note: `On why patterns found by searching a large space often fail to replicate.` }
            ]
          },
          example: {
            label: "Following Up an Unexpected Finding",
            steps: [
              `<strong>The finding:</strong> the system reports that customers who buy a certain product also disproportionately live in one city.`,
              `<strong>What it can't say:</strong> whether this reflects a real regional preference, a single bulk buyer, a delivery quirk, or nothing at all.`,
              `<strong>Two follow-ups:</strong> a human checks whether a plausible mechanism exists, and the system re-runs on next quarter's data. Agreement between the two is what converts a candidate into a finding.`
            ]
          },
          quiz: {
            question: "What is the most defensible way to describe an unexpected pattern reported by an unsupervised system?",
            options: [
              "A conclusion, since the algorithm found it in real data",
              "A candidate finding that requires independent confirmation before being acted on",
              "An error, since unexpected patterns indicate a misconfigured algorithm",
              "A correlation that establishes causation within the dataset examined"
            ],
            correct: 1,
            explanation: "The system detects structure but cannot assess meaning. Its output is a hypothesis worth checking — through domain judgement, independent data, or both — not a result to act on directly."
          }
        }
      ],
      examQuestions: [
        {
          question: "What distinguishes unsupervised from supervised learning?",
          options: [
            "It processes larger volumes of data",
            "No correct answers are supplied, so the system looks for structure rather than reproducing known outputs",
            "It runs without human involvement at any stage",
            "It produces numbers rather than categories"
          ],
          correct: 1
        },
        {
          question: "Why can two analysts get different clusterings from the same dataset?",
          options: [
            "One of them must have configured the algorithm incorrectly",
            "Clustering algorithms are non-deterministic by design",
            "Similarity depends on which attributes are measured and how they're weighted, and both choices are legitimate",
            "The dataset must have changed between the two runs"
          ],
          correct: 2
        },
        {
          question: "An unsupervised system reports a striking pattern. Which action is most appropriate?",
          options: [
            "Act on it immediately, since the algorithm examined the full dataset",
            "Discard it, since unsupervised output is unreliable",
            "Increase the number of clusters until the pattern disappears",
            "Treat it as a hypothesis and check whether it recurs in independent data"
          ],
          correct: 3
        },
        {
          question: "In fraud detection, why is anomaly detection often preferred to training a classifier on known fraud cases?",
          options: [
            "Anomaly detection needs no data at all",
            "Classifiers cannot be applied to financial data",
            "Novel fraud won't resemble past cases, so learning from known types misses what hasn't been seen before",
            "Anomaly detection is guaranteed to produce fewer false positives"
          ],
          correct: 2
        },
        {
          question: "What is the strongest argument for using unsupervised learning despite its interpretive difficulties?",
          options: [
            "It surfaces structure nobody thought to look for, including patterns no analyst would have hypothesised",
            "Its results require no verification",
            "It always outperforms supervised learning when both are available",
            "It eliminates the need for domain expertise"
          ],
          correct: 0
        }
      ]
    },

    // ────────────────────────────────────────────────
    {
      id: "reinforcement-learning",
      title: "Reinforcement Learning",
      desc: "Judging a whole sequence, not each step.",
      icon: "🎯",
      chunks: [
        {
          title: "The Outcome Judges the Sequence",
          explain: {
            blocks: [
              {
                text: `Reinforcement learning fits problems where success is a <strong>sequence of decisions</strong> rather than a single answer — playing a game, controlling a machine, routing traffic, managing an inventory.<br><br>In such problems it's usually impossible to say whether any individual decision was correct. What can be judged is how the whole sequence turned out.`
              },
              {
                heading: "Why this is a genuinely different problem",
                text: `Supervised learning judges every prediction against its own label. Reinforcement learning has no per-step label at all — only an outcome at the end, which must somehow be attributed across everything that led to it.<br><br>This is the <strong>credit assignment problem</strong>, and it's the defining difficulty of the approach. A game is lost after eighty moves. Which move was the mistake? Perhaps move twelve, which looked fine for another forty moves.`
              },
              {
                heading: "The consequence for individual moves",
                text: `A move that seems locally bad may be correct, and one that seems locally excellent may be a mistake. A sacrifice that loses material immediately can be the move that wins the game.<br><br><strong>Reinforcement learning explicitly abandons short-term evaluation in favour of eventual outcome.</strong> This is what lets it discover strategies that look wrong to anyone judging move by move — and it's why RL systems sometimes find approaches human experts had dismissed.`
              }
            ],
            analogy: `A season of football, not a single pass. The pass that eventually mattered may have been an unremarkable sideways ball in the seventieth minute. You cannot grade passes individually — you have the league table at the end, and the job is working backwards from it.`,
            sources: [
              { ref: `Sutton, R. S., &amp; Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em> (2nd ed.), Ch. 1. MIT Press.`, note: `Freely available at incompleteideas.net/book/the-book.html — the standard text; Ch. 1 covers the credit assignment problem.` },
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Describes RL as judging the overall result of a series of activities rather than individual correctness.` }
            ]
          },
          example: {
            label: "Why the Losing Move Isn't the Last One",
            steps: [
              `<strong>Move 12:</strong> the system takes a pawn. Materially favourable, and nothing looks wrong.`,
              `<strong>Move 52:</strong> its position collapses. The immediate cause is a forced exchange it couldn't avoid.`,
              `<strong>The real error:</strong> move 12 opened the file that made move 52 unavoidable. Only the final outcome, propagated backwards, can assign blame correctly.`
            ]
          },
          quiz: {
            question: "What makes credit assignment difficult in reinforcement learning?",
            options: [
              "Rewards are too small to measure precisely",
              "The number of possible sequences exceeds available memory",
              "The outcome arrives after many decisions, and it isn't obvious which of them were responsible",
              "There is no way to record which decisions were made"
            ],
            correct: 2,
            explanation: "The outcome is known only at the end of a long sequence. Distributing responsibility for that outcome across the decisions that produced it — some of which looked fine at the time — is the central difficulty."
          }
        },
        {
          title: "Rewards Are Numbers, Not Verdicts",
          explain: {
            blocks: [
              {
                text: `Reinforcement learning is often introduced as "carrot and stick," which is memorable and slightly misleading. There's no approval or disapproval involved.<br><br>A <strong>reward</strong> is a number the environment returns after an action. Positive numbers indicate desirable outcomes, negative ones undesirable. That's the entire mechanism. <strong>The system is not told what was right — only what it scored.</strong>`
              },
              {
                heading: "Why the distinction matters",
                text: `Because a reward carries no information about <em>what</em> should have been done differently. Supervised learning says "the answer was 7"; reinforcement learning says "you scored 3." Working out which action would have scored better is the system's own problem.<br><br>This is why RL typically needs far more experience than supervised learning for comparable tasks. Each attempt returns much less usable information.`
              },
              {
                heading: "Designing the reward is the real work",
                text: `Since the reward defines what the system optimises, a badly specified reward produces a system that competently pursues the wrong thing.<br><br>The classic failures are all of this kind: a cleaning robot rewarded for collected dirt learns to tip dirt out and re-collect it; a boat-racing agent rewarded for points learns to circle a lagoon hitting bonus targets forever, never finishing the race. <strong>Neither malfunctioned.</strong> Both maximised exactly what they were told to maximise. Specifying the reward correctly is usually harder than the learning itself.`
              }
            ],
            analogy: `A bonus scheme rewarding calls handled per hour. Staff will handle more calls per hour. If that means ending calls before problems are solved, the scheme is working perfectly — and the business is getting worse. Nobody cheated; the target was simply the wrong one.`,
            sources: [
              { ref: `Sutton, R. S., &amp; Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em> (2nd ed.), Ch. 3. MIT Press.`, note: `Defines the reward hypothesis and the formal agent–environment framing.` },
              { ref: `Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., &amp; Mané, D. (2016). Concrete problems in AI safety. <em>arXiv:1606.06565</em>.`, note: `Catalogues reward specification failures including reward hacking and side effects.` }
            ]
          },
          example: {
            label: "The Same Task, Two Reward Definitions",
            steps: [
              `<strong>Reward = dirt collected.</strong> The robot discovers that tipping out collected dirt and re-vacuuming it scores repeatedly. Score maximised; floor unchanged.`,
              `<strong>Reward = time floor stays clean.</strong> Now re-tipping is directly penalised, because it makes the floor dirty.`,
              `<strong>The lesson:</strong> the algorithm was identical in both cases. Only the reward changed — and that alone decided whether the behaviour was useful.`
            ]
          },
          quiz: {
            question: "A warehouse robot rewarded for items moved per hour begins handling fragile goods roughly, causing breakages. What is the correct diagnosis?",
            options: [
              "The algorithm has a bug in its action selection",
              "The training data was insufficient for the task",
              "Reinforcement learning is unsuitable for physical robotics",
              "The reward was specified incorrectly — it captured throughput but not damage, so the system optimised exactly what it was told to"
            ],
            correct: 3,
            explanation: "The system did precisely what the reward defined. Behaviour that isn't penalised isn't avoided, so an unmeasured cost is invisible to the learner. This is a specification failure, not an algorithmic one."
          }
        },
        {
          title: "Exploring Versus Exploiting",
          explain: {
            blocks: [
              {
                text: `A reinforcement learner faces a tension present in no other form of ML. At every step it must choose between <strong>using what it already knows works</strong> and <strong>trying something unfamiliar that might work better</strong>.<br><br>Neither is right on its own. Always exploiting means never discovering anything better than your first tolerable strategy. Always exploring means never benefiting from what you learned.`
              },
              {
                heading: "Why this doesn't arise elsewhere",
                text: `Supervised and unsupervised learners consume a fixed dataset. Their behaviour doesn't affect what they get to see next.<br><br>A reinforcement learner's actions determine its own future experience. Choose one route and you learn nothing about the other. <strong>The learner is responsible for generating the data it learns from</strong> — which is why simulation matters so much in RL: exploration is cheap in simulation and expensive, sometimes dangerous, in reality.`
              },
              {
                heading: "How it's handled",
                text: `The usual approach is to explore heavily at first, when little is known and the cost of a bad choice is low, then shift gradually toward exploiting as confidence builds.<br><br>Note this is a strategy for managing the trade-off, not a solution to it. <strong>The tension is a permanent property of learning by acting</strong> — you cannot both take the known-good option and find out about the alternative.`
              }
            ],
            analogy: `Your usual restaurant is reliably good. Trying somewhere new might be better or might waste the evening — and you can only find out by giving up the reliable option that night. Never trying anywhere new guarantees you never find anything better.`,
            sources: [
              { ref: `Sutton, R. S., &amp; Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em> (2nd ed.), Ch. 2. MIT Press.`, note: `The exploration–exploitation trade-off, developed through the multi-armed bandit problem.` },
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Notes that RL still uses trial and error internally, trying many variations of each step.` }
            ]
          },
          example: {
            label: "A Delivery Router Learning Its City",
            steps: [
              `<strong>Early:</strong> routes are chosen with heavy randomness. Many are poor, but the map fills in quickly and a bad route costs little.`,
              `<strong>Middle:</strong> known-good routes are used most of the time, with occasional deliberate detours to test alternatives.`,
              `<strong>Risk if exploration stops entirely:</strong> a road closes and a better route opens. The router never tries it, because it stopped looking — its knowledge is now silently out of date.`
            ]
          },
          quiz: {
            question: "Why does the exploration–exploitation trade-off arise in reinforcement learning but not in supervised learning?",
            options: [
              "Supervised learning has more training data available",
              "A reinforcement learner's actions determine what experience it receives next, so choosing one option forgoes learning about the other",
              "Supervised models are trained once, whereas reinforcement models run continuously",
              "Exploration requires labels, which reinforcement learning lacks"
            ],
            correct: 1,
            explanation: "A supervised learner receives a fixed dataset regardless of its predictions. A reinforcement learner generates its own experience through its actions, so every choice is simultaneously a use of knowledge and a decision about what it will get to learn."
          }
        }
      ],
      examQuestions: [
        {
          question: "Reinforcement learning is best suited to problems where:",
          options: [
            "Every input has a known correct output",
            "The data has no labels and structure must be discovered",
            "Success depends on a sequence of decisions judged by their overall outcome",
            "Only a single decision is required"
          ],
          correct: 2
        },
        {
          question: "In chess, a move that immediately loses material but leads to victory would be:",
          options: [
            "Penalised, because material loss is a negative outcome",
            "Ignored, since only the final move is evaluated",
            "Treated as neutral, since it neither wins nor loses directly",
            "Reinforced, because reinforcement learning judges contribution to the overall result rather than short-term value"
          ],
          correct: 3
        },
        {
          question: "What is a reward in reinforcement learning?",
          options: [
            "A correction indicating what the system should have done",
            "A numerical signal from the environment indicating how desirable an outcome was",
            "A label attached to each training example in advance",
            "A confidence score expressing certainty in an action"
          ],
          correct: 1
        },
        {
          question: "A vacuuming robot rewarded for dirt collected learns to tip out dirt and re-collect it. This demonstrates:",
          options: [
            "That the reward was specified incorrectly, so the system optimised the wrong objective",
            "A bug in the learning algorithm's implementation",
            "That reinforcement learning cannot be applied to cleaning tasks",
            "That the robot needed more training episodes to converge"
          ],
          correct: 0
        },
        {
          question: "Why is simulation especially important in reinforcement learning?",
          options: [
            "Simulated environments contain more labelled data",
            "Simulation removes the need to define a reward",
            "Reinforcement learning cannot operate on real-world inputs",
            "Learning requires exploration, and exploring untested actions is cheap in simulation but costly or dangerous in reality"
          ],
          correct: 3
        }
      ]
    },

    // ────────────────────────────────────────────────
    {
      id: "choosing-an-approach",
      title: "Choosing an Approach",
      desc: "Which paradigm fits, what gets confused, and what ML can't do.",
      icon: "🧭",
      chunks: [
        {
          title: "Let the Feedback Decide",
          explain: {
            blocks: [
              {
                text: `The three paradigms are usually presented as a menu to choose from. In practice the choice is largely made for you — <strong>by what feedback your problem can supply.</strong><br><br>Ask one question first: <em>what tells this system whether it did well?</em> The answer selects the approach.`
              },
              {
                heading: "The decision in three branches",
                text: `<strong>Correct answers exist for individual examples</strong> → supervised. You have labels, or can obtain them.<br><br><strong>No correct answers, and structure is what you want</strong> → unsupervised. You're discovering groupings or exceptions, not reproducing known outputs.<br><br><strong>No per-step answer, but outcomes can be scored</strong> → reinforcement. Success is a sequence, judged at the end.`
              },
              {
                heading: "Where this framing is too neat",
                text: `Real problems often mix. A self-driving system uses supervised learning for perception (labelled images of pedestrians) and reinforcement-style methods for driving policy — different sub-problems with different available feedback.<br><br><strong>The paradigm is a property of the sub-problem, not of the project.</strong> Asking "is this a supervised or reinforcement project?" is usually the wrong question.`
              }
            ],
            analogy: `You don't choose a tool then look for a job. You look at the fixing in front of you — screw, nail, or bolt — and the fixing decides. And a single piece of furniture may need all three.`,
            sources: [
              { ref: `Russell, S., &amp; Norvig, P. (2021). <em>Artificial Intelligence: A Modern Approach</em> (4th ed.), Ch. 19. Pearson.`, note: `Organises the forms of learning by the feedback available to the learner.` },
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `States that each of the three designs works well for particular types of problem and data.` }
            ]
          },
          example: {
            label: "One System, Three Paradigms",
            steps: [
              `<strong>Perception — supervised:</strong> humans have labelled millions of images with pedestrians and vehicles. Per-example answers exist.`,
              `<strong>Passenger grouping — unsupervised:</strong> nobody knows what trip categories exist. The structure has to be discovered.`,
              `<strong>Driving policy — reinforcement:</strong> no label says whether one lane change was correct. The journey's safety and smoothness score the sequence.`
            ]
          },
          quiz: {
            question: "A hospital wants to group patients into previously unrecognised subtypes of a disease. Which approach fits, and why?",
            options: [
              "Reinforcement, because treatment happens as a sequence of decisions",
              "Unsupervised, because no list of subtypes exists to label against — discovering them is the task",
              "Supervised, because medical records contain diagnoses that serve as labels",
              "Supervised, because the number of subtypes can be specified in advance"
            ],
            correct: 1,
            explanation: "The subtypes are unknown, so no correct answers exist to train against. Existing diagnoses would only reproduce categories already in use — which is precisely what the hospital is trying to go beyond."
          }
        },
        {
          title: "Terms That Get Confused",
          explain: {
            blocks: [
              {
                text: `A few distinctions in this area are routinely muddled, including in published sources. Getting them right is cheap and worth doing.`
              },
              {
                heading: "Semi-supervised is not reinforcement learning",
                text: `Some texts describe reinforcement learning as "also known as semi-supervised." <strong>This is incorrect, and it's worth knowing because you will encounter it.</strong><br><br><strong>Semi-supervised learning</strong> trains on a mix of labelled and unlabelled data — a small labelled set alongside a large unlabelled one. It is a variant of supervised learning, used when labelling everything is too expensive.<br><br><strong>Reinforcement learning</strong> has no labels at all. It learns from rewards returned after actions. The two solve different problems by different means, and conflating them will cost you marks in any assessment that tests the distinction.`
              },
              {
                heading: "Three more worth keeping straight",
                text: `<strong>AI vs. ML vs. deep learning</strong> — nested, not synonymous. ML is one approach to AI; deep learning is one family of ML methods. Rule-based AI systems involve no learning at all.<br><br><strong>Prediction vs. causation</strong> — a model that predicts accurately has found correlations, not causes. It cannot tell you what would happen if you intervened.<br><br><strong>Training vs. inference</strong> — training adjusts parameters and is expensive; inference applies fixed parameters and is cheap. A "learning" system in production is usually not learning at that moment.`
              }
            ],
            analogy: `Confusing semi-supervised with reinforcement learning is like confusing a part-time job with commission-only work. One is the same arrangement with less of it; the other is a different arrangement entirely.`,
            sources: [
              { ref: `Chapelle, O., Schölkopf, B., &amp; Zien, A. (Eds.). (2006). <em>Semi-Supervised Learning</em>. MIT Press.`, note: `The reference definition: learning from labelled and unlabelled data together.` },
              { ref: `Sutton, R. S., &amp; Barto, A. G. (2018). <em>Reinforcement Learning: An Introduction</em> (2nd ed.), §1.1. MIT Press.`, note: `Explicitly distinguishes RL from both supervised and unsupervised learning.` },
              { ref: `Pearl, J., &amp; Mackenzie, D. (2018). <em>The Book of Why</em>. Basic Books.`, note: `On why prediction from observational data does not establish causation.` }
            ]
          },
          example: {
            label: "Same Task, Three Different Setups",
            steps: [
              `<strong>Supervised:</strong> 100,000 images, every one labelled by a human. Expensive, and the most informative per example.`,
              `<strong>Semi-supervised:</strong> 5,000 labelled images plus 95,000 unlabelled. The labelled set anchors the task; the unlabelled set reveals the shape of the data.`,
              `<strong>Reinforcement:</strong> no labelled images at all. A robot picks up objects and is scored on whether it succeeded — feedback comes from outcomes, not annotations.`
            ]
          },
          quiz: {
            question: "A team has 2,000 labelled scans and 80,000 unlabelled ones, and wants to use both. What is this called?",
            options: [
              "Reinforcement learning, because the labelled set acts as a reward signal",
              "Unsupervised learning, since most of the data is unlabelled",
              "Transfer learning, because knowledge moves between the two sets",
              "Semi-supervised learning — training on labelled and unlabelled data together"
            ],
            correct: 3,
            explanation: "Semi-supervised learning is defined by combining a small labelled set with a large unlabelled one. It involves no rewards, which is what separates it from reinforcement learning despite the two being conflated in some texts."
          }
        },
        {
          title: "What Machine Learning Cannot Do",
          explain: {
            blocks: [
              {
                text: `Knowing the limits matters as much as knowing the methods — partly for competence, and partly because overstated claims are the most common failure in how ML gets applied.`
              },
              {
                heading: "Four hard limits",
                text: `<strong>It cannot exceed its data.</strong> A model shown only one kind of example cannot handle another. Absent patterns cannot be learned.<br><br><strong>It cannot establish causation from observation alone.</strong> It finds what accompanies what. Whether intervening on one changes the other is a different question, requiring different evidence.<br><br><strong>It cannot recognise its own ignorance.</strong> Shown something outside its experience it produces a confident answer, because nothing in the mechanism represents unfamiliarity.<br><br><strong>It cannot supply the objective.</strong> What counts as success is chosen by people. The system optimises what it's given, including when what it's given is wrong.`
              },
              {
                heading: "The consequence",
                text: `Every one of these limits is a place where <strong>human judgement is required and cannot be delegated</strong> — choosing what to measure, deciding whether a finding is meaningful, defining success, and recognising when a system is operating outside what it knows.<br><br>Machine learning is a way of extracting patterns from data. It is not a way of deciding what matters. That decision stays where it was.`
              }
            ],
            analogy: `A very good telescope shows you what's there in extraordinary detail. It doesn't decide where to point, doesn't tell you which object is worth studying, and shows you nothing at all about the part of the sky you turned away from.`,
            sources: [
              { ref: `Pearl, J., &amp; Mackenzie, D. (2018). <em>The Book of Why</em>. Basic Books.`, note: `On the limits of correlation-based inference and what causal claims additionally require.` },
              { ref: `Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., &amp; Mané, D. (2016). Concrete problems in AI safety. <em>arXiv:1606.06565</em>.`, note: `On objective specification and behaviour under distributional shift.` },
              { ref: `Rahman, W. (2020). <em>AI and Machine Learning</em>, Ch. 3. SAGE Publications India.`, note: `Notes that a human can apply judgement or investigate further where an AI system cannot.` }
            ]
          },
          example: {
            label: "Four Failures, One Cause Each",
            steps: [
              `<strong>Beyond the data:</strong> a model trained on summer traffic meets its first snowfall and has no basis for handling it.`,
              `<strong>Correlation as cause:</strong> ice cream sales predict drownings accurately. Banning ice cream saves nobody — both follow from hot weather.`,
              `<strong>Unrecognised ignorance:</strong> a species classifier is shown a species absent from training and confidently names the closest thing it knows.`,
              `<strong>Wrong objective:</strong> a content system optimised for time-on-site learns that outrage is engaging. It hit its target exactly.`
            ]
          },
          quiz: {
            question: "A model finds that patients who receive a particular drug recover faster. What can be concluded?",
            options: [
              "The drug causes faster recovery, since the association was found in real patient data",
              "Nothing at all, since observational data has no value",
              "The association is real, but not that the drug caused it — healthier patients may have been likelier to receive it",
              "The drug causes faster recovery, provided the dataset is large enough"
            ],
            correct: 2,
            explanation: "The pattern is genuine but its cause is not established. If the drug was preferentially given to patients already likely to recover, the association appears without any causal effect. Sample size doesn't resolve this — only intervention or causal methods can."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which question most directly determines which learning paradigm a problem calls for?",
          options: [
            "How much data is available?",
            "What feedback can tell the system whether it did well?",
            "Which programming language will be used?",
            "How many parameters the model should have?"
          ],
          correct: 1
        },
        {
          question: "Semi-supervised learning is best described as:",
          options: [
            "Another name for reinforcement learning",
            "Learning that alternates between supervised and unsupervised phases",
            "Supervised learning with human oversight during deployment",
            "Training on a combination of labelled and unlabelled data"
          ],
          correct: 3
        },
        {
          question: "Which statement about AI, ML and deep learning is correct?",
          options: [
            "They are three names for the same field",
            "Deep learning contains ML, which contains AI",
            "ML is one approach to AI, and deep learning is one family of ML methods",
            "AI requires ML, since no AI system can work without learning"
          ],
          correct: 2
        },
        {
          question: "A model trained only on daytime images is deployed at night. What is the most likely outcome?",
          options: [
            "It will produce confident but unreliable outputs, having no way to signal that the input is unfamiliar",
            "It will refuse to produce output until retrained",
            "It will adapt automatically after enough night-time inputs",
            "Its accuracy will be unaffected, since it learned general features"
          ],
          correct: 0
        },
        {
          question: "Which of these is NOT something machine learning can do on its own?",
          options: [
            "Find patterns that hold across large datasets",
            "Group examples by similarity without being told the categories",
            "Improve its performance at a task through repeated exposure",
            "Determine which objective is the right one to optimise"
          ],
          correct: 3
        }
      ]
    }
  ]
};
