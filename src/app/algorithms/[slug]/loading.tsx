import { AlgShell } from "@/features/algorithms";

/** Fallback while a pattern page streams in; also gives the dynamic route its static shell. */
export default function Loading() {
  return (
    <AlgShell back={{ href: "/algorithms", label: "← All patterns" }}>
      <div className="animate-pulse" aria-hidden="true">
        <div className="alg-skel h-3 w-40" />
        <div className="alg-skel mt-4 h-9 w-72 max-w-full" />
        <div className="alg-skel mt-4 h-4 w-96 max-w-full opacity-60" />
        <div className="mt-8 grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="alg-skel h-40" />
          <div className="alg-skel h-40" />
        </div>
        <div className="alg-skel mt-10 h-80" />
      </div>
    </AlgShell>
  );
}
