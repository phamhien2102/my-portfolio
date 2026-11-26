"use client";

import { useEffect, type RefObject } from "react";

/**
 * The lightbulb in a transcript's corner (see bulbButton in answer-guard.ts): it flips the script
 * between "hint" and "show". It only sets data-mode on the transcript and the button's label; the
 * look is in ielts.css. Every transcript starts in "hint".
 */
export function TranscriptMode({ stageRef }: { stageRef: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onClick = (e: MouseEvent) => {
      const bulb = (e.target as Element | null)?.closest<HTMLButtonElement>(".transcript-bulb");
      const box = bulb?.closest("details.transcript");
      if (!bulb || !box) return;
      const show = box.getAttribute("data-mode") !== "show";
      box.setAttribute("data-mode", show ? "show" : "hint");
      const label = show ? "Back to hints" : "Show the answers in the script";
      bulb.setAttribute("aria-pressed", String(show));
      bulb.setAttribute("aria-label", label);
      bulb.title = label;
    };

    stage.addEventListener("click", onClick);
    return () => stage.removeEventListener("click", onClick);
  }, [stageRef]);

  return null;
}
