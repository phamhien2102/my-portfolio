import { cn } from "@/lib/cn";

import { MAX_NOTE } from "../lib/study-store";

/** How much of a note's length is used: "123 / 2000". Quiet until it gets close to the limit. */
export function NoteCount({ length }: { length: number }) {
  return (
    <small className={cn("nt-count", length >= MAX_NOTE * 0.9 && "is-near")}>
      {length} / {MAX_NOTE}
    </small>
  );
}
