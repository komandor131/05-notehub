import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MouseEvent } from "react";

import { deleteNote } from "../../services/noteService";
import type { Note } from "../../types/note";
import css from "./NoteList.module.css";

interface NoteListProps {
  notes: Note[];
}

const NoteList = ({ notes }: NoteListProps) => {
  const queryClient = useQueryClient();

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleDeleteClick =
    (noteId: Note["id"]) =>
    (event: MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      deleteNoteMutation.mutate(noteId);
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
              disabled={
                deleteNoteMutation.isPending &&
                deleteNoteMutation.variables === note.id
              }
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
