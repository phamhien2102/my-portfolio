"use client";

import { useEffect, useRef } from "react";

import { useSettings, type HeroFont, type InkMode } from "@/features/settings";

import { REVEAL_CONFIG } from "../config";
import { createDropletScene } from "../lib/create-droplet-scene";
import { createRevealScene } from "../lib/create-reveal-scene";

interface RevealCanvasProps {
  /** `id` of the element the word shrinks into as the page scrolls (the header logo). */
  dockId: string;
}

/**
 * WebGL effect: a chrome blob that reveals the word as it sweeps. Place it inside a `relative`
 * hero with a defined height.
 *
 * It renders two things: an invisible slot that fills the hero (marking where the hero is, and
 * receiving the pointer), and a fixed, viewport-sized canvas layer. The layer is transparent
 * outside the hero, so while scrolling the word shrinks and glides into the element `dockId`.
 */
export function RevealCanvas({ dockId }: RevealCanvasProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    setFont?: (font: HeroFont) => void;
    setInkMode: (mode: InkMode) => void;
    dispose: () => void;
  } | null>(null);

  // The scenes live outside React; typeface and ink mode are handed over when they change.
  const { heroFont, inkMode } = useSettings();
  const droplets = heroFont === "droplets";
  const fontRef = useRef(heroFont);
  const inkModeRef = useRef(inkMode);
  useEffect(() => {
    fontRef.current = heroFont;
    sceneRef.current?.setFont?.(heroFont);
  }, [heroFont]);
  useEffect(() => {
    inkModeRef.current = inkMode;
    sceneRef.current?.setInkMode(inkMode);
  }, [inkMode]);

  // Swapping between the blob and the droplets rebuilds the scene; changing typeface does not.
  useEffect(() => {
    const slot = slotRef.current;
    const container = containerRef.current;
    if (!slot || !container) return;
    const dock = document.getElementById(dockId);

    if (droplets) {
      const scene = createDropletScene(container, {
        slot,
        dock,
        inkMode: inkModeRef.current,
      });
      sceneRef.current = scene;
      return () => {
        sceneRef.current = null;
        scene.dispose();
      };
    }

    const scene = createRevealScene(container, {
      slot,
      dock,
      font: fontRef.current,
      inkMode: inkModeRef.current,
    });
    sceneRef.current = scene;
    return () => {
      sceneRef.current = null;
      scene.dispose();
    };
  }, [dockId, droplets]);

  return (
    <>
      {/* Canvas content isn't readable by assistive tech, so expose the word as text. */}
      <h1 className="sr-only">{REVEAL_CONFIG.word}</h1>
      {/* Lets vertical drags scroll the page on touch devices; horizontal drags drive the blob. */}
      <div
        ref={slotRef}
        aria-hidden="true"
        className="absolute inset-0"
        style={{ touchAction: "pan-y" }}
      />
      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-20 h-svh w-full overflow-hidden"
      />
    </>
  );
}
