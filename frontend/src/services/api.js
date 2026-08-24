/**
 * Centralized API client.
 * Every backend call goes through here so components never
 * construct fetch requests directly.
 */

// Render backend URL
const API_BASE_URL = "https://doclens-backend-721e.onrender.com";

const ANALYZE_POLL_INTERVAL_MS = 2000;
const ANALYZE_MAX_POLL_ATTEMPTS = 90; // 90 * 2s = 3 minutes max wait


class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function parseErrorMessage(response) {
  try {
    const body = await response.json();

    if (body?.detail) {
      return body.detail;
    }
  } catch {
    // Response wasn't JSON — use generic message below.
  }

  return "Something went wrong. Please try again.";
}


async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new ApiError(
      "Couldn't reach the DocLens server. Check your connection and try again.",
      0
    );
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);

    throw new ApiError(message, response.status);
  }

  return response.json();
}


/**
 * Analyze an uploaded document.
 *
 * The backend runs OCR + the AI call in the background to avoid long-held
 * requests that can exceed Render's proxy timeout. This function starts
 * the job, then polls until it's done.
 *
 * @param {File} file
 * @param {(status: "pending" | "processing") => void} [onStatus] - optional
 *   callback fired whenever the job's status updates, useful for showing
 *   a "Analyzing document..." message in the UI.
 */
export async function analyzeDocument(file, onStatus) {
  const formData = new FormData();

  formData.append("file", file);

  const { job_id } = await request("/api/documents/analyze", {
    method: "POST",
    body: formData,
  });

  onStatus?.("pending");

  for (let attempt = 0; attempt < ANALYZE_MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(ANALYZE_POLL_INTERVAL_MS);

    const statusData = await request(`/api/documents/analyze/status/${job_id}`);

    if (statusData.status === "done") {
      return statusData.result;
    }

    onStatus?.(statusData.status);
  }

  throw new ApiError(
    "Document analysis is taking longer than expected. Please try again.",
    408
  );
}


/**
 * Ask a question about an analyzed document.
 */
export function askDocument(documentId, question) {
  return request("/api/documents/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_id: documentId,
      question,
    }),
  });
}


/**
 * Generate an ELI5-style explanation.
 */
export function explainSimply(documentId) {
  return request("/api/documents/explain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_id: documentId,
    }),
  });
}


/**
 * Check backend health.
 */
export function checkHealth() {
  return request("/api/health");
}


export { ApiError };