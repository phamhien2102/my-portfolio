"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

import { FREE_SEAT, HIS_SEAT, SEAT_LETTERS, SEAT_OCCUPANTS, SEAT_ROWS } from "../data";
import { playSound } from "../lib/sound";
import { HeartBurst } from "./heart-burst";

const GRID = "grid grid-cols-[repeat(2,2.75rem)_1.5rem_repeat(2,2.75rem)] gap-2";

/** Sơ đồ ghế mà ghế trống duy nhất nằm ngay cạnh anh. */
export function SeatMap({
  onPick,
  onPokeMany,
}: {
  onPick: (seat: string) => void;
  /** Gọi khi em bấm vào ghế có người tới lần thứ ba. */
  onPokeMany: () => void;
}) {
  const [pokes, setPokes] = useState(0);
  const [poked, setPoked] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);

  const occupant = SEAT_OCCUPANTS[Math.max(0, pokes - 1) % SEAT_OCCUPANTS.length];

  const pokeTaken = (seat: string) => {
    playSound("buzz");
    setPoked(seat);
    setPokes(pokes + 1);
    if (pokes + 1 === 3) onPokeMany();
  };

  const pickFree = (seat: string, button: HTMLButtonElement) => {
    if (burst) return;
    const box = button.getBoundingClientRect();
    setBurst({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
    playSound("sparkle");
    window.setTimeout(() => onPick(seat), 1100);
  };

  return (
    <div className="flex flex-col items-center">
      {burst && <HeartBurst x={burst.x} y={burst.y} />}
      <p aria-live="polite" className="min-h-[3em] max-w-sm text-center text-sm text-white/70">
        {poked ? (
          <>
            Seat {poked}: {occupant.line}
          </>
        ) : (
          "Pick any seat you like, as long as it's free."
        )}
      </p>

      {/* Thân máy bay: mũi tròn ở trên, hai cánh hai bên. */}
      <div className="relative mt-4">
        <span
          aria-hidden="true"
          className="absolute top-[42%] -left-16 h-10 w-20 -skew-y-12 rounded-l-full bg-white/[0.04] ring-1 ring-white/10"
        />
        <span
          aria-hidden="true"
          className="absolute top-[42%] -right-16 h-10 w-20 skew-y-12 rounded-r-full bg-white/[0.04] ring-1 ring-white/10"
        />
        <div className="relative rounded-t-[6rem] rounded-b-3xl border border-white/10 bg-[#0d1220]/90 px-6 pt-16 pb-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <span
            aria-hidden="true"
            className="absolute top-5 left-1/2 h-4 w-14 -translate-x-1/2 rounded-t-full border border-white/15 bg-[#ffc94a]/10"
          />
          <div className={cn(GRID, "mb-3 text-center font-mono text-[10px] text-white/40")}>
            <span>A</span>
            <span>B</span>
            <span />
            <span>C</span>
            <span>D</span>
          </div>
          <div className="flex flex-col gap-2">
            {SEAT_ROWS.map((row) => (
              <div key={row} className={GRID}>
                {SEAT_LETTERS.map((letter, index) => {
                  const seat = `${row}${letter}`;
                  const kind = seat === HIS_SEAT ? "his" : seat === FREE_SEAT ? "free" : "taken";
                  return (
                    <SeatCell
                      key={seat}
                      seat={seat}
                      row={row}
                      aisleBefore={index === 2}
                      kind={kind}
                      bubble={poked === seat ? occupant.icon : null}
                      bubbleKey={pokes}
                      onClick={(button) => {
                        if (kind === "free") pickFree(seat, button);
                        else if (kind === "taken") pokeTaken(seat);
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-white/15" /> Taken
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-[#ffc94a]" /> Me
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-[#ff2d78]" /> Available
        </span>
      </div>
    </div>
  );
}

function SeatCell({
  seat,
  row,
  aisleBefore,
  kind,
  bubble,
  bubbleKey,
  onClick,
}: {
  seat: string;
  row: number;
  aisleBefore: boolean;
  kind: "his" | "free" | "taken";
  bubble: string | null;
  bubbleKey: number;
  onClick: (button: HTMLButtonElement) => void;
}) {
  return (
    <>
      {aisleBefore && (
        <span className="flex items-center justify-center font-mono text-[10px] text-white/30">
          {row}
        </span>
      )}
      <button
        type="button"
        onClick={(event) => onClick(event.currentTarget)}
        aria-label={
          kind === "his"
            ? `Seat ${seat}, my seat`
            : kind === "free"
              ? `Seat ${seat}, available`
              : `Seat ${seat}, taken`
        }
        className={cn(
          "group relative h-11 rounded-t-xl rounded-b-md text-[10px] font-bold transition",
          kind === "taken" && "bg-white/15 text-white/40 hover:bg-white/20 active:scale-95",
          kind === "his" && "cursor-default bg-[#ffc94a] text-[#2a1a00]",
          kind === "free" &&
            "animate-[seat-pulse_1.4s_ease-in-out_infinite] bg-[#ff2d78] text-white shadow-[0_0_24px_rgba(255,45,120,0.6)] hover:scale-110",
        )}
      >
        {kind === "his" ? (
          <>
            <span className="group-hover:hidden">ME</span>
            <span className="hidden text-base group-hover:inline-block group-hover:animate-[wave_0.6s_ease-in-out_infinite]">
              👋
            </span>
          </>
        ) : kind === "free" ? (
          <span className="text-base">♥</span>
        ) : (
          "✕"
        )}
        {bubble && (
          <span
            key={bubbleKey}
            aria-hidden="true"
            className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 animate-[bubble-pop_1.6s_ease-out_forwards] rounded-full bg-white px-1.5 py-1 text-xl shadow-lg"
          >
            {bubble}
          </span>
        )}
      </button>
    </>
  );
}
