"use client";

import { useEffect, useRef } from "react";

import { PORTRAIT_ROWS, PORTRAIT_SIZE } from "../lib/portrait-data";

const N = PORTRAIT_SIZE;

/** Brightness (0 to 1) of every dot, row by row. */
const LEVELS = (() => {
  const levels = new Float32Array(N * N);
  PORTRAIT_ROWS.forEach((row, y) => {
    for (let x = 0; x < N; x++) levels[y * N + x] = parseInt(row[x], 36) / 35;
  });
  return levels;
})();

/** Smallest and largest dot radius, in cells. Dark areas keep a faint dot, like a screen. */
const R_MIN = 0.07;
const R_MAX = 0.37;

/** How far from the pointer dots get blasted, in cells. */
const REACH = 15;
/** How hard a moving pointer kicks dots (cells per second, per second). */
const KICK = 420;
/** A click shatters everything within this many cells. */
const BURST_REACH = 26;
const BURST_KICK = 55;
/** No dot strays further than this from its place, in cells. */
const MAX_OFFSET = 22;
/** Pointer speed (cells per second) at which the springs are fully let go. */
const FULL_SPEED = 45;

const GREY_STEPS = 28;
const TINT_STEPS = 8;
/** Scattered dots glow this colour. */
const TINT = [255, 45, 149] as const;

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

function grey(step: number): string {
  const c = Math.round(55 + (200 * step) / (GREY_STEPS - 1));
  return `rgb(${c},${c},${c})`;
}

function tint(step: number): string {
  const k = ((step + 1) / TINT_STEPS) * 0.85;
  const mix = (a: number, b: number) => Math.round(a + (b - a) * k);
  return `rgb(${mix(255, TINT[0])},${mix(255, TINT[1])},${mix(255, TINT[2])})`;
}

const FILL = [
  ...Array.from({ length: GREY_STEPS }, (_, i) => grey(i)),
  ...Array.from({ length: TINT_STEPS }, (_, i) => tint(i)),
];

/** A fixed random angle per dot, so a blast sprays instead of fanning out in straight lines. */
const SCATTER = (() => {
  const angles = new Float32Array(N * N);
  let seed = 7;
  for (let i = 0; i < angles.length; i++) {
    seed = (seed * 16807) % 2147483647;
    angles[i] = (seed / 2147483647) * Math.PI * 2;
  }
  return angles;
})();

/**
 * A halftone portrait: a grid of dots whose size and brightness follow the photo, drawn on a
 * canvas. The dots build up from the centre when it scrolls into view and a soft scan line
 * sweeps down now and then.
 *
 * Wherever the pointer travels, the dots it touches are blasted apart and glow pink. They are on
 * springs: while the pointer keeps moving the springs stay slack, so the debris drifts; as soon
 * as it stops they snap tight and every dot flies back to its place. A click shatters the area.
 *
 * Runs only while on screen; with reduced motion it is drawn once, still.
 */
