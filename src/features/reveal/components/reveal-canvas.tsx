"use client";

import { useEffect, useRef } from "react";

import { REVEAL_CONFIG } from "../config";
import { createRevealScene } from "../lib/create-reveal-scene";

/**
 * WebGL canvas that fills its nearest positioned ancestor: a chrome blob that reveals
 * the word as it sweeps. Place it inside a `relative` container with a defined height.
 */
export function RevealCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    return createRevealScene(container);
  }, []);

  return (
    <>
      {/* Canvas content isn't readable by assistive tech, so expose the word as text. */}
      <h1 className="sr-only">{REVEAL_CONFIG.word}</h1>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        style={{ backgroundColor: REVEAL_CONFIG.bgColor }}
      />
    </>
  );
}
