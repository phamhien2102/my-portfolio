"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { cn } from "@/lib/cn";

import { exportFlashcards, importFlashcards, MAX_FILE_BYTES } from "../lib/flashcards-xlsx";
import { MAX_CARDS, MAX_MEANING, MAX_WORD, useFlashcards } from "../lib/study-store";

type Mode = "review" | "list";

/**
 * The saved flashcards: a review mode (flip through one card at a time) and a list mode (see
 * everything, jump back to the chapter a word came from, delete).
 */
export function FlashcardsPanel({ onClose }: { onClose: () => void }) {
  const { items, update } = useFlashcards();
  const [mode, setMode] = useState<Mode>("review");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [notice, setNotice] = useState("");
  // The how-to for Import is a tooltip: where it sits is worked out when "?" is pressed.
  const [help, setHelp] = useState<TipPlace | null>(null);
  const helpBtnRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Deleting can leave the index past the end.
  const at = Math.min(index, Math.max(items.length - 1, 0));
  const card = items[at];

  const go = (delta: number) => {
    if (!items.length) return;
    setIndex((at + delta + items.length) % items.length);
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Escape folds the import help away first, and only then closes the panel.
      if (event.key === "Escape") {
        if (help) setHelp(null);
        else onClose();
      }
      if (mode !== "review") return;
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === " " && !(event.target as HTMLElement).closest("button")) {
        event.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onExport = async () => {
    try {
      await exportFlashcards(items);
      setNotice(`Exported ${items.length} cards.`);
    } catch {
      setNotice("Could not export the file.");
    }
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setNotice(
        `That file is over ${MAX_FILE_BYTES / 1024 / 1024} MB, which is too big to import.`,
      );
      return;
    }
    try {
      const { cards, result } = await importFlashcards(file, items);
      if (!update(() => cards)) {
        setNotice("Could not save the cards: the browser storage is full or blocked.");
        return;
      }
      const left = [
        result.skipped && `${result.skipped} skipped (missing word or meaning)`,
        result.tooLong && `${result.tooLong} too long`,
        result.overLimit && `${result.overLimit} over the ${MAX_CARDS}-card limit`,
      ].filter(Boolean);
      setNotice(
        `Imported: ${result.added} added, ${result.updated} updated` +
          (left.length ? `, ${left.join(", ")}.` : "."),
      );
    } catch {
      setNotice(
        "Could not read that file. Use an .xlsx with Word in column A and Meaning in column B.",
      );
    }
  };

  // Put the tooltip above the button when there is room (the button sits at the foot of the panel),
  // below it otherwise, and keep it inside the window, with its arrow still on the button.
  const openHelp = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (help) {
      setHelp(null);
      return;
    }
    const button = event.currentTarget.getBoundingClientRect();
    const margin = 12;
    const width = Math.min(21 * 16, window.innerWidth - margin * 2);
    const left = Math.min(
      Math.max(button.left + button.width / 2 - width / 2, margin),
      window.innerWidth - width - margin,
    );
    const above = button.top - margin;
    const below = window.innerHeight - button.bottom - margin;
    const side = above >= 280 || above >= below ? "top" : "bottom";
    setHelp({
      left,
      width,
      arrow: button.left + button.width / 2 - left,
      side,
      edge: side === "top" ? window.innerHeight - button.top + 10 : button.bottom + 10,
      maxHeight: (side === "top" ? above : below) - 10,
    });
  };

  // It closes on a press anywhere else, on resize, and when the page behind it scrolls.
  useEffect(() => {
    if (!help) return;
    const inside = (target: EventTarget | null) =>
      target instanceof Node &&
      (tipRef.current?.contains(target) || helpBtnRef.current?.contains(target));
    const onDown = (event: PointerEvent) => {
      if (!inside(event.target)) setHelp(null);
    };
    const onScroll = (event: Event) => {
      if (!inside(event.target)) setHelp(null);
    };
    const close = () => setHelp(null);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [help]);

  const remove = (id: string) => update((all) => all.filter((c) => c.id !== id));

  return (
    <div
      className="fc-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="fc-dialog fc-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fcp-title"
      >
        <div className="fc-panel-head">
          <h2 id="fcp-title">Flashcards · {items.length}</h2>
          <div className="fc-tabs" role="tablist">
            {(["review", "list"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={cn(mode === m && "is-on")}
                onClick={() => setMode(m)}
              >
                {m === "review" ? "Review" : "List"}
              </button>
            ))}
          </div>
          <button type="button" className="fc-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        {!card ? (
          <p className="fc-empty">
            No flashcards yet. Select a word in a chapter and press the card icon.
          </p>
        ) : mode === "review" ? (
          <>
            <button
              type="button"
              className={cn("fc-card", flipped && "is-flipped")}
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Show word" : "Show meaning"}
            >
              <span className="fc-card-inner">
                <span className="fc-face fc-front" aria-hidden={flipped}>
                  <span className="fc-card-label">Word</span>
                  <span className="fc-card-text">{card.word}</span>
                </span>
                <span className="fc-face fc-back" aria-hidden={!flipped}>
                  <span className="fc-card-label">Meaning</span>
                  <span className="fc-card-text">{card.meaning}</span>
                </span>
              </span>
            </button>
            <div className="fc-actions fc-nav">
              <button type="button" className="btn" onClick={() => go(-1)}>
                ← Prev
              </button>
              <span className="muted">
                {at + 1} / {items.length}
              </span>
              <button type="button" className="btn primary" onClick={() => go(1)}>
                Next →
              </button>
            </div>
          </>
        ) : (
          <ul className="fc-list">
            {items.map((c) => (
              <li key={c.id}>
                <div>
                  <strong>{c.word}</strong>
                  <span>{c.meaning}</span>
                </div>
                <a href={`#${c.chapterId}`} onClick={onClose}>
                  Open
                </a>
                <button type="button" aria-label={`Delete ${c.word}`} onClick={() => remove(c.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="fc-io">
          <button
            type="button"
            className="fc-io-btn"
            disabled={!items.length}
            title="Export the cards as an .xlsx file"
            onClick={onExport}
          >
            <TransferIcon direction="down" />
            Export
          </button>
          <button
            type="button"
            className="fc-io-btn"
            title="Import cards from an .xlsx file"
            onClick={() => fileRef.current?.click()}
          >
            <TransferIcon direction="up" />
            Import
          </button>
          <button
            type="button"
            ref={helpBtnRef}
            className="fc-help-btn"
            aria-label="How to make an Excel file to import"
            aria-expanded={help !== null}
            aria-controls="fc-import-help"
            onClick={openHelp}
          >
            ?
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => {
              void onImport(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {help && <HelpTip place={help} tipRef={tipRef} />}
          {notice && (
            <span className="fc-notice" role="status">
              {notice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** A tray with an arrow into or out of it. */
function TransferIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={
          direction === "down"
            ? "M12 4v11m0 0-4-4m4 4 4-4M5 19h14"
            : "M12 15V4m0 0L8 8m4-4 4 4M5 19h14"
        }
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** How to make the .xlsx that Import reads: what goes in which column, and the rules it follows. */
function ImportHelp() {
  return (
    <>
      <strong>Make an Excel file to import</strong>
      <ol>
        <li>Open Excel (or Google Sheets, or Numbers) and start a new sheet.</li>
        <li>
          Put <b>Word</b> in column A and <b>Meaning</b> in column B, one card per row. A header row
          on top is optional.
        </li>
        <li>
          Save it as <b>.xlsx</b> (in Google Sheets: File → Download → Microsoft Excel), then press
          Import.
        </li>
      </ol>

      <table className="fc-sample" aria-label="Example of the sheet">
        <thead>
          <tr>
            <th aria-hidden="true" />
            <th>A</th>
            <th>B</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>1</th>
            <td>Word</td>
            <td>Meaning</td>
          </tr>
          <tr>
            <th>2</th>
            <td>ubiquitous</td>
            <td>có mặt ở khắp nơi</td>
          </tr>
          <tr>
            <th>3</th>
            <td>mitigate</td>
            <td>giảm nhẹ</td>
          </tr>
        </tbody>
      </table>

      <ul>
        <li>Only the first sheet is read.</li>
        <li>A word you already have (any letter case) gets the new meaning, not a second card.</li>
        <li>A row with a word but no meaning, or the other way round, is skipped.</li>
        <li>
          Limits: {MAX_CARDS} cards in all, a word up to {MAX_WORD} characters, a meaning up to{" "}
          {MAX_MEANING}, and a file up to {MAX_FILE_BYTES / 1024 / 1024} MB. Anything over is
          skipped and counted in the summary.
        </li>
        <li>Tip: press Export first. The file it makes is already in this format.</li>
      </ul>
    </>
  );
}

interface TipPlace {
  /** Viewport position and width of the tooltip. */
  left: number;
  width: number;
  /** Where the arrow sits, measured from the tooltip's left edge. */
  arrow: number;
  /** Above the button ("top") or below it. */
  side: "top" | "bottom";
  /** Distance from the window's bottom edge (above) or top edge (below). */
  edge: number;
  maxHeight: number;
}

/** The how-to as a tooltip beside the "?" button. It floats, so the panel behind keeps its shape. */
function HelpTip({
  place,
  tipRef,
}: {
  place: TipPlace;
  tipRef: React.RefObject<HTMLDivElement | null>;
}) {
  const style: CSSProperties = {
    left: place.left,
    width: place.width,
    ...(place.side === "top" ? { bottom: place.edge } : { top: place.edge }),
  };
  return (
    <div ref={tipRef} id="fc-import-help" className="fc-tip" data-side={place.side} style={style}>
      <div className="fc-tip-body" style={{ maxHeight: place.maxHeight }}>
        <ImportHelp />
      </div>
      <span className="fc-tip-arrow" style={{ left: place.arrow }} />
    </div>
  );
}
