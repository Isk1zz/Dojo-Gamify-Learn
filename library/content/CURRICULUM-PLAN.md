# Curriculum plan — the four science courses

Planning doc. Nothing here is built. Decided 2026-08-16: add Physics,
Chemistry, Biology and Science Literacy as **ongoing development** —
registered but `available: false`, so they render as locked "coming
soon" cards rather than pretending to be finished.

---

## 1. Sources — read this before writing anything

### Use OpenStax as the spine

**openstax.org** — university-level textbooks, free, and **CC BY
licensed**. That licence is the important part and it changes what you
are allowed to do:

| | Course textbooks (current) | OpenStax (CC BY) |
|---|---|---|
| Cite it | yes | yes |
| Quote a line | sparingly | yes |
| **Adapt a figure or example** | **no** | **yes, with attribution** |
| Build a course on its structure | risky | **yes** |

`CONTENT-MODEL.md` §5 exists because the CS textbooks are
all-rights-reserved and one is CC BY-NC-ND. Those constraints mostly go
away with OpenStax. **You still write your own analogies** — that rule
is about quality, not just law — but you are no longer working around a
licence.

Relevant titles: *College Physics 2e*, *Chemistry 2e*, *Biology 2e*,
*Concepts of Biology*, *Astronomy 2e*.

### Other safe references
- **NIST** (nist.gov) — constants, units, measurement. US government
  work, public domain.
- **NASA** — astronomy and earth science, public domain.
- **PubChem / NCBI** (nih.gov) — chemical and biological data, public
  domain.
- **PhET** (Colorado) — simulations, CC BY. Good for *example* phases.

**Still never invent a citation** — not a page, not an edition, not a
figure number. Same rule as `quotes.js`. A wrong citation is worse than
none because it looks checkable.

---

## 2. Unit id allocation

Intro to CS occupies **1–8**. Reusing an id silently shares progress,
reviews and Garden plants — see `_template/course.js`.

| Course | Unit ids |
|---|---|
| Physics | 9–14 |
| Chemistry | 15–20 |
| Biology | 21–26 |
| Science Literacy | 27–30 |

---

## 3. Physics — units 9–14
Best fit for the **example** phase: problems with steps.

| Unit | Title | Topics |
|---|---|---|
| 9 | Motion & Forces | position/velocity/acceleration · Newton's three laws · friction · circular motion · projectiles · free-body diagrams |
| 10 | Energy & Momentum | work · kinetic/potential energy · conservation · power · momentum · collisions |
| 11 | Matter & Thermodynamics | states of matter · temperature vs heat · gas laws · the three laws · entropy |
| 12 | Waves & Sound | wave anatomy · interference · standing waves · Doppler · resonance |
| 13 | Electricity & Magnetism | charge · current/voltage/resistance · circuits · magnetic fields · induction |
| 14 | Light & Modern Physics | reflection/refraction · lenses · EM spectrum · photoelectric effect · relativity (intro) |

## 4. Chemistry — units 15–20
Exercises **both** phases: conceptual models plus calculable problems.

| Unit | Title | Topics |
|---|---|---|
| 15 | Atoms & Elements | atomic structure · isotopes · electron configuration · periodic trends |
| 16 | Bonding | ionic · covalent · metallic · polarity · intermolecular forces · shapes (VSEPR) |
| 17 | Reactions & Stoichiometry | equation types · balancing · the mole · limiting reagents · yield |
| 18 | States & Solutions | gas laws · phase diagrams · concentration · solubility · colligative properties |
| 19 | Energy & Equilibrium | enthalpy · Hess's law · reaction rates · equilibrium · Le Châtelier |
| 20 | Acids, Bases & Redox | pH · strong vs weak · buffers · titration · oxidation states · electrochemistry |

## 5. Biology — units 21–26
Highest concept density; **the best fit for spaced review**, because
terminology and mechanisms decay fastest without revisiting.

| Unit | Title | Topics |
|---|---|---|
| 21 | The Cell | cell theory · prokaryote vs eukaryote · organelles · membranes · transport |
| 22 | Energy in Life | enzymes · ATP · photosynthesis · cellular respiration · fermentation |
| 23 | Genetics | DNA structure · replication · transcription/translation · mutation · Mendelian inheritance |
| 24 | Evolution | natural selection · evidence · speciation · phylogeny · population genetics |
| 25 | Human Systems | circulatory · respiratory · nervous · digestive · immune · homeostasis |
| 26 | Ecology | populations · communities · energy flow · nutrient cycles · biodiversity |

## 6. Science Literacy — units 27–30
Not a survey of the other three. **How science works**, which nothing
else here teaches and which transfers to every subject.

| Unit | Title | Topics |
|---|---|---|
| 27 | Method & Evidence | hypothesis vs theory · controls · variables · replication · peer review |
| 28 | Data & Statistics | mean/median/spread · correlation vs causation · sample size · significance · common chart lies |
| 29 | Reasoning & Bias | falsifiability · confirmation bias · anecdote vs data · burden of proof · cherry-picking |
| 30 | Science in the World | reading a paper · press release vs study · consensus · uncertainty · scientific vs pseudo |

---

## 7. Suggested build order

1. **Science Literacy first.** Shortest (4 units), needs no maths, and
   teaches the reasoning the other three lean on. It is also the most
   defensible content to write from scratch — method and reasoning are
   concepts, not anyone's expression.
2. **Biology** — highest topic density per unit of effort, and the
   material the review system helps most.
3. **Chemistry**, then **Physics** — both want careful worked examples,
   which are the slowest chunks to write well.

## 8. Per-course shape (from `_template/course.js`)
- 6 topics per module, 3 chunks per topic, 5 exam questions per topic
- ~200 words of explanation per chunk (modules 1–4 of intro-cs average
  84 — that is the known weak spot, not the target)
- 2 real citations per chunk
- Questions test **application**, not recognition
- `predict` on the first chunk of a topic, `recall` on the last
- Run `node library/content/check-content.js <slug>` before committing
