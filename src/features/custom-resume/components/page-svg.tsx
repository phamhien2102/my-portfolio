import { useId } from "react";

import type { Family } from "../lib/fonts";
import { ICONS, type IconName } from "../lib/icons";
import { segsToSvg, shapeSegs } from "../lib/shape";
import { PAGE_H, PAGE_W, type Page, type Prim } from "../lib/layout";

function PrimNode({ p, family, uid, i }: { p: Prim; family: Family; uid: string; i: number }) {
  if (p.k === "rect") return <rect x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill} />;
  if (p.k === "line") {
    return (
      <line
        x1={p.x1}
        y1={p.y1}
        x2={p.x2}
        y2={p.y2}
        stroke={p.color}
        strokeWidth={p.width}
        shapeRendering="geometricPrecision"
      />
    );
  }
  if (p.k === "icon") {
    const d = ICONS[p.name as IconName];
    if (!d) return null;
    return (
      <path
        d={d}
        transform={`translate(${p.x} ${p.y}) scale(${p.size / 24})`}
        fill="none"
        stroke={p.color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  if (p.k === "image") {
    const id = `${uid}-av-${i}`;
    return (
      <>
        <clipPath id={id}>
          <path d={segsToSvg(shapeSegs(p.shape, p.x, p.y, p.w, p.h))} />
        </clipPath>
        <image
          href={p.src}
          x={p.x}
          y={p.y}
          width={p.w}
          height={p.h}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${id})`}
        />
      </>
    );
  }
  const text = (
    <text
      x={p.x}
      y={p.y}
      fill={p.color}
      fontFamily={`"${family.css}"`}
      fontSize={p.size}
      fontWeight={p.f === "b" ? 700 : 400}
      fontStyle={p.f === "i" ? "italic" : "normal"}
      letterSpacing={p.track || undefined}
      fillOpacity={p.opacity}
      transform={p.rotate ? `rotate(${-p.rotate} ${p.x} ${p.y})` : undefined}
    >
      {p.s}
    </text>
  );
  return p.link ? (
    <a href={p.link} target="_blank" rel="noreferrer">
      {text}
    </a>
  ) : (
    text
  );
}

/** One A4 sheet. Everything is positioned in points, so any width just scales it. */
export function PageSvg({
  page,
  family,
  width,
  label,
  interactive = true,
}: {
  page: Page;
  family: Family;
  width: number | "fluid";
  label: string;
  interactive?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      className="cv-page block bg-[var(--card)]"
      {...(width === "fluid" ? {} : { width, height: (width * PAGE_H) / PAGE_W })}
      viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
      role="img"
      aria-label={label}
      style={{
        ...(width === "fluid"
          ? { width: "100%", height: "auto", aspectRatio: `${PAGE_W} / ${PAGE_H}` }
          : {}),
        ...(interactive ? {} : { pointerEvents: "none" }),
      }}
    >
      <rect x={0} y={0} width={PAGE_W} height={PAGE_H} fill="#fff" />
      {page.prims.map((p, i) => (
        <PrimNode key={i} i={i} uid={uid} p={p} family={family} />
      ))}
    </svg>
  );
}
