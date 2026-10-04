import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import Field from "../components/Field";
import { Loader, ErrorState, EmptyState } from "../components/StatusViews";
import { useAuth } from "../context/AuthContext";
import { getMyPosts } from "../services/blogService";
import { updateProfile } from "../services/authService";
import { getErrorMessage, getFieldErrors } from "../utils/errors";
import { validateImageFile } from "../utils/validators";
import { formatDate } from "../utils/format";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Profile() {
  useDocumentTitle("Profile");
  const { user, setUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || "");
  const [file, setFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
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
  }, []);

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const problem = validateImageFile(picked);
    if (problem) {
      setFormError(problem);
      e.target.value = "";
      return;
    }
    setFormError("");
    setFile(picked);
  };

  const save = async (e) => {
    e.preventDefault();
    if (busy.current) return;
    if (bio.trim().length > 300) return setFormError("Bio must be 300 characters or fewer.");

    const data = new FormData();
    data.append("bio", bio.trim());
    if (file) data.append("image", file);

    busy.current = true;
    setSaving(true);
    setFormError("");
    try {
      const updated = await updateProfile(data);
      setUser(updated);
      setFile(null);
      setEditing(false);
    } catch (err) {
      setFormError(getFieldErrors(err).bio || getErrorMessage(err));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="container section">
      <section className="profile-head">
        <Avatar user={user} size={96} />
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p className="muted">{user.email} · Joined {formatDate(user.createdAt)}</p>
          {!editing && <p className="profile-bio">{user.bio || "No bio yet."}</p>}
          {!editing && (
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          )}
        </div>
      </section>

      {editing && (
        <form className="form profile-form" onSubmit={save} noValidate>
          {formError && <div className="form-alert" role="alert">{formError}</div>}
          <Field id="bio" label="Bio" hint={`${bio.length}/300`}>
            <textarea id="bio" rows={3} maxLength={300} value={bio} onChange={(e) => setBio(e.target.value)} disabled={saving} />
          </Field>
          <Field id="avatar" label="Profile image" hint="JPG, PNG, WebP or GIF, up to 5 MB.">
            <input id="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={pickFile} disabled={saving} />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setFile(null); setFormError(""); setBio(user.bio || ""); }} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      )}

      <div className="section-head">
        <h2>Posts by {user.username}</h2>
        <Link to="/my-blogs" className="read-link">Manage posts</Link>
      </div>
      {status === "loading" && <Loader label="Loading your posts..." />}
      {status === "error" && <ErrorState message={error} />}
      {status === "ready" && posts.length === 0 && (
        <EmptyState title="You haven't published anything yet." actionLabel="Write your first post" actionTo="/create-post" />
      )}
      {status === "ready" && posts.length > 0 && (
        <div className="post-grid">
          {posts.map((p) => <PostCard key={p._id} post={p} />)}
        </div>
      )}
    </div>
  );
}
