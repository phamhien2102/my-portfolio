"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { CAPTAIN_NAME } from "../data";
import { Chibi, FloatingHearts, type ChibiMood } from "./chibi";

/** Lá thư tình: thay đoạn chữ bằng chibi anh đỏ mặt cầm thư, chỉ kèm một dòng ngắn. */
export function LetterScene({ name }: { name: string }) {
  return (
    <div className="step-in relative w-full max-w-xs rotate-[-1.5deg] overflow-hidden rounded-2xl bg-[#fff6ea] px-5 pt-4 pb-5 text-center shadow-[0_20px_50px_rgba(255,45,120,0.3)]">
      <FloatingHearts count={6} />
      <Chibi
        who="him"
        mood="blush"
        pose="hold"
        item="letter"
        className="relative mx-auto h-40 w-36"
        title={`${CAPTAIN_NAME}, blushing, holding a love letter`}
      />
      <p className="relative mt-1 font-serif text-lg text-[#3a2a1a] italic">
        For {name} <span className="text-[#ff2d78]">♥</span>
      </p>
      <p className="relative font-serif text-sm text-[#8a6a52] italic">
        — {CAPTAIN_NAME.charAt(0)}.
      </p>
    </div>
  );
}

/**
 * Cảnh plot twist ở bước chọn ghế: em giật mình rồi đỏ mặt, anh bật lên vẫy tay,
 * trái tim hiện ra ở giữa.
 */
export function PlotTwistScene() {
  const [herMood, setHerMood] = useState<ChibiMood>("shock");
  const [heart, setHeart] = useState(false);

  useEffect(() => {
    const blush = window.setTimeout(() => setHerMood("blush"), 900);
    const pop = window.setTimeout(() => setHeart(true), 1100);
    return () => {
      window.clearTimeout(blush);
      window.clearTimeout(pop);
    };
  }, []);

  return (
    <div
      role="img"
      aria-label={`Plot twist: the passenger next to you is ${CAPTAIN_NAME}`}
      className="relative flex h-32 items-end justify-center gap-1"
    >
      <Chibi
        who="her"
        mood={herMood}
        pose="reach-right"
        className={cn(
          "h-32 w-28 transition-transform duration-300",
          herMood === "shock" && "-translate-y-2",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "mb-14 text-3xl text-[#ff2d78] drop-shadow-[0_0_12px_rgba(255,45,120,0.8)]",
          heart ? "animate-[letter-pop_0.5s_cubic-bezier(.3,1.6,.6,1)_both]" : "opacity-0",
        )}
      >
        ♥
      </span>
      <Chibi
        who="him"
        mood="wink"
        pose="wave"
        className="h-32 w-28 animate-[chibi-pop_0.6s_0.2s_cubic-bezier(.3,1.6,.6,1)_both]"
      />
    </div>
  );
}

/** Màn cuối: hai chibi nắm tay ngồi bên cửa sổ máy bay, tim bay lên. */
export function FinalScene({ dateLabel, time }: { dateLabel: string; time: string }) {
  return (
    <div className="step-in flex flex-col items-center gap-3">
      <div
        role="img"
        aria-label={`You and ${CAPTAIN_NAME} holding hands on the plane, ${dateLabel} at ${time}`}
        className="relative h-52 w-72 overflow-hidden rounded-[3rem] border-[10px] border-[#e9e4dc] bg-gradient-to-b from-[#2a1d4a] via-[#7a3b6e] to-[#ff9a76] shadow-[inset_0_0_30px_rgba(0,0,0,0.4),0_20px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Mây trôi ngoài cửa sổ. */}
        <span
          aria-hidden="true"
          className="absolute top-6 -left-16 h-6 w-24 rounded-full bg-white/40 blur-sm"
          style={{ animation: "cloud-drift 9s linear infinite" }}
        />
        <span
          aria-hidden="true"
          className="absolute top-16 -left-24 h-5 w-20 rounded-full bg-white/30 blur-sm"
          style={{ animation: "cloud-drift 13s 2s linear infinite" }}
        />
        <span aria-hidden="true" className="absolute top-4 right-8 size-1 rounded-full bg-white" />
        <span
          aria-hidden="true"
          className="absolute top-10 right-16 size-0.5 rounded-full bg-white"
        />
        <FloatingHearts count={7} />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
          <Chibi who="her" mood="blush" pose="reach-right" className="-mr-6 h-36 w-32" />
          <Chibi who="him" mood="love" pose="reach-left" className="-ml-6 h-36 w-32" />
        </div>
      </div>
      <p className="rounded-full bg-white/10 px-4 py-1.5 font-mono text-sm text-[#ffd6e7]">
        ✈ {dateLabel} · {time}
      </p>
    </div>
  );
}

/** Tem tròn cầu vồng với mặt hai chibi, thay cho tem "VERIFIED CUTE" trên vé. */
export function CoupleSticker({ className }: { className?: string }) {
  return (
    <span
      data-couple-sticker
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-full shadow-inner ring-2 ring-white/70",
        className,
      )}
      style={{
        background:
          "conic-gradient(from var(--holo-angle, 0deg), #ff8ab3, #ffc94a, #5cff9d, #5cc8ff, #c58aff, #ff8ab3)",
        animation: "holo-spin 6s linear infinite",
      }}
    >
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
        <svg x="3" y="12" width="50" height="50">
          <ChibiFace who="her" />
        </svg>
        <svg x="47" y="12" width="50" height="50">
          <ChibiFace who="him" />
        </svg>
        <path
          d="M50 72 c-4 -4 -9 0 -4 5 l4 4 l4 -4 c5 -5 0 -9 -4 -5z"
          fill="#ff2d78"
          stroke="#fff"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
}

/** Chỉ phần đầu của chibi, lồng được vào trong SVG khác. */
function ChibiFace({ who }: { who: "him" | "her" }) {
  return <Chibi who={who} mood="happy" headOnly className="size-full" />;
}
