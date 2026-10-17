import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ChibiMood = "smile" | "happy" | "blush" | "love" | "shock" | "wink";
export type ChibiPose = "down" | "wave" | "hold" | "reach-left" | "reach-right";
export type ChibiOutfit =
  "sunglasses" | "pilot" | "tux" | "disguise" | "chef" | "hero" | "vampire" | "astronaut" | "bear";

const INK = "#3a2a2a";
const SKIN = "#ffe3cf";
const CHEEK = "#ff8ab3";

/** Khung nhìn cả người, và khung chỉ lấy phần đầu (dùng cho tem nhỏ). */
const FULL_VIEW = "0 0 120 140";
const HEAD_VIEW = "16 4 88 88";

/** Vai trái và vai phải: cánh tay xoay quanh hai điểm này. */
const SHOULDER_L = { x: 45, y: 92 };
const SHOULDER_R = { x: 75, y: 92 };

/** Góc xoay cánh tay (độ). 0 là buông thẳng; âm là vung sang phải, dương là vung sang trái. */
const ARM_ANGLES: Record<ChibiPose, [left: number, right: number]> = {
  down: [18, -18],
  wave: [18, -150],
  hold: [-48, 48],
  "reach-left": [80, -18],
  "reach-right": [18, -80],
};

function Arm({ x, y, angle, sleeve }: { x: number; y: number; angle: number; sleeve: string }) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <rect
        x={x - 4.5}
        y={y - 2}
        width={9}
        height={22}
        rx={4.5}
        fill={sleeve}
        stroke={INK}
        strokeWidth={1.5}
      />
      <circle cx={x} cy={y + 22} r={4.6} fill={SKIN} stroke={INK} strokeWidth={1.5} />
    </g>
  );
}

function Eyes({ mood }: { mood: ChibiMood }) {
  const left = { x: 47, y: 58 };
  const right = { x: 73, y: 58 };

  if (mood === "happy") {
    return (
      <g fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round">
        <path
          d={`M${left.x - 6} ${left.y + 2} Q${left.x} ${left.y - 6} ${left.x + 6} ${left.y + 2}`}
        />
        <path
          d={`M${right.x - 6} ${right.y + 2} Q${right.x} ${right.y - 6} ${right.x + 6} ${right.y + 2}`}
        />
      </g>
    );
  }

  if (mood === "love") {
    const heart = (cx: number, cy: number) =>
      `M${cx} ${cy + 6} C${cx - 9} ${cy - 1} ${cx - 5} ${cy - 9} ${cx} ${cy - 3} C${cx + 5} ${cy - 9} ${cx + 9} ${cy - 1} ${cx} ${cy + 6}Z`;
    return (
      <g fill="#ff2d78" stroke={INK} strokeWidth={1.2}>
        <path d={heart(left.x, left.y)} />
        <path d={heart(right.x, right.y)} />
      </g>
    );
  }

  if (mood === "shock") {
    return (
      <g>
        {[left, right].map((eye) => (
          <g key={eye.x}>
            <circle cx={eye.x} cy={eye.y} r={6.5} fill="#fff" stroke={INK} strokeWidth={1.8} />
            <circle cx={eye.x} cy={eye.y + 0.5} r={2} fill={INK} />
          </g>
        ))}
      </g>
    );
  }

  const open = (x: number, y: number, lookDown = false) => (
    <g className="chibi-blink">
      <ellipse cx={x} cy={y} rx={5.5} ry={lookDown ? 5.5 : 7} fill={INK} />
      <circle cx={x + 2} cy={y - 3} r={2.1} fill="#fff" />
      <circle cx={x - 2} cy={y + 3} r={1} fill="#fff" />
    </g>
  );

  if (mood === "wink") {
    return (
      <g>
        {open(left.x, left.y)}
        <path
          d={`M${right.x - 6} ${right.y} Q${right.x} ${right.y - 5} ${right.x + 6} ${right.y}`}
          fill="none"
          stroke={INK}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </g>
    );
  }

  const lookDown = mood === "blush";
  return (
    <g>
      {open(left.x, left.y + (lookDown ? 2 : 0), lookDown)}
      {open(right.x, right.y + (lookDown ? 2 : 0), lookDown)}
    </g>
  );
}

