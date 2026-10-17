import { useEffect } from "react";

/**
 * Khoá cuộn trang khi `locked` bật (popup, dấu CLEARED, trái tim bằng khói).
 * Giữ nguyên vị trí đang cuộn, và chặn cả kiểu kéo đàn hồi trên iPhone.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: html.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    // iPhone vẫn cho kéo trang dù overflow: hidden, nên chặn thêm thao tác vuốt.
    const block = (event: TouchEvent) => event.preventDefault();
    document.addEventListener("touchmove", block, { passive: false });

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.overscrollBehavior = previous.overscroll;
      document.removeEventListener("touchmove", block);
    };
  }, [locked]);
}
