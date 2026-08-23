import { useState } from "react";
import "./SummaryPanel.css";

const LENGTHS = [
  {
    key: "short",
    label: "Short",
    field: "short_summary",
  },
  {
    key: "medium",
    label: "Medium",
    field: "medium_summary",
  },
  {
    key: "long",
    label: "Long",
    field: "long_summary",
  },
];

export default function SummaryPanel({ analysis }) {
  const [active, setActive] = useState("medium");

  const activeLength =
    LENGTHS.find((length) => length.key === active) || LENGTHS[1];

  return (
    <section
      className="summary-panel"
      aria-labelledby="summary-heading"
    >
      <div className="summary-panel__header">
        <div>
          <p className="summary-panel__eyebrow">
            Document overview
          </p>

          <h2
            id="summary-heading"
            className="summary-panel__title"
          >
            Summary
          </h2>
        </div>

        <div
          className="summary-panel__tabs"
          role="tablist"
          aria-label="Summary length"
        >
          {LENGTHS.map((length) => (
            <button
              key={length.key}
              type="button"
              role="tab"
              aria-selected={active === length.key}
              className={`summary-panel__tab ${
                active === length.key
                  ? "summary-panel__tab--active"
                  : ""
              }`}
              onClick={() => setActive(length.key)}
            >
              {length.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="summary-panel__content"
        role="tabpanel"
      >
        <p className="summary-panel__text">
          {analysis?.[activeLength.field] ||
            "No summary is available for this length."}
        </p>
      </div>
    </section>
  );
}