import type { Task1Visual } from "./types";

const COLORS = ["#1f68b8", "#12202c", "#86bfe8", "#b8432f"];

function niceMax(v: number): number {
  const pow = 10 ** Math.floor(Math.log10(v || 1));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}

/** The data for a Task 1 question: a table, or a simple bar or line chart drawn as SVG. */
export function Task1Chart({ visual }: { visual: Task1Visual }) {
  if (visual.kind === "table") {
    return (
      <figure className="mx-figure">
        <figcaption>{visual.caption}</figcaption>
        <div className="mx-table-wrap">
          <table className="mx-data">
            <thead>
              <tr>
                {visual.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visual.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    );
  }

  const W = 600;
  const H = 300;
  const L = 52;
  const R = 16;
  const T = 30;
  const B = 44;
  const max = niceMax(Math.max(...visual.series.flatMap((s) => s.values)));
  const ticks = 5;
  const x0 = L;
  const x1 = W - R;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const band = (x1 - x0) / visual.categories.length;
  const cx = (i: number) => x0 + band * (i + 0.5);
  const barW = Math.min(36, (band * 0.7) / visual.series.length);

  return (
    <figure className="mx-figure">
      <figcaption>{visual.caption}</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H + 24}`}
        className="mx-chart"
        role="img"
        aria-label={visual.caption}
      >
        {Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i).map((t) => (
          <g key={t}>
            <line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke="#d3dfea" />
            <text x={x0 - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5b6f82">
              {t}
            </text>
          </g>
        ))}
        <text x={x0} y={14} fontSize="11" fill="#5b6f82">
          {visual.unit}
        </text>
        {visual.categories.map((c, i) => (
          <text key={c} x={cx(i)} y={H - B + 18} textAnchor="middle" fontSize="11" fill="#12202c">
            {c}
          </text>
        ))}
        {visual.kind === "bar" &&
          visual.series.map((s, si) =>
            s.values.map((v, i) => (
              <rect
                key={`${si}-${i}`}
                x={cx(i) - (barW * visual.series.length) / 2 + si * barW}
                y={y(v)}
                width={barW - 2}
                height={y(0) - y(v)}
                fill={COLORS[si % COLORS.length]}
              />
            )),
          )}
        {visual.kind === "line" &&
          visual.series.map((s, si) => (
            <g key={s.name}>
              <polyline
                fill="none"
                stroke={COLORS[si % COLORS.length]}
                strokeWidth="2.5"
                points={s.values.map((v, i) => `${cx(i)},${y(v)}`).join(" ")}
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={cx(i)} cy={y(v)} r="3.5" fill={COLORS[si % COLORS.length]} />
              ))}
            </g>
          ))}
        <line x1={x0} x2={x1} y1={y(0)} y2={y(0)} stroke="#12202c" />
        {visual.series.map((s, si) => {
          // Legend entries sit side by side, each as wide as its name.
          const dx = visual.series.slice(0, si).reduce((sum, t) => sum + t.name.length * 7 + 44, 0);
          return (
            <g key={s.name} transform={`translate(${x0 + dx}, ${H + 6})`}>
              <rect width="12" height="12" fill={COLORS[si % COLORS.length]} />
              <text x="18" y="11" fontSize="12" fill="#12202c">
                {s.name}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
