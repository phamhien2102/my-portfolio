import Link from "next/link";

import { THEME } from "@/config/theme";
import { BugRunner } from "./bug-runner";

/**
 * Trang 404: số 404 nhỏ giọt với số 0 là trái tim đập, và một mini game né bug để người xem
 * chơi trong lúc ở đây. Máy bay nhỏ bay ngang trời.
 */
export function NotFoundView() {
  return (
    <main
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 py-16 text-zinc-100"
      style={{ background: THEME.background }}
    >
      <div
        aria-hidden="true"
        // Nền tối phẳng như trang chủ, chỉ có lưới mờ kiểu gallery, đậm ở giữa và nhạt dần ra mép.
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 70%)",
        }}
      />

      {/* Máy bay nhỏ bay ngang trời, kéo theo vệt nét đứt. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[14%] left-0 flex items-center gap-1 text-zinc-500 motion-reduce:hidden"
        style={{ animation: "nf-plane 14s linear infinite" }}
      >
        <span className="h-px w-16 border-t border-dashed border-zinc-600" />
        <span className="text-xl">✈</span>
      </div>

      <h1 className="sr-only">404: page not found</h1>
      <p
        aria-hidden="true"
        className="relative flex items-center text-[5rem] leading-none sm:text-[7rem]"
        style={{ fontFamily: "var(--font-hero-drip)", color: THEME.palette[0] }}
      >
        <span className="motion-safe:animate-[nf-glitch_4s_steps(1)_infinite]">4</span>
        <span
          className="mx-1 inline-block text-[0.78em] motion-safe:animate-[nf-beat_1.2s_ease-in-out_infinite]"
          style={{ color: THEME.palette[12] }}
        >
          ♥
        </span>
        <span className="motion-safe:animate-[nf-glitch_4s_0.3s_steps(1)_infinite]">4</span>
      </p>

      <p className="relative mt-4 font-mono text-xs tracking-[0.35em] text-zinc-500">
        ERROR 404 · PAGE NOT FOUND
      </p>
      <h2 className="relative mt-3 max-w-xl text-center text-3xl font-black tracking-tight text-balance sm:text-4xl">
        Oops, this page got lost.
      </h2>
      <p className="relative mt-2 text-center text-sm text-zinc-400">
        Dodge some bugs while you&apos;re here.
      </p>

      <div className="relative mt-8 w-full max-w-2xl">
        <BugRunner />
      </div>

      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:opacity-85"
        >
          ← Back home
        </Link>
      </div>

      <style>{`
        @keyframes nf-plane { from { transform: translateX(-20vw); } to { transform: translateX(120vw); } }
        @keyframes nf-beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.18); } 30% { transform: scale(0.96); } 45% { transform: scale(1.1); } }
        @keyframes nf-glitch {
          0%, 92%, 100% { transform: none; text-shadow: none; }
          93% { transform: translate(-4px, 2px); text-shadow: 4px 0 #00c4ff, -4px 0 #ff2d95; }
          95% { transform: translate(3px, -2px); text-shadow: -3px 0 #00c4ff, 3px 0 #ff2d95; }
        }
      `}</style>
    </main>
  );
}
