"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#ff2d78", "#ff8ab3", "#ffc94a", "#fff1f6", "#ff4d6d", "#5cff9d"];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  size: number;
  color: string;
  heart: boolean;
  life: number;
}

/**
 * Pháo tim bắn ra từ một điểm trên màn hình rồi rơi xuống.
 * Mỗi lần muốn bắn lại thì đổi `key` để component chạy lại từ đầu.
 */
export function HeartBurst({ x, y, count = 90 }: { x: number; y: number; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pieces: Piece[] = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const speed = 4 + Math.random() * 9;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI,
        size: 8 + Math.random() * 12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#ff2d78",
        heart: Math.random() > 0.35,
        life: 0,
      };
    });

    let handle = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = 0;
      for (const piece of pieces) {
        piece.life += 1;
        piece.vy += 0.22;
        piece.vx *= 0.985;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.angle += piece.spin;
        if (piece.y > height + 40 || piece.life > 260) continue;
        alive += 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - piece.life / 260);
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.angle);
        ctx.fillStyle = piece.color;
        if (piece.heart) {
          ctx.font = `${piece.size}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("♥", 0, 0);
        } else {
          ctx.fillRect(-piece.size / 4, -piece.size / 8, piece.size / 2, piece.size / 4);
        }
        ctx.restore();
      }
      if (alive > 0) handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [x, y, count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
