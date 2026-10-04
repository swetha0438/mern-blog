import { useNavigate } from "react-router-dom";
import PostForm from "../components/PostForm";
import { createPost } from "../services/blogService";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function CreatePost() {
  useDocumentTitle("New post");
  const navigate = useNavigate();

  const handleSubmit = async (formData, onProgress) => {
    const post = await createPost(formData, onProgress);
    navigate(`/post/${post._id}`);
  };

  return (
    <div className="container narrow-wide">
      <h1 className="page-title">New post</h1>
      <PostForm submitLabel="Publish post" busyLabel="Publishing..." onSubmit={handleSubmit} />
    </div>
  );
}
