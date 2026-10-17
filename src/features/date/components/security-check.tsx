"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { ALONE_VERDICTS, CAPTCHA_TILES, NO_TILES, SECURITY_PA, SECURITY_QUESTIONS } from "../data";
import { playSound } from "../lib/sound";
import { HeartBurst } from "./heart-burst";
import { LetterScene } from "./chibi-scenes";
import { DateCaptcha } from "./date-captcha";

type Answer = (typeof SECURITY_QUESTIONS)[number]["answers"][number];
type Phase = "idle" | "working" | "revealed";
/** Hiệu ứng đang chạy trên màn hình X-quang. */
type Effect = "liar" | "enhance" | "deep" | "claw" | "flip" | "more" | "maybe" | "flipped" | null;
/** Trạng thái từng chữ từ chối ở câu 2: chưa lộ, vừa lộ, đang bị cẩu gắp, đang lật, đã lật xong. */
type TileState = "hidden" | "shown" | "claw" | "flip" | "done";

const EFFECT_LABEL: Record<Exclude<Effect, null>, string> = {
  liar: "🚨 LIAR DETECTED",
  enhance: "🔍 ENHANCING…",
  deep: "🔍 DEEP SCAN · SIDE POCKETS",
  claw: "🪝 RETRIEVING ITEM",
  flip: "🔄 FLIPPING",
  more: "⚠️ MORE ITEMS DETECTED",
  maybe: "⬆️ UPGRADING MAYBE",
  flipped: "✓ LUGGAGE 100% YES",
};

const XRAY = "[filter:grayscale(1)_brightness(1.4)_sepia(1)_hue-rotate(70deg)_saturate(4)]";

/** Chọn Alone mà vẫn tự tay bấm vào Raymond: dùng chính số ô đó làm bằng chứng. */
function aloneVerdict(selfPicked: number) {
  const total = CAPTCHA_TILES.length;
  if (selfPicked >= total) return ALONE_VERDICTS.all;
  if (selfPicked === 0) return ALONE_VERDICTS.none;
  return ALONE_VERDICTS.some
    .replace("{picked}", String(selfPicked))
    .replace("{found}", String(total - selfPicked));
}

/**
 * Máy soi hành lý. Câu nào cũng có cú lừa: câu 1 phóng to ra một bức thư tình,
 * câu 2 lôi ra cả dàn NO, NOPE, NOT NOW, MAYBE rồi cẩu gắp lật từng chữ,
 * câu 3 bắt làm CAPTCHA mà ô nào cũng là anh.
 */
