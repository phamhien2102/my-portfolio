import * as THREE from "three";

import { BLOOM_CONFIG, INITIAL_SPECIES, type FlowerSpecies, type InteractionMode } from "../config";
import { createBloomAudio } from "./audio";
import { createFlowerFactory } from "./flowers";
import { clampToPool, createPool, insidePool, type PoolBuild } from "./pool";
import { createPoolTextures } from "./textures";
import { WATER_FRAGMENT, WATER_VERTEX } from "./water-shaders";

export interface BloomScene {
  spawn: (species: FlowerSpecies) => boolean;
  setMode: (mode: InteractionMode) => void;
  clear: () => void;
  setSound: (on: boolean) => void;
  getCount: () => number;
  dispose: () => void;
}

interface BloomSceneOptions {
  getDockHeight: () => number;
  onCount: (count: number) => void;
}

type FlowerState = "fall" | "float" | "drag" | "hold" | "carry" | "clear";

interface Flower {
  species: FlowerSpecies;
  group: THREE.Group;
  radius: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;
  pitch: number;
  roll: number;
  vyaw: number;
  bob: number;
  rock: number;
  state: FlowerState;
  submerge: number;
  scale: number;
}

interface Ripple {
  x: number;
  z: number;
  t: number;
  strength: number;
}

interface Drop {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
}

const SUN_DIR = new THREE.Vector3(-0.72, 0.58, -0.38).normalize();
const SUN_COLOR = new THREE.Color(1, 0.92, 0.74);
const CARRY_Y = 0.92;
const MAX_RIPPLES = 16;
const MAX_DROPS = 40;

