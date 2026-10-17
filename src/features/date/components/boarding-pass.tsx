"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

import { cn } from "@/lib/cn";

import type { Destination } from "../data";
import { playSound } from "../lib/sound";

export interface Ticket {
  passenger: string;
  destination: Destination;
  dateLabel: string;
  time: string;
  seat: string;
}

/** Giờ anh có mặt: 20 phút trước giờ cất cánh. */
function pickupTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes - 20;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Vạch mã vạch sinh từ nội dung vé, cùng vé thì cùng vạch. */
function barcodeBars(seed: string) {
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;
  const bars: Array<{ x: number; w: number }> = [];
  let x = 0;
  while (x < 220) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const w = 1 + (state % 4);
    const gap = 1 + ((state >>> 8) % 3);
    bars.push({ x, w });
    x += w + gap;
  }
  return bars;
}

function Field({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold tracking-[0.18em] text-[#8a7f70] uppercase">{label}</p>
      <p
        className={cn(
          "font-mono font-bold break-words text-[#1d1a16]",
          big ? "text-2xl sm:text-3xl" : "text-sm sm:text-base",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Vé lên máy bay, có cuống để xé. */
export function BoardingPass({ ticket, onTorn }: { ticket: Ticket; onTorn: () => void }) {
  const [torn, setTorn] = useState(false);
  const [stubGone, setStubGone] = useState(false);
  const [printed, setPrinted] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const flight = "HH143";
  const bars = useMemo(
    () => barcodeBars(`${ticket.passenger}${flight}${ticket.seat}${ticket.time}`),
    [ticket.passenger, flight, ticket.seat, ticket.time],
  );

  // Máy in kêu đúng lúc vé trượt ra, in xong mới cho vé nghiêng theo tay.
  useEffect(() => {
    playSound("print");
    const id = window.setTimeout(() => setPrinted(true), 2500);
    return () => window.clearTimeout(id);
  }, []);

  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el || !printed) return;
    const box = el.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;
    el.style.setProperty("--rx", `${(px - 0.5) * 14}deg`);
    el.style.setProperty("--ry", `${(0.5 - py) * 10}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
  };

  const untilt = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--mx", "50%");
  };

  const tear = () => {
    if (torn) return;
    playSound("rip");
    setTorn(true);
    window.setTimeout(onTorn, 700);
    // Cuống rơi xong thì bỏ hẳn, để vé không chừa lại một khoảng trống.
    window.setTimeout(() => setStubGone(true), 900);
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Khe máy in: vé trượt ra từ đây. */}
      <div className="relative z-10 mx-auto h-3 w-[calc(100%+1rem)] -translate-x-2 rounded-full bg-[#05070c] shadow-[0_6px_16px_rgba(0,0,0,0.8)] ring-1 ring-white/10" />
      <div
        className={cn("-mt-1.5 px-1 pb-10 [perspective:1200px]", !printed && "overflow-hidden")}
        onPointerMove={tilt}
        onPointerLeave={untilt}
      >
        <div
          ref={tiltRef}
          className="print-out flex flex-col text-[#1d1a16] drop-shadow-[0_25px_40px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out sm:flex-row"
          style={{
            transform: printed ? "rotateX(var(--ry, 0deg)) rotateY(var(--rx, 0deg))" : undefined,
          }}
        >
          <div className="relative flex-1 overflow-hidden rounded-t-2xl bg-[#f6f1e7] p-5 sm:rounded-l-2xl sm:rounded-tr-none sm:p-6">
            {/* Lớp óng ánh chạy theo con trỏ. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              style={{
                background:
                  "linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.9) calc(var(--mx, 50%) - 8%), rgba(255,138,179,0.6) var(--mx, 50%), rgba(92,200,255,0.5) calc(var(--mx, 50%) + 8%), transparent 75%)",
              }}
            />
            <span
              aria-hidden="true"
              className="absolute top-14 right-[38%] hidden size-16 rotate-[-12deg] items-center justify-center rounded-full text-center font-mono text-[8px] leading-tight font-black tracking-wider text-white/90 shadow-inner sm:flex"
              style={{
                background:
                  "conic-gradient(from var(--holo-angle, 0deg), #ff8ab3, #ffc94a, #5cff9d, #5cc8ff, #c58aff, #ff8ab3)",
                animation: "holo-spin 6s linear infinite",
              }}
            >
              ♥<br />
              VERIFIED
              <br />
              CUTE
            </span>
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold tracking-[0.2em] text-[#ff2d78]">
                ✈ DATE AIRWAYS
              </p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#8a7f70]">BOARDING PASS</p>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-3xl font-extrabold sm:text-4xl">HOM</p>
                <p className="text-xs text-[#8a7f70]">Your place</p>
              </div>
              <div className="mb-3 flex flex-1 items-center gap-2 text-[#ff2d78]">
                <span className="h-px flex-1 border-t border-dashed border-current" />
                <span aria-hidden="true">✈</span>
                <span className="h-px flex-1 border-t border-dashed border-current" />
              </div>
              <div className="text-right">
                <p className="font-mono text-3xl font-extrabold sm:text-4xl">
                  {ticket.destination.code}
                </p>
                <p className="text-xs text-[#8a7f70]">{ticket.destination.name}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Field label="Passenger" value={ticket.passenger} />
              <Field label="Flight" value={flight} />
              <Field label="Date" value={ticket.dateLabel} />
              <Field label="Pick-up" value={pickupTime(ticket.time)} />
              <Field label="Departs" value={ticket.time} />
              <Field label="Gate" value="Your front door" />
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                <Field label="Class" value="Heart business" />
                <Field label="Booking" value="******** ✓" />
              </div>
              <svg
                aria-hidden="true"
                viewBox="0 0 220 40"
                preserveAspectRatio="none"
                className="h-10 w-32 shrink-0 sm:w-40"
              >
                {bars.map((bar) => (
                  <rect key={bar.x} x={bar.x} y={0} width={bar.w} height={40} fill="#1d1a16" />
                ))}
              </svg>
            </div>
          </div>

          {/* Đường xé: trên điện thoại là ngang, trên máy tính là dọc. */}
          <div
            aria-hidden="true"
            className="h-0 border-t-2 border-dashed border-[#d8cfbf] bg-[#f6f1e7] sm:h-auto sm:w-0 sm:border-t-0 sm:border-l-2"
          />

          <button
            type="button"
            onClick={tear}
            disabled={torn}
            aria-label="Tear off the stub"
            className={cn(
              "group relative flex flex-row items-center justify-between gap-3 rounded-b-2xl bg-[#ffe4ee] p-5 text-left sm:w-44 sm:flex-col sm:items-start sm:rounded-r-2xl sm:rounded-bl-none",
              torn && "stub-torn",
              stubGone && "hidden",
            )}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <Field label="Seat" value={ticket.seat} big />
              <Field label="Next to" value="ME · 3C" />
            </div>
            <span className="rounded-full bg-[#ff2d78] px-3 py-1.5 text-xs font-bold text-white transition group-hover:scale-105">
              ✂ Tear here
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
