import * as THREE from "three";

import { createRunner } from "./runner";
import { HELIX_RADIUS, HELIX_RISE, PATH_STYLES } from "./effects";

/** What a decoration needs to know about the scene it is added to. */
export interface DecorContext {
  scene: THREE.Scene;
  /** The route the camera follows. */
  curve: THREE.CatmullRomCurve3;
  /** Path colour at distance `t` (0-1): it takes on each gate's accent as it passes through. */
  colorAt: (t: number, out: THREE.Color) => THREE.Color;
}

/** Per-frame facts a decoration may animate from. */
export interface FrameState {
  /** Distance along the route (0-1) where the camera/character currently is. */
  t: number;
  dt: number;
  elapsed: number;
  /** Path colour at `t`. */
  color: THREE.Color;
}

/** What a decoration hands back if it needs to move. */
export interface Decor {
  update?: (frame: FrameState) => void;
}

const WHITE = new THREE.Color("#ffffff");

/** A tube along `curve` whose vertex colours follow `colorAt`. */
export function coloredTube(
  curve: THREE.Curve<THREE.Vector3>,
  radius: number,
  colorAt: DecorContext["colorAt"],
  tubular = 700,
  radial = 6,
): THREE.TubeGeometry {
  const geometry = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    // Vertices are laid out ring by ring: (radial + 1) per step along the path.
    colorAt(Math.floor(i / (radial + 1)) / tubular, c).toArray(colors, i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** Faint additive lines: the shared look of rungs, ribs and streaks. */
function glowLines(opacity: number, vertexColors: boolean, color?: string) {
  return new THREE.LineBasicMaterial({
    color,
    vertexColors,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

/** Turns a ring/gate so that it faces along the route at `t`. */
function faceAlong(object: THREE.Object3D, curve: THREE.CatmullRomCurve3, t: number) {
  const position = curve.getPointAt(t);
  object.position.copy(position);
  object.lookAt(position.clone().add(curve.getTangentAt(t)));
}

/**
 * Helix: a second strand wound the other way, rungs joining the two (like DNA), a glowing axis
 * and a few faint rings around the tower, so spiralling up has something to circle around.
 */
export function addHelixDecor({ scene, curve, colorAt }: DecorContext) {
  const points = PATH_STYLES.helix.points;
  const other = new THREE.CatmullRomCurve3(
    // The second strand is the first turned half a circle around the axis.
    points.map(([x, y, z]) => new THREE.Vector3(-x, y, -z)),
    false,
    "catmullrom",
    0.5,
  );

  scene.add(
    new THREE.Mesh(
      coloredTube(other, 0.07, colorAt),
      new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 }),
    ),
  );

  const RUNGS = 110;
  const rungPositions = new Float32Array(RUNGS * 6);
  const rungColors = new Float32Array(RUNGS * 6);
  const c = new THREE.Color();
  for (let i = 0; i < RUNGS; i++) {
    const t = i / (RUNGS - 1);
    curve.getPointAt(t).toArray(rungPositions, i * 6);
    other.getPointAt(t).toArray(rungPositions, i * 6 + 3);
    colorAt(t, c).toArray(rungColors, i * 6);
    c.toArray(rungColors, i * 6 + 3);
  }
  const rungGeometry = new THREE.BufferGeometry();
  rungGeometry.setAttribute("position", new THREE.BufferAttribute(rungPositions, 3));
  rungGeometry.setAttribute("color", new THREE.BufferAttribute(rungColors, 3));
  scene.add(new THREE.LineSegments(rungGeometry, glowLines(0.35, true)));

  const top = (points.length - 1) * HELIX_RISE;
  const axis = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, -12, 0),
    new THREE.Vector3(0, top + 12, 0),
  ]);
  scene.add(new THREE.Line(axis, glowLines(0.5, false, "#ffffff")));

  const circle = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 96 }, (_, k) => {
      const angle = (k / 96) * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * HELIX_RADIUS * 1.7,
        0,
        Math.sin(angle) * HELIX_RADIUS * 1.7,
      );
    }),
  );
  const ringMaterial = glowLines(0.1, false, "#ffffff");
  for (let y = -6; y <= top + 6; y += 6) {
    const ring = new THREE.LineLoop(circle, ringMaterial);
    ring.position.y = y;
    scene.add(ring);
  }
}

