import { useCallback, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { MAX_FILE_SIZE_MB } from "../../utils/fileValidation";
import "./UploadZone.css";

export default function UploadZone({ onFileSelected, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);

      const droppedFile = event.dataTransfer.files?.[0];

      if (droppedFile) {
        onFileSelected(droppedFile);
      }
    },
    [onFileSelected]
  );

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePick = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      onFileSelected(selectedFile);
    }

    // Allows the same file to be selected again.
    event.target.value = "";
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  return (
    <div className="upload-zone-wrap">
      <div
        className={`upload-zone ${
          isDragging ? "upload-zone--active" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Upload a document by dragging it here or browsing files"
      >
        <span
          className="upload-zone__corner upload-zone__corner--tl"
          aria-hidden="true"
        />

        <span
          className="upload-zone__corner upload-zone__corner--tr"
          aria-hidden="true"
        />

        <span
          className="upload-zone__corner upload-zone__corner--bl"
          aria-hidden="true"
        />

        <span
          className="upload-zone__corner upload-zone__corner--br"
          aria-hidden="true"
        />

        <UploadCloud
          className="upload-zone__icon"
          size={46}
          strokeWidth={1.6}
          aria-hidden="true"
        />

        <p className="upload-zone__title">
          Drop your document here
        </p>

        <p className="upload-zone__subtitle">
          or click to browse your files
        </p>

        <p className="upload-zone__hint">
          PDF &bull; PNG &bull; JPG &bull; JPEG
          &nbsp;&middot;&nbsp;
          up to {MAX_FILE_SIZE_MB}MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          onChange={handlePick}
          className="visually-hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {error && (
        <p
          className="upload-zone__error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}