import { useState } from "react";
import { Send, MessageCircleQuestion } from "lucide-react";
import { askDocument, ApiError } from "../../services/api";
import "./AskDocument.css";

const EXAMPLE_QUESTIONS = [
  "What is the main conclusion?",
  "What are the important findings?",
  "What risks are mentioned?",
];

export default function AskDocument({ documentId }) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]); // { question, answer, error }
  const [isAsking, setIsAsking] = useState(false);

  const submitQuestion = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isAsking) return;

    setIsAsking(true);
    setQuestion("");

    try {
      const response = await askDocument(documentId, trimmed);
      setHistory((prev) => [...prev, { question: trimmed, answer: response.answer }]);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setHistory((prev) => [...prev, { question: trimmed, error: message }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitQuestion(question);
  };

  return (
    <section className="panel ask-panel" aria-labelledby="ask-heading">
      <h3 id="ask-heading" className="panel__title">
        <MessageCircleQuestion size={17} aria-hidden="true" />
        Ask Your Document
      </h3>

      {history.length === 0 && (
        <div className="ask-panel__examples">
          {EXAMPLE_QUESTIONS.map((example) => (
            <button
              key={example}
              className="ask-panel__example-chip"
              onClick={() => submitQuestion(example)}
              disabled={isAsking}
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="ask-panel__history">
          {history.map((entry, index) => (
            <div className="ask-exchange" key={index}>
              <p className="ask-exchange__question">{entry.question}</p>
              <p className={`ask-exchange__answer ${entry.error ? "ask-exchange__answer--error" : ""}`}>
                {entry.error || entry.answer}
              </p>
            </div>
          ))}
        </div>
      )}

      <form className="ask-panel__form" onSubmit={handleSubmit}>
        <label htmlFor="ask-input" className="visually-hidden">
          Ask a question about this document
        </label>
        <input
          id="ask-input"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask anything about this document..."
          disabled={isAsking}
          className="ask-panel__input"
        />
        <button
          type="submit"
          className="ask-panel__submit"
          disabled={isAsking || !question.trim()}
          aria-label="Send question"
        >
          <Send size={16} />
        </button>
      </form>
      {isAsking && <p className="ask-panel__status">Thinking...</p>}
    </section>
  );
}