/**
 * Warp tunnel: hexagonal rings spaced along the route, long ribs joining their corners, and
 * light streaks racing past. The gates are simply the biggest, brightest rings.
 */
export function addTunnelDecor({ scene, curve, colorAt }: DecorContext) {
  const RADIUS = 7;
  const c = new THREE.Color();

  const ringGeometry = new THREE.TorusGeometry(RADIUS, 0.035, 3, 6);
  const RINGS = 90;
  for (let i = 0; i < RINGS; i++) {
    const t = i / (RINGS - 1);
    const ring = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({
        color: colorAt(t, c).clone(),
        transparent: true,
        opacity: 0.7,
      }),
    );
    faceAlong(ring, curve, t);
    ring.rotateZ(i * 0.08); // each ring is twisted a little from the last, like a bore
    scene.add(ring);
  }

  // Ribs: six long lines following the route at the corners of the rings.
  const SAMPLES = 160;
  for (let k = 0; k < 6; k++) {
    const angle = (k / 6) * Math.PI * 2;
    const corner = new THREE.Vector3(Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0);
    const line = new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: SAMPLES }, (_, i) => curve.getPointAt(i / (SAMPLES - 1)).add(corner)),
    );
    scene.add(new THREE.Line(line, glowLines(0.14, false, "#ffffff")));
  }

  // Streaks: each fades from nothing at its tail to the path colour at its head.
  const STREAKS = 650;
  const positions = new Float32Array(STREAKS * 6);
  const colors = new Float32Array(STREAKS * 6);
  const tail = new THREE.Vector3();
  const head = new THREE.Vector3();
  for (let i = 0; i < STREAKS; i++) {
    const t = Math.random();
    const around = Math.random() * Math.PI * 2;
    const radius = 2.2 + Math.sqrt(Math.random()) * (RADIUS - 2.6);
    tail.copy(curve.getPointAt(t));
    tail.x += Math.cos(around) * radius;
    tail.y += Math.sin(around) * radius;
    head.copy(tail).addScaledVector(curve.getTangentAt(t), 4 + Math.random() * 10);
    tail.toArray(positions, i * 6);
    head.toArray(positions, i * 6 + 3);
    // The tail stays black: with additive blending, black is invisible.
    colorAt(t, c)
      .lerp(WHITE, 0.35)
      .toArray(colors, i * 6 + 3);
  }
  const streaks = new THREE.BufferGeometry();
  streaks.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  streaks.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.LineSegments(streaks, glowLines(0.7, true)));
}

/**
 * Runner: a neon city. A flat road with glowing edges and dashes, a faint grid floor, wireframe
 * towers on both sides, and the astronaut who runs wherever the scroll takes him.
 */
