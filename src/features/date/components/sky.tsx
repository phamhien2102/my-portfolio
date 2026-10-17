"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

import { type SceneName } from "../data";
import { r1, scatter } from "../lib/scatter";
import { DalatScene, NightScene, PhuQuocScene, SeoulScene, TokyoScene } from "./scenes";
import { usePilot } from "../lib/pilot";

/** Khung vẽ của cảnh núi; SVG phủ kín màn hình và neo vào đáy. */
const W = 1440;
const H = 900;

/** Một cảnh nền xếp chồng: chỉ cảnh đang chọn hiện rõ, các cảnh khác mờ hẳn đi. */
function SceneLayer({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-700",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      {children}
    </div>
  );
}

/**
 * Một dãy núi đá tai mèo kiểu Hà Giang: nhiều đỉnh nhọn, sườn dốc, chân núi nối nhau.
 * Các đỉnh được tính từ chỉ số nên lần nào vẽ cũng ra cùng một dãy.
 */
function karst(baseY: number, peaks: number, minH: number, maxH: number, salt: number) {
  const step = W / peaks;
  let path = `M0 ${H} L0 ${baseY}`;
  for (let i = 0; i < peaks; i++) {
    const x0 = i * step - step * 0.15;
    const width = step * (1.1 + scatter(i, salt) * 0.5);
    const height = minH + scatter(i, salt + 1) * (maxH - minH);
    const peakX = x0 + width * (0.4 + scatter(i, salt + 2) * 0.2);
    const peakY = baseY - height;
    const valleyY = baseY - height * 0.12;
    const x1 = x0 + width;
    path += ` C${r1(x0 + width * 0.25)} ${r1(valleyY)} ${r1(peakX - width * 0.1)} ${r1(peakY + height * 0.05)} ${r1(peakX)} ${r1(peakY)}`;
    path += ` C${r1(peakX + width * 0.08)} ${r1(peakY + height * 0.08)} ${r1(x1 - width * 0.2)} ${r1(valleyY)} ${r1(x1)} ${r1(baseY - height * 0.05)}`;
  }
  return `${path} L${W} ${H} Z`;
}

const FAR = karst(560, 11, 140, 260, 1);
const MID = karst(650, 8, 150, 250, 7);
const NEAR = karst(760, 6, 120, 210, 13);

/** Đèo Mã Pí Lèng: đường ngoằn ngoèo vắt ngang sườn núi lớp giữa. */
const PASS =
  "M-20 600 C 120 560, 200 640, 320 600 S 520 540, 640 590 S 860 650, 980 600 S 1200 540, 1320 585 S 1460 620, 1480 600";

/** Sông Nho Quế uốn dưới vực. */
const RIVER =
  "M-20 760 C 180 720, 320 800, 520 770 S 860 720, 1040 765 S 1300 800, 1460 760 L1460 790 C 1300 830, 1060 790, 900 810 S 520 830, 320 810 S 100 780, -20 800 Z";

const STARS = Array.from({ length: 46 }, (_, index) => ({
  left: `${(scatter(index, 21) * 100).toFixed(2)}%`,
  top: `${(scatter(index, 22) * 45).toFixed(2)}%`,
  size: 1 + Math.round(scatter(index, 23) * 2),
  delay: `${(scatter(index, 24) * 4).toFixed(2)}s`,
  duration: `${(2 + scatter(index, 25) * 3).toFixed(2)}s`,
}));

/** Hoa tam giác mạch trên đồi ở chân trang. */
const FLOWERS = Array.from({ length: 170 }, (_, index) => ({
  x: r1(scatter(index, 31) * W),
  y: r1(820 + scatter(index, 32) * 80),
  r: r1(2 + scatter(index, 33) * 3.2),
  color: ["#ff8ab3", "#ffc1d9", "#ff5c9a", "#fff0f6"][index % 4],
  delay: `${(scatter(index, 34) * 3).toFixed(2)}s`,
}));

/** Mức trôi theo cuộn trang của từng lớp: lớp gần trôi nhiều hơn lớp xa. */
const PARALLAX = { far: 0.03, mid: 0.06, near: 0.1, field: 0.14 } as const;
const MAX_SHIFT = 90;

/**
 * Nền trang. Lúc đầu là trời đêm sân bay; bấm chuyến nào thì hiện cảnh nơi đó; lộ chuyến hẹn hò
 * thì chuyển sang hoàng hôn Hà Giang. Trời tím hồng có sao và trăng, núi đá tai mèo nhiều lớp,
 * sương trôi, đèo Mã Pí Lèng có đèn xe chạy, sông Nho Quế và đồi hoa tam giác mạch.
 * Cố định theo màn hình; các lớp núi trôi lệch nhau khi cuộn để tạo chiều sâu.
 */
