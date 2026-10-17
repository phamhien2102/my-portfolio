/** Vị trí "ngẫu nhiên" tính từ chỉ số, để server và client vẽ ra cùng một bầu trời. */
function scatter(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const STARS = Array.from({ length: 48 }, (_, index) => ({
  left: `${(scatter(index, 1) * 100).toFixed(2)}%`,
  top: `${(scatter(index, 2) * 70).toFixed(2)}%`,
  size: 1 + Math.round(scatter(index, 3) * 2),
  delay: `${(scatter(index, 4) * 4).toFixed(2)}s`,
  duration: `${(2 + scatter(index, 5) * 3).toFixed(2)}s`,
}));

const CLOUDS = [
  { top: "12%", width: 340, duration: "70s", delay: "-10s", tint: "rgba(255,255,255,0.05)" },
  { top: "38%", width: 460, duration: "95s", delay: "-60s", tint: "rgba(255,138,179,0.06)" },
  { top: "64%", width: 380, duration: "80s", delay: "-30s", tint: "rgba(255,201,74,0.05)" },
];

/** Bầu trời đêm: sao nhấp nháy, mây trôi, và một máy bay kéo băng rôn bay ngang định kỳ. */
export function Sky() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(255,201,74,0.18), transparent 55%), radial-gradient(ellipse at 50% 120%, rgba(255,45,120,0.25), transparent 50%), linear-gradient(#070a12, #0d0a1a 60%, #170a17)",
        }}
      />
      {STARS.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animation: `twinkle ${star.duration} ${star.delay} ease-in-out infinite`,
          }}
        />
      ))}
      {CLOUDS.map((cloud) => (
        <span
          key={cloud.top}
          className="absolute -left-[40vw] h-24 rounded-full blur-2xl"
          style={{
            top: cloud.top,
            width: cloud.width,
            background: cloud.tint,
            animation: `cloud-drift ${cloud.duration} ${cloud.delay} linear infinite`,
          }}
        />
      ))}
      <div
        className="absolute top-3 left-0 flex items-center gap-1 text-white/70 sm:top-[7%]"
        style={{ animation: "banner-plane 26s 4s linear infinite" }}
      >
        <span className="text-2xl">✈</span>
        <span className="h-px w-6 bg-white/40" />
        <span className="rounded-sm bg-[#ff2d78]/80 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.2em] text-white [clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%)]">
          ♥ GO OUT WITH ME? ♥
        </span>
      </div>
      {/* Đèn đường băng chạy dọc chân trang. */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center gap-6 opacity-60">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            className="size-1.5 rounded-full bg-[#ffc94a] shadow-[0_0_10px_#ffc94a]"
            style={{ animation: `board-blink 2.4s ${index * 0.12}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}
