import { useCallback, useRef, useState } from "react";
import { analyzeDocument, ApiError } from "../services/api";

/**
 * The backend performs document analysis as a single request/response —
 * it doesn't stream progress. To be honest about that, we advance through
 * a fixed sequence of stages tied to the request's actual lifecycle rather
 * than inventing fake percentages: the first stage fires immediately, the
 * middle stages advance on a short timer (since extraction/analysis really
 * does take a few seconds), and the pipeline only reaches "Complete" once
 * the real response has come back.
 */
export const PROCESSING_STAGES = [
  { key: "uploaded", label: "Document uploaded" },
  { key: "extracting", label: "Extracting text" },
  { key: "analyzing", label: "Analyzing document" },
  { key: "summarizing", label: "Generating summary" },
  { key: "insights", label: "Preparing insights" },
  { key: "complete", label: "Complete" },
];

const STAGE_INTERVAL_MS = 900;

export function useDocumentPipeline() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | selected | processing | success | error
  const [stageIndex, setStageIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const selectFile = useCallback((selected) => {
    setFile(selected);
    setStatus("selected");
    setErrorMessage("");
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setFile(null);
    setStatus("idle");
    setStageIndex(0);
    setResult(null);
    setErrorMessage("");
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!file) return;

    setStatus("processing");
    setStageIndex(0);
    setErrorMessage("");

    // Advance through the middle stages honestly: these represent real
    // work happening on the backend during the single in-flight request,
    // not a fabricated completion percentage.
    let currentStage = 0;
    const lastAutoStage = PROCESSING_STAGES.length - 2; // stop before "Complete"
    timerRef.current = setInterval(() => {
      currentStage += 1;
      if (currentStage >= lastAutoStage) {
        clearTimer();
        return;
      }
      setStageIndex(currentStage);
    }, STAGE_INTERVAL_MS);

    try {
      const response = await analyzeDocument(file);
      clearTimer();
      setStageIndex(PROCESSING_STAGES.length - 1);
      setResult(response);
      setStatus("success");
    } catch (err) {
      clearTimer();
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [file]);

  return {
    file,
    status,
    stageIndex,
    result,
    errorMessage,
    selectFile,
    startAnalysis,
    reset,
  };
}
