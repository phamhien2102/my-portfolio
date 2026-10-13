"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
}

/**
 * Fades and lifts its children in when scrolled into view.
 *
 * Progressive enhancement: content is visible by default (SSR, no JS, reduced motion).
 * After hydration, only elements that start below the fold are hidden and then revealed,
 * so nothing flashes. State lives in a data attribute (not React state) to avoid re-renders.
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen

    el.dataset.fade = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.fade = "shown";
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out",
        "data-[fade=hidden]:translate-y-8 data-[fade=hidden]:opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
