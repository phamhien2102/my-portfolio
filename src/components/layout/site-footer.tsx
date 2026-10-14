import { SITE } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 font-mono text-xs tracking-widest text-zinc-500 uppercase sm:px-10 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
        <span>&copy; {SITE.name}</span>
      </div>
    </footer>
  );
}
