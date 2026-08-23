import { Wand2 } from "lucide-react";
import "./ImprovementPanel.css";

export default function ImprovementPanel({ suggestions }) {
  if (!suggestions?.length) return null;

  return (
    <section className="panel improvement-panel" aria-labelledby="improvement-heading">
      <h3 id="improvement-heading" className="panel__title">
        <Wand2 size={16} aria-hidden="true" />
        Document Improvement Suggestions
      </h3>
      <p className="improvement-panel__disclaimer">AI-generated suggestions</p>
      <ul className="improvement-panel__list">
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </section>
  );
}
