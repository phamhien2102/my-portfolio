"use client";

import { useEffect, useRef, useState } from "react";

import { clock, useNow } from "./store";
import type { SpeakingTest as SpeakingData } from "./types";

/** A countdown you start by hand: used for the one minute of preparation and the two of speaking. */
function PartTimer({ seconds, label }: { seconds: number; label: string }) {
  const now = useNow();
  const [endsAt, setEndsAt] = useState(0);
  const left = endsAt ? endsAt - now : seconds * 1000;
  const running = endsAt > 0 && left > 0;
  return (
    <div className="mx-timer">
      <span className={`mx-clock${endsAt && left <= 0 ? "is-low" : ""}`}>
        {clock(Math.max(0, left))}
      </span>
      <button
        type="button"
        className="mx-btn"
        onClick={() => setEndsAt(running ? 0 : Date.now() + seconds * 1000)}
      >
        {running ? "Stop" : `Start ${label}`}
      </button>
    </div>
  );
}

/** Record yourself with the microphone and play it back. Nothing leaves your browser. */
function Recorder({ name }: { name: string }) {
  const [state, setState] = useState<"idle" | "recording" | "ready" | "blocked">("idle");
  const [url, setUrl] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => () => rec.current?.stream.getTracks().forEach((t) => t.stop()), []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => chunks.current.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(
            new Blob(chunks.current, { type: r.mimeType || "audio/webm" }),
          );
        });
        setState("ready");
      };
      rec.current = r;
      r.start();
      setState("recording");
    } catch {
      setState("blocked");
    }
  }

  return (
    <div className="mx-recorder">
      {state !== "recording" ? (
        <button type="button" className="mx-btn" onClick={start}>
          {state === "ready" ? "Record again" : "Record myself"}
        </button>
      ) : (
        <button type="button" className="mx-btn primary" onClick={() => rec.current?.stop()}>
          Stop recording
        </button>
      )}
      {state === "recording" && <span className="mx-rec">● recording</span>}
      {state === "blocked" && (
        <span className="mx-note">The microphone is blocked or not available here.</span>
      )}
      {state === "ready" && url && (
        <>
          <audio controls src={url} />
          <a href={url} download={`${name}.webm`}>
            Download
          </a>
        </>
      )}
    </div>
  );
}

export function SpeakingTest({ test }: { test: SpeakingData }) {
  return (
    <div className="mx-speaking">
      <section className="mx-card">
        <h2>How to use this test</h2>
        <ul>
          <li>Speak out loud, as if an examiner were in the room. About 12 minutes in all.</li>
          <li>
            Part 1: answer each question in two or three sentences. Part 2: one minute to prepare,
            then speak for up to two minutes. Part 3: give reasons and examples.
          </li>
          <li>
            Record yourself, listen back, and check your answers against the checklist at the
            bottom.
          </li>
        </ul>
      </section>

      <section className="mx-card">
        <h2>Part 1 · Introduction and interview (4–5 minutes)</h2>
        {test.part1.map((t) => (
          <div key={t.topic} className="mx-topic">
            <h3>{t.topic}</h3>
            <ol>
              {t.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </div>
        ))}
        <Recorder name="speaking-part-1" />
      </section>

      <section className="mx-card">
        <h2>Part 2 · Long turn (3–4 minutes)</h2>
        <div className="mx-cue">
          <p>
            <b>{test.part2.cue}</b>
          </p>
          <p>You should say:</p>
          <ul>
            {test.part2.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p>{test.part2.followUp}</p>
        </div>
        <div className="mx-two">
          <div>
            <h4>Prepare (1 minute)</h4>
            <PartTimer seconds={60} label="preparing" />
          </div>
          <div>
            <h4>Speak (up to 2 minutes)</h4>
            <PartTimer seconds={120} label="speaking" />
          </div>
        </div>
        <Recorder name="speaking-part-2" />
      </section>

      <section className="mx-card">
        <h2>Part 3 · Discussion (4–5 minutes)</h2>
        <ol>
          {test.part3.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
        <Recorder name="speaking-part-3" />
      </section>

      <section className="mx-card">
        <h2>Mark yourself</h2>
        <ul className="mx-check">
          {[
            "I kept talking without long silences, and I did not translate in my head.",
            "I gave reasons and examples, not just yes or no.",
            "I used a range of words and did not repeat the same ones.",
            "I used past, present and future where they fit.",
            "I spoke clearly, with the stress on the important words.",
          ].map((t) => (
            <li key={t}>
              <label>
                <input type="checkbox" /> {t}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
