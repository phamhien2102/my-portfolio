/**
 * Small line icons on a 24 x 24 grid, drawn as plain stroked paths so the preview (SVG) and the
 * PDF (drawSvgPath) can both render them without a font or an image.
 */
export const ICONS = {
  mail: "M4 6h16v12H4z M4 7.5l8 6 8-6",
  phone:
    "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  globe:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  linkedin: "M4 4h16v16H4z M8 10.5V17 M8 7.5v.5 M12 17v-6.5 M12 13.5a2.5 2.5 0 0 1 5 0V17",
  code: "M8 8l-5 4 5 4 M16 8l5 4-5 4 M13.5 5l-3 14",
  user: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M4 21a8 8 0 0 1 16 0",
  calendar: "M4 6h16v15H4z M4 10.5h16 M8 3v5 M16 3v5",
  flag: "M5 21V4 M5 4h12l-2 4 2 4H5",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  briefcase: "M3 8h18v12H3z M9 8V5h6v3 M3 13h18",
  car: "M4 16v-4l2-5h12l2 5v4 M3 16h18 M7.5 16v2.5 M16.5 16v2.5",
  heart: "M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export const isIconName = (v: unknown): v is IconName => typeof v === "string" && v in ICONS;

/** A sensible icon for a label the person typed ("Date of birth" gets a calendar...). */
export function guessIcon(label: string): IconName {
  const l = label.toLowerCase();
  if (/birth|dob|born|age|ngày sinh/.test(l)) return "calendar";
  if (/national|country|quốc tịch/.test(l)) return "flag";
  if (/licen|driv|bằng lái/.test(l)) return "car";
  if (/portfolio|website|blog|site|twitter|x\.com|link|url/.test(l)) return "link";
  if (/mail/.test(l)) return "mail";
  if (/phone|tel|mobile|zalo|whatsapp/.test(l)) return "phone";
  if (/address|city|location|địa chỉ/.test(l)) return "pin";
  if (/job|work|role|career/.test(l)) return "briefcase";
  if (/hobby|interest|status|marital|gender/.test(l)) return "heart";
  return "user";
}
