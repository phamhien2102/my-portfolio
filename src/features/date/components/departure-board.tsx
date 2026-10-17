"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { DEPARTURES } from "../data";
import { playSound } from "../lib/sound";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TICK_MS = 45;
const FLIPS = 9;

/** Một ô lật. Mỗi khi ký tự đích đổi, ô lật qua vài ký tự rồi mới dừng, kèm tiếng lách cách. */
function FlapChar({ target, delay }: { target: string; delay: number }) {
  const [shown, setShown] = useState(" ");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || target === " ") {
      const id = window.setTimeout(() => setShown(target), delay * TICK_MS);
      return () => window.clearTimeout(id);
    }
    let flips = 0;
    let interval = 0;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        flips += 1;
        playSound("flap");
        if (flips >= FLIPS) {
          setShown(target);
          window.clearInterval(interval);
          return;
        }
        setShown(CHARSET[(flips * 7 + delay * 3) % CHARSET.length]);
      }, TICK_MS);
    }, delay * TICK_MS);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [target, delay]);

  return (
    <span className="relative inline-flex h-[1.6em] w-[0.95em] items-center justify-center overflow-hidden rounded-[2px] bg-[#16181d] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)] [perspective:200px]">
      <span key={shown} className="flap-in inline-block">
        {shown}
      </span>
      <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
    </span>
  );
}

function FlapCells({ text, width, delay }: { text: string; width: number; delay: number }) {
  return (
    <span aria-hidden="true" className="flex shrink-0 gap-px">
      {Array.from(text.padEnd(width, " ").slice(0, width)).map((char, index) => (
        <FlapChar key={index} target={char} delay={delay + index} />
      ))}
    </span>
  );
}

const COLUMNS = [
  ["FLIGHT", 5],
  ["DESTINATION", 14],
  ["STATUS", 6],
] as const;

/** Bảng giờ khởi hành kiểu ô lật: mọi chuyến đều huỷ, trừ chuyến đi hẹn hò. Dòng cuối hiện tên đang gõ. */
export function DepartureBoard({
  passenger,
  onRowClick,
}: {
  passenger: string;
  onRowClick: (announcement: string) => void;
}) {
  const [shaking, setShaking] = useState<string | null>(null);
  const paxName = passenger.replace(/[^A-Z0-9 ]/g, "");

  const poke = (flight: string, announcement: string, open: boolean) => {
    if (!open) {
      playSound("buzz");
      setShaking(flight);
      window.setTimeout(() => setShaking(null), 450);
    }
    onRowClick(announcement);
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-[#0a0b0e] p-3 font-mono text-[11px] font-bold text-[#ffc94a] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5 sm:p-5 sm:text-lg">
      <div className="mx-auto w-fit">
        <div className="mb-2 flex gap-[0.55em] tracking-[0.2em] text-white/40">
          {COLUMNS.map(([label, cells]) => (
            <span
              key={label}
              className="shrink-0"
              style={{ width: `calc(${cells} * 0.95em + ${cells - 1}px)` }}
            >
              <span className="text-[0.65em]">{label}</span>
            </span>
          ))}
        </div>
        <ul className="flex flex-col gap-1.5" aria-label="Departures board">
          {DEPARTURES.map((row, rowIndex) => (
            <li key={row.flight}>
              <button
                type="button"
                onClick={() => poke(row.flight, row.pa, row.open)}
                aria-label={`${row.flight} to ${row.destination}, ${row.status}`}
                className={cn(
                  "flex gap-[0.55em] rounded-sm text-left transition hover:brightness-125",
                  shaking === row.flight && "animate-[row-shake_0.45s_ease-in-out]",
                )}
              >
                <FlapCells text={row.flight} width={5} delay={rowIndex * 6} />
                <FlapCells text={row.destination} width={14} delay={rowIndex * 6 + 5} />
                <span
                  className={cn(
                    row.open ? "text-[#5cff9d]" : "text-[#ff5c5c]",
                    row.open && "animate-[board-blink_1.2s_steps(2)_2.5s_infinite]",
                  )}
                >
                  <FlapCells text={row.status} width={6} delay={rowIndex * 6 + 19} />
                </span>
              </button>
            </li>
          ))}
          <li
            aria-label={`Now checking in: ${paxName || "nobody yet"}`}
            className="mt-2 flex gap-[0.55em] border-t border-dashed border-white/10 pt-3 text-white"
          >
            <span className="text-white/50">
              <FlapCells text="PAX" width={5} delay={30} />
            </span>
            <FlapCells text={paxName || "TYPE YOUR NAME"} width={14} delay={0} />
            <span className={paxName ? "text-[#5cff9d]" : "text-white/40"}>
              <FlapCells text={paxName ? "READY" : "WAIT"} width={6} delay={0} />
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
