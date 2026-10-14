"use client";

import { useEffect, useRef } from "react";

/** The bar fades in once the page has moved past the very top. */
const SHOW_AFTER = 12;

/**
 * Frosted background for the fixed header, shown only after scrolling.
 *
 * It sits behind the hero canvas, so the word can still dock into the logo spot on top of the
 * bar. Height follows the header, which grows with its padding. A data attribute drives the fade
 * so scrolling never re-renders.
 */
export function HeaderBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    const header = document.querySelector<HTMLElement>("header.fixed");
    if (!bar || !header) return;

    const syncHeight = () => {
      bar.style.height = `${header.getBoundingClientRect().height}px`;
    };
    const syncScroll = () => {
      bar.dataset.scrolled = String(window.scrollY > SHOW_AFTER);
    };

    syncHeight();
    syncScroll(); // the page may load already scrolled
    const resize = new ResizeObserver(syncHeight);
    resize.observe(header);
    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncHeight);
    return () => {
      resize.disconnect();
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-scrolled="false"
      className="pointer-events-none fixed inset-x-0 top-0 z-10 border-b border-white/15 bg-[#16161f]/95 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-opacity duration-300 data-[scrolled=true]:opacity-100 motion-reduce:transition-none print:hidden"
    />
  );
}
