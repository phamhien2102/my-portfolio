import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export interface OgCardOptions {
  /** Small label above the title, such as "Course". */
  eyebrow: string;
  title: string;
  tagline: string;
  /** The facts under the tagline. */
  chips: readonly string[];
  /** The card's accent colour pair: a light fill and the stronger edge. */
  accent: { fill: string; edge: string };
  /** A dark card (the main site) or a light one (the course pages). */
  theme: "dark" | "light";
}

/**
 * The picture that a link shows when it is shared. One layout for every page, drawn with system
 * fonts so it needs nothing from the network: a coloured block, the name, one line, and chips.
 */
export function ogCard({ eyebrow, title, tagline, chips, accent, theme }: OgCardOptions) {
  const dark = theme === "dark";
  const ink = dark ? "#e8f0f7" : "#12202c";
  const muted = dark ? "#8a9cad" : "#5b6f82";
  const paper = dark ? "#0b1118" : "#edf3f8";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: paper,
        color: ink,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: accent.edge,
          }}
        />
        <div style={{ fontSize: 30, letterSpacing: 6, color: muted, fontWeight: 700 }}>
          {eyebrow.toUpperCase()}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 112, lineHeight: 1.05, fontWeight: 800, letterSpacing: -3 }}>
          {title}
        </div>
        <div style={{ marginTop: 24, fontSize: 40, color: muted, maxWidth: 980 }}>{tagline}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 14 }}>
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                padding: "10px 26px",
                fontSize: 28,
                fontWeight: 700,
                color: "#12202c",
                background: accent.fill,
                border: `3px solid ${dark ? accent.edge : "#12202c"}`,
                borderRadius: 999,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 28, color: muted, fontWeight: 700 }}>hienpt.dev</div>
      </div>
    </div>,
    OG_SIZE,
  );
}
