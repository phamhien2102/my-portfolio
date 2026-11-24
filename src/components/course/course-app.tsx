"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { createChecklist } from "@/lib/checklist";
import { cn } from "@/lib/cn";

import { CourseTree } from "./course-tree";
import { Logo, LogoTile, Menu, Moon, SearchIcon, Sun } from "./icons";
import { LessonView } from "./lesson-view";
import { SearchDialog } from "./search-dialog";
import { themeStore } from "./theme";
import type { CourseLesson, CourseModule, CourseVariant, SceneEngine } from "./types";

/** One progress store per course page, created once so its hook stays stable. */
const doneStores = new Map<string, ReturnType<typeof createChecklist>>();
function doneStore(key: string) {
  let store = doneStores.get(key);
  if (!store) {
    store = createChecklist(`${key}-done`);
    doneStores.set(key, store);
  }
  return store;
}

type FlatLesson<L extends CourseLesson> = L & { module: CourseModule<L> };

export interface NavItem {
  label: string;
  Icon: (props: { className?: string }) => React.ReactNode;
  /** Items that are not built yet are shown dimmed with a "soon" tag. */
  soon?: boolean;
}

interface Props<L extends CourseLesson> {
  modules: readonly CourseModule<L>[];
  engine: SceneEngine<L>;
  fontClassName: string;
  /** Prefix of the localStorage keys for progress and theme, e.g. "design-system". */
  storageKey: string;
  /** The wordmark next to the logo. */
  brand: React.ReactNode;
  nav: readonly NavItem[];
  searchPlaceholder: string;
  /** "classic" (System Design: green, mono) or "algo" (Algo Lab: coral, Inter, extra rail cards). */
  variant?: CourseVariant;
}

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
export function CourseApp<L extends CourseLesson>({
  modules,
  engine,
  fontClassName,
  storageKey,
  brand,
  nav,
  searchPlaceholder,
  variant = "classic",
}: Props<L>) {
  const flat = useMemo<FlatLesson<L>[]>(
    () => modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module }))),
    [modules],
  );

  const hash = useSyncExternalStore(subscribeHash, readHash, serverHash);
  const [id, stepText] = decodeURIComponent(hash.slice(1)).split("/");
  const active = flat.find((l) => l.id === id) ?? flat[0];
  const index = flat.indexOf(active);
  const initialStep = Math.max((Number.parseInt(stepText ?? "", 10) || 1) - 1, 0);

  const done = doneStore(storageKey)();
  const { theme, toggle } = themeStore(storageKey).useTheme();
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
      data-variant={variant}
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
          {variant === "algo" ? <LogoTile /> : <Logo />}
          <span className="ds-brand-name">{brand}</span>
        </a>

        <nav className="ds-nav" aria-label="Sections">
          {nav.map(({ label, Icon, soon }, i) =>
            soon ? (
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
            ) : (
              <a
                key={label}
                className={cn("ds-nav-item", i === 0 && "is-active")}
                href="#"
                aria-current={i === 0 ? "page" : undefined}
              >
                <Icon />
                {label}
              </a>
            ),
          )}
        </nav>

        <button type="button" className="ds-search" onClick={() => setSearching(true)}>
          <SearchIcon />
          <span className="ds-search-hint">{searchPlaceholder}</span>
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
          variant={variant}
          modules={modules}
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
          engine={engine}
          variant={variant}
          onFinish={() => {
            if (!done.isDone(active.id)) done.toggle(active.id);
          }}
        />
      </div>

      {searching && (
        <SearchDialog
          modules={modules}
          placeholder={searchPlaceholder}
          onClose={() => setSearching(false)}
        />
      )}
    </div>
  );
}
