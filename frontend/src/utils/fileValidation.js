// Mirrors backend validation so users get instant feedback before upload.
// The backend re-validates independently — this is a UX convenience, not a
// security boundary.

export const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 15;

export function validateFile(file) {
  if (!file) {
    return "No file selected.";
  }

  const extension = "." + file.name.split(".").pop().toLowerCase();
  const validType =
    ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);

  if (!validType) {
    return "Unsupported file type. Please upload a PDF, PNG, or JPG/JPEG file.";
  }

  if (file.size <= 0) {
    return "This file appears to be empty.";
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`;
  }

  return null;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileTypeLabel(file) {
  if (file.type === "application/pdf") return "PDF";
  if (file.type === "image/png") return "PNG";
  if (file.type === "image/jpeg") return "JPEG";
  const extension = file.name.split(".").pop().toUpperCase();
  return extension;
}

export { MAX_FILE_SIZE_MB };
