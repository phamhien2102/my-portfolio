"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { cn } from "@/lib/cn";

import { clampY, useFloatY } from "../lib/layout-store";

interface Props {
  /** Bring the course menu back. */
  onExpand: () => void;
}

/** A key press moves the tab by this share of the window height. */
const STEP = 0.04;

/**
 * The tab on the left edge of a wide screen that brings the course menu back after it was folded
 * away. It only exists while the menu is folded; with the menu open, the arrows in the menu's own
 * header fold it again. Hover (or focus) lengthens the tab and reveals a grip above the arrows:
 * drag the grip, or press the up and down arrow keys on it, to move the tab along the edge. The
 * position is remembered.
 */
export function SideFloat({ onExpand }: Props) {
  const saved = useFloatY();
  // While dragging, follow the pointer without writing storage on every move.
  const [dragY, setDragY] = useState<number | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Where on the arrows the pointer took hold, so the tab does not jump to the cursor.
  const grab = useRef(0);

  const y = dragY ?? saved.y;

  const track = (event: PointerEvent<HTMLButtonElement>) =>
    setDragY(clampY((event.clientY - grab.current) / window.innerHeight));

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const box = toggleRef.current?.getBoundingClientRect();
    grab.current = box ? event.clientY - (box.top + box.height / 2) : 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    track(event);
  };

  const onPointerUp = () => {
    if (dragY !== null) saved.set(dragY);
    setDragY(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta = event.key === "ArrowUp" ? -STEP : event.key === "ArrowDown" ? STEP : 0;
    if (!delta) return;
    event.preventDefault();
    saved.set(y + delta);
  };

  return (
    <div
      className={cn("side-float", dragY !== null && "is-dragging")}
      style={{ "--float-y": y } as React.CSSProperties}
    >
      <button
        type="button"
        className="side-float-grip"
        aria-label="Move this button: drag it, or press the up and down arrow keys"
        title="Drag to move"
        onPointerDown={onPointerDown}
        onPointerMove={(event) => dragY !== null && track(event)}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDragY(null)}
        onKeyDown={onKeyDown}
      >
        <GripIcon />
      </button>
      <button
        ref={toggleRef}
        type="button"
        className="side-float-toggle"
        aria-label="Expand course menu"
        aria-expanded={false}
        aria-controls="course-tree"
        title="Expand menu"
        onClick={onExpand}
      >
        <ChevronsIcon flipped />
      </button>
    </div>
  );
}

/** Two chevrons: toward the left edge, where the menu folds away to, or turned around to bring it back. */
export function ChevronsIcon({ flipped }: { flipped: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" data-flipped={flipped}>
      <path
        d="m11 7-5 5 5 5M18 7l-5 5 5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Six dots in two columns: the usual sign for "this can be dragged". */
function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {[8, 12, 16].flatMap((cy) =>
        [9, 15].map((cx) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="currentColor" />
        )),
      )}
    </svg>
  );
}
