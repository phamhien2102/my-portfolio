import * as THREE from "three";

import { THEME, accentAt } from "@/config/theme";

import { PROJECTS, type Project } from "../data";

export interface GalleryScene {
  /** Bring this project to the front. */
  setActive: (index: number) => void;
  dispose: () => void;
}

interface GallerySceneOptions {
  /** Element the canvas is mounted into (fills it, follows its size). */
  host: HTMLElement;
  /** A neighbouring screen was clicked, or a drag settled on another one. */
  onSelect: (index: number) => void;
  /** The front screen was clicked. */
  onOpen: (index: number) => void;
}

const FOV = 38;
/** The screens stand on a circle of this radius; the camera is near its centre. */
const RADIUS = 8;
const PANEL_W = 5.6;
const PANEL_H = 3.5;
/** Angle between neighbouring screens, in radians. */
const STEP = 0.66;
/** Gap between the floor and the bottom of a screen. */
const LIFT = 0.35;
const CENTER_Y = LIFT + PANEL_H / 2;
/** Texture size of a screen (same ratio as the panel). */
const TEX_W = 1120;
const TEX_H = 700;
const DRAG_SLOP = 6;

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

function rgba(hex: string, alpha: number): string {
  const c = new THREE.Color(hex);
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d") };
}

/** Paint a project's screen: its image (or a generated backdrop), plus title and year. */
function paintScreen(
  ctx: CanvasRenderingContext2D,
  project: Project,
  index: number,
  font: string,
  image: HTMLImageElement | null,
) {
  const radius = 44;
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.save();
  roundedRect(ctx, 0, 0, TEX_W, TEX_H, radius);
  ctx.clip();

  ctx.fillStyle = "#0d0d14";
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  if (image) {
    // Cover-fit the picture.
    const scale = Math.max(TEX_W / image.width, TEX_H / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.drawImage(image, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
  } else {
    const a = ctx.createRadialGradient(TEX_W * 0.12, 0, 0, TEX_W * 0.12, 0, TEX_W * 0.75);
    a.addColorStop(0, rgba(accentAt(index), 0.8));
    a.addColorStop(1, rgba(accentAt(index), 0));
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    const b = ctx.createRadialGradient(TEX_W, TEX_H, 0, TEX_W, TEX_H, TEX_W * 0.65);
    b.addColorStop(0, rgba(accentAt(index + 3), 0.65));
    b.addColorStop(1, rgba(accentAt(index + 3), 0));
    ctx.fillStyle = b;
    ctx.fillRect(0, 0, TEX_W, TEX_H);

    // Faint grid.
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 2;
    for (let x = 0; x <= TEX_W; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, TEX_H);
      ctx.stroke();
    }
    for (let y = 0; y <= TEX_H; y += 56) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(TEX_W, y);
      ctx.stroke();
    }

    // Big outlined number.
    ctx.font = `900 440px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.strokeText(String(index + 1).padStart(2, "0"), TEX_W / 2, TEX_H * 0.44);
  }

  // Darken the bottom so the title is readable on any picture.
  const shade = ctx.createLinearGradient(0, TEX_H * 0.5, 0, TEX_H);
  shade.addColorStop(0, "rgba(9,9,14,0)");
  shade.addColorStop(1, "rgba(9,9,14,0.92)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 76px ${font}`;
  ctx.fillText(project.title, 56, TEX_H - 62);

  // Year chip, top left.
  ctx.font = `600 30px ui-monospace, Menlo, monospace`;
  const chipW = ctx.measureText(project.year).width + 44;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  roundedRect(ctx, 40, 40, chipW, 54, 27);
  ctx.fill();
  ctx.fillStyle = "#e4e4e7";
  ctx.textBaseline = "middle";
  ctx.fillText(project.year, 62, 68);

  ctx.restore();
}

/** Rounded outline, tinted per screen by the material colour. */
function frameTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(TEX_W, TEX_H);
  if (ctx) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 8;
    roundedRect(ctx, 4, 4, TEX_W - 8, TEX_H - 8, 44);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A soft round blob, used for glows and dust. */
function blobTexture(size = 128): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(size, size);
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

/** Fades from nothing at the top to white at the bottom: the reflection's alpha. */
function fadeTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(4, 128);
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#000000");
    g.addColorStop(0.35, "#000000");
    g.addColorStop(1, "#ffffff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

/**
 * Projects as a curved wall of floating screens standing on a neon grid floor and reflected in
 * it. The camera sits near the middle of the circle, so the screens wrap around the viewer; the
 * front one faces you, the others turn in and fade. Drag, click a neighbour, or drive it with
 * `setActive`. Runs only while on screen.
 */
export function createGalleryScene({ host, onSelect, onOpen }: GallerySceneOptions): GalleryScene {
  const size = () => ({ w: Math.max(1, host.clientWidth), h: Math.max(1, host.clientHeight) });
  const last = PROJECTS.length - 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size().w, size().h);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(THEME.background, 16, 46);
  const camera = new THREE.PerspectiveCamera(FOV, size().w / size().h, 0.1, 200);
  const lookAt = new THREE.Vector3(0, 1.15, RADIUS);
  let baseCamera = new THREE.Vector3(0, 1.5, 0);

  const font = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const blob = blobTexture();
  const frame = frameTexture();
  const fade = fadeTexture();
  const disposables: { dispose: () => void }[] = [blob, frame, fade];

  // ---------- Floor ----------
  const grid = new THREE.GridHelper(90, 90, 0xffffff, 0xffffff);
  grid.position.z = RADIUS;
  const gridMaterial = grid.material as THREE.LineBasicMaterial;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.22;
  scene.add(grid);

  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: blob,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      fog: false,
    }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.scale.set(15, 8, 1);
  pool.position.set(0, 0.02, RADIUS);
  scene.add(pool);

  // ---------- Screens ----------
  interface Screen {
    holder: THREE.Group;
    body: THREE.Group;
    mirror: THREE.Group;
    art: THREE.Mesh;
    artMaterial: THREE.MeshBasicMaterial;
    mirrorMaterial: THREE.MeshBasicMaterial;
    frameMaterial: THREE.MeshBasicMaterial;
    glowMaterial: THREE.MeshBasicMaterial;
    texture: THREE.CanvasTexture;
    tone: number;
  }

  const planeGeometry = new THREE.PlaneGeometry(PANEL_W, PANEL_H);
  const glowGeometry = new THREE.PlaneGeometry(PANEL_W * 1.7, PANEL_H * 1.9);
  disposables.push(planeGeometry, glowGeometry);

  const screens: Screen[] = PROJECTS.map((project, i) => {
    const accent = accentAt(i);
    const { canvas: art2d, ctx } = makeCanvas(TEX_W, TEX_H);
    const texture = new THREE.CanvasTexture(art2d);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    if (ctx) paintScreen(ctx, project, i, font, null);
    if (ctx && project.image) {
      const picture = new Image();
      picture.onload = () => {
        paintScreen(ctx, project, i, font, picture);
        texture.needsUpdate = true;
      };
      picture.src = project.image;
    }
    disposables.push(texture);

    const common = { transparent: true, depthWrite: false, fog: false, toneMapped: false };
    const artMaterial = new THREE.MeshBasicMaterial({ ...common, map: texture });
    const mirrorMaterial = new THREE.MeshBasicMaterial({
      ...common,
      map: texture,
      alphaMap: fade,
      opacity: 0.4,
    });
    const frameMaterial = new THREE.MeshBasicMaterial({ ...common, map: frame, color: accent });
    const glowMaterial = new THREE.MeshBasicMaterial({
      ...common,
      map: blob,
      color: accent,
      opacity: 0,
    });
    disposables.push(artMaterial, mirrorMaterial, frameMaterial, glowMaterial);

    const holder = new THREE.Group();

    // The screen itself, turned to face the middle of the circle.
    const body = new THREE.Group();
    body.position.set(0, CENTER_Y, RADIUS);
    body.rotation.y = Math.PI;
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.05;
    glow.renderOrder = 1;
    const art = new THREE.Mesh(planeGeometry, artMaterial);
    art.renderOrder = 3;
    const outline = new THREE.Mesh(planeGeometry, frameMaterial);
    outline.position.z = 0.01;
    outline.renderOrder = 4;
    body.add(glow, art, outline);

    // Its reflection in the floor.
    const mirror = new THREE.Group();
    mirror.position.set(0, -CENTER_Y, RADIUS);
    mirror.rotation.y = Math.PI;
    mirror.scale.y = -1;
    const reflection = new THREE.Mesh(planeGeometry, mirrorMaterial);
    reflection.renderOrder = 2;
    mirror.add(reflection);

    holder.add(body, mirror);
    scene.add(holder);
    return {
      holder,
      body,
      mirror,
      art,
      artMaterial,
      mirrorMaterial,
      frameMaterial,
      glowMaterial,
      texture,
      tone: 1,
    };
  });

  // ---------- Dust ----------
  const DUST = 140;
  const dustPositions = new Float32Array(DUST * 3);
  const dustSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 30;
    dustPositions[i * 3 + 1] = Math.random() * 7;
    dustPositions[i * 3 + 2] = -2 + Math.random() * 18;
    dustSeed[i] = Math.random() * Math.PI * 2;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    size: 0.14,
    map: blob,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    color: "#ffffff",
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);
  disposables.push(dustGeometry, dustMaterial);

  // ---------- Input ----------
  let active = 0;
  /** Live drag, as a fraction of one step (positive = dragged to the right). */
  let dragFraction = 0;
  let pressed: { id: number; x: number } | null = null;
  let dragging = false;
  let swallowClick = false;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, inside: false, ndc: new THREE.Vector2() };
  const raycaster = new THREE.Raycaster();

  /** The screen under (clientX, clientY), if any. */
  const pick = (clientX: number, clientY: number): number | null => {
    const rect = host.getBoundingClientRect();
    pointer.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer.ndc, camera);
    const hits = raycaster.intersectObjects(
      screens.map((s) => s.art),
      false,
    );
    if (hits.length === 0) return null;
    // Prefer the front-most screen of those overlapped.
    const hit = hits[0].object;
    const index = screens.findIndex((s) => s.art === hit);
    return index < 0 ? null : index;
  };

  const stepPixels = () => Math.max(120, size().w * 0.3);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swallowClick = false;
    pressed = { id: e.pointerId, x: e.clientX };
  };

  const onPointerMove = (e: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    pointer.tx = clamp(((e.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointer.ty = clamp(((e.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
    pointer.inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!pressed || e.pointerId !== pressed.id) {
      host.style.cursor = pointer.inside && pick(e.clientX, e.clientY) !== null ? "pointer" : "";
      return;
    }
    if (!dragging) {
      if (Math.abs(e.clientX - pressed.x) < DRAG_SLOP) return;
      dragging = true;
      host.setPointerCapture(e.pointerId);
      host.style.cursor = "grabbing";
    }
    const raw = (e.clientX - pressed.x) / stepPixels();
    const past = (active === 0 && raw > 0) || (active === last && raw < 0);
    dragFraction = past ? raw * 0.25 : raw;
  };

  const endDrag = (cancelled: boolean) => {
    const wasDragging = dragging;
    const fraction = dragFraction;
    pressed = null;
    dragging = false;
    dragFraction = 0;
    host.style.cursor = "";
    if (!wasDragging) return;
    swallowClick = true; // the click that follows a drag must not select anything
    if (!cancelled && Math.abs(fraction) > 0.22) {
      onSelect(clamp(active + (fraction < 0 ? 1 : -1), 0, last));
    }
  };
  const onPointerUp = () => endDrag(false);
  const onPointerCancel = () => endDrag(true);

  const onPointerLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
    pointer.inside = false;
    if (!dragging) host.style.cursor = "";
  };

  const onClick = (e: MouseEvent) => {
    if (swallowClick) {
      swallowClick = false;
      return;
    }
    const hit = pick(e.clientX, e.clientY);
    if (hit === null) return;
    if (hit === active) onOpen(hit);
    else onSelect(hit);
  };

  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerup", onPointerUp);
  host.addEventListener("pointercancel", onPointerCancel);
  host.addEventListener("pointerleave", onPointerLeave);
  host.addEventListener("click", onClick);

  // ---------- Size ----------
  const fit = () => {
    const { w, h } = size();
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    // Far enough that a screen and its reflection fit the height, and the front screen takes
    // at most about two thirds of the width.
    const half = Math.tan((FOV * Math.PI) / 360);
    const forHeight = (PANEL_H + LIFT + 2.6) / (2 * half);
    const forWidth = (PANEL_W * 1.3) / (2 * half * camera.aspect);
    baseCamera = new THREE.Vector3(0, 1.5, RADIUS - Math.max(forHeight, forWidth));
  };
  fit();
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(host);

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  let lastTime = performance.now();
  let position = 0; // eased "which screen is in front" (fractional while moving)
  const tint = new THREE.Color(accentAt(0));
  const tintTarget = new THREE.Color();
  const mix = new THREE.Color();

  const frameLoop = () => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const f = (a: number) => 1 - Math.pow(1 - a, dt * 60);
    const elapsed = clock.getElapsedTime();

    const target = clamp(active - dragFraction, -0.4, last + 0.4);
    position += (target - position) * f(dragging ? 0.4 : 0.09);

    pointer.x += (pointer.tx - pointer.x) * f(0.05);
    pointer.y += (pointer.ty - pointer.y) * f(0.05);

    // The camera drifts a little with the pointer (screen right is world -x here).
    camera.position.set(
      baseCamera.x - pointer.x * 0.7,
      baseCamera.y - pointer.y * 0.2 + Math.sin(elapsed * 0.4) * 0.04,
      baseCamera.z,
    );
    camera.lookAt(lookAt.x - pointer.x * 0.2, lookAt.y, lookAt.z);

    // Floor and glow take the colour of the project in front.
    const near = clamp(Math.round(position), 0, last);
    tintTarget.set(accentAt(near));
    tint.lerp(tintTarget, f(0.06));
    gridMaterial.color.copy(tint);
    (pool.material as THREE.MeshBasicMaterial).color.copy(tint);
    dustMaterial.color.copy(mix.copy(tint).lerp(new THREE.Color("#ffffff"), 0.4));

    screens.forEach((screen, i) => {
      const d = i - position;
      const away = Math.abs(d);
      const front = clamp(1 - away, 0, 1);

      screen.holder.rotation.y = -d * STEP;
      const scale = 0.84 + front * 0.16;
      screen.body.scale.setScalar(scale);
      // Rise gently when in front; everything bobs a little.
      const bob = Math.sin(elapsed * 0.9 + i * 1.7) * 0.05;
      const lift = front * 0.12 + bob;
      screen.body.position.y = CENTER_Y + lift;
      screen.mirror.position.y = -(CENTER_Y + lift);
      screen.mirror.scale.set(scale, -scale, 1);

      // Lean the front screen toward the pointer.
      const lean = front * front;
      screen.body.rotation.x = -pointer.y * 0.06 * lean;
      screen.body.rotation.y = Math.PI + pointer.x * 0.1 * lean;

      const tone = clamp(1 - away * 0.5, 0.1, 1);
      screen.tone += (tone - screen.tone) * f(0.2);
      screen.artMaterial.color.setScalar(screen.tone);
      screen.mirrorMaterial.color.setScalar(screen.tone);
      screen.artMaterial.opacity = clamp(1.25 - away * 0.35, 0, 1);
      screen.mirrorMaterial.opacity = 0.42 * clamp(1.2 - away * 0.4, 0, 1);
      screen.frameMaterial.opacity = 0.2 + front * 0.8;
      screen.glowMaterial.opacity = front * front * 0.45;
    });

    // Dust drifts upward and wraps.
    const attribute = dustGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < DUST; i++) {
      let y = attribute.getY(i) + dt * (0.18 + (i % 5) * 0.03);
      if (y > 7) y = 0;
      attribute.setY(i, y);
      attribute.setX(i, attribute.getX(i) + Math.sin(elapsed * 0.5 + dustSeed[i]) * dt * 0.12);
    }
    attribute.needsUpdate = true;

    renderer.render(scene, camera);
  };

  // Only run while on screen.
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      lastTime = performance.now();
      renderer.setAnimationLoop(frameLoop);
    } else {
      renderer.setAnimationLoop(null);
    }
  });
  visibility.observe(host);

  return {
    setActive: (index) => {
      active = clamp(index, 0, last);
    },
    dispose: () => {
      visibility.disconnect();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", onPointerUp);
      host.removeEventListener("pointercancel", onPointerCancel);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("click", onClick);
      host.style.cursor = "";
      grid.geometry.dispose();
      gridMaterial.dispose();
      pool.geometry.dispose();
      (pool.material as THREE.Material).dispose();
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
