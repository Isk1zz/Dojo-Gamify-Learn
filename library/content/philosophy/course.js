// ================================================
// Course: Философия / Philosophy
// ------------------------------------------------
// Manifest only. Teaching content lives in the data_m*.js files beside it.
//
// ---- Units are traditions, not chronology ----
// Rome first because Cicero is written; Greece, the Jewish tradition and the
// East get unit ids 42, 43 and 44 when they exist. A unit whose module has
// not been written is simply absent — `mod()` drops it and says so in the
// console, exactly as intro-cs does. Nothing here declares a unit it cannot
// fill; an empty card is worse than no card.
//
// ---- Unit ids are global across all courses ----
// 1–8 belong to intro-cs, 31 to bike-a3. Philosophy starts at 41 with room
// above it, so a new tradition never has to renumber saved progress.
//
// ---- Free, deliberately ----
// One unit, two topics. A price on that would be charging for a sample. It
// gets a price when it has enough units to be a course rather than a start.
// ================================================

(() => {
  // typeof is the only safe way to ask about a name that may not exist —
  // see intro-cs/course.js for the full account of why this matters.
  const rome = typeof MODULE_PHIL_ROME === "undefined" ? null : MODULE_PHIL_ROME;

  function mod(name, m, file) {
    if (m) return [m];
    console.error(
      `[philosophy] ${name} never loaded, so its unit is missing from the Library.\n` +
      `  Add this to index.html BEFORE library/content/philosophy/course.js:\n` +
      `    <script src="library/content/philosophy/${file}"></script>`
    );
    return [];
  }

  const units = [
    {
      id: 41,
      title: { ru: "Рим", en: "Rome" },
      subtitle: { ru: "Цицерон", en: "Cicero" },
      icon: "\u{1F3DB}️",
      modules: mod("MODULE_PHIL_ROME", rome, "data_m1.js")
    }
  ].filter(u => u.modules.length);

  Content.course({
    id: "philosophy",
    title: { ru: "Философия", en: "Philosophy" },
    subtitle: { ru: "Люди, их мысль и то, что с ними стало", en: "The thinkers, their thought, and what became of them" },
    icon: "\u{1F3F5}️",
    track: "humanities",
    available: true,
    units
  });
})();
