"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 28;

/** Dòng chữ gõ ra từng ký tự. Bên ngoài đổi `key` cho mỗi thông báo mới để gõ lại từ đầu. */
function TypedLine({ text }: { text: string }) {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    let count = 0;
    const interval = window.setInterval(() => {
      count += 1;
      setTyped(count);
      if (count >= text.length) window.clearInterval(interval);
    }, TYPE_MS);
    return () => window.clearInterval(interval);
  }, [text]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, typed)}
        {typed < text.length && <span className="animate-pulse text-[#ffc94a]">▍</span>}
      </span>
    </>
  );
}

/**
 * Loa phát thanh của cơ trưởng, nằm ngay trong bố cục trang chứ không nổi đè lên nội dung.
 * Chiều cao được giữ cố định để trang không bị giật mỗi khi đổi câu.
 */
export function CaptainBar({
  announcement,
}: {
  announcement: { id: number; text: string } | null;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-8 flex min-h-[4.75rem] w-full max-w-xl items-start gap-3 rounded-2xl border border-white/10 bg-[#0b0f1c]/70 px-4 py-3 backdrop-blur-md"
    >
      <span aria-hidden="true" className="mt-0.5 text-lg">
        📢
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-[#ffc94a]">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#ff2d78] opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-[#ff2d78]" />
          </span>
          CAPTAIN SPEAKING
        </p>
        <p className="mt-1 text-sm leading-snug text-white/85">
          {announcement && <TypedLine key={announcement.id} text={announcement.text} />}
        </p>
      </div>
    </div>
  );
}
