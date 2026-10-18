"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

import {
  BLOOM_CONFIG,
  SPECIES,
  SPECIES_LABEL,
  type FlowerSpecies,
  type InteractionMode,
} from "../config";
import { createBloomScene, type BloomScene } from "../lib/create-bloom-scene";

const MODES: { id: InteractionMode; label: string; hint: string }[] = [
  { id: "touch", label: "Touch", hint: "Drag flowers. Hold to press them under." },
  { id: "lift", label: "Lift", hint: "Carry a flower, then let it fall." },
  { id: "swirl", label: "Swirl", hint: "A quiet whirlpool turns the pool." },
];

const FLOWER_SWATCH: Record<FlowerSpecies, string> = {
  hibiscus: "#c81d5a",
  brightHibiscus: "#ff6a2c",
  lily: "#f4ece0",
  plumeria: "#fff1c9",
};

export function BloomPool() {
  const hostRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BloomScene | null>(null);
  const [mode, setMode] = useState<InteractionMode>("touch");
  const [sound, setSound] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    try {
      const scene = createBloomScene(host, {
        getDockHeight: () => dockRef.current?.offsetHeight ?? 96,
        onCount: setCount,
      });
      sceneRef.current = scene;
      return () => {
        sceneRef.current = null;
        scene.dispose();
      };
    } catch {
      const message = document.createElement("p");
      message.className =
        "absolute inset-0 z-20 flex items-center justify-center px-6 text-center text-sm";
      message.textContent =
        "This pool needs WebGL. Try another browser, or turn hardware acceleration on.";
      host.appendChild(message);
      return () => {
        message.remove();
      };
    }
  }, []);

  function spawn(species: FlowerSpecies) {
    sceneRef.current?.spawn(species);
  }

  function chooseMode(next: InteractionMode) {
    setMode(next);
    sceneRef.current?.setMode(next);
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    sceneRef.current?.setSound(next);
  }

  const full = count >= BLOOM_CONFIG.flowers.max;
  const hint = MODES.find((item) => item.id === mode)?.hint ?? "";

  return (
    <div className="relative h-svh overflow-hidden bg-[#efe6d4] text-[#2c261c]">
      <div ref={hostRef} className="absolute inset-0" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 px-5 pt-5 max-[520px]:pt-3 sm:px-10 sm:pt-8">
        <div className="min-w-0">
          <h1 className="text-[clamp(2.2rem,8vw,5.6rem)] leading-[0.88] font-medium tracking-[-0.03em] max-[500px]:text-[2rem]">
            Bloom Pool
          </h1>
          <p className="mt-2 max-w-sm text-[0.95rem] text-[#2c261c]/58 italic max-[500px]:mt-1 max-[500px]:text-xs sm:mt-3 sm:text-base">
            A sunlit pool kept for flowers.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          className="pointer-events-auto shrink-0 rounded-full border border-[#2c261c]/15 bg-[#f7f0e4]/70 px-3.5 py-2 text-xs tracking-wide backdrop-blur-md transition hover:bg-[#f7f0e4] max-[500px]:px-3 max-[500px]:py-1.5"
          aria-pressed={sound}
        >
          {sound ? "Sound on" : "Sound off"}
        </button>
      </header>

      <div
        ref={dockRef}
        className="absolute inset-x-0 bottom-0 z-10 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-5"
      >
        <p className="mb-2 hidden text-center text-[11px] tracking-wide text-[#2c261c]/45 sm:block">
          {hint}
        </p>
        <div className="mx-auto flex w-full max-w-3xl flex-nowrap items-center justify-center gap-1.5 overflow-x-auto rounded-full border border-white/50 bg-[#f7f0e4]/58 px-2 py-2 shadow-[0_10px_40px_rgba(70,50,20,0.12)] backdrop-blur-md max-[500px]:gap-1 sm:gap-2 sm:px-3">
          {SPECIES.map((species) => (
            <button
              key={species}
              type="button"
              disabled={full}
              onClick={() => spawn(species)}
              title={SPECIES_LABEL[species]}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#2c261c]/10 bg-white/45 px-2.5 text-[11px] tracking-wide transition hover:bg-white/80 disabled:opacity-40 sm:min-w-[5.6rem] sm:px-3"
            >
              <span
                aria-hidden="true"
                className="mr-0 size-2.5 rounded-full sm:mr-2"
                style={{
                  background: FLOWER_SWATCH[species],
                  boxShadow: "0 0 0 1px rgba(44,38,28,0.12)",
                }}
              />
              <span className="sr-only sm:not-sr-only">{SPECIES_LABEL[species]}</span>
            </button>
          ))}
          <span aria-hidden="true" className="mx-0.5 hidden h-6 w-px bg-[#2c261c]/15 sm:block" />
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => chooseMode(item.id)}
              aria-pressed={mode === item.id}
              className={cn(
                "min-h-11 min-w-11 rounded-full px-3 text-[11px] tracking-wide transition sm:px-3.5",
                mode === item.id
                  ? "bg-[#2c261c] text-[#f6efe4]"
                  : "border border-[#2c261c]/10 bg-white/35 hover:bg-white/70",
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => sceneRef.current?.clear()}
            disabled={count === 0}
            className="min-h-11 rounded-full border border-[#2c261c]/10 bg-white/35 px-3 text-[11px] tracking-wide transition hover:bg-white/70 disabled:opacity-40 sm:px-3.5"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
