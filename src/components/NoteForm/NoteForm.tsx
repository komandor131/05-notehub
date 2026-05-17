import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MouseEvent } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";

import { createNote } from "../../services/noteService";
import type { CreateNoteData } from "../../services/noteService";
import { NOTE_TAGS } from "../../types/note";
import type { NoteTag } from "../../types/note";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  onClose: () => void;
}

const initialValues: CreateNoteData = {
  title: "",
  content: "",
  tag: "Todo",
};

const noteSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters")
    .required("Title is required"),
  content: Yup.string().max(500, "Content must be at most 500 characters"),
  tag: Yup.mixed<NoteTag>()
    .oneOf([...NOTE_TAGS], "Choose a valid tag")
    .required("Tag is required"),
});

const NoteForm = ({ onClose }: NoteFormProps) => {
  const queryClient = useQueryClient();

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      onClose();
    },
  });

  const handleSubmit = async (
    values: CreateNoteData,
    actions: FormikHelpers<CreateNoteData>,
  ): Promise<void> => {
    try {
      await createNoteMutation.mutateAsync(values);
      actions.resetForm();
    } catch {
      // Mutation state keeps the error message for rendering below the form.
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    onClose();
  };

  const mutationError =
    createNoteMutation.error instanceof Error
      ? createNoteMutation.error.message
      : null;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={noteSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting: isFormikSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" type="text" name="title" className={css.input} />
            <ErrorMessage name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              as="textarea"
              id="content"
              name="content"
              rows={8}
              className={css.textarea}
            />
            <ErrorMessage
              name="content"
              component="span"
              className={css.error}
            />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={css.select}>
              {NOTE_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Field>
            <ErrorMessage name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={handleCancelClick}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={createNoteMutation.isPending || isFormikSubmitting}
            >
              Create note
            </button>
          </div>

          {mutationError && <span className={css.error}>{mutationError}</span>}
        </Form>
      )}
    </Formik>
  );
};

export default NoteForm;
