"use client";

import { useId, useRef } from "react";

import { EXPERIENCE_EFFECTS, isExperienceEffect } from "../config";
import { resetSettings, updateSettings, useSettings } from "../lib/settings-store";

/**
 * Gear button that opens a settings popup.
 *
 * Built on the native `<dialog>`: `showModal()` gives focus trapping, Escape-to-close, an inert
 * page behind it and focus restoration for free. Choices apply instantly and are remembered.
 */
export function SettingsButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { experienceEffect } = useSettings();

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Open settings"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="group -mt-1.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-current/30 opacity-70 transition-[opacity,background-color,color] duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
      >
        <GearIcon className="size-4 transition-transform duration-500 group-hover:rotate-90 motion-reduce:transition-none" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        // A click on the dialog box itself (not its content) is a click on the backdrop.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto max-h-[min(40rem,calc(100svh-2rem))] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-zinc-950 p-0 font-sans text-base tracking-normal text-white normal-case shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-2xl font-black tracking-tight">
                Settings
              </h2>
              <p className="mt-1 text-sm text-zinc-400">Saved on this device.</p>
            </div>
            <button
              type="button"
              aria-label="Close settings"
              onClick={close}
              className="-mt-1 -mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="size-5"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <fieldset className="mt-8 min-w-0">
            <legend className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
              Experience effect
            </legend>
            <div className="mt-4 grid gap-2">
              {EXPERIENCE_EFFECTS.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-start gap-4 rounded-xl border border-white/10 p-4 transition-colors hover:border-white/30 has-checked:border-white has-checked:bg-white/5 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-white motion-reduce:transition-none"
                >
                  <input
                    type="radio"
                    name="experience-effect"
                    value={option.id}
                    checked={experienceEffect === option.id}
                    onChange={(event) => {
                      if (isExperienceEffect(event.target.value)) {
                        updateSettings({ experienceEffect: event.target.value });
                      }
                    }}
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
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              3D effects need a wide screen and WebGL. On phones, or when your device asks for
              reduced motion, the timeline is shown instead.
            </p>
          </fieldset>

          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={resetSettings}
              className="text-sm text-zinc-400 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Reset to defaults
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Done
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
