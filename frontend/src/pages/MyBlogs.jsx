import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiExternalLink } from "react-icons/fi";
import CoverImage from "../components/CoverImage";
import { Loader, ErrorState, EmptyState } from "../components/StatusViews";
import { getMyPosts, deletePost } from "../services/blogService";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/format";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function MyBlogs() {
  useDocumentTitle("My blogs");
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    getMyPosts({ limit: 50 })
      .then((res) => {
        if (!active) return;
        setPosts(res.posts);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(getErrorMessage(err));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete “${post.title}” and its comments? This can't be undone.`)) return;
    setDeletingId(post._id);
    setActionError("");
    try {
      await deletePost(post._id);
      setPosts((list) => list.filter((p) => p._id !== post._id));
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container section">
      <div className="section-head">
        <h1 className="page-title">My blogs</h1>
        <Link to="/create-post" className="btn btn-primary">New post</Link>
      </div>

      {actionError && <div className="form-alert" role="alert">{actionError}</div>}
      {status === "loading" && <Loader label="Loading your posts..." />}
      {status === "error" && <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />}
      {status === "ready" && posts.length === 0 && (
        <EmptyState title="No posts found." message="Posts you publish will show up here." actionLabel="Write a post" actionTo="/create-post" />
      )}
      {status === "ready" && posts.length > 0 && (
        <ul className="blog-rows">
          {posts.map((post) => (
            <li key={post._id} className="blog-row">
              <CoverImage src={post.image} title={post.title} className="blog-row-thumb" />
              <div className="blog-row-main">
                <h2><Link to={`/post/${post._id}`}>{post.title}</Link></h2>
                <p className="muted">Published {formatDate(post.createdAt)}</p>
              </div>
              <div className="blog-row-actions">
                <Link to={`/post/${post._id}`} className="btn btn-secondary"><FiExternalLink aria-hidden="true" /> Open</Link>
                <Link to={`/edit-post/${post._id}`} className="btn btn-secondary"><FiEdit2 aria-hidden="true" /> Edit</Link>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(post)} disabled={deletingId === post._id}>
                  <FiTrash2 aria-hidden="true" /> {deletingId === post._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
