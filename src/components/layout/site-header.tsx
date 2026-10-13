import { SITE } from "@/config/site";
import { SettingsButton } from "@/features/settings";

import { NavLinks } from "./nav-links";

/** Id of the logo spot: the hero word shrinks into this element as the page scrolls. */
export const LOGO_DOCK_ID = "logo-dock";

/** Fixed top bar. `mix-blend-difference` keeps it legible over both the hero and the sections. */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex items-start justify-between gap-6 p-6 font-mono text-[11px] tracking-widest text-white uppercase mix-blend-difference sm:p-10 sm:text-xs">
      {/* Empty box on purpose: the WebGL word is drawn here once it has shrunk. */}
      <a id={LOGO_DOCK_ID} href="#top" className="block h-4 w-28 shrink-0 sm:w-36">
        <span className="sr-only">{SITE.name}</span>
      </a>
      <NavLinks items={SITE.nav} />
      <SettingsButton />
    </header>
  );
}
