import { SITE } from "@/config/site";

/** Fixed top bar. `mix-blend-difference` keeps it legible over both the hero and the sections. */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-6 p-6 font-mono text-[11px] tracking-widest text-white uppercase mix-blend-difference sm:p-10 sm:text-xs">
      <a href="#top" className="hidden shrink-0 sm:inline">
        {SITE.name}
      </a>
      <nav aria-label="Primary" className="ml-auto flex flex-wrap justify-end gap-x-5 gap-y-1">
        {SITE.nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="opacity-70 transition-opacity hover:opacity-100"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
