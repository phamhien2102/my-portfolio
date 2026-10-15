import * as THREE from "three";

import { accentAt } from "@/config/theme";

import { SKILL_GROUPS } from "../data";
import { PLANETS, SUN_RADIUS, orbitRadius } from "./solar";

export interface SolarFocus {
  /** Index (in `PLANETS`) of the planet under the pointer or focus. */
  hovered: number | null;
  /** Index of the group to keep lit; the others fade. `null` lights everything. */
  group: number | null;
}

export interface SolarScene {
  setFocus: (focus: SolarFocus) => void;
  dispose: () => void;
}

interface SolarSceneOptions {
  /** Element the canvas is mounted into (fills it, follows its size). */
  host: HTMLElement;
  /** One element per planet (same order as `PLANETS`); moved under its planet every frame. */
  labels: readonly (HTMLElement | null)[];
  /** The pointer moved onto a planet (or its label), or off all of them (`null`). */
  onHover: (index: number | null) => void;
  /** A planet (or its label) was clicked or tapped. */
  onSelect: (index: number) => void;
}

const FOV = 38;
/** Camera looks down at the orbits from this angle above the plane, in radians. */
const ELEVATION = 0.8;
/** Furthest thing from the sun, plus a margin: what the camera must fit. */
const EXTENT = orbitRadius(SKILL_GROUPS.length - 1) + 1.3;

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

/** A soft round blob, used for the sun's glow and the background stars. */
function blobTexture(stops: readonly [number, string][]): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (const [offset, color] of stops) gradient.addColorStop(offset, color);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

/**
 * Skills as a small solar system: one orbit per group, one planet per skill (bigger = stronger).
 * Labels are real DOM elements that this moves each frame, so they stay crisp and accessible.
 * Returns `setFocus` (highlight a planet / group) and `dispose`. Runs only while on screen.
 */
