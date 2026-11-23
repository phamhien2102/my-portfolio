"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { createChecklist } from "@/lib/checklist";
import { cn } from "@/lib/cn";

import { MODULES } from "../data";
import { useTheme } from "../lib/theme";
import type { Lesson, Module } from "../lib/types";
import { CourseTree } from "./course-tree";
import { BookIcon, Cheat, Frame, Gear, Logo, Menu, Moon, SearchIcon, Sun } from "./icons";
import { LessonView } from "./lesson-view";
import { SearchDialog } from "./search-dialog";

const useDone = createChecklist("design-system-done");

type FlatLesson = Lesson & { module: Module };

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

const readHash = () => window.location.hash;
const serverHash = () => "";

/**
 * The whole app. The URL hash is the router: `#caching` opens a lesson and `#caching/4` opens
 * it at step 4. It is read with useSyncExternalStore, so the server render and the first client
 * render agree and a lesson can be linked to.
 */
export function DesignSystemApp({ fontClassName }: { fontClassName: string }) {
  const flat = useMemo<FlatLesson[]>(
    () => MODULES.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module }))),
    [],
  );

  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const [id, stepText] = decodeURIComponent(hash.slice(1)).split("/");
  const active = flat.find((l) => l.id === id) ?? flat[0];
  const index = flat.indexOf(active);
  const initialStep = Math.max((Number.parseInt(stepText ?? "", 10) || 1) - 1, 0);

  const done = useDone();
  const { theme, toggle } = useTheme();
  const [drawer, setDrawer] = useState(false);
  const [searching, setSearching] = useState(false);

  // Ctrl/Cmd+K, or "/" outside a field, opens search.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const inField = (event.target as HTMLElement | null)?.closest("input, textarea, select");
      if (
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") ||
        (event.key === "/" && !inField)
      ) {
        event.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className={cn("ds-app", fontClassName, drawer && "is-drawer")}
      data-theme={theme}
      // The site's own dark shell and this page's light theme are switched by this attribute.
      data-page-theme={theme === "light" ? "light" : undefined}
    >
      <header className="ds-topbar">
        <button
          type="button"
          className="ds-menu-btn"
          aria-label="Course menu"
          aria-expanded={drawer}
          aria-controls="ds-sidebar"
          onClick={() => setDrawer((d) => !d)}
        >
          <Menu />
        </button>
        <a className="ds-brand" href="#">
          <Logo />
          <span className="ds-brand-name">
            Raymond&rsquo;s <span>System Design</span>
          </span>
        </a>

        <nav className="ds-nav" aria-label="Sections">
          <a className="ds-nav-item is-active" href="#" aria-current="page">
            <BookIcon />
            Learn
          </a>
          {[
            { label: "Practice", Icon: Gear },
            { label: "Design Lab", Icon: Frame },
            { label: "Cheatsheets", Icon: Cheat },
          ].map(({ label, Icon }) => (
            <span
              key={label}
              className="ds-nav-item is-soon"
              aria-disabled="true"
              title="Coming soon"
            >
              <Icon />
              {label}
              <em>soon</em>
            </span>
          ))}
        </nav>

        <button type="button" className="ds-search" onClick={() => setSearching(true)}>
          <SearchIcon />
          <span className="ds-search-hint">Search lessons &amp; concepts…</span>
          <kbd>⌘K</kbd>
        </button>

        <button
          type="button"
          className="ds-theme-btn"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggle}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
        <Link className="ds-home" href="/">
          ← Raymond Pham
        </Link>
      </header>

      <div className="ds-body">
        <CourseTree
          activeId={active.id}
          isDone={done.isDone}
          countOf={done.countOf}
          total={flat.length}
          onNavigate={() => setDrawer(false)}
        />
        <button
          type="button"
          className="ds-drawer-backdrop"
          aria-label="Close menu"
          onClick={() => setDrawer(false)}
        />

        <LessonView
          key={hash || "#"}
          lesson={active}
          module={active.module}
          initialStep={initialStep}
          previous={flat[index - 1]}
          next={flat[index + 1]}
          onFinish={() => {
            if (!done.isDone(active.id)) done.toggle(active.id);
          }}
        />
      </div>

      {searching && <SearchDialog onClose={() => setSearching(false)} />}
    </div>
  );
}
