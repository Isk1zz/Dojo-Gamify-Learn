// ================================================
// Course: Intro to CS — MODULE 7
// Unit 2: Number Systems & Data Representation
// ------------------------------------------------
// Written to library/content/CONTENT-MODEL.md. Four topics, three
// chunks each, five exam questions per topic; blocks[] explanations
// at ~200 words, two citations per chunk, original analogies, predict
// on chunk 1 of every topic, recall on every chunk with points.
//
// Matches the unit's own stated coverage exactly:
//   "Number systems: Binary, decimal, octal, hexadecimal"        -> Topic 1
//   "Base conversions: ... and vice versa"                       -> Topic 2
//   "Coding representation: ASCII, Unicode, Gray code, BCD, EBCDIC" -> Topics 3-4
//
// Source pages match the assigned reading:
//   Ndjountche (2016) §1.1-1.6 (pp. 20-26)        — Topic 1
//   Ndjountche (2016) §1.6, §1.9                  — Topic 2 (§1.9 is
//     real but wasn't in the originally assigned page range, so no
//     page number is claimed for it — see that chunk's source note)
//   Ndjountche (2016) §1.7, §1.12 (pp. 26-27, 46-49) — Topics 3-4
//   Robertson (2020) ch. 5 "Coding for the modern era" (pp. 53-54) — ASCII, Unicode
//
// ERRATA (flagging, not reproduced here): the assigned reading notes
// Example 1.7 in Ndjountche §1.6 (p. 25) misprints the binary number
// 110101 where it should read 110111. Nothing in this module quotes
// that example directly, but any future chunk that does must use the
// corrected value.
//
// NOT YET WRITTEN: Boolean algebra / logic gates and Operating
// Systems are separate reading packages, queued as their own modules
// — see PROJECT.md's content queue. This file is Unit 2 only.
// ================================================

