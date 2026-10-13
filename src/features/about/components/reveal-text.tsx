"use client";

import { useEffect, useRef } from "react";

const DIM = 0.2;

/**
 * Text that lights up word by word as you scroll it into view.
 *
 * The words are written straight to the DOM from a scroll listener (one `requestAnimationFrame`
 * per scroll burst), so scrolling never triggers a React render. Without JS, or with reduced
 * motion, every word stays fully lit.
 */
export function RevealText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const spans = Array.from(element.querySelectorAll<HTMLElement>("[data-word]"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the paragraph's top reaches 88% of the viewport, 1 when its bottom is at 55%.
      const progress = Math.min(1, Math.max(0, (vh * 0.88 - rect.top) / (rect.height + vh * 0.33)));
      const count = spans.length;
      spans.forEach((span, i) => {
        const t = Math.min(1, Math.max(0, progress * (count + 4) - i));
        span.style.opacity = String(DIM + (1 - DIM) * t);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} data-word="" className="transition-opacity duration-200">
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
