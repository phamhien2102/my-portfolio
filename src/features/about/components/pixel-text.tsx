"use client";

import { useEffect, useId, useRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Block size (px) at the start of the reveal. Smaller = it resolves from a finer mosaic. */
const START_BLOCK = 18;
/** Once the block would be this small, the effect is dropped and the text is drawn normally. */
const END_BLOCK = 2.4;

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

interface PixelTextProps {
  children: ReactNode;
  className?: string;
  /** The element to render (a paragraph, a list...). */
  as?: ElementType;
}

const deltaPx = (event: WheelEvent) => {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
};

/**
 * Same-document filter URL that still resolves when the page location has a hash (`#about`).
 * Path only — a query string makes WebKit treat this as a different document and drop the mosaic.
 */
const filterCss = (id: string) =>
  `url("${window.location.origin}${window.location.pathname}#${id}")`;

/**
 * Text that resolves out of a mosaic of pixels as it scrolls into view.
 *
 * It uses an SVG filter on the live text (so the words stay real, selectable and readable by
 * screen readers): the filter keeps one sample per square block and grows it to fill the block,
 * so large blocks give a sparse, chunky dissolve and small ones converge on the crisp text. The
 * block size follows the element's position in the viewport, and the filter is removed entirely
 * once it is down to single pixels. Without JS, or with reduced motion, the text is simply there.
 *
 * The block size is written to the DOM straight from a scroll listener: no React renders.
 *
 * The words never take the pointer: the cursor stays an arrow, the text cannot be selected, and
 * the only gesture is scrolling the page. The filter is not applied while the block is off
 * screen (five live morphology filters behind the hero are what used to stall phones). Wheel
 * over the mosaic is forwarded to the document on a mouse, because the filter would otherwise
 * scroll itself; touch is left to the browser so a flick keeps its momentum.
 */
export function PixelText({ children, className, as: Tag = "div" }: PixelTextProps) {
  const id = `pixel-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const elementRef = useRef<HTMLElement>(null);
  const floodRef = useRef<SVGFEFloodElement>(null);
  const sizeRef = useRef<SVGFECompositeElement>(null);
  const dilateRef = useRef<SVGFEMorphologyElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    const flood = floodRef.current;
    const size = sizeRef.current;
    const dilate = dilateRef.current;
    if (!element || !flood || !size || !dilate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Phones: coarser steps and a longer reveal so the mosaic is visible, not a one-frame hitch.
    const step = coarse ? 2 : 1;
    const windowFrac = coarse ? 0.72 : 0.42;

    let frame = 0;
    let lastBlock = -1;
    let mosaic = false;

    const over = (x: number, y: number) => {
      if (!mosaic) return false;
      const rect = element.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    const clearFilter = () => {
      element.style.filter = "";
      element.style.webkitFilter = "";
      element.style.opacity = "";
    };

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.bottom < 0 || rect.top > vh) {
        const off = rect.top > vh ? -1 : 0;
        if (lastBlock === off && !mosaic) return;
        lastBlock = off;
        mosaic = false;
        clearFilter();
        return;
      }

      // 0 while the element is still below the fold, 1 once it is well inside the screen.
      const raw = clamp((vh * 0.95 - rect.top) / (vh * windowFrac), 0, 1);
      const eased = raw * raw * (3 - 2 * raw);
      const smooth = 1 + (START_BLOCK - 1) * (1 - eased) ** 1.6;
      // 0 means "no effect"; otherwise whole pixels, at least END_BLOCK.
      const block = smooth < END_BLOCK ? 0 : Math.round(smooth / step) * step;

      if (block === lastBlock) return;
      lastBlock = block;

      if (block === 0) {
        mosaic = false;
        clearFilter();
        return;
      }
      mosaic = true;

      const half = block / 2;
      flood.setAttribute("x", String(half - 1));
      flood.setAttribute("y", String(half - 1));
      flood.setAttribute("width", "2");
      flood.setAttribute("height", "2");
      size.setAttribute("width", String(block));
      size.setAttribute("height", String(block));
      dilate.setAttribute("radius", String(half));

      const css = filterCss(id);
      element.style.filter = css;
      element.style.webkitFilter = css;
      element.style.opacity = String((0.35 + 0.65 * eased).toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || !over(event.clientX, event.clientY)) return;
      event.preventDefault();
      window.scrollBy({ top: deltaPx(event), left: event.deltaX, behavior: "instant" });
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if (!coarse) {
      window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", onWheel, { capture: true });
      clearFilter();
    };
  }, [id]);

  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        tabIndex={-1}
        className="pointer-events-none absolute top-0 left-0 h-px w-px overflow-hidden"
      >
        <filter
          id={id}
          x="-8%"
          y="-8%"
          width="116%"
          height="116%"
          colorInterpolationFilters="sRGB"
        >
          <feFlood ref={floodRef} x="8" y="8" width="2" height="2" />
          <feComposite ref={sizeRef} width="18" height="18" />
          <feTile result="blocks" />
          <feComposite in="SourceGraphic" in2="blocks" operator="in" />
          <feMorphology ref={dilateRef} operator="dilate" radius="9" />
        </filter>
      </svg>
      <Tag
        ref={elementRef}
        className={cn("pointer-events-none touch-pan-y cursor-default select-none", className)}
      >
        {children}
      </Tag>
    </>
  );
}
