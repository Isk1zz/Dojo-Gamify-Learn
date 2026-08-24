// ================================================
// CS Dojo — LIBRARY / mock exam
// ------------------------------------------------
// A rehearsal of the real thing, not another mastery exam. The mastery
// exam checks one topic you have just read; this sits the whole paper
// under the clock, on the terms the actual test uses.
//
// ---- Why it is data-driven ----
// The shape comes from the course manifest (`examSim: { draw, minutes,
// pass }`), never from a constant in here. registry.js's rule is that
// nothing outside a course folder knows what a course is about, and a
// hardcoded "30 questions, 40 minutes" would be exactly that — it is a
// fact about the Israeli A3 test, not about this app. A course with no
// examSim block simply gets no entry button.
//
// ---- Where the questions come from ----
// The pool is every OFFICIAL question the course carries: all
// examQuestions, plus the chunk quizzes flagged `official: true`. For
// A3 that is the Ministry's published 40, and the paper draws `draw` of
// them. Without the flag the pool would be the 30 examQuestions plus 8
// questions written for this course, which would be a worse rehearsal
// on both counts — too few real ones, and some that will never appear.
//
// Questions AND options are shuffled every attempt, the same discipline
// startExam uses. Sitting it twice must not be answerable from where
// the right answer sat last time.
//
// ---- What it deliberately does not do ----
// No XP, no vitals cost, no completion, nothing written to the DB. It
// cannot advance or damage anything, which is what lets it be taken
// twenty times in a row. The only thing kept is a best/last score in
// localStorage, so the entry button can show whether you are improving
// — that is a scoreboard for the learner, not progress in the app's
// sense. PROJECT.md §5's line about nothing buying progress cuts both
// ways: nothing here sells it either.
//
// ---- The clock ----
// One interval, owned by `sim.tick`, and stopEverything() is called on
// every exit path — finishing, leaving, starting again. A leaked
// interval here would submit somebody's next attempt for them.
// ================================================

