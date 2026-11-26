import { JetBrains_Mono } from "next/font/google";

import { BOOK } from "../data";
import { guardChapterHtml } from "../lib/answer-guard";
import { buildOutline } from "../lib/outline";
import "../ielts.css";
import { IeltsApp } from "./ielts-app";

const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jbm",
  display: "swap",
});

/**
 * /ielts: a four-week IELTS course laid out like an app: a course tree on the left, one chapter at
 * a time on the right. The chapters are rendered here, on the server, and the client shell only
 * decides which one is visible. A light page, so it opts out of the dark shell.
 *
 * Chapter bodies are injected as HTML. That is safe here because every byte comes from our own
 * build script, which keeps a short whitelist of tags and drops all styles, scripts and iframes.
 */
export function IeltsBook() {
  const first = BOOK.parts[0]?.chapters[0]?.id;

  return (
    <IeltsApp title="IELTS Practice" outline={buildOutline()} fontClassName={mono.variable}>
      {BOOK.parts.flatMap((part) =>
        part.chapters.map((chapter) => (
          <section
            key={chapter.id}
            id={chapter.id}
            className="chapter"
            hidden={chapter.id !== first}
            dangerouslySetInnerHTML={{ __html: guardChapterHtml(chapter.html, chapter.id) }}
          />
        )),
      )}
    </IeltsApp>
  );
}
