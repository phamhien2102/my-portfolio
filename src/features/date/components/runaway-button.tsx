"use client";

import { useRef, useState, type RefObject, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";

import { RUNAWAY_LINES } from "../data";
import { playSound } from "../lib/sound";

/** Khoá ngắn sau mỗi lần chạy, để nút không nhảy liên tục theo từng khung hình. */
const FLEE_GAP_MS = 220;
/** Phải chạy đủ xa, nhảy một chút thì nhìn như không có gì xảy ra. */
const MIN_FLEE_PX = 160;
/** Chừa lề trên và dưới màn hình để nút không chui vào sau thanh địa chỉ trên điện thoại. */
const EDGE_PX = 16;
const EDGE_Y_PX = 72;

interface Spot {
  x: number;
  y: number;
  tilt: number;
}

const BUTTON_CLASS =
  "rounded-xl border border-white/20 bg-white/[0.03] px-6 py-3 font-semibold whitespace-nowrap";

/**
 * Nút Alone nhát gan: chuột lại gần hoặc ngón tay chạm vào là nó nhảy sang chỗ khác trên màn hình.
 * Chạy hết số câu trong RUNAWAY_LINES thì nó biến mất trong một làn khói.
 */
export function RunawayButton({
  avoid,
  onDodge,
  onGiveUp,
}: {
  /** Nút không được nhảy đè lên nút này. */
  avoid: RefObject<HTMLButtonElement | null>;
  onDodge: (count: number) => void;
  onGiveUp: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const lastFlee = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [spot, setSpot] = useState<Spot | null>(null);
  const [gone, setGone] = useState(false);

  const flee = (event: SyntheticEvent<HTMLButtonElement>) => {
    // Trên điện thoại pointerenter đến cùng lúc với pointerdown, chỉ cần xử lý một lần.
    if (event.type === "pointerenter" && "pointerType" in event && event.pointerType === "touch") {
      return;
    }
    event.preventDefault();
    const now = performance.now();
    if (now - lastFlee.current < FLEE_GAP_MS) return;
    lastFlee.current = now;

    const button = ref.current;
    if (!button) return;
    const box = button.getBoundingClientRect();
    const next = dodges + 1;

    if (next >= RUNAWAY_LINES.length) {
      playSound("poof");
      setSpot({ x: box.left, y: box.top, tilt: 0 });
      setGone(true);
      onGiveUp();
      return;
    }

    const avoidBox = avoid.current?.getBoundingClientRect();
    const maxX = Math.max(EDGE_PX, window.innerWidth - box.width - EDGE_PX);
    const maxY = Math.max(EDGE_Y_PX, window.innerHeight - box.height - EDGE_Y_PX);
    let x = EDGE_PX;
    let y = EDGE_Y_PX;
    for (let attempt = 0; attempt < 24; attempt++) {
      x = EDGE_PX + Math.random() * (maxX - EDGE_PX);
      y = EDGE_Y_PX + Math.random() * (maxY - EDGE_Y_PX);
      if (Math.hypot(x - box.left, y - box.top) < MIN_FLEE_PX) continue;
      const hitsAvoid =
        avoidBox &&
        x < avoidBox.right + 24 &&
        x + box.width > avoidBox.left - 24 &&
        y < avoidBox.bottom + 24 &&
        y + box.height > avoidBox.top - 24;
      if (!hitsAvoid) break;
    }
    const target = { x, y, tilt: (Math.random() - 0.5) * 24 };

    playSound("boing");
    setDodges(next);
    onDodge(next);
    if (spot) {
      setSpot(target);
    } else {
      // Lần đầu: ghim nút đúng chỗ cũ trước, khung hình sau mới cho trượt đi, để có hiệu ứng chạy.
      setSpot({ x: box.left, y: box.top, tilt: 0 });
      requestAnimationFrame(() => requestAnimationFrame(() => setSpot(target)));
    }
  };

  const scale = Math.max(0.6, 1 - dodges * 0.06);

  const poof = gone && spot && (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed z-50 animate-[poof_0.7s_ease-out_forwards] text-4xl"
      style={{ left: spot.x, top: spot.y }}
    >
      💨
    </span>
  );

  const button = !gone && (
    <button
      ref={ref}
      type="button"
      onPointerEnter={flee}
      onPointerDown={flee}
      onClick={flee}
      className={`${BUTTON_CLASS} touch-none text-white/80 ${spot ? "fixed z-50 bg-[#0b0f1c]/90 backdrop-blur" : ""}`}
      style={
        spot
          ? {
              left: spot.x,
              top: spot.y,
              transform: `rotate(${spot.tilt}deg) scale(${scale})`,
              transition:
                "left 0.32s cubic-bezier(.34,1.56,.64,1), top 0.32s cubic-bezier(.34,1.56,.64,1), transform 0.32s ease-out",
            }
          : undefined
      }
    >
      {RUNAWAY_LINES[dodges]}
    </button>
  );

  // Khung bước đang có transform, mà transform làm position: fixed tính theo khung đó thay vì
  // theo màn hình. Vì vậy khi đã chạy, nút được đưa thẳng ra body.
  if (!spot) return button;
  return createPortal(poof || button, document.body);
}
