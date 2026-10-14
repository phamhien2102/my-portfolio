"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

import {
  EXPERIENCE_EFFECTS,
  HERO_FONTS,
  PROJECTS_VIEWS,
  SKILLS_VIEWS,
  isExperienceEffect,
  isHeroFont,
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
    note: "The gallery and the scroll stack need a wide screen (the gallery also WebGL). Otherwise the card grid is shown.",
  },
  {
    id: "skills",
    label: "Skills",
    intro: "How your toolbox is shown.",
    legend: "Skills view",
    options: SKILLS_VIEWS,
    note: "The 3D views need a wide screen and WebGL. Otherwise a simple list is shown.",
  },
  {
    id: "experience",
    label: "Experience",
    intro: "How your work history is shown.",
    legend: "Experience effect",
    options: EXPERIENCE_EFFECTS,
    note: "3D effects need a wide screen and WebGL. On phones, or when your device asks for reduced motion, the timeline is shown instead.",
  },
];

/** How far (px) a panel slides in from the side. */
const SLIDE = 28;

/**
 * The settings, split into tabs (one per section of the page).
 *
 * A pill slides under the tab labels; the panel slides in from the side the tab lies on and its
 * options rise in one after another; the box eases to the height of the new panel. Arrow keys,
 * Home and End move between tabs, as for any tab list.
 */
export function SettingsTabs() {
  const settings = useSettings();
  const baseId = useId();
  const [active, setActive] = useState(0);
  /** Which side the current panel entered from: positive = from the right. */
  const [from, setFrom] = useState(SLIDE);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  // Ease the box to the height of whatever panel is showing.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const observer = new ResizeObserver(() => setHeight(inner.offsetHeight));
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

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

  const choose = (tab: Tab["id"], id: string) => {
    if (tab === "hero" && isHeroFont(id)) updateSettings({ heroFont: id });
    if (tab === "projects" && isProjectsView(id)) updateSettings({ projectsView: id });
    if (tab === "skills" && isSkillsView(id)) updateSettings({ skillsView: id });
    if (tab === "experience" && isExperienceEffect(id)) updateSettings({ experienceEffect: id });
  };

  const tab = TABS[active];

  return (
    <div className="mt-6 flex min-h-0 grow flex-col">
      {/* Tab bar with a sliding pill. It stays put while the options below scroll. */}
      <div
        role="tablist"
        aria-label="Settings sections"
        onKeyDown={onKeyDown}
        style={{ "--tabs": TABS.length, "--active": active } as CSSProperties}
        className="relative grid shrink-0 grid-cols-[repeat(var(--tabs),minmax(0,1fr))] rounded-full border border-white/10 bg-white/[0.04] p-1"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/var(--tabs))] translate-x-[calc(var(--active)*100%)] rounded-full bg-white shadow-lg shadow-black/40 transition-transform duration-500 ease-[cubic-bezier(0.34,1.4,0.5,1)] motion-reduce:transition-none"
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
            className="relative z-10 rounded-full px-3 py-2 text-sm font-bold text-zinc-400 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-selected:text-black motion-reduce:transition-none"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Options scroll once they outgrow the dialog. The inner wrapper eases its height
          between tabs, so the dialog never jumps while everything still fits. */}
      <div className="mt-3 min-h-0 grow overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div
          style={height === undefined ? undefined : { height }}
          className="overflow-hidden p-1 transition-[height] duration-400 ease-out motion-reduce:transition-none"
        >
          <div ref={innerRef}>
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
                name={`${tab.id}-setting`}
                options={tab.options}
                value={values[tab.id]}
                onChange={(id) => choose(tab.id, id)}
                note={tab.note}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
