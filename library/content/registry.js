// ================================================
// Knell — LIBRARY / content registry
// ------------------------------------------------
// The loader that turns course folders into the globals every branch
// reads. Nothing here knows what a course is *about*.
//
// ---- Adding a course ----
//   1. Make library/content/<slug>/ and put the module files in it.
//   2. Add <slug>/course.js calling Content.course({...}).
//   3. Add the <script> tags in index.html, between registry.js and
//      build.js.
// That is all. No branch changes, no edits to any existing course.
//
// Working on a course in a fresh session costs you that one folder —
// not library.js, not the other courses.
//
// ---- Rules ----
// * Course files are PURE DATA. No DOM, no DB, no rendering.
// * Unit ids must be unique ACROSS courses: progress, reviews and the
//   Garden are keyed on unit and topic ids. Two courses reusing id 6
//   would silently share progress. Content.build() checks this and
//   shouts rather than letting it through quietly.
// * Topic ids must be globally unique for the same reason.
// ================================================

const Content = (() => {
  const courses = [];

  // A course manifest:
  // { id, title, subtitle, icon, available,
  //   units: [{ id, title, subtitle, icon, modules: [MODULE_N] }] }
  // Resolved HERE, at registration, rather than inside build(): this is
  // the one line every course already passes through, and doing it now
  // means nothing downstream — build(), flatten(), library.js, the
  // Garden — ever sees a {en, ru} bag. They keep working on plain
  // strings exactly as before the language layer existed.
  //
  // I18N.resolve hands back the SAME object when a course carries no
  // bags at all, so a single-language course pays a walk and no copy.
  // The typeof guard keeps registry.js loadable on its own, the way
  // check-content.js loads module files with no app around them.
  function course(manifest) {
    const m = typeof I18N !== "undefined" ? I18N.resolve(manifest) : manifest;
    courses.push(m);
    return m;
  }

  // ---- Lazy courses -------------------------------------------------
  // Course content was 67% of a 1.5MB JS payload and every course parsed
  // at boot whether or not anyone opened it — a cost that grows with each
  // course added, and four science courses are already reserved.
  //
  // A lazy course ships only its manifest. It declares the module files
  // it needs and a `unitsFactory` that builds its units once those files
  // have run, because a factory can read MODULE_N constants that did not
  // exist at registration time. Nothing else in the app changes shape:
  // attach() mutates the very arrays build.js published, so every holder
  // of MODULES / UNITS / ALL_TOPICS / UNIT_TOPICS sees the new content
  // without a rebuild. That only works because those are `const`
  // bindings to mutable arrays — reassigning them is what is impossible,
  // filling them is not.
  const loading = {};      // courseId -> Promise, so two clicks load once

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-lazy="${src}"]`);
      if (existing) { resolve(); return; }
      const el = document.createElement("script");
      el.src = src;
      el.dataset.lazy = src;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error("failed to load " + src));
      document.head.appendChild(el);
    });
  }

  function isLoaded(courseId) {
    const c = courses.find(x => x.id === courseId);
    return !!c && (!c.lazyFiles || c.loaded === true);
  }

  // Declared topic count, used by the course card before the content is
  // there. check-content.js verifies it against the real modules, so it
  // cannot quietly drift from the truth.
  function declaredTopics(courseId) {
    const c = courses.find(x => x.id === courseId);
    if (!c || !c.unitOutline) return null;
    return c.unitOutline.reduce((n, u) => n + (u.topics || 0), 0);
  }

  // Runs the factory and folds the result into the live globals.
  function attach(courseId, G) {
    const c = courses.find(x => x.id === courseId);
    if (!c || c.loaded) return false;

    // Resolved HERE, not at registration: course() ran before these units
    // existed, so the language pass had nothing to walk. A lazy course
    // that skipped this would render its language bags raw.
    const built = (c.unitsFactory ? c.unitsFactory() : []).filter(u => u.modules && u.modules.length);
    const units = typeof I18N !== "undefined" ? I18N.resolve(built) : built;
    if (!units.length) {
      console.error(`[Content] "${courseId}" loaded its files but produced no units.`);
      return false;
    }

    const courseEntry = G.COURSES.find(x => x.id === courseId);
    units.forEach(u => {
      const unit = { id: u.id, title: u.title, subtitle: u.subtitle, icon: u.icon, modules: u.modules, course: c.id };
      G.UNITS.push(unit);
      u.modules.forEach(m => G.MODULES.push(m));
      const topics = flatten(u.modules);
      G.UNIT_TOPICS[u.id] = topics;
      topics.forEach(t => G.ALL_TOPICS.push(t));
      if (courseEntry) {
        courseEntry.units.push(unit.id);
        courseEntry.unitObjects.push(unit);
      }
    });

    c.loaded = true;
    return true;
  }

  // The one call a branch makes: "I am about to show this course."
  // Resolves immediately for an eager course, so callers need no special
  // case for the difference.
  function load(courseId, G) {
    const c = courses.find(x => x.id === courseId);
    if (!c || !c.lazyFiles || c.loaded) return Promise.resolve(true);
    if (loading[courseId]) return loading[courseId];

    loading[courseId] = c.lazyFiles
      .reduce((chain, src) => chain.then(() => injectScript(src)), Promise.resolve())
      .then(() => attach(courseId, G))
      .catch(err => {
        console.error(`[Content] "${courseId}" failed to load:`, err);
        delete loading[courseId];   // let a retry happen
        return false;
      });

    return loading[courseId];
  }

  function flatten(modules) {
    return modules.flatMap(m =>
      m.topics.map(t => ({
        ...t,
        moduleId: m.id,
        moduleTitle: m.title,
        moduleIcon: m.icon,
        unit: m.unit
      }))
    );
  }

  // Builds the globals. Called once, by build.js, after every course
  // file has registered itself.
  // Every key a course manifest is allowed to carry. Anything else is a
  // typo or a field somebody forgot to wire into build() — see the check
  // at the end of build(). `units` and `unitsFactory` are both here
  // because an eager course supplies the first and a lazy one the second.
  const KNOWN_KEYS = new Set([
    "id", "title", "subtitle", "icon", "track", "available",
    "priceTokens", "examSim", "units", "unitObjects",
    "lazyFiles", "unitOutline", "unitsFactory", "loaded", "about"
  ]);

  function build() {
    const UNITS = [];
    const MODULES = [];
    const COURSES = [];
    const seenUnits = new Map();
    const seenTopics = new Map();
    const problems = [];

    courses.forEach(c => {
      const unitObjects = [];
      (c.units || []).forEach(u => {
        if (seenUnits.has(u.id)) {
          problems.push(`unit id ${u.id} used by both "${seenUnits.get(u.id)}" and "${c.id}"`);
        }
        seenUnits.set(u.id, c.id);

        (u.modules || []).forEach(m => {
          MODULES.push(m);
          m.topics.forEach(t => {
            if (seenTopics.has(t.id)) {
              problems.push(`topic id "${t.id}" used by both "${seenTopics.get(t.id)}" and "${m.id}"`);
            }
            seenTopics.set(t.id, m.id);
          });
        });

        const unit = { id: u.id, title: u.title, subtitle: u.subtitle, icon: u.icon, modules: u.modules, course: c.id };
        UNITS.push(unit);
        unitObjects.push(unit);
      });

      COURSES.push({
        id: c.id, title: c.title, subtitle: c.subtitle, icon: c.icon,
        // Which shelf the Library files it under. Courses are grouped by
        // track rather than listed flat — omitted falls to "other".
        track: c.track || "other",
        available: c.available !== false,
        // 0/omitted = free, same as every course today. A course manifest
        // opts INTO the Token Shop by setting this — see shop/tokens.js.
        priceTokens: c.priceTokens || 0,
        // Mock-exam terms, if the course sits one: { draw, minutes,
        // pass }. Omitted means no mock exam and no entry button — see
        // library/exam-sim.js. Copied through rather than defaulted,
        // because there is no sensible default for somebody else's
        // exam. NOTE: this object is built field by field, so a new
        // manifest key is invisible until it is named here. That is
        // deliberate — it keeps stray keys out of the globals — but it
        // is also exactly how examSim went missing the first time.
        examSim: c.examSim || null,

        // ---- Lazy-course fields ----
        // unitOutline feeds the course card before any content is in
        // memory; lazyFiles is what gets injected on open. Both belong
        // to the built object because library.js reads them off COURSES,
        // not off the raw manifest. unitOutline going missing here is
        // precisely the "0 units, 48 topics" card the warning above
        // predicted, and it happened.
        lazyFiles: c.lazyFiles || null,
        unitOutline: c.unitOutline || null,

        // Long-form "what is this course and who is it for", shown on
        // the unit-select screen. Optional: a course without one simply
        // renders no About block.
        about: c.about || null,

        units: unitObjects.map(u => u.id),
        unitObjects
      });

      // ...and so that the next new key cannot go missing silently, the
      // drop is now loud. Cheaper than the two rounds it has already
      // cost to notice a field quietly not being there.
      Object.keys(c).forEach(k => {
        if (!KNOWN_KEYS.has(k)) {
          console.warn(
            `[Content] "${c.id}" declares "${k}", which build() does not copy ` +
            `into COURSES — it will be invisible to every branch. Add it to ` +
            `the object above and to KNOWN_KEYS, or drop it from the manifest.`
          );
        }
      });
    });

    // Loud, not silent: a duplicate id corrupts saved progress, and the
    // symptom (two topics sharing a review schedule) looks like a bug
    // anywhere but here.
    if (problems.length) {
      console.error("[Content] ID COLLISIONS — progress will be shared between these:\n  " +
        problems.join("\n  "));
    }

    const ALL_TOPICS = flatten(MODULES);
    const UNIT_TOPICS = {};
    UNITS.forEach(u => { UNIT_TOPICS[u.id] = flatten(u.modules); });

    return { MODULES, UNITS, COURSES, ALL_TOPICS, UNIT_TOPICS, problems };
  }

  return { course, build, courses, load, attach, isLoaded, declaredTopics };
})();
