import { BRIDGE, TRACKS } from "../data";

/** What a React Native developer already knows, and its name on each native side. */
export function BridgeTable() {
  const [ios, android] = TRACKS;
  return (
    <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          React Native concepts and their SwiftUI and Jetpack Compose equivalents
        </caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th scope="col" className="px-5 py-3 font-mono text-xs tracking-[0.2em] text-slate-500">
              REACT NATIVE
            </th>
            <th
              scope="col"
              className="px-5 py-3 font-mono text-xs tracking-[0.2em]"
              style={{ color: ios.accent }}
            >
              SWIFTUI
            </th>
            <th
              scope="col"
              className="px-5 py-3 font-mono text-xs tracking-[0.2em]"
              style={{ color: android.accent }}
            >
              COMPOSE
            </th>
          </tr>
        </thead>
        <tbody>
          {BRIDGE.map((row) => (
            <tr key={row.rn} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <th scope="row" className="px-5 py-3 font-bold text-slate-900">
                {row.rn}
              </th>
              <td className="px-5 py-3 font-mono text-[13px] text-slate-600">{row.swift}</td>
              <td className="px-5 py-3 font-mono text-[13px] text-slate-600">{row.kotlin}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
