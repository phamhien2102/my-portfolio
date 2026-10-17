"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/cn";

import { CAPTAIN_NAME, TAKEOFF_ABORTS } from "../data";
import { playSound, startEngine, type Engine } from "../lib/sound";

/** Giữ liên tục chừng này thì đủ tốc độ cất cánh. */
const HOLD_MS = 3000;
/** Buông tay thì máy bay trôi ngược về nhanh hơn lúc chạy đà. */
const DECAY_MS = 1200;
/** Buông tay khi đã chạy được chừng này mới tính là "huỷ cất cánh". */
const ABORT_FROM = 0.15;

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
}

/**
 * Buồng lái: nhấn giữ nút để cất cánh. Giữ càng lâu động cơ càng gầm, đường băng chạy càng nhanh,
 * cả bảng rung và điện thoại rung theo. Buông sớm là bị huỷ cất cánh; giữ đủ thì gọi onTakeoff.
 */
export function Takeoff({ onTakeoff }: { onTakeoff: () => void }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [aborts, setAborts] = useState(0);
  const [done, setDone] = useState(false);

  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const doneRef = useRef(false);
  const engine = useRef<Engine | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<HTMLDivElement>(null);
  const onTakeoffRef = useRef(onTakeoff);

  useEffect(() => {
    onTakeoffRef.current = onTakeoff;
  }, [onTakeoff]);

  // Vòng lặp theo khung hình: cập nhật tiến độ, đường băng, độ rung và tiếng động cơ.
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let distance = 0;
    let sinceBuzz = 0;

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last);
      last = now;
      if (doneRef.current) return;

      const before = progressRef.current;
      const next = holdingRef.current
        ? Math.min(1, before + dt / HOLD_MS)
        : Math.max(0, before - dt / DECAY_MS);
      progressRef.current = next;
      if (next !== before) setProgress(next);

      // Vạch sơn đường băng chạy lùi theo tốc độ máy bay.
      distance += dt * (0.02 + next * 0.9);
      if (stripeRef.current) stripeRef.current.style.backgroundPositionX = `${-distance}px`;

      // Rung cả bảng và rung điện thoại, mạnh dần theo tốc độ.
      if (cardRef.current) {
        const amp = holdingRef.current ? next * 3 : 0;
        cardRef.current.style.transform = `translate(${(Math.random() - 0.5) * amp}px, ${(Math.random() - 0.5) * amp}px)`;
      }
      engine.current?.set(next);
      if (holdingRef.current) {
        sinceBuzz += dt;
        if (sinceBuzz > 260 - next * 190) {
          sinceBuzz = 0;
          vibrate(Math.round(12 + next * 40));
        }
      }

      if (next >= 1) {
        doneRef.current = true;
        holdingRef.current = false;
        engine.current?.stop();
        engine.current = null;
        vibrate([80, 40, 160]);
        if (cardRef.current) cardRef.current.style.transform = "";
        setHolding(false);
        setDone(true);
        onTakeoffRef.current();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      engine.current?.stop();
    };
  }, []);

  const press = () => {
    if (doneRef.current || holdingRef.current) return;
    holdingRef.current = true;
    setHolding(true);
    engine.current = startEngine();
  };

  const release = () => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    engine.current?.stop();
    engine.current = null;
    if (!doneRef.current && progressRef.current >= ABORT_FROM) {
      playSound("buzz");
      vibrate(0);
      setAborts((count) => count + 1);
    }
  };

  const onKey = (event: KeyboardEvent<HTMLButtonElement>, down: boolean) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (down && !event.repeat) press();
    if (!down) release();
  };

  const speed = Math.round(progress * 160);
  const bpm = Math.round(72 + progress * 108);
  const lifting = progress > 0.82;
  const message = done
    ? "V1… rotate… we have lift-off!"
    : holding
      ? progress > 0.7
        ? "Almost there. Do not let go!"
        : "Keep holding…"
      : aborts > 0
        ? TAKEOFF_ABORTS[(aborts - 1) % TAKEOFF_ABORTS.length]
        : "Press and hold the throttle to take off.";

  return (
    <div
      ref={cardRef}
      className="step-in mt-6 w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-[#121829] to-[#0b0f1c] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.3em] text-white/50">
        <span>COCKPIT · HH143</span>
        <span>RWY 14</span>
      </div>

      {/* Đường băng: vạch sơn chạy lùi, máy bay chạy đà rồi ngóc đầu lên. */}
      <div className="relative mt-4 h-20 overflow-hidden rounded-xl bg-[#1b1f2a] ring-1 ring-white/5">
        <div
          ref={stripeRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 opacity-70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #f4f1ea 0 22px, transparent 22px 44px)",
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-1.5 flex justify-between px-2">
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="size-1 rounded-full bg-[#ffc94a] shadow-[0_0_6px_#ffc94a]"
            />
          ))}
        </div>
        <span
          aria-hidden="true"
          className="absolute top-1/2 text-4xl text-white drop-shadow-[0_0_12px_rgba(255,45,120,0.7)] transition-transform duration-150"
          style={{
            left: `${4 + progress * 72}%`,
            transform: `translateY(${-50 - (lifting ? (progress - 0.82) * 220 : 0)}%) rotate(${lifting ? -(progress - 0.82) * 90 : 0}deg)`,
          }}
        >
          ✈
        </span>
      </div>

      {/* Đồng hồ tốc độ và nhịp tim của Raymond. */}
      <div className="mt-4 grid grid-cols-2 gap-3 font-mono">
        <div className="rounded-xl bg-black/40 px-3 py-2 ring-1 ring-white/5">
          <p className="text-[9px] tracking-[0.25em] text-white/40">SPEED</p>
          <p className="text-2xl font-bold text-[#5cff9d] tabular-nums">
            {speed}
            <span className="ml-1 text-xs text-white/40">KTS</span>
          </p>
        </div>
        <div className="rounded-xl bg-black/40 px-3 py-2 ring-1 ring-white/5">
          <p className="text-[9px] tracking-[0.25em] text-white/40">
            {CAPTAIN_NAME.toUpperCase()}&apos;S HEART
          </p>
          <p className="flex items-baseline gap-1 text-2xl font-bold text-[#ff8ab3] tabular-nums">
            <span
              aria-hidden="true"
              className="inline-block text-base"
              style={{
                animation: `heartbeat ${Math.max(0.3, 0.9 - progress * 0.6)}s ease-in-out infinite`,
              }}
            >
              ♥
            </span>
            {bpm}
            <span className="text-xs text-white/40">BPM</span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={done}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            press();
          }}
          onPointerUp={release}
          onPointerCancel={release}
          onLostPointerCapture={release}
          onKeyDown={(event) => onKey(event, true)}
          onKeyUp={(event) => onKey(event, false)}
          onContextMenu={(event) => event.preventDefault()}
          aria-label="Hold to take off"
          className={cn(
            "relative flex size-32 touch-none items-center justify-center rounded-full p-1.5 transition-transform select-none [-webkit-touch-callout:none]",
            holding ? "scale-95" : "hover:scale-105",
          )}
          style={{
            background: `conic-gradient(#ff2d78 ${progress * 360}deg, rgba(255,255,255,0.12) 0)`,
          }}
        >
          <span
            className={cn(
              "flex size-full flex-col items-center justify-center rounded-full bg-[#0b0f1c] font-extrabold text-white",
              holding && "shadow-[inset_0_0_30px_rgba(255,45,120,0.5)]",
            )}
          >
            <span className="text-2xl">{done ? "🛫" : "✈"}</span>
            <span className="mt-1 text-[11px] leading-tight tracking-wider">
              {done ? "AIRBORNE" : "HOLD TO"}
              <br />
              {done ? "" : "TAKE OFF"}
            </span>
          </span>
        </button>
        <p
          aria-live="polite"
          className={cn(
            "min-h-[1.5em] text-center text-sm",
            !holding && aborts > 0 && !done ? "text-[#ff8a8a]" : "text-white/70",
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
