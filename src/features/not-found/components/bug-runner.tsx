"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { THEME } from "@/config/theme";
import { Chibi } from "@/features/date";

type Status = "idle" | "running" | "over";

/** Physics, in pixels and seconds. */
const GRAVITY = 2100;
const JUMP_SPEED = 720;
const START_SPEED = 330;
const SPEED_GAIN = 14;
const MAX_SPEED = 720;
/** Seconds spent in the air per jump. */
const AIR_TIME = (2 * JUMP_SPEED) / GRAVITY;

const ARENA_H = 220;
const GROUND = 44;
const PLAYER_X = 40;
const PLAYER_W = 52;
const PLAYER_H = 64;
/** The hitbox is a little smaller than the drawing, so near misses feel fair. */
const HIT_INSET = 10;

const OBSTACLES = [
  { glyph: "🐛", size: 30 },
  { glyph: ";", size: 34 },
  { glyph: "🐞", size: 26 },
] as const;
const POOL = 4;

const BEST_KEY = "bug-runner-best";
const noop = () => () => {};
const readBest = () => Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;

interface Obstacle {
  x: number;
  kind: number;
  active: boolean;
}

/**
 * A tiny endless runner for the 404 page: chibi Raymond runs along a "404" runway and jumps over
 * bugs and stray semicolons. Space, arrow up, a click or a tap starts it and makes him jump.
 */