function Mouth({ mood }: { mood: ChibiMood }) {
  if (mood === "shock")
    return (
      <ellipse cx={60} cy={73} rx={3.2} ry={4} fill="#c2414e" stroke={INK} strokeWidth={1.3} />
    );
  if (mood === "happy" || mood === "love") {
    return (
      <path
        d="M53 69 Q60 79 67 69 Z"
        fill="#c2414e"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    );
  }
  if (mood === "blush") {
    return (
      <path
        d="M55 72 q2.5 -2 5 0 q2.5 2 5 0"
        fill="none"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    );
  }
  return (
    <path d="M54 70 Q60 76 66 70" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
  );
}

function Cheeks({ mood }: { mood: ChibiMood }) {
  const strong = mood === "blush" || mood === "love";
  return (
    <g>
      <ellipse
        cx={39}
        cy={68}
        rx={strong ? 7.5 : 6}
        ry={strong ? 4.5 : 3.5}
        fill={CHEEK}
        opacity={strong ? 0.85 : 0.55}
      />
      <ellipse
        cx={81}
        cy={68}
        rx={strong ? 7.5 : 6}
        ry={strong ? 4.5 : 3.5}
        fill={CHEEK}
        opacity={strong ? 0.85 : 0.55}
      />
      {mood === "blush" && (
        <g stroke="#e0567f" strokeWidth={1.2} strokeLinecap="round">
          <path d="M35 66 l2 4 M39 66 l2 4 M43 66 l2 4" />
          <path d="M77 66 l2 4 M81 66 l2 4 M85 66 l2 4" />
        </g>
      )}
      {mood === "shock" && (
        <path d="M92 40 q4 6 0 9 q-4 -3 0 -9Z" fill="#9fd8ff" stroke={INK} strokeWidth={1} />
      )}
    </g>
  );
}

/** Màu áo và các lớp vẽ thêm theo bộ đồ. */
function outfitStyle(who: "him" | "her", outfit?: ChibiOutfit) {
  const base =
    who === "him" ? { body: "#4c6fff", sleeve: "#4c6fff" } : { body: "#ff8ab3", sleeve: "#ff8ab3" };
  switch (outfit) {
    case "pilot":
      return { body: "#1f2a52", sleeve: "#1f2a52" };
    case "tux":
    case "vampire":
      return { body: "#1d1a24", sleeve: "#1d1a24" };
    case "chef":
      return { body: "#f4f4f4", sleeve: "#f4f4f4" };
    case "hero":
      return { body: "#2f6bff", sleeve: "#2f6bff" };
    case "astronaut":
      return { body: "#e9eef6", sleeve: "#e9eef6" };
    case "bear":
      return { body: "#a0673f", sleeve: "#a0673f" };
    default:
      return base;
  }
}

/**
 * Nhân vật chibi vẽ bằng SVG: đầu to, má hồng, mắt biết chớp.
 * "him" là anh (tóc ngắn, áo xanh), "her" là em (tóc dài, nơ hồng, váy hồng).
 */
