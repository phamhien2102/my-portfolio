"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

import { CAPTAIN_NAME } from "../data";
import { toTicketName } from "./ticket-name";

const MAX_PILOT_LENGTH = 12;

/** Chỉ giữ chữ cái và khoảng trắng, tối đa 12 ký tự, viết hoa chữ đầu mỗi từ. Rỗng thì trả về null. */
export function cleanPilotName(raw: string | null) {
  if (!raw) return null;
  const name = raw
    .replace(/[^\p{L}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_PILOT_LENGTH)
    .trim();
  return name
    ? name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : null;
}

const noop = () => () => {};
const fromUrl = () => new URLSearchParams(window.location.search).get("pilot");

/**
 * Tên phi công lấy từ link (?pilot=Raymond). Server không biết link nên dùng tên mặc định,
 * trình duyệt đọc link sau khi tải trang.
 */
export function usePilotFromUrl() {
  const raw = useSyncExternalStore(noop, fromUrl, () => null);
  return cleanPilotName(raw) ?? CAPTAIN_NAME;
}

/** Thay "Raymond" / "RAYMOND" trong một câu bằng tên phi công. */
export function withPilot(text: string, name: string) {
  return text.replaceAll("RAYMOND", toTicketName(name)).replaceAll("Raymond", name);
}

const PilotContext = createContext(CAPTAIN_NAME);

export const PilotProvider = PilotContext.Provider;

/** Tên phi công cho các component bên trong trang dating, kèm vài dạng hay dùng. */
export function usePilot() {
  const name = useContext(PilotContext);
  return {
    name,
    /** In hoa không dấu, cho bảng giờ bay và băng rôn. */
    board: toTicketName(name),
    initial: name.charAt(0).toUpperCase(),
    say: (text: string) => withPilot(text, name),
  };
}
