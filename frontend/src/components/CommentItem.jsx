import { memo, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import Avatar from "./Avatar";
import { formatDate } from "../utils/format";

function CommentItem({ comment, canDelete, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      await onDelete(comment._id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <li className="comment">
      <Avatar user={comment.author} size={36} />
      <div className="comment-body">
        <div className="comment-meta">
          <strong>{comment.author?.username || "Deleted user"}</strong>
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
        </div>
        <p className="comment-text">{comment.content}</p>
      </div>
      {canDelete && (
        <button
          type="button"
          className="icon-btn danger"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete comment"
        >
          <FiTrash2 size={16} />
        </button>
      )}
    </li>
  );
}

export default memo(CommentItem);
