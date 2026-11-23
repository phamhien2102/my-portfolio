import { newId, type Flashcard } from "./study-store";

const HEADER = ["Word", "Meaning", "Chapter", "Added"] as const;

/** Save the cards as an .xlsx file. The library is loaded on click so it stays out of the page bundle. */
export async function exportFlashcards(cards: readonly Flashcard[]) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const bold = { fontWeight: "bold" as const };
  const rows = [
    HEADER.map((value) => ({ value, ...bold })),
    ...cards.map((c) => [
      { value: c.word },
      { value: c.meaning },
      { value: c.chapterId },
      { value: new Date(c.createdAt).toISOString().slice(0, 10) },
    ]),
  ];
  await writeExcelFile(rows, {
    columns: [{ width: 28 }, { width: 48 }, { width: 28 }, { width: 12 }],
  }).toFile("ielts-flashcards.xlsx");
}

export interface ImportResult {
  added: number;
  updated: number;
  skipped: number;
}

const text = (value: unknown) => (value == null ? "" : String(value).trim());

/**
 * Read an .xlsx file with Word and Meaning in the first two columns (a header row is optional)
 * and merge it into `existing`. A word that already exists, compared without case, gets the new
 * meaning instead of a duplicate card. Returns the merged list and a summary.
 */
export async function importFlashcards(file: File, existing: readonly Flashcard[]) {
  const { readSheet } = await import("read-excel-file/browser");
  const sheet = await readSheet(file);

  const cards = [...existing];
  const result: ImportResult = { added: 0, updated: 0, skipped: 0 };

  sheet.forEach((row, i) => {
    const word = text(row[0]);
    const meaning = text(row[1]);
    if (i === 0 && word.toLowerCase() === HEADER[0].toLowerCase()) return;
    if (!word || !meaning) {
      if (word || meaning) result.skipped++;
      return;
    }
    const at = cards.findIndex((c) => c.word.toLowerCase() === word.toLowerCase());
    if (at >= 0) {
      if (cards[at].meaning !== meaning) result.updated++;
      cards[at] = { ...cards[at], meaning };
    } else {
      cards.push({ id: newId(), word, meaning, chapterId: text(row[2]), createdAt: Date.now() });
      result.added++;
    }
  });

  return { cards, result };
}
