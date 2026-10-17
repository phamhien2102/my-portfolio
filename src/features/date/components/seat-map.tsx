"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

import {
  CAPTAIN_NAME,
  FREE_SEATS,
  PLOT_TWIST_PA,
  SEAT_LETTERS,
  SEAT_OCCUPANTS,
  SEAT_ROWS,
} from "../data";
import { playSound } from "../lib/sound";
import { PlotTwistScene } from "./chibi-scenes";
import { HeartBurst } from "./heart-burst";

const GRID = "grid grid-cols-[repeat(2,2.75rem)_1.5rem_repeat(2,2.75rem)] gap-2";
/** Thời gian hồi hộp trước khi lộ ra ai ngồi bên cạnh. */
const SUSPENSE_MS = 1300;

type SeatKind = "taken" | "free" | "you" | "mystery" | "me";
type Phase = "browsing" | "suspense" | "revealed";

/** Ghế cùng cặp bên cạnh: A với B, C với D (lối đi nằm giữa B và C). */
function partnerOf(seat: string) {
  const row = seat.slice(0, -1);
  const index = SEAT_LETTERS.indexOf(seat.slice(-1) as (typeof SEAT_LETTERS)[number]);
  return `${row}${SEAT_LETTERS[index ^ 1]}`;
}

/**
 * Sơ đồ ghế có cú lừa: trông như ngồi đâu cũng được, nhưng chọn xong thì ghế bên cạnh
 * lật lại và hoá ra là anh.
 */
