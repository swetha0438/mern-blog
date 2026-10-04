const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateLogin({ email, password }) {
  const errors = {};
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

export function validateRegister({ username, email, password, confirmPassword }) {
  const errors = {};
  if (!USERNAME_RE.test(username.trim())) {
    errors.username = "Use 3–30 characters: letters, numbers or underscores.";
  }
  if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function validatePost({ title, excerpt, content }) {
  const errors = {};
  if (title.trim().length < 3) errors.title = "Title must be at least 3 characters.";
  else if (title.trim().length > 150) errors.title = "Title must be 150 characters or fewer.";
  if (excerpt.trim().length > 300) errors.excerpt = "Excerpt must be 300 characters or fewer.";
  if (!content.trim()) errors.content = "Content cannot be empty.";
  else if (content.trim().length < 10) errors.content = "Content must be at least 10 characters.";
  return errors;
}

export function validateImageFile(file) {
  if (!IMAGE_TYPES.includes(file.type)) return "Choose a JPG, PNG, WebP or GIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller.";
  return "";
}
