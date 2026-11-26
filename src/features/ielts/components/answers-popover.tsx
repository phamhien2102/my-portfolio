"use client";

import { useEffect, type RefObject } from "react";

/**
 * The "Answers" button in a listening recording's box (see answersButton in answer-guard.ts) opens
 * the answer table as a popover under it, over a dimmed backdrop. A click on the backdrop (anywhere
 * outside the popover), or Escape, closes it, and only one is open at a time. The backdrop covers the
 * page, so the click that closes the popover cannot reach what is underneath. It only toggles
 * `hidden` and aria-expanded; the look is in ielts.css.
 */
export function AnswersPopover({ stageRef }: { stageRef: RefObject<HTMLDivElement | null> }) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const closeAll = (except?: Element | null) => {
      stage.querySelectorAll<HTMLElement>(".answers-wrap").forEach((wrap) => {
        if (wrap === except) return;
        wrap.querySelector<HTMLElement>(".answers-pop")?.setAttribute("hidden", "");
        wrap.querySelector<HTMLElement>(".answers-backdrop")?.setAttribute("hidden", "");
        wrap.querySelector(".answers-btn")?.setAttribute("aria-expanded", "false");
      });
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(".answers-backdrop")) {
        e.preventDefault();
        e.stopPropagation();
        closeAll();
        return;
      }
      const button = target?.closest<HTMLButtonElement>(".answers-btn");
      const wrap = button?.closest(".answers-wrap");
      if (!button || !wrap) {
        // A click inside an open popover keeps it open; anywhere else closes.
        if (!target?.closest(".answers-pop")) closeAll();
        return;
      }
      const pop = wrap.querySelector<HTMLElement>(".answers-pop");
      if (!pop) return;
      const opening = pop.hasAttribute("hidden");
      closeAll(wrap);
      if (opening) {
        wrap.querySelector<HTMLElement>(".answers-backdrop")?.removeAttribute("hidden");
        pop.removeAttribute("hidden");
        pop.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        pop.setAttribute("hidden", "");
      }
      button.setAttribute("aria-expanded", String(opening));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const open = stage.querySelector<HTMLElement>(".answers-pop:not([hidden])");
      if (!open) return;
      const wrap = open.closest(".answers-wrap");
      closeAll();
      wrap?.querySelector<HTMLElement>(".answers-btn")?.focus();
    };

    // Clicks outside the chapter (the course tree, the top bar) close it too.
    const onDocClick = (e: MouseEvent) => {
      if (!stage.contains(e.target as Node)) closeAll();
    };

    stage.addEventListener("click", onClick);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      stage.removeEventListener("click", onClick);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [stageRef]);

  return null;
}
