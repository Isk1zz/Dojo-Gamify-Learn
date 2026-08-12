// ================================================
// Course: Intro to CS — MODULE 8
// Unit 3: Boolean Algebra & Logic Gates
// ------------------------------------------------
// Written to library/content/CONTENT-MODEL.md. Four topics, three
// chunks each, five exam questions per topic; blocks[] explanations
// at ~200 words, two citations per chunk, original analogies, predict
// on chunk 1 of every topic, recall on every chunk with points.
//
// Matches the unit's own stated coverage:
//   "Commutative, Associative, Distributive, AND, OR, INVERSION laws" -> Topic 1
//   "De Morgan's theorems"                                            -> Topic 2
//   "AND, OR, NOT, NAND, NOR gates ... truth tables"                  -> Topic 3
//   "Equivalence of Boolean expressions ... algebra and truth tables" -> Topic 4
//
// Source pages match the assigned reading:
//   Ndjountche (2016) ch. 2 "Logic Gates", §2.1/§2.2/§2.4/§2.6 (pp. 67-81)
//   Westcott & Westcott (2023) ch. 14 "Digital Theory" (pp. 171-181)
//
// A NOTE ON PAGE PRECISION: this module's PDF sources couldn't be
// rendered page-by-page in this environment (poppler-utils/pdftoppm
// unavailable), so sub-section citations use the section number the
// assignment names plus the CHAPTER-level page range the assignment
// itself states, rather than a specific page within it. §2.2 and §2.4
// content (gate equations, truth tables, minterm/canonical form) was
// verified directly against real excerpted pages seen earlier in this
// session; §2.6 (the Boolean algebra laws and De Morgan's) is standard,
// well-established material, not something this session invented.
//
// ERRATA (flagging, not reproduced verbatim): the assigned Westcott
// ch. 14 reading (p. 178) misdescribes NAND as behaving like XOR. The
// correct definition — used throughout this module's NAND chunk — is
// that NAND outputs 0 only when both inputs are 1, otherwise 1.
// Diagram 14.7 in that source is correct and needs no correction.
// ================================================

