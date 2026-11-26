"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface Track {
  el: HTMLAudioElement;
  label: string;
}

/** What the recording is called: the label next to it, or the heading of the box it sits in. */
function labelFor(el: HTMLAudioElement): string {
  const own = el.closest("li")?.querySelector(".audio-label")?.textContent?.trim();
  if (own) return own;
  const heading = el.closest("aside")?.querySelector("strong")?.textContent?.trim();
  return heading || "Audio";
}

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Listening chapters put the player above a long transcript, so reading the script meant scrolling
 * the player out of sight. Once a recording has been started, this bar floats at the bottom with
 * play and pause, a seek bar, 10-second jumps, the playback speed and a way back to the player, so
 * the reader can keep listening while they read. It drives the same <audio> element as the native
 * player. The speed chosen is remembered and used for every recording.
 */

const RATES = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
const RATE_KEY = "ielts.audio-rate";
/** How long the recording's box stays highlighted after "Go to player". Keep in step with ielts.css. */
const FLASH_MS = 2000;

function savedRate(): number {
  try {
    const v = Number(window.localStorage.getItem(RATE_KEY));
    return RATES.includes(v) ? v : 1;
  } catch {
    return 1;
  }
}

export function AudioDock({ stageRef }: { stageRef: RefObject<HTMLDivElement | null> }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [rate, setRate] = useState(savedRate);
  const rateRef = useRef(rate);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const current = useRef<HTMLAudioElement | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // Media events do not bubble, so listen in the capture phase on the chapter area.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const audioOf = (e: Event) => (e.target instanceof HTMLAudioElement ? e.target : null);

    const onPlay = (e: Event) => {
      const el = audioOf(e);
      if (!el) return;
      // One recording at a time.
      stage.querySelectorAll("audio").forEach((other) => {
        if (other !== el) other.pause();
      });
      current.current = el;
      el.playbackRate = rateRef.current;
      setTrack({ el, label: labelFor(el) });
      setPlaying(true);
      setTime(el.currentTime);
      setDuration(el.duration);
    };
    const onPause = (e: Event) => {
      if (audioOf(e) === current.current) setPlaying(false);
    };
    const onTime = (e: Event) => {
      const el = audioOf(e);
      if (el && el === current.current) setTime(el.currentTime);
    };
    const onRate = (e: Event) => {
      // Changed from the browser's own speed menu: follow it.
      const el = audioOf(e);
      if (!el || el !== current.current || RATES.indexOf(el.playbackRate) < 0) return;
      rateRef.current = el.playbackRate;
      setRate(el.playbackRate);
      try {
        window.localStorage.setItem(RATE_KEY, String(el.playbackRate));
      } catch {
        // storage blocked: the speed just is not remembered
      }
    };
    const onMeta = (e: Event) => {
      const el = audioOf(e);
      if (el && el === current.current) setDuration(el.duration);
    };

    const events: [string, (e: Event) => void][] = [
      ["play", onPlay],
      ["pause", onPause],
      ["ended", onPause],
      ["timeupdate", onTime],
      ["ratechange", onRate],
      ["loadedmetadata", onMeta],
      ["durationchange", onMeta],
    ];
    for (const [name, fn] of events) stage.addEventListener(name, fn, true);
    return () => {
      for (const [name, fn] of events) stage.removeEventListener(name, fn, true);
      // Leaving the chapter (this component is keyed by it) stops the recording.
      current.current?.pause();
    };
  }, [stageRef]);

  const changeRate = (next: number) => {
    rateRef.current = next;
    setRate(next);
    if (current.current) current.current.playbackRate = next;
    try {
      window.localStorage.setItem(RATE_KEY, String(next));
    } catch {
      // storage blocked: the speed just is not remembered
    }
  };

  if (!track) return null;
  const { label } = track;
  const hasLength = Number.isFinite(duration) && duration > 0;

  // "Go to player": scroll to the recording's box and flash it so the reader sees where it is.
  const goToPlayer = () => {
    const media = current.current;
    if (!media) return;
    // The player may sit in a collapsed exercise: open every group around it first.
    for (let d = media.closest("details"); d; d = d.parentElement?.closest("details") ?? null)
      d.open = true;
    media.scrollIntoView({ block: "center", behavior: "smooth" });
    const box = media.closest<HTMLElement>("aside, li") ?? media;
    clearTimeout(flashTimer.current);
    box.classList.remove("audio-flash");
    void box.offsetWidth; // restart the animation if it is clicked again
    box.classList.add("audio-flash");
    flashTimer.current = setTimeout(() => box.classList.remove("audio-flash"), FLASH_MS);
  };

  // The element is driven through the ref: it is a DOM node, not React state.
  const seek = (to: number) => {
    const media = current.current;
    if (!media) return;
    media.currentTime = Math.max(0, Math.min(hasLength ? duration : Infinity, to));
    setTime(media.currentTime);
  };
  const jump = (delta: number) => seek((current.current?.currentTime ?? 0) + delta);

  return (
    <>
      {/* Room at the end of the chapter so the bar never covers the last lines. */}
      <div className="audio-dock-spacer" aria-hidden="true" />
      <div className="audio-dock" role="region" aria-label="Audio player">
        <div className="audio-dock-top">
          <span className="audio-dock-title" title={label}>
            {label}
          </span>
          <button type="button" className="audio-dock-link" onClick={goToPlayer}>
            Go to player
          </button>
          <button
            type="button"
            className="audio-dock-close"
            aria-label="Close player"
            onClick={() => {
              current.current?.pause();
              setTrack(null);
              current.current = null;
            }}
          >
            ×
          </button>
        </div>
        <div className="audio-dock-row">
          <button
            type="button"
            className="audio-dock-btn"
            aria-label="Back 10 seconds"
            onClick={() => jump(-10)}
          >
            −10
          </button>
          <button
            type="button"
            className="audio-dock-btn primary"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => (playing ? current.current?.pause() : void current.current?.play())}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            className="audio-dock-btn"
            aria-label="Forward 10 seconds"
            onClick={() => jump(10)}
          >
            +10
          </button>
          <input
            type="range"
            className="audio-dock-seek"
            aria-label="Seek"
            min={0}
            max={hasLength ? duration : 0}
            step={0.1}
            value={Math.min(time, hasLength ? duration : 0)}
            disabled={!hasLength}
            onChange={(e) => seek(Number(e.target.value))}
          />
          <span className="audio-dock-time">
            {clock(time)} / {clock(duration)}
          </span>
          <select
            className="audio-dock-rate"
            aria-label="Playback speed"
            value={rate}
            onChange={(e) => changeRate(Number(e.target.value))}
          >
            {RATES.map((r) => (
              <option key={r} value={r}>
                {r}×
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
