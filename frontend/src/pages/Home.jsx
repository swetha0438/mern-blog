import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import { Loader, ErrorState, EmptyState } from "../components/StatusViews";
import { getPosts } from "../services/blogService";
import { getErrorMessage } from "../utils/errors";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function Home() {
  useDocumentTitle("");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const page = Math.max(parseInt(params.get("page"), 10) || 1, 1);

  const [term, setTerm] = useState(q);
  const [data, setData] = useState({ posts: [], pages: 1, total: 0 });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setTerm(q), [q]);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    getPosts({ q: q || undefined, page, limit: 9 })
      .then((res) => {
        if (!active) return;
        setData(res);
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
  }, [q, page, attempt]);

  const search = useCallback(
    (e) => {
      e.preventDefault();
      const next = term.trim();
      setParams(next ? { q: next } : {});
    },
    [term, setParams]
  );

  const clear = () => {
    setTerm("");
    setParams({});
  };

  const goToPage = (n) => {
    const next = {};
    if (q) next.q = q;
    if (n > 1) next.page = String(n);
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Read what people are writing.</h1>
          <p className="hero-sub">Essays, notes and write-ups from the community. Start a post of your own whenever you like.</p>
          <form className="search" onSubmit={search} role="search">
            <FiSearch aria-hidden="true" className="search-icon" />
            <label htmlFor="search-input" className="sr-only">Search posts</label>
            <input
              id="search-input"
              type="search"
              placeholder="Search by title, content or author"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              maxLength={100}
            />
            {q && (
              <button type="button" className="icon-btn" onClick={clear} aria-label="Clear search">
                <FiX />
              </button>
            )}
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>{q ? `Results for “${q}”` : "Latest posts"}</h2>
          {status === "ready" && q && <span className="muted">{data.total} found</span>}
        </div>

        {status === "loading" && <Loader label="Loading posts..." />}
        {status === "error" && <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />}
        {status === "ready" && data.posts.length === 0 && (
          <EmptyState
            title="No posts found."
            message={q ? "Try a different word, or clear the search." : "Be the first to publish something."}
            actionLabel={q ? undefined : "Write a post"}
            actionTo="/create-post"
          />
        )}
        {status === "ready" && data.posts.length > 0 && (
          <>
            <div className="post-grid">
              {data.posts.map((post, i) => (
                <PostCard key={post._id} post={post} featured={i === 0 && page === 1 && !q} />
              ))}
            </div>
            <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
          </>
        )}
      </section>
    </>
  );
}
