"use client";

import { usePilot } from "../lib/pilot";

const BARS = [0.5, 0.9, 0.6, 1, 0.7, 0.85, 0.45];

/** Màn chào bắt buộc: bấm bật âm thanh rồi mới vào sân bay, để tiếng ô lật kêu ngay từ đầu. */
export function WelcomeGate({ onEnter }: { onEnter: () => void }) {
  const pilot = usePilot();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#05070c]/80 p-5 backdrop-blur-md"
    >
      <div className="pa-in relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#121829] to-[#0b0f1c] p-7 text-center shadow-[0_40px_120px_rgba(255,45,120,0.25)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-48 -translate-x-1/2 rounded-full bg-[#ff2d78]/25 blur-3xl"
        />
        <p className="relative font-mono text-[10px] tracking-[0.35em] text-[#ffc94a]">
          ✈ DATE AIRWAYS · TERMINAL 1
        </p>
        <h2
          id="welcome-title"
          className="relative mt-3 text-3xl font-extrabold tracking-tight text-white"
        >
          Welcome to the {pilot.name} airport
        </h2>
        <p className="relative mt-3 text-sm leading-relaxed text-white/65">
          This trip comes with sound: flapping boards, airport chimes, and a captain who talks too
          much. Turn your volume up before boarding.
        </p>

        <div
          aria-hidden="true"
          className="relative mt-6 flex h-10 items-end justify-center gap-1.5"
        >
          {BARS.map((height, index) => (
            <span
              key={index}
              className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-[#ff2d78] to-[#ffc94a]"
              style={{
                height: `${height * 100}%`,
                animation: `eq-bounce 0.9s ${index * 0.11}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onEnter}
          autoFocus
          className="relative mt-7 w-full rounded-2xl bg-gradient-to-r from-[#ff2d78] to-[#ff5c9a] px-6 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(255,45,120,0.45)] transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
        >
          🔊 Turn on sound & enter
        </button>
        <p className="relative mt-3 text-[11px] text-white/40">
          On iPhone, flip the silent switch off too.
        </p>
      </div>
    </div>
  );
}
