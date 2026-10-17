"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { CAPTCHA_PA, CAPTCHA_TILES } from "../data";
import { playSound } from "../lib/sound";
import { Chibi } from "./chibi";
import { usePilot } from "../lib/pilot";

type Stage = "checkbox" | "loading" | "challenge" | "verified";

/** Khoảng cách giữa hai ô khi hệ thống tự tick nốt những ô em bỏ sót. */
const AUTO_PICK_MS = 140;

/**
 * CAPTCHA giả kiểu reCAPTCHA: "Select all squares with your travel partner".
 * Chín ô đều là anh, chọn thiếu thì bị nhắc và hệ thống tự tick nốt.
 */
export function DateCaptcha({
  intro,
  onAnnounce,
  onVerified,
}: {
  /** Câu dẫn tuỳ theo em vừa bấm Alone hay With you. */
  intro: string;
  onAnnounce: (text: string) => void;
  /** Gọi khi xong, kèm số ô em đã tự tay chọn (không tính các ô hệ thống tick giùm). */
  onVerified: (selfPicked: number) => void;
}) {
  const pilot = usePilot();
  const [stage, setStage] = useState<Stage>("checkbox");
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const later = (ms: number, run: () => void) => {
    timers.current.push(window.setTimeout(run, ms));
  };

  const shake = () => {
    setShaking(true);
    later(450, () => setShaking(false));
  };

  const openChallenge = () => {
    if (stage !== "checkbox") return;
    playSound("blip");
    setStage("loading");
    later(900, () => {
      playSound("print");
      setStage("challenge");
    });
  };

  const toggle = (index: number) => {
    if (busy || stage !== "challenge") return;
    playSound("blip");
    setMessage(null);
    setSelected((list) =>
      list.includes(index) ? list.filter((value) => value !== index) : [...list, index],
    );
  };

  const finish = (selfPicked: number) => {
    playSound("sparkle");
    setStage("verified");
    onAnnounce(pilot.say(CAPTCHA_PA.verified));
    later(1100, () => onVerified(selfPicked));
  };

  const skip = () => {
    if (busy) return;
    playSound("buzz");
    shake();
    setMessage(CAPTCHA_PA.skip);
    onAnnounce(pilot.say(CAPTCHA_PA.skip));
  };

  const verify = () => {
    if (busy) return;
    const missing = CAPTCHA_TILES.map((_, index) => index).filter((i) => !selected.includes(i));
    const selfPicked = selected.length;
    if (missing.length === 0) {
      finish(selfPicked);
      return;
    }
    // Chọn thiếu: nhắc khéo rồi hệ thống tự tick nốt từng ô một.
    playSound("buzz");
    shake();
    setBusy(true);
    setMessage(`You missed ${missing.length}. Hint: they're ALL ${pilot.name}.`);
    onAnnounce(pilot.say(CAPTCHA_PA.missed));
    missing.forEach((index, order) => {
      later(700 + order * AUTO_PICK_MS, () => {
        playSound("flap");
        setSelected((list) => [...list, index]);
      });
    });
    later(700 + missing.length * AUTO_PICK_MS + 500, () => {
      setBusy(false);
      finish(selfPicked);
    });
  };

  return (
    <div className="step-in flex w-full max-w-xs flex-col items-center gap-3">
      <p className="text-center text-sm text-white/70">{intro}</p>

      {/* Ô tick kiểu reCAPTCHA. */}
      <button
        type="button"
        onClick={openChallenge}
        disabled={stage !== "checkbox"}
        aria-label="I'm not travelling alone"
        className="flex w-full items-center gap-3 rounded-md border border-[#d3d3d3] bg-[#f9f9f9] px-3 py-3 text-left text-[#222] shadow-sm"
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-sm border-2 bg-white",
            stage === "verified" ? "border-transparent" : "border-[#c1c1c1]",
          )}
        >
          {stage === "loading" ? (
            <span className="size-5 animate-spin rounded-full border-[3px] border-[#4a90e2] border-t-transparent" />
          ) : stage === "verified" ? (
            <span className="text-2xl font-black text-[#0f9d58]">✓</span>
          ) : null}
        </span>
        <span className="flex-1 text-sm">I&apos;m not travelling alone</span>
        <span className="flex flex-col items-center text-[8px] leading-tight text-[#555]">
          <span className="text-lg leading-none">♻️</span>
          dateCAPTCHA
        </span>
      </button>

      {stage === "challenge" && (
        <div
          className={cn(
            "step-in w-full overflow-hidden rounded-md border border-[#d3d3d3] bg-white text-[#222] shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
            shaking && "animate-[row-shake_0.45s_ease-in-out]",
          )}
        >
          <div className="bg-[#4a90e2] px-4 py-3 text-white">
            <p className="text-xs">Select all squares with</p>
            <p className="text-xl leading-tight font-extrabold">your travel partner</p>
            <p className="mt-0.5 text-[11px] opacity-90">Click verify once there are none left.</p>
          </div>

          <div className="grid grid-cols-3 gap-1 p-2">
            {CAPTCHA_TILES.map((tile, index) => {
              const on = selected.includes(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggle(index)}
                  aria-pressed={on}
                  aria-label={`Square ${index + 1}`}
                  className="relative aspect-square overflow-hidden"
                >
                  <span
                    className={cn(
                      "flex size-full items-center justify-center overflow-hidden transition-transform duration-150",
                      on && "scale-[0.82]",
                    )}
                    style={{
                      background: `linear-gradient(135deg, hsl(${index * 40} 45% 78%), hsl(${index * 40 + 30} 40% 58%))`,
                    }}
                  >
                    <Chibi
                      who="him"
                      outfit={tile.outfit}
                      mood={tile.mood}
                      className="h-[92%] w-[92%] translate-y-[6%]"
                    />
                    <span className="absolute right-1 bottom-0.5 font-mono text-[9px] font-bold text-black/50">
                      {tile.tag.replace("R", pilot.initial)}
                    </span>
                  </span>
                  {on && (
                    <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-[#4a90e2] text-xs font-black text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {message && (
            <p aria-live="polite" className="px-3 pb-1 text-xs font-semibold text-[#d93025]">
              {message}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-[#e5e5e5] px-3 py-2">
            <span aria-hidden="true" className="flex gap-3 text-lg text-[#777]">
              <span>↻</span>
              <span>🎧</span>
              <span>ⓘ</span>
            </span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={skip}
                className="rounded-sm px-3 py-2 text-xs font-bold text-[#555] uppercase hover:bg-black/5"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={verify}
                disabled={busy}
                className="rounded-sm bg-[#4a90e2] px-4 py-2 text-xs font-bold text-white uppercase hover:brightness-110 disabled:opacity-60"
              >
                Verify
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
