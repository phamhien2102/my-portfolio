/**
 * Procedural water ambience and splashes. Audio starts muted and only plays
 * after a user gesture unlocks the context.
 */

export interface BloomAudio {
  setEnabled: (on: boolean) => void;
  unlock: () => void;
  splash: (intensity: number) => void;
  drip: () => void;
  dispose: () => void;
}

export function createBloomAudio(): BloomAudio {
  let ctx: AudioContext | null = null;
  let noise: AudioBuffer | null = null;
  let enabled = false;
  let unlocked = false;
  let ambience: { stop: () => void } | null = null;
  let lastSplash = 0;

  const Ctor = () =>
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  function audio(): AudioContext | null {
    const AudioCtor = Ctor();
    if (!AudioCtor) return null;
    if (!ctx) ctx = new AudioCtor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }

  function noiseBuf(ac: AudioContext) {
    if (!noise) {
      noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const data = noise.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = last * 0.97 + white * 0.03;
        data[i] = last * 2.2;
      }
    }
    return noise;
  }

  function startAmbience(ac: AudioContext) {
    if (ambience) return;
    const source = ac.createBufferSource();
    source.buffer = noiseBuf(ac);
    source.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 720;
    filter.Q.value = 0.7;
    const lfo = ac.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(filter.frequency);
    const volume = ac.createGain();
    volume.gain.value = 0.0001;
    source.connect(filter).connect(volume).connect(ac.destination);
    source.start();
    lfo.start();
    volume.gain.exponentialRampToValueAtTime(0.035, ac.currentTime + 1.6);
    ambience = {
      stop() {
        volume.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.3);
        source.stop(ac.currentTime + 0.4);
        lfo.stop(ac.currentTime + 0.4);
      },
    };
  }

  function hiss(
    ac: AudioContext,
    {
      dur,
      gain,
      freq,
      to,
      q = 1,
      type = "bandpass",
    }: {
      dur: number;
      gain: number;
      freq: number;
      to?: number;
      q?: number;
      type?: BiquadFilterType;
    },
  ) {
    const start = ac.currentTime;
    const source = ac.createBufferSource();
    source.buffer = noiseBuf(ac);
    source.loop = true;
    const filter = ac.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freq, start);
    if (to) filter.frequency.exponentialRampToValueAtTime(to, start + dur);
    const amp = ac.createGain();
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.02, dur / 4));
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    source.connect(filter).connect(amp).connect(ac.destination);
    source.start(start, Math.random());
    source.stop(start + dur + 0.04);
  }

  return {
    unlock() {
      unlocked = true;
      const ac = audio();
      if (!ac) return;
      const source = ac.createBufferSource();
      source.buffer = ac.createBuffer(1, 1, 22050);
      source.connect(ac.destination);
      source.start(0);
      if (enabled) startAmbience(ac);
    },
    setEnabled(on) {
      enabled = on;
      if (!unlocked || !ctx) return;
      if (on) startAmbience(ctx);
      else if (ambience) {
        ambience.stop();
        ambience = null;
      }
    },
    splash(intensity) {
      if (!enabled || !unlocked) return;
      const now = performance.now();
      if (now - lastSplash < 70) return;
      lastSplash = now;
      const ac = audio();
      if (!ac) return;
      const k = Math.min(Math.max(intensity, 0.2), 1.4);
      hiss(ac, { dur: 0.16 + k * 0.12, gain: 0.09 * k, freq: 900, to: 2400, q: 0.8 });
      hiss(ac, {
        dur: 0.22,
        gain: 0.07 * k,
        freq: 280,
        to: 120,
        type: "lowpass",
      });
      const osc = ac.createOscillator();
      const amp = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140 + k * 40, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(48, ac.currentTime + 0.2);
      amp.gain.setValueAtTime(0.0001, ac.currentTime);
      amp.gain.exponentialRampToValueAtTime(0.08 * k, ac.currentTime + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.28);
      osc.connect(amp).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.32);
    },
    drip() {
      if (!enabled || !unlocked) return;
      const ac = audio();
      if (!ac) return;
      hiss(ac, { dur: 0.07, gain: 0.04, freq: 2400, to: 4200, q: 1.4 });
    },
    dispose() {
      ambience?.stop();
      ambience = null;
      void ctx?.close();
      ctx = null;
    },
  };
}
