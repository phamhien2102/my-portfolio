import { THEME } from "@/config/theme";

/** Fallback while a pattern page streams in; also gives the dynamic route its static shell. */
export default function Loading() {
  return (
    <main className="min-h-svh px-5 py-16 sm:px-8" style={{ background: THEME.background }}>
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-3 w-28 rounded bg-white/10" />
        <div className="mt-10 h-3 w-32 rounded bg-white/10" />
        <div className="mt-4 h-12 w-72 rounded-lg bg-white/10" />
        <div className="mt-4 h-4 w-96 max-w-full rounded bg-white/5" />
        <div className="mt-10 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="h-40 rounded-2xl bg-white/5" />
          <div className="h-40 rounded-2xl bg-white/5" />
        </div>
        <div className="mt-12 h-80 rounded-2xl bg-white/5" />
      </div>
    </main>
  );
}
