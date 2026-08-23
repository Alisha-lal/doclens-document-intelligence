import "./Header.css";

function LensMark() {
  return (
    <svg
      className="lens-mark"
      width="34"
      height="34"
      viewBox="0 0 34 34"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="20"
        height="24"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <circle
        cx="14"
        cy="14"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      <line
        x1="18"
        y1="18"
        x2="25"
        y2="25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header({ onReset, showReset }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          className="app-header__brand"
          onClick={onReset}
          aria-label="DocLens home"
        >
          <LensMark />

          <span className="app-header__name">DocLens</span>

          <span className="app-header__tagline">
            Document Summary Assistant
          </span>
        </button>

        {showReset && (
          <button className="app-header__action" onClick={onReset}>
            Analyze another document
          </button>
        )}
      </div>
    </header>
  );
}