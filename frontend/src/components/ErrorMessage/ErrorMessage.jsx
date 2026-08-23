import { AlertCircle, RotateCcw } from "lucide-react";
import "./ErrorMessage.css";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-message" role="alert">
      <div className="error-message__icon" aria-hidden="true">
        <AlertCircle size={22} />
      </div>
      <p className="error-message__text">{message}</p>
      {onRetry && (
        <button className="error-message__retry" onClick={onRetry}>
          <RotateCcw size={15} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
