"use client";

import { Chibi } from "./chibi";

/**
 * Trang "Boarding denied" cho link có tham số sai: chibi phi công giật mình, tấm hộ chiếu
 * bị đóng dấu DENIED, danh sách lỗi viết kiểu đùa, và nút quay về sân bay thật.
 */
export function InvalidLink({ problems }: { problems: string[] }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#070a12] px-5 py-14 text-[#f4f1ea]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(255,59,92,0.25), transparent 55%), radial-gradient(ellipse at 50% 120%, rgba(255,201,74,0.18), transparent 50%)",
        }}
      />

      <div className="relative flex items-end gap-2">
        <Chibi who="him" mood="shock" pose="reach-right" outfit="pilot" className="h-36 w-32" />
        {/* Hộ chiếu bị đóng dấu DENIED. */}
        <div className="relative mb-4 h-28 w-20 rotate-6 rounded-lg bg-[#7a1f2b] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.5)] ring-1 ring-[#ffc94a]/40">
          <p className="text-center font-mono text-[7px] tracking-[0.2em] text-[#ffc94a]">
            PASSPORT
          </p>
          <span
            aria-hidden="true"
            className="mx-auto mt-3 block size-8 rounded-full border-2 border-[#ffc94a]/60"
          />
          <p className="mt-3 text-center font-mono text-[6px] tracking-[0.2em] text-[#ffc94a]/70">
            DATE AIRWAYS
          </p>
          <span className="absolute top-8 -left-4 -rotate-[24deg] animate-[stamp_0.45s_0.4s_cubic-bezier(.3,1.6,.6,1)_both] rounded-md border-4 border-[#ff3b5c] bg-[#070a12]/70 px-1.5 font-mono text-sm font-black tracking-widest text-[#ff3b5c]">
            DENIED
          </span>
        </div>
      </div>

      <p className="relative mt-6 text-center font-mono text-[11px] tracking-[0.35em] text-[#ff8a8a]">
        ERROR 143 · THIS LINK TOOK A WRONG TURN
      </p>
      <h1 className="relative mt-2 text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
        Boarding denied ✋
      </h1>
      <p className="relative mt-3 max-w-md text-center text-sm text-white/65">
        Customs looked at your link and had questions. Lots of questions.
      </p>

      <ul className="relative mt-6 w-full max-w-md space-y-2">
        {problems.map((problem) => (
          <li
            key={problem}
            className="flex gap-3 rounded-2xl border border-[#ff3b5c]/30 bg-[#0b0f1c]/90 px-4 py-3 text-sm text-white/85"
          >
            <span aria-hidden="true">🛂</span>
            {problem}
          </li>
        ))}
      </ul>

      <a
        href="/dating"
        className="relative mt-8 rounded-xl bg-gradient-to-r from-[#ff2d78] to-[#ff5c9a] px-6 py-3 font-bold text-white shadow-[0_10px_30px_rgba(255,45,120,0.4)] transition hover:-translate-y-0.5 hover:brightness-110"
      >
        ✈ Take me to the real airport
      </a>
      <style>{`
        @keyframes stamp {
          0% { opacity: 0; transform: scale(3) rotate(-24deg); }
          60% { opacity: 1; transform: scale(0.92) rotate(-24deg); }
          100% { opacity: 1; transform: scale(1) rotate(-24deg); }
        }
        .chibi-blink { transform-box: fill-box; transform-origin: center; animation: chibi-blink 4.5s infinite; }
        @keyframes chibi-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
      `}</style>
    </div>
  );
}
