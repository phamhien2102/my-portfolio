import { SITE } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 font-mono text-xs tracking-widest text-zinc-500 uppercase sm:px-10 print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <span>&copy; {SITE.name}</span>
        <a href="#top" className="transition-colors hover:text-white">
          Back to top &uarr;
        </a>
      </div>
    </footer>
  );
}