export function Chibi({
  who,
  mood = "smile",
  pose = "down",
  outfit,
  item,
  headOnly = false,
  className,
  title,
}: {
  who: "him" | "her";
  mood?: ChibiMood;
  pose?: ChibiPose;
  outfit?: ChibiOutfit;
  /** Thứ đang cầm trên tay khi ở tư thế "hold". */
  item?: "letter" | "heart";
  /** Chỉ lấy phần đầu, dùng cho tem và ô nhỏ. */
  headOnly?: boolean;
  className?: string;
  /** Có title thì đọc được bằng trình đọc màn hình, không có thì coi là trang trí. */
  title?: string;
}) {
  const style = outfitStyle(who, outfit);
  const [leftAngle, rightAngle] = ARM_ANGLES[pose];
  const her = who === "her";
  const hair = her ? "#5a3328" : "#2b2233";

  let behind: ReactNode = null;
  if (outfit === "hero") {
    behind = (
      <path d="M42 88 L78 88 L96 132 L24 132 Z" fill="#e8364f" stroke={INK} strokeWidth={1.5} />
    );
  } else if (outfit === "vampire") {
    behind = (
      <path
        d="M38 86 L82 86 L98 134 L60 126 L22 134 Z"
        fill="#5b2a86"
        stroke={INK}
        strokeWidth={1.5}
      />
    );
  } else if (outfit === "bear") {
    behind = (
      <g fill="#a0673f" stroke={INK} strokeWidth={1.5}>
        <circle cx={32} cy={24} r={10} />
        <circle cx={88} cy={24} r={10} />
        <circle cx={60} cy={52} r={39} />
      </g>
    );
  }

  return (
    <svg
      viewBox={headOnly ? HEAD_VIEW : FULL_VIEW}
      className={cn("overflow-visible", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {behind}

      {/* Tóc dài phía sau của em. */}
      {her && (
        <path
          d="M22 52 Q18 104 38 108 L82 108 Q102 104 98 52 Z"
          fill={hair}
          stroke={INK}
          strokeWidth={1.5}
        />
      )}

      {!headOnly && (
        <g>
          <rect
            x={48}
            y={112}
            width={10}
            height={16}
            rx={5}
            fill="#2b2f44"
            stroke={INK}
            strokeWidth={1.5}
          />
          <rect
            x={62}
            y={112}
            width={10}
            height={16}
            rx={5}
            fill="#2b2f44"
            stroke={INK}
            strokeWidth={1.5}
          />
          {her ? (
            <path
              d="M45 86 L75 86 L86 118 Q60 124 34 118 Z"
              fill={style.body}
              stroke={INK}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          ) : (
            <rect
              x={42}
              y={84}
              width={36}
              height={32}
              rx={12}
              fill={style.body}
              stroke={INK}
              strokeWidth={1.5}
            />
          )}
          {/* Chi tiết trên áo theo bộ đồ. */}
          {outfit === "tux" && (
            <g>
              <path d="M54 86 L60 104 L66 86 Z" fill="#fff" />
              <path
                d="M52 90 L60 94 L52 98 Z M68 90 L60 94 L68 98 Z"
                fill="#e8364f"
                stroke={INK}
                strokeWidth={1}
              />
            </g>
          )}
          {outfit === "pilot" && (
            <g fill="#ffc94a">
              <rect x={42} y={88} width={8} height={3} rx={1} />
              <rect x={70} y={88} width={8} height={3} rx={1} />
              <path d="M56 98 l4 -3 l4 3 l-4 3 z" />
            </g>
          )}
          {outfit === "hero" && (
            <path d="M54 96 l6 -5 l6 5 l-6 8 z" fill="#ffc94a" stroke={INK} strokeWidth={1} />
          )}
          {outfit === "chef" && (
            <g fill={INK}>
              <circle cx={60} cy={95} r={1.6} />
              <circle cx={60} cy={103} r={1.6} />
            </g>
          )}
          {outfit === "vampire" && (
            <path
              d="M44 84 L52 94 L60 86 L68 94 L76 84 Z"
              fill="#c2414e"
              stroke={INK}
              strokeWidth={1}
            />
          )}
          {!outfit && !her && (
            <path d="M54 85 L60 92 L66 85" fill="#fff" stroke={INK} strokeWidth={1.2} />
          )}

          <Arm x={SHOULDER_L.x} y={SHOULDER_L.y} angle={leftAngle} sleeve={style.sleeve} />
          <Arm x={SHOULDER_R.x} y={SHOULDER_R.y} angle={rightAngle} sleeve={style.sleeve} />

          {pose === "hold" && item === "letter" && (
            <g className="chibi-bob">
              <rect
                x={45}
                y={96}
                width={30}
                height={20}
                rx={3}
                fill="#fff6ea"
                stroke={INK}
                strokeWidth={1.5}
              />
              <path d="M45 97 L60 108 L75 97" fill="none" stroke={INK} strokeWidth={1.3} />
              <path d="M60 104 c-3 -3 -6 0 -3 3 l3 3 l3 -3 c3 -3 0 -6 -3 -3z" fill="#ff2d78" />
            </g>
          )}
          {pose === "hold" && item === "heart" && (
            <path
              className="chibi-bob"
              d="M60 116 C46 106 50 94 60 101 C70 94 74 106 60 116Z"
              fill="#ff2d78"
              stroke={INK}
              strokeWidth={1.5}
            />
          )}
        </g>
      )}

      {/* Tai và đầu. */}
      {outfit !== "bear" && (
        <g fill={SKIN} stroke={INK} strokeWidth={1.5}>
          <circle cx={26} cy={58} r={6} />
          <circle cx={94} cy={58} r={6} />
        </g>
      )}
      <circle cx={60} cy={52} r={34} fill={SKIN} stroke={INK} strokeWidth={2} />

      <Cheeks mood={mood} />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {outfit === "vampire" && (
        <path
          d="M56 72 l1.5 4 l1.5 -4 M61 72 l1.5 4 l1.5 -4"
          fill="#fff"
          stroke={INK}
          strokeWidth={0.8}
        />
      )}

      {/* Tóc mái phía trước. */}
      {outfit !== "astronaut" &&
        outfit !== "bear" &&
        (her ? (
          <g>
            <path
              d="M25 54 Q24 17 60 16 Q96 17 95 54 Q86 36 72 33 Q66 44 55 39 Q44 47 25 54Z"
              fill={hair}
              stroke={INK}
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {/* Nơ hồng. */}
            <g transform="translate(86 24) rotate(18)" stroke={INK} strokeWidth={1.3}>
              <path d="M0 0 L-11 -7 L-11 7 Z M0 0 L11 -7 L11 7 Z" fill="#ff2d78" />
              <circle r={3} fill="#ff8ab3" />
            </g>
          </g>
        ) : (
          <path
            d="M25 52 Q23 16 60 15 Q97 16 95 52 Q90 34 78 31 L74 40 L67 29 L59 40 L52 29 L45 39 Q33 37 25 52Z"
            fill={hair}
            stroke={INK}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        ))}

      {/* Phụ kiện trên đầu và mặt. */}
      {outfit === "sunglasses" && (
        <g>
          <rect x={37} y={51} width={20} height={13} rx={5} fill="#1d1a24" />
          <rect x={63} y={51} width={20} height={13} rx={5} fill="#1d1a24" />
          <path d="M57 56 h6" stroke="#1d1a24" strokeWidth={2.5} />
          <path d="M40 54 l6 0" stroke="#fff" strokeWidth={1.5} opacity={0.6} />
        </g>
      )}
      {outfit === "disguise" && (
        <g fill="none" stroke={INK} strokeWidth={2}>
          <circle cx={47} cy={58} r={9} />
          <circle cx={73} cy={58} r={9} />
          <path d="M56 58 h8" />
          <ellipse cx={60} cy={66} rx={4} ry={5} fill="#ffc7a8" />
          <path d="M48 72 Q54 66 60 71 Q66 66 72 72 Q66 74 60 72 Q54 74 48 72Z" fill={INK} />
        </g>
      )}
      {outfit === "hero" && (
        <g>
          <path
            d="M33 52 Q60 44 87 52 L85 64 Q60 58 35 64 Z"
            fill="#e8364f"
            stroke={INK}
            strokeWidth={1.3}
          />
          <ellipse cx={47} cy={57} rx={5} ry={4} fill="#fff" />
          <ellipse cx={73} cy={57} rx={5} ry={4} fill="#fff" />
          <circle cx={47} cy={57} r={2.2} fill={INK} />
          <circle cx={73} cy={57} r={2.2} fill={INK} />
        </g>
      )}
      {outfit === "pilot" && (
        <g stroke={INK} strokeWidth={1.5}>
          <path d="M26 30 Q60 4 94 30 L92 38 L28 38 Z" fill="#1f2a52" />
          <path d="M28 38 Q60 46 92 38 L90 42 Q60 50 30 42 Z" fill="#111" />
          <path d="M55 24 l5 -4 l5 4 l-5 4 z" fill="#ffc94a" strokeWidth={1} />
        </g>
      )}
      {outfit === "chef" && (
        <g fill="#fff" stroke={INK} strokeWidth={1.5}>
          <circle cx={44} cy={10} r={11} />
          <circle cx={60} cy={4} r={13} />
          <circle cx={76} cy={10} r={11} />
          <rect x={36} y={12} width={48} height={16} rx={3} />
        </g>
      )}
      {outfit === "astronaut" && (
        <g>
          <circle
            cx={60}
            cy={52}
            r={41}
            fill="#bfe6ff"
            opacity={0.25}
            stroke="#dbe8f5"
            strokeWidth={4}
          />
          <path
            d="M34 34 Q42 22 54 20"
            fill="none"
            stroke="#fff"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.8}
          />
          <circle cx={60} cy={8} r={3} fill="#ff2d78" />
          <path d="M60 11 v-6" stroke="#dbe8f5" strokeWidth={2} />
        </g>
      )}
      {outfit === "bear" && (
        <g fill="#f3b6c4">
          <circle cx={32} cy={24} r={5} />
          <circle cx={88} cy={24} r={5} />
        </g>
      )}
    </svg>
  );
}

/** Trái tim nhỏ bay lên, dùng làm trang trí quanh các cảnh chibi. */
export function FloatingHearts({ count = 5, className }: { count?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="absolute bottom-1/3 text-[#ff2d78]"
          style={{
            left: `${15 + ((index * 37) % 70)}%`,
            fontSize: `${0.7 + (index % 3) * 0.3}rem`,
            animation: `chibi-heart ${2.6 + (index % 3) * 0.6}s ${index * 0.45}s ease-out infinite`,
          }}
        >
          ♥
        </span>
      ))}
    </span>
  );
}
