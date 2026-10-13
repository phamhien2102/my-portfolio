import type { SettingOption } from "../config";

interface OptionGroupProps {
  /** Group title, also the accessible name of the radio group. */
  legend: string;
  /** Shared `name` of the radio inputs. */
  name: string;
  options: readonly SettingOption[];
  value: string;
  onChange: (id: string) => void;
  /** Small print under the options. */
  note: string;
}

/** A titled set of radio cards. The native radio is kept (hidden) for keyboard and screen readers. */
export function OptionGroup({ legend, name, options, value, onChange, note }: OptionGroupProps) {
  return (
    <fieldset className="mt-8 min-w-0">
      <legend className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
        {legend}
      </legend>
      <div className="mt-4 grid gap-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-start gap-4 rounded-xl border border-white/10 p-4 transition-colors hover:border-white/30 has-checked:border-white has-checked:bg-white/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-white motion-reduce:transition-none"
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="mt-1 size-3.5 shrink-0 rounded-full border-2 border-zinc-500 transition-[border-width,border-color] peer-checked:border-[5px] peer-checked:border-white motion-reduce:transition-none"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-bold">
                {option.label}
                {option.immersive && (
                  <span className="rounded-full border border-white/20 px-2 py-0.5 font-mono text-[10px] font-normal tracking-widest text-zinc-400 uppercase">
                    3D
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-sm text-zinc-400">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500">{note}</p>
    </fieldset>
  );
}
