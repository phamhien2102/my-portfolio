"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The dim layer behind a dialog, and the dialog's frame. While it is open:
 *  - the page underneath cannot be scrolled (the body is pinned, then put back where it was);
 *  - on a phone the layer follows the visible part of the screen. With the keyboard up, the
 *    layout viewport is still the full height but only the part above the keyboard can be seen, so
 *    a dialog centred in the layout viewport ends up behind the keyboard. The visual viewport
 *    tells us the real size, and `--vv-h` / `--vv-top` hand it to the CSS;
 *  - a click or tap on the dim layer does nothing unless `closeOnBackdrop` is set, so a stray tap
 *    never throws away a half-written note.
 */
export function ModalBackdrop({
  children,
  onClose,
  closeOnBackdrop = false,
}: {
  children: ReactNode;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { body, documentElement: root } = document;
    const scrollY = window.scrollY;
    const saved = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: root.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    root.style.overflow = "hidden";

    const el = ref.current;
    const vv = window.visualViewport;
    const fit = () => {
      if (!el || !vv) return;
      el.style.setProperty("--vv-h", `${vv.height}px`);
      el.style.setProperty("--vv-top", `${vv.offsetTop}px`);
    };
    fit();
    vv?.addEventListener("resize", fit);
    vv?.addEventListener("scroll", fit);

    return () => {
      vv?.removeEventListener("resize", fit);
      vv?.removeEventListener("scroll", fit);
      body.style.position = saved.position;
      body.style.top = saved.top;
      body.style.width = saved.width;
      root.style.overflow = saved.overflow;
      window.scrollTo({ top: scrollY });
    };
  }, []);

  return (
    <div
      ref={ref}
      className="fc-backdrop"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose?.();
      }}
    >
      {children}
    </div>
  );
}
