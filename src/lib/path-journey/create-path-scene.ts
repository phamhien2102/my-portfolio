import * as THREE from "three";

import { THEME } from "@/config/theme";

import {
  addHelixDecor,
  addRunnerDecor,
  addTunnelDecor,
  coloredTube,
  type Decor,
  type DecorContext,
} from "./decorations";
import { PATH_STYLES, type PathEffect } from "./effects";
import { progressToT, waypointT } from "./flight-path";

/** Extra scenery per effect (the fly-through is just the path, dust and shapes). */
const DECORATIONS: Partial<Record<PathEffect, (context: DecorContext) => Decor | void>> = {
  helix: addHelixDecor,
  tunnel: addTunnelDecor,
  runner: addRunnerDecor,
};

interface PathSceneOptions {
  /** Which look to build: the route, the scenery and how the camera rides it. */
  effect: PathEffect;
  /** Element the canvas is mounted into (fills it, follows its size). */
  host: HTMLElement;
  /** The tall element whose scroll position drives the flight. */
  runway: HTMLElement;
  /** The sticky element that stays on screen while the runway scrolls. */
  stage: HTMLElement;
  /** One accent colour per gate, in the order they are flown through. */
  accents: readonly string[];
  /** Distance (px) between the top of the screen and the sticky stage, if it is not flush. */
  stickyTop?: number;
  /** Called every frame with the smoothed scroll progress (0-1). */
  onProgress: (progress: number) => void;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

/**
 * A glowing 3D path with one gate per role. The camera flies along it as the runway scrolls.
 * Returns a `dispose` function. The loop only runs while the runway is on screen.
 */
export function createPathScene({
  effect,
  host,
  runway,
  stage,
  accents,
  stickyTop = 0,
  onProgress,
}: PathSceneOptions): () => void {
  const n = accents.length;
  const style = PATH_STYLES[effect];
  const size = () => ({ w: Math.max(1, host.clientWidth), h: Math.max(1, host.clientHeight) });

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size().w, size().h);
  renderer.setClearColor(THEME.background);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.touchAction = "pan-y";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(THEME.background, style.fog);
  const camera = new THREE.PerspectiveCamera(62, size().w / size().h, 0.1, 400);

  // ---------- The path ----------
  const curve = new THREE.CatmullRomCurve3(
    style.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    false,
    "catmullrom",
    0.5,
  );

  // Colour along the path: it takes on each gate's accent as it passes through it.
  const stops = [0, ...accents.map((_, i) => waypointT(i, n)), 1];
  const stopColors = [accents[0], ...accents, accents[n - 1]].map((hex) => new THREE.Color(hex));
  const colorAt = (t: number, out: THREE.Color) => {
    for (let k = 0; k < stops.length - 1; k++) {
      if (t <= stops[k + 1] || k === stops.length - 2) {
        const span = stops[k + 1] - stops[k];
        const u = span > 0 ? clamp((t - stops[k]) / span, 0, 1) : 0;
        return out.lerpColors(stopColors[k], stopColors[k + 1], u);
      }
    }
    return out;
  };

