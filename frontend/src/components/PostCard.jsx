import { memo } from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import CoverImage from "./CoverImage";
import { formatDate } from "../utils/format";

function PostCard({ post, featured = false }) {
  const href = `/post/${post._id}`;
  const authorName = post.author?.username || "Deleted user";

  return (
    <article className={`post-card${featured ? " featured" : ""}`}>
      <Link to={href} className="post-card-media" tabIndex={-1} aria-hidden="true">
        <CoverImage src={post.image} title={post.title} />
      </Link>
      <div className="post-card-body">
        <h3 className="post-card-title">
          <Link to={href}>{post.title}</Link>
        </h3>
        <p className="post-card-excerpt">{post.excerpt}</p>
        <div className="byline">
          <Avatar user={post.author} size={28} />
          <span className="byline-name">{authorName}</span>
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        </div>
        <Link to={href} className="read-link">
          Read post
        </Link>
      </div>
    </article>
  );
}

export default memo(PostCard);
