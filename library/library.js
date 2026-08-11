// ================================================
// CS Dojo — LIBRARY (was: Courses)
// ------------------------------------------------
// Courses -> Units -> Topics -> Lesson chunks -> Mastery exam.
// This is the only branch that touches course content. Content
// itself is pure data in library/content/ and is never edited here.
// Emits: chunk:completed, topic:completed, exam:finished, review:finished
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const state = Dojo.state;
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const Bus = Dojo.Bus;
  const shuffled = (...a) => Dojo.shuffled(...a);
  const shuffleQuestion = (...a) => Dojo.shuffleQuestion(...a);
  const pickQuote = (...a) => Dojo.pickQuote(...a);
  const quoteHtml = (...a) => Dojo.quoteHtml(...a);
  const awardCharge = (...a) => Dojo.awardCharge(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const showLobby = (...a) => Dojo.showLobby(...a);
  const updateProfileBadge = (...a) => Dojo.updateProfileBadge(...a);

  // Totals other branches ask for instead of walking ALL_TOPICS
  // themselves. Keeps content knowledge inside this branch.
  function libraryTotals() {
    const done = DB.getCompletedTopics();
    return {
      courses: COURSES.length,
      topics: ALL_TOPICS.length,
      completed: ALL_TOPICS.filter(t => done.has(t.id)).length
    };
  }

  function renderCourseSelect() {
    const body = document.getElementById("course-select-body");
    body.innerHTML = "";
    const completedTopics = DB.getCompletedTopics();

    const grid = document.createElement("div");
    grid.className = "topic-grid";

    COURSES.forEach(c => {
      const topics = c.units.flatMap(id => UNIT_TOPICS[id] || []);
      const done = topics.filter(t => completedTopics.has(t.id)).length;
      const pct = topics.length ? Math.round((done / topics.length) * 100) : 0;

      const card = document.createElement("div");
      card.className = `topic-card course-card${c.available ? "" : " ahead"}`;
      card.innerHTML = `
        <div class="topic-num">${c.icon}</div>
        <div class="topic-title">${c.title}</div>
        <div class="topic-desc">${c.subtitle}</div>
        <div class="topic-meta">
          <span>${c.units.length} units</span>
          <span>·</span>
          <span>${topics.length} topics</span>
          <span>·</span>
          <span>${pct}% complete</span>
          ${c.available ? "" : '<span class="topic-badge ahead-badge">Coming soon</span>'}
        </div>
        <div class="course-progress"><div class="course-progress-fill" style="width:${pct}%"></div></div>
      `;
      if (c.available) {
        card.addEventListener("click", () => {
          state.currentCourse = c.id;
          renderUnitSelect();
          showScreen("unit-select");
        });
      }
      grid.appendChild(card);
    });

    body.appendChild(grid);
    showScreen("course-select");
  }

  function renderUnitSelect() {
    const body = document.getElementById("unit-select-body");
    body.innerHTML = "";
    const completedTopics = DB.getCompletedTopics();
    const course = COURSES.find(c => c.id === state.currentCourse);
    const unitsToShow = course ? UNITS.filter(u => course.units.includes(u.id)) : UNITS;

    const grid = document.createElement("div");
    grid.className = "topic-grid";

    unitsToShow.forEach(u => {
      const topics = UNIT_TOPICS[u.id];
      const done = topics.filter(t => completedTopics.has(t.id)).length;
      const pct = topics.length > 0 ? Math.round((done / topics.length) * 100) : 0;

      const card = document.createElement("div");
      card.className = "topic-card";
      card.innerHTML = `
        <div class="topic-num">${u.icon}</div>
        <div class="topic-title">${u.title} — ${u.subtitle}</div>
        <div class="topic-desc">${topics.length} topics across ${u.modules.length} module${u.modules.length !== 1 ? "s" : ""}.</div>
        <div class="topic-meta">
          <span>${done}/${topics.length} mastered</span>
          <span>·</span>
          <span>${pct}% complete</span>
          ${pct === 100 ? '<span class="topic-badge mastered">✓ Mastered</span>' : ""}
        </div>
      `;
      card.addEventListener("click", () => selectUnit(u.id));
      grid.appendChild(card);
    });

    body.appendChild(grid);
    updateProfileBadge();
  }

  function selectUnit(unitId) {
    state.currentUnit = unitId;
    state.currentTopics = UNIT_TOPICS[unitId];
    showScreen("topic-map");
    renderTopicMap();
  }

  // ---- Topic Map (scoped to state.currentUnit) ----
  function renderTopicMap() {
    const unit = UNITS.find(u => u.id === state.currentUnit);
    const body = document.getElementById("topic-map-body");
    document.getElementById("topic-map-unit-label").textContent = `${unit.title} · ${unit.subtitle}`;
    body.innerHTML = "";

    const completedTopics = DB.getCompletedTopics();
    const dueIds = DB.getDueTopicIds();
    let globalIdx = 0;

    // Anything due for review is surfaced above the modules. Without
    // this the app is a course you finish once; with it, it's a study
    // system. Spacing is one of only two techniques rated high-utility
    // in the literature, and it needs no new content.
    if (dueIds.length) {
      const dueTopics = state.currentTopics.filter(t => dueIds.includes(t.id));
      if (dueTopics.length) {
        const due = document.createElement("div");
        due.className = "due-section";
        due.innerHTML = `
          <div class="due-header">
            <span class="due-icon">🔁</span>
            <span class="due-title">Due for review</span>
            <span class="due-count">${dueTopics.length}</span>
          </div>
          <div class="due-hint">Coming back to these now is worth more than new material.</div>
          <div class="due-grid"></div>`;
        body.appendChild(due);
        const dueGrid = due.querySelector(".due-grid");
        dueTopics.forEach(t => {
          const idx = state.currentTopics.findIndex(x => x.id === t.id);
          const chip = document.createElement("button");
          chip.className = "due-chip";
          chip.innerHTML = `<span>${t.icon}</span> ${t.title}`;
          chip.addEventListener("click", () => startTopic(idx));
          dueGrid.appendChild(chip);
        });
      }
    }

    unit.modules.forEach((mod) => {
      const section = document.createElement("div");
      section.className = "module-section";

      const modDone = mod.topics.filter(t => completedTopics.has(t.id)).length;
      const modPct = Math.round((modDone / mod.topics.length) * 100);

      section.innerHTML = `
        <div class="module-header">
          <span class="module-icon">${mod.icon}</span>
          <span class="module-title">${mod.title}</span>
          <div class="module-progress">
            <div class="module-progress-bar">
              <div class="module-progress-fill" style="width:${modPct}%"></div>
            </div>
            <span>${modDone}/${mod.topics.length}</span>
          </div>
        </div>
        <div class="topic-grid"></div>
      `;

      body.appendChild(section);
      const grid = section.querySelector(".topic-grid");

      mod.topics.forEach((topic) => {
        const flatIdx = globalIdx;
        const isCompleted = completedTopics.has(topic.id);
        const isDue = dueIds.includes(topic.id);
        // Everything is open. The old hard lock enforced blocked
        // practice (the thing interleaving beats) and removed choice
        // (the autonomy need that actually drives motivation). Order
        // is now a recommendation, not a gate.
        const isAvailable = true;
        const prereqDone = flatIdx === 0 || completedTopics.has(state.currentTopics[flatIdx - 1].id);
        const isRecommended = prereqDone && !isCompleted;
        const isAhead = !prereqDone && !isCompleted;
        const isCurrent = isRecommended;
        const dueIn = isCompleted ? DB.daysUntilDue(topic.id) : null;

        const card = document.createElement("div");
        card.className = `topic-card${isCompleted ? " completed" : ""}${isCurrent ? " current" : ""}${isDue ? " due" : ""}${isAhead ? " ahead" : ""}`;
        card.innerHTML = `
          <div class="topic-num">${isCompleted ? "✓" : flatIdx + 1}</div>
          <div class="topic-title">${topic.icon} ${topic.title}</div>
          <div class="topic-desc">${topic.desc}</div>
          <div class="topic-meta">
            <span>${topic.chunks.length} chunks</span>
            <span>·</span>
            <span>${topic.examQuestions.length}-q exam</span>
            ${isDue ? '<span class="topic-badge due-badge">🔁 Due now</span>'
              : isCompleted ? `<span class="topic-badge mastered">✓ Review in ${dueIn}d</span>` : ""}
            ${isRecommended ? '<span class="topic-badge recommended">→ Recommended next</span>' : ""}
            ${isAhead ? '<span class="topic-badge ahead-badge">⤴ Jumping ahead</span>' : ""}
          </div>
        `;

        card.addEventListener("click", () => startTopic(flatIdx));
        grid.appendChild(card);
        globalIdx++;
      });
    });

    updateGlobalProgress();
    updateProfileBadge();
  }

  function updateGlobalProgress() {
    // Ring reflects progress within the CURRENTLY SELECTED unit only.
    const completedTopics = DB.getCompletedTopics();
    const total = state.currentTopics.length;
    const done = state.currentTopics.filter(t => completedTopics.has(t.id)).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("global-pct").textContent = pct + "%";
    const circle = document.getElementById("global-progress");
    const circumference = 2 * Math.PI * 20;
    circle.style.strokeDashoffset = circumference - (pct / 100) * circumference;
  }

  // ---- Lesson ----
  function startTopic(flatIdx, forceChunk) {
    state.missedChunks = [];
    state.inRetry = false;
    state.topicCharge = 0;
    state.currentTopicIdx = flatIdx;
    const topic = state.currentTopics[flatIdx];
    // completedChunks has been recorded since the first version and was
    // never read by anything. This is what it was for: come back to the
    // first chunk you haven't finished, not to the start of the topic.
    state.currentChunk = (typeof forceChunk === "number")
      ? forceChunk
      : DB.resumeChunkFor(topic.id, topic.chunks.length);
    state.chunkPhase = phasesFor(topic.chunks[state.currentChunk])[0];
    state.quizAnswer = null;
    state.quizSubmitted = false;
    state.predictAnswer = null;
    DB.setPosition(state.currentUnit, topic.id, state.currentChunk);
    showScreen("lesson");
    renderChunk();
  }

  function getTopic() {
    return state.currentTopics[state.currentTopicIdx];
  }

  // ---- The five-phase chunk flow ----
  //
  //   predict -> explain -> example -> apply -> recall
  //
  // `predict` and `recall` are OPTIONAL. A chunk without them runs the
  // old three-phase flow untouched, so every existing module keeps
  // working and new content can adopt the phases one chunk at a time.
  // This is why the schema was frozen before the remaining Unit 8
  // modules were written — retrofitting ~60 chunks later would have
  // cost far more than an optional field costs now.
  //
  // The evidence, so a later change doesn't undo it by accident:
  //   PREDICT — a question asked BEFORE instruction. Guessing wrong
  //     still improves later retention (the pretesting effect); the
  //     value is in the attempt, not the answer, so it is never scored
  //     and never counts against the learner.
  //   RECALL — a free-text prompt with NO options at the end. Producing
  //     an answer beats recognising one (the generation effect), which
  //     is exactly what multiple choice can't test. Self-graded,
  //     because grading free text offline isn't possible and a wrong
  //     self-grade costs nothing here.
  //
  // `apply` is the existing multiple-choice question, renamed in the
  // flow but still `chunk.quiz` in the data — renaming the field would
  // invalidate saved progress for no gain.
  const PHASE_META = {
    predict: { key: "predict", icon: "\u{1F52E}", label: "Predict", next: "See the explanation" },
    explain: { key: "explain", icon: "\u{1F4D6}", label: "Explanation", next: "See Example" },
    example: { key: "example", icon: "\u{1F9EA}", label: "Example", next: "Answer Question" },
    apply:   { key: "quiz",    icon: "\u2753",     label: "Question", next: "Next" },
    recall:  { key: "recall",  icon: "\u{1F9E0}", label: "Recall", next: "Next" }
  };

  // The phases this chunk actually has, in order.
  function phasesFor(chunk) {
    const list = [];
    if (chunk.predict) list.push("predict");
    list.push("explain", "example", "quiz");
    if (chunk.recall) list.push("recall");
    return list;
  }

  function phaseStep(dir) {
    const topic = getTopic();
    const list = phasesFor(topic.chunks[state.currentChunk]);
    const i = list.indexOf(state.chunkPhase);
    return list[i + dir] || null;
  }

  // ---- Chunk-question shuffling ----
  //
  // Chunk questions used to render in the order they were written, and
  // that order was badly skewed: module 3 answered B on ten of eleven
  // questions, module 4 on sixteen of eighteen. Pressing B cleared
  // units 6-7 without reading a word.
  //
  // Exams have shuffled per attempt since v2 (startExam). This gives
  // chunk questions the same treatment, which fixes every existing
  // module and every future one in one place — the alternative was
  // hand-rebalancing 57 answer keys and hoping the next author is
  // careful. Content standards still ask for a real A-D spread; this
  // just means a lapse can no longer be exploited.
  //
  // Local rather than core's shuffleQuestion because a chunk quiz
  // carries an `explanation` that must survive the copy.
  function shuffleOptions(q) {
    const order = shuffled(q.options.map((_, i) => i));
    return {
      ...q,
      options: order.map(i => q.options[i]),
      correct: order.indexOf(q.correct)
    };
  }

  // Shuffled ON ENTRY to the phase and parked in state — never inside
  // renderQuiz, which runs again on every click. Reshuffling under a
  // selected answer would move the option out from under the cursor.
  function openQuiz() {
    const topic = getTopic();
    state.quizView = shuffleOptions(topic.chunks[state.currentChunk].quiz);
    state.quizViewFor = topic.id + ":" + state.currentChunk;
    state.quizAnswer = null;
    state.quizSubmitted = false;
    state.chunkPhase = "quiz";
  }

  // Falls back to the written order if we somehow arrive at the quiz
  // without going through openQuiz — a wrong order beats a crash.
  function quizView(chunk) {
    const key = getTopic().id + ":" + state.currentChunk;
    return (state.quizViewFor === key && state.quizView) ? state.quizView : chunk.quiz;
  }

  function renderChunk() {
    const topic = getTopic();
    const chunk = topic.chunks[state.currentChunk];
    const body = document.getElementById("lesson-body");

    // Progress counts real phases, so a chunk with predict/recall shows
    // an honest bar instead of one that jumps.
    const totalPhases = topic.chunks.reduce((n, c) => n + phasesFor(c).length, 0);
    const before = topic.chunks.slice(0, state.currentChunk)
      .reduce((n, c) => n + phasesFor(c).length, 0);
    const currentPhase = before + phasesFor(chunk).indexOf(state.chunkPhase) + 1;
    document.getElementById("lesson-progress-fill").style.width = (currentPhase / totalPhases * 100) + "%";
    document.getElementById("chunk-counter").textContent = `${state.currentChunk + 1}/${topic.chunks.length}`;

    if (state.chunkPhase === "predict") renderPredict(body, chunk);
    else if (state.chunkPhase === "explain") renderExplain(body, chunk);
    else if (state.chunkPhase === "example") renderExample(body, chunk);
    else if (state.chunkPhase === "quiz") renderQuiz(body, chunk);
    else if (state.chunkPhase === "recall") renderRecall(body, chunk);
  }

  // ---- Phase 1: PREDICT (optional) ----
  //
  // Asked BEFORE any instruction. Getting it wrong is fine and expected
  // — the pretesting effect comes from the attempt, not the answer. So:
  // never scored, never recorded in stats, never counted as a miss, and
  // the learner is told outright that guessing is the point. Scoring it
  // would turn the strongest thing about this phase into a punishment
  // for not already knowing the material.
  function renderPredict(body, chunk) {
    const topic = getTopic();
    const p = chunk.predict;
    const answered = state.predictAnswer !== null && state.predictAnswer !== undefined;

    body.innerHTML = `
      <div class="chunk-card">
        <div class="chunk-phase predict">\u{1F52E} Predict</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <p class="predict-nudge">Before you read anything \u2014 what's your guess?
          Being wrong here helps as much as being right, and nothing is scored.</p>
        <div class="quiz-question">${p.question}</div>
        <div class="quiz-options" id="predict-options">
          ${p.options.map((o, i) => `
            <button class="quiz-option${state.predictAnswer === i ? " selected" : ""}" data-idx="${i}">
              <span class="qo-letter">${"ABCD"[i]}</span><span class="qo-text">${o}</span>
            </button>`).join("")}
        </div>
        ${answered ? `<div class="predict-after">${p.reveal || "Hold that thought \u2014 read on and see."}</div>` : ""}
        <div class="chunk-actions">
          <button id="btn-next-phase" class="btn-primary" ${answered ? "" : "disabled"}>
            See the explanation <span class="arrow">\u2192</span>
          </button>
        </div>
      </div>`;

    body.querySelectorAll("#predict-options .quiz-option").forEach(b =>
      b.addEventListener("click", () => {
        state.predictAnswer = Number(b.getAttribute("data-idx"));
        renderChunk();
      }));

    document.getElementById("btn-next-phase").addEventListener("click", () => {
      state.chunkPhase = "explain";
      renderChunk();
    });
  }

  // ---- Phase 5: RECALL (optional) ----
  //
  // Free text, no options, self-graded. Producing an answer beats
  // recognising one, which is the thing multiple choice structurally
  // cannot test. Self-grading is honest about what an offline app can
  // do: nothing here can mark prose, and a generous self-grade costs
  // the learner nothing because it isn't scored either.
  function renderRecall(body, chunk) {
    const topic = getTopic();
    const r = chunk.recall;
    const isLastChunk = state.currentChunk >= topic.chunks.length - 1;

    body.innerHTML = `
      <div class="chunk-card">
        <div class="chunk-phase recall">\u{1F9E0} Recall</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <p class="predict-nudge">No options this time. Write it out from memory \u2014
          that effort is what makes it stick.</p>
        <div class="quiz-question">${r.prompt}</div>
        <textarea id="recall-input" class="recall-input" rows="4"
                  placeholder="In your own words..."></textarea>
        <div class="chunk-actions">
          <button id="btn-prev-phase" class="btn-ghost">\u2190 Back to the question</button>
          <button id="btn-reveal-recall" class="btn-primary">Show a model answer</button>
        </div>
        <div id="recall-model"></div>
      </div>`;

    document.getElementById("btn-prev-phase").addEventListener("click", () => {
      state.chunkPhase = phaseStep(-1) || "quiz";
      renderChunk();
    });

    document.getElementById("btn-reveal-recall").addEventListener("click", () => {
      const wrote = (document.getElementById("recall-input").value || "").trim();
      document.getElementById("recall-model").innerHTML = `
        <div class="recall-model">
          <div class="rm-label">A model answer</div>
          <div class="rm-text">${r.answer}</div>
          ${r.points && r.points.length ? `
            <div class="rm-label">Did you get these?</div>
            <ul class="rm-points">${r.points.map(pt => `<li>${pt}</li>`).join("")}</ul>` : ""}
          ${wrote ? "" : `<div class="rm-nudge">You didn't write anything \u2014 next time try,
            even badly. Reading a model answer you never attempted is just re-reading,
            which is one of the weakest things you can do.</div>`}
        </div>
        <div class="chunk-actions">
          <button id="btn-next-chunk-recall" class="btn-primary">
            ${isLastChunk ? "Take the Mastery Exam" : "Next chunk"} <span class="arrow">\u2192</span>
          </button>
        </div>`;
      document.getElementById("btn-next-chunk-recall")
        .addEventListener("click", () => finishChunk(document.getElementById("btn-next-chunk-recall")));
    });
  }

  function renderExplain(body, chunk) {
    // Explanations may be a single `text` string (legacy, modules 1-4) or an
    // array of `blocks` (modules 5+). Blocks let one concept run across several
    // passages with their own sub-headings instead of a single wall of text.
    const blocks = chunk.explain.blocks
      || (chunk.explain.text ? [{ text: chunk.explain.text }] : []);

    const blocksHtml = blocks.map(b => `
      ${b.heading ? `<h3 class="chunk-subhead">${b.heading}</h3>` : ""}
      <div class="chunk-text">${b.text}</div>
    `).join("");

    let analogyHtml = "";
    if (chunk.explain.analogy) {
      analogyHtml = `
        <div class="analogy-box">
          <div class="analogy-label">💡 Analogy</div>
          <div class="analogy-text">${chunk.explain.analogy}</div>
        </div>`;
    }

    // Citations let a reader verify any claim in the chunk against a real,
    // findable source rather than taking the app's word for it.
    let sourcesHtml = "";
    if (chunk.explain.sources && chunk.explain.sources.length) {
      const items = chunk.explain.sources.map(src => `
        <li class="source-item">
          <span class="source-ref">${src.ref}</span>
          ${src.note ? `<span class="source-note">${src.note}</span>` : ""}
        </li>`).join("");
      sourcesHtml = `
        <details class="sources-box">
          <summary class="sources-label">📚 Sources &amp; further reading</summary>
          <ul class="sources-list">${items}</ul>
        </details>`;
    }

    body.innerHTML = `
      <div class="chunk-section">
        <div class="chunk-phase explain">📖 Explanation</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        ${blocksHtml}
        ${analogyHtml}
        ${sourcesHtml}
        <div class="btn-row">
          <button id="btn-next-phase" class="btn-primary">See Example <span class="arrow">→</span></button>
        </div>
      </div>
    `;
    document.getElementById("btn-next-phase").addEventListener("click", () => {
      state.chunkPhase = "example";
      renderChunk();
    });
  }

  function renderExample(body, chunk) {
    const stepsHtml = chunk.example.steps.map((s, i) =>
      `<div class="flow-step"><span class="flow-num">${i + 1}</span><span>${s}</span></div>`
    ).join("");

    body.innerHTML = `
      <div class="chunk-section">
        <div class="chunk-phase example">🧪 Example</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <div class="example-box">
          <div class="example-label">${chunk.example.label}</div>
          <div class="example-flow">${stepsHtml}</div>
        </div>
        <div class="btn-row">
          <button id="btn-prev-phase" class="btn-ghost">← Back to explanation</button>
          <button id="btn-next-phase" class="btn-primary">Answer Question <span class="arrow">→</span></button>
        </div>
      </div>
    `;
    document.getElementById("btn-prev-phase").addEventListener("click", () => {
      state.chunkPhase = phaseStep(-1) || "explain";
      renderChunk();
    });
    document.getElementById("btn-next-phase").addEventListener("click", () => {
      openQuiz();
      renderChunk();
    });
  }

  function renderQuiz(body, chunk) {
    // The shuffled copy, never chunk.quiz — same discipline as the exam
    // grading against state.examQuestions.
    const q = quizView(chunk);
    const letters = ["A", "B", "C", "D", "E", "F"];
    const topic = getTopic();

    const optionsHtml = q.options.map((opt, i) => {
      let cls = "quiz-opt";
      if (state.quizSubmitted) {
        if (i === q.correct) cls += " correct";
        else if (i === state.quizAnswer && i !== q.correct) cls += " wrong";
      } else if (state.quizAnswer === i) {
        cls += " selected";
      }
      return `<div class="${cls}" data-idx="${i}">
        <span class="quiz-letter">${letters[i]}</span>
        <span>${opt}</span>
      </div>`;
    }).join("");

    let feedbackHtml = "";
    if (state.quizSubmitted) {
      const isCorrect = state.quizAnswer === q.correct;
      feedbackHtml = `
        <div class="quiz-feedback ${isCorrect ? "correct" : "wrong"}">
          <div class="fb-title">${isCorrect ? "✅ Correct!" : "❌ Not quite."}</div>
          <div>${q.explanation}</div>
        </div>`;
    }

    const isLastChunk = state.currentChunk >= topic.chunks.length - 1;
    const nextBtnText = isLastChunk ? "Take Mastery Exam 🏆" : "Next Chunk →";

    body.innerHTML = `
      <div class="chunk-section">
        <div class="chunk-phase quiz">❓ Question</div>
        <h2 class="chunk-title">${chunk.title}</h2>
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">${optionsHtml}</div>
        ${feedbackHtml}
        <div class="btn-row">
          <button id="btn-prev-phase" class="btn-ghost">← Back to example</button>
          ${!state.quizSubmitted ? `<button id="btn-submit-quiz" class="btn-primary" ${state.quizAnswer === null ? "disabled" : ""}>Check Answer</button>` : ""}
          ${state.quizSubmitted ? `<button id="btn-next-chunk" class="btn-primary">${nextBtnText}</button>` : ""}
        </div>
      </div>
    `;

    if (!state.quizSubmitted) {
      body.querySelectorAll(".quiz-opt").forEach(opt => {
        opt.addEventListener("click", () => {
          state.quizAnswer = parseInt(opt.dataset.idx);
          renderChunk();
        });
      });
    }

    const submitBtn = document.getElementById("btn-submit-quiz");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (state.quizAnswer === null) return;
        state.quizSubmitted = true;
        // Record quiz result in DB
        const isCorrect = state.quizAnswer === q.correct;
        DB.recordQuizAnswer(topic.id, state.currentChunk, isCorrect);
        // A wrong answer used to have no consequence at all. Now the
        // chunk is queued to be re-asked before the exam, which turns
        // the question from decoration into practice testing.
        if (!isCorrect && !state.inRetry && !state.missedChunks.includes(state.currentChunk)) {
          state.missedChunks.push(state.currentChunk);
        }
        renderChunk();
      });
    }

    document.getElementById("btn-prev-phase").addEventListener("click", () => {
      state.chunkPhase = phaseStep(-1) || "example";
      renderChunk();
    });

    const nextBtn = document.getElementById("btn-next-chunk");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        // A chunk with a recall phase isn't finished at the question —
        // it's finished after the recall. Hand over instead of closing.
        if (chunk.recall && !state.inRetry) {
          state.chunkPhase = "recall";
          renderChunk();
          return;
        }
        finishChunk(nextBtn);
      });
    }
  }

  // Re-ask the questions that were answered wrong, straight to the
  // quiz phase — no re-reading, which is the technique the research
  // rates near the bottom.
  function startMissedRetry() {
    state.inRetry = true;
    state.currentChunk = state.missedChunks.shift();
    // Fresh shuffle on the re-ask too, so a missed question can't be
    // passed the second time from position memory.
    openQuiz();
    renderChunk();
  }

  // ---- Mastery Exam ----
  // Closes out the current chunk and moves on. Called from the question
  // phase, or from recall when the chunk has one — one place, so the XP
  // award and the completion record can't drift apart.
  function finishChunk(originEl) {
    const topic = getTopic();
    const isLastChunk = state.currentChunk >= topic.chunks.length - 1;

    DB.markChunkComplete(topic.id, state.currentChunk);
    // A completed chunk is what counts as a "day" for the streak —
    // once per real day, no matter how many chunks. See DB.touchStreak.
    // `changed` is only true on the first qualifying action of a real
    // day, which is the one moment worth animating.
    const streak = DB.touchStreak();
    if (Dojo.renderStreak) Dojo.renderStreak();
    if (streak && streak.changed && Dojo.celebrateStreak) Dojo.celebrateStreak(streak.count);
    // Studying costs a little upkeep. It never gates anything —
    // low vitals shut the Arcade and Story, never the Library.
    if (Dojo.LifeShop) Dojo.LifeShop.cost("chunk");
    Bus.emit("chunk:completed", { topicId: topic.id, chunkIdx: state.currentChunk });

    // 5-7 XP per chunk. Retries don't pay again — otherwise deliberately
    // failing would be the fastest way to farm it.
    if (!state.inRetry) {
      const gain = 5 + Math.floor(Math.random() * 3);
      state.topicCharge = (state.topicCharge || 0) + gain;
      awardCharge(gain, originEl);
    }

    if (state.inRetry) {
      if (state.missedChunks.length) { startMissedRetry(); } else { startExam(); }
      return;
    }
    if (isLastChunk) {
      if (state.missedChunks.length) { startMissedRetry(); } else { startExam(); }
      return;
    }
    state.currentChunk++;
    state.chunkPhase = phasesFor(topic.chunks[state.currentChunk])[0];
    state.quizAnswer = null;
    state.quizSubmitted = false;
    state.predictAnswer = null;
    DB.setPosition(state.currentUnit, topic.id, state.currentChunk);
    renderChunk();
  }

  function startExam() {
    const topic = getTopic();
    // Fresh shuffle on every attempt, including retries.
    state.examQuestions = shuffled(topic.examQuestions).map(shuffleQuestion);
    state.examIndex = 0;
    state.examAnswers = [];
    state.examSubmitted = [];
    state.quizAnswer = null;
    state.quizSubmitted = false;
    showScreen("exam");
    renderExamQuestion();
  }

  function renderExamQuestion() {
    const topic = getTopic();
    const total = state.examQuestions.length;
    const idx = state.examIndex;
    const q = state.examQuestions[idx];
    const body = document.getElementById("exam-body");
    const letters = ["A", "B", "C", "D", "E", "F"];

    document.getElementById("exam-score-display").textContent = `${idx + 1}/${total}`;

    const optionsHtml = q.options.map((opt, i) => {
      let cls = "quiz-opt";
      if (state.examSubmitted[idx]) {
        if (i === q.correct) cls += " correct";
        else if (i === state.examAnswers[idx] && i !== q.correct) cls += " wrong";
      } else if (state.examAnswers[idx] === i) {
        cls += " selected";
      }
      return `<div class="${cls}" data-idx="${i}">
        <span class="quiz-letter">${letters[i]}</span>
        <span>${opt}</span>
      </div>`;
    }).join("");

    let feedbackHtml = "";
    if (state.examSubmitted[idx]) {
      const isCorrect = state.examAnswers[idx] === q.correct;
      feedbackHtml = `
        <div class="quiz-feedback ${isCorrect ? "correct" : "wrong"}">
          <div class="fb-title">${isCorrect ? "✅ Correct!" : `❌ Wrong — the answer is ${letters[q.correct]}.`}</div>
        </div>`;
    }

    const isLast = idx === total - 1;

    body.innerHTML = `
      <div class="exam-header">
        <h2>${topic.icon} ${topic.title} — Mastery Exam</h2>
        <p>Score 80% or higher to master this topic and start its review schedule.</p>
      </div>
      <div class="exam-q-counter">Question ${idx + 1} of ${total}</div>
      <div class="exam-question-card">
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">${optionsHtml}</div>
        ${feedbackHtml}
        <div class="btn-row">
          ${!state.examSubmitted[idx] ? `<button id="btn-exam-submit" class="btn-primary" ${state.examAnswers[idx] === null ? "disabled" : ""}>Check Answer</button>` : ""}
          ${state.examSubmitted[idx] && !isLast ? `<button id="btn-exam-next" class="btn-primary">Next Question <span class="arrow">→</span></button>` : ""}
          ${state.examSubmitted[idx] && isLast ? `<button id="btn-exam-finish" class="btn-primary">See Results 🏆</button>` : ""}
        </div>
      </div>
    `;

    if (!state.examSubmitted[idx]) {
      body.querySelectorAll(".quiz-opt").forEach(opt => {
        opt.addEventListener("click", () => {
          state.examAnswers[idx] = parseInt(opt.dataset.idx);
          renderExamQuestion();
        });
      });
    }

    const submitBtn = document.getElementById("btn-exam-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        if (state.examAnswers[idx] === null) return;
        state.examSubmitted[idx] = true;
        renderExamQuestion();
      });
    }

    const nextBtn = document.getElementById("btn-exam-next");
    if (nextBtn) nextBtn.addEventListener("click", () => { state.examIndex++; renderExamQuestion(); });

    const finishBtn = document.getElementById("btn-exam-finish");
    if (finishBtn) finishBtn.addEventListener("click", () => showExamResults());
  }

  function showExamResults() {
    const topic = getTopic();
    // So the result screen's retry button knows which flow to relaunch —
    // it's shared with finishFlashcards() below.
    state.lastReviewMode = "exam";
    const total = state.examQuestions.length;
    let correct = 0;
    state.examQuestions.forEach((q, i) => {
      if (state.examAnswers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 80;

    // Record exam result in DB
    DB.recordExamResult(topic.id, correct, total, passed);
    if (Dojo.LifeShop) Dojo.LifeShop.cost("exam");
    Bus.emit("exam:finished", { topicId: topic.id, correct, total, passed });
    // Map percentage onto SM-2's 0-5 quality scale.
    DB.scheduleReview(topic.id, Math.max(0, Math.min(5, Math.round(pct / 20))));
    if (passed) {
      DB.markTopicComplete(topic.id);
    }
    const nextIn = DB.daysUntilDue(topic.id);

    document.getElementById("result-icon").textContent = passed ? "🎉" : "📚";
    document.getElementById("result-title").textContent = passed ? "Topic Mastered!" : "Not Quite Yet";
    document.getElementById("btn-retry").textContent = "Retry Exam";
    document.getElementById("result-desc").textContent = passed
      ? `You scored ${correct}/${total} on "${topic.title}". It'll come back for review in ${nextIn} day${nextIn === 1 ? "" : "s"} — that's when it does the most good.`
      : `You scored ${correct}/${total}, and 80% masters the topic. Rather than re-reading, go straight back to the questions you missed — that's what actually moves the needle.`;
    const scoreEl = document.getElementById("result-score");
    scoreEl.textContent = `${pct}%`;
    scoreEl.className = `result-score ${passed ? "pass" : "fail"}`;

    // The reward lands on finishing a TOPIC, not a chunk. One quote per
    // topic means ~6 per module against a pool of 57, so nothing repeats
    // and finishing a topic stays worth something.
    // Topic bonus: what the chunks earned, multiplied by how the exam
    // went. 0% -> x0.7, 100% -> x1.5. Rewards finishing well without
    // making a bad run worthless.
    const mult = 0.7 + (pct / 100) * 0.8;
    const bonus = Math.round((state.topicCharge || 0) * mult);
    const bonusEl = document.getElementById("result-charge");
    if (bonusEl) {
      if (bonus > 0) {
        const scoreCard = document.getElementById("result-score");
        const granted = awardCharge(bonus, scoreCard);
        // XP is uncapped, so a grant always lands; the fallback branch
        // that used to say "charge full" can't happen any more.
        bonusEl.innerHTML = `<span class="charge-award">\u26A1 +${granted} XP <span class="ca-mult">(&times;${mult.toFixed(2)} for ${pct}%)</span></span>`;
      } else {
        bonusEl.innerHTML = "";
      }
    }
    state.topicCharge = 0;

    // Topic finished — there's no half-done chunk to come back to.
    if (passed) DB.clearPosition();

    const wisdomEl = document.getElementById("result-wisdom");
    if (wisdomEl) {
      if (passed) {
        // Pool the wisdomTags of every chunk in the topic, so the quote
        // can speak to anything the topic covered.
        const tags = topic.chunks.flatMap(c => c.wisdomTags || []);
        wisdomEl.innerHTML = quoteHtml(pickQuote(tags));
      } else {
        wisdomEl.innerHTML = "";
      }
    }

    showScreen("exam-result");
  }

  // ---- Flashcard review ----
  // What watering a due plant launches (see garden/GARDEN.md) instead of
  // replaying the whole topic. One card per chunk, built from that
  // chunk's existing quiz — no separate flashcard content to author.
  // Self-reported (knew it / didn't), because there's no multiple-choice
  // to grade automatically; the tally still feeds the same SM-2 quality
  // scale showExamResults() uses, so a review advances the interval
  // exactly like retaking the exam used to.
  function buildFlashDeck(topic) {
    return topic.chunks
      .filter(c => c.quiz)
      .map(c => ({
        q: c.quiz.question,
        a: c.quiz.options[c.quiz.correct],
        explanation: c.quiz.explanation
      }));
  }

  function startFlashcardReview(topic) {
    state.flashTopic = topic;
    state.flashDeck = buildFlashDeck(topic);
    state.flashIndex = 0;
    state.flashFlipped = false;
    state.flashResults = [];
    state.flashTimings = [];
    state.flashCardShownAt = Date.now();
    renderFlashcard();
    showScreen("flashcards");
  }

  function renderFlashcard() {
    const body = document.getElementById("flashcard-body");
    const counter = document.getElementById("flashcard-counter");
    const deck = state.flashDeck;
    const card = deck[state.flashIndex];
    if (counter) counter.textContent = `${state.flashIndex + 1}/${deck.length}`;

    body.innerHTML = `
      <div class="flashcard-topic">${state.flashTopic.title}</div>
      <div class="flashcard ${state.flashFlipped ? "flipped" : ""}">
        <div class="flashcard-face flashcard-front">${card.q}</div>
        <div class="flashcard-face flashcard-back">
          <div class="flashcard-answer">${card.a}</div>
          ${card.explanation ? `<div class="flashcard-explain">${card.explanation}</div>` : ""}
        </div>
      </div>
      ${!state.flashFlipped
        ? `<button id="btn-flash-flip" class="btn-primary flashcard-flip-btn">Show Answer</button>`
        : `<div class="flashcard-know-row">
             <button id="btn-flash-no" class="btn-ghost flashcard-know-btn">✕ Didn't know it</button>
             <button id="btn-flash-yes" class="btn-primary flashcard-know-btn">✓ Knew it</button>
           </div>`}
    `;

    const flipBtn = document.getElementById("btn-flash-flip");
    if (flipBtn) flipBtn.addEventListener("click", () => { state.flashFlipped = true; renderFlashcard(); });
    const noBtn = document.getElementById("btn-flash-no");
    if (noBtn) noBtn.addEventListener("click", () => answerFlashcard(false));
    const yesBtn = document.getElementById("btn-flash-yes");
    if (yesBtn) yesBtn.addEventListener("click", () => answerFlashcard(true));
  }

  // A card's own elapsed time (front shown -> answered), not counting the
  // flip. Anyone can tap through a deck claiming "knew it" on everything;
  // that costs nothing when a review paid no reward. Now that it does,
  // this is the guard — see MIN_CARD_MS in finishFlashcards.
  function answerFlashcard(knew) {
    state.flashResults.push(knew);
    state.flashTimings.push(Date.now() - state.flashCardShownAt);
    if (state.flashIndex + 1 < state.flashDeck.length) {
      state.flashIndex++;
      state.flashFlipped = false;
      state.flashCardShownAt = Date.now();
      renderFlashcard();
    } else {
      finishFlashcards();
    }
  }

  // A card answered faster than this couldn't have been read, let alone
  // recalled — the front alone typically runs a full sentence or two.
  // 2.5s is generous (a real "I know this instantly" case still clears
  // it) while catching a rushed tap-through.
  const MIN_CARD_MS = 2500;
  // What a fully genuine (every card knew, none rushed) review pays —
  // deliberately small, on the order of one chunk, since a review isn't
  // new learning.
  const REVIEW_XP_BASE = 5;

  function finishFlashcards() {
    const topic = state.flashTopic;
    state.lastReviewMode = "flashcards";
    const total = state.flashResults.length;
    const known = state.flashResults.filter(Boolean).length;
    const pct = total ? Math.round((known / total) * 100) : 0;
    const passed = pct >= 80;
    const rushed = state.flashTimings.filter(ms => ms < MIN_CARD_MS).length;
    // Only cards that were both genuinely timed AND marked known count
    // toward the reward — rushing to "Knew it" shouldn't pay the same as
    // actually knowing it.
    const genuineKnown = state.flashResults.filter((knew, i) => knew && state.flashTimings[i] >= MIN_CARD_MS).length;

    // The one DB write a review needs: advance (or lapse) the SM-2
    // interval, same mapping showExamResults() uses. No recordExamResult
    // and no markTopicComplete — this isn't an exam, and the topic is
    // already mastered (that's why it was due).
    DB.scheduleReview(topic.id, Math.max(0, Math.min(5, Math.round(pct / 20))));
    Bus.emit("review:finished", { topicId: topic.id, known, total, passed });
    const nextIn = DB.daysUntilDue(topic.id);

    document.getElementById("result-icon").textContent = passed ? "💧" : "🌱";
    document.getElementById("result-title").textContent = passed ? "Watered!" : "Still Thirsty";
    document.getElementById("btn-retry").textContent = "Review Again";
    // Don't assert HOW the interval moved (reset vs. still advanced but
    // slower) — the 80% shown here is a display threshold, not the SM-2
    // quality<3 lapse threshold underneath, so pct 50-79% still nudges
    // the interval forward even though it reads as "failed" on screen.
    // nextIn is always the true outcome; only claim the number.
    document.getElementById("result-desc").textContent = (passed
      ? `You knew ${known}/${total} on "${topic.title}". Back for review in ${nextIn} day${nextIn === 1 ? "" : "s"} — that's when it does the most good.`
      : `You knew ${known}/${total} — below the 80% that keeps it growing. "${topic.title}" comes back for review in ${nextIn} day${nextIn === 1 ? "" : "s"}.`)
      + (rushed ? ` ${rushed} card${rushed === 1 ? "" : "s"} answered too fast to count toward XP.` : "");
    const scoreEl = document.getElementById("result-score");
    scoreEl.textContent = `${pct}%`;
    scoreEl.className = `result-score ${passed ? "pass" : "fail"}`;

    // Small and reward-eligibility-gated (see genuineKnown above) — a
    // review isn't new learning, and it must not be a faster source of
    // XP than actually studying the topic was.
    const bonus = Math.round(REVIEW_XP_BASE * (genuineKnown / total));
    const bonusEl = document.getElementById("result-charge");
    if (bonusEl) {
      if (bonus > 0) {
        const granted = awardCharge(bonus, scoreEl);
        bonusEl.innerHTML = `<span class="charge-award">⭐ +${granted} XP</span>`;
      } else {
        bonusEl.innerHTML = "";
      }
    }
    const wisdomEl = document.getElementById("result-wisdom");
    if (wisdomEl) wisdomEl.innerHTML = "";

    showScreen("exam-result");
  }


  // ---- Branch-owned navigation ----
  // These never leave the Library, so they are wired here and not in
  // core/boot.js.
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };
  on("btn-back-courses", renderCourseSelect);
  on("btn-back-units",  () => { showScreen("unit-select"); renderUnitSelect(); });
  on("btn-back-topics", () => { showScreen("topic-map"); renderTopicMap(); });
  on("btn-back-topics2",() => { showScreen("topic-map"); renderTopicMap(); });
  on("btn-to-topics",   () => { showScreen("topic-map"); renderTopicMap(); });
  on("btn-back-flashcards", () => { showScreen("topic-map"); renderTopicMap(); });
  // The result screen is shared with flashcard review, so retry has to
  // relaunch whichever flow actually produced this result.
  on("btn-retry", () => {
    if (state.lastReviewMode === "flashcards" && state.flashTopic) startFlashcardReview(state.flashTopic);
    else startExam();
  });

  // ---- Entry points other branches use ----
  // The lobby owns the Resume and Review tiles but must not know how
  // to walk a course, so it hands the request over here.
  function resumeAt(pos) {
    const course = COURSES.find(c => c.units.includes(pos.unitId));
    state.currentCourse = course ? course.id : null;
    selectUnit(pos.unitId);
    const idx = state.currentTopics.findIndex(t => t.id === pos.topicId);
    if (idx >= 0) startTopic(idx, pos.chunkIdx);
  }

  function startNextDueReview() {
    const due = DB.getDueTopicIds();
    if (!due.length) return false;
    const topic = ALL_TOPICS.find(t => due.includes(t.id));
    if (!topic) return false;
    const course = COURSES.find(c => c.units.includes(topic.unit));
    state.currentCourse = course ? course.id : null;
    // Still walks unit context so "Back to Topics" lands somewhere sane —
    // just launches the flashcard deck instead of the full topic replay.
    selectUnit(topic.unit);
    startFlashcardReview(topic);
    return true;
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { phasesFor, finishChunk, renderCourseSelect, renderUnitSelect, selectUnit, renderTopicMap, updateGlobalProgress, startTopic, getTopic, startExam, libraryTotals, resumeAt, startNextDueReview });
})();
