/** One way of presenting the Experience section. */
export interface ExperienceEffectOption {
  id: string;
  label: string;
  description: string;
  /** Needs WebGL, a wide screen and motion allowed; otherwise the plain timeline is shown. */
  immersive: boolean;
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
] as const satisfies readonly ExperienceEffectOption[];

export type ExperienceEffect = (typeof EXPERIENCE_EFFECTS)[number]["id"];

export interface Settings {
  experienceEffect: ExperienceEffect;
}

export const DEFAULT_SETTINGS: Settings = {
  experienceEffect: "flythrough",
};

export function isExperienceEffect(value: unknown): value is ExperienceEffect {
  return EXPERIENCE_EFFECTS.some((option) => option.id === value);
}
