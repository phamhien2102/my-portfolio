"use client";

import { useEffect, useRef } from "react";

/**
 * Đường bay của máy bay trong màn chờ, khung 400 × 160. Bắt đầu bên trong khung,
 * để ngay khung hình đầu tiên máy bay đã nằm trên đường bay.
 */
const FLIGHT_PATH = "M 30 130 C 110 130, 130 40, 210 50 S 330 110, 375 40";
const START = { x: 30, y: 130 };

/** Chậm lúc đầu và lúc cuối, nhanh ở giữa, giống máy bay cất cánh rồi hạ dần. */
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const BOOT_MS = 4000;
export const BOOT_REDUCED_MS = 600;

/**
 * Màn chờ khi vừa vào /dating: máy bay bay theo đường cong nét đứt trên trời đêm, đèn đường băng
 * nhấp nháy, thanh tiến trình chạy dần. Xong mới soát link rồi hiện màn chào hoặc trang lỗi.
 */
export function BootScreen() {
  const trailRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);

  // Dời máy bay theo từng điểm trên đường bay và vẽ vệt khói tới đúng chỗ đó,
  // mũi máy bay xoay theo hướng bay.
  useEffect(() => {
    const trail = trailRef.current;
    const plane = planeRef.current;
    if (!trail || !plane) return;
    const length = trail.getTotalLength();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? BOOT_REDUCED_MS : BOOT_MS;
    let frame = 0;
    const start = performance.now();

    const place = (progress: number) => {
      const at = length * progress;
      const point = trail.getPointAtLength(at);
      const ahead = trail.getPointAtLength(Math.min(length, at + 1));
      const behind = trail.getPointAtLength(Math.max(0, at - 1));
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      plane.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
      trail.style.strokeDashoffset = String(1 - progress);
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      place(easeInOut(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#070a12] px-6 text-[#f4f1ea]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(255,201,74,0.18), transparent 55%), radial-gradient(ellipse at 50% 120%, rgba(255,45,120,0.25), transparent 50%)",
        }}
      />

      <svg
        viewBox="0 0 400 160"
        className="relative w-[min(90vw,520px)] overflow-visible"
        aria-hidden="true"
      >
        <path
          d={FLIGHT_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={2}
          strokeDasharray="6 8"
        />
        {/* Vệt khói hồng vẽ dần theo máy bay. */}
        <path
          ref={trailRef}
          d={FLIGHT_PATH}
          pathLength={1}
          fill="none"
          stroke="#ff8ab3"
          strokeWidth={4}
          strokeLinecap="round"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />
        {/* Đặt sẵn ở đầu đường bay; hiệu ứng ở trên dời nó dọc theo đường. */}
        <g ref={planeRef} transform={`translate(${START.x} ${START.y})`}>
          <text
            fontSize={76}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ filter: "drop-shadow(0 0 10px rgba(255,138,179,0.8))" }}
          >
            ✈
          </text>
        </g>
      </svg>

      <p className="relative mt-6 font-mono text-[11px] tracking-[0.35em] text-[#ffc94a]">
        DATE AIRWAYS · GATE 14
      </p>
      <p className="relative mt-2 text-lg font-bold">
        Checking your boarding pass
        <span className="inline-block w-6 text-left motion-safe:animate-pulse">…</span>
      </p>

      <div className="relative mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff2d78] to-[#ffc94a]"
          style={{ animation: `boot-bar ${BOOT_MS}ms ease-in-out forwards` }}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 flex justify-center gap-6 opacity-70"
      >
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-[#ffc94a] shadow-[0_0_10px_#ffc94a]"
            style={{ animation: `boot-blink 1.2s ${index * 0.1}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes boot-bar { from { width: 0%; } to { width: 100%; } }
        @keyframes boot-blink { 50% { opacity: 0.2; } }
      `}</style>
    </div>
  );
}
