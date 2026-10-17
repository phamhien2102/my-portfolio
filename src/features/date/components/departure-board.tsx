"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { BOARD_PA, DEPARTURES, SECRET_FLIGHT, type SceneName } from "../data";
import { playSound } from "../lib/sound";
import { usePilot } from "../lib/pilot";

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

/** Ngón tay nhấp nhấp chỉ chỗ cần bấm, kèm vòng sóng ở đầu ngón. */
function TapHint() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-[55%] left-[42%] z-10 flex flex-col items-center"
    >
      <span className="absolute top-0 size-6 -translate-y-1/2 animate-ping rounded-full bg-white/40" />
      <span className="animate-[tap-hint_1.1s_ease-in-out_infinite] text-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] sm:text-3xl">
        👆
      </span>
    </span>
  );
}

const STATUS_CELLS = 7;
/** Đủ chỗ cho "A DATE WITH RAYMOND" (19 ký tự). */
const DESTINATION_CELLS = 19;
const COLUMNS = [
  ["FLIGHT", 5],
  ["DESTINATION", DESTINATION_CELLS],
  ["STATUS", STATUS_CELLS],
] as const;

/** Chờ một nhịp sau khi chuyến cuối cùng bị huỷ rồi mới lật ra chuyến bí mật. */
const REVEAL_DELAY_MS = 1400;

/**
 * Bảng giờ khởi hành kiểu ô lật. Lúc đầu trông như sân bay bình thường; em bấm chuyến nào thì
 * chuyến đó bị huỷ với một câu đùa riêng. Tự tay huỷ hết thì dòng trống cuối lật ra chuyến hẹn hò.
 * Dòng PAX ở dưới hiện tên đang gõ.
 */
