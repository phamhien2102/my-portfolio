import * as THREE from "three";

/**
 * A small low-poly astronaut built from primitives (no model files to download).
 *
 * Origin is at the feet; +z is the way it faces. Every moving part hangs from a pivot group so
 * the run cycle is just a few rotations per frame.
 */

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const k = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return k * k * (3 - 2 * k);
};

/** Stride: how far the phase of the run cycle advances per unit of distance covered. */
const PHASE_PER_UNIT = 1.9;
/** Distance per second at which the character is running flat out. */
const FULL_SPEED = 16;
/** How far (radians) it turns towards the camera when it stops. */
const TURN_WHEN_IDLE = 2.3;

export interface Runner {
  /** Add this to the scene; place and aim it every frame. */
  root: THREE.Group;
  /**
   * Advance the animation.
   * @param distance signed distance travelled along the route since the last call
   * @param dt seconds since the last call
   * @param time seconds since the start (for idle motion)
   * @param accent colour for the visor, boots and backpack glow
   */
  update: (distance: number, dt: number, time: number, accent: THREE.Color) => void;
}

export function createRunner(): Runner {
  const suit = new THREE.MeshStandardMaterial({
    color: "#e9edf7",
    roughness: 0.55,
    metalness: 0.05,
    flatShading: true,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: "#2a2d3a",
    roughness: 0.6,
    flatShading: true,
  });
  // These pick up the path colour every frame.
  const glow = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#ffffff",
    emissiveIntensity: 1.1,
    roughness: 0.4,
    flatShading: true,
  });
  const visor = new THREE.MeshStandardMaterial({
    color: "#0b0d16",
    emissive: "#ffffff",
    emissiveIntensity: 0.3,
    roughness: 0.15,
    metalness: 0.6,
  });

  const mesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D,
  ) => {
    const m = new THREE.Mesh(geometry, material);
    parent.add(m);
    return m;
  };
  const pivot = (parent: THREE.Object3D, x: number, y: number, z = 0) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  };

  const root = new THREE.Group(); // placed on the route, aimed along it
  const turner = pivot(root, 0, 0); // turns to face the camera when idle
  const body = pivot(turner, 0, 1.15); // hips: bobs and leans

  // Torso, chest light and backpack.
  mesh(new THREE.CapsuleGeometry(0.28, 0.42, 3, 8), suit, body).position.y = 0.5;
  mesh(new THREE.BoxGeometry(0.26, 0.14, 0.04), glow, body).position.set(0, 0.62, 0.29);
  const pack = pivot(body, 0, 0.55, -0.4);
  mesh(new THREE.BoxGeometry(0.5, 0.7, 0.26), dark, pack);
  mesh(new THREE.BoxGeometry(0.34, 0.08, 0.28), glow, pack).position.y = 0.2;
  const flame = mesh(new THREE.ConeGeometry(0.1, 0.4, 6), glow, pack);
  flame.position.set(0, -0.5, 0);
  flame.rotation.x = Math.PI; // points down

  // Head: helmet, visor, antenna.
  const head = pivot(body, 0, 1.12);
  mesh(new THREE.SphereGeometry(0.36, 14, 10), suit, head).position.y = 0.3;
  const visorMesh = mesh(new THREE.SphereGeometry(0.3, 14, 10), visor, head);
  visorMesh.scale.set(1, 0.72, 0.6);
  visorMesh.position.set(0, 0.32, 0.22);
  mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 5), dark, head).position.set(0.14, 0.78, 0);
  mesh(new THREE.SphereGeometry(0.055, 8, 6), glow, head).position.set(0.14, 0.95, 0);

  // Limbs. `swing` pivots at the hip/shoulder, `bend` at the knee/elbow below it.
  const limb = (
    x: number,
    y: number,
    upper: number,
    lower: number,
    radius: number,
    tip: "boot" | "glove",
  ) => {
    const swing = pivot(body, x, y);
    mesh(new THREE.CapsuleGeometry(radius, upper, 3, 8), suit, swing).position.y = -(
      upper / 2 +
      radius * 0.7
    );
    const bend = pivot(swing, 0, -(upper + radius * 1.2));
    mesh(new THREE.CapsuleGeometry(radius * 0.9, lower, 3, 8), suit, bend).position.y = -(
      lower / 2 +
      radius * 0.6
    );
    const end = pivot(bend, 0, -(lower + radius * 1.1));
    if (tip === "boot") {
      mesh(new THREE.BoxGeometry(0.3, 0.16, 0.46), glow, end).position.set(0, -0.02, 0.07);
    } else {
      mesh(new THREE.SphereGeometry(radius * 1.25, 8, 6), glow, end);
    }
    return { swing, bend };
  };

  // The character faces +z, so its right-hand side is -x.
  const legL = limb(0.17, 0, 0.3, 0.3, 0.15, "boot");
  const legR = limb(-0.17, 0, 0.3, 0.3, 0.15, "boot");
  const armL = limb(0.4, 0.98, 0.26, 0.24, 0.1, "glove");
  const armR = limb(-0.4, 0.98, 0.26, 0.24, 0.1, "glove");

  // Soft light that tints the ground around the runner with the path colour.
  const aura = new THREE.PointLight("#ffffff", 14, 16, 1.6);
  aura.position.set(0, 1.4, 0.6);
  root.add(aura);

  root.scale.setScalar(0.95);
  root.position.y = 0.06;

  let phase = 0;
  let run = 0; // 0 = standing, 1 = full sprint (smoothed)
  let idle = 1;

  const update: Runner["update"] = (distance, dt, time, accent) => {
    // Speed in units per second, signed (scrolling back makes it run backwards).
    const speed = dt > 0 ? distance / dt : 0;
    const target = Math.min(Math.abs(speed) / FULL_SPEED, 1);
    run += (target - run) * (1 - Math.pow(1 - 0.12, dt * 60));
    idle = 1 - smoothstep(0.05, 0.3, run);
    phase += distance * PHASE_PER_UNIT;

    const s = Math.sin(phase);
    const c = Math.cos(phase);
    const amount = Math.min(run * 1.4, 1);

    // Legs: thigh swings, knee folds as the leg comes back.
    legL.swing.rotation.x = s * 1.0 * amount;
    legR.swing.rotation.x = -s * 1.0 * amount;
    legL.bend.rotation.x = (0.15 + Math.max(0, c) * 1.3) * amount;
    legR.bend.rotation.x = (0.15 + Math.max(0, -c) * 1.3) * amount;

    // Arms swing against the legs; the right one waves when standing still.
    armL.swing.rotation.x = -s * 0.9 * amount;
    armL.bend.rotation.x = -(0.5 + 0.5 * amount) * amount;
    armR.swing.rotation.x = s * 0.9 * amount * (1 - idle);
    armR.bend.rotation.x = -(0.5 + 0.5 * amount) * amount * (1 - idle);
    armR.swing.rotation.z = -2.5 * idle;
    armR.bend.rotation.z = Math.sin(time * 7) * 0.55 * idle;
    armL.swing.rotation.z = 0.12 * idle;

    // Bob and lean while running; breathe while standing.
    body.position.y = 1.15 + Math.abs(c) * 0.13 * amount + Math.sin(time * 2) * 0.012 * idle;
    body.rotation.x = 0.2 * amount;
    body.rotation.z = s * 0.05 * amount;
    head.rotation.x = -0.12 * amount;
    head.rotation.y = Math.sin(time * 0.9) * 0.25 * idle;

    // Turn to face the camera when standing still.
    turner.rotation.y +=
      (idle * TURN_WHEN_IDLE - turner.rotation.y) * (1 - Math.pow(1 - 0.06, dt * 60));

    // Thruster flicker, stronger while running.
    flame.scale.set(1, (0.5 + amount * 1.1) * (0.85 + Math.sin(time * 40) * 0.15), 1);

    // Everything glowing takes the path colour.
    glow.color.copy(accent);
    glow.emissive.copy(accent);
    visor.emissive.copy(accent);
    aura.color.copy(accent);
  };

  return { root, update };
}
