import type { AvatarShape } from "../types";

/** Corner radii (top-left, top-right, bottom-right, bottom-left) as fractions of the width. */
export type Radii = [number, number, number, number];

export const SHAPE_RADII: Record<AvatarShape, Radii> = {
  circle: [0.5, 0.5, 0.5, 0.5],
  square: [0, 0, 0, 0],
  rounded: [0.22, 0.22, 0.22, 0.22],
  arch: [0.5, 0.5, 0.08, 0.08],
  leaf: [0.5, 0.1, 0.5, 0.1],
};

export type Seg =
  | ["M", number, number]
  | ["L", number, number]
  | ["C", number, number, number, number, number, number];

const K = 0.5523;

/** A rounded rectangle as path segments (y down), used by both the SVG preview and the PDF. */
export function shapeSegs(shape: AvatarShape, x: number, y: number, w: number, h: number): Seg[] {
  const [tl, tr, br, bl] = SHAPE_RADII[shape].map((r) => r * w);
  const segs: Seg[] = [["M", x + tl, y]];
  segs.push(["L", x + w - tr, y]);
  if (tr) segs.push(["C", x + w - tr + tr * K, y, x + w, y + tr - tr * K, x + w, y + tr]);
  segs.push(["L", x + w, y + h - br]);
  if (br)
    segs.push(["C", x + w, y + h - br + br * K, x + w - br + br * K, y + h, x + w - br, y + h]);
  segs.push(["L", x + bl, y + h]);
  if (bl) segs.push(["C", x + bl - bl * K, y + h, x, y + h - bl + bl * K, x, y + h - bl]);
  segs.push(["L", x, y + tl]);
  if (tl) segs.push(["C", x, y + tl - tl * K, x + tl - tl * K, y, x + tl, y]);
  return segs;
}

export function segsToSvg(segs: Seg[]): string {
  return (
    segs
      .map((s) => (s[0] === "C" ? `C${s.slice(1).join(" ")}` : `${s[0]}${s[1]} ${s[2]}`))
      .join(" ") + " Z"
  );
}

export function cssRadius(shape: AvatarShape): string {
  return SHAPE_RADII[shape].map((r) => `${r * 100}%`).join(" ");
}
