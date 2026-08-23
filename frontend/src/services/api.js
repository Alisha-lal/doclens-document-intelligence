/**
 * Centralized API client.
 * Every backend call goes through here so components never
 * construct fetch requests directly.
 */

// Render backend URL
const API_BASE_URL = "https://doclens-backend-721e.onrender.com";


class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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
 */
export function analyzeDocument(file) {
  const formData = new FormData();

  formData.append("file", file);

  return request("/api/documents/analyze", {
    method: "POST",
    body: formData,
  });
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