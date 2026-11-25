import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = { className: "ds-i", viewBox: "0 0 24 24", "aria-hidden": true } as const;
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const Logo = (p: P) => (
  <svg viewBox="0 0 32 32" width={28} height={28} aria-hidden="true" className="ds-logo" {...p}>
    <path
      d="M16 3 28 10 16 17 4 10z"
      fill="#cfe3b2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M4 10v11l12 7V17z"
      fill="#e7ddf5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M28 10v11l-12 7V17z"
      fill="#f7e2a8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export const Chevron = (p: P) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="m9 6 6 6-6 6" {...stroke} />
  </svg>
);

export const SearchIcon = (p: P) => (
  <svg {...base} width={16} height={16} {...p}>
    <circle cx="11" cy="11" r="6.5" {...stroke} />
    <path d="m16 16 4.5 4.5" {...stroke} />
  </svg>
);

export const Globe = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <circle cx="12" cy="12" r="8.5" {...stroke} />
    <path
      d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5Z"
      {...stroke}
    />
  </svg>
);

export const Sun = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <circle cx="12" cy="12" r="4" {...stroke} />
    <path
      d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
      {...stroke}
    />
  </svg>
);

export const Moon = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" {...stroke} />
  </svg>
);

export const Menu = (p: P) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" {...stroke} />
  </svg>
);

export const Arrow = ({ dir = "right", ...p }: P & { dir?: "left" | "right" }) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d={dir === "right" ? "M5 12h14m-5-5 5 5-5 5" : "M19 12H5m5-5-5 5 5 5"} {...stroke} />
  </svg>
);

export const Replay = (p: P) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4h4" {...stroke} />
  </svg>
);

export const Play = (p: P) => (
  <svg {...base} width={13} height={13} {...p}>
    <path d="M7 5v14l11-7z" fill="currentColor" />
  </svg>
);

export const Pause = (p: P) => (
  <svg {...base} width={13} height={13} {...p}>
    <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
  </svg>
);

export const Check = (p: P) => (
  <svg {...base} width={12} height={12} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} strokeWidth={3} />
  </svg>
);

export const Alert = (p: P) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M12 4 2.8 19.5h18.4z M12 10v4.5M12 17.2v.3" {...stroke} />
  </svg>
);

export const Bolt = (p: P) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="m13 3-8 11h6l-1 7 8-11h-6z" {...stroke} />
  </svg>
);

export const Bulb = (p: P) => (
  <svg {...base} width={16} height={16} {...p}>
    <path
      d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z"
      {...stroke}
    />
  </svg>
);

export const Folder = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" className="ds-folder">
    <path
      d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
      fill={color}
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </svg>
);

/** 24 x 24 stroke paths, shared by the HTML chips and the labels inside the SVG scene. */
export const GLYPH: Record<string, string> = {
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  branch:
    "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9a9 9 0 0 1-9 9",
  swap: "M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-4.5-4.5",
  memory: "M5 7h14v10H5zM9 3v4M15 3v4M9 17v4M15 17v4M2 10h3M2 14h3M19 10h3M19 14h3",
  sigma: "M18 5H6l7 7-7 7h12",
  bolt: "m13 3-8 11h6l-1 7 8-11h-6z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  hourglass: "M6 2h12M6 22h12M7 2v4.5L12 12l-5 5.5V22M17 2v4.5L12 12l5 5.5V22",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  globe:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.4 3.8 5.4 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3Z",
  link: "M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.400l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.400l1-1",
  server: "M4 5h16v6H4zM4 13h16v6H4zM7.5 8h.01M7.5 16h.01",
  download: "M3 12h4l3-8 4 16 3-8h4",
  timer: "M12 8v5l3 2M9 2h6M12 4a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z",
  gauge: "M4 17a8 8 0 1 1 16 0M12 17l4-6",
  database:
    "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  alert: "M12 4 2.8 19.500h18.400ZM12 10v4.500M12 17.200v.3",
  users:
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9c0-3.3 2.7-5.5 6-5.500s6 2.2 6 5.500M16 4.300a3.5 3.5 0 0 1 0 6.400M18 14.800c1.8.7 3 2.3 3 5.2",
  queue: "M4 7h16M4 12h16M4 17h10",
  shield:
    "M12 3 4.5 6v5.500c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.500V6L12 3Zm-3 9 2.2 2.200L15.5 10",
};

