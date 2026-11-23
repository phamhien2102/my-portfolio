import { BOOK } from "../data";

export interface OutlineChapter {
  id: string;
  label: string;
  /** Rough reading time, from the word count. */
  minutes: number;
  audio: number;
  /** The chapter mixes English and Vietnamese. */
  bilingual: boolean;
}

export interface OutlinePart {
  id: string;
  number: string;
  name: string;
  /** The folder colour in the sidebar. */
  color: string;
  chapters: readonly OutlineChapter[];
}

const PART_COLORS = ["#d9b46c", "#6fbf73", "#9b86d6", "#ee9a5f", "#5aa2dd", "#e07a96"] as const;
const WORDS_PER_MINUTE = 180;
const VIETNAMESE = /[ăâđêôơưĂÂĐÊÔƠƯẠ-ỹ]/;

/** The light outline the sidebar needs. The chapter HTML itself never leaves the server. */
export function buildOutline(): readonly OutlinePart[] {
  return BOOK.parts.map((part, index) => ({
    id: part.id,
    number: part.number,
    name: part.name,
    color: PART_COLORS[index % PART_COLORS.length],
    chapters: part.chapters.map((chapter) => {
      const text = chapter.html.replace(/<[^>]+>/g, " ");
      const words = text.split(/\s+/).filter(Boolean).length;
      return {
        id: chapter.id,
        label: chapter.label,
        minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        audio: (chapter.html.match(/<audio/g) ?? []).length,
        bilingual: VIETNAMESE.test(text),
      };
    }),
  }));
}
