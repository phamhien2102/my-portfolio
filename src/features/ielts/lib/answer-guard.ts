/**
 * Turns an "Answers & Transcripts" chapter into something to study from rather than read through:
 *  - a listening exercise reads recording, then transcript: the answer table moves from above the
 *    recording into an "Answers" button in the recording's box (a popover), and the transcript is
 *    folded and starts closed; the "listen again" tip stays above it,
 *  - any other exercise keeps its order, with its answer table folded into a <details>,
 * Opening a transcript is how you check what you heard: it starts in "hint" mode and a switch inside
 * shows the answers and traps (the lightbulb, see bulbButton).
 *
 * This only reorders and wraps our own build-time HTML (see content.json); the look is in ielts.css.
 */

const hasAnswers = (id: string) => id.includes("answers-transcripts");

const fold = (kind: "answers" | "transcript", label: string, body: string, attrs = "") =>
  `<details class="fold ${kind}"${attrs}><summary>${label}</summary>${body}</details>`;

/**
 * The script has two ways to read it. "Hint" (the default) leaves the words plain and only marks the
 * lines that hold an answer; "show" also paints the answers yellow and underlines the traps in red.
 * The lightbulb flips between them (components/transcript-mode.tsx); the look is in ielts.css.
 */
const BULB =
  '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>' +
  '<path d="M9 18h6M10 22h4"/></svg>';

/** The lightbulb in the script's top-right corner; it flips the script between hint and show. */
const bulbButton = () =>
  '<button type="button" class="transcript-bulb" aria-pressed="false" ' +
  'aria-label="Show the answers in the script" title="Show the answers in the script">' +
  `${BULB}</button>`;

/** Put the lightbulb first inside the script box (CSS pins it to the corner and keeps it in view). */
const withBulb = (script: string) =>
  script.replace('<div class="passage">', `<div class="passage">${bulbButton()}`);

/** Give every paragraph that contains an answer a class, so "hint" can mark that line. */
const hintLines = (script: string) =>
  script
    .split(/(<p>[\s\S]*?<\/p>)/)
    .map((part) =>
      part.startsWith("<p>") && part.includes("<mark>")
        ? `<p class="has-answer">${part.slice(3)}`
        : part,
    )
    .join("");

/**
 * In a listening exercise the answers live behind a button in the recording's box: it opens the
 * answer table as a popover under the button (components/answers-popover.tsx does the opening).
 */
const answersButton = (table: string) =>
  '<div class="answers-wrap">' +
  '<button type="button" class="answers-btn" aria-expanded="false" aria-haspopup="dialog">Answers</button>' +
  // The backdrop dims the page behind the popover and takes the click that closes it, so that click
  // does not also land on whatever is underneath.
  '<div class="answers-backdrop" hidden></div>' +
  `<div class="answers-pop" role="dialog" aria-label="Answers" hidden>${table}</div>` +
  "</div>";

const withAnswersButton = (recording: string, table: string) =>
  recording
    .replace('<aside class="note">', '<aside class="note has-answers">')
    .replace(/<\/aside>$/, `${answersButton(table)}</aside>`);

const TABLE = '<div class="tablewrap">[\\s\\S]*?</div>';

/**
 * "W1 Listening · Easy (Band 5–5.5)" is split into a week, a skill, a level and a band so the
 * summary bar can show "Listening · Easy · Band 5–5.5" (the week is the chapter's own title and is
 * kept for screen readers only). The words and the spaces between them stay in the heading.
 */
const EXERCISE_HEADING =
  /<h5([^>]*)>\s*W(\d+) (Listening|Reading|Writing|Speaking) · (Easy|Medium|Challenging) \(Band ([^)]+)\)\s*<\/h5>/g;

const labelExercises = (html: string) =>
  html.replace(
    EXERCISE_HEADING,
    (_all, attrs: string, week: string, skill: string, level: string, band: string) =>
      `<h5${attrs} class="exercise" data-skill="${skill.toLowerCase()}">` +
      `<span class="ex-week">W${week}</span> ` +
      `<span class="ex-skill">${skill}</span> ` +
      `<span class="ex-level" data-level="${level.toLowerCase()}">${level}</span> ` +
      `<span class="ex-band">Band ${band}</span></h5>`,
  );

