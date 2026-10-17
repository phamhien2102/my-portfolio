"use client";

import { useRef, useState, type PointerEvent } from "react";

import { cn } from "@/lib/cn";

import { playSound } from "../lib/sound";

/**
 * Câu trên bong bóng sau mỗi lần nút né. Né tới câu cuối thì nút chịu thua và đứng yên cho bấm,
 * nên số lần né bằng số câu.
 */
const DEFAULT_DODGE_TIPS = ["Nope, not yet 😏", "Too slow!", "Fine. Click me, I'm tired 😮‍💨"];
/** Khoá ngắn giữa hai lần né, để nút không nhảy liên tục theo từng khung hình. */
const DODGE_GAP_MS = 250;
/** Nút phải chạy xa ít nhất chừng này, nhảy một chút thì nhìn như không có gì. */
const MIN_JUMP_PX = 90;

/**
 * Nút "Check all": bật lên kèm bong bóng nhắc, viền vàng phát sáng theo nhịp.
 * Mấy lần đầu nó né tay em trong phạm vi khung lịch, rồi mới chịu đứng yên cho bấm.
 */
export function CheckAllButton({
  onClick,
  busy,
  label,
  busyLabel,
  tip,
  dodgeTips = DEFAULT_DODGE_TIPS,
}: {
  onClick: () => void;
  busy: boolean;
  label: string;
  busyLabel: string;
  tip: string;
  /** Câu sau mỗi lần né; câu cuối hiện khi nút chịu đứng yên. */
  dodgeTips?: readonly string[];
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const lastDodge = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const tired = dodges >= dodgeTips.length;
  const bubble = dodges === 0 ? tip : dodgeTips[dodges - 1];

  const dodge = (event: PointerEvent<HTMLButtonElement>) => {
    if (tired || busy) return;
    // Trên điện thoại pointerenter đi cùng pointerdown, chỉ cần xử lý một lần.
    if (event.type === "pointerenter" && event.pointerType === "touch") return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastDodge.current < DODGE_GAP_MS) return;
    lastDodge.current = now;

    const area = areaRef.current?.getBoundingClientRect();
    const button = buttonRef.current?.getBoundingClientRect();
    if (!area || !button) return;
    // Khoảng nút có thể chạy sang hai bên, tính từ vị trí giữa ban đầu.
    const maxX = Math.max(0, (area.width - button.width) / 2 - 8);
    let next = offset;
    for (let attempt = 0; attempt < 12; attempt++) {
      next = { x: (Math.random() * 2 - 1) * maxX, y: (Math.random() * 2 - 1) * 28 };
      if (Math.hypot(next.x - offset.x, next.y - offset.y) >= Math.min(MIN_JUMP_PX, maxX)) break;
    }
    playSound("boing");
    // Cú chạm vừa làm nút né cũng sinh ra một click ngay sau đó; đừng tính click đó là bấm thật.
    lastDodge.current = now;
    setOffset(next);
    setDodges(dodges + 1);
  };

  return (
    <div
      ref={areaRef}
      className="mt-14 flex w-full max-w-md animate-[check-all-in_0.55s_cubic-bezier(.3,1.6,.6,1)_both] flex-col items-center"
    >
      <div
        ref={buttonRef}
        className="relative transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transition-none"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        {!busy && (
          <span
            key={bubble}
            role="tooltip"
            className="absolute bottom-full left-1/2 mb-3 w-max max-w-[16rem] -translate-x-1/2 rounded-xl bg-white px-3 py-2 text-center text-xs font-semibold text-[#1d1500] shadow-[0_8px_24px_rgba(0,0,0,0.4)] [text-shadow:none] motion-safe:animate-[tip-bob_1.8s_ease-in-out_infinite]"
          >
            {bubble}
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-white"
            />
          </span>
        )}
        <button
          type="button"
          onPointerEnter={dodge}
          onPointerDown={dodge}
          onClick={(event) => {
            const sameGesture = performance.now() - lastDodge.current < 500;
            if (!tired || sameGesture) {
              event.preventDefault();
              return;
            }
            onClick();
          }}
          disabled={busy}
          className={cn(
            "touch-none rounded-xl border border-[#ffc94a] bg-[#0b0f1c]/90 px-5 py-2.5 text-sm font-bold whitespace-nowrap text-[#ffe3a3] backdrop-blur-md transition hover:bg-[#1a1608]/90 disabled:pointer-events-none disabled:opacity-60 motion-safe:animate-[check-all-glow_1.6s_ease-in-out_infinite]",
          )}
        >
          {busy ? busyLabel : label}
        </button>
      </div>
    </div>
  );
}
