import * as THREE from "three";

import { BLOOM_CONFIG } from "../config";
import type { PoolTextures } from "./textures";

export interface PoolBounds {
  halfW: number;
  halfD: number;
  corner: number;
  floorY: number;
  innerMin: THREE.Vector2;
  innerMax: THREE.Vector2;
}

export interface PoolBuild {
  group: THREE.Group;
  bounds: PoolBounds;
  dispose: () => void;
}

function roundedRectShape(hw: number, hd: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -hw;
  const y = -hd;
  s.moveTo(x + r, y);
  s.lineTo(x + hw * 2 - r, y);
  s.absarc(x + hw * 2 - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + hw * 2, y + hd * 2 - r);
  s.absarc(x + hw * 2 - r, y + hd * 2 - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + hd * 2);
  s.absarc(x + r, y + hd * 2 - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function roundedRectPath(hw: number, hd: number, r: number): THREE.Path {
  return roundedRectShape(hw, hd, r);
}

export function createPool(width: number, depth: number, textures: PoolTextures): PoolBuild {
  const { waterDepth, corner, deck, coping, band } = BLOOM_CONFIG.pool;
  const halfW = width / 2;
  const halfD = depth / 2;
  const floorY = -waterDepth;
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const stone = new THREE.MeshStandardMaterial({
    map: textures.travertine,
    roughness: 0.86,
    metalness: 0,
    color: "#fff6e8",
  });
  const wallMat = new THREE.MeshStandardMaterial({
    map: textures.wall,
    roughness: 0.32,
    metalness: 0.04,
    color: "#dff7f6",
  });
  const floorMat = new THREE.MeshStandardMaterial({
    map: textures.floor,
    roughness: 0.28,
    metalness: 0.05,
    color: "#d7f4f4",
  });
  const bandMat = new THREE.MeshStandardMaterial({
    map: textures.checker,
    roughness: 0.4,
    metalness: 0.02,
  });
  disposables.push(stone, wallMat, floorMat, bandMat);

  const outer = roundedRectShape(halfW + deck, halfD + deck, corner + 0.22);
  const hole = roundedRectPath(halfW, halfD, corner);
  outer.holes.push(hole);
  const deckGeo = new THREE.ExtrudeGeometry(outer, {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.016,
    bevelSegments: 2,
  });
  deckGeo.rotateX(-Math.PI / 2);
  textures.travertine.repeat.set(3.2, 3.2);
  const deckMesh = new THREE.Mesh(deckGeo, stone);
  deckMesh.position.y = 0.08;
  group.add(deckMesh);
  disposables.push(deckGeo);

  const floorGeo = new THREE.PlaneGeometry(width - 0.04, depth - 0.04);
  floorGeo.rotateX(-Math.PI / 2);
  textures.floor.repeat.set(width * 1.1, depth * 1.1);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = floorY;
  group.add(floor);
  disposables.push(floorGeo);

  const wallH = waterDepth + band + 0.02;
  const wallY = floorY + wallH / 2;
  const walls: THREE.Mesh[] = [];
  const mkWall = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, 0);
    group.add(mesh);
    walls.push(mesh);
    disposables.push(geo);
    return mesh;
  };
  const t = 0.06;
  mkWall(width, wallH, t, 0, wallY, -halfD + t / 2);
  mkWall(width, wallH, t, 0, wallY, halfD - t / 2);
  mkWall(t, wallH, depth, -halfW + t / 2, wallY, 0);
  mkWall(t, wallH, depth, halfW - t / 2, wallY, 0);
  textures.wall.repeat.set(width * 1.4, wallH * 2.2);

  const bandH = band;
  const bandY = bandH / 2 + 0.02;
  const mkBand = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, bandMat);
    mesh.position.set(x, y, z);
    group.add(mesh);
    disposables.push(geo);
  };
  mkBand(width - 0.02, bandH, 0.03, 0, bandY, -halfD + 0.04);
  mkBand(width - 0.02, bandH, 0.03, 0, bandY, halfD - 0.04);
  mkBand(0.03, bandH, depth - 0.02, -halfW + 0.04, bandY, 0);
  mkBand(0.03, bandH, depth - 0.02, halfW - 0.04, bandY, 0);
  textures.checker.repeat.set(width * 1.6, 1);

  const rim = roundedRectShape(halfW + coping * 0.2, halfD + coping * 0.2, corner);
  const rimPts = rim.getPoints(72).map((p) => new THREE.Vector3(p.x, 0, p.y));
  if (rimPts[0]) rimPts.push(rimPts[0].clone());
  const curve = new THREE.CatmullRomCurve3(rimPts, true, "catmullrom", 0.15);
  const copingGeo = new THREE.TubeGeometry(curve, 180, coping, 10, true);
  const copingMat = new THREE.MeshStandardMaterial({
    color: "#fff8ee",
    roughness: 0.38,
    metalness: 0.02,
    map: textures.travertine,
  });
  const copingMesh = new THREE.Mesh(copingGeo, copingMat);
  copingMesh.position.y = 0.14;
  group.add(copingMesh);
  disposables.push(copingGeo, copingMat);

  const palmMat = new THREE.MeshBasicMaterial({
    map: textures.palm,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const palmGeo = new THREE.PlaneGeometry((halfW + deck) * 2.1, (halfD + deck) * 2.1);
  palmGeo.rotateX(-Math.PI / 2);
  const palm = new THREE.Mesh(palmGeo, palmMat);
  palm.position.y = 0.175;
  palm.name = "palmShadow";
  group.add(palm);
  disposables.push(palmMat, palmGeo);

  const skyGeo = new THREE.SphereGeometry(48, 32, 18);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uSunDir: { value: new THREE.Vector3(-0.72, 0.58, -0.38).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      uniform vec3 uSunDir;
      void main() {
        float h = vDir.y;
        vec3 zenith = vec3(0.48, 0.7, 0.92);
        vec3 horizon = vec3(0.99, 0.85, 0.66);
        vec3 ground = vec3(0.62, 0.58, 0.48);
        vec3 col = mix(horizon, zenith, smoothstep(-0.02, 0.64, h));
        col = mix(ground, col, smoothstep(-0.45, 0.05, h));
        float sun = pow(max(0.0, dot(normalize(vDir), uSunDir)), 90.0);
        float glow = pow(max(0.0, dot(normalize(vDir), uSunDir)), 6.0);
        col += vec3(1.0, 0.9, 0.7) * (sun * 1.7 + glow * 0.24);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.name = "sky";
  group.add(sky);
  disposables.push(skyGeo, skyMat);

  return {
    group,
    bounds: {
      halfW,
      halfD,
      corner,
      floorY,
      innerMin: new THREE.Vector2(-halfW + 0.16, -halfD + 0.16),
      innerMax: new THREE.Vector2(halfW - 0.16, halfD - 0.16),
    },
    dispose() {
      group.removeFromParent();
      for (const item of disposables) item.dispose();
    },
  };
}

export function clampToPool(
  x: number,
  z: number,
  bounds: PoolBounds,
  pad = 0,
): { x: number; z: number } {
  const minX = bounds.innerMin.x + pad;
  const maxX = bounds.innerMax.x - pad;
  const minZ = bounds.innerMin.y + pad;
  const maxZ = bounds.innerMax.y - pad;
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    z: Math.min(maxZ, Math.max(minZ, z)),
  };
}

export function insidePool(x: number, z: number, bounds: PoolBounds, pad = 0): boolean {
  const c = clampToPool(x, z, bounds, pad);
  return Math.abs(c.x - x) < 1e-5 && Math.abs(c.z - z) < 1e-5;
}