export const Glyph = ({ name, size = 13, ...p }: P & { name: string; size?: number }) => (
  <svg {...base} width={size} height={size} {...p}>
    <path d={GLYPH[name] ?? GLYPH.layers} {...stroke} strokeWidth={2} />
  </svg>
);

export const Sparkle = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <path
      d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7ZM19 16l.6 1.900L21.5 18.500l-1.9.6L19 21l-.6-1.9-1.9-.6 1.9-.6Z"
      {...stroke}
      strokeWidth={1.6}
    />
  </svg>
);

export const BookIcon = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <path
      d="M4 5.500A1.5 1.5 0 0 1 5.5 4H11v15H5.500A1.5 1.5 0 0 0 4 20.500ZM20 5.500A1.5 1.5 0 0 0 18.5 4H13v15h5.500a1.5 1.5 0 0 1 1.5 1.500Z"
      {...stroke}
    />
  </svg>
);

export const Gear = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <circle cx="12" cy="12" r="3" {...stroke} />
    <path
      d="M12 3v2.500M12 18.500V21M3 12h2.500M18.5 12H21M5.6 5.600l1.8 1.800M16.6 16.600l1.8 1.800M5.6 18.400l1.8-1.800M16.6 7.400l1.8-1.8"
      {...stroke}
    />
  </svg>
);

export const Frame = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" {...stroke} />
    <path d="M3.5 9.500h17" {...stroke} />
  </svg>
);

export const Cheat = (p: P) => (
  <svg {...base} width={17} height={17} {...p}>
    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14v6M14 17h6" {...stroke} />
  </svg>
);

/** Algo Lab's mark: a dark tile with three stacked layers. */
export const LogoTile = (p: P) => (
  <svg viewBox="0 0 32 32" width={30} height={30} aria-hidden="true" className="ds-logo" {...p}>
    <rect width="32" height="32" rx="8" fill="#26262a" />
    <path
      d="m16 7 9 4.5-9 4.5-9-4.500z"
      fill="#e0775f"
      stroke="#e0775f"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="m7 16 9 4.5 9-4.500M7 20.5 16 25l9-4.5"
      fill="none"
      stroke="#f4efe6"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CodeIcon = (p: P) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" {...stroke} />
  </svg>
);

export const FileText = (p: P) => (
  <svg {...base} width={18} height={18} {...p}>
    <path
      d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5M9 13h6M9 17h6"
      {...stroke}
    />
  </svg>
);

export const Trophy = (p: P) => (
  <svg {...base} width={18} height={18} {...p}>
    <path
      d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a3 3 0 0 0 3 3M16 6h4v2a3 3 0 0 1-3 3M12 13v4M8 21h8M10 17h4"
      {...stroke}
    />
  </svg>
);

export const BarChart = (p: P) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" {...stroke} />
  </svg>
);

/** A lesson in the tree: a page outline. */
export const FileIcon = (p: P) => (
  <svg {...base} width={16} height={16} {...p}>
    <path
      d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v4h4"
      {...stroke}
      strokeWidth={1.7}
    />
  </svg>
);

/** A folder drawn as an outline, or filled when `filled`. */
export const FolderLine = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" className="ds-folder">
    <path
      d="M3 7a2 2 0 0 1 2-2h4l2 2.500h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
      fill={filled ? "#d96f57" : "none"}
      stroke={filled ? "#b5503b" : "currentColor"}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

/** A little staircase of isometric blocks, the badge beside a lesson title. */
export const IsoStairs = () => (
  <svg viewBox="0 0 64 44" width={64} height={44} aria-hidden="true" className="ds-iso-stairs">
    <g stroke="#26262a" strokeWidth="1.4" strokeLinejoin="round">
      <path d="M4 33 14 28v6L4 39Z" fill="#e0775f" />
      <path d="m14 28 8-4 6 3v6l-8 4-6-3Z" fill="#fdf7ef" />
      <path d="m20 33 8-4v6l-8 4Z" fill="#e0775f" />
      <path d="m26 22 8-4 6 3v6l-8 4-6-3Z" fill="#fdf7ef" />
      <path d="m32 27 8-4v6l-8 4Z" fill="#e0775f" />
      <path d="m38 16 8-4 6 3v6l-8 4-6-3Z" fill="#fdf7ef" />
      <path d="m44 21 8-4v6l-8 4Z" fill="#e0775f" />
    </g>
  </svg>
);
