/** Design tokens shared by the WebGL hero and the DOM sections. */
export const THEME = {
  /** Page background. Keep in sync with `themeColor` in the root layout. */
  background: "#09090e",
  /** Ghost colour of the hero word before the blob reveals it. */
  ghost: "#1b1b24",
  /** Neon ink colours; the hero picks from them, sections use them as hover accents. */
  palette: [
    "#e10600",
    "#ff3d2e",
    "#ff7a00",
    "#ffb020",
    "#ffc400",
    "#c6f000",
    "#00b96b",
    "#00d4a8",
    "#00c4ff",
    "#1f5bff",
    "#7a2cff",
    "#c44dff",
    "#ff2d95",
    "#ff4d6d",
  ],
} as const;

/** Pick an accent by index, wrapping around the palette. */
export function accentAt(index: number): string {
  return THEME.palette[index % THEME.palette.length];
}
