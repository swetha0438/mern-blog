import { useRef, useState } from "react";
import { addComment } from "../services/blogService";
import { getErrorMessage, getFieldErrors } from "../utils/errors";

export default function CommentForm({ postId, onAdded }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy.current) return;

    if (!content.trim()) return setError("Comment cannot be empty.");
    if (content.trim().length > 1000) return setError("Comment must be 1,000 characters or fewer.");

    busy.current = true;
    setSubmitting(true);
    setError("");
    try {
      const comment = await addComment(postId, content.trim());
      onAdded(comment);
      setContent("");
    } catch (err) {
      setError(getFieldErrors(err).content || getErrorMessage(err));
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="comment-content" className="sr-only">
        Add a comment
      </label>
      <textarea
        id="comment-content"
        rows={3}
        maxLength={1000}
        placeholder="Add to the discussion"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "comment-error" : undefined}
      />
      {error && (
        <p className="field-error" id="comment-error" role="alert">
          {error}
        </p>
      )}
      <div className="comment-form-actions">
        <span className="field-hint">{content.length}/1000</span>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Posting..." : "Post comment"}
        </button>
      </div>
    </form>
  );
}
