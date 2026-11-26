"use client";

import { useRef, useState, type MouseEvent } from "react";

import type { Paragraph } from "./types";
import type { Highlight } from "./run";

interface Selection {
  para: number;
  start: number;
  end: number;
  x: number;
  y: number;
}

/** Characters from the start of `container` to a point inside it. */
function offsetIn(container: Node, node: Node, offset: number): number {
  const r = document.createRange();
  r.selectNodeContents(container);
  r.setEnd(node, offset);
  return r.toString().length;
}

const newId = () => Math.random().toString(36).slice(2, 9);

/**
 * A passage you can mark up, like the computer-delivered test: select words and choose Highlight or
 * Note; click a highlight to read or edit its note, or to remove it. Highlights belong to the saved
 * test, so they survive a reload.
 */
export function MarkablePassage({
  paragraphs,
  passage,
  highlights,
  onChange,
}: {
  paragraphs: Paragraph[];
  passage: number;
  highlights: Highlight[];
  onChange: (next: Highlight[]) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Selection | null>(null);
  const [open, setOpen] = useState<{ id: string; x: number; y: number } | null>(null);

  const mine = highlights.filter((h) => h.passage === passage);

  function readSelection() {
    const s = window.getSelection();
    if (!s || s.isCollapsed || !s.rangeCount) return setSel(null);
    const range = s.getRangeAt(0);
    const a = (range.startContainer.parentElement ?? null)?.closest<HTMLElement>(".mx-ptext");
    const b = (range.endContainer.parentElement ?? null)?.closest<HTMLElement>(".mx-ptext");
    if (!a || a !== b || !box.current?.contains(a)) return setSel(null);
    const start = offsetIn(a, range.startContainer, range.startOffset);
    const end = offsetIn(a, range.endContainer, range.endOffset);
    if (end <= start) return setSel(null);
    const r = range.getBoundingClientRect();
    setOpen(null);
    setSel({ para: Number(a.dataset.para), start, end, x: r.left + r.width / 2, y: r.top });
  }

  function add(withNote: boolean) {
    if (!sel) return;
    const overlapping = mine.filter(
      (h) => h.para === sel.para && h.start < sel.end && h.end > sel.start,
    );
    const keep = highlights.filter((h) => !overlapping.includes(h));
    const id = newId();
    onChange([
      ...keep,
      {
        id,
        passage,
        para: sel.para,
        start: Math.min(sel.start, ...overlapping.map((h) => h.start)),
        end: Math.max(sel.end, ...overlapping.map((h) => h.end)),
        note: overlapping.map((h) => h.note).find(Boolean) ?? "",
      },
    ]);
    window.getSelection()?.removeAllRanges();
    if (withNote) setOpen({ id, x: sel.x, y: sel.y });
    setSel(null);
  }

  function clickMark(e: MouseEvent<HTMLElement>) {
    const el = (e.target as HTMLElement).closest<HTMLElement>("mark[data-id]");
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSel(null);
    setOpen({ id: el.dataset.id ?? "", x: r.left + r.width / 2, y: r.top });
  }

  const active = open ? highlights.find((h) => h.id === open.id) : undefined;

  return (
    <div ref={box} onMouseUp={readSelection} onClick={clickMark}>
      {paragraphs.map((p, i) => {
        const marks = mine.filter((h) => h.para === i).sort((a, b) => a.start - b.start);
        const parts: React.ReactNode[] = [];
        let at = 0;
        for (const h of marks) {
          if (h.start > at) parts.push(p.text.slice(at, h.start));
          parts.push(
            <mark
              key={h.id}
              data-id={h.id}
              className={`mx-hl${h.note ? "has-note" : ""}`}
              title={h.note || undefined}
            >
              {p.text.slice(h.start, h.end)}
            </mark>,
          );
          at = h.end;
        }
        if (at < p.text.length) parts.push(p.text.slice(at));
        return (
          <p key={i}>
            {p.label && <b className="mx-label">{p.label}</b>}
            <span className="mx-ptext" data-para={i}>
              {parts}
            </span>
          </p>
        );
      })}

      {sel && (
        <div
          className="mx-tip"
          style={{ left: sel.x, top: sel.y }}
          role="toolbar"
          aria-label="Mark the text"
        >
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(false)}>
            Highlight
          </button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(true)}>
            Note
          </button>
        </div>
      )}

      {open && active && (
        <div
          className="mx-tip mx-note-pop"
          style={{ left: open.x, top: open.y }}
          role="dialog"
          aria-label="Edit note"
        >
          <textarea
            aria-label="Note"
            value={active.note}
            placeholder="Write a note…"
            autoFocus
            onChange={(e) =>
              onChange(
                highlights.map((h) => (h.id === active.id ? { ...h, note: e.target.value } : h)),
              )
            }
          />
          <div>
            <button
              type="button"
              onClick={() => {
                onChange(highlights.filter((h) => h.id !== active.id));
                setOpen(null);
              }}
            >
              Remove highlight
            </button>
            <button type="button" onClick={() => setOpen(null)}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
