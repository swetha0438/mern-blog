import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostForm from "../components/PostForm";
import { Loader, ErrorState } from "../components/StatusViews";
import { useAuth } from "../context/AuthContext";
import { getPost, updatePost } from "../services/blogService";
import { getErrorMessage } from "../utils/errors";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function EditPost() {
  useDocumentTitle("Edit post");
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPost(id)
      .then((res) => {
        if (!active) return;
        if (res.post.author?._id !== user._id) {
          setError("You can only edit your own posts.");
          setStatus("error");
          return;
        }
        setPost(res.post);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.status === 404 ? "This post doesn't exist." : getErrorMessage(err));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [id, user._id]);

  const handleSubmit = async (formData, onProgress) => {
    await updatePost(id, formData, onProgress);
    navigate(`/post/${id}`);
  };

  if (status === "loading") return <Loader label="Loading post..." />;
  if (status === "error") return <ErrorState message={error} />;

  return (
    <div className="container narrow-wide">
      <h1 className="page-title">Edit post</h1>
      <PostForm initial={post} submitLabel="Save changes" busyLabel="Saving..." onSubmit={handleSubmit} />
    </div>
  );
}
