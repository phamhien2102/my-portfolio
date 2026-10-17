"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { RUNAWAY_GIVE_UP_PA, RUNAWAY_PA, SECURITY_QUESTIONS } from "../data";
import { playSound } from "../lib/sound";
import { RunawayButton } from "./runaway-button";

interface Reply {
  text: string;
  confiscated: boolean;
}

/** Máy soi hành lý: vali chạy trên băng chuyền, mỗi câu hỏi soi ra một món đồ. */
export function SecurityCheck({
  onAnnounce,
  onDone,
}: {
  onAnnounce: (text: string) => void;
  onDone: () => void;
}) {
  const [question, setQuestion] = useState(0);
  const [reply, setReply] = useState<Reply | null>(null);
  const [dodges, setDodges] = useState(0);
  const stayRef = useRef<HTMLButtonElement>(null);
  const current = SECURITY_QUESTIONS[question];

  const answer = (option: (typeof current.answers)[number]) => {
    const confiscated = "confiscate" in option && option.confiscate;
    setReply({ text: option.reply, confiscated });
    if (confiscated) {
      playSound("siren");
      window.setTimeout(() => playSound("thud"), 450);
      onAnnounce("Security alert. An intention to say no was found and safely destroyed.");
    } else {
      playSound("blip");
    }
  };

  const next = () => {
    playSound("blip");
    setReply(null);
    if (question + 1 < SECURITY_QUESTIONS.length) setQuestion(question + 1);
    else onDone();
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="text-center">
        <p className="font-mono text-[11px] tracking-[0.35em] text-[#ffc94a] uppercase">
          Security check · {question + 1}/{SECURITY_QUESTIONS.length}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
          {current.question}
        </h1>
      </div>

      {/* Máy soi: cửa hầm ở giữa, băng chuyền chạy bên dưới. */}
      <div className="relative mt-8 w-full max-w-md">
        <div className="relative mx-auto h-40 w-[78%] overflow-hidden rounded-t-3xl border-x-8 border-t-8 border-[#1e2638] bg-[#03140b]">
          <p className="absolute top-2 left-3 z-10 font-mono text-[9px] tracking-[0.3em] text-[#5cff9d]/60">
            X-RAY · LANE 3
          </p>
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(92,255,157,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(92,255,157,0.15) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 z-10 h-0.5 bg-[#5cff9d] shadow-[0_0_14px_#5cff9d]"
            style={{ animation: "scan 2s ease-in-out infinite" }}
          />
          {reply?.confiscated && (
            <span
              aria-hidden="true"
              className="absolute inset-0 z-20 animate-[alarm_0.25s_steps(2)_4] bg-[#ff2d2d]/35"
            />
          )}

          <div
            key={question}
            className="absolute bottom-3 left-1/2 flex h-24 w-32 -translate-x-1/2 animate-[belt-in_1s_cubic-bezier(.2,.8,.3,1)_both] items-center justify-center rounded-xl border-2 border-[#5cff9d]/70 bg-[#5cff9d]/5"
          >
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 h-3 w-10 -translate-x-1/2 rounded-t-lg border-2 border-b-0 border-[#5cff9d]/70"
            />
            <span
              className={cn(
                "text-5xl [filter:grayscale(1)_brightness(1.4)_sepia(1)_hue-rotate(70deg)_saturate(4)]",
                reply?.confiscated && "animate-[confiscate_0.8s_0.5s_ease-in_forwards]",
              )}
            >
              {current.item}
            </span>
            {reply?.confiscated && (
              <span className="absolute z-30 [rotate:-14deg] animate-[stamp_0.35s_0.35s_cubic-bezier(.3,1.6,.6,1)_both] rounded-md border-4 border-[#ff3b5c] px-2 py-0.5 font-mono text-sm font-black tracking-widest text-[#ff3b5c]">
                CONFISCATED
              </span>
            )}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="h-4 rounded-full bg-[#1e2638]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 10px, transparent 10px 20px)",
            animation: "belt 0.8s linear infinite",
          }}
        />
      </div>

      {reply ? (
        <div className="mt-6 flex flex-col items-center gap-4">
          <p aria-live="polite" className="max-w-sm text-center text-white/80">
            {reply.text}
          </p>
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-[#ff2d78] px-6 py-3 font-bold text-white transition hover:brightness-110"
          >
            {question + 1 < SECURITY_QUESTIONS.length ? "Next bag" : "Pass security"}
          </button>
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-3">
          {current.answers.map((option) =>
            "runaway" in option ? (
              <RunawayButton
                key={option.label}
                avoid={stayRef}
                onDodge={(count) => {
                  setDodges(count);
                  if (RUNAWAY_PA[count]) onAnnounce(RUNAWAY_PA[count]);
                }}
                onGiveUp={() => {
                  setDodges(dodges + 1);
                  onAnnounce(RUNAWAY_GIVE_UP_PA);
                }}
              />
            ) : (
              <button
                key={option.label}
                // Nút còn lại: Alone càng chạy thì nút này càng to và càng sáng.
                ref={question === SECURITY_QUESTIONS.length - 1 ? stayRef : undefined}
                type="button"
                onClick={() => answer(option)}
                className={cn(
                  "rounded-xl border px-6 py-3 font-semibold transition duration-300 hover:-translate-y-0.5 hover:border-[#ffc94a] hover:text-[#ffc94a]",
                  question === SECURITY_QUESTIONS.length - 1 && dodges > 0
                    ? "border-[#ff2d78] bg-[#ff2d78]/20 text-white shadow-[0_0_30px_rgba(255,45,120,0.45)]"
                    : "border-white/20 bg-white/[0.03]",
                )}
                style={
                  question === SECURITY_QUESTIONS.length - 1 && dodges > 0
                    ? { transform: `scale(${Math.min(1.5, 1 + dodges * 0.07)})` }
                    : undefined
                }
              >
                {option.label}
                {question === SECURITY_QUESTIONS.length - 1 && dodges > 0 && " 💘"}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
