import type { InkMode } from "@/features/settings";

import { REVEAL_CONFIG } from "../config";
import { drawText, type TextMetrics } from "./draw-text";
import { resolveFont } from "./fonts";

const clampByte = (n: number) => Math.min(255, Math.max(0, Math.round(n)));

function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixWhite(rgb: readonly [number, number, number], t: number): [number, number, number] {
  return [
    clampByte(rgb[0] + (255 - rgb[0]) * t),
    clampByte(rgb[1] + (255 - rgb[1]) * t),
    clampByte(rgb[2] + (255 - rgb[2]) * t),
  ];
}

function scaleRgb(rgb: readonly [number, number, number], k: number): [number, number, number] {
  return [clampByte(rgb[0] * k), clampByte(rgb[1] * k), clampByte(rgb[2] * k)];
}

export interface DropletScene {
  setInkMode: (mode: InkMode) => void;
  dispose: () => void;
}

interface DropletTargets {
  /** Element that marks where the hero is on the page (and receives the pointer). */
  slot: HTMLElement;
  /** Element the word shrinks into (the logo spot in the header). */
  dock: HTMLElement | null;
  /** How ink colours are chosen. */
  inkMode: InkMode;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

/** How the droplets behave. Distances are in CSS pixels, speeds in pixels per second. */
const SPRING = 55; // how hard a droplet is pulled back to its place
const DAMPING = 5.5; // how quickly it loses speed (low = bouncy)
const PUSH = 2400; // how hard a nearby pointer shoves droplets away
const DRAG = 0.5; // how much of the pointer's own speed rubs off on them
const SPLASH = 1100; // speed given to droplets by a click
const SLEEP = 0.04; // closer than this to home and slower than SLEEP_SPEED: asleep
const SLEEP_SPEED = 0.6;

/** A glassy water bead: a dark rim, a clear body and two highlights. Drawn once, reused. */
function makeSprite(tint: readonly [number, number, number]): HTMLCanvasElement {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const c = size / 2;
  const [r, g, b] = tint;
  const hi = mixWhite(tint, 0.45);
  const lo = scaleRgb(tint, 0.35);

  const body = ctx.createRadialGradient(c * 0.9, c * 0.85, 0, c, c, c);
  body.addColorStop(0, `rgba(${hi[0]},${hi[1]},${hi[2]},0.55)`);
  body.addColorStop(0.55, `rgba(${r},${g},${b},0.55)`);
  body.addColorStop(0.88, `rgba(${lo[0]},${lo[1]},${lo[2]},0.9)`);
  body.addColorStop(1, `rgba(${lo[0]},${lo[1]},${lo[2]},0)`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();

  // Light caught on the upper left, and a faint glow where it leaves at the bottom right.
  const shine = ctx.createRadialGradient(c * 0.68, c * 0.6, 0, c * 0.68, c * 0.6, c * 0.42);
  shine.addColorStop(0, "rgba(255,255,255,0.95)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(c * 0.68, c * 0.6, c * 0.42, 0, Math.PI * 2);
  ctx.fill();

  const glow = ctx.createRadialGradient(c * 1.3, c * 1.35, 0, c * 1.3, c * 1.35, c * 0.38);
  glow.addColorStop(0, `rgba(${hi[0]},${hi[1]},${hi[2]},0.5)`);
  glow.addColorStop(1, `rgba(${hi[0]},${hi[1]},${hi[2]},0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(c * 1.3, c * 1.35, c * 0.38, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

/**
 * The hero word made of water droplets, instead of the chrome blob.
 *
 * The word is rasterised once and sampled into a few thousand small droplets that sit on a
 * staggered grid. Each is a spring: the pointer shoves nearby droplets aside and carries them
 * along, a click splashes them apart, and they all flow back to their place. As the page scrolls
 * the whole word shrinks into the header, like the blob version. Pointer input only counts while
 * the hero is on screen and no dialog is open; with reduced motion the word just sits there.
 */
export function createDropletScene(
  container: HTMLElement,
  { slot, dock, inkMode: initialInkMode }: DropletTargets,
): DropletScene {
  const { word, textY, textWidth, palette, inkInterval } = REVEAL_CONFIG;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const size = () => ({
    w: Math.max(1, container.clientWidth),
    h: Math.max(1, container.clientHeight),
  });

  const canvas = document.createElement("canvas");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");
  const ctx = context;

  let inkIdx = 0;
  let picked = false;
  let inkMode = initialInkMode;
  let inkClock = 0;
  const sprites: HTMLCanvasElement[] = [];
  const paintSprites = (hex: string) => {
    const rgb = hexRgb(hex);
    sprites[0] = makeSprite(rgb);
    sprites[1] = makeSprite(mixWhite(rgb, 0.18));
    sprites[2] = makeSprite(scaleRgb(rgb, 0.82));
  };
  paintSprites(palette[0]);
  const pickInk = () => {
    if (palette.length === 0) return;
    let next = Math.floor(Math.random() * palette.length);
    if (palette.length > 1) {
      while (next === inkIdx) next = Math.floor(Math.random() * palette.length);
    }
    inkIdx = next;
    paintSprites(palette[inkIdx]);
  };

  // ---------- The droplets ----------
  let count = 0;
  let homeX = new Float32Array(0);
  let homeY = new Float32Array(0);
  let posX = new Float32Array(0);
  let posY = new Float32Array(0);
  let velX = new Float32Array(0);
  let velY = new Float32Array(0);
  let radius = new Float32Array(0);
  let kind = new Uint8Array(0);
  let phase = new Float32Array(0);
  let metrics: TextMetrics = { left: 0, width: 1, height: 1 };
  let width = 1;
  let height = 1;
  let dirty = true;

  const build = () => {
    ({ w: width, h: height } = size());
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Rasterise the word, then keep a droplet wherever a grid point lands on a letter.
    const mask = document.createElement("canvas");
    metrics = drawText(mask, {
      word,
      font: resolveFont("droplets"),
      width,
      height,
      widthRatio: textWidth,
      y: textY,
    });
    const maskContext = mask.getContext("2d");
    const pixels = maskContext?.getImageData(0, 0, mask.width, mask.height);
    const sx = mask.width / width;
    const sy = mask.height / height;

    const gap = clamp(width / 200, 5, 11);
    const rowGap = gap * 0.87;
    const xs: number[] = [];
    const ys: number[] = [];
    if (pixels) {
      let row = 0;
      for (let y = 0; y < height; y += rowGap, row++) {
        for (let x = (row % 2) * (gap / 2); x < width; x += gap) {
          // A little jitter, so the droplets do not look machine-laid.
          const jx = x + (Math.random() - 0.5) * gap * 0.35;
          const jy = y + (Math.random() - 0.5) * gap * 0.35;
          const px = Math.min(pixels.width - 1, Math.max(0, Math.round(jx * sx)));
          const py = Math.min(pixels.height - 1, Math.max(0, Math.round(jy * sy)));
          if (pixels.data[(py * pixels.width + px) * 4 + 3] > 128) {
            xs.push(jx);
            ys.push(jy);
          }
        }
      }
    }

    count = xs.length;
    homeX = Float32Array.from(xs);
    homeY = Float32Array.from(ys);
    posX = Float32Array.from(xs);
    posY = Float32Array.from(ys);
    velX = new Float32Array(count);
    velY = new Float32Array(count);
    radius = new Float32Array(count);
    kind = new Uint8Array(count);
    phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      radius[i] = gap * (0.58 + Math.random() * 0.22);
      kind[i] = Math.floor(Math.random() * sprites.length);
      phase[i] = Math.random() * Math.PI * 2;
    }
    dirty = true;
  };
  build();

  const resizeObserver = new ResizeObserver(() => {
    const next = size();
    if (next.w === width && next.h === height) return;
    build();
  });
  resizeObserver.observe(container);

  // Webfonts can change the metrics of the mask once they arrive.
  let disposed = false;
  void document.fonts?.ready.then(() => {
    if (!disposed) build();
  });

  // ---------- Pointer ----------
  const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, active: false, at: 0 };
  let splash: { x: number; y: number } | null = null;
  let progress = 0; // 0 = word fills the hero, 1 = word has shrunk into the header

  const overHero = (clientX: number, clientY: number) => {
    const rect = slot.getBoundingClientRect();
    return (
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    );
  };
  const usable = () => !still && progress < 0.02 && !document.querySelector("dialog[open]");

  const onMove = (event: PointerEvent) => {
    if (!usable() || !overHero(event.clientX, event.clientY)) {
      pointer.active = false;
      return;
    }
    const now = performance.now();
    if (pointer.active) {
      const seconds = Math.max(0.008, (now - pointer.at) / 1000);
      // Smoothed, so a jittery mouse does not make the droplets twitch.
      pointer.vx += ((event.clientX - pointer.x) / seconds - pointer.vx) * 0.4;
      pointer.vy += ((event.clientY - pointer.y) / seconds - pointer.vy) * 0.4;
    }
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.at = now;
    pointer.active = true;
    if (inkMode === "touch" && !picked) {
      pickInk();
      picked = true;
    }
  };
  const onDown = (event: PointerEvent) => {
    if (!usable() || !overHero(event.clientX, event.clientY)) return;
    onMove(event);
    splash = { x: event.clientX, y: event.clientY };
  };
  const onLeave = () => {
    pointer.active = false;
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerdown", onDown);
  document.documentElement.addEventListener("pointerleave", onLeave);

  // ---------- Physics ----------
  const step = (dt: number) => {
    const reach = Math.min(width, height) * 0.15;
    const reachSquared = reach * reach;
    const pushing = pointer.active && progress < 0.02;
    const splashReach = reach * 1.7;
    const damp = Math.exp(-DAMPING * dt);
    // The pointer's speed fades once it stops, so droplets stop being carried along.
    pointer.vx *= Math.exp(-6 * dt);
    pointer.vy *= Math.exp(-6 * dt);

    for (let i = 0; i < count; i++) {
      let ax = (homeX[i] - posX[i]) * SPRING;
      let ay = (homeY[i] - posY[i]) * SPRING;

      if (pushing) {
        const dx = posX[i] - pointer.x;
        const dy = posY[i] - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < reachSquared) {
          const d = Math.sqrt(d2) || 1;
          const falloff = (1 - d / reach) ** 2;
          ax += (dx / d) * falloff * PUSH;
          ay += (dy / d) * falloff * PUSH;
          velX[i] += pointer.vx * falloff * DRAG * dt * 8;
          velY[i] += pointer.vy * falloff * DRAG * dt * 8;
        }
      }

      if (splash) {
        const dx = posX[i] - splash.x;
        const dy = posY[i] - splash.y;
        const d = Math.hypot(dx, dy);
        if (d < splashReach) {
          const falloff = 1 - d / splashReach;
          const angle = phase[i] * 7;
          const speed = SPLASH * falloff * (0.6 + Math.random() * 0.6);
          velX[i] += (dx / (d || 1)) * speed + Math.cos(angle) * speed * 0.3;
          velY[i] += (dy / (d || 1)) * speed + Math.sin(angle) * speed * 0.3;
        }
      }

      velX[i] = (velX[i] + ax * dt) * damp;
      velY[i] = (velY[i] + ay * dt) * damp;
      posX[i] += velX[i] * dt;
      posY[i] += velY[i] * dt;

      // Settled: snap home so a quiet word costs nothing.
      const off = Math.abs(posX[i] - homeX[i]) + Math.abs(posY[i] - homeY[i]);
      if (off < SLEEP && Math.abs(velX[i]) + Math.abs(velY[i]) < SLEEP_SPEED) {
        posX[i] = homeX[i];
        posY[i] = homeY[i];
        velX[i] = velY[i] = 0;
      }
    }
    splash = null;
  };

  // ---------- Draw ----------
  const render = (eased: number, time: number) => {
    ctx.clearRect(0, 0, width, height);

    // Where the word sits between "filling the hero" and "docked in the header".
    const measured = dock?.getBoundingClientRect();
    const dockRect = measured && measured.width > 1 ? measured : undefined;
    const endLeft = dockRect ? dockRect.left : 24;
    const endCenterY = dockRect ? dockRect.top + dockRect.height / 2 : 32;
    const endScale = (dockRect ? dockRect.width : 120) / metrics.width;

    const anchorX = metrics.left;
    const centerY = height * (1 - textY);
    const scale = 1 + (endScale - 1) * eased;
    const destX = anchorX + (endLeft - anchorX) * eased;
    const destY = centerY + (endCenterY - centerY) * eased;

    for (let i = 0; i < count; i++) {
      const x = destX + (posX[i] - anchorX) * scale;
      const y = destY + (posY[i] - centerY) * scale;
      // Droplets swell and shrink a touch, like water that never quite settles.
      const wobble = still ? 1 : 1 + Math.sin(time * 1.6 + phase[i]) * 0.04;
      const r = Math.max(radius[i] * scale * wobble, 0.9);
      ctx.drawImage(sprites[kind[i]], x - r, y - r, r * 2, r * 2);
    }
  };

  // ---------- Loop ----------
  let frameHandle = 0;
  let last = performance.now();
  let settled = false; // a frame has been drawn with the word fully docked

  const frame = () => {
    frameHandle = requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;

    const slotRect = slot.getBoundingClientRect();
    const heroVisible = slotRect.bottom > 0 && slotRect.top < window.innerHeight;
    if (!heroVisible && !dirty && settled) return;

    progress = clamp(-slotRect.top / (height * 0.55), 0, 1);
    settled = progress >= 1;
    const eased = progress * progress * (3 - 2 * progress);

    if (inkMode === "time" && !still && heroVisible && progress < 0.02) {
      inkClock += dt;
      while (inkClock >= inkInterval) {
        inkClock -= inkInterval;
        pickInk();
      }
    }

    if (!still && progress < 0.02) step(dt);
    dirty = false;
    render(eased, now / 1000);
  };
  frameHandle = requestAnimationFrame(frame);

  return {
    setInkMode: (mode: InkMode) => {
      inkMode = mode;
      inkClock = 0;
      if (mode === "touch") picked = false;
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(frameHandle);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      canvas.remove();
    },
  };
}
