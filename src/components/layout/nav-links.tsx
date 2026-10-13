"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { MobileMenu } from "./mobile-menu";

interface NavItem {
  label: string;
  /** In-page anchor, e.g. `#about`. The matching element's id is what gets tracked. */
  href: string;
}

/** A section counts as "current" once its top has passed this fraction of the viewport. */
const TRIGGER = 0.4;

/**
 * Primary navigation that highlights the section currently in view (scroll-spy).
 * Nothing is highlighted while the hero is on screen.
 */
export function NavLinks({ items }: { items: readonly NavItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = items.map((item) => item.href.slice(1));
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * TRIGGER;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      // The current section is the last one whose top is above the trigger line...
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // ...except at the very bottom, where a short final section may never reach the line.
      if (atBottom) current = ids[ids.length - 1];

      setActive((prev) => (prev === current ? prev : current));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule(); // initial state (e.g. page loaded part-way down)
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <>
      {/* Phones: a menu icon opening a full-screen list. */}
      <MobileMenu items={items} active={active} className="order-1 sm:hidden" />

      {/* Wider screens: the links inline. */}
      <nav
        aria-label="Primary"
        className="ml-auto hidden flex-wrap justify-end gap-x-5 gap-y-1 sm:flex"
      >
        {items.map((item) => {
          const isActive = active === item.href.slice(1);
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "relative transition-opacity hover:opacity-100 motion-reduce:transition-none",
                "after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 motion-reduce:after:transition-none",
                isActive ? "opacity-100 after:scale-x-100" : "opacity-70 after:scale-x-0",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </>
  );
}
