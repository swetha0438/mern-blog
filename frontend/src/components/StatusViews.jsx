import { Link } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";

export function Loader({ label = "Loading..." }) {
  return (
    <div className="status-view" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong. Please try again.", onRetry }) {
  return (
    <div className="status-view error" role="alert">
      <FiAlertCircle size={28} aria-hidden="true" />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="status-view empty">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      {actionLabel && (
        <Link to={actionTo} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
