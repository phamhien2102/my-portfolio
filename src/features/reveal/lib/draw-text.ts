/** A typeface for the word: a CSS `font-family` list and one weight the face really has. */
export interface WordFont {
  family: string;
  weight: number;
}

interface DrawTextOptions {
  word: string;
  font: WordFont;
  /** Size of the area to cover, in CSS pixels. */
  width: number;
  height: number;
  /** Fraction of the width the word occupies. */
  widthRatio: number;
  /** Vertical position: 0 = bottom, 1 = top. */
  y: number;
}

/** Where the word ended up, in CSS pixels. */
export interface TextMetrics {
  /** Left edge of the word. */
  left: number;
  /** Width of the word (may be less than requested if the height capped the font size). */
  width: number;
  /** Height of the capital letters. */
  height: number;
}

/** Rasterises `word` into `canvas`, sized to the given area (alpha = glyph coverage). */
export function drawText(
  canvas: HTMLCanvasElement,
  { word, font, width, height, widthRatio, y }: DrawTextOptions,
): TextMetrics {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const W = Math.max(1, Math.floor(width * dpr));
  const H = Math.max(1, Math.floor(height * dpr));
  canvas.width = W;
  canvas.height = H;
  const fallback: TextMetrics = {
    left: width * (1 - widthRatio) * 0.5,
    width: width * widthRatio,
    height: width * widthRatio * 0.133,
  };
  const ctx = canvas.getContext("2d");
  if (!ctx) return fallback;
  ctx.clearRect(0, 0, W, H);

  const fontAt = (px: number) => `${font.weight} ${px}px ${font.family}`;
  ctx.font = fontAt(100);
  let size = (100 * (W * widthRatio)) / ctx.measureText(word).width;
  size = Math.min(size, H * 0.6);
  ctx.font = fontAt(size);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000";

  // Centre the capitals on the requested height, whatever the typeface's proportions.
  const measured = ctx.measureText(word);
  const caps = measured.actualBoundingBoxAscent || size * 0.72;
  ctx.fillText(word, W / 2, H * (1 - y) + caps / 2);

  return {
    left: (width - measured.width / dpr) / 2,
    width: measured.width / dpr,
    height: caps / dpr,
  };
}
