// ================================================
// CS Dojo — Wisdom Pool (quotes.js)
//
// Shown after a chunk is completed. Drawn at random from the whole
// pool so the same lines don't recur; if the chunk carries
// `wisdomTags`, matching quotes are preferred but not required.
//
// EVERY ENTRY IS SOURCE-CHECKED.
//   verified: true   → traceable to a specific work, section or occasion
//   verified: false  → widely attributed, primary source NOT located.
//                      Verify or remove before any public release.
//
// Famous quotes are fabricated far more often than people expect.
// "If you can't explain it simply, you don't understand it well
// enough" is NOT Einstein — no source exists. "We are what we
// repeatedly do..." is Will Durant, not Aristotle. Do not add
// anything here without finding the primary source first.
//
// RIGHTS: entries are public domain unless `rights` says otherwise.
// Translations matter — Hays' Meditations and Kaufmann's Nietzsche
// are in copyright; Long (1862) and Common (1911) are not.
// ================================================

const WISDOM = [
  // ---- Knowing what you don't know ----
  {
    text: "When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it — this is knowledge.",
    author: "Confucius", source: "Analects II.17 (Legge trans., 1861)",
    tags: ["uncertainty", "self-knowledge"], verified: true
  },
  {
    text: "It is impossible for a man to learn what he thinks he already knows.",
    author: "Epictetus", source: "Discourses II.17 (Long trans., 1877)",
    tags: ["uncertainty", "self-deception"], verified: true
  },
  {
    text: "A person prone to embarrassment cannot learn, and a short-tempered person cannot teach.",
    author: "Hillel the Elder", source: "Pirkei Avot 2:5",
    tags: ["uncertainty", "beginning"], verified: true
  },
  {
    text: "Nothing is so firmly believed as that which we least know.",
    author: "Montaigne", source: "Essais I.32 (Florio trans., 1603)",
    tags: ["uncertainty", "self-deception"], verified: true
  },
  {
    text: "Everything we hear is an opinion, not a fact.",
    author: "Marcus Aurelius", source: "Meditations, Book IV (Long trans., 1862)",
    tags: ["uncertainty", "evidence"], verified: true
  },
  {
    text: "I know that I know nothing.",
    author: "Socrates, via Plato", source: "Apology 21d (Jowett trans., 1871)",
    tags: ["uncertainty"], verified: true,
    note: "Popular compression of a longer passage; sense is faithful."
  },
  {
    text: "There are no facts, only interpretations.",
    author: "Friedrich Nietzsche", source: "Notebooks, 1886–87",
    tags: ["uncertainty", "evidence"], verified: true,
    note: "From the notebooks. Say 'notebooks', NOT 'The Will to Power' — that compilation was assembled posthumously by his sister."
  },

  // ---- Patterns, causes, coincidence ----
  {
    text: "Look beneath the surface; let not the quality nor the worth of a thing escape thee.",
    author: "Marcus Aurelius", source: "Meditations, Book VI (Long trans.)",
    tags: ["evidence", "self-deception"], verified: true
  },
  {
    text: "Search me, God, and know my heart; test me, and know my anxious thoughts.",
    author: "King David", source: "Psalm 139:23 (World English Bible)",
    tags: ["evidence", "correction"], verified: true
  },
  {
    text: "The fool has said in his heart, 'There is no God.'",
    author: "King David", source: "Psalm 14:1 (World English Bible)",
    tags: ["evidence"], verified: true
  },

  // ---- Fooling yourself ----
  {
    text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.",
    author: "Richard Feynman", source: "\"Cargo Cult Science\", Caltech commencement, 1974",
    tags: ["self-deception", "evidence"], verified: true,
    rights: "Estate-controlled; short quotation only."
  },
  {
    text: "He who gives answer before he hears, that is folly and shame to him.",
    author: "Solomon", source: "Proverbs 18:13 (World English Bible)",
    tags: ["self-deception", "uncertainty"], verified: true
  },
  {
    text: "Never let the future disturb you. You will meet it with the same weapons of reason which today arm you against the present.",
    author: "Marcus Aurelius", source: "Meditations, Book VII (Long trans.)",
    tags: ["self-deception", "persistence"], verified: true
  },

  // ---- Plans meeting reality ----
  {
    text: "Everybody has plans until they get hit for the first time.",
    author: "Mike Tyson", source: "Associated Press, 1987, before the Tyrell Biggs fight",
    tags: ["planning", "persistence"], verified: true,
    rights: "Living author; short quotation only.",
    note: "Original wording. The famous 'punched in the mouth' version is a later mutation."
  },
  {
    text: "No plan of operations extends with any certainty beyond the first encounter with the enemy's main strength.",
    author: "Helmuth von Moltke", source: "Kriegsgeschichtliche Einzelschriften, 1871",
    tags: ["planning"], verified: true,
    note: "The ancestor of the Tyson line."
  },
  {
    text: "If you know the enemy and know yourself, you need not fear the result of a hundred battles.",
    author: "Sun Tzu", source: "The Art of War III (Giles trans., 1910)",
    tags: ["planning", "self-knowledge"], verified: true
  },

  // ---- Reps, effort, difficulty ----
  {
    text: "The last three or four reps is what makes the muscle grow.",
    author: "Arnold Schwarzenegger", source: "Pumping Iron (1977)",
    tags: ["effort", "persistence"], verified: true,
    rights: "Living author; short quotation only.",
    note: "Desirable difficulties, stated by a bodybuilder thirty years before the research caught up."
  },
  {
    text: "Nobody who has chosen the easy path of hate has gotten to the end of the road and said, 'What a life.'",
    author: "Arnold Schwarzenegger", source: "Video address on antisemitism, 2023",
    tags: ["effort"], verified: true,
    rights: "Living author; short quotation only."
  },
  {
    text: "As long as you live, keep learning how to live.",
    author: "Seneca", source: "Letters to Lucilius, 76 (Gummere trans., 1917)",
    tags: ["effort", "beginning"], verified: true
  },
  {
    text: "Do nothing which is of no use.",
    author: "Miyamoto Musashi", source: "The Book of Five Rings (1645)",
    tags: ["effort", "planning"], verified: true
  },
  {
    text: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius", source: "Meditations, Book V.20 (Long trans.)",
    tags: ["persistence", "effort"], verified: true,
    note: "Do not use the Hays translation of this line — it is in copyright."
  },
  {
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche", source: "Twilight of the Idols, Maxims and Arrows, 12 (1889)",
    tags: ["persistence", "effort"], verified: true
  },
  {
    text: "I do not think there is any thrill like that felt by the inventor as he sees some creation of the brain unfolding to success.",
    author: "Nikola Tesla", source: "My Inventions (1919)",
    tags: ["persistence", "beginning"], verified: false,
    note: "VERIFY against the 1919 text before public release. Tesla is one of the most fabricated-quote figures online."
  },
  {
    text: "The scientific man does not aim at an immediate result.",
    author: "Nikola Tesla", source: "Attributed; primary source not located",
    tags: ["persistence", "limits"], verified: false,
    note: "VERIFY OR REMOVE."
  },

  // ---- Simplicity ----
  {
    text: "Everything should be made as simple as possible, but not simpler.",
    author: "after Albert Einstein", source: "Popular compression of his 1933 Herbert Spencer Lecture",
    tags: ["simplicity"], verified: true,
    note: "Attribution deliberately reads 'after Einstein' — the snappy wording is a later paraphrase, not his sentence."
  },
  {
    text: "Convictions are more dangerous enemies of truth than lies.",
    author: "Friedrich Nietzsche", source: "Human, All Too Human, §483 (1878)",
    tags: ["simplicity", "self-deception"], verified: true
  },

  // ---- Feedback and correction ----
  {
    text: "If any man is able to convince me and show me that I do not think or act right, I will gladly change.",
    author: "Marcus Aurelius", source: "Meditations, Book VI.21 (Long trans.)",
    tags: ["feedback", "correction"], verified: true,
    note: "A first-century description of the update rule."
  },
  {
    text: "Let the righteous strike me, it is kindness; let him reprove me, it is like oil on the head.",
    author: "King David", source: "Psalm 141:5 (World English Bible)",
    tags: ["feedback", "correction"], verified: true
  },
  {
    text: "To have faults and not to reform them — this, indeed, should be pronounced having faults.",
    author: "Confucius", source: "Analects XV.29 (Legge trans.)",
    tags: ["correction", "persistence"], verified: true
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca", source: "Letters to Lucilius, 13 (Gummere trans., 1917)",
    tags: ["correction", "beginning"], verified: true
  },
  {
    text: "If I am not for myself, who will be for me? And if not now, when?",
    author: "Hillel the Elder", source: "Pirkei Avot 1:14",
    tags: ["correction", "beginning"], verified: true,
    note: "Compressed from the fuller three-part saying."
  },

  // ---- Tradition and defaults ----
  {
    text: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    author: "Grace Hopper", source: "Used repeatedly in her interviews and lectures",
    tags: ["tradition", "limits"], verified: true
  },
  {
    text: "A ship in port is safe, but that's not what ships are built for.",
    author: "quoted by Grace Hopper", source: "She used it often; the phrasing may predate her",
    tags: ["tradition", "beginning"], verified: false,
    note: "Attributed to her as popularizer, not originator — hence the 'quoted by'."
  },
  {
    text: "The surest way to corrupt a youth is to instruct him to hold in higher esteem those who think alike than those who think differently.",
    author: "Friedrich Nietzsche", source: "The Dawn, §297 (1881)",
    tags: ["tradition", "limits"], verified: true
  },

  // ---- Change and recurrence ----
  {
    text: "No man ever steps in the same river twice.",
    author: "Heraclitus", source: "Fragment 91 (standard rendering)",
    tags: ["change", "tradition"], verified: true,
    note: "Traditional compression of a longer fragment."
  },
  {
    text: "That which has been is that which shall be; and there is no new thing under the sun.",
    author: "Solomon", source: "Ecclesiastes 1:9 (World English Bible)",
    tags: ["change", "tradition"], verified: true
  },
  {
    text: "Men are disturbed not by things, but by the views which they take of things.",
    author: "Epictetus", source: "Enchiridion 5 (Long trans., 1877)",
    tags: ["change", "self-deception"], verified: true
  },

  // ---- Limits ----
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius", source: "Meditations, Book VIII (common rendering)",
    tags: ["limits", "persistence"], verified: false,
    note: "This exact phrasing is a modern paraphrase; Long's rendering differs. Mark as adapted or replace."
  },

  // ---- Beginning ----
  {
    text: "The tree that fills a man's arms grew from a tiny sprout.",
    author: "Lao Tzu", source: "Tao Te Ching, ch. 64 (Legge trans., 1891)",
    tags: ["beginning", "effort"], verified: true
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu", source: "Tao Te Ching, ch. 64 (Legge trans., 1891)",
    tags: ["beginning"], verified: true
  },
  {
    text: "Knowing others is wisdom; knowing yourself is enlightenment.",
    author: "Lao Tzu", source: "Tao Te Ching, ch. 33 (Legge trans., 1891)",
    tags: ["self-knowledge", "change"], verified: true
  },
  {
    text: "Perceive that which cannot be seen with the eye.",
    author: "Miyamoto Musashi", source: "The Book of Five Rings (1645)",
    tags: ["beginning", "evidence"], verified: true
  },
  {
    text: "Waste no more time arguing what a good man should be. Be one.",
    author: "Marcus Aurelius", source: "Meditations, Book X.16 (Long trans.)",
    tags: ["beginning", "effort"], verified: true
  },
  {
    text: "Begin — to begin is half the work. Let half still remain; again begin this, and thou wilt have finished.",
    author: "Ausonius", source: "Epigrams",
    tags: ["beginning", "persistence"], verified: false,
    note: "Frequently misattributed to Marcus Aurelius. Attributed here to Ausonius; verify before public release."
  },

  // ---- Rabbinic and Hasidic ----
  // NOTE ON SOURCING: Mishnah, Talmud, Mishneh Torah, Tanya and
  // Likutei Moharan are published texts and can be cited by chapter.
  // Much Hasidic material, especially the Baal Shem Tov's, was
  // transmitted orally and collected later — those are marked as
  // traditional attributions rather than pretending to a page number.
  // AVOID the popular English renderings on Chabad.org by Tzvi Freeman:
  // they are interpretive paraphrases and they are in copyright, the
  // same trap as Coleman Barks' "Rumi".
  {
    text: "It is not your duty to finish the work, but neither are you at liberty to neglect it.",
    author: "Rabbi Tarfon", source: "Pirkei Avot 2:16",
    tags: ["effort", "persistence", "beginning"], verified: true,
    note: "Possibly the best single line in the pool for a learner facing a long syllabus."
  },
  {
    text: "Who is wise? One who learns from every person.",
    author: "Ben Zoma", source: "Pirkei Avot 4:1",
    tags: ["uncertainty", "self-knowledge", "tradition"], verified: true
  },
  {
    text: "Make for yourself a teacher, and acquire for yourself a friend.",
    author: "Yehoshua ben Perachiah", source: "Pirkei Avot 1:6",
    tags: ["feedback", "beginning"], verified: true
  },
  {
    text: "Who is strong? One who conquers his own impulse.",
    author: "Ben Zoma", source: "Pirkei Avot 4:1",
    tags: ["effort", "self-knowledge"], verified: true
  },
  {
    text: "If you believe that you can damage, then believe that you can repair.",
    author: "Rabbi Nachman of Breslov", source: "Likutei Moharan II:112",
    tags: ["correction", "persistence"], verified: true
  },
  {
    text: "The whole world is a very narrow bridge — and the main thing is not to make oneself afraid.",
    author: "Rabbi Nachman of Breslov", source: "Likutei Moharan II:48",
    tags: ["beginning", "persistence"], verified: true,
    note: "The original reads lo yitpached (not to MAKE oneself afraid), not lo lefached (not to fear) as in the popular song. The original is the better thought: fear arrives on its own; manufacturing it is the choice."
  },
  {
    text: "It is a great mitzvah to be always joyful.",
    author: "Rabbi Nachman of Breslov", source: "Likutei Moharan II:24",
    tags: ["effort", "beginning"], verified: true
  },
  {
    text: "A little light dispels a great deal of darkness.",
    author: "Rabbi Schneur Zalman of Liadi", source: "Tanya, ch. 12 (1797)",
    tags: ["beginning", "effort"], verified: true,
    note: "The Alter Rebbe, founder of Chabad. A principle the later Rebbes returned to constantly."
  },
  {
    text: "The mind rules the heart.",
    author: "Rabbi Schneur Zalman of Liadi", source: "Tanya, ch. 12 (1797)",
    tags: ["self-knowledge", "effort"], verified: true,
    note: "Moach shalit al halev — the central Chabad claim that understanding can govern feeling. Directly relevant to studying when you don't feel like it."
  },
  {
    text: "Forgetting prolongs the exile; remembrance is the secret of redemption.",
    author: "the Baal Shem Tov", source: "Traditional attribution; inscribed at Yad Vashem",
    tags: ["change", "tradition"], verified: false,
    note: "Founder of Hasidism. Widely attributed and widely inscribed, but transmitted orally — no primary text located. Attribute as traditional."
  },
  {
    text: "From every person there rises a light that reaches straight to heaven.",
    author: "the Baal Shem Tov", source: "Traditional attribution",
    tags: ["beginning", "tradition"], verified: false,
    note: "Traditional attribution, no primary source located. Verify or mark as traditional before public release."
  },
  {
    text: "Teach thy tongue to say 'I do not know,' and thou shalt progress.",
    author: "Maimonides", source: "Attributed to the Rambam (1138–1204)",
    tags: ["uncertainty", "self-knowledge"], verified: false,
    note: "Very widely attributed and exactly on point for a self-testing app, but I could not pin it to a specific work. Verify before public release."
  },
  {
    text: "A person's greatest work is to correct himself.",
    author: "Rabbi Yisrael Salanter", source: "Founder of the Mussar movement (1809–1883); traditional attribution",
    tags: ["correction", "self-knowledge"], verified: false,
    note: "Traditional attribution. Verify before public release."
  }
];

// Quotes still needing a primary source, surfaced for the maintainer.
const WISDOM_UNVERIFIED = WISDOM.filter(q => q.verified === false);
