import { Check } from "lucide-react";
import "./ProcessingSteps.css";

export default function ProcessingSteps({ stages, currentIndex }) {
  return (
    <ol
      className="processing-steps"
      aria-label="Document processing progress"
    >
      {stages.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        const state = isDone
          ? "done"
          : isCurrent
          ? "current"
          : "pending";

        return (
          <li
            key={stage.key}
            className={`processing-step processing-step--${state}`}
          >
            <div className="processing-step__content">

              <span
                className="processing-step__marker"
                aria-hidden="true"
              >
                {isDone ? (
                  <Check
                    size={15}
                    strokeWidth={3}
                  />
                ) : (
                  <span className="processing-step__dot" />
                )}
              </span>

              <span className="processing-step__label">
                {stage.label}
              </span>

              {isCurrent && (
                <span className="processing-step__status">
                  Processing
                </span>
              )}

              {isDone && (
                <span className="processing-step__status">
                  Processed
                </span>
              )}

            </div>

            <div
              className="processing-step__track"
              aria-hidden="true"
            >
              <div className="processing-step__fill" />
            </div>

          </li>
        );
      })}
    </ol>
  );
}