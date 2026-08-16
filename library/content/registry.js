// ================================================
// CS Dojo — LIBRARY / content registry
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
  function course(manifest) {
    courses.push(manifest);
    return manifest;
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
        units: unitObjects.map(u => u.id),
        unitObjects
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

  return { course, build, courses };
})();
