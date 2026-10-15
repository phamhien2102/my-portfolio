import { cn } from "@/lib/cn";

import type { SettingOption } from "../config";

interface OptionGroupProps {
  /** Group title, also the accessible name of the radio group. */
  legend: string;
  options: readonly SettingOption[];
  value: string;
  onChange: (id: string) => void;
  /** Option id that ships as the factory default. */
  defaultId: string;
  /** Small print under the options. */
  note: string;
}

/** A titled set of option cards. */
export function OptionGroup({ legend, options, value, onChange, defaultId, note }: OptionGroupProps) {
  return (
    <div className="mt-4 min-w-0">
      <p className="sr-only">{legend}</p>
      <div role="radiogroup" aria-label={legend} className="grid gap-2">
        {options.map((option, i) => {
          const checked = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={checked}
              // The options rise in one after another when the panel appears.
              // Only the opacity and translate wait their turn, so hover feedback stays instant.
              style={{ transitionDelay: `0ms, 0ms, 0ms, ${60 + i * 55}ms, ${60 + i * 55}ms` }}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex cursor-pointer items-start gap-4 rounded-xl border p-4 text-left transition-[color,background-color,border-color,opacity,translate] duration-500 motion-reduce:transition-none starting:translate-y-3 starting:opacity-0",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
                checked
                  ? "border-white bg-white/5"
                  : "border-white/10 hover:border-white/30",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 size-3.5 shrink-0 rounded-full border-2 transition-[border-width,border-color] motion-reduce:transition-none",
                  checked ? "border-[5px] border-white" : "border-zinc-500",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-bold">
                  <span
                    style={option.fontVar ? { fontFamily: `var(${option.fontVar})` } : undefined}
                    className={
                      option.fontVar ? "text-xl leading-tight font-normal tracking-wide" : undefined
                    }
                  >
                    {option.label}
                  </span>
                  {option.id === defaultId && (
                    <span className="text-xs font-normal tracking-normal text-zinc-500">
                      (default)
                    </span>
                  )}
                  {option.immersive && (
                    <span className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] font-normal tracking-widest text-zinc-400 uppercase">
                      3D
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-sm font-normal text-zinc-400">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500">{note}</p>
    </div>
  );
}