export function createSolarScene({
  host,
  labels,
  onHover,
  onSelect,
}: SolarSceneOptions): SolarScene {
  const size = () => ({ w: Math.max(1, host.clientWidth), h: Math.max(1, host.clientHeight) });

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size().w, size().h);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.touchAction = "pan-y";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, size().w / size().h, 0.1, 300);
  let distance = 20;

  // ---------- Light ----------
  scene.add(new THREE.AmbientLight("#9aa6ff", 0.9));
  scene.add(new THREE.PointLight("#fff0cf", 110, 0, 2));

  // ---------- Sun ----------
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS, 32, 20),
    new THREE.MeshBasicMaterial({ color: "#ffd27a" }),
  );
  scene.add(sun);

  const glowTexture = blobTexture([
    [0, "rgba(255,220,150,0.95)"],
    [0.25, "rgba(255,170,80,0.45)"],
    [1, "rgba(255,120,40,0)"],
  ]);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      // Plain alpha blending: additive over a transparent canvas leaves a visible box.
      depthWrite: false,
      transparent: true,
    }),
  );
  scene.add(glow);

  // ---------- Orbits and planets ----------
  const orbitGroups: THREE.Group[] = [];
  const orbitLines: THREE.LineLoop[] = [];
  const circle = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 180 }, (_, k) => {
      const a = (k / 180) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    }),
  );

  SKILL_GROUPS.forEach((_, i) => {
    const holder = new THREE.Group();
    // A touch of tilt per orbit, so the rings are not perfectly stacked flat.
    holder.rotation.set((i - 1.5) * 0.06, 0, (i % 2 ? -1 : 1) * 0.04);
    const line = new THREE.LineLoop(
      circle,
      new THREE.LineBasicMaterial({ color: accentAt(i + 1), transparent: true, opacity: 0.35 }),
    );
    line.scale.setScalar(orbitRadius(i));
    holder.add(line);
    scene.add(holder);
    orbitGroups.push(holder);
    orbitLines.push(line);
  });

  const unitSphere = new THREE.SphereGeometry(1, 28, 18);
  const unitRing = new THREE.TorusGeometry(1.75, 0.045, 6, 56);

  interface Body {
    mesh: THREE.Mesh;
    material: THREE.MeshStandardMaterial;
    scale: number;
    opacity: number;
    labelOpacity: number;
  }
  const bodies: Body[] = PLANETS.map((planet) => {
    const color = accentAt(planet.groupIndex + 1);
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.15,
      roughness: 0.55,
      metalness: 0.1,
      transparent: true,
    });
    const mesh = new THREE.Mesh(unitSphere, material);
    mesh.scale.setScalar(planet.radius);
    if (planet.ringed) {
      const ring = new THREE.Mesh(
        unitRing,
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }),
      );
      ring.rotation.x = Math.PI / 2 + 0.45;
      ring.rotation.y = 0.2;
      mesh.add(ring);
    }
    orbitGroups[planet.groupIndex].add(mesh);
    return { mesh, material, scale: 1, opacity: 1, labelOpacity: 1 };
  });

  // ---------- Background stars ----------
  const STARS = 520;
  const starPositions = new Float32Array(STARS * 3);
  const direction = new THREE.Vector3();
  for (let i = 0; i < STARS; i++) {
    direction
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize()
      .multiplyScalar(30 + Math.random() * 60)
      .toArray(starPositions, i * 3);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starTexture = blobTexture([
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,255,255,0.5)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      size: 0.7,
      map: starTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
  );
  scene.add(stars);

  // ---------- Input ----------
  // Pointer, in the host's own pixels (`null` while it is outside), plus where each planet and
  // its label were drawn last frame, which is what pointing at one is tested against.
  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    px: null as number | null,
    py: null as number | null,
  };
  const screen = PLANETS.map(() => ({ x: 0, y: 0, radius: 0, below: 0, labelWidth: 0 }));

  const onPointerMove = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointer.tx = clamp(((e.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointer.ty = clamp(((e.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    pointer.px = inside ? e.clientX - rect.left : null;
    pointer.py = inside ? e.clientY - rect.top : null;
  };
  window.addEventListener("pointermove", onPointerMove);

  /** The planet whose body or label is at (x, y), if any. Generous: planets are small. */
  const pick = (x: number | null, y: number | null): number | null => {
    if (x === null || y === null) return null;
    let best: number | null = null;
    let bestScore = Infinity;
    for (const planet of PLANETS) {
      const s = screen[planet.index];
      const gap = Math.hypot(x - s.x, y - s.y) - s.radius;
      const onLabel =
        Math.abs(x - s.x) <= s.labelWidth / 2 + 4 &&
        y >= s.y + s.below - 2 &&
        y <= s.y + s.below + 26;
      const score = onLabel ? 0 : gap <= 12 ? gap : Infinity;
      if (score < bestScore) {
        best = planet.index;
        bestScore = score;
      }
    }
    return best;
  };

  const onClick = (e: MouseEvent) => {
    const rect = host.getBoundingClientRect();
    const hit = pick(e.clientX - rect.left, e.clientY - rect.top);
    if (hit !== null) onSelect(hit);
  };
  host.addEventListener("click", onClick);

  let focus: SolarFocus = { hovered: null, group: null };

  // ---------- Size ----------
  const fit = () => {
    const { w, h } = size();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Far enough that the outermost orbit fits both across and down the frame.
    const half = Math.tan((FOV * Math.PI) / 360);
    distance = Math.max((EXTENT * Math.sin(ELEVATION) + 1) / half, EXTENT / (half * camera.aspect));
  };
  fit();
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(host);

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  let lastTime = performance.now();
  let simTime = 0;
  let timeScale = 1;

  let hoverNow: number | null = null;
  const world = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const tanHalf = Math.tan((FOV * Math.PI) / 360);

  const frame = () => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const f = (a: number) => 1 - Math.pow(1 - a, dt * 60);
    const elapsed = clock.getElapsedTime();
    const { w, h } = size();

    // Slow right down while something is being pointed at, so it is easy to read and click.
    timeScale += ((focus.hovered !== null ? 0.06 : 1) - timeScale) * f(0.08);
    simTime += dt * timeScale;

    pointer.x += (pointer.tx - pointer.x) * f(0.05);
    pointer.y += (pointer.ty - pointer.y) * f(0.05);
    const azimuth = pointer.x * 0.35;
    const elevation = ELEVATION + pointer.y * 0.12;
    camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    );
    camera.lookAt(0, 0, 0);

    for (const planet of PLANETS) {
      const body = bodies[planet.index];
      const angle = planet.phase + planet.speed * simTime;
      body.mesh.position.set(Math.cos(angle) * planet.orbit, 0, Math.sin(angle) * planet.orbit);

      const lit = focus.group === null || focus.group === planet.groupIndex;
      const hovered = focus.hovered === planet.index;
      body.scale += ((hovered ? 1.6 : 1) - body.scale) * f(0.15);
      body.opacity += ((lit ? 1 : 0.18) - body.opacity) * f(0.12);
      body.mesh.scale.setScalar(planet.radius * body.scale);
      body.material.opacity = body.opacity;
      body.material.emissiveIntensity +=
        ((hovered ? 0.9 : 0.15) - body.material.emissiveIntensity) * f(0.15);

      // Put this planet's label just under it.
      const label = labels[planet.index];
      if (label) {
        body.mesh.getWorldPosition(world);
        const away = camera.position.distanceTo(world);
        projected.copy(world).project(camera);
        const x = (projected.x * 0.5 + 0.5) * w;
        const y = (-projected.y * 0.5 + 0.5) * h;
        const pxPerUnit = h / 2 / (tanHalf * away);
        const below = planet.radius * body.scale * pxPerUnit + 10;
        const spot = screen[planet.index];
        spot.x = x;
        spot.y = y;
        spot.radius = planet.radius * body.scale * pxPerUnit;
        spot.below = below;
        spot.labelWidth ||= label.offsetWidth;
        label.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + below).toFixed(1)}px, 0) translate(-50%, 0)`;
        label.style.zIndex = String(Math.round((1 - projected.z) * 500));
        // Planets on the far side of the sun are a little fainter.
        const front = clamp(1 - (away - (distance - EXTENT)) / (2 * EXTENT), 0, 1);
        body.labelOpacity += ((lit ? 0.5 + front * 0.5 : 0.12) - body.labelOpacity) * f(0.12);
        label.style.opacity = body.labelOpacity.toFixed(3);
      }
    }

    // Report what the pointer is over, only when that changes.
    const over = pick(pointer.px, pointer.py);
    if (over !== hoverNow) {
      hoverNow = over;
      onHover(over);
      host.style.cursor = over === null ? "" : "pointer";
    }

    orbitLines.forEach((line, i) => {
      const material = line.material as THREE.LineBasicMaterial;
      const target = focus.group === null ? 0.35 : focus.group === i ? 0.8 : 0.06;
      material.opacity += (target - material.opacity) * f(0.12);
    });

    // The sun breathes.
    const pulse = 1 + Math.sin(elapsed * 1.6) * 0.03;
    sun.scale.setScalar(pulse);
    glow.scale.setScalar(SUN_RADIUS * 6.5 * (1 + Math.sin(elapsed * 1.1) * 0.05));
    stars.rotation.y = elapsed * 0.004;

    renderer.render(scene, camera);
  };

  // Only run while on screen.
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      lastTime = performance.now();
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  });
  visibility.observe(host);

  return {
    setFocus: (next) => {
      focus = next;
    },
    dispose: () => {
      visibility.disconnect();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      window.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("click", onClick);
      host.style.cursor = "";
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.Line ||
          object instanceof THREE.Sprite
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material: THREE.Material) => material.dispose());
        }
      });
      glowTexture.dispose();
      starTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
