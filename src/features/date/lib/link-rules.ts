import { useSyncExternalStore } from "react";

/** Tên các bước cho lối tắt ?jump=, theo đúng thứ tự bước. */
export const JUMP_STEPS = [
  "board",
  "destination",
  "schedule",
  "seat",
  "security",
  "ticket",
] as const;

const MAX_PILOT = 12;
const MAX_PASSENGER = 14;
const MAX_CODE = 12;

/**
 * Soát các tham số trên link. Trả về danh sách lỗi (viết kiểu đùa) cho trang "Boarding denied";
 * rỗng nghĩa là link hợp lệ. Tên pilot, passenger và mã đặt chỗ được nói rõ quy tắc; lỗi ở hai
 * lối tắt (jump, skip) gộp thành một câu chung, không lộ gì thêm. Tham số không có trên link thì bỏ qua.
 */
export function checkLink(search: string): string[] {
  const params = new URLSearchParams(search);
  const problems: string[] = [];

  const pilot = params.get("pilot");
  if (pilot !== null) {
    const name = pilot.trim();
    if (!name) problems.push("The pilot has no name. Who is flying this plane?!");
    else if (!/^[\p{L} ]+$/u.test(name))
      problems.push(
        "The pilot's name has suspicious symbols. Pilots don't have numbers in their names, probably.",
      );
    else if (name.length > MAX_PILOT)
      problems.push(`The pilot's name is too long for the name tag (${MAX_PILOT} letters max).`);
  }

  const passenger = params.get("passenger");
  if (passenger !== null) {
    const name = passenger.trim();
    if (!name || !/^[\p{L} ]+$/u.test(name))
      problems.push("The passenger name looks like a password. Letters only, please.");
    else if (name.length > MAX_PASSENGER)
      problems.push(
        `The passenger name doesn't fit on the boarding pass (${MAX_PASSENGER} letters max).`,
      );
  }

  const code = params.get("code");
  if (code !== null) {
    if (!code.trim()) problems.push("The booking code is empty. Even a love letter needs a stamp.");
    else if (!/^[A-Za-z0-9]+$/.test(code.trim()))
      problems.push("The booking code has weird characters. Only letters and numbers can fly.");
    else if (code.trim().length > MAX_CODE)
      problems.push(`The booking code is longer than a Monday (${MAX_CODE} characters max).`);
  }

  // Hai lối tắt chỉ báo chung chung, không lộ tên các bước hay giá trị hợp lệ.
  const jump = params.get("jump");
  const jumpBad = jump !== null && !(JUMP_STEPS as readonly string[]).includes(jump);
  const skip = params.get("skip");
  const skipBad = skip !== null && skip !== "security";
  if (jumpBad || skipBad)
    problems.push(
      "Something else on this boarding pass doesn't look right. Customs won't say what.",
    );

  return problems;
}

const noop = () => () => {};
// Ghép thành một chuỗi để snapshot so sánh được bằng ===, tránh render lại vô tận.
const snapshot = () => checkLink(window.location.search).join("\n");

/** Lỗi của link hiện tại, đọc trên trình duyệt. Server không biết link nên coi như hợp lệ. */
export function useLinkProblems() {
  const joined = useSyncExternalStore(noop, snapshot, () => "");
  return joined ? joined.split("\n") : [];
}
