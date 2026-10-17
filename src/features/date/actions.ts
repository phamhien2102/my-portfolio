"use server";

import { timingSafeEqual } from "node:crypto";

import { CODE_LENGTH } from "./data";
import { normalizeName } from "./lib/ticket-name";

/**
 * Mã đặt chỗ chỉ nằm trên server, không bao giờ bị gửi xuống trình duyệt.
 * Đổi mã bằng biến môi trường DATE_BOOKING_CODE, không có thì dùng mã mặc định.
 */
const BOOKING_CODE = (process.env.DATE_BOOKING_CODE ?? "ANHYEUEM").toUpperCase();

/** Kiểm tra mã đặt chỗ. Ai cũng gọi được hàm này bằng POST, nên phải tự kiểm tra kiểu dữ liệu đầu vào. */
export async function verifyBookingCode(code: unknown): Promise<boolean> {
  if (typeof code !== "string" || code.length !== CODE_LENGTH) return false;
  const given = Buffer.from(code.toUpperCase());
  const expected = Buffer.from(BOOKING_CODE);
  // So sánh với thời gian cố định để không đoán được mã qua độ trễ của từng ký tự.
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Tên hành khách duy nhất có trên danh sách. Cũng chỉ nằm trên server như mã đặt chỗ.
 * Đổi tên bằng biến môi trường DATE_PASSENGER_NAME, không có thì dùng tên mặc định.
 */
const PASSENGER_NAME = normalizeName(process.env.DATE_PASSENGER_NAME ?? "HVAN");

/** Kiểm tra tên hành khách. Cũng phải tự kiểm tra kiểu dữ liệu vì ai cũng gọi được bằng POST. */
export async function verifyPassenger(name: unknown): Promise<boolean> {
  if (typeof name !== "string" || name.length > 40) return false;
  const given = Buffer.from(normalizeName(name));
  const expected = Buffer.from(PASSENGER_NAME);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
