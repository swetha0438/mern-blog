class AppError extends Error {
  constructor(message, statusCode = 500, fieldErrors = null) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.isOperational = true;
  }
}

module.exports = AppError;
