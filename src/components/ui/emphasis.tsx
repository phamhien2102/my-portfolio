import { Fragment } from "react";

import { cn } from "@/lib/cn";

/**
 * Renders a string in which `**like this**` marks the few words worth the eye (a number, a result),
 * so copy can stay plain text in a data file. Unmatched asterisks are shown as they are.
 */
export function Emphasis({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, index) =>
        // split() with one capture group puts the marked text at every odd index.
        index % 2 === 1 ? (
          <strong key={index} className={cn("font-semibold text-white", className)}>
            {part}
          </strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
