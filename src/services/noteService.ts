import axios from "axios";
import type { AxiosResponse } from "axios";

import type { Note } from "../types/note";
import type { NoteTag } from "../types/note";

const notehubApi = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
});

const getAuthorizationHeader = (): { Authorization: string } => {
  const token = import.meta.env.VITE_NOTEHUB_TOKEN;

  if (!token) {
    throw new Error("VITE_NOTEHUB_TOKEN is not configured");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export interface FetchNotesParams {
  page: number;
  perPage: number;
  search?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tag: NoteTag;
}

export const fetchNotes = async ({
  page,
  perPage,
  search,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const response: AxiosResponse<FetchNotesResponse> = await notehubApi.get(
    "/notes",
    {
      headers: getAuthorizationHeader(),
      params: {
        page,
        perPage,
        ...(search ? { search } : {}),
      },
    },
  );

  return response.data;
};

export const createNote = async (note: CreateNoteData): Promise<Note> => {
  const response: AxiosResponse<Note> = await notehubApi.post("/notes", note, {
    headers: getAuthorizationHeader(),
  });

  return response.data;
};

export const deleteNote = async (noteId: Note["id"]): Promise<Note> => {
  const response: AxiosResponse<Note> = await notehubApi.delete(
    `/notes/${noteId}`,
    {
      headers: getAuthorizationHeader(),
    },
  );

  return response.data;
};
