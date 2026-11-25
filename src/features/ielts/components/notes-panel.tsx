"use client";

import { useEffect, useMemo, useState } from "react";

import { MAX_NOTE, noteDates, useNotes, withText, type Note } from "../lib/study-store";
import { NoteCount } from "./note-count";

interface Props {
  /** Chapter id to its title, for the headings. */
  labels: Readonly<Record<string, string>>;
  /** Chapter ids in reading order, so the notes follow the course rather than the order they were made. */
  order: readonly string[];
  /** Close the panel and bring the reader to the passage the note is on. */
  onOpen: (note: Note) => void;
  onClose: () => void;
}

/** Every note, grouped by chapter: read it, jump to its passage, edit its text, or delete it. */
export function NotesPanel({ labels, order, onOpen, onClose }: Props) {
  const { items, update } = useNotes();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const groups = useMemo(() => {
    const known = new Set(order);
    // Notes of a chapter that no longer exists still show up, after the rest.
    const ids = [
      ...order,
      ...new Set(items.map((n) => n.chapterId).filter((id) => !known.has(id))),
    ];
    return ids
      .map((id) => ({
        id,
        label: labels[id] ?? id,
        notes: items.filter((n) => n.chapterId === id).sort((a, b) => a.start - b.start),
      }))
      .filter((group) => group.notes.length > 0);
  }, [items, labels, order]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Escape leaves an edit first, and only then the panel.
      if (editing) setEditing(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, onClose]);

  const startEdit = (note: Note) => {
    setEditing(note.id);
    setDraft(note.text);
  };

  const saveEdit = (id: string) => {
    const text = draft.trim();
    if (!text) return;
    update((all) => all.map((n) => (n.id === id ? withText(n, text) : n)));
    setEditing(null);
  };

  const remove = (id: string) => {
    update((all) => all.filter((n) => n.id !== id));
    if (editing === id) setEditing(null);
  };

  return (
    <div
      className="fc-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="fc-dialog fc-panel nt-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ntp-title"
      >
        <div className="fc-panel-head">
          <h2 id="ntp-title">Notes · {items.length}</h2>
          <button type="button" className="fc-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="fc-empty">
            No notes yet. Select a passage in a chapter and press the pencil icon.
          </p>
        ) : (
          <div className="nt-list">
            {groups.map((group) => (
              <section key={group.id} className="nt-group" aria-label={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.notes.map((note) => (
                    <li key={note.id} className="nt-item">
                      <blockquote>{note.quote}</blockquote>
                      {editing === note.id ? (
                        <>
                          <textarea
                            autoFocus
                            rows={4}
                            value={draft}
                            maxLength={MAX_NOTE}
                            aria-label="Note text"
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                saveEdit(note.id);
                              }
                            }}
                          />
                          <NoteCount length={draft.length} />
                          <div className="nt-actions">
                            <button
                              type="button"
                              disabled={!draft.trim()}
                              onClick={() => saveEdit(note.id)}
                            >
                              Save
                            </button>
                            <button type="button" onClick={() => setEditing(null)}>
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p>{note.text}</p>
                          <small className="nt-meta">{noteDates(note)}</small>
                          <div className="nt-actions">
                            <button type="button" onClick={() => onOpen(note)}>
                              Open
                            </button>
                            <button type="button" onClick={() => startEdit(note)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="is-danger"
                              onClick={() => remove(note.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