export function BugRunner() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLDivElement>(null);
  const obstacleRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [airborne, setAirborne] = useState(false);
  const best = useSyncExternalStore(noop, readBest, () => 0);

  const game = useRef({
    status: "idle" as Status,
    y: 0,
    vy: 0,
    speed: START_SPEED,
    distance: 0,
    nextGap: 0,
    obstacles: Array.from({ length: POOL }, (): Obstacle => ({ x: 0, kind: 0, active: false })),
  });

  const reset = () => {
    const g = game.current;
    g.y = 0;
    g.vy = 0;
    g.speed = START_SPEED;
    g.distance = 0;
    g.nextGap = 500;
    for (const o of g.obstacles) o.active = false;
    setScore(0);
  };

  const jumpOrStart = useCallback(() => {
    const g = game.current;
    if (g.status !== "running") {
      reset();
      g.status = "running";
      setStatus("running");
      return;
    }
    if (g.y === 0) {
      g.vy = JUMP_SPEED;
      setAirborne(true);
    }
  }, []);

  // Keyboard: Space or arrow up. Stop the page from scrolling while playing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.code !== "ArrowUp") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, input, textarea")) return;
      event.preventDefault();
      jumpOrStart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jumpOrStart]);

  // The game loop: physics, spawning, collisions, and moving the DOM nodes directly.
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let groundShift = 0;
    let lastScore = -1;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      const width = arenaRef.current?.clientWidth ?? 600;

      if (g.status === "running") {
        g.speed = Math.min(MAX_SPEED, g.speed + SPEED_GAIN * dt);
        const step = g.speed * dt;
        g.distance += step;
        groundShift = (groundShift + step) % 1000;

        // Jump physics.
        if (g.y > 0 || g.vy > 0) {
          g.vy -= GRAVITY * dt;
          g.y = Math.max(0, g.y + g.vy * dt);
          if (g.y === 0) {
            g.vy = 0;
            setAirborne(false);
          }
        }

        // Move obstacles and spawn a new one once the gap is used up.
        for (const o of g.obstacles) if (o.active) o.x -= step;
        for (const o of g.obstacles) if (o.active && o.x < -60) o.active = false;
        g.nextGap -= step;
        if (g.nextGap <= 0) {
          const slot = g.obstacles.find((o) => !o.active);
          if (slot) {
            slot.active = true;
            slot.x = width + 20;
            slot.kind = Math.floor(Math.random() * OBSTACLES.length);
          }
          // A jump lasts 2 · JUMP_SPEED / GRAVITY seconds; keep every gap longer than that
          // (plus a little landing room), so two bugs in a row can always be cleared.
          g.nextGap = g.speed * (AIR_TIME + 0.3 + Math.random() * 0.8);
        }

        // Collision.
        const px1 = PLAYER_X + HIT_INSET;
        const px2 = PLAYER_X + PLAYER_W - HIT_INSET;
        for (const o of g.obstacles) {
          if (!o.active) continue;
          const size = OBSTACLES[o.kind].size;
          const ox1 = o.x + 4;
          const ox2 = o.x + size - 4;
          if (px2 > ox1 && px1 < ox2 && g.y < size - 8) {
            g.status = "over";
            setStatus("over");
            setAirborne(false);
            const final = Math.floor(g.distance / 10);
            if (final > readBest()) window.localStorage.setItem(BEST_KEY, String(final));
          }
        }

        const nextScore = Math.floor(g.distance / 10);
        if (nextScore !== lastScore) {
          lastScore = nextScore;
          setScore(nextScore);
        }
      }

      if (playerRef.current) {
        playerRef.current.style.transform = `translateY(${-g.y}px)`;
      }
      if (groundRef.current) {
        groundRef.current.style.backgroundPositionX = `${-groundShift}px`;
      }
      g.obstacles.forEach((o, index) => {
        const el = obstacleRefs.current[index];
        if (!el) return;
        el.style.display = o.active ? "block" : "none";
        if (!o.active) return;
        el.textContent = OBSTACLES[o.kind].glyph;
        el.style.fontSize = `${OBSTACLES[o.kind].size}px`;
        el.style.transform = `translateX(${o.x}px)`;
      });
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const mood = status === "over" ? "shock" : airborne ? "happy" : "smile";
  const pad = (value: number) => String(value).padStart(4, "0");

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-2 flex justify-between px-1 font-mono text-xs tracking-[0.25em] text-zinc-400">
        <span>
          SCORE <span className="text-zinc-100">{pad(score)}</span>
        </span>
        <span>
          BEST <span className="text-zinc-100">{pad(Math.max(best, score))}</span>
        </span>
      </div>

      <div
        ref={arenaRef}
        role="application"
        aria-label="Dodge the bugs mini game. Press Space or tap to jump."
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("a, button")) return;
          event.preventDefault();
          jumpOrStart();
        }}
        className="relative cursor-pointer touch-none overflow-hidden rounded-2xl border border-white/20 bg-[#fff6e9] text-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.45)] select-none"
        style={{ height: ARENA_H }}
      >
        {/* Runway made of "404"s, scrolling with the game. */}
        <div
          ref={groundRef}
          aria-hidden="true"
          className="absolute inset-x-0 border-t-2 font-mono text-[11px] leading-[20px] font-bold tracking-[0.4em] whitespace-nowrap text-[#d9c7ad]"
          style={{
            bottom: 0,
            height: GROUND,
            borderColor: THEME.palette[0],
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 24px, transparent 24px 48px)",
            backgroundSize: "48px 2px",
            backgroundRepeat: "repeat-x",
          }}
        >
          <span className="block pt-2 pl-2">{"404 ".repeat(40)}</span>
        </div>

        {/* Player. */}
        <div
          ref={playerRef}
          aria-hidden="true"
          className="absolute will-change-transform"
          style={{ left: PLAYER_X, bottom: GROUND - 2, width: PLAYER_W, height: PLAYER_H }}
        >
          <Chibi
            who="him"
            mood={mood}
            pose={airborne ? "wave" : "down"}
            className={
              status === "running" && !airborne
                ? "size-full motion-safe:animate-[runner-bob_0.3s_ease-in-out_infinite]"
                : "size-full"
            }
          />
        </div>

        {/* Obstacle pool. */}
        {Array.from({ length: POOL }, (_, index) => (
          <span
            key={index}
            ref={(el) => {
              obstacleRefs.current[index] = el;
            }}
            aria-hidden="true"
            className="absolute left-0 hidden font-mono leading-none font-black will-change-transform"
            style={{ bottom: GROUND - 2, color: THEME.palette[0] }}
          />
        ))}

        {status === "idle" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-bold text-zinc-900">Dodge the bugs 🐛</p>
            <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-500 motion-safe:animate-pulse">
              PRESS SPACE OR TAP TO START
            </p>
          </div>
        )}

        {status === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#fff6e9]/85 text-center text-zinc-900 backdrop-blur-[2px]">
            <p className="text-2xl font-black">🐛 Bug won.</p>
            <p className="font-mono text-xs tracking-[0.2em] text-zinc-600">
              SCORE {pad(score)} · BEST {pad(Math.max(best, score))}
              {score > 0 && score >= best && " · NEW RECORD ✨"}
            </p>
            <button
              type="button"
              onClick={jumpOrStart}
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-zinc-700"
            >
              ↻ Try again
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes runner-bob { 50% { transform: translateY(-3px); } }
        .chibi-blink { transform-box: fill-box; transform-origin: center; animation: chibi-blink 4.5s infinite; }
        @keyframes chibi-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
      `}</style>
    </div>
  );
}