  const core = new THREE.Mesh(
    coloredTube(curve, 0.1, colorAt),
    new THREE.MeshBasicMaterial({ vertexColors: true }),
  );
  const glow = new THREE.Mesh(
    coloredTube(curve, 0.4, colorAt),
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  if (style.tubes) scene.add(core, glow);

  // ---------- Gates (one per role) ----------
  const spinners: THREE.Object3D[] = [];
  accents.forEach((hex, i) => {
    const t = waypointT(i, n);
    const position = curve.getPointAt(t);
    const gate = new THREE.Group();
    gate.position.copy(position);
    gate.lookAt(position.clone().add(curve.getTangentAt(t))); // +z faces the direction of travel
    gate.position.y += style.gateLift;
    gate.scale.setScalar(style.gate);

    const solid = new THREE.MeshBasicMaterial({ color: hex });
    const faint = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.5 });
    const outer = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.07, 8, 120), solid);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.04, 8, 100), faint);
    const portal = new THREE.Mesh(
      new THREE.CircleGeometry(3.3, 48),
      new THREE.MeshBasicMaterial({
        color: hex,
        transparent: true,
        opacity: 0.07,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );

    const orbit = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const bead = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), solid);
      const angle = (k / 4) * Math.PI * 2;
      bead.position.set(Math.cos(angle) * 3.4, Math.sin(angle) * 3.4, 0);
      orbit.add(bead);
    }

    gate.add(outer, inner, portal, orbit);
    scene.add(gate);
    spinners.push(inner, orbit);
  });

  const decor = DECORATIONS[effect]?.({ scene, curve, colorAt }) || undefined;

  // ---------- Depth cues: drifting dust and a few wireframe shapes ----------
  const scatter = (minRadius: number, spread: number) => {
    const t = Math.random();
    const center = curve.getPointAt(t);
    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
    ).normalize();
    return {
      t,
      point: center.clone().addScaledVector(dir, minRadius + Math.random() * spread),
    };
  };

  const DUST = style.dust.count;
  const dustPositions = new Float32Array(DUST * 3);
  const dustColors = new Float32Array(DUST * 3);
  const tint = new THREE.Color();
  for (let i = 0; i < DUST; i++) {
    const { t, point } = scatter(style.dust.min, style.dust.spread);
    // Keep specks above the floor, if there is one.
    if (style.floor !== undefined) point.y = style.floor + Math.abs(point.y - style.floor);
    point.toArray(dustPositions, i * 3);
    // Tint each speck with the path colour nearest to it, washed towards white.
    colorAt(t, tint)
      .lerp(new THREE.Color("#ffffff"), 0.55)
      .toArray(dustColors, i * 3);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  // Points are squares by default; a soft round sprite makes them read as glowing specks.
  const speck = document.createElement("canvas");
  speck.width = speck.height = 64;
  const speckContext = speck.getContext("2d");
  if (speckContext) {
    const gradient = speckContext.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    speckContext.fillStyle = gradient;
    speckContext.fillRect(0, 0, 64, 64);
  }
  const speckTexture = new THREE.CanvasTexture(speck);
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      size: 0.45,
      map: speckTexture,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  );
  scene.add(dust);

  const shapes: { mesh: THREE.Mesh; spin: THREE.Vector3 }[] = [];
  const shapeMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const shapeGeometries = [new THREE.IcosahedronGeometry(1, 0), new THREE.OctahedronGeometry(1, 0)];
  for (let i = 0; i < style.shapes; i++) {
    const mesh = new THREE.Mesh(shapeGeometries[i % 2], shapeMaterial);
    mesh.position.copy(scatter(7, 24).point);
    mesh.scale.setScalar(0.5 + Math.random() * 1.4);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(mesh);
    shapes.push({
      mesh,
      spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
    });
  }

  // ---------- Input: scroll drives the flight, the pointer adds a little parallax ----------
  const progressNow = () => {
    const range = runway.offsetHeight - stage.offsetHeight;
    return range > 0 ? clamp((stickyTop - runway.getBoundingClientRect().top) / range, 0, 1) : 0;
  };

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointerMove = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointer.tx = clamp(((e.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointer.ty = clamp(((e.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
  };
  window.addEventListener("pointermove", onPointerMove);

  const resizeObserver = new ResizeObserver(() => {
    const { w, h } = size();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(host);

  // ---------- Loop ----------
  let progress = progressNow();
  let bank = 0;
  let lastTime = performance.now();
  const clock = new THREE.Clock();

  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  const turn = new THREE.Vector3();
  const accent = new THREE.Color();

  const frame = () => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const f = (a: number) => 1 - Math.pow(1 - a, dt * 60); // per-frame factor at any frame rate
    const elapsed = clock.getElapsedTime();

    // Ease towards the scroll position so the camera glides instead of tracking the wheel.
    progress += (progressNow() - progress) * f(0.1);
    onProgress(progress);

    pointer.x += (pointer.tx - pointer.x) * f(0.05);
    pointer.y += (pointer.ty - pointer.y) * f(0.05);

    const t = progressToT(progress, n);
    const tangent = curve.getTangentAt(t);
    const ahead = curve.getTangentAt(Math.min(t + 0.02, 1));

    curve.getPointAt(t, pos);
    const sway = style.parallax;
    if (style.camera === "chase") {
      // Follow a few steps behind and above the character, looking past him down the road.
      camera.position.copy(pos).addScaledVector(tangent, -7.5);
      camera.position.x += pointer.x * sway;
      camera.position.y += 3.3 - pointer.y * sway * 0.5;
      look.copy(pos).addScaledVector(tangent, 6);
      look.x += pointer.x * sway;
      look.y += 1.5 - pointer.y * sway * 0.4;
      camera.lookAt(look);
    } else {
      // Ride a little above the path, looking down it; lean into bends.
      camera.position.set(
        pos.x + pointer.x * sway,
        pos.y + style.lift - pointer.y * sway * 0.5,
        pos.z,
      );
      look.copy(pos).addScaledVector(tangent, 12);
      look.x += pointer.x * sway * 1.25;
      look.y += 0.3 - pointer.y * sway * 0.65;
      camera.lookAt(look);
      // Lean into bends: the sideways turn of the route between here and just ahead.
      turn.crossVectors(tangent, ahead);
      bank += (clamp(turn.y * 8, -style.bank, style.bank) - bank) * f(0.05);
      camera.rotateZ(bank);
    }

    decor?.update?.({ t, dt, elapsed, color: colorAt(t, accent) });

    for (const object of spinners) object.rotation.z += dt * 0.4;
    for (const { mesh, spin } of shapes) {
      mesh.rotation.x += spin.x * dt * 0.3;
      mesh.rotation.y += spin.y * dt * 0.3;
    }
    dust.rotation.z = Math.sin(elapsed * 0.05) * 0.02;

    renderer.render(scene, camera);
  };

  // Only run while the runway is on screen.
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      lastTime = performance.now();
      progress = progressNow(); // jump straight to the right place after being offscreen
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  });
  visibility.observe(runway);

  return () => {
    visibility.disconnect();
    resizeObserver.disconnect();
    renderer.setAnimationLoop(null);
    window.removeEventListener("pointermove", onPointerMove);
    scene.traverse((object) => {
      if (
        object instanceof THREE.Mesh ||
        object instanceof THREE.Points ||
        object instanceof THREE.Line
      ) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material: THREE.Material) => material.dispose());
      }
    });
    speckTexture.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