export function Sky({
  banner,
  scene,
}: {
  banner: boolean;
  /** Cảnh đang hiện: đêm sân bay, cảnh từng chuyến khi bấm, hoặc Hà Giang. */
  scene: SceneName;
}) {
  const pilot = usePilot();
  const layers = useRef<Record<keyof typeof PARALLAX, SVGGElement | null>>({
    far: null,
    mid: null,
    near: null,
    field: null,
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      for (const key of Object.keys(PARALLAX) as Array<keyof typeof PARALLAX>) {
        const shift = Math.min(MAX_SHIFT, y * PARALLAX[key]);
        layers.current[key]?.setAttribute("transform", `translate(0 ${shift.toFixed(1)})`);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <SceneLayer active={scene === "night"}>
        <NightScene />
      </SceneLayer>
      <SceneLayer active={scene === "hagiang"}>
        {/* Trời hoàng hôn: tím đêm ở trên, hồng cam sát chân trời. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(#070a18 0%, #1a1233 28%, #4a2350 50%, #a8466c 66%, #f08a72 78%, #f6b38a 86%)",
          }}
        />
        <div
          className="absolute inset-x-0 top-[55%] h-[30%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, rgba(255,190,140,0.55), transparent 65%)",
          }}
        />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="hg-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8a5a8c" />
              <stop offset="1" stopColor="#4a2c55" />
            </linearGradient>
            <linearGradient id="hg-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4b2c58" />
              <stop offset="1" stopColor="#24173a" />
            </linearGradient>
            <linearGradient id="hg-near" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#24173a" />
              <stop offset="1" stopColor="#0d0a1c" />
            </linearGradient>
            <linearGradient id="hg-river" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1f8f8a" />
              <stop offset="0.5" stopColor="#4fd1c5" />
              <stop offset="1" stopColor="#1f8f8a" />
            </linearGradient>
            <filter id="hg-blur" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="18" />
            </filter>
          </defs>

          <g ref={(el) => void (layers.current.far = el)}>
            <path d={FAR} fill="url(#hg-far)" opacity={0.85} />
            {/* Sương trôi giữa các thung. */}
            <ellipse
              cx={W / 2}
              cy={560}
              rx={W * 0.7}
              ry={40}
              fill="#fbe3ef"
              opacity={0.28}
              filter="url(#hg-blur)"
              style={{ animation: "hg-mist 18s ease-in-out infinite alternate" }}
            />
          </g>

          <g ref={(el) => void (layers.current.mid = el)}>
            <path d={MID} fill="url(#hg-mid)" />
            {/* Đèo Mã Pí Lèng và đèn xe máy chạy trên đèo. */}
            <path
              d={PASS}
              fill="none"
              stroke="#f3c98b"
              strokeWidth={2.5}
              opacity={0.45}
              strokeDasharray="10 7"
            />
            {[0, 4.5, 9].map((begin) => (
              <circle key={begin} r={3.2} fill="#ffe08a" opacity={0.95}>
                <animateMotion dur="14s" begin={`${begin}s`} repeatCount="indefinite" path={PASS} />
              </circle>
            ))}
            <ellipse
              cx={W * 0.3}
              cy={690}
              rx={W * 0.45}
              ry={30}
              fill="#f6c6dd"
              opacity={0.18}
              filter="url(#hg-blur)"
              style={{ animation: "hg-mist 24s ease-in-out infinite alternate-reverse" }}
            />
          </g>

          <g ref={(el) => void (layers.current.near = el)}>
            {/* Sông Nho Quế dưới vực, lấp lánh nhẹ. */}
            <path
              d={RIVER}
              fill="url(#hg-river)"
              opacity={0.75}
              style={{ animation: "hg-river 5s ease-in-out infinite" }}
            />
            <path d={NEAR} fill="url(#hg-near)" />
          </g>

          <g ref={(el) => void (layers.current.field = el)}>
            {/* Đồi hoa tam giác mạch. */}
            <path
              d={`M0 ${H} L0 830 C 360 790, 720 850, 1080 810 S 1440 830, 1440 820 L1440 ${H} Z`}
              fill="#2a1430"
            />
            {FLOWERS.map((flower, index) => (
              <circle
                key={index}
                cx={flower.x}
                cy={flower.y}
                r={flower.r}
                fill={flower.color}
                opacity={0.85}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center bottom",
                  animation: `hg-sway 3.2s ${flower.delay} ease-in-out infinite`,
                }}
              />
            ))}
          </g>
        </svg>
      </SceneLayer>
      <SceneLayer active={scene === "dalat"}>
        <DalatScene />
      </SceneLayer>
      <SceneLayer active={scene === "phuquoc"}>
        <PhuQuocScene />
      </SceneLayer>
      <SceneLayer active={scene === "seoul"}>
        <SeoulScene />
      </SceneLayer>
      <SceneLayer active={scene === "tokyo"}>
        <TokyoScene />
      </SceneLayer>
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

      {/* Trăng khuyết. */}
      <span
        className="absolute top-[9%] right-[12%] size-10 rounded-full sm:size-14"
        style={{
          boxShadow: "inset -10px 6px 0 0 #ffe9c7",
          filter: "drop-shadow(0 0 14px rgba(255,233,199,0.6))",
        }}
      />

      {/* Lớp tối phủ nhẹ phía trên để chữ trắng vẫn dễ đọc. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(rgba(7,10,18,0.55), rgba(7,10,18,0.1) 55%, rgba(7,10,18,0.35))",
        }}
      />

      {/* Băng rôn chỉ bay ra sau khi đã lộ chuyến hẹn hò, để không lộ bài từ đầu. */}
      {banner && (
        <div
          className="absolute top-3 left-0 flex items-center gap-1 text-white/70 sm:top-[7%]"
          style={{ animation: "banner-plane 26s 1s linear infinite both" }}
        >
          <span className="text-2xl">✈</span>
          <span className="h-px w-6 bg-white/40" />
          <span className="rounded-sm bg-[#ff2d78]/80 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.2em] text-white [clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%)]">
            ♥ GO OUT WITH {pilot.board} ♥
          </span>
        </div>
      )}
    </div>
  );
}
