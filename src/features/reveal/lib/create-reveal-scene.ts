import * as THREE from "three";

import { REVEAL_CONFIG, type RevealConfig } from "../config";
import { hexToVec3 } from "./color";
import { drawText } from "./draw-text";
import { ACCUM_FRAGMENT, FINAL_FRAGMENT, VERTEX_SHADER, buildCommon } from "./shaders";

/**
 * Mounts the reveal effect into `container` (sized to fill it) and returns a `dispose`
 * function that tears down the renderer, GPU resources, observers and animation loop.
 * The render loop pauses automatically while the container is scrolled out of view.
 */
export function createRevealScene(
  container: HTMLElement,
  config: RevealConfig = REVEAL_CONFIG,
): () => void {
  const {
    word,
    palette,
    strokeGap,
    textY,
    textWidth,
    revealFade,
    revealScale,
    trailLength: N,
    blobScale,
    idleColor,
    bgColor,
    intro,
    idleDelay,
  } = config;

  // Splatter is a big, sudden motion: people who ask for less motion get the gentle melt instead.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const idleEffect =
    prefersReducedMotion && config.idleEffect !== "none" ? "dissolve" : config.idleEffect;

  const size = () => ({
    w: Math.max(1, container.clientWidth),
    h: Math.max(1, container.clientHeight),
  });

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size().w, size().h);
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  // Allow vertical page scroll on touch devices; horizontal drags still drive the blob.
  canvas.style.touchAction = "pan-y";
  container.appendChild(canvas);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeometry = new THREE.PlaneGeometry(2, 2);

  // ---------- Text texture (drawn with canvas 2D) ----------
  const textCanvas = document.createElement("canvas");
  const textTex = new THREE.CanvasTexture(textCanvas);
  textTex.minFilter = THREE.LinearFilter;
  textTex.generateMipmaps = false;

  const redrawText = () => {
    const { w, h } = size();
    drawText(textCanvas, { word, width: w, height: h, widthRatio: textWidth, y: textY });
    // The canvas size changes on resize, and a texture's GPU storage is fixed-size, so the old
    // allocation must be released first or the new pixels get uploaded into the wrong-sized store.
    textTex.dispose();
    textTex.needsUpdate = true;
  };
  redrawText();

  // ---------- Trail buffer (ping-pong): remembers where the blob has been ----------
  const rtSize = () => {
    const { w, h } = size();
    return {
      w: Math.max(1, Math.floor(w * revealScale)),
      h: Math.max(1, Math.floor(h * revealScale)),
    };
  };
  const makeRT = () => {
    const { w, h } = rtSize();
    return new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
    });
  };
  let rtRead = makeRT();
  let rtWrite = makeRT();

  // ---------- Pointer / trail state ----------
  const OFF = new THREE.Vector2(-5, -5);
  const START = new THREE.Vector2(0.04, textY);
  const initial = intro ? START : OFF;
  const trail = Array.from({ length: N }, () => initial.clone());
  const mouse = initial.clone();
  const prevHead = initial.clone();
  let speed = 0;
  let started = intro; // is there a blob on screen yet?
  let userControl = false; // true once the user has moved the pointer over the container

  const currentInk = hexToVec3(palette[0]);

  // Idle effect state. While `gone`, the blob has left (bursting or melting) and waits for the
  // pointer to move again.
  let gone = false;
  let life = 1; // 1 = blob fully formed, 0 = melted away (drives `uLife`)
  const prevMouse = initial.clone();
  const scales = Array.from({ length: N }, () => 1); // per-circle size (`uScale`)
  const velocity = Array.from({ length: N }, () => new THREE.Vector2());
  const age = new Float32Array(N);
  const lifespan = new Float32Array(N);

  const shared = {
    uInk: { value: currentInk },
    uTime: { value: 0 },
    uSpeed: { value: 0 },
    uResolution: { value: new THREE.Vector2(size().w, size().h) },
    uTrail: { value: trail },
    uScale: { value: scales },
    uLife: { value: life },
  };

  const common = buildCommon(N, blobScale);

  // ---------- Pass 1: accumulate swept area ----------
  const accumMat = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uPrev: { value: null as THREE.Texture | null },
      uFade: { value: revealFade },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: common + ACCUM_FRAGMENT,
  });
  const accumScene = new THREE.Scene();
  accumScene.add(new THREE.Mesh(quadGeometry, accumMat));

  // ---------- Pass 2: background + text mask + chrome blob ----------
  const finalMat = new THREE.ShaderMaterial({
    uniforms: {
      ...shared,
      uReveal: { value: null as THREE.Texture | null },
      uText: { value: textTex },
      uIdle: { value: hexToVec3(idleColor) },
      uBg: { value: hexToVec3(bgColor) },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: common + FINAL_FRAGMENT,
  });
  const finalScene = new THREE.Scene();
  finalScene.add(new THREE.Mesh(quadGeometry, finalMat));

  // ---------- Events ----------
  const onPointerMove = (e: PointerEvent) => {
    // Pointer coordinates are relative to the container, and ignored outside it.
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

    mouse.set(x / rect.width, 1 - y / rect.height);
    userControl = true; // pointer takes over from the intro sweep
    if (!started) {
      // no intro: place the whole tail at the pointer so the blob doesn't fly in from offscreen
      started = true;
      trail.forEach((t) => t.copy(mouse));
      prevHead.copy(mouse);
    }
  };
  window.addEventListener("pointermove", onPointerMove);

  let lastW = size().w;
  let lastH = size().h;
  const resizeObserver = new ResizeObserver(() => {
    const { w, h } = size();
    if (w === lastW && h === lastH) return; // ignore the initial observation
    lastW = w;
    lastH = h;
    renderer.setSize(w, h);
    shared.uResolution.value.set(w, h);
    const rt = rtSize();
    rtRead.setSize(rt.w, rt.h);
    rtWrite.setSize(rt.w, rt.h);
    redrawText();
  });
  resizeObserver.observe(container);

  // Re-draw the text once webfonts are ready so metrics are correct.
  let disposed = false;
  void document.fonts?.ready.then(() => {
    if (!disposed) redrawText();
  });

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  let lastTime = performance.now();
  let colorIdx = 0;
  let hasMoved = false;
  let idle = 0; // seconds the blob has been still

  const nextColor = () => {
    colorIdx = (colorIdx + 1) % palette.length;
    currentInk.copy(hexToVec3(palette[colorIdx]));
  };

  const DROPLET_DRAG = 3; // per second: droplets lose speed quickly
  const DROPLET_GRAVITY = 0.7; // UV heights per second squared

  /** The pointer stopped: send the blob away. */
  const leave = () => {
    gone = true;
    if (idleEffect !== "splatter") return; // dissolve just lowers `life`

    const aspect = size().w / size().h;
    for (let i = 0; i < N; i++) {
      // Tail circles are the small ones: they fly fastest; the heavy head barely moves.
      const t = i / (N - 1);
      const angle = Math.random() * Math.PI * 2;
      const power = (0.25 + 1.9 * Math.pow(t, 0.7)) * (0.75 + Math.random() * 0.5);
      // Screen-space speed, converted to UV (x is stretched by the aspect ratio).
      velocity[i].set((Math.cos(angle) * power) / aspect, Math.sin(angle) * power);
      age[i] = 0;
      lifespan[i] = 0.8 + Math.random() * 0.9;
    }
  };

  /** Advance the flying droplets; once every one has vanished the blob is truly gone. */
  const stepDroplets = (dt: number) => {
    const drag = Math.exp(-DROPLET_DRAG * dt);
    let alive = false;
    for (let i = 0; i < N; i++) {
      if (age[i] >= lifespan[i]) {
        scales[i] = 0;
        continue;
      }
      alive = true;
      age[i] += dt;
      velocity[i].multiplyScalar(drag);
      velocity[i].y -= DROPLET_GRAVITY * dt;
      trail[i].addScaledVector(velocity[i], dt);
      // Hold full size for the first third of the flight, then shrink to nothing.
      const k = Math.min(age[i] / lifespan[i], 1);
      const s = Math.min(Math.max((k - 0.3) / 0.7, 0), 1);
      scales[i] = 1 - s * s * (3 - 2 * s);
    }
    if (!alive) life = 0; // hides any leftovers
  };

  /** The pointer moved again: bring the blob back at the pointer. */
  const regrow = () => {
    gone = false;
    if (idleEffect === "splatter") {
      // The droplets are scattered; start a fresh blob under the pointer instead.
      trail.forEach((p) => p.copy(mouse));
      prevHead.copy(mouse);
      scales.fill(1);
      speed = 0;
      life = 0;
    }
    // dissolve: the tail is still in place, `life` simply climbs back up.
  };

  const frame = () => {
    const t = clock.getElapsedTime();
    shared.uTime.value = t;

    // Intro sweep: left to right, weaving up and down to cover the letter height
    if (intro && !userControl) {
      const k = Math.min(Math.max((t - 0.4) / 4.5, 0), 1);
      const e = k * k * (3 - 2 * k);
      mouse.set(0.04 + 0.92 * e, textY - 0.02 + 0.08 * Math.sin(t * 4.5));
    }

    // dt in seconds; f(a) converts a "per-frame at 60fps" lerp factor to any frame rate
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const f = (a: number) => 1 - Math.pow(1 - a, dt * 60);

    if (started) {
      const mouseDelta = mouse.distanceTo(prevMouse);
      prevMouse.copy(mouse);

      let moving: boolean;
      if (!gone) {
        prevHead.copy(trail[0]);
        trail[0].lerp(mouse, f(0.25));
        for (let i = 1; i < N; i++) trail[i].lerp(trail[i - 1], f(0.35));
        const v = Math.min((trail[0].distanceTo(prevHead) / Math.max(dt, 1e-3)) * (40 / 60), 1);
        speed += (v - speed) * f(0.08);
        moving = v > 0.04;
      } else {
        // The blob isn't following the pointer any more, so judge movement from the pointer itself.
        speed += (0 - speed) * f(0.08);
        moving = mouseDelta > 0.0012;
      }
      shared.uSpeed.value = speed;

      // Moving after a long enough pause = a new stroke -> next colour
      if (moving) {
        if (hasMoved && idle > strokeGap) nextColor();
        idle = 0;
        hasMoved = true;
        if (gone) regrow();
      } else {
        idle += dt;
        if (!gone && idleEffect !== "none" && idle > idleDelay) leave();
      }
    }

    // Drive the idle effect, then upload its state.
    if (gone) {
      if (idleEffect === "splatter") stepDroplets(dt);
      else life = Math.max(0, life - dt / 2.2); // slow melt
    } else {
      life += (1 - life) * f(0.1); // grow back out of nothing
    }
    shared.uLife.value = life;

    // Pass 1: write trail into the buffer, then swap read/write
    accumMat.uniforms.uPrev.value = rtRead.texture;
    renderer.setRenderTarget(rtWrite);
    renderer.render(accumScene, camera);
    [rtRead, rtWrite] = [rtWrite, rtRead];

    // Pass 2: draw to screen
    finalMat.uniforms.uReveal.value = rtRead.texture;
    renderer.setRenderTarget(null);
    renderer.render(finalScene, camera);
  };

  // Only render while the container is visible: saves GPU/battery once the user scrolls on.
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      lastTime = performance.now(); // avoid a big dt after the pause
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  });
  visibilityObserver.observe(container);

  return () => {
    disposed = true;
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    renderer.setAnimationLoop(null);
    window.removeEventListener("pointermove", onPointerMove);
    rtRead.dispose();
    rtWrite.dispose();
    textTex.dispose();
    quadGeometry.dispose();
    accumMat.dispose();
    finalMat.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };
}
