import type { Highlight, Note } from "./study-store";

const HIGHLIGHT = "user-hl";
const NOTE = "user-note";

function textNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
  return nodes;
}

/** Offset of (node, offset) inside root.textContent. Wrapping text in spans never changes it. */
function offsetOf(root: HTMLElement, node: Node, offset: number): number {
  const probe = document.createRange();
  probe.selectNodeContents(root);
  probe.setEnd(node, offset);
  return probe.toString().length;
}

/** The selection as offsets into `root`, or null when it is empty or leaves `root`. */
export function selectionOffsets(root: HTMLElement, range: Range) {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const start = offsetOf(root, range.startContainer, range.startOffset);
  const end = offsetOf(root, range.endContainer, range.endOffset);
  return end > start ? { start, end } : null;
}

/** Remove every highlight and note span from `root` and merge the split text nodes back together. */
function clear(root: HTMLElement) {
  for (const el of root.querySelectorAll(`span.${HIGHLIGHT}, span.${NOTE}`)) {
    el.replaceWith(...Array.from(el.childNodes));
  }
  root.normalize();
}

interface Mark {
  start: number;
  end: number;
  className: string;
  noteId?: string;
}

/**
 * Redraw all highlights and notes of one chapter. Idempotent, so it is safe to call on every change.
 * A note is a span of its own with the note's id on it, so a click on the text can find the note.
 */
export function paintHighlights(
  root: HTMLElement,
  highlights: readonly Highlight[],
  notes: readonly Note[] = [],
) {
  clear(root);
  const marks: Mark[] = [
    ...highlights.map((h) => ({
      start: h.start,
      end: h.end,
      className: `${HIGHLIGHT} hl-${h.color ?? "yellow"}`,
    })),
    ...notes.map((n) => ({ start: n.start, end: n.end, className: NOTE, noteId: n.id })),
  ];
  for (const mark of marks) {
    let pos = 0;
    // Collect first: wrapping replaces nodes, which would upset a live walk.
    for (const node of textNodes(root)) {
      const from = pos;
      pos += node.length;
      const a = Math.max(mark.start, from) - from;
      const b = Math.min(mark.end, pos) - from;
      if (b <= a) continue;
      // Skip the whitespace-only gaps between blocks.
      if (!node.data.slice(a, b).trim()) continue;
      const target = node.splitText(a);
      target.splitText(b - a);
      const span = document.createElement("span");
      span.className = mark.className;
      if (mark.noteId) span.dataset.noteId = mark.noteId;
      target.replaceWith(span);
      span.append(target);
    }
  }
}