export function addRunnerDecor({ scene, curve, colorAt }: DecorContext): Decor {
  const c = new THREE.Color();
  const HALF_ROAD = 2.6;
  const up = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const side = new THREE.Vector3();

  // Lighting for the (lit) character only; everything else is unlit.
  scene.add(new THREE.HemisphereLight("#a9b8ff", "#1b1030", 1.6));
  const sun = new THREE.DirectionalLight("#ffffff", 2.4);
  sun.position.set(5, 12, 14);
  scene.add(sun);

  // Road ribbon, edges and centre dashes.
  const SEGMENTS = 420;
  const roadPositions: number[] = [];
  const roadColors: number[] = [];
  const edgeA: number[] = [];
  const edgeB: number[] = [];
  const edgeColorsA: number[] = [];
  const edgeColorsB: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    curve.getPointAt(t, p);
    const tangent = curve.getTangentAt(t);
    side.crossVectors(tangent, up).setY(0).normalize();
    colorAt(t, c);
    for (const [sign, edge, edgeColors] of [
      [-1, edgeA, edgeColorsA],
      [1, edgeB, edgeColorsB],
    ] as const) {
      roadPositions.push(p.x + side.x * HALF_ROAD * sign, 0.02, p.z + side.z * HALF_ROAD * sign);
      roadColors.push(c.r, c.g, c.b);
      edge.push(p.x + side.x * HALF_ROAD * sign, 0.04, p.z + side.z * HALF_ROAD * sign);
      edgeColors.push(c.r, c.g, c.b);
    }
    if (i < SEGMENTS) {
      const k = i * 2;
      indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const road = new THREE.BufferGeometry();
  road.setAttribute("position", new THREE.Float32BufferAttribute(roadPositions, 3));
  road.setAttribute("color", new THREE.Float32BufferAttribute(roadColors, 3));
  road.setIndex(indices);
  scene.add(
    new THREE.Mesh(
      road,
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  for (const [positions, colors] of [
    [edgeA, edgeColorsA],
    [edgeB, edgeColorsB],
  ] as const) {
    const edge = new THREE.BufferGeometry();
    edge.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    edge.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    scene.add(new THREE.Line(edge, glowLines(0.95, true)));
  }

  const DASHES = 70;
  const dashPoints: THREE.Vector3[] = [];
  for (let i = 0; i < DASHES; i++) {
    dashPoints.push(
      curve.getPointAt(i / DASHES).setY(0.03),
      curve.getPointAt(Math.min((i + 0.35) / DASHES, 1)).setY(0.03),
    );
  }
  scene.add(
    new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(dashPoints),
      glowLines(0.5, false, "#ffffff"),
    ),
  );

  // Floor grid. It is huge, and the fog fades it into the distance.
  const grid = new THREE.GridHelper(520, 104, "#ffffff", "#ffffff");
  grid.position.set(0, 0, -170);
  const gridMaterial = grid.material as THREE.LineBasicMaterial;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.07;
  gridMaterial.depthWrite = false;
  scene.add(grid);

  // Towers: a dark body hides the grid behind it, glowing edges give it shape.
  const towerBody = new THREE.MeshBasicMaterial({ color: "#0a0a12" });
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const unitEdges = new THREE.EdgesGeometry(unit);
  const TOWERS = 110;
  for (let i = 0; i < TOWERS; i++) {
    const t = Math.random();
    curve.getPointAt(t, p);
    const tangent = curve.getTangentAt(t);
    side.crossVectors(tangent, up).setY(0).normalize();
    const away = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 38);
    const width = 2 + Math.random() * 4;
    const depth = 2 + Math.random() * 5;
    const height = 3 + Math.pow(Math.random(), 2.2) * 30;
    const tower = new THREE.Group();
    tower.position.set(p.x + side.x * away, height / 2, p.z + side.z * away);
    tower.rotation.y = Math.atan2(tangent.x, tangent.z);
    tower.scale.set(width, height, depth);
    tower.add(new THREE.Mesh(unit, towerBody));
    tower.add(
      new THREE.LineSegments(
        unitEdges,
        new THREE.LineBasicMaterial({
          color: colorAt(t, c).clone().lerp(WHITE, 0.25),
          transparent: true,
          opacity: 0.55,
        }),
      ),
    );
    scene.add(tower);
  }

  // The runner.
  const runner = createRunner();
  scene.add(runner.root);
  const length = curve.getLength();
  let lastT: number | null = null;
  const target = new THREE.Vector3();

  return {
    update({ t, dt, elapsed, color }) {
      curve.getPointAt(t, p);
      const tangent = curve.getTangentAt(t);
      runner.root.position.set(p.x, runner.root.position.y, p.z);
      runner.root.lookAt(target.set(p.x + tangent.x, runner.root.position.y, p.z + tangent.z));

      // Distance covered since last frame. Capped so a long jump (the progress rail) reads as a
      // sprint rather than a blur of legs.
      const limit = 20 * dt;
      const travelled = lastT === null ? 0 : (t - lastT) * length;
      lastT = t;
      runner.update(Math.min(Math.max(travelled, -limit), limit), dt, elapsed, color);
    },
  };
}
