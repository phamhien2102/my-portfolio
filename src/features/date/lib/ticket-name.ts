/** Bỏ dấu và viết hoa, giống tên in trên vé máy bay thật. */
export function toTicketName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .trim();
}
