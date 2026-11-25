import { MAX_CARDS, MAX_MEANING, MAX_WORD, newId, type Flashcard } from "./study-store";

/** The biggest .xlsx the import will open. A few thousand cards come to well under 1 MB. */
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

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
  /** A word without a meaning, or a meaning without a word. */
  skipped: number;
  /** A word or a meaning over its length limit. */
  tooLong: number;
  /** New words that did not fit under the limit on the number of cards. */
  overLimit: number;
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
  const result: ImportResult = { added: 0, updated: 0, skipped: 0, tooLong: 0, overLimit: 0 };

  sheet.forEach((row, i) => {
    const word = text(row[0]);
    const meaning = text(row[1]);
    if (i === 0 && word.toLowerCase() === HEADER[0].toLowerCase()) return;
    if (!word || !meaning) {
      if (word || meaning) result.skipped++;
      return;
    }
    if (word.length > MAX_WORD || meaning.length > MAX_MEANING) {
      result.tooLong++;
      return;
    }
    const at = cards.findIndex((c) => c.word.toLowerCase() === word.toLowerCase());
    if (at >= 0) {
      // Changing a card you already have is always fine, even when the deck is full.
      if (cards[at].meaning !== meaning) result.updated++;
      cards[at] = { ...cards[at], meaning };
    } else if (cards.length >= MAX_CARDS) {
      result.overLimit++;
    } else {
      cards.push({ id: newId(), word, meaning, chapterId: text(row[2]), createdAt: Date.now() });
      result.added++;
    }
  });

  return { cards, result };
}