/** "Listening · Medium — Joining a course" -> "Joining a course" (the recording's own name). */
const trackTitle = (inside: string) => {
  const m = /<aside class="note">\s*<p><strong>[^<]*?—\s*([^<]+?)\s*<\/strong>/.exec(inside);
  return m ? `<span class="ex-title">${m[1]}</span>` : "";
};

/** One exercise's body: a listening exercise gets its recording, answers button and folded script. */
function exerciseBody(inside: string): string {
  // Listening: [questions], table, [tip], recording, script  ->  [questions], recording (with an
  // Answers button), script.
  const listening = new RegExp(
    `^(<div class="passage">[\\s\\S]*?</div>)?(${TABLE})(?:<p>(?:(?!</p>)[\\s\\S])*?</p>)?(<aside class="note">(?:(?!</aside>)[\\s\\S])*?<audio[\\s\\S]*?</aside>)(<div class="passage">[\\s\\S]*?</div>)`,
  );
  const m = listening.exec(inside);
  if (m) {
    // Week 3 puts a map or plan for the questions before the answer table: it stays up front.
    const [whole, questions = "", table, recording, script] = m;
    const note =
      '<p class="transcript-note">Hint mode marks the lines that hold an answer. Tap the lightbulb to show the answers and the traps.</p>';
    return (
      questions +
      withAnswersButton(recording, table) +
      fold(
        "transcript",
        "Transcript",
        `<div class="transcript-body">${note}${withBulb(hintLines(script))}</div>`,
        ' data-mode="hint"',
      ) +
      inside.slice(whole.length)
    );
  }
  // Any other exercise keeps its order, but its answer table still folds.
  return inside.replace(new RegExp(TABLE, "g"), (table) => fold("answers", "Answers", table));
}

/** Everything is collapsible: each skill is a <details> (open) and each exercise inside it too (closed). */
const SKILL_HEAD = /(<h4)(\s+id="[^"]*-(listening|reading|writing|speaking)")>([\s\S]*?)<\/h4>/g;

const FOLD_ALL =
  '<div class="fold-all" role="group" aria-label="Exercises">' +
  '<button type="button" data-fold-all="open">Expand all exercises</button>' +
  '<button type="button" data-fold-all="close">Collapse all</button></div>';

export function guardChapterHtml(html: string, chapterId: string): string {
  if (!hasAnswers(chapterId)) return html;
  html = labelExercises(html);

  // 1. Exercises: heading + body become a closed <details class="exercise-card">.
  const parts = html.split(/(<h5[^>]*>[\s\S]*?<\/h5>)/);
  let out = parts[0];
  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i];
    const body = parts[i + 1] ?? "";
    const cut = body.search(/<h4[^>]*>/); // the next skill starts here, outside this exercise
    const inside = cut < 0 ? body : body.slice(0, cut);
    const after = cut < 0 ? "" : body.slice(cut);
    const skill = /data-skill="(\w+)"/.exec(heading)?.[1] ?? "";
    out +=
      `<details class="exercise-card" data-skill="${skill}"><summary>${heading}${trackTitle(inside)}</summary>` +
      `<div class="exercise-body">${exerciseBody(inside)}</div></details>${after}`;
  }

  // 2. Skills: each h4 and everything up to the next h4 is an open <details class="skill-section">.
  const sections = out.split(/(<h4[^>]*>[\s\S]*?<\/h4>)/);
  out = sections[0];
  if (sections.length > 1) out = out.replace(/(<p><strong>Jump to:[\s\S]*?<\/p>)/, `$1${FOLD_ALL}`);
  for (let i = 1; i < sections.length; i += 2) {
    const head = sections[i].replace(
      SKILL_HEAD,
      (_a, tag: string, id: string, skill: string, text: string) =>
        `${tag}${id} class="skill-head" data-skill="${skill}">${text}</h4>`,
    );
    const skill = /data-skill="(\w+)"/.exec(head)?.[1] ?? "";
    out += `<details class="skill-section" data-skill="${skill}" open><summary>${head}</summary>${sections[i + 1] ?? ""}</details>`;
  }
  return out;
}
