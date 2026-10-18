import * as THREE from "three";

import type { FlowerSpecies } from "../config";

interface PetalOpts {
  length: number;
  width: number;
  rows?: number;
  cols?: number;
  cup?: number;
  curl?: number;
  ruffle?: number;
  point?: number;
  mid?: number;
}

function petalGeometry({
  length,
  width,
  rows = 16,
  cols = 12,
  cup = 0.05,
  curl = 0.04,
  ruffle = 0.01,
  point = 1.15,
  mid = 0.42,
}: PetalOpts): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rows; i++) {
    const u = i / rows;
    const widen = u < mid ? smoothstep(0, mid, u) : Math.pow(1 - (u - mid) / (1 - mid), point);
    const envelope = Math.max(0.02, widen) * (0.22 + 0.78 * Math.sin(Math.PI * Math.pow(u, 0.82)));

    for (let j = 0; j <= cols; j++) {
      const v = j / cols;
      const s = v * 2 - 1;
      const edge = Math.abs(s);
      const x = s * width * 0.5 * envelope;
      const z = u * length;
      const y =
        cup * (1 - edge * edge) * Math.sin(u * Math.PI) +
        curl * edge * edge * u * u +
        ruffle * Math.sin(u * 16 + s * 4) * edge * u;
      positions.push(x, y, z);
      uvs.push(u, v);

      const tip = 0.75 + 0.25 * u;
      const rim = 1 - edge * 0.12;
      colors.push(tip * rim, tip * rim, tip * rim);
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j;
      const b = a + cols + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const PETAL_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vColor;
  varying vec2 vUv;
  void main() {
    vColor = color;
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const PETAL_FRAGMENT = /* glsl */ `
  uniform vec3 uAlbedo;
  uniform vec3 uTip;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uSky;
  uniform vec3 uGround;
  uniform vec3 uCameraPos;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying vec3 vColor;
  varying vec2 vUv;

  void main() {
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    vec3 view = normalize(uCameraPos - vWorld);
    vec3 light = normalize(uSunDir);
    vec3 albedo = mix(uAlbedo, uTip, smoothstep(0.35, 1.0, vUv.x)) * vColor;

    float vein = 1.0 - 0.12 * smoothstep(0.04, 0.0, abs(vUv.y - 0.5));
    albedo *= vein;

    float hemi = 0.5 + 0.5 * n.y;
    vec3 ambient = mix(uGround, uSky, hemi) * albedo;
    float diff = max(0.0, dot(n, light));
    vec3 lit = albedo * uSunColor * diff;
    float wrap = pow(max(0.0, dot(-n, light)), 1.35);
    vec3 sub = albedo * vec3(1.0, 0.52, 0.38) * wrap * 0.7;
    float rim = pow(1.0 - max(0.0, dot(n, view)), 2.0) * max(0.0, dot(view, light));
    vec3 back = albedo * uSunColor * rim * 1.25;
    vec3 sheen = vec3(1.0, 0.95, 0.86) * pow(1.0 - max(dot(n, view), 0.0), 3.0) * 0.14;

    gl_FragColor = vec4(ambient * 0.5 + lit * 0.68 + sub + back + sheen, 1.0);
  }
`;

export interface FlowerMaterials {
  petal: THREE.ShaderMaterial;
  accent: THREE.ShaderMaterial;
  update: (sunDir: THREE.Vector3, cameraPos: THREE.Vector3) => void;
  dispose: () => void;
}

function makePetalMaterial(albedo: THREE.Color, tip: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: PETAL_VERTEX,
    fragmentShader: PETAL_FRAGMENT,
    uniforms: {
      uAlbedo: { value: albedo },
      uTip: { value: tip },
      uSunDir: { value: new THREE.Vector3(-0.72, 0.58, -0.38).normalize() },
      uSunColor: { value: new THREE.Color(1.0, 0.93, 0.78) },
      uSky: { value: new THREE.Color(0.86, 0.9, 0.95) },
      uGround: { value: new THREE.Color(0.35, 0.38, 0.28) },
      uCameraPos: { value: new THREE.Vector3() },
    },
    vertexColors: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
}

export function createFlowerMaterials(): FlowerMaterials {
  const petal = makePetalMaterial(new THREE.Color("#d94a7a"), new THREE.Color("#f4c3c8"));
  const accent = makePetalMaterial(new THREE.Color("#f0d36a"), new THREE.Color("#fff4c8"));
  const all = [petal, accent];
  return {
    petal,
    accent,
    update(sunDir, cameraPos) {
      for (const mat of all) {
        mat.uniforms.uSunDir.value.copy(sunDir);
        mat.uniforms.uCameraPos.value.copy(cameraPos);
      }
    },
    dispose() {
      petal.dispose();
      accent.dispose();
    },
  };
}

interface SpeciesBuild {
  radius: number;
  open: number;
  petals: { geo: THREE.BufferGeometry; color: THREE.Color; tip: THREE.Color }[];
  accents: THREE.BufferGeometry[];
}

function hibiscus(bright: boolean): SpeciesBuild {
  const petal = petalGeometry({
    length: 0.4,
    width: 0.42,
    cup: 0.1,
    curl: 0.08,
    ruffle: 0.02,
    point: 0.72,
    mid: 0.48,
  });
  const color = bright ? new THREE.Color("#ff6a2c") : new THREE.Color("#c81d5a");
  const tip = bright ? new THREE.Color("#ffd27a") : new THREE.Color("#f3a0b8");
  const petals = Array.from({ length: 5 }, () => ({ geo: petal, color, tip }));

  const column = new THREE.CylinderGeometry(0.008, 0.012, 0.12, 7);
  column.translate(0, 0.06, 0);
  const tipBall = new THREE.SphereGeometry(0.02, 8, 6);
  tipBall.translate(0, 0.13, 0);
  const pieces = [column, tipBall];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const s = new THREE.SphereGeometry(0.01, 6, 5);
    s.translate(Math.cos(a) * 0.03, 0.12, Math.sin(a) * 0.03);
    pieces.push(s);
  }
  const merged = mergeGeometries(pieces);
  return { radius: 0.38, petals, accents: [merged], open: 0.42 };
}

function lily(): SpeciesBuild {
  const petal = petalGeometry({
    length: 0.4,
    width: 0.18,
    cup: 0.1,
    curl: 0.025,
    ruffle: 0.004,
    point: 1.7,
    mid: 0.38,
  });
  const color = new THREE.Color("#f6efe4");
  const tip = new THREE.Color("#f0c9b0");
  const petals = Array.from({ length: 6 }, () => ({ geo: petal, color, tip }));
  const stamens: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const stem = new THREE.CylinderGeometry(0.004, 0.005, 0.12, 5);
    stem.translate(Math.cos(a) * 0.018, 0.06, Math.sin(a) * 0.018);
    const anther = new THREE.SphereGeometry(0.008, 6, 5);
    anther.translate(Math.cos(a) * 0.02, 0.125, Math.sin(a) * 0.02);
    stamens.push(stem, anther);
  }
  return { radius: 0.34, petals, accents: [mergeGeometries(stamens)], open: 0.55 };
}

function plumeria(): SpeciesBuild {
  const petal = petalGeometry({
    length: 0.36,
    width: 0.22,
    cup: 0.04,
    curl: 0.035,
    ruffle: 0.003,
    point: 1.2,
    mid: 0.48,
  });
  const color = new THREE.Color("#fff4dc");
  const tip = new THREE.Color("#f5b7c8");
  const petals = Array.from({ length: 5 }, () => ({ geo: petal, color, tip }));
  const heart = new THREE.SphereGeometry(0.03, 10, 8);
  heart.scale(1, 0.45, 1);
  heart.translate(0, 0.012, 0);
  return { radius: 0.32, petals, accents: [heart], open: 0.22 };
}

function mergeGeometries(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const pos: number[] = [];
  const nrm: number[] = [];
  const col: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let offset = 0;
  for (const geo of list) {
    geo.computeVertexNormals();
    const p = geo.getAttribute("position");
    const n = geo.getAttribute("normal");
    const u = geo.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nrm.push(n ? n.getX(i) : 0, n ? n.getY(i) : 1, n ? n.getZ(i) : 0);
      col.push(1, 1, 1);
      uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
    }
    const index = geo.getIndex();
    if (index) {
      for (let i = 0; i < index.count; i++) idx.push(index.getX(i) + offset);
    } else {
      for (let i = 0; i < p.count; i++) idx.push(offset + i);
    }
    offset += p.count;
  }
  merged.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  merged.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  merged.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  merged.setIndex(idx);
  for (const geo of list) geo.dispose();
  return merged;
}

