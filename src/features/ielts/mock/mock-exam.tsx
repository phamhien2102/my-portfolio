"use client";

import Link from "next/link";
import { useState } from "react";
import { READING, SPEAKING, WRITING } from "./data";
import { ListeningTest } from "./listening-test";
import { OfficialTests } from "./official-tests";
import { usePersisted } from "./store";
import type { MockEntry } from "./types";
import { ReadingTest } from "./reading-test";
import { SpeakingTest } from "./speaking-test";
import { BANDS, type Band } from "./types";
import { WritingTest } from "./writing-test";

type Skill = "listening" | "reading" | "writing" | "speaking";

const START: { skill: Skill } = { skill: "reading" };

const SKILLS: { id: Skill; label: string; time: string }[] = [
  { id: "listening", label: "Listening", time: "40 min" },
  { id: "reading", label: "Reading", time: "60 min" },
  { id: "writing", label: "Writing", time: "60 min" },
  { id: "speaking", label: "Speaking", time: "~12 min" },
];

/** The mock exam page: pick the band, pick the test, take it. */
export function MockExamApp({ band, fontClassName }: { band: Band; fontClassName: string }) {
  // Remembered, so a reload while writing comes back to the Writing test.
  const [{ skill }, setPick] = usePersisted("ielts.mock.skill", START);
  const setSkill = (s: Skill) => setPick(() => ({ skill: s }));
  const current = BANDS.find((b) => b.id === band) ?? BANDS[0];

  return (
    <div data-page-theme="light" className={`ielts-app mx-app ${fontClassName}`}>
      <header className="topbar">
        <div className="topbar-left">
          <Link className="brand" href="/ielts">
            <span className="brand-name">
              <span>IELTS Practice</span>
            </span>
          </Link>
        </div>
        <div className="topbar-right">
          <Link className="cards-btn" href="/ielts#p-mock-exam-1-band-56-overview">
            Mock exam guide
          </Link>
        </div>
      </header>

      <main className="mx-main">
        <p className="mx-eyebrow">Mock Exam 1 · {current.label}</p>
        <h1>Take the test</h1>
        <div className="mx-bands" role="tablist" aria-label="Level">
          {BANDS.map((b) => (
            <Link key={b.id} href={`/ielts/mock/${b.id}`} role="tab" aria-selected={b.id === band}>
              {b.label}
            </Link>
          ))}
        </div>

        <div className="mx-skills" role="tablist" aria-label="Test">
          {SKILLS.map((s) => (
            <button
              key={s.id}
              role="tab"
              type="button"
              aria-selected={skill === s.id}
              onClick={() => setSkill(s.id)}
              data-testid={`mx-skill-${s.id}`}
            >
              {s.label}
              <small>{s.time}</small>
            </button>
          ))}
        </div>

        {skill === "reading" && (
          <Picked
            key={band}
            list={READING[band]}
            render={(e, slot) => <ReadingTest key={e.id} test={e.test} slot={slot} />}
          />
        )}
        {skill === "writing" && (
          <Picked
            key={band}
            list={WRITING[band]}
            render={(e, slot) => <WritingTest key={e.id} test={e.test} slot={slot} />}
          />
        )}
        {skill === "listening" && <ListeningTest key={band} band={band} />}
        {skill === "speaking" && (
          <Picked
            key={band}
            list={SPEAKING[band]}
            render={(e) => <SpeakingTest key={e.id} test={e.test} />}
          />
        )}

        <OfficialTests
          skill={skill}
          title={`Real ${SKILLS.find((x) => x.id === skill)?.label} tests`}
        />
      </main>
    </div>
  );
}

/**
 * Shows the tests of one skill. With more than one (for example a supplied official test next to the
 * practice test) a row of buttons picks which one to take; with one there is nothing to pick.
 */
function Picked<T>({
  list,
  render,
}: {
  list: MockEntry<T>[];
  render: (entry: MockEntry<T>, slot: string) => React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const entry = list[Math.min(index, list.length - 1)];
  // The first test keeps the original saved-progress key; later ones get their own.
  const slot = entry === list[0] ? "" : `.${entry.id}`;
  return (
    <>
      {list.length > 1 && (
        <div className="mx-picker" role="tablist" aria-label="Which test">
          {list.map((e, i) => (
            <button
              key={e.id}
              role="tab"
              type="button"
              aria-selected={e === entry}
              onClick={() => setIndex(i)}
            >
              {e.label}
              {e.kind === "official" ? " (official)" : ""}
            </button>
          ))}
        </div>
      )}
      {render(entry, slot)}
    </>
  );
}
