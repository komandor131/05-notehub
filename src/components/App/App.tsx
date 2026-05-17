import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import type { MouseEvent } from "react";
import { useDebouncedCallback } from "use-debounce";

import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import NoteList from "../NoteList/NoteList";
import Pagination from "../Pagination/Pagination";
import SearchBox from "../SearchBox/SearchBox";
import { createNote, deleteNote, fetchNotes } from "../../services/noteService";
import type { CreateNoteData } from "../../services/noteService";
import type { Note } from "../../types/note";
import css from "./App.module.css";

const NOTES_PER_PAGE = 12;

const App = () => {
  const queryClient = useQueryClient();
  const hasToken = Boolean(import.meta.env.VITE_NOTEHUB_TOKEN);

  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebouncedCallback((value: string): void => {
    setPage(1);
    setSearchQuery(value.trim());
  }, 500);

  const notesQuery = useQuery({
    queryKey: ["notes", page, searchQuery],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: NOTES_PER_PAGE,
        search: searchQuery,
      }),
    enabled: hasToken,
    placeholderData: keepPreviousData,
  });

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      setPage(1);
      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: async () => {
      if (notesQuery.data?.notes.length === 1 && page > 1) {
        setPage((currentPage) => Math.max(currentPage - 1, 1));
      }

      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const handleSearchChange = (value: string): void => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleOpenModal = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const handleCreateNote = async (values: CreateNoteData): Promise<void> => {
    await createNoteMutation.mutateAsync(values);
  };

  const handleDeleteNote = (noteId: Note["id"]): void => {
    deleteNoteMutation.mutate(noteId);
  };

  const notes = notesQuery.data?.notes ?? [];
  const totalPages = notesQuery.data?.totalPages ?? 0;
  const queryError =
    notesQuery.error instanceof Error
      ? notesQuery.error.message
      : "Failed to load notes";
  const mutationError =
    createNoteMutation.error instanceof Error
      ? createNoteMutation.error.message
      : deleteNoteMutation.error instanceof Error
        ? deleteNoteMutation.error.message
        : null;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchValue} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            pageCount={totalPages}
            onPageChange={setPage}
          />
        )}
        <button type="button" className={css.button} onClick={handleOpenModal}>
          Create note +
        </button>
      </header>

      {!hasToken && (
        <p className={css.status}>
          Add VITE_NOTEHUB_TOKEN to your environment to load notes.
        </p>
      )}
      {hasToken && notesQuery.isLoading && (
        <p className={css.status}>Loading notes...</p>
      )}
      {hasToken && notesQuery.isError && (
        <p className={css.error}>Error: {queryError}</p>
      )}
      {mutationError && <p className={css.error}>Error: {mutationError}</p>}
      {notesQuery.isFetching && !notesQuery.isLoading && (
        <p className={css.status}>Updating notes...</p>
      )}
      {notes.length > 0 && (
        <NoteList
          notes={notes}
          deletingNoteId={
            deleteNoteMutation.isPending
              ? (deleteNoteMutation.variables ?? null)
              : null
          }
          onDelete={handleDeleteNote}
        />
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <NoteForm
            isSubmitting={createNoteMutation.isPending}
            onCancel={handleCloseModal}
            onSubmit={handleCreateNote}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;
