"use client";

import { useEffect } from "react";

/** Mouse and trackpad on a wide screen, for people who haven't asked for less motion. */
const PAGER_QUERY =
  "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** A section up to this many screens tall counts as one "page". Taller ones scroll freely. */
const PAGE_MAX_SCREENS = 1.15;
/** The wheel must have been quiet this long (ms) before the next flick starts a new jump. */
const QUIET_MS = 140;
/** Ignore tiny wheel deltas (a resting trackpad finger). */
const MIN_DELTA = 3;

/**
 * One gentle scroll = one section.
 *
 * While the section you are in is about a screen tall, a flick of the wheel or trackpad glides
 * straight to the next (or previous) section instead of scrolling a few lines. Sections that are
 * much taller than the screen, or that pin themselves while you scroll (Skills, Experience and
 * the project stack), keep their normal free scrolling, and the pager steps aside until you leave
 * them. After a jump it waits for the wheel (and any trackpad momentum) to go quiet, so a single
 * flick can never skip two sections.
 *
 * Renders nothing. Touch scrolling, the keyboard, the scrollbar and open dialogs are left alone.
 */
export function SectionPager() {
  useEffect(() => {
    const query = window.matchMedia(PAGER_QUERY);
    let frame = 0;
    let animating = false;
    let needQuiet = false;
    let lastWheel = 0;

    const sections = () => Array.from(document.querySelectorAll<HTMLElement>("main > section"));

    /**
     * Hand the move to the browser's own smooth scrolling: it runs off the main thread, so it
     * stays smooth even while the page is busy drawing WebGL. Then wait for it to arrive.
     */
    const glideTo = (target: number) => {
      animating = true;
      window.scrollTo({ top: target, behavior: "smooth" });

      const start = performance.now();
      let lastY = window.scrollY;
      let lastMoved = start;
      const watch = (now: number) => {
        const y = window.scrollY;
        if (y !== lastY) {
          lastY = y;
          lastMoved = now;
        }
        const arrived = Math.abs(y - target) < 1.5;
        const stalled = now - lastMoved > 250 && now - start > 200; // interrupted or clamped
        if (arrived || stalled || now - start > 2500) {
          animating = false;
          return;
        }
        frame = requestAnimationFrame(watch);
      };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(watch);
    };

    const onWheel = (event: WheelEvent) => {
      if (!query.matches || event.ctrlKey || event.defaultPrevented) return;
      if (Math.abs(event.deltaY) < MIN_DELTA || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return;
      }
      if (document.querySelector("dialog[open]")) return;

      const now = performance.now();
      const quiet = now - lastWheel;
      lastWheel = now;

      // During a glide, and until the wheel settles after one, the flick belongs to the pager.
      if (animating) {
        event.preventDefault();
        return;
      }
      if (needQuiet) {
        if (quiet < QUIET_MS) {
          event.preventDefault();
          return;
        }
        needQuiet = false;
      }

      const list = sections();
      const vh = window.innerHeight;
      const index = list.findIndex((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= vh * 0.5 && rect.bottom > vh * 0.5;
      });
      if (index < 0) return;
      const section = list[index];
      // Tall sections (and the pinned ones) scroll on their own.
      if (section.offsetHeight > vh * PAGE_MAX_SCREENS) return;

      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const down = event.deltaY > 0;
      let target: number | null = null;

      if (down) {
        if (rect.top > 8)
          target = top; // not at its top yet: arrive there first
        else if (list[index + 1]) {
          target = list[index + 1].getBoundingClientRect().top + window.scrollY;
        }
      } else if (rect.top < -8) {
        target = top; // scrolled a little into it: go back to its top
      } else if (list[index - 1]) {
        const previous = list[index - 1];
        const previousTop = previous.getBoundingClientRect().top + window.scrollY;
        // Going back into a tall section: land at its end, and carry on upwards freely.
        target =
          previous.offsetHeight > vh * PAGE_MAX_SCREENS
            ? Math.max(previousTop, previousTop + previous.offsetHeight - vh)
            : previousTop;
      }

      if (target === null || Math.abs(target - window.scrollY) < 4) return;
      event.preventDefault();
      needQuiet = true;
      glideTo(target);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return null;
}
