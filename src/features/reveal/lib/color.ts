import { Vector3 } from "three";

/**
 * Hex -> raw sRGB vec3. We deliberately avoid THREE.Color: modern three converts
 * hex to linear space, but these shaders write straight to the framebuffer, so
 * the original sRGB values must be passed through untouched.
 */
export function hexToVec3(hex: string): Vector3 {
  const n = parseInt(hex.replace("#", ""), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
