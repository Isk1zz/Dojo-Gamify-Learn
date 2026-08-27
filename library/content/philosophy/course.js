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

    about: {
      ru: `<p><strong>Это не обзор «великих мыслителей».</strong> Это один человек,
        рассмотренный достаточно близко, чтобы его жизнь и его идеи начали
        объяснять друг друга.</p>
      <p>Цицерон удобен для этого как никто другой: от него дошло больше текста,
        чем почти от кого-либо в античности, включая <em>частные письма</em>, которые
        он никому не показывал. Мы знаем не только что он утверждал публично, но и
        как он вёл себя, когда думал, что никто не смотрит. Эти две вещи не всегда
        совпадают — и вот на этом зазоре курс и построен.</p>
      <p>Девять глав идут не по хронологии, а по нарастанию: сначала смерть, потом
        как он до неё дошёл, потом что он успел сделать, и только в конце —
        что он, собственно, думал. К последней главе становится видно, что его
        философия была не украшением биографии, а инструментом, которым он
        пользовался — и один раз он проверил его на себе окончательно.</p>
      <p><strong>Каждое утверждение подкреплено источником.</strong> Под каждой главой
        два реальных издания с номерами страниц и параграфов: Роусон, фон Альбрехт,
        Зарецки, плюс сами античные тексты. Там, где источники расходятся или молчат,
        курс говорит об этом прямо, а не выбирает удобное.</p>
      <span class="ca-for"><strong>Для кого:</strong> для тех, кому интересно не
        «что говорил философ», а <em>выдержала ли его философия столкновение с его
        собственной жизнью</em>. Никакой подготовки не требуется — ни латыни, ни
        истории Рима.</span>`,
      en: `<p><strong>This is not a survey of "great thinkers."</strong> It is one man,
        looked at closely enough that his life and his ideas begin to explain each
        other.</p>
      <p>Cicero suits this better than almost anyone: more of his writing survives
        than of nearly any other ancient figure, including <em>private letters</em>
        he showed to nobody. We know not only what he argued in public but how he
        behaved when he thought no one was watching. Those two things do not always
        agree — and the gap between them is what this course is built on.</p>
      <p>Nine chapters, ordered not by chronology but by escalation: the death
        first, then how he arrived at it, then what he managed to make, and only at
        the end what he actually argued. By the last chapter it is clear that his
        philosophy was not decoration on a biography but a tool he used — and once,
        finally, tested on himself.</p>
      <p><strong>Every claim is sourced.</strong> Two real editions under every
        chapter, with page and section numbers: Rawson, von Albrecht, Zarecki, plus
        the ancient texts themselves. Where the sources disagree or fall silent, the
        course says so rather than picking the convenient reading.</p>
      <span class="ca-for"><strong>Who it is for:</strong> anyone more interested in
        <em>whether a philosophy survived contact with the life of the person who
        wrote it</em> than in what the philosopher said. No preparation needed —
        no Latin, no Roman history.</span>`
    },

    units
  });
})();
