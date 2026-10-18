import * as THREE from "three";

function canvas2d(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Bloom Pool: 2D canvas is unavailable.");
  return [canvas, ctx];
}

function rand(seed: { n: number }) {
  seed.n = (seed.n * 16807 + 0.1) % 2147483647;
  return (seed.n % 1_000_000) / 1_000_000;
}

/** Warm ivory travertine with soft pits and bedding planes. */
export function travertineTexture(): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = canvas2d(size);
  ctx.fillStyle = "#f3ead8";
  ctx.fillRect(0, 0, size, size);
  const seed = { n: 17.3 };

  for (let i = 0; i < 80; i++) {
    const y = rand(seed) * size;
    const h = 6 + rand(seed) * 28;
    ctx.fillStyle = `rgba(${210 + rand(seed) * 30}, ${190 + rand(seed) * 25}, ${160 + rand(seed) * 30}, 0.18)`;
    ctx.fillRect(0, y, size, h);
  }
  for (let i = 0; i < 900; i++) {
    const x = rand(seed) * size;
    const y = rand(seed) * size;
    const r = 1 + rand(seed) * 7;
    ctx.fillStyle = `rgba(${180 + rand(seed) * 50}, ${160 + rand(seed) * 40}, ${130 + rand(seed) * 35}, ${0.04 + rand(seed) * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * (1.4 + rand(seed)), r * 0.5, rand(seed) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function mosaic(colors: string[], grout: string, cells: number): THREE.CanvasTexture {
  const size = 512;
  const [canvas, ctx] = canvas2d(size);
  ctx.fillStyle = grout;
  ctx.fillRect(0, 0, size, size);
  const cell = size / cells;
  const seed = { n: 91.2 };
  const gap = cell * 0.08;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const c = colors[Math.floor(rand(seed) * colors.length)] ?? colors[0];
      ctx.fillStyle = c;
      ctx.fillRect(x * cell + gap, y * cell + gap, cell - gap * 2, cell - gap * 2);
      if (rand(seed) > 0.65) {
        ctx.fillStyle = `rgba(255,255,255,${0.05 + rand(seed) * 0.12})`;
        ctx.fillRect(x * cell + gap, y * cell + gap, cell * 0.45, cell * 0.35);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function wallTileTexture(): THREE.CanvasTexture {
  return mosaic(
    ["#6fe0e4", "#4ec9d0", "#9aeeef", "#3bb8c0", "#e4fbfb", "#7fdde0", "#2aa3ad"],
    "#1a6b72",
    18,
  );
}

export function floorTileTexture(): THREE.CanvasTexture {
  return mosaic(["#5ed0d6", "#3fb8c0", "#8ae4e6", "#2aa4ae", "#c5f4f5", "#62d2d8"], "#1a646c", 14);
}

export function checkerTexture(): THREE.CanvasTexture {
  const size = 256;
  const [canvas, ctx] = canvas2d(size);
  const cells = 8;
  const cell = size / cells;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#f3efe4" : "#1f6f78";
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawFrond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  angle: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "rgba(18, 28, 16, 0.55)";
  const leaflets = 18;
  for (let i = 0; i < leaflets; i++) {
    const t = i / (leaflets - 1);
    const along = t * length;
    const side = i % 2 === 0 ? 1 : -1;
    const w = (0.18 + 0.55 * Math.sin(t * Math.PI)) * scale * 38;
    ctx.beginPath();
    ctx.moveTo(along, 0);
    ctx.quadraticCurveTo(along + 8, side * w, along + 18 * scale, side * w * 0.15);
    ctx.quadraticCurveTo(along + 6, side * w * 0.2, along + 4, 0);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(18, 28, 16, 0.7)";
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.5, 4, length, 0);
  ctx.stroke();
  ctx.restore();
}

/** Soft palm-frond shadows that sit on the deck. */
export function palmShadowTexture(): THREE.CanvasTexture {
  const size = 1024;
  const [canvas, ctx] = canvas2d(size);
  ctx.clearRect(0, 0, size, size);
  drawFrond(ctx, 80, 220, 420, -0.35, 1.15);
  drawFrond(ctx, 140, 280, 360, 0.15, 0.95);
  drawFrond(ctx, 620, 160, 380, -0.7, 1.05);
  drawFrond(ctx, 700, 720, 340, 0.4, 0.9);
  drawFrond(ctx, 200, 780, 300, -0.2, 0.8);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export interface PoolTextures {
  travertine: THREE.CanvasTexture;
  wall: THREE.CanvasTexture;
  floor: THREE.CanvasTexture;
  checker: THREE.CanvasTexture;
  palm: THREE.CanvasTexture;
  dispose: () => void;
}

export function createPoolTextures(): PoolTextures {
  const travertine = travertineTexture();
  const wall = wallTileTexture();
  const floor = floorTileTexture();
  const checker = checkerTexture();
  const palm = palmShadowTexture();
  return {
    travertine,
    wall,
    floor,
    checker,
    palm,
    dispose() {
      travertine.dispose();
      wall.dispose();
      floor.dispose();
      checker.dispose();
      palm.dispose();
    },
  };
}
