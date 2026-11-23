"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

import { changesOf, chapterOf } from "../lib/guide";
import { renderInline } from "../lib/inline";
import type { Lesson, Module } from "../lib/types";
import { LessonDiagram } from "./lesson-diagram";
import { Alert, Arrow, Bulb, Check, Glyph, Pause, Play, Replay, Sparkle } from "./icons";

interface Props {
  lesson: Lesson;
  module: Module;
  initialStep: number;
  previous?: Lesson;
  next?: Lesson;
  onFinish: () => void;
}

const AUTOPLAY_MS = 5500;

const CALLOUT = {
  warn: { title: "Watch out", Icon: Alert },
  tip: { title: "Good to know", Icon: Bulb },
  insight: { title: "Key idea", Icon: Sparkle },
} as const;

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * One lesson as two grid columns: the sheet (title, animated stage, step timeline) and the guide
 * on the right. Mounted with a key built from the URL hash, so opening another lesson, or a
 * search result that points at a step, starts fresh at the right step.
 */
export function LessonView({ lesson, module, initialStep, previous, next, onFinish }: Props) {
  const last = lesson.steps.length - 1;
  const [index, setIndex] = useState(Math.min(initialStep, last));
  // Like the original course, a lesson plays itself until the reader takes over.
  const [wantsPlay, setWantsPlay] = useState(true);
  const [replays, setReplays] = useState(0);
  const reduceMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const playing = wantsPlay && !reduceMotion;
  const step = lesson.steps[index];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setIndex((i) => {
        if (i >= last) {
          setWantsPlay(false);
          return i;
        }
        return i + 1;
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing, last]);

  // ← → step, R replays, Space plays or pauses, unless a field or dialog needs the key.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, button, a, [contenteditable]") &&
        event.key === " "
      )
        return;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (document.querySelector("[role=dialog]")) return;
      if (event.key === "ArrowRight") {
        setWantsPlay(false);
        setIndex((i) => Math.min(i + 1, last));
      } else if (event.key === "ArrowLeft") {
        setWantsPlay(false);
        setIndex((i) => Math.max(i - 1, 0));
      } else if (event.key.toLowerCase() === "r") {
        setReplays((r) => r + 1);
      } else if (event.key === " ") {
        event.preventDefault();
        setWantsPlay((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  const go = (to: number) => {
    setWantsPlay(false);
    setIndex(Math.min(Math.max(to, 0), last));
  };

  const goNext = () => {
    if (index < last) return go(index + 1);
    onFinish();
    if (next) window.location.hash = next.id;
  };

  const goBack = () => {
    if (index > 0) return go(index - 1);
    if (previous) window.location.hash = `${previous.id}/${previous.steps.length}`;
  };

  const chapter = chapterOf(lesson, index);
  const changes = changesOf(lesson, index);
  const callout = step.callout && CALLOUT[step.callout.kind];
  const nextLabel =
    index < last
      ? `Next: ${lesson.steps[index + 1].short}`
      : next
        ? `Next lesson: ${next.title}`
        : "Finish course";
  const position = module.lessons.findIndex((l) => l.id === lesson.id) + 1;
  const level = lesson.level[0].toUpperCase() + lesson.level.slice(1);

  // A goal ticks off once the reader has passed its share of the steps.
  const goalDone = (i: number) => index >= Math.ceil(((i + 1) * last) / lesson.goals.length);

  return (
    <>
      <section className="ds-sheet" aria-label={lesson.title}>
        <header className="ds-lesson-head">
          <p className="ds-crumb">
            {module.name}
            <span>/</span>
            Lesson {position} of {module.lessons.length}
          </p>
          <div className="ds-lesson-head-row">
            <div className="ds-lesson-titles">
              <h1 className="ds-title">{lesson.title}</h1>
              <p className="ds-subtitle">{lesson.summary}</p>
            </div>
            <ul className="ds-tags" aria-label="About this lesson">
              <li className="ds-tag sand">
                <Glyph name="timer" size={12} />
                {lesson.minutes} min
              </li>
              <li className="ds-tag green">
                <Glyph name="gauge" size={12} />
                {level}
              </li>
              <li className="ds-tag violet">
                <Glyph name="queue" size={12} />
                {lesson.steps.length} steps
              </li>
            </ul>
          </div>
        </header>

        <div className="ds-stage">
          <div className="ds-hud" aria-label="Numbers for this step">
            {lesson.hud.map((slot) => {
              const metric = step.metrics?.find((m) => m.label === slot.label);
              return (
                <div key={slot.label} className="ds-chip" data-level={metric?.level}>
                  <span className="ds-chip-label">
                    <Glyph name={slot.icon} size={11} />
                    {slot.label}
                  </span>
                  <span
                    key={metric?.value ?? "none"}
                    className={cn("ds-chip-value", metric && "is-swap")}
                  >
                    {metric?.value ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="ds-tools">
            <button type="button" className="ds-tool" onClick={() => setReplays((r) => r + 1)}>
              <Replay />
              <span>Replay</span>
            </button>
            <button
              type="button"
              className="ds-tool"
              aria-pressed={playing}
              onClick={() => {
                if (index >= last) setIndex(0);
                setWantsPlay((p) => !p);
              }}
            >
              {playing ? <Pause /> : <Play />}
              <span>{playing ? "Pause" : "Play"}</span>
            </button>
          </div>

          <div className="ds-canvas">
            <LessonDiagram
              nodes={lesson.nodes}
              links={lesson.links}
              scene={step.scene}
              sceneKey={`${lesson.id}-${index}-${replays}`}
              title={`${lesson.title}: ${step.title}`}
            />
          </div>

          <div className="ds-legend" aria-hidden="true">
            <span>
              <i className="lg req" /> request
            </span>
            <span>
              <i className="lg res" /> response
            </span>
            <span>
              <i className="lg hand" /> handshake
            </span>
            <span>
              <i className="lg warn" /> failed
            </span>
          </div>
        </div>

        <div
          className="ds-card ds-timeline"
          style={{ "--n": lesson.steps.length } as React.CSSProperties}
        >
          <div className="ds-timeline-head">
            <span className="ds-eyebrow">In this lesson</span>
            <span className="ds-timeline-count">
              Step {index + 1} of {lesson.steps.length}
            </span>
          </div>
          <div className="ds-timeline-track">
            <div className="ds-timeline-rail" aria-hidden="true">
              <span style={{ width: `${last ? (index / last) * 100 : 0}%` }} />
            </div>
            <ol className="ds-timeline-steps">
              {lesson.steps.map((s, i) => (
                <li
                  key={s.short}
                  className={cn(i < index && "is-done", i === index && "is-current")}
                >
                  <button
                    type="button"
                    aria-current={i === index ? "step" : undefined}
                    onClick={() => go(i)}
                  >
                    <span className="ds-timeline-dot">{i + 1}</span>
                    <span className="ds-timeline-label">{s.short}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="ds-rail">
        <article className="ds-card ds-guide">
          <div className="ds-guide-meta">
            <span className="ds-eyebrow">
              Step {index + 1} / {lesson.steps.length}
            </span>
            <span className={cn("ds-chapter", chapter.tone)}>{chapter.label}</span>
          </div>

          <div className="ds-guide-content" key={index} aria-live="polite">
            <h2 className="ds-guide-title">{step.title}</h2>
            <div className="ds-guide-body">
              {step.body.map((paragraph, i) => (
                <p key={i}>{renderInline(paragraph)}</p>
              ))}
            </div>

            {step.callout && callout && (
              <aside className={cn("ds-callout", step.callout.kind)}>
                <span className="ds-callout-icon">
                  <callout.Icon />
                </span>
                <div>
                  <p className="ds-callout-title">{callout.title}</p>
                  <p>{renderInline(step.callout.text)}</p>
                </div>
              </aside>
            )}

            {changes.length > 0 && (
              <div className="ds-changes">
                <p className="ds-eyebrow">What changed</p>
                <ul>
                  {changes.map((c) => (
                    <li key={`${c.kind}-${c.text}`} className={cn("ds-chg", c.kind)}>
                      <b>{c.kind === "add" ? "+" : c.kind === "del" ? "−" : "~"}</b>
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {index === last && (
              <div className="ds-changes">
                <p className="ds-eyebrow">Key takeaways</p>
                <ul className="ds-takeaways">
                  {lesson.takeaways.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="ds-guide-nav">
            <button
              type="button"
              className="ds-btn-ghost"
              onClick={goBack}
              disabled={index === 0 && !previous}
              aria-label="Previous step"
            >
              <Arrow dir="left" />
              Back
            </button>
            <button
              type="button"
              className="ds-btn-next"
              onClick={goNext}
              disabled={index === last && !next}
            >
              <span className="ds-btn-next-label">{nextLabel}</span>
              {index === last && !next ? <Check /> : <Arrow />}
            </button>
          </div>
          <p className="ds-guide-hint">
            <kbd>←</kbd>
            <kbd>→</kbd> step · <kbd>R</kbd> replay · <kbd>Space</kbd> {playing ? "pause" : "play"}
          </p>
        </article>

        <section className="ds-card ds-goals" aria-label="What you will learn">
          <h2 className="ds-eyebrow">You&rsquo;ll learn</h2>
          <ul>
            {lesson.goals.map((goal, i) => (
              <li key={goal} className={cn(goalDone(i) && "is-done")}>
                <span className="ds-box" aria-hidden="true">
                  <Check />
                </span>
                {goal}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
