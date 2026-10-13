"use client";

import { useEffect, useRef } from "react";

/** Show the button once the user has scrolled past this fraction of the viewport height. */
const SHOW_AFTER_VIEWPORTS = 0.6;

/**
 * Floating "back to top" button.
 *
 * Visibility is toggled through a data attribute and the `inert` property instead of React
 * state, so scrolling never triggers a re-render. While hidden the button is `inert`, which
 * removes it from the tab order and the accessibility tree. The scroll itself is a plain
 * `#top` anchor, so it is smooth by default and instant under `prefers-reduced-motion`
 * (see globals.css).
 */
export function BackToTop() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const visible = window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORTS;
      el.dataset.visible = String(visible);
      el.inert = !visible;
    };

    update(); // the page may load already scrolled (scroll restoration, #hash links)
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <a
      ref={ref}
      href="#top"
      aria-label="Back to top"
      data-visible="false"
      inert
      className="group fixed right-6 bottom-6 z-30 flex size-12 translate-y-4 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur transition-[opacity,transform,background-color,color] duration-300 hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 motion-reduce:transition-none sm:right-10 sm:bottom-10 print:hidden"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </a>
  );
}
