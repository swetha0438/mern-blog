import { EmptyState } from "../components/StatusViews";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <div className="container">
      <EmptyState title="Page not found." message="The page you're looking for doesn't exist or has moved." actionLabel="Back to home" actionTo="/" />
    </div>
  );
}
