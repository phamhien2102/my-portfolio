"use server";

import { timingSafeEqual } from "node:crypto";

import { CODE_LENGTH } from "./data";

/**
 * Mã đặt chỗ chỉ nằm trên server, không bao giờ bị gửi xuống trình duyệt.
 * Đổi mã bằng biến môi trường DATE_BOOKING_CODE, không có thì dùng mã mặc định.
 */
const BOOKING_CODE = (process.env.DATE_BOOKING_CODE ?? "EMYEUANH").toUpperCase();

/** Kiểm tra mã đặt chỗ. Ai cũng gọi được hàm này bằng POST, nên phải tự kiểm tra kiểu dữ liệu đầu vào. */
export async function verifyBookingCode(code: unknown): Promise<boolean> {
  if (typeof code !== "string" || code.length !== CODE_LENGTH) return false;
  const given = Buffer.from(code.toUpperCase());
  const expected = Buffer.from(BOOKING_CODE);
  // So sánh với thời gian cố định để không đoán được mã qua độ trễ của từng ký tự.
  return given.length === expected.length && timingSafeEqual(given, expected);
}
