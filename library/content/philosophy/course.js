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
      title: { ru: "Рим", en: "Rome", he: "רומא" },
      subtitle: { ru: "Цицерон", en: "Cicero", he: "קיקרו" },
      icon: "\u{1F3DB}️",
      modules: mod("MODULE_PHIL_ROME", rome, "data_m1.js")
    }
  ].filter(u => u.modules.length);

  Content.course({
    id: "philosophy",
    title: { ru: "Философия", en: "Philosophy", he: "פילוסופיה" },
    subtitle: { ru: "Цицерон: человек, его мысль и что с ним стало", en: "Cicero: the man, his thought, and what became of him", he: "קיקרו: האיש, המחשבה שלו, ומה עלה בגורלו" },
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
        no Latin, no Roman history.</span>`, he: "<p><strong>זו לא סקירה של \"הוגים גדולים\".</strong> זה אדם אחד, שמתבוננים בו מקרוב מספיק כדי שחייו ורעיונותיו יתחילו להסביר זה את זה.</p><p>קיקרו מתאים לכך כמעט יותר מכל אחד אחר: שרדו ממנו יותר כתבים מאשר מכמעט כל דמות עתיקה אחרת, כולל <em>מכתבים פרטיים</em> שלא הראה לאיש. אנחנו יודעים לא רק מה טען בפומבי, אלא גם איך התנהג כשחשב שאיש אינו רואה. שני הדברים האלה לא תמיד מתיישבים — והפער ביניהם הוא מה שהקורס הזה בנוי עליו.</p><p>תשעה פרקים, מסודרים לא לפי הכרונולוגיה אלא לפי הסלמה: קודם המוות, אחר כך איך הגיע אליו, אחר כך מה הצליח ליצור, ורק בסוף מה טען בפועל. עד הפרק האחרון ברור שהפילוסופיה שלו לא הייתה קישוט על ביוגרפיה, אלא כלי שהשתמש בו — ופעם אחת, לבסוף, בחן אותו על עצמו.</p><p><strong>כל טענה מגובה במקור.</strong> שתי מהדורות אמיתיות מתחת לכל פרק, עם מספרי עמודים וסעיפים: רוסון, פון אלברכט, זרצקי, ולצידם הטקסטים העתיקים עצמם. היכן שהמקורות חלוקים או שותקים, הקורס אומר זאת במקום לבחור בקריאה הנוחה.</p><span class=\"ca-for\"><strong>למי זה מתאים:</strong> לכל מי שמתעניין יותר <em>בשאלה אם פילוסופיה שרדה את המפגש עם חייו של מי שכתב אותה</em> מאשר במה שהפילוסוף אמר. לא צריך הכנה — לא לטינית, לא היסטוריה רומית.</span>"
    },

    units
  });
})();
