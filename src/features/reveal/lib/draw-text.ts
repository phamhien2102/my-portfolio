interface DrawTextOptions {
  word: string;
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
}

const FONT_FAMILY = '"Arial Black", "Helvetica Neue", Arial, sans-serif';

/** Rasterises `word` into `canvas`, sized to the given area (alpha = glyph coverage). */
export function drawText(
  canvas: HTMLCanvasElement,
  { word, width, height, widthRatio, y }: DrawTextOptions,
): TextMetrics {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const W = Math.max(1, Math.floor(width * dpr));
  const H = Math.max(1, Math.floor(height * dpr));
  canvas.width = W;
  canvas.height = H;
  const fallback: TextMetrics = { left: width * (1 - widthRatio) * 0.5, width: width * widthRatio };
  const ctx = canvas.getContext("2d");
  if (!ctx) return fallback;
  ctx.clearRect(0, 0, W, H);

  ctx.font = `900 100px ${FONT_FAMILY}`;
  let size = (100 * (W * widthRatio)) / ctx.measureText(word).width;
  size = Math.min(size, H * 0.6);
  ctx.font = `900 ${size}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000";
  ctx.fillText(word, W / 2, H * (1 - y) + size * 0.36); // 0.36 ~ half cap height

  const drawn = ctx.measureText(word).width / dpr;
  return { left: (width - drawn) / 2, width: drawn };
}