export function createBloomScene(
  container: HTMLElement,
  { getDockHeight, onCount }: BloomSceneOptions,
): BloomScene {
  const textures = createPoolTextures();
  const factory = createFlowerFactory();
  const audio = createBloomAudio();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setClearColor(0xefe6d4, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.25 : 1.55));
  container.appendChild(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.touchAction = "none";
  canvas.style.userSelect = "none";
  canvas.setAttribute("aria-label", "Bloom Pool, an interactive flower pool");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(BLOOM_CONFIG.fov, 1, 0.12, 80);
  const clock = new THREE.Clock();

  const hemi = new THREE.HemisphereLight(0xfff6e4, 0x7d8870, 1.25);
  const sun = new THREE.DirectionalLight(0xffe8c4, 2.15);
  sun.position.copy(SUN_DIR).multiplyScalar(24);
  scene.add(hemi, sun);

  let pool: PoolBuild | null = null;
  let poolKey = "";

  const flowers: Flower[] = [];
  const ripples: Ripple[] = [];
  const drops: Drop[] = [];
  const dropGeo = new THREE.SphereGeometry(0.016, 6, 5);
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: 0xbfeef2,
    roughness: 0.08,
    transmission: 0.55,
    thickness: 0.2,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });

  let mode: InteractionMode = "touch";
  let whirl = 0;
  let targetWhirl = 0;
  let pitch = BLOOM_CONFIG.pitchLandscape * (Math.PI / 180);
  let time = 0;

  const viewProj = new THREE.Matrix4();
  const invViewProj = new THREE.Matrix4();

  let rt = makeTarget(4, 4);
  const waterScene = new THREE.Scene();
  const waterCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const waterMat = new THREE.ShaderMaterial({
    vertexShader: WATER_VERTEX,
    fragmentShader: WATER_FRAGMENT,
    uniforms: {
      tColor: { value: rt.texture },
      tDepth: { value: rt.depthTexture },
      uInvViewProj: { value: invViewProj },
      uViewProj: { value: viewProj },
      uCameraPos: { value: camera.position },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uNear: { value: camera.near },
      uFar: { value: camera.far },
      uWaterY: { value: BLOOM_CONFIG.waterY },
      uSunDir: { value: SUN_DIR.clone() },
      uSunColor: { value: SUN_COLOR.clone() },
      uPool: { value: new THREE.Vector4(-1, -1, 1, 1) },
      uCorner: { value: BLOOM_CONFIG.pool.corner },
      uWhirl: { value: 0 },
      uWhirlCenter: { value: new THREE.Vector2(0, 0) },
      uFlowerCount: { value: 0 },
      uFlowerPos: { value: Array.from({ length: 32 }, () => new THREE.Vector3()) },
      uFlowerRad: { value: new Array<number>(32).fill(0) },
      uRippleCount: { value: 0 },
      uRipples: { value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4()) },
    },
    depthTest: false,
    depthWrite: false,
    toneMapped: true,
  });
  waterScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), waterMat));

  const pointer = {
    id: -1,
    x: 0,
    y: 0,
    ndc: new THREE.Vector2(),
    flower: null as Flower | null,
    draggingWater: false,
    downAt: 0,
    moved: 0,
    lastHit: new THREE.Vector3(),
    lastT: 0,
  };
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const projected = new THREE.Vector3();

  const html = document.documentElement;
  const body = document.body;
  const prevOverflow = {
    html: html.style.overflow,
    body: body.style.overflow,
    over: html.style.overscrollBehavior,
  };
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";

  function makeTarget(w: number, h: number) {
    const depthTexture = new THREE.DepthTexture(w, h);
    depthTexture.format = THREE.DepthFormat;
    depthTexture.type = THREE.UnsignedIntType;
    const target = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthTexture,
    });
    target.texture.colorSpace = THREE.LinearSRGBColorSpace;
    return target;
  }

  function liveCount() {
    return flowers.filter((f) => f.state !== "clear").length;
  }

  function reportCount() {
    onCount(liveCount());
  }

  function poolSize() {
    const portrait = container.clientHeight > container.clientWidth;
    return portrait ? BLOOM_CONFIG.pool.portrait : BLOOM_CONFIG.pool.landscape;
  }

  function rebuildPool() {
    const { width, depth } = poolSize();
    const key = `${width}x${depth}`;
    if (key === poolKey && pool) return;
    pool?.dispose();
    pool = createPool(width, depth, textures);
    poolKey = key;
    scene.add(pool.group);
    waterMat.uniforms.uPool.value.set(
      pool.bounds.innerMin.x,
      pool.bounds.innerMin.y,
      pool.bounds.innerMax.x,
      pool.bounds.innerMax.y,
    );
    waterMat.uniforms.uCorner.value = pool.bounds.corner * 0.72;
    for (const flower of flowers) {
      const c = clampToPool(flower.x, flower.z, pool.bounds, flower.radius * 0.5);
      flower.x = c.x;
      flower.z = c.z;
    }
  }

  function fitCamera() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    const dock = getDockHeight();
    const portrait = h > w;
    pitch = (portrait ? BLOOM_CONFIG.pitchPortrait : BLOOM_CONFIG.pitchLandscape) * (Math.PI / 180);
    camera.fov = BLOOM_CONFIG.fov;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    rebuildPool();
    const bounds = pool?.bounds;
    if (!bounds) return;

    const lookAt = new THREE.Vector3(0, 0.04, -bounds.halfD * 0.32);
    const usableBottom = -1 + (2 * (dock + 12)) / h;
    const usableTop = 0.88;
    const targetY = (usableTop + usableBottom) * 0.48;
    const pad = 0.2;
    const corners = [
      new THREE.Vector3(-(bounds.halfW + pad), 0.16, -(bounds.halfD + pad)),
      new THREE.Vector3(bounds.halfW + pad, 0.16, -(bounds.halfD + pad)),
      new THREE.Vector3(-(bounds.halfW + pad), 0.16, bounds.halfD + pad),
      new THREE.Vector3(bounds.halfW + pad, 0.16, bounds.halfD + pad),
    ];

    const place = (back: number) => {
      const nearZ = bounds.halfD + back;
      const y = lookAt.y + Math.tan(pitch) * (nearZ - lookAt.z);
      camera.position.set(0, y, nearZ);
      camera.up.set(0, 1, 0);
      camera.lookAt(lookAt);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
    };

    const fits = () => {
      let visible = 0;
      for (const corner of corners) {
        projected.copy(corner).project(camera);
        if (
          projected.x > -1.05 &&
          projected.x < 1.05 &&
          projected.y > usableBottom - 0.12 &&
          projected.y < 0.98 &&
          projected.z > 0 &&
          projected.z < 1
        ) {
          visible += 1;
        }
      }
      return visible >= 3;
    };

    const cap = portrait ? 1.35 : 1.7;
    let lo = 0.45;
    let hi = cap;
    let best = cap;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      place(mid);
      if (fits()) {
        best = mid;
        hi = mid;
      } else {
        lo = mid;
      }
    }
    place(Math.min(best, cap));

    const camUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    for (let i = 0; i < 8; i++) {
      const py = lookAt.clone().project(camera).y;
      const err = targetY - py;
      camera.position.addScaledVector(camUp, err * 0.35);
      lookAt.addScaledVector(camUp, err * 0.35);
      camera.lookAt(lookAt);
      camera.updateMatrixWorld();
    }

    renderer.setSize(w, h, false);
    const pw = Math.max(1, Math.floor(w * renderer.getPixelRatio()));
    const ph = Math.max(1, Math.floor(h * renderer.getPixelRatio()));
    if (rt.width !== pw || rt.height !== ph) {
      rt.dispose();
      rt = makeTarget(pw, ph);
      waterMat.uniforms.tColor.value = rt.texture;
      waterMat.uniforms.tDepth.value = rt.depthTexture;
    }
    waterMat.uniforms.uResolution.value.set(pw, ph);
  }

  function heightForNdcY(x: number, z: number, ndcY: number) {
    camera.updateMatrixWorld();
    const m = viewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const e = m.elements;
    const a = e[1] * x + e[9] * z + e[13];
    const b = e[5];
    const c = e[3] * x + e[11] * z + e[15];
    const d = e[7];
    const denom = b - ndcY * d;
    let y = Math.abs(denom) < 1e-5 ? 2.4 : (ndcY * c - a) / denom;
    y = Math.min(y, camera.position.y - 0.7);
    return Math.max(y, 1.25);
  }

  function addRipple(x: number, z: number, strength: number) {
    if (!pool || !insidePool(x, z, pool.bounds, 0.02)) return;
    if (ripples.length >= MAX_RIPPLES) ripples.shift();
    ripples.push({ x, z, t: time, strength });
  }

  function spawnDrops(x: number, y: number, z: number, strength: number) {
    const n = Math.min(14, 6 + Math.floor(strength * 8));
    for (let i = 0; i < n; i++) {
      if (drops.length >= MAX_DROPS) {
        const old = drops.shift();
        old?.mesh.removeFromParent();
      }
      const mesh = new THREE.Mesh(dropGeo, dropMat);
      scene.add(mesh);
      const a = Math.random() * Math.PI * 2;
      const s = 0.4 + Math.random() * 1.1 * strength;
      drops.push({
        mesh,
        x,
        y: y + 0.04,
        z,
        vx: Math.cos(a) * s,
        vy: 1.1 + Math.random() * 1.6 * strength,
        vz: Math.sin(a) * s,
        life: 0.45 + Math.random() * 0.35,
      });
    }
  }

  function splash(flower: Flower, strength: number) {
    addRipple(flower.x, flower.z, strength);
    spawnDrops(flower.x, 0.02, flower.z, strength);
    audio.splash(strength);
    for (const other of flowers) {
      if (other === flower || other.state === "clear") continue;
      const d = Math.hypot(other.x - flower.x, other.z - flower.z);
      if (d < 1.2 && d > 0.01) {
        const f = (0.18 * strength) / d;
        other.vx += ((other.x - flower.x) / d) * f;
        other.vz += ((other.z - flower.z) / d) * f;
        other.vy += 0.08 * strength;
      }
    }
  }

  function spawn(species: FlowerSpecies): boolean {
    if (!pool || liveCount() >= BLOOM_CONFIG.flowers.max) return false;
    const pad = 0.45;
    const x =
      pool.bounds.innerMin.x +
      pad +
      Math.random() * (pool.bounds.innerMax.x - pool.bounds.innerMin.x - pad * 2);
    const z =
      pool.bounds.innerMin.y +
      pad +
      Math.random() * (pool.bounds.innerMax.y - pool.bounds.innerMin.y - pad * 2);
    const y = heightForNdcY(x, z, 0.86);
    const made = factory.create(species);
    scene.add(made.group);
    const flower: Flower = {
      species,
      group: made.group,
      radius: made.radius,
      x,
      y,
      z,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.55,
      vz: (Math.random() - 0.5) * 0.15,
      yaw: Math.random() * Math.PI * 2,
      pitch: -0.08,
      roll: 0,
      vyaw: (Math.random() - 0.5) * 0.8,
      bob: Math.random() * Math.PI * 2,
      rock: Math.random() * Math.PI * 2,
      state: "fall",
      submerge: 0,
      scale: 0.9 + Math.random() * 0.16,
    };
    flowers.push(flower);
    applyTransform(flower);
    reportCount();
    return true;
  }

  function applyTransform(flower: Flower) {
    flower.group.position.set(flower.x, flower.y, flower.z);
    flower.group.rotation.set(flower.pitch, flower.yaw, flower.roll);
    flower.group.scale.setScalar(flower.scale);
  }

  function setPointer(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.ndc.set((pointer.x / rect.width) * 2 - 1, -(pointer.y / rect.height) * 2 + 1);
  }

  function intersectY(y: number): THREE.Vector3 | null {
    plane.constant = -y;
    raycaster.setFromCamera(pointer.ndc, camera);
    return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
  }

  function pickFlower(): Flower | null {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const fov = (camera.fov * Math.PI) / 180;
    let best: Flower | null = null;
    let bestDist = Infinity;
    for (const flower of flowers) {
      if (flower.state === "clear") continue;
      projected.set(flower.x, flower.y + 0.05, flower.z).project(camera);
      if (projected.z < 0 || projected.z > 1) continue;
      const px = (projected.x * 0.5 + 0.5) * w;
      const py = (-projected.y * 0.5 + 0.5) * h;
      const dist = camera.position.distanceTo(flower.group.position);
      const pxPerUnit = h / (2 * Math.tan(fov / 2) * dist);
      const rx = flower.radius * 1.55 * pxPerUnit;
      const ry = rx * Math.cos(pitch) * 1.2;
      const dx = pointer.x - px;
      const dy = pointer.y - py;
      const ell = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (ell < 1 && dist < bestDist) {
        best = flower;
        bestDist = dist;
      }
    }
    return best;
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    pointer.id = event.pointerId;
    pointer.downAt = performance.now();
    pointer.moved = 0;
    setPointer(event);
    const picked = pickFlower();
    if (picked) {
      pointer.flower = picked;
      if (mode === "lift") {
        picked.state = "carry";
        picked.submerge = 0;
      } else {
        picked.state = "drag";
      }
      const at = intersectY(mode === "lift" ? CARRY_Y : BLOOM_CONFIG.waterY);
      if (at) pointer.lastHit.copy(at);
      pointer.lastT = time;
      return;
    }
    const water = intersectY(BLOOM_CONFIG.waterY);
    if (water && pool && insidePool(water.x, water.z, pool.bounds)) {
      pointer.draggingWater = true;
      addRipple(water.x, water.z, 0.7);
      audio.drip();
      pointer.lastHit.copy(water);
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (pointer.id !== event.pointerId) return;
    event.preventDefault();
    const ox = pointer.x;
    const oy = pointer.y;
    setPointer(event);
    pointer.moved += Math.hypot(pointer.x - ox, pointer.y - oy);
    const flower = pointer.flower;
    if (flower && flower.state !== "clear") {
      const planeY = flower.state === "carry" ? CARRY_Y : BLOOM_CONFIG.waterY;
      const at = intersectY(planeY);
      if (at && pool) {
        const c = clampToPool(at.x, at.z, pool.bounds, flower.radius * 0.35);
        const dt = Math.max(1e-3, time - pointer.lastT);
        flower.vx = (c.x - flower.x) / dt;
        flower.vz = (c.z - flower.z) / dt;
        flower.x = c.x;
        flower.z = c.z;
        pointer.lastHit.set(c.x, planeY, c.z);
        pointer.lastT = time;
        if (
          mode === "touch" &&
          flower.state !== "carry" &&
          pointer.moved < 12 &&
          performance.now() - pointer.downAt > 220
        ) {
          flower.state = "hold";
        }
        if (flower.state === "drag" || flower.state === "hold") {
          addRipple(flower.x, flower.z, flower.state === "hold" ? 0.35 : 0.18);
        }
      }
      return;
    }
    if (pointer.draggingWater) {
      const water = intersectY(BLOOM_CONFIG.waterY);
      if (water && water.distanceTo(pointer.lastHit) > 0.16) {
        addRipple(water.x, water.z, 0.4);
        pointer.lastHit.copy(water);
      }
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (pointer.id !== event.pointerId) return;
    event.preventDefault();
    const flower = pointer.flower;
    if (flower && flower.state !== "clear") {
      if (flower.state === "carry") {
        flower.state = "fall";
        flower.vy = -0.2;
      } else if (flower.state === "hold") {
        flower.state = "float";
        flower.vy = 1.6 + flower.submerge * 2.2;
        splash(flower, 0.45 + flower.submerge * 0.7);
        flower.submerge = 0;
      } else {
        flower.state = flower.y > 0.2 ? "fall" : "float";
        if (Math.hypot(flower.vx, flower.vz) > 1.2) addRipple(flower.x, flower.z, 0.5);
      }
    }
    pointer.flower = null;
    pointer.draggingWater = false;
    pointer.id = -1;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      // capture may already be gone
    }
  }

  function stepDrops(dt: number) {
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      if (!drop) continue;
      drop.vy += BLOOM_CONFIG.physics.gravity * dt;
      drop.x += drop.vx * dt;
      drop.y += drop.vy * dt;
      drop.z += drop.vz * dt;
      drop.life -= dt;
      drop.mesh.position.set(drop.x, drop.y, drop.z);
      drop.mesh.scale.setScalar(Math.max(0.1, drop.life * 2));
      if (drop.y < 0 && pool && insidePool(drop.x, drop.z, pool.bounds)) {
        addRipple(drop.x, drop.z, 0.12);
        drop.life = 0;
      }
      if (drop.life <= 0) {
        drop.mesh.removeFromParent();
        drops.splice(i, 1);
      }
    }
  }

  function stepFlowers(dt: number) {
    const phys = BLOOM_CONFIG.physics;
    const bounds = pool?.bounds;
    if (!bounds) return;

    for (const flower of flowers) {
      if (flower.state === "clear") {
        flower.vy -= 2.4 * dt;
        flower.y += flower.vy * dt;
        flower.yaw += 2.4 * dt;
        flower.scale = Math.max(0, flower.scale - dt * 0.65);
        applyTransform(flower);
        continue;
      }

      if (flower.state === "carry") {
        flower.y += (CARRY_Y - flower.y) * Math.min(1, dt * 10);
        flower.vy = 0;
        flower.pitch += (0.05 - flower.pitch) * dt * 6;
        flower.roll += (0 - flower.roll) * dt * 6;
        applyTransform(flower);
        continue;
      }

      if (flower.state === "drag" || flower.state === "hold") {
        if (flower.state === "hold") flower.submerge = Math.min(1, flower.submerge + dt * 1.7);
        const targetY = flower.state === "hold" ? -0.28 * flower.submerge : 0.02;
        flower.y += (targetY - flower.y) * Math.min(1, dt * 9);
        flower.vx *= Math.max(0, 1 - dt * 4);
        flower.vz *= Math.max(0, 1 - dt * 4);
        applyTransform(flower);
        continue;
      }

      flower.vy += phys.gravity * dt;
      const wet = flower.y < 0.16 && insidePool(flower.x, flower.z, bounds, flower.radius * 0.2);

      if (flower.state === "fall" && wet && flower.vy < 0 && flower.y < 0.08) {
        splash(flower, Math.min(1.35, 0.3 + Math.abs(flower.vy) * 0.1));
        flower.state = "float";
        flower.vy *= -0.16;
      }

      if (flower.state === "float") {
        const bob = Math.sin(time * 1.35 + flower.bob) * phys.bob;
        flower.vy += (0.018 + bob - flower.y) * phys.buoyancy * dt;
        flower.vy -= flower.vy * phys.waterDrag * dt;
        flower.vx -= flower.vx * 1.9 * dt;
        flower.vz -= flower.vz * 1.9 * dt;
        flower.vx += Math.sin(time * 0.16 + flower.z) * 0.045 * dt;
        flower.vz += Math.cos(time * 0.13 + flower.x) * 0.032 * dt;

        if (whirl > 0.02) {
          const dx = flower.x;
          const dz = flower.z;
          const r = Math.hypot(dx, dz) + 0.05;
          flower.vx += ((-dz / r) * 0.95 * whirl - dx * (0.16 / r) * whirl) * dt;
          flower.vz += ((dx / r) * 0.95 * whirl - dz * (0.16 / r) * whirl) * dt;
          flower.vyaw += whirl * 0.55 * dt;
        }

        for (const ripple of ripples) {
          const age = time - ripple.t;
          const ring = age * 1.55;
          const d = Math.hypot(flower.x - ripple.x, flower.z - ripple.z);
          if (Math.abs(d - ring) < 0.2) {
            const nx = (flower.x - ripple.x) / (d + 1e-4);
            const nz = (flower.z - ripple.z) / (d + 1e-4);
            const force = ripple.strength * Math.exp(-age) * 0.4;
            flower.vx += nx * force * dt;
            flower.vz += nz * force * dt;
          }
        }

        flower.pitch += (Math.sin(time * 1.05 + flower.rock) * phys.rock - flower.pitch) * dt * 3.2;
        flower.roll +=
          (Math.cos(time * 0.88 + flower.rock) * phys.rock * 0.75 - flower.roll) * dt * 3.2;
        flower.yaw += flower.vyaw * dt;
        flower.vyaw *= 1 - dt * 0.18;
        if (Math.abs(flower.vyaw) < 0.12) flower.vyaw += (Math.random() - 0.5) * 0.01;
      } else {
        flower.vx -= flower.vx * phys.airDrag * dt;
        flower.vz -= flower.vz * phys.airDrag * dt;
        flower.yaw += flower.vyaw * dt;
        flower.pitch += (0.2 - flower.pitch) * dt * 0.6;
      }

      flower.x += flower.vx * dt;
      flower.y += flower.vy * dt;
      flower.z += flower.vz * dt;

      const c = clampToPool(flower.x, flower.z, bounds, flower.radius * 0.52);
      if (c.x !== flower.x) {
        flower.x = c.x;
        flower.vx *= -0.32;
      }
      if (c.z !== flower.z) {
        flower.z = c.z;
        flower.vz *= -0.32;
      }
      if (flower.y < bounds.floorY + 0.07) {
        flower.y = bounds.floorY + 0.07;
        flower.vy *= -0.2;
      }
      applyTransform(flower);
    }

    for (let i = 0; i < flowers.length; i++) {
      const a = flowers[i];
      if (!a || a.state === "clear" || a.state === "carry") continue;
      for (let j = i + 1; j < flowers.length; j++) {
        const b = flowers[j];
        if (!b || b.state === "clear" || b.state === "carry") continue;
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        const d = Math.hypot(dx, dz);
        const min = (a.radius + b.radius) * 0.82;
        if (d > 0.001 && d < min) {
          const push = (min - d) * 0.5;
          a.x += (dx / d) * push;
          a.z += (dz / d) * push;
          b.x -= (dx / d) * push;
          b.z -= (dz / d) * push;
        }
      }
    }

    for (let i = flowers.length - 1; i >= 0; i--) {
      const flower = flowers[i];
      if (
        flower &&
        flower.state === "clear" &&
        (flower.scale <= 0.03 || flower.y < bounds.floorY - 0.05)
      ) {
        flower.group.removeFromParent();
        flowers.splice(i, 1);
        reportCount();
      }
    }
  }

  function syncWater() {
    waterMat.uniforms.uTime.value = time;
    waterMat.uniforms.uWhirl.value = whirl;
    waterMat.uniforms.uNear.value = camera.near;
    waterMat.uniforms.uFar.value = camera.far;
    const pos = waterMat.uniforms.uFlowerPos.value as THREE.Vector3[];
    const rad = waterMat.uniforms.uFlowerRad.value as number[];
    const n = Math.min(32, flowers.length);
    waterMat.uniforms.uFlowerCount.value = n;
    for (let i = 0; i < n; i++) {
      const flower = flowers[i];
      if (!flower) continue;
      pos[i]?.set(flower.x, flower.y, flower.z);
      rad[i] = flower.radius;
    }
    const ru = waterMat.uniforms.uRipples.value as THREE.Vector4[];
    const alive = ripples.filter((r) => time - r.t < 3.2);
    ripples.length = 0;
    ripples.push(...alive);
    waterMat.uniforms.uRippleCount.value = alive.length;
    for (let i = 0; i < alive.length; i++) {
      const r = alive[i];
      if (!r) continue;
      ru[i]?.set(r.x, r.z, r.t, r.strength);
    }
  }

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);
    time += dt;
    whirl += (targetWhirl - whirl) * dt * 1.7;
    stepFlowers(dt);
    stepDrops(dt);
    factory.materials.update(SUN_DIR, camera.position);
    const palm = pool?.group.getObjectByName("palmShadow");
    if (palm) palm.rotation.z = Math.sin(time * 0.18) * 0.03;

    camera.updateMatrixWorld();
    viewProj.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    invViewProj.copy(viewProj).invert();
    syncWater();

    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setRenderTarget(null);
    renderer.render(waterScene, waterCam);
  }

  const starters: number[] = [];
  INITIAL_SPECIES.forEach((species, i) => {
    starters.push(
      window.setTimeout(
        () => {
          spawn(species);
        },
        180 + i * 280,
      ),
    );
  });

  const onLost = () => {
    canvas.style.visibility = "hidden";
  };

  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onPointerUp, { passive: false });
  canvas.addEventListener("pointercancel", onPointerUp, { passive: false });
  canvas.addEventListener(
    "contextmenu",
    (event) => {
      event.preventDefault();
    },
    { passive: false },
  );

  const ro = new ResizeObserver(() => fitCamera());
  ro.observe(container);
  fitCamera();
  renderer.setAnimationLoop(tick);

  return {
    spawn,
    setMode(next) {
      mode = next;
      targetWhirl = next === "swirl" ? 1 : 0;
    },
    clear() {
      for (const flower of flowers) {
        if (flower.state === "clear") continue;
        flower.state = "clear";
        flower.vy = -0.12;
        flower.vyaw = 1.8 + Math.random();
      }
      pointer.flower = null;
      reportCount();
    },
    setSound(on) {
      audio.unlock();
      audio.setEnabled(on);
    },
    getCount: liveCount,
    dispose() {
      renderer.setAnimationLoop(null);
      for (const id of starters) window.clearTimeout(id);
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      for (const flower of flowers) flower.group.removeFromParent();
      flowers.length = 0;
      for (const drop of drops) drop.mesh.removeFromParent();
      drops.length = 0;
      pool?.dispose();
      factory.dispose();
      textures.dispose();
      audio.dispose();
      dropGeo.dispose();
      dropMat.dispose();
      rt.dispose();
      waterMat.dispose();
      renderer.dispose();
      canvas.remove();
      html.style.overflow = prevOverflow.html;
      body.style.overflow = prevOverflow.body;
      html.style.overscrollBehavior = prevOverflow.over;
    },
  };
}
