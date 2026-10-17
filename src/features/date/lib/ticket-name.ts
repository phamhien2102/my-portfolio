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

/** Bỏ dấu, viết hoa và bỏ khoảng trắng, để "hvan", "H Van" hay "HVÂN" đều được tính là một. */
export function normalizeName(name: string) {
  return toTicketName(name).replace(/\s+/g, "");
}