const MODULE_7 = {
  id: "number-systems",
  unit: 2,
  title: "Number Systems & Data Representation",
  icon: "\u{1F522}",
  topics: [

    // ============================================================
    {
      id: "ns-number-systems",
      title: "Decimal, Binary, Octal & Hexadecimal",
      desc: "What a base actually is, and why computing settled on these four",
      icon: "\u{1F522}",
      chunks: [
        {
          title: "What a Positional Number System Is",
          glossary: [
            { term: "Positional number system", definition: "A number system where a digit's value depends on its position, not just the digit itself." },
            { term: "Base (radix)", definition: "The number of unique digits a number system uses — 10 for decimal, 2 for binary." }
          ],
          predict: {
            question: "The decimal number 214 and the binary number 214 — are these the same number?",
            options: [
              "Yes, 214 is 214 regardless of what system it's written in",
              "No — “214” isn't even a valid binary number, and the value would differ if it were",
              "No, but only because binary uses fewer digits than decimal",
              "Yes, as long as both are read left to right"
            ],
            reveal: "Binary only has digits 0 and 1, so “214” can't be written in binary at all — the “2” isn't a legal digit. That's the seed of everything in this chunk: a number's value depends entirely on which base is doing the counting."
          },
          explain: {
            blocks: [
              { text: `A <strong>positional number system</strong> represents a value using a fixed set of digits and a <strong>base</strong> (or <em>radix</em>) that says how many digits exist and what each position is worth. Base 10 has ten digits (0–9), and each position is worth ten times the position to its right — ones, tens, hundreds. Change the base and every one of those weights changes with it.` },
              { heading: "The general rule", text: `For any base B, a digit in position <em>i</em> (counting from 0 at the rightmost digit) contributes digit × B<sup>i</sup> to the total value. Decimal is base 10, so 214 = 2×10² + 1×10¹ + 4×10⁰. The digits never encode a base themselves — 214 is only decimal because that's the convention agreed on; the same three symbols under base 5 aren't even legal, since base 5 only has digits 0–4.` },
              { heading: "Why the base has to be stated", text: `Two systems can use identical-looking digits and mean different values, so a number without a stated (or contextually obvious) base is ambiguous. Computing conventionally settles on four: decimal for people, binary for hardware (two voltage states map directly to two digits), and octal and hexadecimal as compact stand-ins for binary, since each of their digits maps to an exact, unambiguous group of bits.` }
            ],
            analogy: `A ruler marked in inches and one marked in centimetres can show the same physical length as two different numbers. Reading “5” off the wrong ruler gives a wrong measurement. Unlike a ruler, though, a number system isn't physical — nothing about “214” visibly announces which ruler it was written on.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.1–§1.3 (pp. 20–23). John Wiley &amp; Sons.`, note: `The base/radix definition and the decimal and binary examples used in this chunk.` },
              { ref: `Knuth, D. E. (1997). <em>The Art of Computer Programming, Vol. 2: Seminumerical Algorithms</em> (3rd ed.), §4.1. Addison-Wesley.`, note: `The general positional-notation formula (digit × B^i) generalized across arbitrary bases.` }
            ]
          },
          example: {
            label: "Same digits, different value",
            steps: [
              `“110” read as decimal is one hundred ten — the ordinary reading.`,
              `The same string “110” read as binary is 1×4 + 1×2 + 0×1 = 6 — identical symbols, a completely different value.`,
              `The same string “110” read as base 5 is 1×25 + 1×5 + 0×1 = 30 — still legal (every digit is below 5), and still a third value.`
            ]
          },
          quiz: {
            question: "A file format stores a version number as the three characters '111'. A parser assumes decimal and reports version 111. The actual spec says the field is binary. What is the true version number?",
            options: ["111", "3", "7", "273"],
            correct: 2,
            explanation: `1×4 + 1×2 + 1×1 = 7. The tempting wrong answer is 111 — that's what you get by not converting at all, silently assuming decimal because that's the default reading people fall back on. The digits never announce their own base; the spec has to be read.`
          },
          recall: {
            prompt: "What does the 'base' of a number system actually determine, and why is the same digit string ambiguous without one?",
            answer: `The base sets how many digits exist and what each position is worth (each position's value is digit × base^position). The same digit string is ambiguous without a stated base because the symbols themselves carry no information about which base produced them — “110” is a valid string in decimal, binary, or any base greater than 1, and evaluates to a different number in each.`,
            points: [
              `Base = how many digits + what each position's weight is`,
              `Formula: digit × base^position, summed`,
              `Digits don't self-identify their base`,
              `A concrete example that one string means different values in different bases`
            ]
          },
          wisdomTags: ["beginning", "self-deception"]
        },

        {
          title: "Binary, Octal, and Hexadecimal",
          glossary: [
            { term: "Binary", definition: "Base-2 number system, using only the digits 0 and 1." },
            { term: "Octal", definition: "Base-8 number system, using digits 0-7." },
            { term: "Hexadecimal", definition: "Base-16 number system, using digits 0-9 and A-F." }
          ],
          explain: {
            blocks: [
              { text: `Binary (base 2) uses only 0 and 1, which is why it's the native language of digital hardware — a transistor is naturally either off or on, and nothing beyond two states is needed. Octal (base 8) and hexadecimal (base 16) exist purely for human convenience: neither is any closer to how a computer works than the other, they're just more compact ways of writing binary down.` },
              { heading: "Why 8 and 16, specifically", text: `Both 8 and 16 are powers of two (2³ and 2⁴), so one octal digit always represents exactly 3 binary digits, and one hex digit always represents exactly 4 — with no leftover bits and no carrying across the boundary. That clean split is why those two bases were chosen over, say, base 12 or base 20: it turns converting to and from binary into grouping digits, not doing arithmetic.` },
              { heading: "The hex digit set", text: `Hexadecimal needs 16 symbols but only has ten numerals, so it borrows A–F for the values 10–15. A byte (8 bits) always fits in exactly two hex digits, which is the real reason memory addresses and colour codes are conventionally written in hex — one glance at two hex digits tells you the full byte.` }
            ],
            analogy: `Buying eggs by the dozen doesn't change how many eggs exist — it changes how conveniently they're counted. Octal and hex “bundle” bits the same way, 3 or 4 at a time, purely for a shorter label. Unlike egg cartons, the bundling has to line up exactly, or the shortcut stops working.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.4–§1.5 (pp. 24–25). John Wiley &amp; Sons.`, note: `The octal and hexadecimal definitions and digit-grouping described in this chunk.` },
              { ref: `Mano, M. M., &amp; Ciletti, M. D. (2018). <em>Digital Design</em> (6th ed.), ch. 1. Pearson.`, note: `Standard reference for why bases that are powers of two group cleanly with binary.` }
            ]
          },
          example: {
            label: "Grouping bits: hex vs. octal vs. neither",
            steps: [
              `The byte 10110110 splits into hex cleanly: 1011 0110 → B6.`,
              `The same byte splits into octal in 3-bit groups from the right: 010 110 110 → 266 (padded, since 8 isn't a multiple of 3).`,
              `Splitting it into 5-bit groups (base 32) doesn't divide evenly at all — 10110 110, a leftover group of 3 that base 32 has no single digit for. That's exactly why base 32 isn't used this way.`
            ]
          },
          quiz: {
            question: "A programmer wants to write the 8-bit binary value 10110110 in the base that groups its bits with nothing left over. Should they use hex or octal, and why?",
            options: [
              "Octal — octal is the standard shorthand for binary",
              "Hex — 8 bits split evenly into two groups of 4",
              "Either works equally well, since both are just binary shorthand",
              "Neither — 8-bit values must stay in binary"
            ],
            correct: 1,
            explanation: `8 bits split into two groups of exactly 4, so hex is exact with nothing left over; octal groups in 3s, and 8 isn't divisible by 3, so the last group would be short a bit. The tempting wrong answer is octal — it genuinely is a legitimate binary shorthand in general, just not a clean fit for exactly 8 bits.`
          },
          recall: {
            prompt: "Why were octal and hexadecimal chosen as the 'shorthand' bases for binary specifically, rather than some other base?",
            answer: `Both 8 and 16 are powers of 2 (2³ and 2⁴), so one octal digit maps to exactly 3 bits and one hex digit maps to exactly 4 bits, with no leftover bits and no carrying across the boundary. That makes converting between binary and octal/hex a matter of grouping digits rather than doing arithmetic — a base that wasn't a power of 2 wouldn't have this property.`,
            points: [
              `8 = 2³, 16 = 2⁴ — both powers of two`,
              `1 octal digit = 3 bits, 1 hex digit = 4 bits, exactly`,
              `Conversion becomes grouping, not arithmetic`,
              `A non-power-of-2 base wouldn't group evenly`
            ]
          },
          wisdomTags: ["simplicity", "planning"]
        },

        {
          title: "Converting Between Bases",
          glossary: [
            { term: "Base conversion", definition: "Rewriting the same numeric value in a different base." }
          ],
          explain: {
            blocks: [
              { text: `Converting a number FROM decimal INTO another base repeatedly divides by the target base, keeping each remainder; converting the other way — from any base INTO decimal — sums each digit times its positional weight, exactly as in the formula from the first chunk of this topic.` },
              { heading: "Decimal to binary, step by step", text: `To convert 25 to binary: 25÷2 = 12 remainder 1, 12÷2 = 6 remainder 0, 6÷2 = 3 remainder 0, 3÷2 = 1 remainder 1, 1÷2 = 0 remainder 1. Reading the remainders bottom-to-top gives 11001. The “read them backwards” step trips people up because the FIRST remainder produced is the LAST digit of the answer.` },
              { heading: "Converting through binary, not directly", text: `Converting octal straight to hex (or the reverse) is rarely done by dividing directly — it's faster to go octal → binary → hex, since each octal digit expands to exactly 3 bits and every 4 of those bits regroup into one hex digit. Binary acts as the common intermediate every other base converts through — the next topic drills exactly this.` }
            ],
            analogy: `A currency kiosk that only trades through US dollars — francs to dollars, dollars to yen — is slower than a direct rate, but it only needs one exchange table instead of one per pair. Binary plays that same role between octal and hex.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.6 (pp. 25–26). John Wiley &amp; Sons.`, note: `The radix-B representation and division-remainder conversion method.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, March 30). <em>Decimal to Binary Conversion Explained (with Solved Examples)</em> [Video]. YouTube. https://youtube.com/watch?v=QAHyFa3gKKc`, note: `A worked walkthrough of the divide-by-2 remainder method demonstrated in this chunk.` }
            ]
          },
          example: {
            label: "Converting 25 three ways",
            steps: [
              `Decimal → binary (divide by 2, collect remainders bottom-up): 25 → 11001.`,
              `Decimal → octal (divide by 8, collect remainders bottom-up): 25 → 31 (25 = 3×8 + 1).`,
              `Binary → hex (group 11001 into 4-bit chunks from the right, 0001 1001): 11001 → 0x19 — same value, three different labels.`
            ]
          },
          quiz: {
            question: "Converting from binary straight to decimal, a student sums the digits (1+1+0+0+1 for 11001) instead of weighting them by position, and gets 3. What did they actually compute, and what's the correct value?",
            options: [
              "They made an arithmetic error; the correct value is 22",
              "3 is correct — binary values are just the count of 1s",
              "The correct value is 11001 read as decimal, i.e. eleven thousand one",
              "They computed the number of 1-bits, not the value; the correct value is 25"
            ],
            correct: 3,
            explanation: `Each 1-bit contributes its positional weight (16+8+0+0+1 = 25), not just “one”. Summing raw digits throws away exactly the information a positional system exists to carry — it's the same error as reading “214” by adding 2+1+4. The decimal-reading option is tempting because it's what “just read the digits” gives in decimal, but the value was never decimal to begin with.`
          },
          recall: {
            prompt: "Describe the divide-and-remainder method for converting a decimal number into another base, and explain why the remainders are read in reverse order.",
            answer: `Repeatedly divide the decimal number by the target base, recording the remainder each time, until the quotient reaches 0. The first remainder produced corresponds to the least-significant (rightmost) digit of the answer, and the last remainder produced corresponds to the most-significant (leftmost) digit — so reading the remainders in the order they were produced would give the number backwards; reading them bottom-to-top (last remainder first) gives the correct digit order.`,
            points: [
              `Repeated division by the target base`,
              `Remainder recorded at each step`,
              `Stop when the quotient reaches 0`,
              `Remainders read in reverse (last produced = first digit)`
            ]
          },
          wisdomTags: ["correction", "effort"]
        }
      ],
      examQuestions: [
        {
          question: "What is the decimal value of the binary number 1101?",
          options: ["11", "13", "14", "1101"],
          correct: 1
        },
        {
          question: "How many binary digits does one hexadecimal digit always represent?",
          options: ["3", "8", "4", "2"],
          correct: 2
        },
        {
          question: "Convert decimal 50 to octal.",
          options: ["62", "60", "52", "55"],
          correct: 0
        },
        {
          question: "Why can octal and hexadecimal digits be grouped from binary with no leftover bits, while base 6 could not?",
          options: [
            "Because base 6 doesn't have enough digits",
            "Because 8 and 16 are powers of 2, and 6 is not",
            "Because binary can only convert to bases smaller than 10",
            "Because octal and hex are older, more established bases"
          ],
          correct: 1
        },
        {
          question: "A number's digits alone, without a stated base, are:",
          options: [
            "Always assumed to be decimal universally, with no exceptions",
            "Sufficient on their own, since digits fix the base",
            "Always assumed to be binary in computing contexts",
            "Ambiguous — the same digits mean different values in different bases"
          ],
          correct: 3
        }
      ]
    },

    // ============================================================
    {
      id: "ns-conversion-practice",
      title: "Base Conversion Practice",
      desc: "The specific pairs — decimal, octal, hex, and fractions, worked in full",
      icon: "\u{1F504}",
      chunks: [
        {
          title: "Decimal to Octal and Hexadecimal, Directly",
          glossary: [
            { term: "Repeated division method", definition: "Converting decimal to another base by repeatedly dividing by the target base and reading the remainders in reverse." }
          ],
          predict: {
            question: "Converting decimal 100 to octal and to hexadecimal — will the two answers be related in any way, or are they unrelated numbers?",
            options: [
              "Unrelated — octal and hexadecimal have nothing to do with each other",
              "Related — both come from the SAME binary form of 100, just grouped into different-sized chunks",
              "Identical — octal and hexadecimal are actually the same base written differently",
              "Related, but only because 100 happens to be a round decimal number"
            ],
            reveal: "Both octal and hex are binary underneath, grouped 3 bits at a time versus 4. Converting decimal to either one passes through the same binary form first — that shared root is what this chunk and the next one practice."
          },
          explain: {
            blocks: [
              { text: `The previous topic converted decimal to binary by repeated division. The exact same division-by-target-base method converts decimal to any base at all — divide by 8 for octal, by 16 for hexadecimal, collecting remainders bottom-to-top exactly as before. Only the divisor changes.` },
              { heading: "Decimal to octal, worked", text: `Converting 100 to octal: 100÷8 = 12 remainder 4, 12÷8 = 1 remainder 4, 1÷8 = 0 remainder 1. Reading the remainders bottom-to-top gives 144. Checking the answer the other direction confirms it: 1×64 + 4×8 + 4×1 = 64 + 32 + 4 = 100.` },
              { heading: "Decimal to hex, worked — and where letters come in", text: `Converting 100 to hex: 100÷16 = 6 remainder 4, 6÷16 = 0 remainder 6. Reading bottom-to-top gives 64 in hex. A remainder of 10 or above isn't written as two digits — it becomes a single letter, A through F, exactly as when hex digits were first introduced. A remainder of 13 is written D, never “13”, or the digit count in the answer would be wrong.` }
            ],
            analogy: `A single till drawer that makes change in whichever coin denomination a customer asks for — the amount owed never changes, only which coins represent it. Asking for octal "coins" or hex "coins" is still counting out the same 100 cents.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.6 (pp. 25–26). John Wiley &amp; Sons.`, note: `The same division-remainder method extended from binary to octal and hexadecimal here.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, July 27). <em>Octal and hexadecimal number system explained</em> [Video]. YouTube. https://youtube.com/watch?v=k3Z322T3sjs`, note: `Worked octal and hexadecimal conversion examples matching the method practiced in this chunk.` }
            ]
          },
          example: {
            label: "One number, two target bases",
            steps: [
              `200 to octal: 200÷8 = 25 r0, 25÷8 = 3 r1, 3÷8 = 0 r3 → reading up: 310 (octal).`,
              `200 to hex: 200÷16 = 12 r8, 12÷16 = 0 r12 → the final remainder 12 becomes C, giving C8 (hex), not "128".`,
              `Check both against decimal: octal 310 = 3×64+1×8+0 = 200. Hex C8 = 12×16+8 = 200. Both match.`
            ]
          },
          quiz: {
            question: "Converting decimal 200 to hexadecimal, a student computes 200÷16 = 12 remainder 8, stops there, and writes the answer as '128'. What actually went wrong?",
            options: [
              "Nothing — 128 is the correct answer",
              "200 cannot be converted to hexadecimal directly",
              "The remainder should have been read first, not last",
              "They stopped dividing one step too early, and the final remainder (12) should have become the hex digit C, not the two characters '12'"
            ],
            correct: 3,
            explanation: `The division must continue until the quotient reaches 0: 200÷16 = 12 r8, then 12÷16 = 0 r12. That final remainder, 12, is a single hex digit written C — so the answer reads bottom-to-top as C8, not 128. The student both stopped one division early and forgot hex digits above 9 use letters.`
          },
          recall: {
            prompt: "Describe how the decimal-to-binary division method extends to octal and hexadecimal, and what changes when a remainder is 10 or greater.",
            answer: `The method is identical to decimal-to-binary — repeatedly divide by the target base and collect remainders — except the divisor becomes 8 for octal or 16 for hexadecimal instead of 2. When a remainder is 10 or greater (only possible in hexadecimal, since octal remainders top out at 7), it's written as a single letter, A through F, rather than as a multi-digit number, so the final answer has exactly one character per remainder produced.`,
            points: [
              `Same division-and-remainder method as decimal-to-binary`,
              `Divisor changes: 8 for octal, 16 for hex`,
              `Hex remainders 10-15 become letters A-F`,
              `Continue until the quotient reaches 0`
            ]
          },
          wisdomTags: ["planning", "effort"]
        },

        {
          title: "Binary, Octal and Hexadecimal, Interchangeably",
          glossary: [
            { term: "Bit grouping", definition: "Converting between binary and octal/hex by grouping binary digits into sets of 3 (octal) or 4 (hex)." }
          ],
          explain: {
            blocks: [
              { text: `The first topic showed that grouping bits converts binary to octal or hex without arithmetic. This chunk practices every direction between the three at once: binary to octal, octal to binary, binary to hex, hex to binary, and octal to hex by treating binary as the shared middle step.` },
              { heading: "Octal to hex, through binary", text: `Take octal 471. Expand each digit to exactly 3 bits: 4→100, 7→111, 1→001, concatenated as 100111001 (9 bits). Regroup those same bits into 4-bit chunks from the right, padding the leftmost group with zeros: 0001 0011 1001 → hex 139. Nothing was calculated — the bits were only ever re-grouped, first into 3s, then into 4s.` },
              { heading: "Binary to octal, directly", text: `The reverse works the same way, no decimal required: binary 101110 (6 bits, already a multiple of 3) groups directly into 101 110 → octal 5 and 6 → 56. Verifying independently: binary 101110 is 32+8+4+2 = 46, and octal 56 is 5×8+6 = 46 — the same value, reached two different ways.` }
            ],
            analogy: `Regrouping bits between octal and hex is like re-bagging the same pile of marbles — 3-per-bag versus 4-per-bag counts the identical pile differently, but recounting the marbles from scratch was never necessary. Unlike marbles, bits have a fixed order, so the regrouping has to start from a fixed end.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.6 (pp. 25–26). John Wiley &amp; Sons.`, note: `The grouping-based conversion technique between binary, octal, and hex practiced in this chunk.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, July 27). <em>Octal and hexadecimal number system explained</em> [Video]. YouTube. https://youtube.com/watch?v=k3Z322T3sjs`, note: `A worked demonstration of octal/hexadecimal grouping directly from binary.` }
            ]
          },
          example: {
            label: "Three routes to the same value",
            steps: [
              `Octal 471 → binary 100111001 (each digit expands to 3 bits) → hex 139 (regrouped into 4-bit chunks).`,
              `Binary 101110 → octal 56 (grouped into 3s) — no decimal step needed anywhere.`,
              `Decimal 46, checked independently: 32+8+4+2 = 46, confirming binary 101110, octal 56, and hex 2E (2×16+14) all name the identical value.`
            ]
          },
          quiz: {
            question: "Converting octal 25 to hexadecimal, a student expands each digit to 3 bits (2→010, 5→101) getting 010101, then regroups from the LEFT into 4-bit chunks instead of the right, misreading the result as just '5'. What is the actually correct hex value?",
            options: [
              "5, the student's answer, is correct",
              "21",
              "25",
              "15"
            ],
            correct: 3,
            explanation: `Padding has to go on the LEFT (the most-significant end) before grouping from the right: 010101 becomes 00010101 once padded, splitting cleanly into 0001 (1) and 0101 (5), giving hex 15 — matching decimal 21 (1×16+5). Grouping from the wrong end drops real bits instead of adding padding zeros, which is how the student's answer lost information.`
          },
          recall: {
            prompt: "Describe the two-step process for converting octal directly to hexadecimal (or the reverse) without going through decimal, and explain why padding direction matters.",
            answer: `Expand each octal digit into exactly 3 bits (or each hex digit into exactly 4 bits) to get one continuous binary string. Then regroup that string into the other size, counting from the RIGHT end and padding the leftmost group with zeros if it comes up short. Padding has to go on the left because bit position determines value — padding or grouping from the wrong end changes which bits end up in which group, changing the answer even though no arithmetic was performed.`,
            points: [
              `Expand: octal digit → 3 bits, hex digit → 4 bits`,
              `Regroup into the other size, counting from the right`,
              `Pad the leftmost group with zeros if short`,
              `No arithmetic needed — only correct grouping direction`
            ]
          },
          wisdomTags: ["correction", "planning"]
        },

        {
          title: "Converting the Fractional Part",
          glossary: [
            { term: "Fractional conversion", definition: "Converting the part of a number after the point by repeatedly multiplying by the target base." }
          ],
          explain: {
            blocks: [
              { text: `Every conversion so far has assumed a whole number. A fractional decimal like 0.625 converts to another base with a different procedure entirely: repeatedly MULTIPLY the fraction by the target base and keep the integer part that falls out each time, rather than dividing and keeping remainders.` },
              { heading: "0.625 to binary, worked", text: `0.625 × 2 = 1.25 → keep the 1, carry forward 0.25. 0.25 × 2 = 0.5 → keep 0, carry 0.5. 0.5 × 2 = 1.0 → keep 1, carry 0.0 — the process stops here because the fractional part reached exactly zero. Reading the kept digits TOP to bottom (the opposite order from the whole-number method) gives 0.101 in binary.` },
              { heading: "When it never stops", text: `Not every fraction terminates. Converting decimal 0.1 to binary never reaches a carry of exactly 0 — it repeats forever (0.0001100110011...), the same way 1/3 never terminates in decimal. This is why numbers that look exact in decimal are sometimes stored as tiny approximations in binary floating point — a well-known, recurring source of rounding surprises in real software.` }
            ],
            analogy: `Splitting a bill where everyone's exact share is a repeating decimal — some totals divide evenly, some don't, no matter how carefully the remainder gets carried forward. Binary hits exactly the same wall on fractions decimal handles cleanly, just for a different specific set of numbers.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.9.`, note: `The multiply-and-carry method for converting a fractional value to another base — a later section of the same assigned textbook, not part of the originally assigned page range, so no page number is claimed here.` },
              { ref: `Knuth, D. E. (1997). <em>The Art of Computer Programming, Vol. 2: Seminumerical Algorithms</em> (3rd ed.), §4.1. Addison-Wesley.`, note: `The general positional-notation treatment of fractional radix representation, extending the same formula used for whole numbers earlier in this topic.` }
            ]
          },
          example: {
            label: "A fraction that stops vs. one that doesn't",
            steps: [
              `0.625 (decimal) → binary: multiply-and-carry terminates after 3 steps → exactly 0.101.`,
              `0.1 (decimal) → binary: multiply-and-carry never reaches a carry of 0 → 0.0001100110011... repeating forever.`,
              `This is a real reason 0.1 + 0.2 famously doesn't print as exactly 0.3 in most programming languages — neither 0.1 nor 0.2 has an exact binary form to begin with.`
            ]
          },
          quiz: {
            question: "A developer is confused that a program prints 0.30000000000000004 instead of 0.3 after computing 0.1 + 0.2. What actually causes this?",
            options: [
              "A bug in how the addition operation itself is implemented",
              "0.1 and 0.2 don't have exact binary representations, so tiny rounding already existed in both values before the addition ran",
              "The program is secretly using decimal arithmetic instead of binary",
              "0.3 is too large a number for the system to store precisely"
            ],
            correct: 1,
            explanation: `Neither 0.1 nor 0.2 terminates in binary — both repeat forever, the same way 1/3 repeats in decimal — so both were already stored as close approximations before any addition happened. The addition just makes the pre-existing rounding visible. The tempting wrong answer blames the addition itself, but the addition ran correctly on values that were already slightly imprecise.`
          },
          recall: {
            prompt: "Describe the multiply-and-carry method for converting a decimal fraction to another base, and explain why some fractions never terminate.",
            answer: `Repeatedly multiply the fractional part by the target base; the integer part that falls out at each step becomes the next digit, read top-to-bottom (the reverse of the whole-number division method). The process terminates only if the carried fraction reaches exactly 0. Some fractions never reach exactly 0 no matter how many steps run, producing a pattern that repeats forever instead — the same phenomenon as a decimal fraction like 1/3 that never terminates.`,
            points: [
              `Multiply by the target base, keep the integer part each step`,
              `Digits read top-to-bottom (opposite of the whole-number method)`,
              `Terminates only when the carried fraction hits exactly 0`,
              `Some fractions repeat forever instead of terminating`
            ]
          },
          wisdomTags: ["limits", "uncertainty"]
        }
      ],
      examQuestions: [
        {
          question: "Convert decimal 50 to hexadecimal.",
          options: ["30", "23", "3A", "32"],
          correct: 3
        },
        {
          question: "When converting decimal to hexadecimal, what replaces a remainder of 12?",
          options: ["The digit 12, written normally", "It cannot be represented", "The letter C", "The letter A"],
          correct: 2
        },
        {
          question: "What is the correct first step for converting octal directly to hexadecimal, without going through decimal?",
          options: [
            "Multiply the octal value by 2",
            "Expand each octal digit into exactly 3 bits, then regroup into 4-bit chunks",
            "Add the octal digits together",
            "There is no valid direct method — decimal is required"
          ],
          correct: 1
        },
        {
          question: "Convert decimal 0.5 to binary.",
          options: ["0.1", "1.0", "0.5", "0.01"],
          correct: 0
        },
        {
          question: "Why do some decimal fractions never terminate when converted to binary?",
          options: [
            "Because binary can only represent whole numbers",
            "Because decimal fractions are always irrational when written in binary",
            "Because the multiply-and-carry process may never produce a carry of exactly 0",
            "Because binary requires a minimum of 8 digits after the point"
          ],
          correct: 2
        }
      ]
    },

    // ============================================================
    {
      id: "ns-bcd-gray-ebcdic",
      title: "Binary-Coded Decimal, Gray Code & EBCDIC",
      desc: "Three codes solving three different problems, one of them extending BCD itself",
      icon: "\u{1F524}",
      chunks: [
        {
          title: "Binary-Coded Decimal (BCD)",
          glossary: [
            { term: "BCD (Binary-Coded Decimal)", definition: "A code representing each decimal digit with its own 4-bit binary pattern." }
          ],
          predict: {
            question: "The decimal number 47 is stored as BCD. Is the stored bit pattern the same as storing 47 as plain (unsigned) binary?",
            options: [
              "Yes — BCD and binary always produce identical bit patterns for the same number",
              "No — BCD encodes each decimal digit separately, so it uses more bits than plain binary for the same number",
              "No — BCD uses fewer bits, because it skips values above 9",
              "Yes, but only for numbers under 10"
            ],
            reveal: "BCD stores 47 as two separate 4-bit groups — 0100 (for the “4”) and 0111 (for the “7”) — rather than converting the whole number to binary at once (00101111). It trades compactness for keeping each decimal digit individually recoverable."
          },
          explain: {
            blocks: [
              { text: `Binary-Coded Decimal (BCD) encodes a decimal number by converting EACH DIGIT to its own 4-bit binary group, rather than converting the number as a whole. 47 in BCD is 0100 0111 — the binary for 4, followed by the binary for 7 — which is not the same bit pattern as 47 converted as one binary number (00101111).` },
              { heading: "Why keep the digits separate", text: `Four bits can represent 16 values (0000–1111), but BCD only ever uses ten of them (0000–1001) — one per decimal digit — and the remaining six patterns (1010–1111) simply never appear. That “waste” buys something specific: a BCD number can be split back into its original decimal digits by just re-grouping every 4 bits, with no division or remainder arithmetic required.` },
              { heading: "Where this actually gets used", text: `BCD shows up wherever a system needs to display or print decimal digits directly and cheaply — digital clocks, calculators, price displays — because converting binary to decimal for display is comparatively expensive, while BCD-to-seven-segment-display logic is simple, fixed wiring.` }
            ],
            analogy: `Storing a phone number as separate boxed digits, one digit per compartment, instead of as one large number in a single drawer. It takes more compartments overall, but you can read any single digit off instantly without unpacking the whole drawer.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.7 (pp. 26–27). John Wiley &amp; Sons.`, note: `BCD's digit-by-digit 4-bit encoding and the definition used in this chunk.` },
              { ref: `Mano, M. M., &amp; Ciletti, M. D. (2018). <em>Digital Design</em> (6th ed.), ch. 1 (Binary Codes). Pearson.`, note: `BCD's use in decimal-display hardware, covered alongside Gray code and other binary codes.` }
            ]
          },
          example: {
            label: "47 in three encodings",
            steps: [
              `Plain binary: 47 → 00101111 (one 8-bit number).`,
              `BCD: 47 → 0100 0111 (two 4-bit groups, one per digit).`,
              `The same 8 bits read as plain binary instead of BCD: 01000111 = 71, not 47 — identical bits, a different value, depending on which encoding is assumed.`
            ]
          },
          quiz: {
            question: "A 4-bit hardware register reads 1100. A technician assumes it's BCD and reports it as an invalid reading. Is the technician right?",
            options: [
              "No — 1100 is a valid BCD digit representing the value 12",
              "Yes — 1100 (12) is outside 0000–1001, so it's not a valid single BCD digit",
              "No — all 4-bit patterns are valid in any binary-based code",
              "Yes, but only because 1100 has an even number of 1-bits"
            ],
            correct: 1,
            explanation: `BCD only uses patterns 0000–1001; 1100 (decimal 12) falls in the six unused patterns (1010–1111) and is not a legal single BCD digit, so the technician is correct. The tempting wrong answer is the first one — it treats BCD as if it were just 4-bit binary, when the whole point of BCD is that not all 4-bit patterns are legal.`
          },
          recall: {
            prompt: "What makes BCD different from converting a decimal number to binary as a whole, and why does BCD 'waste' some 4-bit patterns?",
            answer: `BCD encodes each decimal digit as its own separate 4-bit group (using only patterns 0000–1001), rather than converting the entire number to one binary value. It wastes six of the sixteen possible 4-bit patterns (1010–1111) because those would correspond to non-digit values; the tradeoff buys the ability to recover any individual decimal digit by simply regrouping bits, with no division needed.`,
            points: [
              `Each decimal digit gets its own 4-bit group`,
              `Only patterns 0000–1001 are used/valid`,
              `1010–1111 are unused, "wasted" patterns`,
              `Benefit: digits recoverable without conversion arithmetic`
            ]
          },
          wisdomTags: ["tradition", "limits"]
        },

        {
          title: "Gray Code",
          glossary: [
            { term: "Gray code", definition: "A binary sequence where consecutive values differ by only one bit." }
          ],
          explain: {
            blocks: [
              { text: `Gray code is a binary encoding where consecutive values differ by exactly ONE bit, unlike ordinary binary where incrementing can flip several bits at once. Counting 3 to 4 in ordinary binary flips three bits (011 → 100); in Gray code, every single step — including 3 to 4 — flips exactly one.` },
              { heading: "Why more than one bit flipping is a problem", text: `Real hardware doesn't flip multiple bits at the exact same instant — there's always a tiny timing skew. If ordinary binary rolls from 011 to 100 and the bits don't switch in perfect sync, the circuit can briefly pass through an intermediate value like 111 or 000 that was never meant to exist, which is disastrous if something is reading that value mid-transition — a mechanical position sensor, for instance.` },
              { heading: "The tradeoff", text: `Gray code fixes the multi-bit-flip problem but stops being “natural” to do arithmetic in — adding two Gray-coded numbers directly doesn't work the way it does in ordinary binary. That's why Gray code shows up specifically in places reading a changing physical value (rotary encoders, Karnaugh maps), not in general-purpose arithmetic.` }
            ],
            analogy: `An odometer that clicks over one digit at a time reads cleanly at any instant you glance at it. One that flips several wheels simultaneously can show a nonsense number for a split second mid-click if the wheels aren't perfectly synced. Gray code is the one-wheel-at-a-time odometer.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.12.1 (pp. 46–47). John Wiley &amp; Sons.`, note: `The Gray code definition and single-bit-change property described in this chunk.` },
              { ref: `ALL ABOUT ELECTRONICS. (2021, August 2). <em>Binary codes: Classification of binary codes explained</em> [Video]. YouTube. https://youtube.com/watch?v=ZNFyOSHh8P0`, note: `Classifies Gray code among the other binary codes and demonstrates the single-bit-change property.` }
            ]
          },
          example: {
            label: "Counting 3 to 4: ordinary binary vs. Gray code",
            steps: [
              `Ordinary binary: 3 = 011, 4 = 100 — three bits flip at once.`,
              `Gray code: 3 = 010, 4 = 110 — only one bit flips.`,
              `Mid-transition glitch risk: if binary's three bits don't switch in perfect sync, a reader could briefly see 111 or 000 — values that are neither 3 nor 4. Gray code has no equivalent gap, since only one bit is ever mid-flip.`
            ]
          },
          quiz: {
            question: "A rotary shaft-position sensor needs to report its angle as a multi-bit code, with the requirement that no reading may ever be more than one bit removed from a valid adjacent angle, even mid-transition. Which code satisfies this, and why?",
            options: [
              "Ordinary binary, because it's the simplest and most direct encoding",
              "BCD, because it keeps each digit independently readable",
              "Gray code, because consecutive values differ by exactly one bit",
              "Hexadecimal, because it uses the fewest digits per value"
            ],
            correct: 2,
            explanation: `Gray code is defined by the single-bit-change property between consecutive values, which is exactly what a glitch-free physical sensor needs. Ordinary binary is tempting because it's the default choice for most encoding tasks, but it's precisely the multi-bit flip that Gray code exists to avoid.`
          },
          recall: {
            prompt: "What property defines Gray code, and what real hardware problem does that property solve?",
            answer: `Gray code is a binary encoding where every consecutive pair of values differs in exactly one bit position. This solves the multi-bit-transition glitch problem in physical sensors and rotary encoders: because real circuits can't flip multiple bits at the exact same instant, ordinary binary can briefly show an invalid intermediate value while several bits are mid-flip; Gray code can't do this, since only one bit is ever changing at a time.`,
            points: [
              `Consecutive values differ by exactly one bit`,
              `Ordinary binary can flip multiple bits per step`,
              `Multi-bit flips risk a transient invalid reading in hardware`,
              `Used in rotary encoders / physical sensors specifically`
            ]
          },
          wisdomTags: ["change", "feedback"]
        },

        {
          title: "EBCDIC",
          glossary: [
            { term: "EBCDIC", definition: "An 8-bit character encoding developed by IBM, mainly used on mainframe systems." }
          ],
          explain: {
            blocks: [
              { text: `EBCDIC (Extended Binary Coded Decimal Interchange Code) is an 8-bit character encoding IBM introduced for mainframe computers, built as a direct extension of BCD's digit-encoding idea to cover letters and symbols too, not just the digits 0–9.` },
              { heading: "Why it looks nothing like ASCII", text: `Unlike ASCII, EBCDIC's letters are NOT assigned consecutive numbers — there are deliberate gaps in the middle of the alphabet (between I and J, and between R and S) left over from how the encoding grew out of older punched-card hole patterns. A programmer's safe ASCII assumption — "the alphabet is 26 consecutive codes" — gives a wrong answer on EBCDIC hardware.` },
              { heading: "Why it still matters", text: `EBCDIC isn't a historical curiosity — it remains the default text encoding on IBM mainframes running core banking and government systems today. Software moving data between an EBCDIC mainframe and an ASCII/Unicode system has to explicitly translate every character, and a missed translation step is a real, recurring class of bug in that kind of integration work.` }
            ],
            analogy: `Two countries that both use a 26-letter alphabet but assign completely different postal codes to each letter's neighbourhood. Mail addressed correctly in one system reads as gibberish in the other until someone translates the code, even though both recognise the same 26 letters.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.12.4 "Other codes" (pp. 48–49). John Wiley &amp; Sons.`, note: `EBCDIC's classification alongside Gray code as one of the chapter's covered binary codes.` },
              { ref: `Mano, M. M., &amp; Ciletti, M. D. (2018). <em>Digital Design</em> (6th ed.), ch. 1 (Binary Codes). Pearson.`, note: `EBCDIC's origin as an IBM extension of BCD, covered in the same chapter as BCD and Gray code.` }
            ]
          },
          example: {
            label: "Three encodings, one letter",
            steps: [
              `The letter "A" in ASCII is decimal 65.`,
              `The letter "A" in EBCDIC is decimal 193 — a completely different number for the identical letter.`,
              `A file saved as EBCDIC and opened by a program expecting ASCII shows neither an error nor "A" — it shows whatever character ASCII assigns to byte 193, silently wrong output instead of a clear failure.`
            ]
          },
          quiz: {
            question: "A batch file transferred from an IBM mainframe displays as scrambled symbols on a Linux server. The mainframe operator insists the file was never corrupted. Who's most likely right, and why?",
            options: [
              "The operator — the file is probably an intact EBCDIC file being read as if it were ASCII",
              "The Linux server — file transfer to Linux always corrupts binary data",
              "Neither — scrambled display always means the file itself is corrupted",
              "The operator is wrong; mainframes cannot produce readable text files at all"
            ],
            correct: 0,
            explanation: `EBCDIC and ASCII assign completely different numbers to the same letters, so a perfectly intact EBCDIC file displays as nonsense on a system that assumes ASCII — no corruption required, just a mismatched encoding assumption. The tempting wrong answer blames the transfer itself, but a transfer can preserve every byte exactly and still produce this exact symptom.`
          },
          recall: {
            prompt: "What is EBCDIC, and why can't an ASCII-based system read an EBCDIC file correctly without translation?",
            answer: `EBCDIC (Extended Binary Coded Decimal Interchange Code) is an 8-bit character encoding developed by IBM for mainframes, extending BCD's digit-encoding approach to cover letters and symbols. An ASCII-based system can't read it correctly because EBCDIC assigns completely different numeric codes to the same characters — for example, "A" is 65 in ASCII but 193 in EBCDIC — so without an explicit translation step, each byte decodes as the wrong character.`,
            points: [
              `EBCDIC = IBM mainframe encoding, extends BCD's approach`,
              `8-bit, covers letters and symbols, not just digits`,
              `Assigns different numeric codes than ASCII for the same characters`,
              `Requires explicit translation between EBCDIC and ASCII/Unicode systems`
            ]
          },
          wisdomTags: ["tradition", "correction"]
        }
      ],
      examQuestions: [
        {
          question: "What is the primary structural difference between BCD and ordinary binary encoding of the same decimal number?",
          options: [
            "BCD encodes each decimal digit as its own 4-bit group; binary converts the whole number at once",
            "BCD and binary always produce the same bit pattern",
            "BCD uses fewer bits than binary for every number",
            "BCD is only used for numbers under 10"
          ],
          correct: 0
        },
        {
          question: "How many of the sixteen possible 4-bit patterns does BCD actually use per digit?",
          options: ["Sixteen", "Eight", "Ten", "Four"],
          correct: 2
        },
        {
          question: "What single property defines Gray code?",
          options: [
            "It uses the fewest bits of any code",
            "Consecutive values differ by exactly one bit",
            "It's a variant of BCD",
            "It only represents even numbers"
          ],
          correct: 1
        },
        {
          question: "What does EBCDIC stand for, and who developed it?",
          options: [
            "European Binary Code for Data Interchange Centre",
            "Extended Binary Coded Decimal Interchange Code, developed by IBM",
            "Enhanced Binary Character Data Information Code",
            "Extended Byte Code for Digital Information Control"
          ],
          correct: 1
        },
        {
          question: "Why does the same letter have a different numeric code in ASCII versus EBCDIC?",
          options: [
            "They're unrelated encodings, developed independently for different hardware",
            "EBCDIC is simply ASCII shifted by a fixed number of positions",
            "ASCII came first, so EBCDIC copies ASCII's codes exactly",
            "They actually use the same codes; the difference is a common myth"
          ],
          correct: 0
        }
      ]
    },

    // ============================================================
    {
      id: "ns-character-encoding",
      title: "Character Encoding: ASCII & Unicode",
      desc: "From 128 English characters to every script in use, without breaking what came before",
      icon: "\u{1F310}",
      chunks: [
        {
          title: "ASCII and Character Encoding",
          glossary: [
            { term: "ASCII", definition: "A 7-bit character encoding standard mapping numbers to English letters, digits, and symbols." },
            { term: "Character encoding", definition: "A system that maps characters to numeric codes a computer can store." }
          ],
          predict: {
            question: "A password field logs its length as 'number of characters,' regardless of whether those characters are letters, digits, or emoji. Does plain ASCII support all of those equally?",
            options: [
              "Yes — ASCII covers any character a modern keyboard can produce",
              "No — ASCII only covers basic unaccented English letters, digits and punctuation",
              "Yes, but only for passwords under 8 characters",
              "No — ASCII doesn't support digits, only letters"
            ],
            reveal: "ASCII's 128 code points cover unaccented English text only — no emoji, no accented letters, no non-Latin scripts. A password with an emoji in it is already outside what plain ASCII can represent, a limitation this chunk and the next one both turn on."
          },
          explain: {
            blocks: [
              { text: `ASCII (American Standard Code for Information Interchange) assigns every letter, digit, and punctuation mark a number from 0 to 127, storable in 7 bits. “A” is 65, “a” is 97, and the digit character “0” (as a printable symbol, not the number zero) is 48 — three different values for three things that might casually seem similar.` },
              { heading: "Why 'A' and 'a' are 32 apart", text: `Uppercase and lowercase letters are deliberately laid out 32 apart (65 vs. 97) so that flipping a single bit converts a letter's case — a property early hardware could exploit directly, without a lookup table. This is a designed regularity, not a coincidence of alphabetical order.` },
              { heading: "Where ASCII runs out", text: `128 values are enough for English but nothing else — no accented letters, no non-Latin scripts, no emoji. Extended and later encodings (ISO-8859 variants, and eventually Unicode) exist specifically to cover what ASCII's 7 bits structurally cannot. Unicode's first 128 code points deliberately match ASCII exactly, so any plain ASCII text is already valid text in the newer scheme — the next chunk picks up exactly here.` }
            ],
            analogy: `A 128-page phrasebook covering English perfectly is useless for a French menu — not broken, just never built to hold those words. Unicode re-binds the same phrasebook with thousands of extra pages, keeping English's original 128 on the same page numbers.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.12.3 (pp. 47–48). John Wiley &amp; Sons.`, note: `The ASCII code table and 7-bit range described in this chunk.` },
              { ref: `Robertson, S. (2020). <em>BC, Before Computers: On Information Technology from Writing to the Age of Digital Data</em>, ch. 5 "Coding for the modern era" (pp. 53–54). Open Book Publishers.`, note: `Historical context for why character-encoding standards like ASCII emerged.` }
            ]
          },
          example: {
            label: "Same key, different code point",
            steps: [
              `Pressing “A” (shift held) sends ASCII 65 — 01000001.`,
              `Pressing “a” (no shift) sends ASCII 97 — 01100001 — exactly one bit different from “A”.`,
              `Pressing “é” can't be sent in plain 7-bit ASCII at all — there is no code point for it; a system limited to ASCII would have to substitute, drop, or mis-render the character.`
            ]
          },
          quiz: {
            question: "A legacy system stores text as 7-bit ASCII. A user pastes in text containing 'café'. What happens to the 'é', and why?",
            options: [
              "It's stored fine — ASCII covers all Latin-alphabet letters, accented or not",
              "It's stored as two separate ASCII characters, 'e' followed by an accent mark",
              "ASCII automatically substitutes the nearest Unicode equivalent",
              "It can't be represented — ASCII's 128 code points don't include accented letters"
            ],
            correct: 3,
            explanation: `ASCII was designed for English specifically and only has 128 code points — none of which is “é”. The tempting wrong answer is the first one: it's easy to assume "the alphabet" means all Latin letters, but ASCII's alphabet is specifically the unaccented English one.`
          },
          recall: {
            prompt: "Why are 'A' and 'a' exactly 32 apart in ASCII, and what real limitation does ASCII's 7-bit range create?",
            answer: `"A" (65) and "a" (97) are placed exactly 32 apart so that toggling a single bit converts between upper and lower case — a deliberate design choice, not an accident of alphabetical order. The 7-bit range gives only 128 code points, enough for English letters, digits and punctuation but nothing else — no accented letters, no non-Latin scripts — which is why extended and Unicode encodings had to be built afterward.`,
            points: [
              `"A" and "a" are 32 apart, a single-bit case toggle`,
              `This is a deliberate design choice`,
              `ASCII has only 128 code points (7 bits)`,
              `That's enough for English only, not accented/non-Latin text`
            ]
          },
          wisdomTags: ["limits", "tradition"]
        },

        {
          title: "Unicode",
          glossary: [
            { term: "Unicode", definition: "A character encoding standard covering virtually every writing system in the world, unlike ASCII's limited set." }
          ],
          explain: {
            blocks: [
              { text: `Unicode assigns a unique number — a code point — to every character in every writing system a computer might need: Latin letters, Cyrillic, Chinese characters, emoji, mathematical symbols, all of it. Where ASCII tops out at 128 characters, Unicode currently defines well over 100,000.` },
              { heading: "Unicode is not one fixed-width code", text: `Unlike ASCII's neat "one character, one byte," Unicode is an abstract numbering system with several different ENCODINGS for actually storing those numbers as bytes — UTF-8, UTF-16, and UTF-32 are the common ones. UTF-8 uses 1 byte for the first 128 code points (deliberately identical to ASCII) and up to 4 bytes for everything else, which is exactly why plain ASCII text is already valid UTF-8 without any conversion.` },
              { heading: "Why UTF-8 won", text: `UTF-8's variable length looks less convenient than a fixed size, but it's backward-compatible with every ASCII system already in existence and doesn't waste space on English-heavy text the way a fixed 4-byte-per-character scheme would. That combination — full compatibility plus efficiency for the most common case — is why UTF-8 became the dominant encoding on the modern web, not any single technical advantage in isolation.` }
            ],
            analogy: `A single universal phone-number system where every existing number still dials exactly as before for local calls, but can also reach anywhere in the world if you dial more digits. ASCII users dial the short local numbers; everyone else just dials longer ones from the same system.`,
            sources: [
              { ref: `Robertson, S. (2020). <em>BC, Before Computers: On Information Technology from Writing to the Age of Digital Data</em>, ch. 5 "Coding for the modern era" (pp. 53–54). Open Book Publishers.`, note: `Historical context for why a universal successor to ASCII was needed.` },
              { ref: `The Unicode Consortium. (n.d.). <em>What is Unicode?</em> https://unicode.org/standard/WhatIsUnicode.html`, note: `The code-point definition and the scale of scripts covered, from the standard's own authority.` }
            ]
          },
          example: {
            label: "The same text, two encodings",
            steps: [
              `The word "cat" encoded in ASCII: 3 bytes, one per letter, values 99-97-116.`,
              `The same word "cat" encoded in UTF-8: still 3 bytes, IDENTICAL values — UTF-8 deliberately matches ASCII for the first 128 code points.`,
              `The word "café" encoded in UTF-8: 5 bytes, not 4 — the accented "é" needs 2 bytes in UTF-8, something plain ASCII couldn't represent at all.`
            ]
          },
          quiz: {
            question: "A developer assumes 'string length in characters' always equals 'string length in bytes,' and their program miscounts the length of any text containing accented letters or emoji. What's the actual relationship between characters and bytes in UTF-8?",
            options: [
              "They're always equal — UTF-8 uses exactly 1 byte per character",
              "A UTF-8 character can take 1 to 4 bytes, so character count and byte count often differ",
              "UTF-8 always uses exactly 4 bytes per character, no exceptions",
              "Byte count is always exactly double the character count"
            ],
            correct: 1,
            explanation: `UTF-8 is a variable-length encoding — plain ASCII characters take 1 byte, but accented letters, non-Latin scripts, and emoji can take 2-4 bytes each. The tempting wrong answer is "1 byte always," since that's true specifically for plain English text, which is probably what the developer tested with before shipping.`
          },
          recall: {
            prompt: "What problem does Unicode solve that ASCII structurally cannot, and why is UTF-8 specifically designed to stay backward-compatible with ASCII?",
            answer: `Unicode assigns a unique code point to essentially every character in every writing system, solving ASCII's fundamental 128-character ceiling that left out non-English scripts, accented letters, and symbols entirely. UTF-8 encodes the first 128 Unicode code points identically to ASCII's own byte values, so any valid ASCII text is automatically valid UTF-8 with zero conversion — existing ASCII systems and files keep working unmodified even as the standard scales to cover the rest of the world's writing systems.`,
            points: [
              `Unicode assigns a code point to virtually every character in every script`,
              `Solves ASCII's 128-character ceiling`,
              `UTF-8 is variable-length (1-4 bytes per character)`,
              `UTF-8's first 128 code points match ASCII exactly, for compatibility`
            ]
          },
          wisdomTags: ["change", "beginning"]
        },

        {
          title: "Choosing an Encoding in Practice",
          glossary: [
            { term: "Mojibake", definition: "Garbled text that results from decoding data with the wrong character encoding." }
          ],
          explain: {
            blocks: [
              { text: `None of ASCII, Unicode, or a language-specific extended set is universally "correct" — the right choice depends on what the text actually needs to represent, and getting it wrong is one of the most common real-world sources of corrupted text, often called "mojibake."` },
              { heading: "The core failure mode", text: `Mojibake happens when text is ENCODED in one scheme (say, UTF-8) but DECODED assuming a different one (say, an older single-byte Latin encoding) — every accented character turns into a short run of unrelated symbols, while plain unaccented letters usually survive untouched, because that's the range where most encodings overlap with ASCII.` },
              { heading: "The practical rule", text: `Modern systems default to UTF-8 specifically because it's both universal (able to represent anything Unicode defines) and safe for legacy ASCII data (no conversion needed for plain English). The failure cases that remain almost always trace back to a missing or wrong declaration of WHICH encoding a piece of text is in — the bytes on disk never announce their own encoding, exactly the same ambiguity number bases had at the very start of this unit.` }
            ],
            analogy: `Reading a menu written in a code where the same letters mean different things under different rulebooks — the letters themselves are unambiguous, but which rulebook applies isn't written anywhere on the page. Guessing the wrong rulebook doesn't corrupt the words; it makes them mean the wrong thing.`,
            sources: [
              { ref: `Ndjountche, T. (2016). <em>Digital Electronics 1: Combinational Logic Circuits</em>, §1.12 (pp. 46–49). John Wiley &amp; Sons.`, note: `The overview of coding representations this topic's three chunks are drawn from.` },
              { ref: `The Unicode Consortium. (n.d.). <em>What is Unicode?</em> https://unicode.org/standard/WhatIsUnicode.html`, note: `Practical guidance on UTF-8 as the recommended default encoding for new systems.` }
            ]
          },
          example: {
            label: "Same bytes, three readings",
            steps: [
              `A file's bytes are correctly UTF-8, and it's read as UTF-8 — the text "café" displays correctly.`,
              `The identical bytes are read assuming an older single-byte Latin encoding instead — the accented "é" (2 bytes in UTF-8) displays as two unrelated symbols, while "caf" still reads fine.`,
              `The identical bytes are read assuming EBCDIC — even the plain letters "c", "a", "f" now display wrong, since EBCDIC and UTF-8/ASCII don't overlap the way UTF-8 and old Latin encodings do.`
            ]
          },
          quiz: {
            question: "A web page's plain English text displays perfectly, but every apostrophe and em-dash shows up as a short string of strange symbols like â€™. What does this specific pattern suggest?",
            options: [
              "The file is randomly corrupted and unrecoverable",
              "The font installed on the device is missing",
              "A UTF-8 file is being decoded with the wrong (legacy single-byte) encoding assumption",
              "A file is EBCDIC-encoded and being read as ASCII"
            ],
            correct: 2,
            explanation: `Plain letters surviving while only accented/special characters break is the signature of a UTF-8-vs-legacy-encoding mismatch specifically — those multi-byte UTF-8 sequences get misread as several separate legacy characters. If the file were truly corrupted, or the mismatch were with something as unrelated as EBCDIC, the plain letters would break too, not just the special ones.`
          },
          recall: {
            prompt: "What causes 'mojibake' (garbled text from an encoding mismatch), and why do plain English letters often survive it while accented characters don't?",
            answer: `Mojibake happens when text encoded in one scheme is decoded assuming a different one. Plain English letters often survive because most common encodings (ASCII, UTF-8, and most legacy Latin encodings) agree on the same values for the basic unaccented alphabet — that's the range where they overlap. Accented characters and symbols sit in the range where the encodings disagree, so those are exactly the characters that turn into garbage when the wrong encoding is assumed.`,
            points: [
              `Mojibake = encoded in one scheme, decoded assuming another`,
              `Plain ASCII-range letters usually overlap across encodings`,
              `Accented/special characters sit outside that overlap`,
              `The bytes themselves never state which encoding they're in`
            ]
          },
          wisdomTags: ["evidence", "correction"]
        }
      ],
      examQuestions: [
        {
          question: "How many code points does standard 7-bit ASCII provide?",
          options: ["256", "128", "64", "1024"],
          correct: 1
        },
        {
          question: "Why are 'A' (65) and 'a' (97) exactly 32 apart in ASCII?",
          options: [
            "Alphabetical coincidence",
            "Because 32 is the size of the alphabet",
            "So a single bit flip toggles letter case",
            "To leave room for punctuation between them"
          ],
          correct: 2
        },
        {
          question: "What is a Unicode 'code point'?",
          options: [
            "A unique number assigned to a character across virtually every writing system",
            "A synonym for a single byte",
            "A fixed 2-byte value used only for English text",
            "An error code shown when text fails to decode"
          ],
          correct: 0
        },
        {
          question: "Why is plain ASCII text automatically valid UTF-8, with no conversion needed?",
          options: [
            "It isn't — ASCII always requires conversion first",
            "ASCII and UTF-8 are actually the same standard under different names",
            "UTF-8 ignores the first 128 code points entirely",
            "UTF-8's first 128 code points are deliberately identical to ASCII's byte values"
          ],
          correct: 3
        },
        {
          question: "Text displays correctly for plain English letters but shows garbled symbols for every accented character. What does this pattern most likely indicate?",
          options: [
            "The file is randomly corrupted",
            "The font installed on the device is missing",
            "A UTF-8 file is being decoded with the wrong (legacy single-byte) encoding assumption",
            "A file is EBCDIC-encoded and being read as ASCII"
          ],
          correct: 2
        }
      ]
    }
  ]
};
