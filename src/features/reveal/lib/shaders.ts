/** GLSL sources for the reveal effect. */

export const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

/** Shared GLSL: noise, smooth-min and the blob signed-distance field. */
export function buildCommon(trailLength: number, blobScale: number): string {
  const scale = blobScale.toFixed(2);
  return /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3  uInk;
  uniform vec2  uResolution;
  uniform vec2  uTrail[${trailLength}];
  /* Per-circle size multiplier: lets droplets shrink away individually when the blob bursts. */
  uniform float uScale[${trailLength}];
  /* 1 = blob fully formed, 0 = melted away. */
  uniform float uLife;
  /* Overall blob size multiplier, so it stays in proportion to the word on small screens. */
  uniform float uBlob;
  const int N = ${trailLength};

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
  }
  float map(vec2 p) {
    float aspect = uResolution.x / uResolution.y;
    float amp = 0.006 + 0.016 * uSpeed;
    vec2 w = vec2(noise(p * 7.0 + uTime * 0.6),
                  noise(p * 7.0 - uTime * 0.6 + 17.0)) - 0.5;
    vec2 q = p + w * amp * 2.0;

    float d = 1e5;
    for (int i = 0; i < N; i++) {
      vec2 c = uTrail[i]; c.x *= aspect;
      float t = float(i) / float(N - 1);
      float r = mix(0.065, 0.012, t) * ${scale} * uBlob * uScale[i];
      d = smin(d, length(q - c) - r, 0.07 * ${scale} * uBlob);
    }
    d += (noise(p * 60.0 + uTime) - 0.5) * 0.012 * uSpeed;

    // Melt-away: push the whole field outwards until nothing is left below zero. The noise
    // term makes the edge ragged while it shrinks. Offsets are sized so the resting blob
    // (merged tail, roughly -0.2 at its core) is fully gone at uLife = 0.
    float gone = 1.0 - uLife;
    d += gone * 0.45 + (noise(p * 28.0 + uTime * 0.4) - 0.5) * gone * 0.2;
    return d;
  }
`;
}

/** Pass 1: accumulate the area the blob has swept into the trail buffer. */
export const ACCUM_FRAGMENT = /* glsl */ `
  uniform sampler2D uPrev;
  uniform float uFade;
  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vUv; p.x *= aspect;

    float d = map(p);
    float stamp = 1.0 - smoothstep(-0.01, 0.025, d);
    vec4 prev = texture2D(uPrev, vUv);
    // untouched areas carry the current ink; freshly swept areas are overwritten with it
    vec3 base = prev.a > 0.02 ? prev.rgb : uInk;
    vec3 col  = mix(base, uInk, stamp);
    float a   = max(prev.a - uFade, stamp);
    gl_FragColor = vec4(col, a);
  }