export function SeatMap({
  onPick,
  onPokeMany,
  onAnnounce,
}: {
  onPick: (seat: string, partner: string) => void;
  /** Gọi khi em bấm vào ghế có người tới lần thứ ba. */
  onPokeMany: () => void;
  onAnnounce: (text: string) => void;
}) {
  const [pokes, setPokes] = useState(0);
  const [poked, setPoked] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("browsing");
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);

  const partner = picked ? partnerOf(picked) : null;
  const occupant = SEAT_OCCUPANTS[Math.max(0, pokes - 1) % SEAT_OCCUPANTS.length];

  const pokeTaken = (seat: string) => {
    playSound("buzz");
    setPoked(seat);
    setPokes(pokes + 1);
    if (pokes + 1 === 3) onPokeMany();
  };

  const pickFree = (seat: string) => {
    setPicked(seat);
    setPhase("suspense");
    playSound("blip");
    window.setTimeout(() => {
      setPhase("revealed");
      playSound("boing");
      window.setTimeout(() => playSound("sparkle"), 180);
      const neighbour = document.querySelector(`[data-seat="${partnerOf(seat)}"]`);
      if (neighbour) {
        const box = neighbour.getBoundingClientRect();
        setBurst({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
      }
      onAnnounce(PLOT_TWIST_PA);
    }, SUSPENSE_MS);
  };

  const kindOf = (seat: string): SeatKind => {
    if (seat === picked) return "you";
    if (seat === partner) return phase === "revealed" ? "me" : "mystery";
    return FREE_SEATS.includes(seat) ? "free" : "taken";
  };

  const caption =
    phase === "revealed"
      ? "Plot twist: the seat next to you was booked by me. 😘"
      : phase === "suspense"
        ? "Checking who's sitting next to you…"
        : poked
          ? `Seat ${poked}: ${occupant.line}`
          : "Plenty of free seats tonight. Sit wherever you like.";

  return (
    <div className="flex flex-col items-center">
      {burst && <HeartBurst x={burst.x} y={burst.y} count={140} />}
      {phase === "revealed" ? (
        // Lộ ra rồi thì để hình chibi nói thay chữ; câu chữ vẫn có cho trình đọc màn hình.
        <>
          <p aria-live="polite" className="sr-only">
            {caption}
          </p>
          <PlotTwistScene />
        </>
      ) : (
        <p aria-live="polite" className="min-h-[3em] max-w-sm text-center text-sm text-white/70">
          {caption}
        </p>
      )}

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
        <div
          className={cn(
            "relative rounded-t-[6rem] rounded-b-3xl border border-white/10 px-6 pt-16 pb-6 shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-colors duration-700",
            phase === "browsing" ? "bg-[#0d1220]/90" : "bg-[#05070d]",
          )}
        >
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
                  const kind = kindOf(seat);
                  return (
                    <SeatCell
                      key={seat}
                      seat={seat}
                      row={row}
                      aisleBefore={index === 2}
                      kind={kind}
                      // Đèn cabin tắt, chỉ còn hai ghế được chiếu sáng.
                      dimmed={
                        phase !== "browsing" &&
                        kind !== "you" &&
                        kind !== "mystery" &&
                        kind !== "me"
                      }
                      kickedOut={kind === "me" && !FREE_SEATS.includes(seat)}
                      bubble={poked === seat && phase === "browsing" ? occupant.icon : null}
                      bubbleKey={pokes}
                      onClick={() => {
                        if (phase !== "browsing") return;
                        if (kind === "free") pickFree(seat);
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

      {phase === "revealed" && picked && partner ? (
        <button
          type="button"
          onClick={() => {
            playSound("blip");
            onPick(picked, partner);
          }}
          className="step-in mt-6 rounded-xl bg-gradient-to-r from-[#ff2d78] to-[#ff5c9a] px-6 py-3 font-bold text-white shadow-[0_10px_30px_rgba(255,45,120,0.4)] transition hover:-translate-y-0.5 hover:brightness-110"
        >
          Fine, I’ll sit with you ✈
        </button>
      ) : (
        <div className="mt-4 flex gap-4 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-white/15" /> Taken
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-[#5cc8ff]" /> Available
          </span>
        </div>
      )}
    </div>
  );
}

function SeatCell({
  seat,
  row,
  aisleBefore,
  kind,
  dimmed,
  kickedOut,
  bubble,
  bubbleKey,
  onClick,
}: {
  seat: string;
  row: number;
  aisleBefore: boolean;
  kind: SeatKind;
  dimmed: boolean;
  kickedOut: boolean;
  bubble: string | null;
  bubbleKey: number;
  onClick: () => void;
}) {
  const labels: Record<SeatKind, string> = {
    taken: `Seat ${seat}, taken`,
    free: `Seat ${seat}, available`,
    you: `Seat ${seat}, your seat`,
    mystery: `Seat ${seat}, someone is sitting here`,
    me: `Seat ${seat}, my seat`,
  };

  return (
    <>
      {aisleBefore && (
        <span className="flex items-center justify-center font-mono text-[10px] text-white/30">
          {row}
        </span>
      )}
      <button
        type="button"
        data-seat={seat}
        onClick={onClick}
        aria-label={labels[kind]}
        className={cn(
          "relative h-11 rounded-t-xl rounded-b-md text-[10px] font-bold transition duration-500",
          dimmed && "opacity-20",
          kind === "taken" && "bg-white/15 text-white/40 hover:bg-white/20 active:scale-95",
          kind === "free" &&
            "bg-[#5cc8ff]/80 text-[#04202e] shadow-[0_0_14px_rgba(92,200,255,0.35)] hover:scale-110 hover:bg-[#5cc8ff]",
          kind === "you" &&
            "scale-110 bg-[#ff2d78] text-white shadow-[0_0_28px_rgba(255,45,120,0.8)]",
          kind === "mystery" &&
            "animate-[row-shake_0.45s_ease-in-out_infinite] bg-white/30 text-white",
          kind === "me" &&
            "scale-110 animate-[seat-flip_0.7s_ease-out] bg-[#ffc94a] text-[#2a1a00] shadow-[0_0_28px_rgba(255,201,74,0.8)]",
        )}
      >
        {kind === "you" ? (
          "YOU"
        ) : kind === "mystery" ? (
          <span className="text-base">?</span>
        ) : kind === "me" ? (
          <span className="text-[11px] leading-none">
            ME
            <br />
            😘
          </span>
        ) : kind === "free" ? (
          ""
        ) : (
          "✕"
        )}
        {/* Ghế lật xong thì bật tooltip tên anh, hiện luôn chứ không cần rê chuột. */}
        {kind === "me" && (
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2.5 -translate-x-1/2 animate-[tooltip-in_0.45s_0.65s_cubic-bezier(.3,1.6,.6,1)_both] rounded-lg bg-white px-2.5 py-1 font-sans text-xs font-extrabold whitespace-nowrap text-[#1d1500] shadow-[0_8px_24px_rgba(255,201,74,0.45)]"
          >
            {CAPTAIN_NAME} 👋
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-white"
            />
          </span>
        )}
        {kickedOut && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 animate-[poof_0.9s_ease-out_forwards] text-2xl"
          >
            💨
          </span>
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
