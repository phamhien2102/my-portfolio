/** Shown while the test streams in; it also gives the dynamic route its static shell. */
export default function Loading() {
  return (
    <div
      data-page-theme="light"
      className="min-h-svh animate-pulse bg-[#edf3f8] p-6"
      role="status"
      aria-label="Loading the mock test"
    >
      <div className="mx-auto max-w-5xl">
        <div className="h-3 w-40 rounded bg-[#d3dfea]" />
        <div className="mt-4 h-9 w-64 rounded bg-[#d3dfea]" />
        <div className="mt-8 h-72 rounded-xl bg-[#e1ebf4]" />
      </div>
    </div>
  );
}
