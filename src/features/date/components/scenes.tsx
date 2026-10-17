import { r1, scatter, SCENE_H as H, SCENE_W as W } from "../lib/scatter";

/** Đồi lượn sóng mềm (dùng cho Đà Lạt và cảnh đêm), tính từ vài sóng sin chồng nhau. */
function hills(baseY: number, amp: number, salt: number) {
  let path = `M0 ${H} L0 ${baseY}`;
  for (let x = 0; x <= W; x += 40) {
    const y =
      baseY +
      Math.sin(x / 210 + salt) * amp +
      Math.sin(x / 90 + salt * 2) * amp * 0.35 +
      (scatter(x, salt) - 0.5) * amp * 0.15;
    path += ` L${x} ${r1(y)}`;
  }
  return `${path} L${W} ${H} Z`;
}

function Sky({ stops }: { stops: string }) {
  return <div className="absolute inset-0" style={{ background: `linear-gradient(${stops})` }} />;
}

function SceneSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
    >
      {children}
    </svg>
  );
}

/** Trời đêm sân bay lúc mới vào: không lộ gì, chỉ có đèn đường băng ở chân trang. */
export function NightScene() {
  return (
    <>
      <Sky stops="#070a12, #0d0a1a 60%, #170a17" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(255,201,74,0.18), transparent 55%), radial-gradient(ellipse at 50% 120%, rgba(255,45,120,0.25), transparent 50%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-6 opacity-60">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-[#ffc94a] shadow-[0_0_10px_#ffc94a]"
            style={{ animation: `board-blink 2.4s ${index * 0.12}s infinite` }}
          />
        ))}
      </div>
    </>
  );
}

/** Đà Lạt: đồi thông lớp lớp, hồ Xuân Hương phản chiếu trời, sương sớm. */
const PINES = Array.from({ length: 60 }, (_, index) => ({
  x: r1(scatter(index, 41) * W),
  y: r1(660 + scatter(index, 42) * 120),
  h: r1(40 + scatter(index, 43) * 50),
}));

export function DalatScene() {
  return (
    <>
      <Sky stops="#0b1626 0%, #1e3a52 40%, #5f8f96 70%, #b9d6c9 88%" />
      <SceneSvg>
        <path d={hills(560, 40, 1)} fill="#3d6466" opacity={0.75} />
        <ellipse cx={W / 2} cy={600} rx={W * 0.7} ry={36} fill="#e8f3ee" opacity={0.3} />
        <path d={hills(650, 45, 4)} fill="#22413b" />
        {/* Hồ Xuân Hương. */}
        <ellipse cx={W * 0.55} cy={790} rx={W * 0.38} ry={46} fill="#7fb0ad" opacity={0.75} />
        <ellipse cx={W * 0.55} cy={782} rx={W * 0.3} ry={6} fill="#e8f3ee" opacity={0.35} />
        {PINES.map((pine, index) => (
          <path
            key={index}
            d={`M${pine.x} ${pine.y - pine.h} L${r1(pine.x - pine.h * 0.28)} ${pine.y} L${r1(pine.x + pine.h * 0.28)} ${pine.y} Z`}
            fill="#0d231c"
          />
        ))}
        <path d={hills(840, 20, 9)} fill="#0b1a15" />
      </SceneSvg>
    </>
  );
}