export function DepartureBoard({
  passenger,
  picked,
  onAnnounce,
  onProgress,
  onPickOpen,
  onPreview,
}: {
  passenger: string;
  /** Đã chọn chuyến bí mật chưa, để làm sáng dòng đó. */
  picked: boolean;
  onAnnounce: (announcement: string) => void;
  /** Báo số chuyến đã bị huỷ, và chuyến bí mật đã lộ ra chưa. */
  onProgress: (cancelled: number, revealed: boolean) => void;
  /** Bấm vào chuyến bí mật: đưa em xuống ô check-in. */
  onPickOpen: () => void;
  /** Bấm một chuyến chưa huỷ: cho nền hiện cảnh nơi đó trước khi chuyến bị huỷ. */
  onPreview: (scene: SceneName) => void;
}) {
  const pilot = usePilot();
  const [shaking, setShaking] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const timers = useRef<number[]>([]);
  const paxName = passenger.replace(/[^A-Z0-9 ]/g, "");

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const later = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  const shake = (flight: string) => {
    setShaking(flight);
    later(450, () => setShaking(null));
  };

  const poke = (row: (typeof DEPARTURES)[number]) => {
    playSound("buzz");
    shake(row.flight);
    if (cancelled.includes(row.flight)) {
      onAnnounce(revealed ? BOARD_PA.stillCancelled : BOARD_PA.alreadyCancelled);
      return;
    }

    const next = [...cancelled, row.flight];
    setCancelled(next);
    onPreview(row.scene);
    onAnnounce(row.cancel);
    onProgress(next.length, false);

    // Em tự tay huỷ hết rồi: dòng trống cuối bảng lật ra chuyến hẹn hò.
    if (next.length === DEPARTURES.length) {
      later(REVEAL_DELAY_MS, () => {
        playSound("sparkle");
        setRevealed(true);
        onProgress(next.length, true);
        onAnnounce(BOARD_PA.revealed);
      });
    }
  };

  // Ngón tay hướng dẫn: chỉ vào chuyến kế tiếp cần bấm; lộ chuyến bí mật thì chỉ vào đó.
  const hintFlight = revealed
    ? picked
      ? null
      : SECRET_FLIGHT.flight
    : cancelled.length < DEPARTURES.length
      ? (DEPARTURES.find((row) => !cancelled.includes(row.flight))?.flight ?? null)
      : null;

  const pickSecret = () => {
    playSound("blip");
    onAnnounce(BOARD_PA.picked);
    onPickOpen();
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl bg-[#0a0b0e] px-2 py-3 font-mono text-[9px] font-bold text-[#ffc94a] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/5 min-[400px]:px-3 min-[400px]:text-[10px] sm:p-5 sm:text-lg">
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
          {DEPARTURES.map((row, rowIndex) => {
            const isCancelled = cancelled.includes(row.flight);
            const status = isCancelled ? "CANCEL" : row.status;
            return (
              <li key={row.flight} className="relative">
                {hintFlight === row.flight && <TapHint />}
                <button
                  type="button"
                  onClick={() => poke(row)}
                  aria-label={`${row.flight} to ${row.destination}, ${status}`}
                  className={cn(
                    "flex gap-[0.55em] rounded-sm text-left transition hover:brightness-125",
                    shaking === row.flight && "animate-[row-shake_0.45s_ease-in-out]",
                    isCancelled && "opacity-70",
                  )}
                >
                  <FlapCells text={row.flight} width={5} delay={rowIndex * 6} />
                  <FlapCells
                    text={row.destination}
                    width={DESTINATION_CELLS}
                    delay={rowIndex * 6 + 5}
                  />
                  <span className={isCancelled ? "text-[#ff5c5c]" : "text-white"}>
                    <FlapCells
                      text={status}
                      width={STATUS_CELLS}
                      // Đã chạy hiệu ứng mở màn rồi thì lật ngay khi bị huỷ.
                      delay={isCancelled ? 0 : rowIndex * 6 + 19}
                    />
                  </span>
                </button>
              </li>
            );
          })}

          {/* Dòng trống cuối bảng: chỉ lật ra chuyến hẹn hò sau khi mọi chuyến khác bị huỷ. */}
          <li className="relative">
            {hintFlight === SECRET_FLIGHT.flight && <TapHint />}
            {revealed ? (
              <button
                type="button"
                onClick={pickSecret}
                aria-pressed={picked}
                aria-label={`${SECRET_FLIGHT.flight} to ${pilot.say(SECRET_FLIGHT.destination)}, ${SECRET_FLIGHT.status}`}
                className={cn(
                  "flex gap-[0.55em] rounded-sm text-left transition hover:brightness-125",
                  picked
                    ? "shadow-[0_0_18px_rgba(92,255,157,0.45)] ring-2 ring-[#5cff9d] ring-offset-2 ring-offset-[#0a0b0e]"
                    : "animate-[seat-pulse_1.4s_ease-in-out_infinite]",
                )}
              >
                <FlapCells text={SECRET_FLIGHT.flight} width={5} delay={0} />
                <FlapCells
                  text={pilot.say(SECRET_FLIGHT.destination)}
                  width={DESTINATION_CELLS}
                  delay={3}
                />
                <span className="animate-[board-blink_1.2s_steps(2)_1.5s_infinite] text-[#5cff9d]">
                  <FlapCells text={SECRET_FLIGHT.status} width={STATUS_CELLS} delay={10} />
                </span>
              </button>
            ) : (
              <span aria-hidden="true" className="flex gap-[0.55em] opacity-60">
                <FlapCells text="" width={5} delay={0} />
                <FlapCells text="" width={DESTINATION_CELLS} delay={0} />
                <FlapCells text="" width={STATUS_CELLS} delay={0} />
              </span>
            )}
          </li>

          <li
            aria-label={`Now checking in: ${paxName || "nobody yet"}`}
            className="mt-2 flex gap-[0.55em] border-t border-dashed border-white/10 pt-3 text-white"
          >
            <span className="text-white/50">
              <FlapCells text="PAX" width={5} delay={30} />
            </span>
            <FlapCells text={paxName || "TYPE YOUR NAME"} width={DESTINATION_CELLS} delay={0} />
            <span className={paxName ? "text-[#5cff9d]" : "text-white/40"}>
              <FlapCells text={paxName ? "READY" : "WAIT"} width={STATUS_CELLS} delay={0} />
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