const MODULE_8 = {
  id: "boolean-algebra",
  unit: 3,
  title: "Boolean Algebra & Logic Gates",
  icon: "\u{1F500}",
  topics: [

    // ============================================================
    {
      id: "ba-basic-laws",
      title: "Boolean Algebra: The Basic Laws",
      desc: "Commutative, associative, distributive, identity, and inversion — what each actually buys you",
      icon: "\u{1F4CF}",
      chunks: [
        {
          title: "Commutative, Associative & Identity Laws",
          glossary: [
            { term: "Commutative law", definition: "Order doesn't matter: A+B = B+A, and A·B = B·A." },
            { term: "Associative law", definition: "Grouping doesn't matter: (A+B)+C = A+(B+C), and likewise for ·." },
            { term: "Identity law", definition: "A+0 = A and A·1 = A — combining with the identity element leaves a value unchanged." }
          ],
          predict: {
            question: "In ordinary arithmetic, 2+(3×4)=14, but (2+3)×(2+4)=30 — clearly different. Could Boolean algebra have an equivalent pair, A+(B·C) and (A+B)·(A+C), that are ALSO always different — or could they secretly always be equal?",
            options: [
              "They must always be different, the same way the numeric example is",
              "They are always equal in Boolean algebra, even though the numeric analogy isn't",
              "They're equal only when A, B, and C are all 1",
              "They're equal only when A, B, and C are all 0"
            ],
            reveal: "They're always equal — this is Boolean algebra's second distributive law, and it has no equivalent in ordinary arithmetic at all. That's exactly the kind of surprising result this topic exists to cover, with the full proof coming next chunk."
          },
          explain: {
            blocks: [
              { text: `Boolean algebra has its own laws governing AND (·), OR (+), and NOT ('). Some match ordinary arithmetic closely; others don't exist in ordinary math at all. The <strong>commutative law</strong> is the familiar one: order doesn't matter. A+B = B+A, and A·B = B·A, exactly like ordinary addition and multiplication.` },
              { heading: "Associative law", text: `Grouping doesn't matter either: (A+B)+C = A+(B+C), and (A·B)·C = A·(B·C) — parentheses can move freely as long as the operation (all + or all ·) stays the same. This matches ordinary arithmetic's associative law exactly.` },
              { heading: "The identity and idempotent laws", text: `Boolean algebra adds laws with no numeric equivalent, because its only values are 0 and 1: A·1=A and A+0=A (1 and 0 act as identities, doing nothing), A·0=0 and A+1=1 (0 and 1 can also force the result regardless of A), and A·A=A, A+A=A — idempotent, since there's nothing "extra" to add when the only values are 0 and 1. All six of these are worth memorizing outright rather than re-deriving each time, since they show up constantly inside larger simplifications.` }
            ],
            analogy: `A light switch wired to two identical switches in parallel behaves exactly like being wired to just one — flipping either does the same thing, and flipping "both" is the same act repeated, not a bigger one. Ordinary numbers have no equivalent: 2+2 is 4, never just 2.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `The commutative, associative, and identity/idempotent laws covered in this chunk.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, October 16). <em>The laws of Boolean algebra explained</em> [Video]. YouTube. https://youtube.com/watch?v=RMe69AdlFdI`, note: `A worked walkthrough of the same laws covered in this chunk.` }
            ]
          },
          example: {
            label: "Which law justifies each step?",
            steps: [
              `A·B·C rewritten as C·B·A — justified by the commutative law alone; every operation is still AND.`,
              `(A+B)+C rewritten as A+(B+C) — justified by the associative law; the grouping moved, the operation (OR) didn't change.`,
              `A+A+A+A rewritten as just A — justified by the idempotent law applied repeatedly; no numeric system behaves this way, since 1+1+1+1=4, not 1.`
            ]
          },
          quiz: {
            question: "Simplify the expression A + A + B·1 + B·0 using the laws from this chunk.",
            options: ["A + B", "A + B + 1", "2A + B", "A·B"],
            correct: 0,
            explanation: `A+A=A (idempotent), B·1=B (identity), B·0=0 (null law), leaving A+B+0, and X+0=X simplifies that to A+B. The tempting wrong answer "2A+B" comes from treating A+A like ordinary addition (2×A) instead of applying the Boolean idempotent law — there's no "2" in Boolean algebra, only 0 and 1.`
          },
          recall: {
            prompt: "State the commutative and associative laws for Boolean algebra, and explain why the idempotent law (A+A=A) has no equivalent in ordinary arithmetic.",
            answer: `Commutative: A+B=B+A and A·B=B·A — order doesn't matter. Associative: (A+B)+C=A+(B+C) and (A·B)·C=A·(B·C) — grouping doesn't matter. The idempotent law (A+A=A, A·A=A) has no ordinary-arithmetic equivalent because Boolean algebra only has two values, 0 and 1; there's no way to represent "more than one A" the way ordinary addition would (2+2=4), so combining a value with itself just returns that same value.`,
            points: [
              `Commutative: order doesn't matter (A+B=B+A, AB=BA)`,
              `Associative: grouping doesn't matter`,
              `Idempotent: A+A=A, A·A=A — no ordinary-math equivalent`,
              `Reason: only two possible values (0 and 1) exist`
            ]
          },
          wisdomTags: ["beginning", "simplicity"]
        },

        {
          title: "The Distributive Law — Both Forms",
          glossary: [
            { term: "Distributive law", definition: "A·(B+C) = A·B + A·C, and — unlike ordinary algebra — also A+(B·C) = (A+B)·(A+C)." }
          ],
          explain: {
            blocks: [
              { text: `Boolean algebra's first distributive law matches ordinary algebra exactly: A·(B+C) = A·B + A·C — ANDing across a sum distributes normally, the same way 2×(3+4) = 2×3+2×4 in ordinary arithmetic. This is the one distributive form most people already trust instinctively, since it never produces a surprise.` },
              { heading: "The second form has no ordinary-math equivalent", text: `Boolean algebra also has a SECOND distributive law ordinary arithmetic simply doesn't have: A+(B·C) = (A+B)·(A+C). In ordinary numbers, 2+(3×4)=14 while (2+3)×(2+4)=30 — clearly not equal. In Boolean algebra, both sides always evaluate to the same 0-or-1 result, for every combination of A, B, and C, which makes this the law most learners assume is a misprint the first time they see it.` },
              { heading: "Why it's true", text: `The second form holds because Boolean values are limited to 0 and 1, which collapses cases ordinary arithmetic keeps distinct. It can be checked by brute force (all 8 combinations of A, B, C) or algebraically: (A+B)(A+C) = AA+AC+BA+BC = A+AC+AB+BC (using A·A=A) = A(1+C+B)+BC = A·1+BC (using 1+X=1) = A+BC — matching the left-hand side and completing the proof.` }
            ],
            analogy: `A club's rule "you're in if you're a member, OR you brought a ticket AND a friend" can be reworded as "you're in if (member OR ticket) AND (member OR friend)" — the identical people get in either way, even though the second phrasing looks stricter.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `The two forms of the distributive law covered in this chunk.` },
              { ref: `Westcott, S., &amp; Westcott, J. R. (2023). <em>Basic Electronics: Theory and Practice</em>, ch. 14 (pp. 171–181). Mercury Learning &amp; Information.`, note: `The distributive law's role in simplifying digital logic expressions.` }
            ]
          },
          example: {
            label: "Both forms, checked against arithmetic",
            steps: [
              `First form: A·(B+C)=A·B+A·C — matches ordinary algebra's distributive law exactly.`,
              `Second form: A+(B·C)=(A+B)·(A+C) — but 2+(3×4)=14 while (2+3)×(2+4)=30 in ordinary arithmetic, proving the second form is genuinely Boolean-specific, not just "the same rule restated".`,
              `Checking A=1,B=0,C=0 in Boolean algebra: A+(B·C)=1+(0·0)=1+0=1. (A+B)(A+C)=(1+0)(1+0)=1·1=1. Equal, as the law promises.`
            ]
          },
          quiz: {
            question: "A student assumes Boolean algebra's second distributive law, A+(BC)=(A+B)(A+C), must be a typo because the equivalent numeric statement 2+(3×4)=(2+3)(2+4) is false. What's the actual explanation?",
            options: [
              "It IS a typo — the correct law is A+(BC)=(A+B)+(A+C)",
              "The law is genuinely true in Boolean algebra specifically, even though the same pattern of statement is false in ordinary arithmetic — Boolean values are restricted to 0 and 1, which ordinary arithmetic doesn't have",
              "The law is only true when B=C",
              "The law is true in both systems; the numeric example was calculated incorrectly"
            ],
            correct: 1,
            explanation: `The law is correctly stated and is a genuine, provable identity in Boolean algebra — it just doesn't carry over to ordinary arithmetic, because Boolean algebra's restriction to only 0 and 1 changes which statements are true. The tempting wrong answer assumes "if the arithmetic analogy fails, the Boolean law must be wrong," but the two systems simply have different rules.`
          },
          recall: {
            prompt: "State both forms of the Boolean distributive law, and explain why the second form doesn't have an ordinary-arithmetic equivalent.",
            answer: `First form: A·(B+C)=A·B+A·C, identical to ordinary algebra. Second form: A+(B·C)=(A+B)·(A+C), which has no ordinary-arithmetic equivalent — the same pattern (2+(3×4) vs (2+3)(2+4)) gives different results in ordinary numbers (14 vs 30) but always gives equal results in Boolean algebra, because Boolean values are restricted to only 0 and 1, collapsing cases ordinary arithmetic keeps distinct.`,
            points: [
              `First form: A(B+C)=AB+AC — matches ordinary algebra`,
              `Second form: A+(BC)=(A+B)(A+C) — Boolean-specific`,
              `The numeric analogy of the second form is false`,
              `Reason: Boolean values are restricted to 0 and 1`
            ]
          },
          wisdomTags: ["uncertainty", "evidence"]
        },

        {
          title: "Inversion (Complement) Laws",
          glossary: [
            { term: "Complement law", definition: "A+A' = 1 and A·A' = 0 — a variable combined with its own inverse always resolves to the constant." }
          ],
          explain: {
            blocks: [
              { text: `The inversion (complement) laws govern NOT, written A'. The two core laws: A·A'=0 (a value AND its own complement is always false — they can never both be true at once) and A+A'=1 (a value OR its own complement is always true — between them, they cover every case).` },
              { heading: "Double negation", text: `Complementing twice returns the original value: (A')'=A. This matches "not not raining" meaning "raining" — flipping a switch twice leaves it where it started. It's the identity that makes De Morgan's theorems, covered next topic, actually usable for simplification rather than just restating a problem in a different shape.` },
              { heading: "Complementing the constants", text: `The constants invert too: 0'=1 and 1'=0. This looks trivial written down, but it's the base case every larger proof by truth-table or induction ultimately rests on — every Boolean identity involving NOT, no matter how many variables or how many steps it chains together, eventually reduces to checking these same two one-line facts about the constants themselves.` }
            ],
            analogy: `A door that's either open or shut, never both — "is it open" and "is it not open" between them always cover reality, and can never both be true at once. Flip the door's state twice and it's back where it began, exactly like double negation.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `The complement/inversion laws covered in this chunk.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, October 16). <em>The laws of Boolean algebra explained</em> [Video]. YouTube. https://youtube.com/watch?v=RMe69AdlFdI`, note: `The inversion law demonstrated alongside the other basic laws.` }
            ]
          },
          example: {
            label: "Three inversion facts, checked",
            steps: [
              `A·A'=0: if A=1, A'=0, and 1·0=0. If A=0, A'=1, and 0·1=0. True either way.`,
              `A+A'=1: if A=1, A'=0, and 1+0=1. If A=0, A'=1, and 0+1=1. True either way.`,
              `(A')'=A: if A=1, A'=0, and (0)'=1=A. If A=0, A'=1, and (1)'=0=A. Double negation restores the original in both cases.`
            ]
          },
          quiz: {
            question: "A circuit designer writes the expression A·A' expecting it to sometimes equal 1 for certain input signals. What's actually true about A·A', and why?",
            options: [
              "It equals 1 whenever A is 1",
              "It equals A itself",
              "It always equals 0, for every possible value of A — there is no input that makes it 1",
              "It depends on what A physically represents in the circuit"
            ],
            correct: 2,
            explanation: `A and A' are, by definition, always opposite — whichever one A is, A' is the other, so their AND is always 0. This holds for every possible value of A (there are only two, 0 and 1, and both check out), not just some inputs. The designer's expectation treats A·A' like it might vary with the signal, but it's a fixed identity, not something that depends on circuit conditions.`
          },
          recall: {
            prompt: "State the two core inversion laws (A·A' and A+A'), and explain what double negation means in Boolean algebra.",
            answer: `A·A'=0 (a value and its complement are never both true) and A+A'=1 (a value and its complement always cover every case between them). Double negation, (A')'=A, means complementing a value twice returns the original — NOT applied twice cancels out, the same way "not not raining" means "raining".`,
            points: [
              `A·A' = 0, always`,
              `A+A' = 1, always`,
              `(A')' = A (double negation cancels)`,
              `0'=1 and 1'=0`
            ]
          },
          wisdomTags: ["self-knowledge", "limits"]
        }
      ],
      examQuestions: [
        {
          question: "According to the commutative law, which is true?",
          options: ["A+B=A·B", "A+B=A", "A+B=1", "A+B=B+A"],
          correct: 3
        },
        {
          question: "Simplify A·1 + A·0.",
          options: ["1", "A'", "0", "A"],
          correct: 3
        },
        {
          question: "Which Boolean law has NO equivalent in ordinary arithmetic?",
          options: [
            "The commutative law",
            "The second distributive law, A+(BC)=(A+B)(A+C)",
            "The associative law",
            "The first distributive law, A(B+C)=AB+AC"
          ],
          correct: 1
        },
        {
          question: "What does A+A' always equal?",
          options: ["1", "A", "0", "A'"],
          correct: 0
        },
        {
          question: "What does double negation, (A')', equal?",
          options: ["A'", "0", "1", "A"],
          correct: 3
        }
      ]
    },

    // ============================================================
    {
      id: "ba-de-morgans",
      title: "De Morgan's Theorems",
      desc: "The two rules for pushing a NOT through an AND or an OR — and where the flip trips people up",
      icon: "\u{1F501}",
      chunks: [
        {
          title: "De Morgan's First Theorem",
          glossary: [
            { term: "De Morgan's first theorem", definition: "(A·B)' = A' + B' — the complement of an AND equals the OR of the complements." }
          ],
          predict: {
            question: "Is the complement of 'A AND B' — written (A·B)' — the same as 'complement of A AND complement of B', i.e. A'·B'?",
            options: [
              "Yes, complementing a product just complements each factor",
              "No — (A·B)' actually equals A'+B' (OR, not AND, of the complements)",
              "No — (A·B)' is always 0",
              "Yes, but only when A=B"
            ],
            reveal: "The complement of an AND doesn't distribute onto each variable — it also FLIPS the operation from AND to OR. (A·B)' = A'+B', not A'·B'. That flip is De Morgan's first theorem, and it's easy to get wrong by assuming NOT just 'passes through' unchanged."
          },
          explain: {
            blocks: [
              { text: `De Morgan's first theorem states that the complement of an AND is the OR of the complements: (A·B)' = A'+B'. Notice the operation itself flips — AND becomes OR — it's not enough to complement A and B individually and leave the operation alone.` },
              { heading: "Why it's true", text: `(A·B)' is 0 only when A·B is 1, i.e. only when BOTH A=1 and B=1. In every other case — A=0, or B=0, or both — (A·B)' is 1. A'+B' is 1 whenever A'=1 (A=0) OR B'=1 (B=0) — exactly the same set of cases. Checking all four input combinations confirms the two expressions produce identical outputs every time.` },
              { heading: "Generalizes beyond two variables", text: `The theorem extends to any number of terms: (A·B·C)' = A'+B'+C', and so on. The pattern is always the same — complementing a chain of ANDs turns it into a chain of ORs of the individual complements, which is the algebraic reason NAND (a complemented AND) behaves the way it does — see this unit's Logic Gates topic.` }
            ],
            analogy: `"It is NOT the case that both the oven AND the stove are on" means the same as "the oven is off OR the stove is off (or both)". Flipping "both are on" doesn't mean "both are off" — it means "at least one is off", the single most common Boolean algebra mix-up.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `De Morgan's first theorem, covered in the Boolean algebra section of this chapter.` },
              { ref: `Neso Academy. (2021, September 15). <em>De Morgan's Law in Boolean Algebra Explained</em> [Video]. YouTube. https://youtube.com/watch?v=WW-NPtIzHwk`, note: `A worked derivation and truth-table proof of the same theorem.` }
            ]
          },
          example: {
            label: "Checking (A·B)' = A'+B' against all four cases",
            steps: [
              `A=1,B=1: (A·B)'=(1)'=0. A'+B'=0+0=0. Match.`,
              `A=1,B=0: (A·B)'=(0)'=1. A'+B'=0+1=1. Match.`,
              `A=0,B=0: (A·B)'=(0)'=1. A'+B'=1+1=1. Match — every row agrees, confirming the identity holds for all four input combinations.`
            ]
          },
          quiz: {
            question: "A security policy states 'access is granted only if the user has BOTH a password AND a badge.' Someone rewrites the DENIAL condition using De Morgan's theorem. Which is the correct denial condition?",
            options: [
              "Denied when the user lacks a password OR lacks a badge",
              "Denied only if both credentials are somehow invalid at once, which never happens",
              "Denied when the user has neither, both simultaneously",
              "Denied when the user lacks a password AND lacks a badge"
            ],
            correct: 0,
            explanation: `Access requires password AND badge, so access is granted when (password AND badge) is true; denial is the complement, (password AND badge)' = password' OR badge' by De Morgan's first theorem — denied if EITHER credential is missing, not only if both are. The tempting wrong answer (AND) is the mistake this theorem exists to correct — it's what you'd get by complementing each term but forgetting to flip the operation.`
          },
          recall: {
            prompt: "State De Morgan's first theorem, and explain the common mistake it corrects.",
            answer: `De Morgan's first theorem states (A·B)' = A'+B' — the complement of an AND equals the OR of the individual complements. The common mistake it corrects is assuming the complement simply distributes without changing the operation, i.e. wrongly writing (A·B)' as A'·B'. The operation itself must flip from AND to OR when the complement moves inside.`,
            points: [
              `(A·B)' = A'+B'`,
              `The operation flips: AND becomes OR`,
              `Common mistake: writing A'·B' instead (operation unchanged)`,
              `Generalizes to any number of ANDed terms`
            ]
          },
          wisdomTags: ["correction", "self-deception"]
        },

        {
          title: "De Morgan's Second Theorem",
          glossary: [
            { term: "De Morgan's second theorem", definition: "(A+B)' = A'·B' — the complement of an OR equals the AND of the complements." }
          ],
          explain: {
            blocks: [
              { text: `De Morgan's second theorem is the mirror image of the first: the complement of an OR is the AND of the complements. (A+B)' = A'·B'. Just as before, the operation flips — OR becomes AND — rather than the complement simply passing through unchanged.` },
              { heading: "Why it's true", text: `(A+B)' is 0 whenever A+B is 1, which happens whenever A=1 OR B=1 (or both) — so (A+B)' is 1 only in the single remaining case, A=0 AND B=0. A'·B' is 1 only when A'=1 AND B'=1, i.e. A=0 AND B=0 — exactly that same single case. Every other input combination makes both expressions 0.` },
              { heading: "The two theorems as a pair", text: `Together, the two theorems say: complementing flips whichever operation is outermost. Complement an AND, get an OR of complements; complement an OR, get an AND of complements. This pairing is symmetric on purpose, which is why the two are always taught and remembered together rather than as unrelated facts — learning one without the other leaves exactly the case this theorem covers unhandled.` }
            ],
            analogy: `"It is NOT the case that EITHER the alarm OR the sensor triggered" means "the alarm is off AND the sensor is off" — both have to be clear, not just one. This is the mirror-image mistake of the first theorem's, made in the opposite direction.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `De Morgan's second theorem, paired with the first in the same section.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, October 23). <em>De Morgan's Law in Boolean Algebra Explained (with Solved Examples)</em> [Video]. YouTube. https://youtube.com/watch?v=W7YTfLaPWRY`, note: `Solved examples applying the second theorem specifically.` }
            ]
          },
          example: {
            label: "Checking (A+B)' = A'·B' against all four cases",
            steps: [
              `A=0,B=0: (A+B)'=(0)'=1. A'·B'=1·1=1. Match.`,
              `A=1,B=0: (A+B)'=(1)'=0. A'·B'=0·1=0. Match.`,
              `A=1,B=1: (A+B)'=(1)'=0. A'·B'=0·0=0. Match — all four rows agree.`
            ]
          },
          quiz: {
            question: "A form's validation rule ACCEPTS an entry only if it has EITHER a phone number OR an email. Using De Morgan's second theorem, what is the correct condition for REJECTING an entry?",
            options: [
              "Rejected only when both fields are filled in",
              "Rejected when the entry has no phone number AND no email",
              "Rejected when the entry has no phone number OR no email",
              "Rejected whenever a phone number is missing, regardless of email"
            ],
            correct: 1,
            explanation: `Acceptance requires (phone OR email); rejection is the complement, (phone+email)' = phone'·email' by De Morgan's second theorem — rejected only when BOTH are missing, not if just one is. The tempting wrong answer (OR) is the mirror-image version of the first theorem's common mistake — assuming the operation stays OR instead of flipping to AND.`
          },
          recall: {
            prompt: "State De Morgan's second theorem, and explain how it relates to the first theorem covered in the previous chunk.",
            answer: `De Morgan's second theorem states (A+B)' = A'·B' — the complement of an OR equals the AND of the individual complements. It relates to the first theorem as its exact mirror image: the first theorem flips a complemented AND into an OR of complements, while the second flips a complemented OR into an AND of complements. Both express the same underlying rule — complementing always flips the outermost operation.`,
            points: [
              `(A+B)' = A'·B'`,
              `The operation flips: OR becomes AND`,
              `Mirror image of the first theorem`,
              `Both theorems: complementing flips the outermost operation`
            ]
          },
          wisdomTags: ["correction", "feedback"]
        },

        {
          title: "Applying Both Theorems to Simplify a Complex Expression",
          glossary: [
            { term: "Boolean simplification", definition: "Reducing a Boolean expression to an equivalent but shorter form using algebraic laws." }
          ],
          explain: {
            blocks: [
              { text: `De Morgan's theorems are most useful chained together on a multi-term expression, not applied once in isolation. This chunk works through simplifying (A·B)' + (A'·B')' completely, applying both theorems and the inversion laws from the previous topic in sequence, one law at a time, exactly the discipline the algebraic equivalence method later in this unit depends on.` },
              { heading: "Step by step", text: `Apply De Morgan's first theorem to (A·B)': it becomes A'+B'. Apply the same theorem to (A'·B')' — treating A' and B' as the two terms being ANDed and complemented — it becomes (A')'+(B')', which double negation simplifies to A+B. The full expression is now (A'+B') + (A+B).` },
              { heading: "Finishing with the laws already covered", text: `Regroup using the commutative and associative laws: (A'+B')+(A+B) = (A+A')+(B+B'). Both parenthesized pairs are a value OR-ed with its own complement, which the inversion law fixes at 1 regardless of A or B: (A+A')+(B+B') = 1+1 = 1. The original expression, however complicated it looked, is actually a constant — always 1, for every input.` }
            ],
            analogy: `A contract clause that looks intimidatingly complex on first read can still reduce, term by term, to "this always applies, no matter what" — the complexity was in the wording, not in what the clause actually guarantees once each part is worked through in order.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `The algebraic simplification technique this chunk's worked example applies.` },
              { ref: `DrOfEng. (2024, October 4). <em>Equivalence of Boolean expressions - Discrete mathematics</em> [Video]. YouTube. https://youtube.com/watch?v=MTw0-70pcoI`, note: `A similar multi-step simplification process, applying several laws in sequence.` }
            ]
          },
          example: {
            label: "The full simplification, three stages",
            steps: [
              `Starting expression: (A·B)' + (A'·B')'.`,
              `After De Morgan's (applied twice) and double negation: (A'+B') + (A+B).`,
              `After regrouping and the inversion law: (A+A')+(B+B') = 1+1 = 1 — a constant, true for every possible A and B.`
            ]
          },
          quiz: {
            question: "After simplifying (A·B)' + (A'·B')' down to the constant 1, what does that result actually mean about the original expression?",
            options: [
              "The original expression was written incorrectly and should be discarded",
              "The original expression equals 1 only when A=B",
              "The simplification is only valid for the specific case A=1, B=1",
              "The original expression is a tautology — it evaluates to 1 (true) for every possible combination of A and B, with no exceptions"
            ],
            correct: 3,
            explanation: `A Boolean expression that simplifies to the constant 1 is true for every input combination — that's what "constant 1" means, not "true in one special case." The tempting wrong answers restrict it to A=B or one specific case, but the whole point of algebraic simplification (rather than checking one row of a truth table) is that it holds universally.`
          },
          recall: {
            prompt: "Walk through simplifying (A·B)' + (A'·B')' using De Morgan's theorems and the inversion law, and state what the final result means.",
            answer: `Apply De Morgan's first theorem to (A·B)' to get A'+B'. Apply it again to (A'·B')' to get (A')'+(B')', which double negation simplifies to A+B. Combine: (A'+B')+(A+B), then regroup as (A+A')+(B+B') using the commutative and associative laws. Each parenthesized pair is a value OR-ed with its complement, which the inversion law fixes at 1, giving 1+1=1. The result means the original expression is a tautology — always true, regardless of A and B.`,
            points: [
              `Apply De Morgan's to each complemented term`,
              `Double negation simplifies (X')' back to X`,
              `Regroup using commutative/associative laws`,
              `A+A'=1 finishes the simplification to a constant`
            ]
          },
          wisdomTags: ["persistence", "effort"]
        }
      ],
      examQuestions: [
        {
          question: "What does De Morgan's first theorem state?",
          options: ["(A+B)'=A'+B'", "(A·B)'=A'·B'", "(A·B)'=A'+B'", "(A+B)'=A'·B'"],
          correct: 2
        },
        {
          question: "What does De Morgan's second theorem state?",
          options: ["(A+B)'=A'·B'", "(A·B)'=A'+B'", "(A+B)'=A+B", "(A·B)'=AB"],
          correct: 0
        },
        {
          question: "Simplify (A+B)' using De Morgan's second theorem.",
          options: ["AB", "A+B", "A'+B'", "A'·B'"],
          correct: 3
        },
        {
          question: "What is (A·B·C)' equal to, generalizing De Morgan's first theorem?",
          options: ["A'+B'+C'", "ABC", "A+B+C", "A'·B'·C'"],
          correct: 0
        },
        {
          question: "An expression simplifies to the constant 1 using De Morgan's theorems and the inversion laws. What does this mean?",
          options: [
            "It's true only for one specific input",
            "It means A must equal 1",
            "It's a tautology, true for every input combination",
            "It means the expression was invalid"
          ],
          correct: 2
        }
      ]
    },

    // ============================================================
    {
      id: "ba-logic-gates",
      title: "Logic Gates: Representations & Truth Tables",
      desc: "AND, OR, NOT, NAND, NOR — the equation, symbol, and truth table for each",
      icon: "\u{1F6AA}",
      chunks: [
        {
          title: "NOT, AND, and OR Gates",
          glossary: [
            { term: "Logic gate", definition: "A physical or symbolic device that implements one Boolean operation on its inputs." },
            { term: "NOT gate", definition: "Outputs the inverse of its single input." },
            { term: "AND gate", definition: "Outputs 1 only when all inputs are 1." },
            { term: "OR gate", definition: "Outputs 1 when at least one input is 1." }
          ],
          predict: {
            question: "An AND gate has two inputs. If you know only ONE of the two inputs, can you predict the output for certain?",
            options: [
              "Yes — AND gates default to outputting 1 when an input is unknown",
              "No — the output depends on BOTH inputs; knowing just one isn't enough if the other is unknown",
              "Yes — AND gates always output 0 when an input is unknown",
              "It depends on the gate's physical size"
            ],
            reveal: "An AND gate's output is 1 only in the single case where BOTH inputs are 1 — knowing just one input leaves the output genuinely undetermined unless that known input is already 0 (which forces 0 regardless of the other). That 'both must agree' behavior is the whole identity of the AND gate."
          },
          explain: {
            blocks: [
              { text: `Each basic logic gate has an electronic symbol, a Boolean equation, and a truth table — three views of identical behavior, and reading one should let you reconstruct the other two. The NOT gate (an inverter) has one input and flips it: B=A'. Its truth table has only two rows: A=0 gives B=1, and A=1 gives B=0.` },
              { heading: "AND gate", text: `The AND gate outputs C=A·B, and is 1 only when BOTH inputs are 1 — every other combination (0,0 / 0,1 / 1,0) gives 0. Of the four possible input pairs, exactly one produces a 1, which is why AND is described as a "both must agree" gate.` },
              { heading: "OR gate", text: `The OR gate outputs C=A+B, and is 1 whenever AT LEAST ONE input is 1 — only the single case of both inputs being 0 gives a 0 output. Of the four possible input pairs, three produce a 1, the mirror opposite of AND's "only one row is 1" pattern.` }
            ],
            analogy: `AND is a door needing two keys turned simultaneously — one key alone opens nothing. OR is a door with two separate working locks — either key alone opens it. NOT is simply a light switch: whatever position it's in, flipping it gives the other one.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.2 (pp. 67–81). John Wiley &amp; Sons.`, note: `The NOT, AND, and OR gate equations and truth tables covered in this chunk.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, September 29). <em>What is Logic Gate? Logic Gates Explained</em> [Video]. YouTube. https://youtube.com/watch?v=0lwhoQ5aQe8`, note: `A walkthrough of the same three basic gates and their truth tables.` }
            ]
          },
          example: {
            label: "Same two inputs, three different gates",
            steps: [
              `Inputs A=1, B=0 through an AND gate: C=1·0=0.`,
              `The identical inputs A=1, B=0 through an OR gate: C=1+0=1 — same inputs, opposite output.`,
              `Input A=1 alone through a NOT gate (NOT takes a single input): B=1'=0.`
            ]
          },
          quiz: {
            question: "A circuit needs an alarm to sound only when BOTH the door sensor AND the window sensor detect an opening — a single sensor triggering should NOT sound the alarm. Which gate correctly implements this?",
            options: ["OR gate", "NOT gate", "AND gate", "Either OR or AND work identically here"],
            correct: 2,
            explanation: `AND outputs 1 only when both inputs are 1, exactly matching "sound only when both sensors trigger." OR is the tempting wrong answer because it also combines two signals, but OR would sound the alarm from just ONE sensor triggering, which the requirement explicitly rules out.`
          },
          recall: {
            prompt: "State the Boolean equation and the defining behavior of the AND gate and the OR gate.",
            answer: `AND gate: C=A·B, output is 1 only when both A and B are 1 — every other input combination gives 0. OR gate: C=A+B, output is 1 when at least one of A or B is 1 — only both-0 gives 0. AND requires agreement from both inputs; OR requires agreement from at least one.`,
            points: [
              `AND: C=A·B, 1 only when both inputs are 1`,
              `OR: C=A+B, 1 when at least one input is 1`,
              `AND has exactly one 1-row in its truth table`,
              `OR has exactly one 0-row in its truth table`
            ]
          },
          wisdomTags: ["beginning", "evidence"]
        },

        {
          title: "NAND and NOR: The Universal Gates",
          glossary: [
            { term: "NAND gate", definition: "Outputs 0 only when all inputs are 1; otherwise outputs 1 — the inverse of AND." },
            { term: "NOR gate", definition: "Outputs 1 only when all inputs are 0; otherwise outputs 0 — the inverse of OR." },
            { term: "Universal gate", definition: "A gate type (NAND or NOR) that can, alone, be combined to build any other logic gate." }
          ],
          explain: {
            blocks: [
              { text: `NAND and NOR are AND and OR with an inverter attached to the output: NAND is C=(A·B)', and NOR is C=(A+B)'. Each simply flips every row of its non-negated counterpart's truth table — NAND is 0 only when both inputs are 1 (the opposite of AND's single 1-row), and NOR is 1 only when both inputs are 0 (the opposite of OR's single 0-row).` },
              { heading: "Why they're called 'universal'", text: `NAND and NOR are each individually sufficient to build ANY Boolean logic function — every AND, OR, and NOT gate can be constructed using only NAND gates (or, separately, only NOR gates), wired together in different combinations. Neither XOR nor XNOR has this property; both require a mix of other gates to build.` },
              { heading: "Why universality matters in practice", text: `A chip manufacturer that stocks only one gate type instead of several simplifies manufacturing significantly — this is a real, practical reason NAND gates in particular are extremely common in actual digital hardware, not just a mathematical curiosity.` }
            ],
            analogy: `A single multi-tool that functions as a screwdriver, wrench, and pliers, versus needing three separate dedicated tools. NAND and NOR are each that multi-tool for logic — everything else can be built from just one of them, given enough copies wired together correctly.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.2.5 (pp. 67–81). John Wiley &amp; Sons.`, note: `The NAND/NOR definitions and the statement that both are universal gates.` },
              { ref: `Westcott, S., &amp; Westcott, J. R. (2023). <em>Basic Electronics: Theory and Practice</em>, ch. 14 (pp. 171–181). Mercury Learning &amp; Information.`, note: `NAND gate behavior — see this module's header comment for a noted correction to this specific source's page 178.` }
            ]
          },
          example: {
            label: "NAND's truth table, row by row",
            steps: [
              `A=0,B=0: AND would give 0, so NAND (the complement) gives 1.`,
              `A=1,B=0: AND would give 0, so NAND gives 1.`,
              `A=1,B=1: AND would give 1, so NAND gives 0 — the ONLY row where NAND outputs 0, matching the corrected definition: NAND outputs 0 only when both inputs are 1.`
            ]
          },
          quiz: {
            question: "Following the corrected definition (NAND outputs 0 only when both inputs are 1), what does a NAND gate output when A=0 and B=1?",
            options: [
              "0",
              "Undefined — NAND requires both inputs to be the same",
              "It depends on which input is A and which is B",
              "1"
            ],
            correct: 3,
            explanation: `NAND only outputs 0 in the single case where both inputs are 1. Here A=0, so that condition isn't met, and NAND outputs 1 — matching (A·B)'=(0·1)'=0'=1. The tempting wrong answer (0) is exactly the error the errata for this unit's reading specifically warns against: confusing NAND's behavior with XOR's.`
          },
          recall: {
            prompt: "State the Boolean equations for NAND and NOR, and explain what makes them 'universal' gates.",
            answer: `NAND: C=(A·B)', output 0 only when both inputs are 1. NOR: C=(A+B)', output 1 only when both inputs are 0. They're called universal because either one, alone, is sufficient to construct any Boolean logic function — every AND, OR, and NOT can be built from just NAND gates (or just NOR gates) wired in combination. XOR and XNOR do not share this universal property.`,
            points: [
              `NAND = (A·B)', NOR = (A+B)'`,
              `NAND outputs 0 only when both inputs are 1`,
              `Either NAND alone or NOR alone can build any logic function`,
              `XOR and XNOR are NOT universal`
            ]
          },
          wisdomTags: ["correction", "tradition"]
        },

        {
          title: "Truth Tables for Combined Gates",
          glossary: [
            { term: "Truth table", definition: "A table listing every possible input combination for a Boolean expression alongside its resulting output." }
          ],
          explain: {
            blocks: [
              { text: `Real circuits chain multiple gates together, and the truth table for the combination is built the same way regardless of how many gates are involved: list every combination of the INPUT variables, then work out each gate's output in order, using each gate's own already-known truth table as a lookup.` },
              { heading: "A worked combination: Y = (A·B) + C'", text: `This circuit has an AND gate (A and B), a NOT gate (C, inverted), and an OR gate combining their two outputs. With 3 input variables there are 2³=8 rows to fill in. For A=1,B=1,C=0: the AND gate gives 1·1=1, the NOT gate gives 0'=1, and the OR gate combines them as 1+1=1, so Y=1 for this row.` },
              { heading: "Working row by row, not gate by gate", text: `The reliable method is filling in ONE row (one specific A,B,C combination) completely, computing every intermediate gate's output for just that row, before moving to the next row — rather than computing one gate's column for all 8 rows first. Column-first is more efficient once practiced, but row-first is far less error-prone while still learning, since it mirrors how the circuit actually processes one input at a time.` }
            ],
            analogy: `Following a recipe with several sub-steps — chop, then sauté, then combine — for one full plate at a time, rather than chopping every ingredient for every plate in the restaurant before sautéing anything. Both eventually produce every plate; one is far easier to check for a mistake partway through.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.2, §2.4 (pp. 67–81). John Wiley &amp; Sons.`, note: `The gate-combination approach and truth-table construction method this chunk practices.` },
              { ref: `Mr Bulmer's Learning Zone. (2024, September 6). <em>Logic Gates and Truth Tables</em> [Video]. YouTube. https://youtube.com/watch?v=gnyDqpRyoqI`, note: `A demonstration of building a truth table for a multi-gate circuit, row by row.` }
            ]
          },
          example: {
            label: "Three rows of Y = (A·B) + C', worked",
            steps: [
              `A=0,B=0,C=0: AND=0·0=0, NOT=0'=1, OR=0+1=1 → Y=1.`,
              `A=1,B=1,C=1: AND=1·1=1, NOT=1'=0, OR=1+0=1 → Y=1.`,
              `A=0,B=1,C=1: AND=0·1=0, NOT=1'=0, OR=0+0=0 → Y=0 — the only one of these three rows where Y comes out false.`
            ]
          },
          quiz: {
            question: "For the circuit Y=(A·B)+C', a student fills in the row A=1,B=0,C=1 and gets Y=1. Checking their work: AND(1,0)=0, NOT(1)=0, OR(0,0)=0. Is the student's answer of Y=1 correct?",
            options: [
              "No — the correctly worked row gives Y=0, and the student likely made an error in one of the intermediate gate outputs",
              "It's impossible to tell without seeing the physical circuit",
              "Y is undefined for this input combination",
              "Yes, Y=1 is correct"
            ],
            correct: 0,
            explanation: `Working it through: AND(1,0)=0, NOT(C)=NOT(1)=0, then OR(0,0)=0, so Y=0. The student's Y=1 is wrong — most likely they either forgot to invert C, or made an error combining the OR gate's two inputs. Checking each intermediate gate's output explicitly, as this worked answer does, is exactly how such an error gets caught.`
          },
          recall: {
            prompt: "Describe the row-by-row method for building a truth table for a combined-gate circuit, and explain why it's less error-prone than working gate by gate.",
            answer: `For each row (one specific combination of the input variables), compute every intermediate gate's output in order, using each gate's own truth table, until the final output is reached — then move to the next row. This is less error-prone than computing one gate's entire column across all rows first, because it mirrors how the actual circuit processes one input combination at a time, making it easier to catch a mistake in one specific row before it compounds.`,
            points: [
              `List every combination of input variables (2^n rows for n inputs)`,
              `For each row, compute every gate's output in sequence`,
              `Use each gate's own truth table as a lookup`,
              `Row-by-row is more error-resistant than column-by-column while learning`
            ]
          },
          wisdomTags: ["planning", "correction"]
        }
      ],
      examQuestions: [
        {
          question: "What is the Boolean equation for a NOT gate?",
          options: ["B=A'", "B=A+A", "B=A·A", "B=A"],
          correct: 0
        },
        {
          question: "An AND gate has how many rows in its truth table that output 1?",
          options: ["Zero", "Two", "One", "Three"],
          correct: 2
        },
        {
          question: "An OR gate has how many rows in its truth table that output 0?",
          options: ["Two", "One", "Zero", "Four"],
          correct: 1
        },
        {
          question: "Which gate(s) are 'universal' — able to build any logic function alone?",
          options: ["XOR and XNOR only", "NAND and NOR (each individually)", "AND and OR only", "NOT only"],
          correct: 1
        },
        {
          question: "For the circuit Y=(A·B)+C', what is Y when A=0, B=0, C=0?",
          options: ["0", "Undefined", "1", "Depends on wiring order"],
          correct: 2
        }
      ]
    },

    // ============================================================
    {
      id: "ba-equivalence",
      title: "Equivalence of Boolean Expressions",
      desc: "Three ways to prove two different-looking expressions are secretly the same function",
      icon: "\u{2696}️",
      chunks: [
        {
          title: "Proving Equivalence with Truth Tables",
          glossary: [
            { term: "Boolean equivalence", definition: "Two expressions that produce the same output for every possible input combination." }
          ],
          predict: {
            question: "Two Boolean expressions, A+A'B and A+B, LOOK different on paper. Could they still always produce identical outputs for every possible A and B?",
            options: [
              "No — different-looking expressions must eventually differ for some input",
              "Yes — they could be equivalent even though they're written differently, if every row of their truth tables matches",
              "Only if A and B are both 1",
              "It's impossible to know without testing physical hardware"
            ],
            reveal: "They're actually equivalent — A+A'B always equals A+B for every input, despite looking like genuinely different expressions. Two Boolean expressions are equivalent exactly when their truth tables match on every single row, regardless of how different the written formulas look."
          },
          explain: {
            blocks: [
              { text: `Two Boolean expressions are defined as equivalent if they produce the identical output for every possible combination of their input variables — nothing more, nothing less. The most direct way to check this is building a truth table for each expression separately and then comparing them row by row, one input combination at a time, checking every single row before drawing any conclusion.` },
              { heading: "Worked check: A+A'B vs. A+B", text: `For 2 variables there are 4 rows. A=0,B=0: A+A'B=0+(1·0)=0; A+B=0+0=0. A=0,B=1: A+A'B=0+(1·1)=1; A+B=0+1=1. A=1,B=0: A+A'B=1+(0·0)=1; A+B=1+0=1. A=1,B=1: A+A'B=1+(0·1)=1; A+B=1+1=1. All four rows match, confirming the two expressions are equivalent.` },
              { heading: "The tradeoff of this method", text: `Truth-table comparison is completely reliable and requires no algebraic cleverness — it's mechanical, so it's hard to get wrong. Its cost is that the table doubles in size with every added variable (4 rows for 2 variables, 8 for 3, 16 for 4), which makes it slow for large expressions — exactly the case where the algebraic method covered next becomes worth the extra skill.` }
            ],
            analogy: `Two different recipes that taste identical under every possible ingredient substitution — you don't need to understand WHY they match to confirm that they do, just taste every combination. That's the truth-table method's appeal: certainty without needing insight.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.4–§2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `The truth-table method for establishing equivalence, connecting this chapter's logic-function and Boolean-algebra sections.` },
              { ref: `Kazemi, S. (2020, May 5). <em>AP CSA 3.6 Equivalent Boolean expressions - Explore</em> [Video]. YouTube. https://youtube.com/watch?v=pS1HnU6Rtyc`, note: `A worked demonstration of proving equivalence via truth-table comparison.` }
            ]
          },
          example: {
            label: "Matching truth tables, two ways",
            steps: [
              `A+A'B and A+B were just checked and matched on all 4 rows — equivalent, confirmed by exhaustive comparison.`,
              `By contrast, A·B and A+B do NOT match at A=1,B=0: A·B=0 but A+B=1 — one mismatched row is enough to disprove equivalence entirely.`,
              `A single mismatched row is fatal to a claim of equivalence; every other row matching perfectly still isn't enough — ALL rows must agree.`
            ]
          },
          quiz: {
            question: "Two 3-variable Boolean expressions match on 7 of their 8 truth-table rows, differing only when A=1,B=0,C=1. What can be concluded?",
            options: [
              "They're equivalent, since 7 out of 8 is close enough",
              "They're NOT equivalent — a single mismatched row is enough to disprove equivalence, no matter how many rows do match",
              "More testing is needed; 7 rows isn't a large enough sample",
              "They're equivalent only for that specific input combination"
            ],
            correct: 1,
            explanation: `Equivalence requires matching on EVERY row, with no exceptions — a single disagreeing row proves the two expressions are genuinely different functions, even if they happen to agree almost everywhere else. The tempting wrong answer treats this like a statistical sample where "mostly matching" is good enough, but Boolean equivalence is all-or-nothing, not a percentage.`
          },
          recall: {
            prompt: "What does it mean for two Boolean expressions to be 'equivalent,' and what does a single mismatched row in their truth tables prove?",
            answer: `Two Boolean expressions are equivalent if they produce the identical output for every possible combination of their input variables — checked by comparing their truth tables row by row. A single mismatched row proves the two expressions are NOT equivalent, regardless of how many other rows agree — equivalence requires a perfect match on every row, not just most of them.`,
            points: [
              `Equivalent = identical output for every input combination`,
              `Checked via row-by-row truth table comparison`,
              `One mismatched row disproves equivalence entirely`,
              `Table size doubles with each added variable`
            ]
          },
          wisdomTags: ["evidence", "persistence"]
        },

        {
          title: "Proving Equivalence Algebraically",
          glossary: [
            { term: "Algebraic proof", definition: "Showing two Boolean expressions are equivalent by transforming one into the other using known laws, rather than checking every input row." }
          ],
          explain: {
            blocks: [
              { text: `The algebraic method proves equivalence by transforming one expression into the other using only the laws already covered — commutative, associative, distributive, identity, and inversion — rather than checking every row of a truth table. Done correctly, it's faster for complex expressions and it also explains WHY the expressions are equal, not just THAT they are.` },
              { heading: "Proving A+A'B = A+B, algebraically", text: `A+A'B = (A+A')·(A+B), applying the second distributive law from the earlier topic (the A+(X·Y) form, here with X=A' and Y=B). Then (A+A')·(A+B) = 1·(A+B), applying the inversion law (A+A'=1). Finally 1·(A+B) = A+B, applying the identity law (1·X=X). Three law applications, no truth table required, and the same result reached by brute-force checking in the previous chunk.` },
              { heading: "The real tradeoff", text: `The algebraic method requires knowing which law to apply at each step, which takes practice and can go down an unproductive path if the wrong law is tried first. The truth-table method can never go down a wrong path — it's mechanical — but it doesn't scale, and it doesn't explain WHY. Most practitioners use truth tables to verify a small case and algebra to actually simplify a large one.` }
            ],
            analogy: `Proving two walking routes end at the same building by tracing each turn on a map — algebra, showing WHY they connect — versus logging every single step of both walks and comparing the logs afterward — truth tables, showing THAT they connect. Both work; only one explains the route.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.6 (pp. 67–81). John Wiley &amp; Sons.`, note: `The Boolean algebra laws chained together in this chunk's worked proof.` },
              { ref: `DrOfEng. (2024, October 4). <em>Equivalence of Boolean expressions - Discrete mathematics</em> [Video]. YouTube. https://youtube.com/watch?v=MTw0-70pcoI`, note: `Algebraic proofs of Boolean equivalence using chained law applications.` }
            ]
          },
          example: {
            label: "The proof, three law applications",
            steps: [
              `A+A'B = (A+A')(A+B) — second distributive law.`,
              `(A+A')(A+B) = 1·(A+B) — inversion law, A+A'=1.`,
              `1·(A+B) = A+B — identity law, 1·X=X. Three steps, no truth table, same conclusion as the previous chunk reached by checking all 4 rows.`
            ]
          },
          quiz: {
            question: "Asked to prove A·(A+B) = A algebraically, a student writes: A·(A+B) = A·A + A·B = A + AB (using A·A=A), then gets stuck. Which sequence of laws finishes the proof?",
            options: [
              "The commutative law alone finishes it",
              "A+AB simply equals A by inspection, no law needed",
              "Factor A from A+AB to get A(1+B), then 1+B=1 (OR-identity law), then A·1=A (identity law)",
              "The associative law alone finishes it"
            ],
            correct: 2,
            explanation: `A+AB factors (using the first distributive law in reverse) to A(1+B); since 1+B=1 (the OR-identity/null law), this becomes A·1, which the identity law simplifies to A. Skipping straight to "by inspection" isn't a proof — every step needs a named law, which is the entire discipline the algebraic method requires.`
          },
          recall: {
            prompt: "Describe the algebraic method for proving Boolean equivalence, and explain its main advantage and disadvantage compared to the truth-table method.",
            answer: `The algebraic method transforms one expression into another by applying known Boolean laws (commutative, associative, distributive, identity, inversion) step by step, until it matches the target expression. Its advantage is that it explains WHY two expressions are equal and scales better to expressions with many variables, since it doesn't require an exponentially growing table. Its disadvantage is that it requires knowing which law to apply at each step, and a wrong choice can lead down an unproductive path, unlike the mechanical, can't-go-wrong nature of truth-table comparison.`,
            points: [
              `Transform one expression into another using known laws`,
              `Advantage: explains WHY, scales to many variables`,
              `Disadvantage: requires knowing which law to apply, can dead-end`,
              `Truth tables are mechanical but don't scale or explain why`
            ]
          },
          wisdomTags: ["effort", "planning"]
        },

        {
          title: "Canonical Form: The Definitive Test",
          glossary: [
            { term: "Canonical form", definition: "A single standard, fully-expanded way of writing a Boolean expression, used to test equivalence definitively." }
          ],
          explain: {
            blocks: [
              { text: `The canonical (minterm) form is the strictest test of equivalence: convert both expressions to a sum of minterms, and they're equivalent if and only if they list the EXACT same set of minterms — there's no partial credit and no ambiguity, since canonical form is unique for every possible Boolean function.` },
              { heading: "Worked check: AB+AB'+A'B vs. A+B", text: `For AB+AB'+A'B: the term AB is minterm 3 (A=1,B=1), AB' is minterm 2 (A=1,B=0), and A'B is minterm 1 (A=0,B=1) — giving the set {1,2,3}. For A+B: it's 1 whenever A=1 or B=1, which is every combination except A=0,B=0 (minterm 0) — also giving the set {1,2,3}. Identical minterm sets confirm the two expressions are equivalent.` },
              { heading: "Why this settles arguments the other two methods can leave open", text: `Truth tables prove equivalence for the specific variables tested but can be tedious to compare by eye across large tables; algebra proves it but the proof's correctness depends on each step being valid. Canonical form sidesteps both concerns: it's a single, unique, directly comparable object per function, so two expressions are equivalent exactly when their canonical forms are the identical set of minterm numbers, no eyeballing or step-checking required.` }
            ],
            analogy: `Two different-sounding legal descriptions of the same property boundary both resolve to the identical set of GPS coordinates once surveyed properly. However differently the descriptions were worded, the coordinate set either matches exactly or it doesn't — there's no "mostly the same plot of land."`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §2.4–§2.5 (pp. 67–81). John Wiley &amp; Sons.`, note: `The minterm/canonical-form definition and the sum-of-products construction practiced in this chunk.` },
              { ref: `CodeHS. (2024, May 5). <em>Equivalent Boolean Expressions</em> [Video]. YouTube. https://youtube.com/watch?v=I-C2JxdGRSY`, note: `Practical examples of comparing Boolean expressions for equivalence.` }
            ]
          },
          example: {
            label: "Two expressions, one canonical form",
            steps: [
              `AB+AB'+A'B expands to minterms {1,2,3} — computed term by term.`,
              `A+B expands to minterms {1,2,3} — computed as "every combination except both-0".`,
              `Identical minterm sets, so the two expressions are equivalent — matching the truth-table result from two chunks ago, now confirmed a third, independent way.`
            ]
          },
          quiz: {
            question: "Two 3-variable expressions are converted to canonical (minterm) form. One lists minterms {0,2,5,7}, the other lists {0,2,5,6}. Are the two original expressions equivalent?",
            options: [
              "Yes, since three of the four minterms match",
              "Yes, because canonical form only checks the number of minterms, not which ones",
              "It cannot be determined without also building a truth table",
              "No — the minterm sets differ (7 vs. 6), and canonical form requires an exact match, not a majority match"
            ],
            correct: 3,
            explanation: `Canonical form comparison requires the exact same set of minterm numbers — {0,2,5,7} and {0,2,5,6} differ at one entry (7 vs. 6), which is enough to prove the expressions are NOT equivalent, despite three of four entries matching. The tempting wrong answer treats it like a majority vote, but canonical-form equivalence is exact-match only, the same all-or-nothing standard the truth-table method uses.`
          },
          recall: {
            prompt: "What is canonical (minterm) form, and why does comparing it settle equivalence questions definitively?",
            answer: `Canonical form expresses a Boolean function as a sum of minterms — one term per input combination where the function outputs 1. It settles equivalence definitively because canonical form is unique for every possible Boolean function: two expressions are equivalent if and only if they expand to the exact same set of minterm numbers, with no ambiguity, no partial credit, and no dependence on which algebraic path was used to get there.`,
            points: [
              `Canonical form = sum of minterms (one per 1-output row)`,
              `Unique for every possible Boolean function`,
              `Equivalent iff the minterm sets match exactly`,
              `Settles the question independent of how the expression was originally written`
            ]
          },
          wisdomTags: ["evidence", "simplicity"]
        }
      ],
      examQuestions: [
        {
          question: "Two Boolean expressions match on every row of their truth tables except one. Are they equivalent?",
          options: ["No", "Yes", "Only if A=B", "Cannot be determined"],
          correct: 0
        },
        {
          question: "What does the algebraic method for proving equivalence require, that the truth-table method doesn't?",
          options: ["A truth table", "Nothing extra", "Physical hardware", "Knowing which Boolean law to apply at each step"],
          correct: 3
        },
        {
          question: "A+A'B simplifies to which expression, using the second distributive law and the inversion law?",
          options: ["A·B", "A'", "AB'", "A+B"],
          correct: 3
        },
        {
          question: "What is canonical (minterm) form used for?",
          options: [
            "Making an expression longer",
            "Building physical circuits directly",
            "Converting Boolean values to decimal",
            "A unique, exact representation for comparing two expressions' equivalence"
          ],
          correct: 3
        },
        {
          question: "Two expressions' canonical forms list minterm sets {1,3,5} and {1,3,6}. Are the expressions equivalent?",
          options: ["Yes", "Only if simplified further", "No — the sets differ", "Cannot be determined"],
          correct: 2
        }
      ]
    }
  ]
};