(() => {
  const KEY_PREFIX = "cs-dojo-sim-";

  // Live attempt. Null between attempts, which is also how the render
  // functions know whether the screen is showing a paper or a result.
  let sim = null;

  const el = id => document.getElementById(id);
  const body = () => el("exam-sim-body");

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Shuffles the options and moves `correct` with them. Returns a NEW
  // object; the stored question is never mutated, or a second attempt
  // would inherit the first one's shuffle.
  function shuffleQuestion(q) {
    const order = shuffled(q.options.map((_, i) => i));
    return {
      question: q.question,
      explanation: q.explanation || "",
      options: order.map(i => q.options[i]),
      correct: order.indexOf(q.correct)
    };
  }

  function officialPool(course) {
    const out = [];
    (course.units || []).forEach(unitId => {
      (UNIT_TOPICS[unitId] || []).forEach(topic => {
        (topic.examQuestions || []).forEach(q => out.push(q));
        (topic.chunks || []).forEach(c => {
          if (c.quiz && c.quiz.official) out.push(c.quiz);
        });
      });
    });
    return out;
  }

  // ---- Score keeping (localStorage, not the DB) ----
  function readScore(courseId) {
    try { return JSON.parse(localStorage.getItem(KEY_PREFIX + courseId)) || null; }
    catch (e) { return null; }
  }
  function writeScore(courseId, score, of) {
    try {
      const prev = readScore(courseId) || { best: 0, attempts: 0 };
      localStorage.setItem(KEY_PREFIX + courseId, JSON.stringify({
        best: Math.max(prev.best || 0, score),
        last: score, of, attempts: (prev.attempts || 0) + 1
      }));
    } catch (e) { /* private mode — the exam still works, just unrecorded */ }
  }

  function mmss(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function stopEverything() {
    if (sim && sim.tick) { clearInterval(sim.tick); sim.tick = null; }
  }

  // ---- Two-step confirmation, in the page ----
  // The first version of this used window.confirm(), and that was the
  // bug behind "you can't leave the exam". confirm() is not reliably
  // there: an installed PWA or an in-app webview can suppress dialogs
  // outright, and a suppressed confirm returns FALSE — so leave() took
  // its early return and the button did nothing at all, silently. Add
  // to that a mistap on Cancel producing the identical dead-button
  // experience, and a native dialog is simply the wrong instrument for
  // a decision this small.
  //
  // So: the button asks in its own label and waits for a second press.
  // Nothing to suppress, nothing to mistap irreversibly, and it reverts
  // on its own if the second press never comes.
  const ARM_MS = 4000;
  function armed(btn, prompt, onConfirm) {
    if (btn.dataset.armed === "1") {
      clearTimeout(Number(btn.dataset.armTimer));
      onConfirm();
      return;
    }
    const original = btn.innerHTML;
    btn.dataset.armed = "1";
    btn.classList.add("sim-armed");
    btn.innerHTML = prompt;
    const timer = setTimeout(() => {
      btn.dataset.armed = "0";
      btn.classList.remove("sim-armed");
      btn.innerHTML = original;
    }, ARM_MS);
    btn.dataset.armTimer = String(timer);
  }

  // ---- Entry ----
  function openExamSim(course) {
    stopEverything();
    sim = null;
    renderIntro(course);
    Dojo.showScreen("exam-sim");
  }

  function renderIntro(course) {
    const cfg = course.examSim;
    const vars = {
      n: cfg.draw, min: cfg.minutes, pass: cfg.pass,
      wrong: cfg.draw - cfg.pass
    };
    body().innerHTML = `
      <div class="sim-intro">
        <div class="sim-intro-icon">${course.icon || "\u{1F4DD}"}</div>
        <h2 class="sim-intro-title">${I18N.t("sim.introTitle")}</h2>
        <p class="sim-intro-body">${I18N.t("sim.introBody", vars)}</p>
        <p class="sim-intro-note">${I18N.t("sim.introNote")}</p>
        <button id="sim-begin" class="btn-primary sim-begin">${I18N.t("sim.begin")}</button>
      </div>`;
    el("sim-begin").addEventListener("click", () => startAttempt(course));
  }

  function startAttempt(course) {
    stopEverything();
    const cfg = course.examSim;
    const pool = officialPool(course);
    const draw = Math.min(cfg.draw, pool.length);

    sim = {
      course,
      cfg,
      questions: shuffled(pool).slice(0, draw).map(shuffleQuestion),
      answers: new Array(draw).fill(null),
      idx: 0,
      startedAt: Date.now(),
      endsAt: Date.now() + cfg.minutes * 60000,
      tick: null,
      timedOut: false
    };

    sim.tick = setInterval(() => {
      if (!sim) return;
      if (Date.now() >= sim.endsAt) { sim.timedOut = true; finish(); return; }
      const clock = el("sim-clock");
      if (clock) {
        const left = sim.endsAt - Date.now();
        clock.textContent = mmss(left);
        clock.classList.toggle("urgent", left <= 60000);
      }
    }, 1000);

    renderQuestion();
  }

  function renderQuestion() {
    const q = sim.questions[sim.idx];
    const picked = sim.answers[sim.idx];
    const unanswered = sim.answers.filter(a => a === null).length;
    const last = sim.idx === sim.questions.length - 1;

    body().innerHTML = `
      <div class="sim-bar">
        <span class="sim-counter">${I18N.t("sim.counter", { i: sim.idx + 1, of: sim.questions.length })}</span>
        <span id="sim-clock" class="sim-clock">${mmss(sim.endsAt - Date.now())}</span>
      </div>
      <div class="sim-progress">
        ${sim.questions.map((_, i) => `<button class="sim-dot${i === sim.idx ? " current" : ""}${sim.answers[i] !== null ? " done" : ""}" data-goto="${i}" aria-label="${i + 1}"></button>`).join("")}
      </div>
      <div class="chunk-card sim-card">
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options" id="sim-options">
          ${q.options.map((o, i) => `
            <button class="quiz-option${picked === i ? " selected" : ""}" data-idx="${i}">
              <span class="qo-letter">${"ABCD"[i]}</span><span class="qo-text">${o}</span>
            </button>`).join("")}
        </div>
        <div class="sim-actions">
          <button id="sim-prev" class="btn-ghost"${sim.idx === 0 ? " disabled" : ""}>${I18N.t("sim.prev")}</button>
          <span class="sim-unanswered">${I18N.t("sim.unanswered", { n: unanswered })}</span>
          ${last
            ? `<button id="sim-finish" class="btn-primary">${I18N.t("sim.finish")}</button>`
            : `<button id="sim-next" class="btn-primary">${I18N.t("sim.next")}</button>`}
        </div>
      </div>`;

    body().querySelectorAll("#sim-options .quiz-option").forEach(b => {
      b.addEventListener("click", () => {
        sim.answers[sim.idx] = Number(b.getAttribute("data-idx"));
        renderQuestion();
      });
    });
    body().querySelectorAll(".sim-dot").forEach(d => {
      d.addEventListener("click", () => { sim.idx = Number(d.getAttribute("data-goto")); renderQuestion(); });
    });
    const prev = el("sim-prev");
    if (prev) prev.addEventListener("click", () => { if (sim.idx > 0) { sim.idx--; renderQuestion(); } });
    const next = el("sim-next");
    if (next) next.addEventListener("click", () => { sim.idx++; renderQuestion(); });
    const fin = el("sim-finish");
    if (fin) fin.addEventListener("click", () => {
      const left = sim.answers.filter(a => a === null).length;
      if (!left) { finish(); return; }
      armed(fin, I18N.t("sim.finishAnyway", { n: left }), finish);
    });
  }

  function finish() {
    stopEverything();
    const score = sim.questions.reduce((n, q, i) => n + (sim.answers[i] === q.correct ? 1 : 0), 0);
    const of = sim.questions.length;
    const passed = score >= sim.cfg.pass;
    writeScore(sim.course.id, score, of);

    const wrong = sim.questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => sim.answers[i] !== q.correct);

    body().innerHTML = `
      <div class="sim-result ${passed ? "pass" : "fail"}">
        <div class="sim-result-badge">${passed ? "✅" : "❌"}</div>
        <h2 class="sim-result-title">${I18N.t(passed ? "sim.passed" : "sim.failed")}</h2>
        <p class="sim-result-score">${I18N.t("sim.result", { score, of, pass: sim.cfg.pass })}</p>
        <p class="sim-result-time">${I18N.t("sim.timeSpent", { t: mmss(Date.now() - sim.startedAt) })}</p>
        ${sim.timedOut ? `<p class="sim-result-timeout">${I18N.t("sim.timeUp")}</p>` : ""}
      </div>
      <div class="sim-review">
        <h3 class="sim-review-title">${I18N.t("sim.reviewTitle")}</h3>
        ${wrong.length === 0 ? `<p class="sim-intro-note">${I18N.t("sim.allCorrect")}</p>` : wrong.map(({ q, i }) => `
          <div class="sim-review-item">
            <div class="quiz-question">${q.question}</div>
            <div class="sim-review-line bad">
              <span class="sim-review-label">${I18N.t("sim.yourAnswer")}</span>
              <span>${sim.answers[i] === null ? `<em>${I18N.t("sim.noAnswer")}</em>` : q.options[sim.answers[i]]}</span>
            </div>
            <div class="sim-review-line good">
              <span class="sim-review-label">${I18N.t("sim.correctAnswer")}</span>
              <span>${q.options[q.correct]}</span>
            </div>
            ${q.explanation ? `<div class="sim-review-why">${q.explanation}</div>` : ""}
          </div>`).join("")}
      </div>
      <div class="sim-actions sim-actions-end">
        <button id="sim-again" class="btn-primary">${I18N.t("sim.again")}</button>
        <button id="sim-leave" class="btn-ghost">${I18N.t("sim.leave")}</button>
      </div>`;

    const course = sim.course;
    el("sim-again").addEventListener("click", () => startAttempt(course));
    el("sim-leave").addEventListener("click", leaveNow);
  }

  function leaveNow() {
    stopEverything();
    sim = null;
    const back = el("btn-back-examsim");
    if (back) {                       // clear any half-armed state behind us
      clearTimeout(Number(back.dataset.armTimer));
      back.dataset.armed = "0";
      back.classList.remove("sim-armed");
      back.textContent = I18N.t("btn.backToCourse");
    }
    Dojo.renderUnitSelect();
    Dojo.showScreen("unit-select");
  }

  // Asks only while a paper is actually running. On the intro screen and
  // on the result screen there is nothing to lose, so the back button
  // must leave on the first press — making someone press twice to
  // escape a finished exam is how a back button earns a reputation for
  // being broken.
  function leave() {
    const running = sim && sim.tick;
    if (!running) { leaveNow(); return; }
    const back = el("btn-back-examsim");
    if (!back) { leaveNow(); return; }
    armed(back, I18N.t("sim.abandon"), leaveNow);
  }

  // The entry tile for unit-select. Returns null for a course with no
  // examSim block, which is every course but A3 today.
  function examSimEntry(course) {
    if (!course || !course.examSim) return null;
    const cfg = course.examSim;
    const rec = readScore(course.id);
    const btn = document.createElement("button");
    btn.className = "deck-builder-entry sim-entry";
    btn.type = "button";
    btn.innerHTML = `⏱️ ${I18N.t("sim.entry")} <span class="deck-builder-entry-sub">` +
      I18N.t("sim.entrySub", { n: cfg.draw, min: cfg.minutes, pass: cfg.pass }) +
      (rec && rec.attempts ? ` · ${I18N.t("sim.best", { score: rec.best, n: rec.of || cfg.draw })}` : "") +
      `</span>`;
    btn.addEventListener("click", () => openExamSim(course));
    return btn;
  }

  // Wired at load, not on DOMContentLoaded — the same way library.js
  // wires its own back buttons. This file sits at the end of <body>, so
  // the element is already parsed, and a listener that depends on an
  // event that may already have fired is one more way for an exit to go
  // missing. Belt and braces after the confirm() bug.
  const backBtn = document.getElementById("btn-back-examsim");
  if (backBtn) backBtn.addEventListener("click", leave);
  else console.error("[exam-sim] #btn-back-examsim missing — the exam would have no exit.");

  Object.assign(Dojo, { openExamSim, examSimEntry });
})();
