import { FileText, Image as ImageIcon, X } from "lucide-react";
import { fileTypeLabel, formatFileSize } from "../../utils/fileValidation";
import "./FileCard.css";

export default function FileCard({ file, onRemove, onConfirm, disabled }) {
  const isPdf = file.type === "application/pdf";

  return (
    <div className="file-card">
      <div className="file-card__icon" aria-hidden="true">
        {isPdf ? <FileText size={22} /> : <ImageIcon size={22} />}
      </div>

      <div className="file-card__info">
        <p className="file-card__name" title={file.name}>
          {file.name}
        </p>
        <p className="file-card__meta mono">
          {fileTypeLabel(file)} &middot; {formatFileSize(file.size)}
        </p>
      </div>

      <button
        className="file-card__remove"
        onClick={onRemove}
        aria-label="Remove selected file"
        disabled={disabled}
      >
        <X size={18} />
      </button>

      <button className="file-card__confirm" onClick={onConfirm} disabled={disabled}>
        Analyze document
      </button>
    </div>
  );
}
