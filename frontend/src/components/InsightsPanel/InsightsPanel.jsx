import { Target, Lightbulb, CheckCircle2, AlertTriangle } from "lucide-react";
import "./InsightsPanel.css";

const INSIGHT_CARDS = [
  { key: "main_objective", label: "Main objective", icon: Target },
  { key: "major_finding", label: "Major finding", icon: Lightbulb },
  { key: "important_conclusion", label: "Important conclusion", icon: CheckCircle2 },
  { key: "important_consideration", label: "Important consideration", icon: AlertTriangle },
];

export default function InsightsPanel({ keyInsights, keyPoints }) {
  return (
    <section className="panel insights-panel" aria-labelledby="insights-heading">
      <h3 id="insights-heading" className="panel__title">
        Key Insights
      </h3>

      <div className="insights-panel__grid">
        {INSIGHT_CARDS.map(({ key, label, icon: Icon }) => (
          <div className="insight-card" key={key}>
            <div className="insight-card__icon" aria-hidden="true">
              <Icon size={16} />
            </div>
            <div>
              <p className="insight-card__label">{label}</p>
              <p className="insight-card__text">{keyInsights[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {keyPoints?.length > 0 && (
        <div className="insights-panel__points">
          <p className="panel__eyebrow">Key points</p>
          <ul className="insights-panel__list">
            {keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
