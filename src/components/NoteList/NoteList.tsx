import type { MouseEvent } from "react";

import type { Note } from "../../types/note";
import css from "./NoteList.module.css";

interface NoteListProps {
  notes: Note[];
  deletingNoteId: Note["id"] | null;
  onDelete: (noteId: Note["id"]) => void;
}

const NoteList = ({ notes, deletingNoteId, onDelete }: NoteListProps) => {
  const handleDeleteClick =
    (noteId: Note["id"]) =>
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      onDelete(noteId);
    };

  return (
    <ul className={css.list}>
      {notes.map((note) => (
        <li key={note.id} className={css.listItem}>
          <h2 className={css.title}>{note.title}</h2>
          <p className={css.content}>{note.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{note.tag}</span>
            <button
              type="button"
              className={css.button}
              disabled={deletingNoteId === note.id}
              onClick={handleDeleteClick(note.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default NoteList;
