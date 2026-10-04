const mongoose = require("mongoose");
const AppError = require("./AppError");

const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (value) => (typeof value === "string" ? value.trim() : "");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function validateRegister({ username, email, password }) {
  const errors = {};
  if (!USERNAME_RE.test(username)) {
    errors.username = "Username must be 3–30 characters: letters, numbers or underscores.";
  }
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  else if (password.length > 72) errors.password = "Password must be 72 characters or fewer.";
  return errors;
}

function validatePost({ title, content, excerpt }) {
  const errors = {};
  if (title.length < 3) errors.title = "Title must be at least 3 characters.";
  else if (title.length > 150) errors.title = "Title must be 150 characters or fewer.";
  if (!content) errors.content = "Content cannot be empty.";
  else if (content.length < 10) errors.content = "Content must be at least 10 characters.";
  else if (content.length > 50000) errors.content = "Content must be 50,000 characters or fewer.";
  if (excerpt.length > 300) errors.excerpt = "Excerpt must be 300 characters or fewer.";
  return errors;
}

function throwIfInvalid(errors, message = "Please fix the highlighted fields.") {
  if (Object.keys(errors).length) throw new AppError(message, 400, errors);
}

function assertObjectId(id, label = "Resource") {
  if (!mongoose.isValidObjectId(id)) throw new AppError(`${label} not found.`, 404);
}

module.exports = {
  str,
  escapeRegex,
  validateRegister,
  validatePost,
  throwIfInvalid,
  assertObjectId,
  EMAIL_RE,
};
