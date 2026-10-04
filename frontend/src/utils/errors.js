const GENERIC = "Something went wrong. Please try again.";

// Show the server's message for expected 4xx problems, a generic one otherwise.
export function getErrorMessage(err) {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;
  if (status && status < 500 && message) return message;
  if (!err?.response) return "Can't reach the server. Check your connection and try again.";
  return GENERIC;
}

export const getFieldErrors = (err) => err?.response?.data?.errors || {};