`;

/** Pass 2: background + masked text + chrome blob. */
export const FINAL_FRAGMENT = /* glsl */ `
  uniform sampler2D uReveal;
  uniform sampler2D uText;
  uniform vec3 uIdle;
  uniform vec3 uIdleDocked;
  uniform vec3 uBg;
  /* The word is a transformed view of the text and reveal buffers, so shrinking it carries
     the painted colours along. uAnchor is a point on the word (its left edge, mid-height);
     uDest is where that point is drawn right now; uTextScale is the current size. */
  uniform vec2  uAnchor;
  uniform vec2  uDest;
  uniform float uTextScale;
  /* 0 = word fills the hero, 1 = word has shrunk into the header. */
  uniform float uDock;
  /* x = uv-y of the hero's bottom edge, y = hero height in uv. Outside the hero the canvas
     is transparent except for the word, so the page scrolls underneath it. */
  uniform vec2  uHero;

  vec3 env(vec3 r) {
    vec3 deep  = vec3(0.01, 0.06, 0.18);   // deep navy
    vec3 ocean = vec3(0.10, 0.52, 0.95);   // ocean blue
    vec3 sheen = vec3(0.70, 0.90, 1.00);   // pale sky-blue highlight
    float bands = sin(r.x * 7.0 + r.y * 5.0) * 0.5 + 0.5;
    float g = smoothstep(0.15, 0.85, bands * 0.55 + r.y * 0.35 + 0.35);
    vec3 col = mix(deep, ocean, g);
    float k = smoothstep(0.55, 0.95, bands) * smoothstep(0.0, 0.8, -r.y + 0.3);
    return mix(col, sheen, k * 0.55);
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vUv; p.x *= aspect;

    vec3 bg = uBg;

    // Where this pixel sits in the original (full-size) word, and whether it is inside it.
    vec2 src = uAnchor + (vUv - uDest) / uTextScale;
    float inside = step(0.0, src.x) * step(src.x, 1.0) * step(0.0, src.y) * step(src.y, 1.0);
    vec2 psrc = vec2(src.x * aspect, src.y);

    // 0 at the hero's bottom edge, 1 at its top
    float heroY = (vUv.y - uHero.x) / uHero.y;
    float inHero = smoothstep(0.0, 0.0015, heroY) * step(heroY, 1.0);

    // text only shows where the blob has passed; ragged edge from noise
    vec4 rv = texture2D(uReveal, src);          // rgb = stroke colour, a = coverage
    float m = smoothstep(0.42, 0.58, rv.a + (noise(psrc * 45.0) - 0.5) * 0.4);
    float txt = texture2D(uText, src).a * inside;
    vec3 idle = mix(uIdle, uIdleDocked, uDock); // idle text brightens once it is the logo
    vec3 wordCol = mix(idle, rv.rgb, m);        // stroke colour where swept
    vec3 base = mix(bg, idle, txt);
    base = mix(base, rv.rgb, txt * m);

    // chrome blob
    float d = map(p);
    vec2 e = vec2(0.002, 0.0);
    vec2 grad = vec2(map(p + e.xy) - map(p - e.xy),
                     map(p + e.yx) - map(p - e.yx));
    vec2 g = normalize(grad + 1e-6);
    float depth = clamp(-d / 0.05, 0.0, 1.0);
    vec3 n = normalize(vec3(g * sqrt(1.0 - depth * depth), depth + 0.05));

    vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
    vec3 col = env(r);
    vec3 L = normalize(vec3(-0.4, 0.6, 0.7));
    col += vec3(1.0) * pow(max(dot(n, L), 0.0), 48.0) * 0.9;
    col += vec3(0.35, 0.65, 0.95) * pow(1.0 - n.z, 3.0) * 0.35;

    // text seen through the blob, refracted by the normal
    float seen = texture2D(uText, src + n.xy * 0.03).a * inside;
    col = mix(col, col * 0.3 + uInk * 0.35, seen * 0.7);

    col = mix(col, vec3(0.03), smoothstep(-0.012, -0.001, d) * 0.85);

    float shape = 1.0 - smoothstep(0.0, 0.004, d);
    vec3 outCol = mix(base, col, shape);

    // dark-mode finish: soft vignette + animated film grain
    // (measured in hero space, so it scrolls away together with the hero)
    vec2 hv = vec2(vUv.x, clamp(heroY, 0.0, 1.0));
    float vig = 1.0 - 0.55 * smoothstep(0.25, 0.95, length((hv - 0.5) * vec2(1.0, 0.85)));
    float grain = (hash(vUv * uResolution + fract(uTime) * 100.0) - 0.5) * 0.05;
    vec3 heroCol = outCol * vig + grain;

    // Inside the hero: the full scene. Outside: only the word, so the canvas stays see-through.
    // (premultiplied alpha, matching the renderer's default)
    vec3 rgb = heroCol * inHero + wordCol * txt * (1.0 - inHero);
    float a = inHero + txt * (1.0 - inHero);
    gl_FragColor = vec4(rgb, a);
  }
`;
