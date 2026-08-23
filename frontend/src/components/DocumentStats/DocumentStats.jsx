import { FileText, Image as ImageIcon } from "lucide-react";
import "./DocumentStats.css";

const METHOD_LABELS = {
  pdf_text: "Native PDF text",
  ocr: "OCR",
  hybrid: "Hybrid text + OCR",
};

export default function DocumentStats({
  filename,
  fileType,
  stats,
}) {
  const Icon =
    fileType === "pdf" ? FileText : ImageIcon;

  return (
    <section
      className="doc-stats"
      aria-label="Document information"
    >
      <div className="doc-stats__identity">

        <div
          className="doc-stats__icon"
          aria-hidden="true"
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>

        <div className="doc-stats__name-wrap">

          <h1
            className="doc-stats__filename"
            title={filename}
          >
            {filename}
          </h1>

          <div className="doc-stats__meta">
            <span>
              {fileType?.toUpperCase()}
            </span>

            <span className="doc-stats__separator">
              •
            </span>

            <span>
              {METHOD_LABELS[stats.extraction_method] ||
                stats.extraction_method}
            </span>
          </div>

        </div>

      </div>

      <dl className="doc-stats__grid">

        <div className="doc-stats__cell">
          <dt>Pages</dt>
          <dd>{stats.page_count}</dd>
        </div>

        <div className="doc-stats__cell">
          <dt>Words</dt>
          <dd>
            {stats.word_count.toLocaleString()}
          </dd>
        </div>

        <div className="doc-stats__cell">
          <dt>Characters</dt>
          <dd>
            {stats.character_count.toLocaleString()}
          </dd>
        </div>

        <div className="doc-stats__cell">
          <dt>Reading time</dt>
          <dd>
            {stats.estimated_reading_minutes < 1
              ? "< 1 min"
              : `${stats.estimated_reading_minutes} min`}
          </dd>
        </div>

      </dl>
    </section>
  );
}