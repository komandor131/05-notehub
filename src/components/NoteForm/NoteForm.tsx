import type { MouseEvent } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import type { FormikHelpers } from "formik";
import * as Yup from "yup";

import type { CreateNoteData } from "../../services/noteService";
import { NOTE_TAGS } from "../../types/note";
import type { NoteTag } from "../../types/note";
import css from "./NoteForm.module.css";

interface NoteFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateNoteData) => Promise<void>;
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

const NoteForm = ({ isSubmitting, onCancel, onSubmit }: NoteFormProps) => {
  const handleSubmit = async (
    values: CreateNoteData,
    actions: FormikHelpers<CreateNoteData>,
  ): Promise<void> => {
    try {
      await onSubmit(values);
      actions.resetForm();
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    onCancel();
  };

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
              disabled={isSubmitting || isFormikSubmitting}
            >
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default NoteForm;
