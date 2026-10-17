/**
 * Âm thanh sân bay tự tổng hợp bằng WebAudio, không cần file âm thanh nào.
 * AudioContext chỉ được tạo khi có âm đầu tiên, và trình duyệt chỉ cho phát sau một cú chạm.
 */

export type SoundName =
  | "flap"
  | "blip"
  | "chime"
  | "buzz"
  | "sparkle"
  | "thud"
  | "print"
  | "rip"
  | "whoosh"
  | "siren"
  | "boing"
  | "poof";

let context: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let enabled = true;
const lastPlayed: Partial<Record<SoundName, number>> = {};

/** Khoảng nghỉ tối thiểu giữa hai lần phát cùng một âm, để cả bảng ô lật không thành tiếng ồn. */
const MIN_GAP_MS: Partial<Record<SoundName, number>> = {
  flap: 28,
  blip: 40,
  buzz: 120,
  boing: 80,
};

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

/**
 * Mở khoá âm thanh. Phải gọi ngay trong một cú bấm của người dùng,
 * vì trình duyệt chặn mọi âm thanh phát ra trước cú chạm đầu tiên.
 */
export function unlockSound() {
  enabled = true;
  const ctx = audio();
  if (!ctx) return;
  // iOS chỉ mở khoá khi có một âm (dù im lặng) được phát trong chính cú chạm đó.
  const source = ctx.createBufferSource();
  source.buffer = ctx.createBuffer(1, 1, 22050);
  source.connect(ctx.destination);
  source.start(0);
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

function noise(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

interface ToneOptions {
  freq: number;
  to?: number;
  type?: OscillatorType;
  at?: number;
  dur: number;
  gain: number;
}

function tone(ctx: AudioContext, { freq, to, type = "sine", at = 0, dur, gain }: ToneOptions) {
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

interface NoiseOptions {
  at?: number;
  dur: number;
  gain: number;
  filter: BiquadFilterType;
  freq: number;
  to?: number;
  q?: number;
}

function hiss(ctx: AudioContext, { at = 0, dur, gain, filter, freq, to, q = 1 }: NoiseOptions) {
  const start = ctx.currentTime + at;
  const source = ctx.createBufferSource();
  source.buffer = noise(ctx);
  source.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = filter;
  band.Q.value = q;
  band.frequency.setValueAtTime(freq, start);
  if (to) band.frequency.exponentialRampToValueAtTime(to, start + dur);
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.02, dur / 3));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  source.connect(band).connect(amp).connect(ctx.destination);
  source.start(start, Math.random());
  source.stop(start + dur + 0.05);
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  const now = performance.now();
  const gap = MIN_GAP_MS[name] ?? 0;
  if (gap && now - (lastPlayed[name] ?? 0) < gap) return;
  lastPlayed[name] = now;

  const ctx = audio();
  if (!ctx) return;

  switch (name) {
    case "flap":
      hiss(ctx, { dur: 0.018, gain: 0.07, filter: "highpass", freq: 1800 });
      tone(ctx, { freq: 2400, type: "square", dur: 0.008, gain: 0.015 });
      break;
    case "blip":
      tone(ctx, { freq: 880, to: 1320, dur: 0.07, gain: 0.08 });
      break;
    case "chime":
      // Ba nốt đi lên như chuông thông báo ở sân bay.
      [523.25, 659.25, 783.99].forEach((freq, index) => {
        tone(ctx, { freq, at: index * 0.22, dur: 1.1, gain: 0.11 });
        tone(ctx, { freq: freq * 2, at: index * 0.22, dur: 0.6, gain: 0.02 });
      });
      break;
    case "buzz":
      tone(ctx, { freq: 140, type: "square", dur: 0.12, gain: 0.05 });
      tone(ctx, { freq: 110, type: "square", at: 0.13, dur: 0.16, gain: 0.05 });
      break;
    case "sparkle":
      [1046.5, 1318.5, 1568, 2093, 2637].forEach((freq, index) => {
        tone(ctx, { freq, at: index * 0.055, dur: 0.35, gain: 0.06 });
      });
      break;
    case "thud":
      tone(ctx, { freq: 150, to: 45, dur: 0.32, gain: 0.5 });
      hiss(ctx, { dur: 0.12, gain: 0.25, filter: "lowpass", freq: 900 });
      break;
    case "print":
      // Máy in đẩy giấy theo từng nấc, khớp với 18 nấc của hiệu ứng vé trượt ra.
      for (let i = 0; i < 18; i++) {
        hiss(ctx, { at: i * 0.133, dur: 0.07, gain: 0.06, filter: "bandpass", freq: 3200, q: 3 });
        tone(ctx, { freq: 70, type: "sawtooth", at: i * 0.133, dur: 0.08, gain: 0.025 });
      }
      break;
    case "rip":
      hiss(ctx, { dur: 0.38, gain: 0.3, filter: "bandpass", freq: 1500, to: 4200, q: 0.8 });
      for (let i = 0; i < 6; i++) {
        hiss(ctx, { at: i * 0.05, dur: 0.03, gain: 0.2, filter: "highpass", freq: 3000 });
      }
      break;
    case "whoosh":
      hiss(ctx, { dur: 2.6, gain: 0.22, filter: "bandpass", freq: 250, to: 1800, q: 0.7 });
      tone(ctx, { freq: 90, to: 160, type: "sawtooth", dur: 2.4, gain: 0.03 });
      break;
    case "boing":
      // Tiếng lò xo hoạt hình khi nút Alone nhảy đi chỗ khác.
      tone(ctx, { freq: 220, to: 880, type: "triangle", dur: 0.16, gain: 0.12 });
      tone(ctx, { freq: 880, to: 520, type: "sine", at: 0.12, dur: 0.18, gain: 0.06 });
      break;
    case "poof":
      hiss(ctx, { dur: 0.45, gain: 0.25, filter: "lowpass", freq: 2400, to: 300 });
      tone(ctx, { freq: 600, to: 120, type: "sine", dur: 0.3, gain: 0.08 });
      break;
    case "siren":
      for (let i = 0; i < 4; i++) {
        tone(ctx, { freq: 760, to: 980, type: "sawtooth", at: i * 0.24, dur: 0.22, gain: 0.04 });
      }
      break;
  }
}

export interface Engine {
  /** Ga từ 0 đến 1: càng cao động cơ càng gầm to và cao. */
  set: (throttle: number) => void;
  stop: () => void;
}

/**
 * Tiếng động cơ máy bay chạy liên tục cho màn giữ để cất cánh.
 * Trả về null khi đang tắt tiếng hoặc trình duyệt không hỗ trợ.
 */
export function startEngine(): Engine | null {
  if (!enabled) return null;
  const ctx = audio();
  if (!ctx) return null;

  const hum = ctx.createOscillator();
  hum.type = "sawtooth";
  hum.frequency.value = 70;
  const humFilter = ctx.createBiquadFilter();
  humFilter.type = "lowpass";
  humFilter.frequency.value = 400;

  const wind = ctx.createBufferSource();
  wind.buffer = noise(ctx);
  wind.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "bandpass";
  windFilter.frequency.value = 600;
  windFilter.Q.value = 0.6;

  const volume = ctx.createGain();
  volume.gain.value = 0.0001;
  hum.connect(humFilter).connect(volume);
  wind.connect(windFilter).connect(volume);
  volume.connect(ctx.destination);
  hum.start();
  wind.start();

  let stopped = false;
  return {
    set(throttle) {
      if (stopped) return;
      const t = ctx.currentTime;
      hum.frequency.setTargetAtTime(70 + throttle * 190, t, 0.05);
      humFilter.frequency.setTargetAtTime(400 + throttle * 1800, t, 0.05);
      windFilter.frequency.setTargetAtTime(600 + throttle * 1600, t, 0.05);
      volume.gain.setTargetAtTime(0.03 + throttle * 0.12, t, 0.05);
    },
    stop() {
      if (stopped) return;
      stopped = true;
      const t = ctx.currentTime;
      volume.gain.setTargetAtTime(0.0001, t, 0.08);
      hum.stop(t + 0.5);
      wind.stop(t + 0.5);
    },
  };
}
