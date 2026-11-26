"use client";

import { useEffect, type RefObject } from "react";

/**
 * The "Expand all exercises / Collapse all" buttons at the top of an answers chapter (see FOLD_ALL
 * in answer-guard.ts). It opens or closes every exercise card in the chapter, and opens the skill
 * sections too when expanding so nothing stays hidden behind a closed group.
 */
export function FoldAll({ stageRef }: { stageRef: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element | null)?.closest<HTMLButtonElement>("[data-fold-all]");
      const chapter = button?.closest(".chapter");
      if (!button || !chapter) return;
      const open = button.dataset.foldAll === "open";
      if (open)
        chapter
          .querySelectorAll<HTMLDetailsElement>("details.skill-section")
          .forEach((d) => (d.open = true));
      chapter
        .querySelectorAll<HTMLDetailsElement>("details.exercise-card")
        .forEach((d) => (d.open = open));
    };
    stage.addEventListener("click", onClick);
    return () => stage.removeEventListener("click", onClick);
  }, [stageRef]);
  return null;
}
