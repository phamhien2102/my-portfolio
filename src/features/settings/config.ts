/** One choice in a settings group. */
export interface SettingOption {
  id: string;
  label: string;
  description: string;
  /** Needs motion allowed (and WebGL for some); otherwise a plain fallback is shown. */
  immersive: boolean;
  /** CSS variable of the typeface to preview the option in (set by next/font in the layout). */
  fontVar?: string;
}

export const EXPERIENCE_EFFECTS = [
  {
    id: "flythrough",
    label: "Fly-through",
    description: "Glide along a winding glowing path, one gate per role.",
    immersive: true,
  },
  {
    id: "helix",
    label: "Helix",
    description: "Spiral up a double helix, passing through each role.",
    immersive: true,
  },
  {
    id: "tunnel",
    label: "Warp tunnel",
    description: "Streak down a hyperspace tunnel of rings and light trails.",
    immersive: true,
  },
  {
    id: "runner",
    label: "Runner",
    description: "A little astronaut runs down a neon road and stops at each role.",
    immersive: true,
  },
  {
    id: "stack",
    label: "Card stack",
    description: "Role cards pile up on top of each other as you scroll.",
    immersive: false,
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "A calm vertical timeline. No 3D, lightest on the device.",
    immersive: false,
  },
] as const satisfies readonly SettingOption[];

export type ExperienceEffect = (typeof EXPERIENCE_EFFECTS)[number]["id"];

export const SKILLS_VIEWS = [
  {
    id: "solar",
    label: "Solar system",
    description: "Each group orbits as its own ring; planet size shows proficiency.",
    immersive: true,
  },
  {
    id: "path",
    label: "Fly-through path",
    description: "Scroll to fly down a glowing path, one gate per skill group.",
    immersive: true,
  },
  {
    id: "constellation",
    label: "Constellation",
    description: "A night sky: the closer to the centre, the stronger the skill.",
    immersive: false,
  },
] as const satisfies readonly SettingOption[];

export type SkillsView = (typeof SKILLS_VIEWS)[number]["id"];

export const PROJECTS_VIEWS = [
  {
    id: "cards",
    label: "Tilt cards",
    description: "A grid of cards that lean toward your pointer.",
    immersive: false,
  },
  {
    id: "gallery",
    label: "3D gallery",
    description: "A curved wall of floating screens over a neon floor: drag or use the arrows. It loops.",
    immersive: true,
  },
  {
    id: "scroll",
    label: "Scroll stack",
    description: "Scroll down and project cards pile up on top of each other.",
    immersive: true,
  },
] as const satisfies readonly SettingOption[];

export type ProjectsView = (typeof PROJECTS_VIEWS)[number]["id"];

export const HERO_FONTS = [
  {
    id: "drip",
    label: "Drip",
    description: "Wet paint, still running down the letters.",
    immersive: false,
    fontVar: "--font-hero-drip",
  },
  {
    id: "classic",
    label: "Classic",
    description: "Heavy, plain and bold.",
    immersive: false,
  },
  {
    id: "neon",
    label: "Neon",
    description: "Striped like a humming neon sign.",
    immersive: false,
    fontVar: "--font-hero-neon",
  },
  {
    id: "block",
    label: "Block",
    description: "Chunky capitals with a solid 3D shadow.",
    immersive: false,
    fontVar: "--font-hero-block",
  },
  {
    id: "droplets",
    label: "Droplets",
    description:
      "Letters made of water drops. Push them around, splash them, watch them flow back.",
    immersive: false,
  },
] as const satisfies readonly SettingOption[];

export type HeroFont = (typeof HERO_FONTS)[number]["id"];

export const INK_MODES = [
  {
    id: "touch",
    label: "By touch",
    description:
      "A new ink colour is picked the first time you touch, and again on each new stroke.",
    immersive: false,
  },
  {
    id: "time",
    label: "By time",
    description: "A new ink colour is picked about every five seconds.",
    immersive: false,
  },
] as const satisfies readonly SettingOption[];

export type InkMode = (typeof INK_MODES)[number]["id"];

export interface Settings {
  experienceEffect: ExperienceEffect;
  skillsView: SkillsView;
  projectsView: ProjectsView;
  heroFont: HeroFont;
  inkMode: InkMode;
}

export const DEFAULT_SETTINGS: Settings = {
  experienceEffect: "flythrough",
  skillsView: "path",
  projectsView: "cards",
  heroFont: "drip",
  inkMode: "touch",
};

export function isExperienceEffect(value: unknown): value is ExperienceEffect {
  return EXPERIENCE_EFFECTS.some((option) => option.id === value);
}

export function isSkillsView(value: unknown): value is SkillsView {
  return SKILLS_VIEWS.some((option) => option.id === value);
}

export function isProjectsView(value: unknown): value is ProjectsView {
  return PROJECTS_VIEWS.some((option) => option.id === value);
}

export function isHeroFont(value: unknown): value is HeroFont {
  return HERO_FONTS.some((option) => option.id === value);
}

export function isInkMode(value: unknown): value is InkMode {
  return INK_MODES.some((option) => option.id === value);
}
