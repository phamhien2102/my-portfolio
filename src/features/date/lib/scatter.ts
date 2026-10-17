/**
 * Số "ngẫu nhiên" từ 0 đến 1 tính từ chỉ số. Chỉ dùng phép tính số nguyên, vì Math.sin có thể
 * lệch vài chữ số cuối giữa Node và trình duyệt, làm HTML của server khác với client.
 */
export function scatter(index: number, salt: number) {
  let t = (index * 374761393 + salt * 668265263) | 0;
  t = Math.imul(t ^ (t >>> 13), 1274126177);
  t ^= t >>> 16;
  return (t >>> 0) / 4294967296;
}

/** Làm tròn toạ độ cho gọn và chắc chắn giống nhau ở server lẫn client. */
export const r1 = (value: number) => Math.round(value * 10) / 10;

/** Khung vẽ chung của các cảnh nền; SVG phủ kín màn hình và neo vào đáy. */
export const SCENE_W = 1440;
export const SCENE_H = 900;
