"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

import {
  DEFAULT_SETTINGS,
  EXPERIENCE_EFFECTS,
  HERO_FONTS,
  INK_MODES,
  PROJECTS_VIEWS,
  SKILLS_VIEWS,
  isExperienceEffect,
  isHeroFont,
  isInkMode,
  isProjectsView,
  isSkillsView,
  type SettingOption,
} from "../config";
import { updateSettings, useSettings } from "../lib/settings-store";
import { OptionGroup } from "./option-group";

interface Tab {
  id: "hero" | "projects" | "skills" | "experience";
  label: string;
  /** One line under the tab bar saying what the tab changes. */
  intro: string;
  legend: string;
  options: readonly SettingOption[];
  note: string;
}

/** In the order the sections appear on the page. */
const TABS: readonly Tab[] = [
  {
    id: "hero",
    label: "Hero",
    intro: "How the big word at the top looks.",
    legend: "Hero style",
    options: HERO_FONTS,
    note: "The first time you pick a typeface it is downloaded, so it can take a moment to appear. Droplets replaces the chrome blob with letters you can splash.",
  },
  {
    id: "projects",
    label: "Projects",
    intro: "How the project list is shown.",
    legend: "Projects view",
    options: PROJECTS_VIEWS,
    note: "The gallery needs WebGL. When your device asks for reduced motion, or WebGL is missing, the card grid is shown.",
  },
  {
    id: "skills",
    label: "Skills",
    intro: "How your toolbox is shown.",
    legend: "Skills view",
    options: SKILLS_VIEWS,
    note: "3D views need WebGL. When your device asks for reduced motion, or WebGL is missing, a simple list is shown.",
  },
  {
    id: "experience",
    label: "Experience",
    intro: "How your work history is shown.",
    legend: "Experience effect",
    options: EXPERIENCE_EFFECTS,
    note: "3D effects need WebGL. When your device asks for reduced motion, or WebGL is missing, the timeline is shown instead.",
  },
];

/** How far (px) a panel slides in from the side. */
const SLIDE = 28;

/**
 * The settings, split into tabs (one per section of the page).
 *
 * A pill slides under the tab labels; the panel slides in from the side the tab lies on and its
 * options rise in one after another. On a narrow screen the labels keep their size and the bar
 * scrolls sideways. The box keeps a fixed height, so switching tabs never resizes it. Arrow keys,
 * Home and End move between tabs, as for any tab list.
 */
export function SettingsTabs() {
  const settings = useSettings();
  const baseId = useId();
  const [active, setActive] = useState(0);
  /** Which side the current panel entered from: positive = from the right. */
  const [from, setFrom] = useState(SLIDE);

  const tablistRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  /** Sliding pill, measured from the active tab so labels can be their natural width. */
  const [pill, setPill] = useState({ x: 0, w: 0 });

  const select = (index: number, focus = false) => {
    const next = (index + TABS.length) % TABS.length;
    if (next !== active) {
      setFrom(next > active ? SLIDE : -SLIDE);
      setActive(next);
    }
    if (focus) tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: TABS.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    select(keys[event.key], true);
  };

  const values = {
    hero: settings.heroFont,
    projects: settings.projectsView,
    skills: settings.skillsView,
    experience: settings.experienceEffect,
  } as const;

  const defaults = {
    hero: DEFAULT_SETTINGS.heroFont,
    projects: DEFAULT_SETTINGS.projectsView,
    skills: DEFAULT_SETTINGS.skillsView,
    experience: DEFAULT_SETTINGS.experienceEffect,
  } as const;

  const choose = (tab: Tab["id"], id: string) => {
    if (tab === "hero" && isHeroFont(id)) updateSettings({ heroFont: id });
    if (tab === "projects" && isProjectsView(id)) updateSettings({ projectsView: id });
    if (tab === "skills" && isSkillsView(id)) updateSettings({ skillsView: id });
    if (tab === "experience" && isExperienceEffect(id)) updateSettings({ experienceEffect: id });
  };

  const chooseInk = (id: string) => {
    if (isInkMode(id)) updateSettings({ inkMode: id });
  };

  const tab = TABS[active];

  const syncPill = () => {
    const current = tabRefs.current[active];
    if (!current) return;
    setPill({ x: current.offsetLeft, w: current.offsetWidth });
  };

  const scrollActiveIntoView = (smooth: boolean) => {
    const list = tablistRef.current;
    const current = tabRefs.current[active];
    if (!list || !current) return;
    const left = current.offsetLeft - (list.clientWidth - current.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "instant" });
  };

  useLayoutEffect(syncPill, [active]);

  useEffect(() => {
    scrollActiveIntoView(true);
  }, [active]);

  useEffect(() => {
    const list = tablistRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      syncPill();
      scrollActiveIntoView(false);
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  return (
    <div className="mt-6 flex min-h-0 min-w-0 grow flex-col">
      {/* Tab bar with a sliding pill. Narrow screens scroll sideways so labels stay readable. */}
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Settings sections"
        onKeyDown={onKeyDown}
        style={{ "--tabs": TABS.length } as CSSProperties}
        className="shrink-0 overflow-x-auto overscroll-x-contain rounded-full border border-white/10 bg-white/[0.04] p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:overflow-hidden"
      >
        <div className="relative flex w-max sm:grid sm:w-full sm:grid-cols-[repeat(var(--tabs),minmax(0,1fr))]">
          <span
            aria-hidden="true"
            style={{ width: pill.w, transform: `translateX(${pill.x}px)` }}
            className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-white shadow-lg shadow-black/40 transition-[width,transform] duration-500 ease-[cubic-bezier(0.34,1.4,0.5,1)] motion-reduce:transition-none"
          />
          {TABS.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={i === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              className="relative z-10 shrink-0 rounded-full px-3 py-2 text-sm font-bold whitespace-nowrap text-zinc-400 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-selected:text-black motion-reduce:transition-none sm:min-w-0"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Options fill the remaining height and scroll; the dialog itself never resizes. */}
      <div className="mt-3 min-h-0 grow overflow-x-hidden overflow-y-auto overscroll-contain p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          style={{ "--from": `${from}px` } as CSSProperties}
          className="transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none starting:translate-x-(--from) starting:opacity-0"
        >
          <p className="text-sm text-zinc-400">{tab.intro}</p>
          <OptionGroup
            legend={tab.legend}
            options={tab.options}
            value={values[tab.id]}
            defaultId={defaults[tab.id]}
            onChange={(id) => choose(tab.id, id)}
            note={tab.note}
          />
          {tab.id === "hero" && (
            <OptionGroup
              legend="Ink colour"
              options={INK_MODES}
              value={settings.inkMode}
              defaultId={DEFAULT_SETTINGS.inkMode}
              onChange={chooseInk}
              note="The chrome blob and Droplets share this. By touch waits for you; by time changes colour about every five seconds."
            />
          )}
        </div>
      </div>
    </div>
  );
}
