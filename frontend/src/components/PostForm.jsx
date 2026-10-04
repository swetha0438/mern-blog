import { useEffect, useRef, useState } from "react";
import { FiImage, FiX } from "react-icons/fi";
import Field from "./Field";
import { getErrorMessage, getFieldErrors } from "../utils/errors";
import { validatePost, validateImageFile } from "../utils/validators";
import { imageUrl } from "../utils/format";

// Shared by Create Post and Edit Post. `onSubmit(formData, onProgress)` must return a promise.
export default function PostForm({ initial, submitLabel, busyLabel, onSubmit }) {
  const [values, setValues] = useState({
    title: initial?.title || "",
    excerpt: initial?.excerpt || "",
    content: initial?.content || "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const fileInput = useRef(null);

  // release the temporary preview URL when it changes or the form closes
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const setField = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const handleFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const problem = validateImageFile(picked);
    if (problem) {
      setErrors((prev) => ({ ...prev, image: problem }));
      e.target.value = "";
      return;
    }
    setErrors((prev) => ({ ...prev, image: "" }));
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setRemoveImage(false);
  };

  const clearImage = () => {
    setFile(null);
    setPreview("");
    if (fileInput.current) fileInput.current.value = "";
    if (initial?.image) setRemoveImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy.current) return;

    const found = validatePost(values);
    if (Object.keys(found).length) {
      setErrors(found);
      setFormError("Please fix the highlighted fields.");
      return;
    }

    const data = new FormData();
    data.append("title", values.title.trim());
    data.append("excerpt", values.excerpt.trim());
    data.append("content", values.content.trim());
    if (file) data.append("image", file);
    else if (removeImage) data.append("removeImage", "true");

    busy.current = true;
    setSubmitting(true);
    setErrors({});
    setFormError("");
    setProgress(0);
    try {
      await onSubmit(data, setProgress);
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
      busy.current = false;
      setSubmitting(false);
    }
    // on success the page navigates away, so the form is left disabled
  };

  const shownImage = preview || (!removeImage && initial?.image ? imageUrl(initial.image) : "");

  return (
    <form className="form post-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="form-alert" role="alert">
          {formError}
        </div>
      )}

      <Field id="title" label="Title" error={errors.title}>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={setField("title")}
          maxLength={150}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          disabled={submitting}
        />
      </Field>

      <Field
        id="excerpt"
        label="Excerpt"
        error={errors.excerpt}
        hint="A short summary shown on post cards. Leave blank to use the start of your post."
      >
        <textarea
          id="excerpt"
          rows={2}
          value={values.excerpt}
          onChange={setField("excerpt")}
          maxLength={300}
          aria-invalid={Boolean(errors.excerpt)}
          aria-describedby={errors.excerpt ? "excerpt-error" : undefined}
          disabled={submitting}
        />
      </Field>

      <Field id="content" label="Content" error={errors.content} hint="Separate paragraphs with a blank line.">
        <textarea
          id="content"
          rows={14}
          value={values.content}
          onChange={setField("content")}
          aria-invalid={Boolean(errors.content)}
          aria-describedby={errors.content ? "content-error" : undefined}
          disabled={submitting}
        />
      </Field>

      <Field id="image" label="Cover image" error={errors.image} hint="JPG, PNG, WebP or GIF, up to 5 MB.">
        {shownImage ? (
          <div className="image-preview">
            <img src={shownImage} alt="Selected cover preview" />
            <button type="button" className="btn btn-secondary" onClick={clearImage} disabled={submitting}>
              <FiX aria-hidden="true" /> Remove image
            </button>
          </div>
        ) : (
          <label className="dropzone" htmlFor="image">
            <FiImage size={22} aria-hidden="true" />
            <span>Choose a cover image</span>
          </label>
        )}
        <input
          ref={fileInput}
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="file-input"
          onChange={handleFile}
          disabled={submitting}
        />
      </Field>

      {submitting && file && (
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span>Uploading {progress}%</span>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? busyLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
