"use client";

import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from "react";

import { paintHighlights, selectionOffsets } from "../lib/highlight-dom";
import {
  HIGHLIGHT_COLORS,
  newId,
  useFlashcards,
  useHighlights,
  type HighlightColor,
} from "../lib/study-store";

interface Props {
  stageRef: RefObject<HTMLDivElement | null>;
  chapterId: string;
}

interface Pending {
  text: string;
  start: number;
  end: number;
  /** Viewport position of the tooltip's anchor (top centre of the selection). */
  x: number;
  y: number;
  below: boolean;
}

const MAX_WORD = 200;

/**
 * Select text in a chapter and a small tooltip offers two tools: highlight it, or save it as a
 * flashcard (a dialog then asks for the meaning). Highlights are stored as character offsets per
 * chapter and repainted onto the server-rendered HTML; nothing here touches React's own markup.
 */
export function StudyTools({ stageRef, chapterId }: Props) {
  const highlights = useHighlights();
  const flashcards = useFlashcards();
  const [pending, setPending] = useState<Pending | null>(null);
  const [dialog, setDialog] = useState<{ word: string } | null>(null);

  const chapterHighlights = highlights.items.filter((h) => h.chapterId === chapterId);
  // A stable key so repainting only happens when this chapter's highlights really change.
  const paintKey = chapterHighlights.map((h) => `${h.id}:${h.start}:${h.end}`).join("|");

  useLayoutEffect(() => {
    const section = stageRef.current?.querySelector<HTMLElement>(`#${CSS.escape(chapterId)}`);
    if (section) paintHighlights(section, chapterHighlights);
    // chapterHighlights is derived from paintKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, paintKey, stageRef]);

  const readSelection = useCallback((): Pending | null => {
    const section = stageRef.current?.querySelector<HTMLElement>(`#${CSS.escape(chapterId)}`);
    const selection = window.getSelection();
    if (!section || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    const offsets = selectionOffsets(section, range);
    if (!offsets) return null;

    const text = selection.toString().replace(/\s+/g, " ").trim();
    if (!text || text.length > MAX_WORD) return null;

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;
    const below = rect.top < 64;
    return {
      text,
      ...offsets,
      x: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80),
      y: below ? rect.bottom : rect.top,
      below,
    };
  }, [chapterId, stageRef]);

  // Follow the selection. Debounced a little so it settles after the drag handles stop moving.
  useEffect(() => {
    if (dialog) return;
    let timer: number | undefined;
    const sync = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setPending(readSelection()), 120);
    };
    document.addEventListener("selectionchange", sync);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("selectionchange", sync);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [dialog, readSelection]);

  const dismiss = () => {
    window.getSelection()?.removeAllRanges();
    setPending(null);
  };

  // The same colour on an already highlighted span removes it; another colour replaces it.
  const applyHighlight = (color: HighlightColor) => {
    if (!pending) return;
    const { start, end } = pending;
    const overlapping = chapterHighlights.filter((h) => h.start < end && h.end > start);
    const remove =
      overlapping.length > 0 && overlapping.every((h) => (h.color ?? "yellow") === color);
    highlights.update((items) => {
      const kept = items.filter((h) => !overlapping.some((o) => o.id === h.id));
      return remove ? kept : [...kept, { id: newId(), chapterId, start, end, color }];
    });
    dismiss();
  };

  const removeHighlight = () => {
    if (!pending) return;
    const { start, end } = pending;
    highlights.update((items) =>
      items.filter((h) => h.chapterId !== chapterId || h.start >= end || h.end <= start),
    );
    dismiss();
  };

  const openFlashcard = () => {
    if (!pending) return;
    setDialog({ word: pending.text });
    setPending(null);
  };

  const saveCard = (word: string, meaning: string) => {
    const key = word.toLowerCase();
    flashcards.update((items) => {
      const existing = items.find((c) => c.word.toLowerCase() === key);
      return existing
        ? items.map((c) => (c.id === existing.id ? { ...c, meaning } : c))
        : [...items, { id: newId(), word, meaning, chapterId, createdAt: Date.now() }];
    });
    window.getSelection()?.removeAllRanges();
    setDialog(null);
  };

  return (
    <>
      {pending && (
        <div
          className="sel-tip"
          data-below={pending.below}
          style={{ left: pending.x, top: pending.y }}
          // Keep the text selected while a tool is pressed.
          onMouseDown={(event) => event.preventDefault()}
          role="toolbar"
          aria-label="Selection tools"
        >
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="sel-swatch"
              data-color={color}
              title={`Highlight ${color}`}
              aria-label={`Highlight ${color}`}
              onClick={() => applyHighlight(color)}
            />
          ))}
          {pending &&
            chapterHighlights.some((h) => h.start < pending.end && h.end > pending.start) && (
              <button
                type="button"
                title="Remove highlight"
                aria-label="Remove highlight"
                onClick={removeHighlight}
              >
                <EraserIcon />
              </button>
            )}
          <span className="sel-sep" aria-hidden="true" />
          <button
            type="button"
            title="Add to flashcards"
            aria-label="Add to flashcards"
            onClick={openFlashcard}
          >
            <CardIcon />
          </button>
        </div>
      )}

      {dialog && (
        <FlashcardDialog
          word={dialog.word}
          existing={flashcards.items.find(
            (c) => c.word.toLowerCase() === dialog.word.toLowerCase(),
          )}
          onSave={saveCard}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}

function FlashcardDialog({
  word,
  existing,
  onSave,
  onClose,
}: {
  word: string;
  existing: { meaning: string } | undefined;
  onSave: (word: string, meaning: string) => void;
  onClose: () => void;
}) {
  const [term, setTerm] = useState(word);
  const [meaning, setMeaning] = useState(existing?.meaning ?? "");
  const canSave = term.trim() !== "" && meaning.trim() !== "";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fc-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        className="fc-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-title"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) onSave(term.trim(), meaning.trim());
        }}
      >
        <h2 id="fc-title">{existing ? "Update flashcard" : "Add flashcard"}</h2>

        <label>
          <span>Word</span>
          <input value={term} onChange={(e) => setTerm(e.target.value)} maxLength={MAX_WORD} />
        </label>
        <label>
          <span>Meaning</span>
          <textarea
            autoFocus
            rows={3}
            value={meaning}
            placeholder="Nhập nghĩa của từ…"
            onChange={(e) => setMeaning(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </label>

        <div className="fc-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={!canSave}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 9v6M9 12h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EraserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m8 19-4.2-4.2a1.5 1.5 0 0 1 0-2.1L13 3.5a1.5 1.5 0 0 1 2.1 0l5.4 5.4a1.5 1.5 0 0 1 0 2.1L12 19.5M8 19h12M7.5 10.5l6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
