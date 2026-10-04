export const API_ORIGIN = import.meta.env.VITE_API_URL || "";

export const imageUrl = (path) => {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${API_ORIGIN}${path}`;
};

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export const readingTime = (text = "") => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};