/** Phú Quốc: hoàng hôn trên biển, mặt trời lặn nửa vời, hàng dừa và bãi cát. */
function Palm({ x, flip }: { x: number; flip?: boolean }) {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${x} 0) scale(${s} 1)`} fill="#1a0f1f">
      <path d="M0 900 C 10 800, 30 720, 70 640 L80 646 C 44 724, 26 802, 18 900 Z" />
      {[-60, -25, 10, 45, 80].map((angle) => (
        <path
          key={angle}
          d="M75 640 C 110 610, 160 610, 200 640 C 160 628, 110 630, 75 646 Z"
          transform={`rotate(${angle} 75 643)`}
        />
      ))}
    </g>
  );
}

export function PhuQuocScene() {
  return (
    <>
      <Sky stops="#1b1036 0%, #5b2a5e 35%, #e0645a 62%, #ffb067 75%" />
      <SceneSvg>
        <circle cx={W / 2} cy={640} r={95} fill="#ffd27a" opacity={0.95} />
        {/* Biển với các vệt nắng lấp lánh. */}
        <rect x={0} y={640} width={W} height={200} fill="#2a3f74" />
        {Array.from({ length: 9 }, (_, index) => (
          <rect
            key={index}
            x={W / 2 - 120 + index * 6}
            y={660 + index * 16}
            width={240 - index * 12}
            height={3}
            rx={1.5}
            fill="#ffd27a"
            opacity={0.6 - index * 0.05}
            style={{ animation: `hg-river ${2 + index * 0.3}s ease-in-out infinite` }}
          />
        ))}
        <path d={`M0 ${H} L0 830 C 400 800, 1000 860, ${W} 820 L${W} ${H} Z`} fill="#e3a873" />
        <Palm x={60} />
        <Palm x={1380} flip />
      </SceneSvg>
    </>
  );
}

/** Seoul: phố đêm lên đèn, tháp Namsan trên đồi, sông Hán phản chiếu ánh đèn. */
const BUILDINGS = Array.from({ length: 34 }, (_, index) => {
  const width = r1(30 + scatter(index, 51) * 40);
  const height = r1(80 + scatter(index, 52) * 200);
  return { x: r1(index * 43 - 10), width, height };
});

export function SeoulScene() {
  return (
    <>
      <Sky stops="#040713 0%, #121a44 45%, #3b2a6b 75%, #6b3a7a 90%" />
      <SceneSvg>
        {/* Đồi Namsan và tháp. */}
        <path d={`M300 760 C 520 600, 900 600, 1140 760 Z`} fill="#141433" />
        <rect x={714} y={470} width={12} height={180} fill="#2a2a55" />
        <ellipse cx={720} cy={510} rx={30} ry={12} fill="#3a3a70" />
        <rect x={718} y={400} width={4} height={72} fill="#3a3a70" />
        <circle
          cx={720}
          cy={398}
          r={4}
          fill="#ff4d6d"
          style={{ animation: "board-blink 1.6s infinite" }}
        />
        <ellipse cx={720} cy={510} rx={30} ry={3} fill="#ffd27a" opacity={0.7} />
        {BUILDINGS.map((b, index) => (
          <g key={index}>
            <rect x={b.x} y={760 - b.height} width={b.width} height={b.height} fill="#0b0d22" />
            {Array.from({ length: Math.floor(b.height / 22) }, (_, row) =>
              Array.from({ length: Math.floor(b.width / 12) }, (_, col) =>
                scatter(index * 97 + row * 13 + col, 53) > 0.55 ? (
                  <rect
                    key={`${row}-${col}`}
                    x={b.x + 4 + col * 12}
                    y={760 - b.height + 8 + row * 22}
                    width={5}
                    height={8}
                    fill={scatter(index + row + col, 54) > 0.5 ? "#ffd27a" : "#9fd8ff"}
                    opacity={0.8}
                  />
                ) : null,
              ),
            )}
          </g>
        ))}
        {/* Sông Hán. */}
        <rect x={0} y={760} width={W} height={140} fill="#0a1030" />
        {Array.from({ length: 20 }, (_, index) => (
          <rect
            key={index}
            x={r1(scatter(index, 55) * W)}
            y={r1(775 + scatter(index, 56) * 100)}
            width={r1(20 + scatter(index, 57) * 50)}
            height={2}
            fill={index % 2 ? "#ffd27a" : "#9fd8ff"}
            opacity={0.45}
            style={{ animation: `hg-river ${2 + (index % 4)}s ease-in-out infinite` }}
          />
        ))}
      </SceneSvg>
    </>
  );
}

/** Tokyo: núi Phú Sĩ phủ tuyết, chùa năm tầng, cành anh đào và cánh hoa rơi. */
const BLOSSOMS = Array.from({ length: 70 }, (_, index) => ({
  x: r1(scatter(index, 61) * 360),
  y: r1(scatter(index, 62) * 220),
  r: r1(5 + scatter(index, 63) * 7),
}));
const PETALS = Array.from({ length: 18 }, (_, index) => ({
  left: `${(scatter(index, 64) * 100).toFixed(1)}%`,
  delay: `${(scatter(index, 65) * 6).toFixed(1)}s`,
  duration: `${(6 + scatter(index, 66) * 5).toFixed(1)}s`,
}));

function Pagoda({ x }: { x: number }) {
  return (
    <g fill="#1a1024" transform={`translate(${x} 0)`}>
      {[0, 1, 2, 3, 4].map((tier) => {
        const y = 760 - tier * 52;
        const w = 120 - tier * 16;
        return (
          <g key={tier}>
            <path
              d={`M${-w / 2 - 18} ${y - 30} L${w / 2 + 18} ${y - 30} L${w / 2} ${y - 44} L${-w / 2} ${y - 44} Z`}
            />
            <rect x={-w / 2 + 12} y={y - 30} width={w - 24} height={30} />
          </g>
        );
      })}
      <rect x={-2} y={460} width={4} height={60} />
    </g>
  );
}

export function TokyoScene() {
  return (
    <>
      <Sky stops="#140c2c 0%, #4a2f6e 40%, #c46f9a 68%, #ffc2c8 85%" />
      <SceneSvg>
        {/* Phú Sĩ và chóp tuyết. */}
        <path d="M380 800 L640 470 Q720 430 800 470 L1060 800 Z" fill="#3b2c5e" />
        <path
          d="M640 470 Q720 430 800 470 L760 530 L735 505 L712 535 L690 505 L668 528 Z"
          fill="#f4f1ff"
        />
        <path d={hills(800, 18, 6)} fill="#22163a" />
        <Pagoda x={1130} />
        <path d={hills(860, 12, 8)} fill="#140c22" />
        {/* Cành anh đào góc trên bên trái. */}
        <path
          d="M-20 120 C 120 140, 220 180, 330 260"
          stroke="#2a1622"
          strokeWidth={10}
          fill="none"
        />
        <path d="M120 150 C 160 90, 230 70, 300 60" stroke="#2a1622" strokeWidth={6} fill="none" />
        {BLOSSOMS.map((blossom, index) => (
          <circle
            key={index}
            cx={blossom.x}
            cy={blossom.y + 40}
            r={blossom.r}
            fill={index % 3 ? "#ffb7cf" : "#ffd9e6"}
            opacity={0.9}
          />
        ))}
      </SceneSvg>
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="absolute top-0 size-2 rounded-[60%_0] bg-[#ffc1d9]"
          style={{
            left: petal.left,
            animation: `petal-fall ${petal.duration} ${petal.delay} linear infinite`,
          }}
        />
      ))}
    </>
  );
}
