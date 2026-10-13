interface DrawTextOptions {
  word: string;
  /** Fraction of the viewport width the word occupies. */
  widthRatio: number;
  /** Vertical position: 0 = bottom, 1 = top. */
  y: number;
}

const FONT_FAMILY = '"Arial Black", "Helvetica Neue", Arial, sans-serif';

/** Rasterises `word` into `canvas`, sized to the current viewport (alpha = glyph coverage). */
export function drawText(
  canvas: HTMLCanvasElement,
  { word, widthRatio, y }: DrawTextOptions,
): void {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const W = Math.floor(window.innerWidth * dpr);
  const H = Math.floor(window.innerHeight * dpr);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  ctx.font = `900 100px ${FONT_FAMILY}`;
  let size = (100 * (W * widthRatio)) / ctx.measureText(word).width;
  size = Math.min(size, H * 0.6);
  ctx.font = `900 ${size}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#000";
  ctx.fillText(word, W / 2, H * (1 - y) + size * 0.36); // 0.36 ~ half cap height
}
