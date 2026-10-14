"use client";

import { useId, useRef, useState } from "react";

import { resetSettings } from "../lib/settings-store";
import { SettingsTabs } from "./settings-tabs";

/**
 * Gear button that opens a settings popup.
 *
 * Built on the native `<dialog>`: `showModal()` gives focus trapping, Escape-to-close, an inert
 * page behind it and focus restoration for free. Choices apply instantly and are remembered.
 */
export function SettingsButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        aria-label="Open settings"
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
          dialogRef.current?.showModal();
        }}
        className="group flex size-8 shrink-0 items-center justify-center rounded-full border border-current/30 opacity-70 transition-[opacity,background-color,color] duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none max-sm:ml-auto sm:-mt-1.5"
      >
        <GearIcon className="size-4 transition-transform duration-500 group-hover:rotate-90 motion-reduce:transition-none" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        // A click on the dialog box itself (not its content) is a click on the backdrop.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto flex max-h-[min(44rem,calc(100svh-2rem))] w-[min(34rem,calc(100vw-2rem))] scale-95 flex-col overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 p-0 font-sans text-base tracking-normal text-white normal-case opacity-0 shadow-2xl transition-[opacity,scale,overlay,display] transition-discrete duration-300 ease-out backdrop:bg-black/70 backdrop:backdrop-blur-sm open:scale-100 open:opacity-100 motion-reduce:transition-none starting:open:scale-95 starting:open:opacity-0"
      >
        {/* Keep the options out of the page until the popup is open, so they are not tab stops. */}
        {/* Header and footer stay put; only the middle scrolls when a tab is taller than the box. */}
        <div className="flex min-h-0 flex-col" hidden={!open}>
          <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
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

          <div className="flex min-h-0 grow flex-col px-6 py-2 sm:px-8">
            <SettingsTabs />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-white/10 px-6 py-4 sm:px-8">
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
