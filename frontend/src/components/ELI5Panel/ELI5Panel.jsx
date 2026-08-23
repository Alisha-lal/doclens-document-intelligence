import { useState } from "react";
import { Sparkles } from "lucide-react";
import { explainSimply, ApiError } from "../../services/api";
import "./ELI5Panel.css";

export default function ELI5Panel({ documentId }) {
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExplain = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await explainSimply(documentId);
      setExplanation(response.explanation);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="panel eli5-panel" aria-labelledby="eli5-heading">
      <h3 id="eli5-heading" className="panel__title">
        <Sparkles size={16} aria-hidden="true" />
        Explain Simply
      </h3>

      {!explanation && !isLoading && (
        <>
          <p className="eli5-panel__intro">
            Get a plain-language explanation of this document, without the jargon.
          </p>
          <button className="eli5-panel__button" onClick={handleExplain}>
            Explain simply
          </button>
        </>
      )}

      {isLoading && <p className="eli5-panel__status">Simplifying...</p>}

      {error && (
        <p className="eli5-panel__error" role="alert">
          {error}
        </p>
      )}

      {explanation && <p className="eli5-panel__text">{explanation}</p>}
    </section>
  );
}