export function DotPortrait({ label, className }: { label: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const ctx = context;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let css = 0;
    let reveal = still ? 1 : 0;
    let time = 0;
    let last = performance.now();

    // Each dot: how far it is from home (cells) and how fast it is moving.
    const offX = new Float32Array(N * N);
    const offY = new Float32Array(N * N);
    const velX = new Float32Array(N * N);
    const velY = new Float32Array(N * N);

    // Pointer in cell units, its velocity, and a pending click burst.
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, over: false, at: 0 };
    let burst: { x: number; y: number } | null = null;
    const buckets: number[][] = FILL.map(() => []);

    const draw = () => {
      const cell = css / N;
      ctx.clearRect(0, 0, css, css);
      buckets.forEach((bucket) => (bucket.length = 0));

      const scanY = ((time / 7) % 1) * N * 1.5 - N * 0.25;
      const half = N / 2;

      for (let y = 0; y < N; y++) {
        const scan = Math.exp(-((y - scanY) ** 2) / 18);
        for (let x = 0; x < N; x++) {
          const i = y * N + x;
          const v = LEVELS[i];

          // Build-up from the centre.
          const fromCentre = Math.hypot(x - half, y - half) / half;
          const appear = clamp((reveal * 1.6 - fromCentre) / 0.4, 0, 1);
          if (appear <= 0) continue;

          const ox = offX[i];
          const oy = offY[i];
          const away = Math.hypot(ox, oy);
          // 0 at home, 1 once well scattered.
          const loose = clamp(away / 5, 0, 1);

          const cx = (x + 0.5 + ox) * cell;
          const cy = (y + 0.5 + oy) * cell;

          const radius =
            cell * (R_MIN + (R_MAX - R_MIN) * Math.sqrt(v)) * (1 + loose * 0.5 + scan * 0.35);
          const r = Math.min(radius, cell * 0.42) * appear * (0.55 + 0.45 * appear);
          if (r < 0.2) continue;

          const bright = clamp(v * 1.2 + scan * 0.45 + loose * 0.5, 0, 1);
          const index =
            loose > 0.08
              ? GREY_STEPS + Math.min(TINT_STEPS - 1, Math.floor(loose * TINT_STEPS))
              : Math.round(bright * (GREY_STEPS - 1));
          buckets[index].push(cx, cy, r);
        }
      }

      buckets.forEach((bucket, index) => {
        if (bucket.length === 0) return;
        ctx.fillStyle = FILL[index];
        ctx.beginPath();
        for (let i = 0; i < bucket.length; i += 3) {
          ctx.moveTo(bucket[i] + bucket[i + 2], bucket[i + 1]);
          ctx.arc(bucket[i], bucket[i + 1], bucket[i + 2], 0, Math.PI * 2);
        }
        ctx.fill();
      });
    };

    /** Move the dots one step: blasts from the pointer, then springs back toward home. */
    const simulate = (dt: number) => {
      // The pointer's speed fades out quickly once it stops moving.
      pointer.speed *= Math.exp(-dt * 7);
      pointer.vx *= Math.exp(-dt * 7);
      pointer.vy *= Math.exp(-dt * 7);

      // 1 while the pointer is still, 0 while it is racing about.
      const calm = 1 - clamp(pointer.speed / FULL_SPEED, 0, 1);
      const stiffness = 1.5 + 30 * calm * calm;
      const damping = 1.2 + 7 * calm;

      const blast = pointer.over && pointer.speed > 2;
      const strength = clamp(pointer.speed / FULL_SPEED, 0.25, 1);
      const dirLength = Math.hypot(pointer.vx, pointer.vy) || 1;
      const sweepX = pointer.vx / dirLength;
      const sweepY = pointer.vy / dirLength;

      // Work out which cells the pointer or a burst can reach, so most dots are skipped.
      const around = (
        cx: number,
        cy: number,
        reach: number,
        apply: (i: number, dx: number, dy: number, d: number) => void,
      ) => {
        const x0 = Math.max(0, Math.floor(cx - reach));
        const x1 = Math.min(N - 1, Math.ceil(cx + reach));
        const y0 = Math.max(0, Math.floor(cy - reach));
        const y1 = Math.min(N - 1, Math.ceil(cy + reach));
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const i = y * N + x;
            const dx = x + 0.5 + offX[i] - cx;
            const dy = y + 0.5 + offY[i] - cy;
            const d = Math.hypot(dx, dy);
            if (d < reach) apply(i, dx, dy, d);
          }
        }
      };

      if (blast) {
        around(pointer.x, pointer.y, REACH, (i, dx, dy, d) => {
          const falloff = (1 - d / REACH) ** 1.4;
          const ux = dx / (d || 1);
          const uy = dy / (d || 1);
          const sx = Math.cos(SCATTER[i]);
          const sy = Math.sin(SCATTER[i]);
          // Away from the pointer, carried along its path, plus a random spray.
          const kick = KICK * falloff * strength * dt;
          velX[i] += (ux * 1.0 + sweepX * 0.6 + sx * 0.7) * kick;
          velY[i] += (uy * 1.0 + sweepY * 0.6 + sy * 0.7) * kick;
        });
      }

      if (burst) {
        const { x, y } = burst;
        burst = null;
        around(x, y, BURST_REACH, (i, dx, dy, d) => {
          const falloff = 1 - d / BURST_REACH;
          const ux = dx / (d || 1);
          const uy = dy / (d || 1);
          const kick = BURST_KICK * falloff;
          velX[i] += ux * kick + Math.cos(SCATTER[i]) * kick * 0.4;
          velY[i] += uy * kick + Math.sin(SCATTER[i]) * kick * 0.4;
        });
      }

      for (let i = 0; i < N * N; i++) {
        let ox = offX[i];
        let oy = offY[i];
        let vx = velX[i];
        let vy = velY[i];
        if (ox === 0 && oy === 0 && vx === 0 && vy === 0) continue;

        vx += (-stiffness * ox - damping * vx) * dt;
        vy += (-stiffness * oy - damping * vy) * dt;
        ox += vx * dt;
        oy += vy * dt;

        // Settled: snap home so idle costs nothing.
        if (Math.abs(ox) + Math.abs(oy) + Math.abs(vx) + Math.abs(vy) < 0.01) {
          ox = oy = vx = vy = 0;
        }
        const length = Math.hypot(ox, oy);
        if (length > MAX_OFFSET) {
          ox *= MAX_OFFSET / length;
          oy *= MAX_OFFSET / length;
        }
        offX[i] = ox;
        offY[i] = oy;
        velX[i] = vx;
        velY[i] = vy;
      }
    };

    const fit = () => {
      css = canvas.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(css * dpr);
      canvas.height = Math.round(css * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    fit();
    const resizeObserver = new ResizeObserver(fit);
    resizeObserver.observe(canvas);

    if (still) {
      return () => resizeObserver.disconnect();
    }

    let running = false;
    let frameHandle = 0;
    const loop = () => {
      if (!running) return;
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      time += dt;
      reveal = Math.min(1, reveal + dt / 1.9);
      simulate(dt);
      draw();
      frameHandle = requestAnimationFrame(loop);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        last = performance.now();
        running = true;
        frameHandle = requestAnimationFrame(loop);
      } else {
        running = false;
        cancelAnimationFrame(frameHandle);
      }
    });
    visibility.observe(canvas);

    const toCells = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * N,
        y: ((event.clientY - rect.top) / rect.height) * N,
      };
    };

    const onMove = (event: PointerEvent) => {
      const { x, y } = toCells(event);
      const now = performance.now();
      if (pointer.over) {
        const seconds = Math.max(0.008, (now - pointer.at) / 1000);
        const vx = (x - pointer.x) / seconds;
        const vy = (y - pointer.y) / seconds;
        const speed = Math.hypot(vx, vy);
        // Smooth a little so a jittery mouse doesn't flicker the effect.
        pointer.vx += (vx - pointer.vx) * 0.5;
        pointer.vy += (vy - pointer.vy) * 0.5;
        pointer.speed = Math.max(pointer.speed * 0.5, Math.min(speed, 160));
      }
      pointer.x = x;
      pointer.y = y;
      pointer.at = now;
      pointer.over = true;
    };
    const onDown = (event: PointerEvent) => {
      onMove(event);
      burst = { x: pointer.x, y: pointer.y };
    };
    const onLeave = () => {
      pointer.over = false;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(frameHandle);
      visibility.disconnect();
      resizeObserver.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      tabIndex={-1}
      className={`block aspect-square w-full touch-pan-y ${className ?? ""}`}
    />
  );
}
