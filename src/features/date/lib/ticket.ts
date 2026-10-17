import type { Destination } from "../data";

export interface Ticket {
  passenger: string;
  destination: Destination;
  dateLabel: string;
  time: string;
  seat: string;
  /** Ghế của anh, ngay cạnh ghế em. */
  partnerSeat: string;
}

export const FLIGHT = "HH143";

/** Giờ anh có mặt: 20 phút trước giờ cất cánh. */
export function pickupTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes - 20;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Vạch mã vạch sinh từ nội dung vé, cùng vé thì cùng vạch. Toạ độ nằm trong khung rộng 220. */
export function barcodeBars(ticket: Ticket) {
  let state = 0;
  for (const char of `${ticket.passenger}${FLIGHT}${ticket.seat}${ticket.time}`) {
    state = (state * 31 + char.charCodeAt(0)) >>> 0;
  }
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
