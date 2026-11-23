import type { ReactNode } from "react";

/** Turn `code` between backticks into <code>; everything else stays plain text. */
export function renderInline(text: string): ReactNode[] {
  return text.split("`").map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}
