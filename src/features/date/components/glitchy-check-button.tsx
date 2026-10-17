"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { playSound } from "../lib/sound";
import { usePilot } from "../lib/pilot";

/** Câu báo lỗi cho từng lần "Checking…" thất bại, lần lượt theo thứ tự. */
const FAIL_MESSAGES = [
  "🐛 Bug found: the developer was too busy thinking about you.",
  "💻 Raymond pushed to production on a Friday. Retrying…",
  "🤦 It worked on Raymond's machine, I swear.",
  "🧑‍💻 The developer forgot a semicolon. Again.",
  "☕ Stack overflow: too much coffee, not enough sleep.",
] as const;

/** Sau các lần lỗi, nút nhảy chỗ hai lần với hai câu này. */
const JUMP_MESSAGES = [
  "Oops, a CSS bug moved me. Over here! 👉",
  "Hotfix deployed… to the wrong place. Here! 🤞",
] as const;

const SUCCESS_MESSAGE = "✅ Bug fixed. All slots checked.";

/** Số lần "Checking…" thất bại được chọn ngẫu nhiên trong khoảng này mỗi khi nút xuất hiện. */
const MIN_FAILS = 3;
const MAX_FAILS = 5;

type Step = { kind: "process"; ok: boolean; message: string } | { kind: "jump"; message: string };

/** Kịch bản của nút: lỗi vài lần, nhảy chỗ hai lần, rồi mới thành công. */
function buildSteps(fails: number): Step[] {
  return [
    ...FAIL_MESSAGES.slice(0, fails).map((message) => ({
      kind: "process" as const,
      ok: false,
      message,
    })),
    ...JUMP_MESSAGES.map((message) => ({ kind: "jump" as const, message })),
    { kind: "process", ok: true, message: SUCCESS_MESSAGE },
  ];
}

/** Thời gian giả vờ xử lý mỗi lần bấm. */
const PROCESS_MS = 1700;

/**
 * Nút "Check all" kiểu hệ thống chập chờn: bấm thì giả vờ đang kiểm tra rồi báo lỗi, 3–5 lần
 * (mỗi lần một lỗi khác), sau đó nhảy chỗ hai lần, rồi lần bấm cuối mới chạy thật.
 */
export function GlitchyCheckButton({
  onSuccess,
  label,
  tip,
}: {
  onSuccess: () => void;
  label: string;
  tip: string;
}) {
  const pilot = usePilot();
  const areaRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [attempt, setAttempt] = useState(0);
  // Chọn một lần khi nút xuất hiện: lỗi 3, 4 hoặc 5 lần trước khi nhảy chỗ.
  const [steps] = useState(() =>
    buildSteps(MIN_FAILS + Math.floor(Math.random() * (MAX_FAILS - MIN_FAILS + 1))),
  );
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "info" | "error" | "ok" }>({
    text: tip,
    tone: "info",
  });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  const jump = () => {
    const area = areaRef.current?.getBoundingClientRect();
    const button = buttonRef.current?.getBoundingClientRect();
    if (!area || !button) return;
    const maxX = Math.max(0, (area.width - button.width) / 2 - 8);
    // Nhảy hẳn sang phía bên kia và lệch lên/xuống rõ ràng, để nhìn ra là nút đã đổi chỗ
    // (trên điện thoại hai bên nút không còn nhiều chỗ, nên nhảy dọc bù lại).
    const side = offset.x > 0 ? -1 : 1;
    const vertical = offset.y > 0 ? -1 : 1;
    setOffset({
      x: side * maxX * (0.7 + Math.random() * 0.3),
      y: vertical * (34 + Math.random() * 20),
    });
  };

  const press = () => {
    if (processing || done) return;
    const step = steps[Math.min(attempt, steps.length - 1)];
    setAttempt(attempt + 1);

    if (step.kind === "jump") {
      playSound("boing");
      jump();
      setMessage({ text: pilot.say(step.message), tone: "info" });
      return;
    }

    playSound("print");
    setProcessing(true);
    setMessage({ text: "Running the developer's code… fingers crossed 🤞", tone: "info" });
    timers.current.push(
      window.setTimeout(() => {
        setProcessing(false);
        if (step.kind === "process" && step.ok) {
          playSound("sparkle");
          setDone(true);
          setMessage({ text: pilot.say(step.message), tone: "ok" });
          onSuccess();
        } else {
          playSound("buzz");
          setMessage({ text: pilot.say(step.message), tone: "error" });
        }
      }, PROCESS_MS),
    );
  };

  return (
    <div
      ref={areaRef}
      className="mt-14 flex w-full max-w-md animate-[check-all-in_0.55s_cubic-bezier(.3,1.6,.6,1)_both] flex-col items-center"
    >
      <div
        ref={buttonRef}
        className="relative z-30 transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transition-none"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        <span
          key={message.text}
          role="status"
          aria-live="polite"
          className={cn(
            "absolute bottom-full left-1/2 mb-3 w-max max-w-[16rem] -translate-x-1/2 rounded-xl px-3 py-2 text-center text-xs font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.4)] [text-shadow:none]",
            message.tone === "error"
              ? "animate-[row-shake_0.45s_ease-in-out] bg-[#ff3b5c] text-white"
              : message.tone === "ok"
                ? "bg-[#5cff9d] text-[#03140b]"
                : "bg-white text-[#1d1500] motion-safe:animate-[tip-bob_1.8s_ease-in-out_infinite]",
          )}
        >
          {message.text}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-full left-1/2 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent",
              message.tone === "error"
                ? "border-t-[#ff3b5c]"
                : message.tone === "ok"
                  ? "border-t-[#5cff9d]"
                  : "border-t-white",
            )}
          />
        </span>
        <button
          type="button"
          onClick={press}
          disabled={processing || done}
          aria-busy={processing}
          className={cn(
            "relative overflow-hidden rounded-xl border px-5 py-2.5 text-sm font-bold whitespace-nowrap backdrop-blur-md transition",
            message.tone === "error" && !processing
              ? "border-[#ff3b5c] bg-[#2a0b12]/90 text-[#ffb3b3]"
              : "border-[#ffc94a] bg-[#0b0f1c]/90 text-[#ffe3a3] hover:bg-[#1a1608]/90 motion-safe:animate-[check-all-glow_1.6s_ease-in-out_infinite]",
            "disabled:pointer-events-none",
          )}
        >
          {/* Thanh tiến trình giả: chạy gần hết rồi đứng lại, để lúc báo lỗi càng tức. */}
          {processing && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 bg-[#ffc94a]/25"
              style={{ animation: `verify-bar ${PROCESS_MS}ms cubic-bezier(.2,.9,.2,1) forwards` }}
            />
          )}
          <span className="relative inline-flex items-center gap-2">
            {processing && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-[#ffe3a3] border-t-transparent" />
            )}
            {processing
              ? "Debugging…"
              : done
                ? "✅ Done"
                : message.tone === "error"
                  ? "↻ Try again"
                  : label}
          </span>
        </button>
      </div>
    </div>
  );
}
