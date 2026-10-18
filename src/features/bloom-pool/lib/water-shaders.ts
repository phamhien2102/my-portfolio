/** Full-screen water composite. Intersects a world-space plane, then refracts the scene. */

export const WATER_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const WATER_FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform mat4 uInvViewProj;
  uniform mat4 uViewProj;
  uniform vec3 uCameraPos;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uNear;
  uniform float uFar;
  uniform float uWaterY;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec4 uPool;
  uniform float uCorner;
  uniform float uWhirl;
  uniform vec2 uWhirlCenter;
  uniform int uFlowerCount;
  uniform vec3 uFlowerPos[32];
  uniform float uFlowerRad[32];
  uniform int uRippleCount;
  uniform vec4 uRipples[16];

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  float poolDist(vec2 xz) {
    vec2 center = 0.5 * (uPool.xy + uPool.zw);
    vec2 halfSize = 0.5 * (uPool.zw - uPool.xy);
    return sdRoundBox(xz - center, halfSize, uCorner);
  }

  float flowerWell(vec2 xz) {
    float h = 0.0;
    for (int i = 0; i < 32; i++) {
      if (i >= uFlowerCount) break;
      float d = length(xz - uFlowerPos[i].xz);
      float rad = max(uFlowerRad[i], 0.04);
      float sit = smoothstep(0.12, -0.02, uFlowerPos[i].y);
      h += sit * 0.028 * smoothstep(rad * 1.7, rad * 0.15, d);
    }
    return h;
  }

  float rippleHeight(vec2 xz) {
    float h = 0.0;
    for (int i = 0; i < 16; i++) {
      if (i >= uRippleCount) break;
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (age < 0.0 || age > 3.2) continue;
      float dist = length(xz - r.xy);
      float radius = age * 1.55;
      float ring = exp(-pow(dist - radius, 2.0) * 70.0);
      float fade = exp(-age * 1.15) * r.w;
      h += ring * fade * 0.045;
    }
    return h;
  }

  float waves(vec2 xz) {
    float t = uTime;
    float w = 0.0;
    w += sin(xz.x * 1.65 + t * 0.85) * cos(xz.y * 1.28 - t * 0.62) * 0.011;
    w += sin(dot(xz, vec2(1.95, 1.08)) + t * 1.12) * 0.0065;
    w += sin(dot(xz, vec2(-1.22, 2.05)) - t * 0.74) * 0.0045;
    w += (noise(xz * 3.1 + t * 0.12) - 0.5) * 0.007;
    return w;
  }

  float whirlWell(vec2 xz) {
    if (uWhirl < 0.01) return 0.0;
    vec2 d = xz - uWhirlCenter;
    float r2 = dot(d, d);
    return uWhirl * 0.2 * exp(-r2 * 2.4);
  }

  float waterHeight(vec2 xz) {
    return waves(xz) + rippleHeight(xz) - whirlWell(xz) - flowerWell(xz);
  }

  vec3 waterNormal(vec2 xz) {
    float e = 0.045;
    float h = waterHeight(xz);
    float hx = waterHeight(xz + vec2(e, 0.0));
    float hz = waterHeight(xz + vec2(0.0, e));
    vec3 n = normalize(vec3(h - hx, e, h - hz));

    if (uWhirl > 0.01) {
      vec2 d = xz - uWhirlCenter;
      float r = length(d);
      float swirl = uWhirl * exp(-r * r * 1.8) * 0.35;
      vec2 tang = vec2(-d.y, d.x);
      n += vec3(tang.x, 0.0, tang.y) * swirl;
      n = normalize(n);
    }
    return n;
  }

  vec3 reconstructWorld(vec2 uv, float depth) {
    vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 world = uInvViewProj * clip;
    return world.xyz / world.w;
  }

  vec3 skyColor(vec3 dir) {
    float h = dir.y;
    vec3 zenith = vec3(0.46, 0.68, 0.9);
    vec3 horizon = vec3(0.99, 0.84, 0.64);
    vec3 ground = vec3(0.7, 0.66, 0.56);
    vec3 col = mix(horizon, zenith, smoothstep(-0.02, 0.62, h));
    col = mix(ground, col, smoothstep(-0.4, 0.04, h));
    float sun = pow(max(0.0, dot(dir, uSunDir)), 96.0);
    float glow = pow(max(0.0, dot(dir, uSunDir)), 6.0);
    col += uSunColor * (sun * 1.6 + glow * 0.22);
    return col;
  }

  float flowerShadow(vec2 xz) {
    float s = 0.0;
    for (int i = 0; i < 32; i++) {
      if (i >= uFlowerCount) break;
      vec2 d = xz - uFlowerPos[i].xz;
      float rad = uFlowerRad[i] * 1.15;
      float above = smoothstep(-0.2, 0.35, uFlowerPos[i].y);
      s += above * 0.38 * smoothstep(rad * 2.1, rad * 0.25, length(d));
    }
    return clamp(s, 0.0, 0.7);
  }

  void main() {
    vec3 sceneCol = texture2D(tColor, vUv).rgb;
    float depth = texture2D(tDepth, vUv).r;
    vec3 sceneWorld = reconstructWorld(vUv, depth);
    float sceneDist = length(sceneWorld - uCameraPos);

    vec2 ndc = vUv * 2.0 - 1.0;
    vec4 farH = uInvViewProj * vec4(ndc, 1.0, 1.0);
    vec3 far = farH.xyz / farH.w;
    vec3 dir = normalize(far - uCameraPos);

    if (dir.y >= -1e-4) {
      gl_FragColor = vec4(sceneCol, 1.0);
      return;
    }

    float t0 = (uWaterY - uCameraPos.y) / dir.y;
    if (t0 < 0.0) {
      gl_FragColor = vec4(sceneCol, 1.0);
      return;
    }

    vec3 guess = uCameraPos + dir * t0;
    float h = waterHeight(guess.xz);
    float t = (uWaterY + h - uCameraPos.y) / dir.y;
    vec3 hit = uCameraPos + dir * t;
    hit.y = uWaterY + waterHeight(hit.xz);

    float pd = poolDist(hit.xz);
    if (pd > 0.012) {
      gl_FragColor = vec4(sceneCol, 1.0);
      return;
    }

    float waterDist = length(hit - uCameraPos);
    // Above-water petals, coping and walls keep the original scene (no ghosted copies).
    if (sceneDist + 0.01 < waterDist && sceneWorld.y > uWaterY - 0.012) {
      gl_FragColor = vec4(sceneCol, 1.0);
      return;
    }

    vec3 N = waterNormal(hit.xz);
    if (dot(N, -dir) < 0.0) N = -N;

    float under = max(0.02, sceneDist - waterDist);
    if (sceneWorld.y > uWaterY + 0.02) under = 0.55;

    vec3 refrDir = refract(dir, N, 0.75);
    if (dot(refrDir, refrDir) < 1e-5) refrDir = dir;
    vec3 underPt = hit + refrDir * clamp(under, 0.12, 1.6);
    vec4 refrClip = uViewProj * vec4(underPt, 1.0);
    vec2 refrUv = refrClip.xy / refrClip.w * 0.5 + 0.5;
    refrUv += N.xz * vec2(0.018, 0.012) * clamp(under, 0.0, 1.2);

    vec3 refrCol = sceneCol;
    if (refrUv.x > 0.002 && refrUv.x < 0.998 && refrUv.y > 0.002 && refrUv.y < 0.998) {
      float rd = texture2D(tDepth, refrUv).r;
      vec3 rw = reconstructWorld(refrUv, rd);
      // Skip samples that would ghost coping or petals sitting on the surface.
      if (rw.y < uWaterY + 0.03) {
        refrCol = texture2D(tColor, refrUv).rgb;
        under = max(under, length(rw - hit));
      } else {
        refrCol = mix(sceneCol, vec3(0.08, 0.38, 0.42), 0.35);
      }
    }

    vec3 absorb = exp(-vec3(0.28, 0.07, 0.05) * under * 1.15);
    vec3 scatter = vec3(0.1, 0.52, 0.5);
    vec3 body = mix(scatter, refrCol * absorb, 0.45 + 0.55 * absorb.g);
    body = mix(body, vec3(0.18, 0.72, 0.68), 0.22);

    float caus = 0.0;
    vec2 cp = hit.xz * 2.6;
    caus += pow(0.5 + 0.5 * sin(cp.x + uTime * 0.9) * sin(cp.y * 1.35 - uTime * 0.7), 4.0);
    caus += pow(0.5 + 0.5 * sin(cp.x * 1.7 - uTime * 0.55 + 2.1) * sin(cp.y * 0.9 + uTime * 0.8), 4.0);
    body += uSunColor * caus * 0.38 * (1.0 - smoothstep(0.05, 1.8, under));

    vec3 reflDir = reflect(dir, N);
    vec3 sky = skyColor(reflDir);
    vec2 ssrUv = vUv + N.xz * vec2(-0.07, 0.11);
    vec3 ssr = sky;
    if (ssrUv.x > 0.0 && ssrUv.x < 1.0 && ssrUv.y > 0.0 && ssrUv.y < 1.0) {
      float sd = texture2D(tDepth, ssrUv).r;
      vec3 sw = reconstructWorld(ssrUv, sd);
      if (sw.y > uWaterY + 0.02) {
        ssr = mix(sky, texture2D(tColor, ssrUv).rgb, 0.72);
      }
    }
    vec3 refl = mix(sky, ssr, 0.8);

    float ndv = max(0.0, dot(N, -dir));
    float fresnel = 0.02 + 0.98 * pow(1.0 - ndv, 5.0);

    vec3 color = mix(body, refl, clamp(fresnel, 0.04, 0.92));
    color *= 1.0 - flowerShadow(hit.xz);

    vec3 halfV = normalize(uSunDir - dir);
    float spec = pow(max(0.0, dot(N, halfV)), 420.0);
    float glitter = step(0.972, noise(hit.xz * 36.0 + uTime * 0.8));
    color += uSunColor * (spec * 0.85 + glitter * spec * 2.4);

    float edge = 1.0 - smoothstep(-0.01, 0.11, -pd);
    float steep = clamp(1.0 - N.y, 0.0, 1.0);
    float foam = edge * (0.45 + 0.55 * noise(hit.xz * 18.0 + uTime * 0.7));
    foam += steep * 1.8 * (0.4 + 0.6 * noise(hit.xz * 22.0));
    if (uWhirl > 0.05) {
      vec2 d = hit.xz - uWhirlCenter;
      float ang = atan(d.y, d.x) + uTime * 1.4 * uWhirl;
      float r = length(d);
      foam += uWhirl * exp(-r * 1.6) * (0.35 + 0.65 * sin(ang * 6.0 + r * 14.0)) * 0.45;
    }
    color = mix(color, vec3(0.92, 0.97, 0.98), clamp(foam, 0.0, 0.55));

    // Soft contact with the coping so the waterline stays clean.
    color = mix(color, sceneCol, smoothstep(0.0, 0.012, pd + 0.004));

    gl_FragColor = vec4(color, 1.0);
  }
`;
