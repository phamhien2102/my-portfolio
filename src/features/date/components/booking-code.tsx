"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

import { CODE_LENGTH } from "../data";

/** Ký tự vừa gõ hiện ra trong chừng này rồi mới bị che, giống ô nhập mật khẩu trên điện thoại. */
const PEEK_MS = 600;

/** Chỉ giữ chữ và số, viết hoa, tối đa bằng độ dài mã. */
function normalizeCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
}

/**
 * Ô nhập mã đặt chỗ dạng từng ô ký tự, che như mật khẩu.
 * Thực chất là một input trong suốt phủ lên các ô, nên vẫn gõ, dán, xoá bình thường.
 */
export function BookingCodeInput({
  value,
  onChange,
  invalid,
  verified,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  verified: boolean;
  disabled: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);
  const peekTimer = useRef(0);

  const change = (raw: string) => {
    const next = normalizeCode(raw);
    window.clearTimeout(peekTimer.current);
    if (next.length > value.length) {
      setPeek(next.length - 1);
      peekTimer.current = window.setTimeout(() => setPeek(null), PEEK_MS);
    } else {
      setPeek(null);
    }
    onChange(next);
  };

  return (
    <div className={cn("flex gap-2 transition-opacity", disabled && !verified && "opacity-40")}>
      <div className="relative flex-1">
        <div aria-hidden="true" className="flex justify-between gap-1 sm:gap-1.5">
          {Array.from({ length: CODE_LENGTH }, (_, index) => {
            const char = value[index];
            const shown = reveal || index === peek;
            const active =
              focused && !verified && index === Math.min(value.length, CODE_LENGTH - 1);
            return (
              <span
                key={index}
                className={cn(
                  "relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-lg border font-mono text-xl font-bold transition-all duration-200",
                  verified
                    ? "border-[#5cff9d] bg-[#5cff9d]/15 text-[#5cff9d] shadow-[0_0_18px_rgba(92,255,157,0.35)]"
                    : invalid
                      ? "border-[#ff5c5c]/70 bg-[#ff5c5c]/10 text-[#ffb3b3]"
                      : active
                        ? "border-[#ffc94a] bg-white/10 text-white"
                        : "border-white/15 bg-white/5 text-white",
                )}
                style={verified ? { transitionDelay: `${index * 40}ms` } : undefined}
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-px bg-black/40" />
                {char ? (
                  <span key={shown ? char : "mask"} className="flap-in inline-block">
                    {shown ? char : "*"}
                  </span>
                ) : (
                  active && <span className="h-5 w-0.5 animate-pulse bg-[#ffc94a]" />
                )}
              </span>
            );
          })}
        </div>
        <input
          id="booking-code"
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(event) => change(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={CODE_LENGTH}
          disabled={disabled}
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby="booking-code-hint"
          className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
        />
      </div>
      <button
        type="button"
        onClick={() => setReveal(!reveal)}
        disabled={disabled && !verified}
        aria-label={reveal ? "Hide booking code" : "Show booking code"}
        aria-pressed={reveal}
        className="flex h-12 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-lg transition hover:border-white/40"
      >
        {reveal ? "🙈" : "👁"}
      </button>
    </div>
  );
}
