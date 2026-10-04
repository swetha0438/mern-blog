import { useEffect, useState } from "react";
import { imageUrl } from "../utils/format";

// Shows the cover image, or a typographic placeholder when it is missing or fails to load.
export default function CoverImage({ src, title = "", className = "" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={`cover cover-fallback ${className}`} aria-hidden="true">
        <span>{title.trim().charAt(0).toUpperCase() || "F"}</span>
      </div>
    );
  }
  return (
    <img
      className={`cover ${className}`}
      src={imageUrl(src)}
      alt={title ? `Cover image for ${title}` : ""}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
