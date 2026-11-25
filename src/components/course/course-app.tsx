"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { createChecklist } from "@/lib/checklist";
import { cn } from "@/lib/cn";

import { CourseTree } from "./course-tree";
import {
  COURSE_UI,
  localeStore,
  localizeModules,
  type CourseI18n,
  type Locale,
  type Translations,
} from "./i18n";
import { Logo, LogoTile, Menu, Moon, SearchIcon, Sun } from "./icons";
import { LanguageMenu } from "./language-menu";
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

/** A value that may depend on the language: given as is, or as a function of the language. */
type PerLocale<T> = T | ((locale: Locale) => T);
const resolve = <T,>(value: PerLocale<T>, locale: Locale): T =>
  typeof value === "function" ? (value as (locale: Locale) => T)(locale) : value;

interface Props<L extends CourseLesson> {
  modules: readonly CourseModule<L>[];
  engine: PerLocale<SceneEngine<L>>;
  fontClassName: string;
  /** Prefix of the localStorage keys for progress and theme, e.g. "design-system". */
  storageKey: string;
  /** The wordmark next to the logo. */
  brand: React.ReactNode;
  nav: PerLocale<readonly NavItem[]>;
  searchPlaceholder: PerLocale<string>;
  i18n?: CourseI18n;
  /** "classic" (Design System: green, mono) or "algo" (Algo Lab: coral, Inter, extra rail cards). */
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
  modules: sourceModules,
  engine: engineSource,
  fontClassName,
  storageKey,
  brand,
  nav: navSource,
  searchPlaceholder: placeholderSource,
  i18n,
  variant = "classic",
}: Props<L>) {
  // The language, and the translations of it once they have been fetched. English needs neither.
  const { locale, setLocale } = localeStore(storageKey).useLocale();
  const [loaded, setLoaded] = useState<Partial<Record<Locale, Translations>>>({});
  useEffect(() => {
    if (locale === "en" || !i18n || loaded[locale]) return;
    let current = true;
    i18n
      .load(locale)
      .then((translations) => {
        if (current) setLoaded((all) => ({ ...all, [locale]: translations }));
      })
      // Offline or a failed chunk: the course simply stays in English.
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [locale, i18n, loaded]);

  const ui = COURSE_UI[i18n ? locale : "en"];
  const translations = i18n && locale !== "en" ? loaded[locale] : undefined;
  const modules = useMemo(
    () => localizeModules(sourceModules, translations, i18n?.mapScene),
    [sourceModules, translations, i18n?.mapScene],
  );
  const engine = useMemo(() => resolve(engineSource, locale), [engineSource, locale]);
  const nav = resolve(navSource, locale);
  const searchPlaceholder = resolve(placeholderSource, locale);

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
      lang={i18n ? locale : undefined}
      data-theme={theme}
      data-variant={variant}
      // The site's own dark shell and this page's light theme are switched by this attribute.
      data-page-theme={theme === "light" ? "light" : undefined}
    >
      <header className="ds-topbar">
        <button
          type="button"
          className="ds-menu-btn"
          aria-label={ui.courseMenu}
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

        <nav className="ds-nav" aria-label={ui.sections}>
          {nav.map(({ label, Icon, soon }, i) =>
            soon ? (
              <span
                key={label}
                className="ds-nav-item is-soon"
                aria-disabled="true"
                title={ui.comingSoon}
              >
                <Icon />
                {label}
                <em>{ui.soon}</em>
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

        {i18n && <LanguageMenu locale={locale} onChange={setLocale} label={ui.language} />}

        <button
          type="button"
          className="ds-theme-btn"
          aria-label={theme === "dark" ? ui.switchToLight : ui.switchToDark}
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
          ui={ui}
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
          aria-label={ui.closeMenu}
          onClick={() => setDrawer(false)}
        />

        <LessonView
          key={hash || "#"}
          ui={ui}
          untranslated={!!translations && !translations.lessons[active.id]?.steps}
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
          ui={ui}
          modules={modules}
          placeholder={searchPlaceholder}
          onClose={() => setSearching(false)}
        />
      )}
    </div>
  );
}
