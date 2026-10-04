const AppError = require("../utils/AppError");
const { removeFile } = require("../utils/files");

const notFound = (req, res, next) =>
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // do not keep an orphaned upload when the request failed
  if (req.file) removeFile(req.file.path);

  let status = err.statusCode || 500;
  let message = err.message;
  let errors = err.fieldErrors || undefined;

  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Please fix the highlighted fields.";
    errors = {};
    for (const [field, detail] of Object.entries(err.errors)) errors[field] = detail.message;
  } else if (err.name === "CastError") {
    status = 404;
    message = "Resource not found.";
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "value";
    message = `That ${field} is already in use.`;
    errors = { [field]: message };
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller." : "Image upload failed.";
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Malformed request body.";
  }

  if (status >= 500) {
    console.error(err);
    message = "Something went wrong on our side. Please try again.";
  }

  res.status(status).json({ success: false, message, ...(errors && { errors }) });
};

module.exports = { notFound, errorHandler };
