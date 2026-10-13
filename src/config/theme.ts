/** Design tokens shared by the WebGL hero and the DOM sections. */
export const THEME = {
  /** Page background. Keep in sync with `themeColor` in the root layout. */
  background: "#09090e",
  /** Ghost colour of the hero word before the blob reveals it. */
  ghost: "#1b1b24",
  /** Neon ink colours; the hero cycles through them, sections use them as hover accents. */
  palette: ["#e10600", "#ff7a00", "#ffc400", "#00b96b", "#1f5bff", "#7a2cff", "#ff2d95"],
} as const;

/** Pick an accent by index, wrapping around the palette. */
export function accentAt(index: number): string {
  return THEME.palette[index % THEME.palette.length];
}
