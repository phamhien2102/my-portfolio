"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * A card that leans towards the pointer and carries a soft light under it. It only sets CSS
 * variables (--rx, --ry and the light's --gx, --gy); the styles do the rest, and they stay off for
 * visitors who ask for less motion. Touch and pen input is ignored, so a scroll never tilts a card.
 */
export function TiltCard({
  tone,
  children,
}: {
  tone: "blue" | "teal" | "indigo";
  children: ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);

  function move(event: PointerEvent<HTMLLIElement>) {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    el.style.setProperty("--rx", `${((0.5 - y) * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * 14).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  }

  function leave() {
    const el = ref.current;
    if (!el) return;
    for (const name of ["--rx", "--ry", "--gx", "--gy"]) el.style.removeProperty(name);
  }

  return (
    <li ref={ref} className="pr-card" data-tone={tone} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </li>
  );
}
