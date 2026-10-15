"use client";

import { useEffect, useRef, type MouseEvent } from "react";

/** Same gate as the Continue label: phones and other coarse pointers, not a mouse. */
const LOCK_QUERY = "(pointer: coarse)";
/** A bit slower than the browser's own smooth scroll. */
const GLIDE_MS = 1100;

/**
 * On a phone the hero does not scroll. The only way down is this control, which glides to About.
 */
export function HeroContinue() {
  const gliding = useRef(false);

  useEffect(() => {
    const query = window.matchMedia(LOCK_QUERY);

    const atHero = () => {
      const hero = document.getElementById("top");
      if (!hero) return false;
      const rect = hero.getBoundingClientRect();
      return rect.top > -12 && rect.bottom > window.innerHeight * 0.9;
    };

    const locked = () => query.matches && (gliding.current || atHero());

    const sync = () => {
      document.documentElement.toggleAttribute("data-hero-lock", locked());
    };

    const blockIfLocked = (event: Event) => {
      if (!locked()) return;
      if (event.target instanceof Element && event.target.closest("dialog, [data-hero-continue]")) {
        return;
      }
      event.preventDefault();
    };

    sync();
    window.addEventListener("touchmove", blockIfLocked, { passive: false });
    window.addEventListener("wheel", blockIfLocked, { passive: false });
    window.addEventListener("scroll", sync, { passive: true });
    query.addEventListener("change", sync);

    return () => {
      document.documentElement.removeAttribute("data-hero-lock");
      window.removeEventListener("touchmove", blockIfLocked);
      window.removeEventListener("wheel", blockIfLocked);
      window.removeEventListener("scroll", sync);
      query.removeEventListener("change", sync);
    };
  }, []);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia(LOCK_QUERY).matches) return;
    event.preventDefault();
    const about = document.getElementById("about");
    if (!about) return;

    const start = window.scrollY;
    const end = about.getBoundingClientRect().top + window.scrollY;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, end);
      return;
    }

    gliding.current = true;
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    html.setAttribute("data-hero-lock", "");
    const from = performance.now();
    const ease = (t: number) => 1 - (1 - t) ** 3;

    const step = (now: number) => {
      const t = Math.min(1, (now - from) / GLIDE_MS);
      window.scrollTo(0, start + (end - start) * ease(t));
      if (t < 1) {
        requestAnimationFrame(step);
        return;
      }
      gliding.current = false;
      html.style.scrollBehavior = previous;
      html.toggleAttribute("data-hero-lock", false);
    };
    requestAnimationFrame(step);
  };

  return (
    <a
      href="#about"
      data-hero-continue
      onClick={onClick}
      className="pointer-events-auto hidden items-center gap-1.5 pointer-coarse:inline-flex focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-safe:animate-next-hint"
    >
      Continue
      <span aria-hidden="true">&darr;</span>
    </a>
  );
}