export function SecurityCheck({
  passenger,
  onAnnounce,
  onDone,
}: {
  passenger: string;
  onAnnounce: (text: string) => void;
  onDone: () => void;
}) {
  const [question, setQuestion] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [effect, setEffect] = useState<Effect>(null);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [tiles, setTiles] = useState<TileState[]>(() => NO_TILES.map(() => "hidden"));
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  /** Câu 3: bấm nút nào cũng phải qua CAPTCHA trước. */
  const [captchaFor, setCaptchaFor] = useState<Answer | null>(null);
  /** Phán quyết riêng khi em chọn Alone, thay cho câu trả lời mặc định. */
  const [verdict, setVerdict] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  const current = SECURITY_QUESTIONS[question];

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  /** Chạy một chuỗi bước theo mốc thời gian (ms tính từ lúc bắt đầu). */
  const timeline = (steps: Array<[number, () => void]>) => {
    for (const [at, run] of steps) timers.current.push(window.setTimeout(run, at));
  };

  const setTile = (index: number, state: TileState) =>
    setTiles((list) => list.map((value, i) => (i === index ? state : value)));

  const answer = (option: Answer) => {
    setPicked(option);
    setPhase("working");

    if (current.surprise === "letter") {
      const liar = "liar" in option && option.liar;
      const start = liar ? 1200 : 0;
      if (liar) {
        playSound("siren");
        setEffect("liar");
        onAnnounce(SECURITY_PA.liar);
      }
      timeline([
        [
          start,
          () => {
            playSound("print");
            setEffect("enhance");
          },
        ],
        [
          start + 1500,
          () => {
            setEffect(null);
            setPhase("revealed");
            playSound("sparkle");
            onAnnounce(SECURITY_PA.letter);
          },
        ],
      ]);
      return;
    }

    if (current.surprise === "flip") {
      const deep = "deep" in option && option.deep;
      const start = deep ? 1400 : 150;
      if (deep) {
        playSound("print");
        setEffect("deep");
        onAnnounce(SECURITY_PA.deep);
      }
      const last = NO_TILES.length - 1;
      timeline([
        // Chữ NO đầu tiên: cẩu thả xuống, gắp, lật thành ON.
        [
          start,
          () => {
            playSound("buzz");
            setTile(0, "claw");
            setEffect("claw");
          },
        ],
        [start + 1000, () => playSound("thud")],
        [
          start + 1100,
          () => {
            playSound("boing");
            setTile(0, "flip");
            setEffect("flip");
          },
        ],
        [
          start + 1700,
          () => {
            playSound("sparkle");
            setTile(0, "done");
          },
        ],
        // Tưởng xong, máy lại hú: lòi thêm NOPE và NOT NOW.
        [
          start + 2200,
          () => {
            playSound("siren");
            setEffect("more");
            setTile(1, "shown");
            setTile(2, "shown");
            onAnnounce(SECURITY_PA.more);
          },
        ],
        [
          start + 3300,
          () => {
            setEffect("claw");
            setTile(1, "claw");
          },
        ],
        [
          start + 3800,
          () => {
            playSound("boing");
            setTile(1, "flip");
          },
        ],
        [
          start + 4300,
          () => {
            setTile(1, "done");
            setTile(2, "claw");
          },
        ],
        [
          start + 4800,
          () => {
            playSound("boing");
            setTile(2, "flip");
          },
        ],
        // Còn sót một MAYBE run rẩy, bị nâng cấp thành YES.
        [
          start + 5300,
          () => {
            playSound("buzz");
            setTile(2, "done");
            setTile(last, "shown");
            setEffect("maybe");
            onAnnounce(SECURITY_PA.maybe);
          },
        ],
        [start + 6600, () => setTile(last, "claw")],
        [
          start + 7500,
          () => {
            playSound("thud");
            setTile(last, "flip");
          },
        ],
        [
          start + 8200,
          () => {
            playSound("sparkle");
            setTile(last, "done");
            setEffect("flipped");
            setPhase("revealed");
            onAnnounce(SECURITY_PA.flip);
            const box = bagRef.current?.getBoundingClientRect();
            if (box) setBurst({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
          },
        ],
      ]);
      return;
    }

    playSound("blip");
    setPhase("revealed");
  };

  const next = () => {
    playSound("blip");
    setPhase("idle");
    setEffect(null);
    setPicked(null);
    setTiles(NO_TILES.map(() => "hidden"));
    setBurst(null);
    setLetterOpen(false);
    setCaptchaFor(null);
    setVerdict(null);
    if (question + 1 < SECURITY_QUESTIONS.length) setQuestion(question + 1);
    else onDone();
  };

  return (
    <div className="flex w-full flex-col items-center">
      {burst && <HeartBurst x={burst.x} y={burst.y} count={150} />}
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
        <div className="relative mx-auto h-44 w-[78%] overflow-hidden rounded-t-3xl border-x-8 border-t-8 border-[#1e2638] bg-[#03140b]">
          <p className="absolute top-2 left-3 z-10 font-mono text-[9px] tracking-[0.3em] text-[#5cff9d]/60">
            X-RAY · LANE 3
          </p>
          {effect && (
            <p
              key={effect}
              className={cn(
                "absolute top-2 right-3 z-30 animate-[pa-in_0.3s_ease-out_both] rounded px-1.5 py-0.5 font-mono text-[9px] font-black tracking-[0.15em]",
                effect === "liar" || effect === "more"
                  ? "animate-pulse bg-[#ff3b5c] text-white"
                  : effect === "flipped"
                    ? "bg-[#5cff9d] text-[#03140b]"
                    : "bg-[#5cff9d]/20 text-[#5cff9d]",
              )}
            >
              {EFFECT_LABEL[effect]}
            </p>
          )}
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
            style={{ animation: `scan ${effect === "deep" ? 0.6 : 2}s ease-in-out infinite` }}
          />
          {(effect === "liar" || effect === "more") && (
            <span
              aria-hidden="true"
              className="absolute inset-0 z-20 animate-[alarm_0.25s_steps(2)_infinite] bg-[#ff2d2d]/35"
            />
          )}
          {effect === "enhance" && (
            // Nhiễu sóng kiểu "zoom and enhance" trong phim.
            <span
              aria-hidden="true"
              className="absolute inset-0 z-20 animate-[glitch_0.18s_steps(2)_infinite] opacity-60"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(92,255,157,0.25) 0 2px, transparent 2px 5px)",
              }}
            />
          )}

          <div
            key={question}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 animate-[belt-in_1s_cubic-bezier(.2,.8,.3,1)_both]"
          >
            <div
              ref={bagRef}
              className={cn(
                "relative flex h-24 items-center justify-center gap-2 rounded-xl border-2 border-[#5cff9d]/70 bg-[#5cff9d]/5 px-2 transition-transform duration-700",
                current.surprise === "flip" ? "w-56" : "w-36",
                effect === "enhance" && "scale-125",
                effect === "more" && "animate-[row-shake_0.3s_ease-in-out_3]",
              )}
            >
              <span
                aria-hidden="true"
                className="absolute -top-3 left-1/2 h-3 w-10 -translate-x-1/2 rounded-t-lg border-2 border-b-0 border-[#5cff9d]/70"
              />
              <span
                className={cn(
                  "transition-all duration-500",
                  XRAY,
                  // Câu 2: vali đầy chữ thì thu nhỏ cái áo lại cho đủ chỗ.
                  current.surprise === "flip" && tiles[1] !== "hidden" ? "text-2xl" : "text-5xl",
                )}
              >
                {current.item}
              </span>

              {current.surprise === "letter" && phase === "revealed" && (
                <span className="animate-[letter-pop_0.6s_cubic-bezier(.3,1.6,.6,1)_both] text-4xl drop-shadow-[0_0_14px_rgba(255,45,120,0.9)]">
                  💌
                </span>
              )}

              {current.surprise === "flip" && (
                <span className="flex max-w-[10rem] flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
                  {NO_TILES.map((tile, index) => {
                    const state = tiles[index];
                    if (state === "hidden") return null;
                    const isLast = index === NO_TILES.length - 1;
                    const turning = state === "flip" || state === "done";
                    return (
                      <span
                        key={tile.from}
                        className={cn(
                          "relative transition-transform duration-500",
                          turning && "-translate-y-1",
                          // MAYBE run rẩy trong lúc chờ bị gắp.
                          isLast &&
                            state === "shown" &&
                            "animate-[row-shake_0.4s_ease-in-out_infinite]",
                        )}
                      >
                        {/* Móc cẩu thả từ nóc máy xuống gắp chữ. */}
                        {(state === "claw" || state === "flip") && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-[85%] left-1/2 z-10 flex -translate-x-1/2 animate-[claw-drop_cubic-bezier(.3,1.3,.6,1)_both] flex-col items-center"
                            style={{
                              animationDuration: index === 1 || index === 2 ? "0.45s" : "0.9s",
                            }}
                          >
                            <span className="h-32 w-0.5 bg-white/70" />
                            <span className="-mt-1 text-xl">🪝</span>
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-md border-2 px-1.5 py-0.5 font-mono font-black whitespace-nowrap",
                            isLast ? "text-base" : "text-xs",
                            // Mỗi lúc chỉ một animation: bật ra khi mới lộ, lật khi bị gắp.
                            turning
                              ? isLast
                                ? "animate-[tile-flip_0.7s_ease-in-out_both] border-[#ff2d78] bg-[#ff2d78]/30 text-[#ffd6e7] shadow-[0_0_20px_rgba(255,45,120,0.7)]"
                                : "animate-[tile-flip_0.5s_ease-in-out_both] border-[#5cff9d] bg-[#5cff9d]/20 text-[#5cff9d]"
                              : "animate-[letter-pop_0.4s_cubic-bezier(.3,1.6,.6,1)_both] border-[#ff3b5c] bg-[#ff3b5c]/15 text-[#ff3b5c]",
                          )}
                        >
                          {state === "done" ? tile.to : tile.from}
                        </span>
                      </span>
                    );
                  })}
                </span>
              )}

              {effect === "flipped" && (
                <span className="absolute -bottom-1 z-30 [rotate:-10deg] animate-[stamp_0.35s_cubic-bezier(.3,1.6,.6,1)_both] rounded-md border-4 border-[#5cff9d] bg-[#03140b]/80 px-2 font-mono text-xs font-black tracking-widest text-[#5cff9d]">
                  APPROVED ♥
                </span>
              )}
            </div>
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

      {phase === "revealed" && picked ? (
        <div className="step-in mt-6 flex flex-col items-center gap-4">
          <p aria-live="polite" className="max-w-sm text-center text-white/80">
            {verdict ?? picked.reply}
          </p>

          {current.surprise === "letter" &&
            (letterOpen ? (
              <LetterScene name={passenger} />
            ) : (
              <button
                type="button"
                onClick={() => {
                  playSound("rip");
                  setLetterOpen(true);
                }}
                className="animate-[seat-pulse_1.4s_ease-in-out_infinite] rounded-xl border border-[#ff8ab3]/60 bg-[#ff2d78]/15 px-5 py-2.5 font-bold text-[#ffd6e7] transition hover:-translate-y-0.5"
              >
                💌 Open the letter
              </button>
            ))}

          {/* Câu có lá thư: phải mở thư ra đọc rồi mới được qua vali tiếp theo. */}
          {(current.surprise !== "letter" || letterOpen) && (
            <button
              type="button"
              onClick={next}
              className="step-in rounded-xl bg-[#ff2d78] px-6 py-3 font-bold text-white transition hover:brightness-110"
            >
              {question + 1 < SECURITY_QUESTIONS.length ? "Next bag" : "Pass security"}
            </button>
          )}
        </div>
      ) : phase === "working" ? (
        <p
          aria-live="polite"
          className="mt-6 animate-pulse font-mono text-xs tracking-[0.3em] text-[#5cff9d]"
        >
          SCANNING…
        </p>
      ) : captchaFor && "captcha" in captchaFor ? (
        <div className="mt-6 flex w-full justify-center">
          <DateCaptcha
            intro={captchaFor.captcha}
            onAnnounce={onAnnounce}
            onVerified={(selfPicked) => {
              if (captchaFor.label === "Alone") setVerdict(aloneVerdict(selfPicked));
              setPicked(captchaFor);
              setPhase("revealed");
            }}
          />
        </div>
      ) : (
        <div className="mt-6 flex items-center gap-3">
          {current.answers.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                if ("captcha" in option) {
                  playSound("buzz");
                  setCaptchaFor(option);
                } else {
                  answer(option);
                }
              }}
              className="rounded-xl border border-white/20 bg-white/[0.03] px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:border-[#ffc94a] hover:text-[#ffc94a]"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