export interface FlowerFactory {
  create: (species: FlowerSpecies) => { group: THREE.Group; radius: number };
  materials: FlowerMaterials;
  dispose: () => void;
}

export function createFlowerFactory(): FlowerFactory {
  const materials = createFlowerMaterials();
  const builds: Record<FlowerSpecies, SpeciesBuild> = {
    hibiscus: hibiscus(false),
    brightHibiscus: hibiscus(true),
    lily: lily(),
    plumeria: plumeria(),
  };

  const sharedMats = new Map<string, THREE.ShaderMaterial>();
  function petalMat(color: THREE.Color, tip: THREE.Color) {
    const key = `${color.getHexString()}-${tip.getHexString()}`;
    let mat = sharedMats.get(key);
    if (!mat) {
      mat = makePetalMaterial(color, tip);
      sharedMats.set(key, mat);
    }
    return mat;
  }

  return {
    materials: {
      ...materials,
      update(sunDir, cameraPos) {
        materials.update(sunDir, cameraPos);
        for (const mat of sharedMats.values()) {
          mat.uniforms.uSunDir.value.copy(sunDir);
          mat.uniforms.uCameraPos.value.copy(cameraPos);
        }
      },
      dispose() {
        for (const mat of sharedMats.values()) mat.dispose();
        materials.dispose();
      },
    },
    create(species) {
      const spec = builds[species];
      const group = new THREE.Group();
      const count = spec.petals.length;
      spec.petals.forEach((petal, i) => {
        const pivot = new THREE.Group();
        const yaw = (i / count) * Math.PI * 2 + (species === "plumeria" ? 0.2 : 0);
        pivot.rotation.order = "YXZ";
        pivot.rotation.y = yaw;
        pivot.rotation.x = spec.open;
        const mesh = new THREE.Mesh(petal.geo, petalMat(petal.color, petal.tip));
        mesh.position.z = 0.02;
        pivot.add(mesh);
        group.add(pivot);
      });
      if (species === "hibiscus" || species === "brightHibiscus") {
        spec.petals.forEach((petal, i) => {
          const pivot = new THREE.Group();
          pivot.rotation.order = "YXZ";
          pivot.rotation.y = (i / count) * Math.PI * 2 + 0.35;
          pivot.rotation.x = spec.open + 0.16;
          const mesh = new THREE.Mesh(petal.geo, petalMat(petal.color, petal.tip));
          mesh.scale.setScalar(0.76);
          mesh.position.z = 0.01;
          pivot.add(mesh);
          group.add(pivot);
        });
      }
      for (const geo of spec.accents) {
        const mesh = new THREE.Mesh(geo, materials.accent);
        mesh.position.y = 0.02;
        group.add(mesh);
      }
      group.userData.species = species;
      return { group, radius: spec.radius };
    },
    dispose() {
      for (const spec of Object.values(builds)) {
        const seen = new Set<THREE.BufferGeometry>();
        for (const petal of spec.petals) {
          if (!seen.has(petal.geo)) {
            petal.geo.dispose();
            seen.add(petal.geo);
          }
        }
        for (const geo of spec.accents) geo.dispose();
      }
      for (const mat of sharedMats.values()) mat.dispose();
      materials.dispose();
    },
  };
}
