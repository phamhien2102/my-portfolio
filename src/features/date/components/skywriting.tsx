import { usePilot } from "../lib/pilot";

/** Đường vẽ trái tim cho vệt khói, trong khung 400 × 320. */
const HEART =
  "M200 280 C 60 190, 40 80, 120 60 C 165 50, 195 85, 200 112 C 205 85, 235 50, 280 60 C 360 80, 340 190, 200 280 Z";
const DRAW_S = 2.8;

/**
 * Vệt khói sau khi cất cánh: một chiếc máy bay vẽ trái tim trên trời,
 * rồi tên em hiện ra bằng khói ở giữa. Tự mờ đi sau vài giây.
 */
export function Skywriting({ name }: { name: string }) {
  const pilot = usePilot();
  return (
    <div
      role="img"
      aria-label={`A plane draws a heart in the sky with the name ${name}`}
      // Phủ nền đêm mờ trong lúc vẽ, để vệt khói không lẫn vào vé và đồng hồ phía sau.
      // Lớp phủ chặn mọi cú bấm, để em xem hết trái tim rồi mới bấm được các nút bên dưới.
      className="fixed inset-0 z-40 flex touch-none items-center justify-center bg-[#070a12]/80 backdrop-blur-sm select-none"
      style={{ animation: "sky-fade 7s ease-in forwards" }}
    >
      <svg viewBox="0 0 400 320" className="w-[min(92vw,560px)] overflow-visible">
        <defs>
          <filter id="smoke" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* Hai lớp khói: lớp mờ to bên dưới, lớp rõ hơn bên trên. */}
        <path
          d={HEART}
          pathLength={1}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={14}
          strokeLinecap="round"
          filter="url(#smoke)"
          style={{ strokeDasharray: 1, animation: `sky-draw ${DRAW_S}s ease-in-out both` }}
        />
        <path
          d={HEART}
          pathLength={1}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={4}
          strokeLinecap="round"
          style={{ strokeDasharray: 1, animation: `sky-draw ${DRAW_S}s ease-in-out both` }}
        />

        {/* Máy bay bay theo đúng nét vẽ. */}
        <text fontSize={26} fill="#fff" dominantBaseline="middle" textAnchor="middle">
          ✈
          <animateMotion dur={`${DRAW_S}s`} path={HEART} rotate="auto" fill="freeze" />
        </text>

        {/* Tên em: một lớp khói nhoè làm quầng, một lớp chữ rõ nét bên trên. */}
        <g style={{ animation: `sky-name 1.4s ${DRAW_S - 0.3}s ease-out both` }}>
          {[true, false].map((glow) => (
            <text
              key={String(glow)}
              x={200}
              y={168}
              textAnchor="middle"
              fill="#fff"
              fontSize={46}
              fontStyle="italic"
              fontFamily='"Snell Roundhand", "Brush Script MT", "Segoe Script", cursive'
              filter={glow ? "url(#smoke)" : undefined}
              opacity={glow ? 0.8 : 1}
              stroke={glow ? "#fff" : undefined}
              strokeWidth={glow ? 6 : undefined}
            >
              {name}
            </text>
          ))}
        </g>
        <text
          x={200}
          y={205}
          textAnchor="middle"
          fill="#ffd6e7"
          fontSize={16}
          fontFamily='"Snell Roundhand", "Brush Script MT", "Segoe Script", cursive'
          style={{ animation: `sky-name 1.2s ${DRAW_S + 0.5}s ease-out both` }}
        >
          ♥ {pilot.name}
        </text>
      </svg>
    </div>
  );
}
