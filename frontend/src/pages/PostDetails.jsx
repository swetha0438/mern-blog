import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Avatar from "../components/Avatar";
import CoverImage from "../components/CoverImage";
import CommentForm from "../components/CommentForm";
import CommentItem from "../components/CommentItem";
import { Loader, ErrorState } from "../components/StatusViews";
import { useAuth } from "../context/AuthContext";
import { getPost, deletePost, deleteComment } from "../services/blogService";
import { getErrorMessage } from "../utils/errors";
import { formatDate, readingTime } from "../utils/format";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  useDocumentTitle(post?.title);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    getPost(id)
      .then((res) => {
        if (!active) return;
        setPost(res.post);
        setComments(res.comments);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.status === 404 ? "This post doesn't exist or was deleted." : getErrorMessage(err));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post and all its comments? This can't be undone.")) return;
    setDeleting(true);
    setActionError("");
    try {
      await deletePost(post._id);
      navigate("/my-blogs", { replace: true });
    } catch (err) {
      setActionError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((list) => list.filter((c) => c._id !== commentId));
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  }, []);

  const handleAdded = useCallback((comment) => setComments((list) => [comment, ...list]), []);

  if (status === "loading") return <Loader label="Loading post..." />;
  if (status === "error") return <ErrorState message={error} />;

  const isOwner = user && post.author && user._id === post.author._id;
  const paragraphs = post.content.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <article className="container article">
      <header className="article-head">
        <h1>{post.title}</h1>
        {post.excerpt && <p className="article-dek">{post.excerpt}</p>}
        <div className="byline byline-lg">
          <Avatar user={post.author} size={40} />
          <div>
            <strong>{post.author?.username || "Deleted user"}</strong>
            <div className="muted">
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              {" · "}
              {readingTime(post.content)} min read
            </div>
          </div>
          {isOwner && (
            <div className="owner-actions">
              <Link to={`/edit-post/${post._id}`} className="btn btn-secondary">
                <FiEdit2 aria-hidden="true" /> Edit
              </Link>
              <button type="button" className="btn btn-danger" onClick={handleDeletePost} disabled={deleting}>
                <FiTrash2 aria-hidden="true" /> {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </header>

      {post.image && <CoverImage src={post.image} title={post.title} className="article-cover" />}

      {actionError && <div className="form-alert" role="alert">{actionError}</div>}

      <div className="prose">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <section className="comments" aria-labelledby="comments-title">
        <h2 id="comments-title">Comments ({comments.length})</h2>
        {isAuthenticated ? (
          <CommentForm postId={post._id} onAdded={handleAdded} />
        ) : (
          <p className="muted">
            <Link to="/login" state={{ from: { pathname: `/post/${post._id}` } }}>Log in</Link> to join the discussion.
          </p>
        )}
        {comments.length === 0 ? (
          <p className="muted">No comments yet.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                canDelete={Boolean(user && c.author && c.author._id === user._id)}
                onDelete={handleDeleteComment}
              />
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
