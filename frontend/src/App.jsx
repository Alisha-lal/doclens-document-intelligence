import { useState } from "react";

import Header from "./components/Header/Header";
import UploadZone from "./components/UploadZone/UploadZone";
import FileCard from "./components/FileCard/FileCard";
import ProcessingSteps from "./components/ProcessingSteps/ProcessingSteps";
import DocumentStats from "./components/DocumentStats/DocumentStats";
import SummaryPanel from "./components/SummaryPanel/SummaryPanel";
import InsightsPanel from "./components/InsightsPanel/InsightsPanel";
import TopicsPanel from "./components/TopicsPanel/TopicsPanel";
import AskDocument from "./components/AskDocument/AskDocument";
import ELI5Panel from "./components/ELI5Panel/ELI5Panel";
import ImprovementPanel from "./components/ImprovementPanel/ImprovementPanel";
import ErrorMessage from "./components/ErrorMessage/ErrorMessage";

import {
  useDocumentPipeline,
  PROCESSING_STAGES,
} from "./hooks/useDocumentPipeline";

import { validateFile } from "./utils/fileValidation";

import "./App.css";


/* =========================================
   ANALYSIS NAVIGATION
========================================= */

const ANALYSIS_TABS = [
  { key: "overview", label: "Overview" },
  { key: "summary", label: "Summary" },
  { key: "insights", label: "Insights" },
  { key: "key-points", label: "Key Points" },
  { key: "topics", label: "Topics & Entities" },
  { key: "ask", label: "Ask Document" },
  { key: "explain", label: "Explain Simply" },
  { key: "improvements", label: "Improvements" },
];


export default function App() {
  const {
    file,
    status,
    stageIndex,
    result,
    errorMessage,
    selectFile,
    startAnalysis,
    reset,
  } = useDocumentPipeline();

  const [selectionError, setSelectionError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");


  /* =========================================
     FILE SELECTION
  ========================================= */

  const handleFileSelected = (candidate) => {
    const validationError = validateFile(candidate);

    if (validationError) {
      setSelectionError(validationError);
      return;
    }

    setSelectionError("");
    selectFile(candidate);
  };


  /* =========================================
     RESET
  ========================================= */

  const handleRemove = () => {
    setSelectionError("");
    reset();
    setActiveTab("summary");
  };


  /* =========================================
     TAB CHANGE
  ========================================= */

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };


  const isDashboard = status === "success" && result;


  return (
    <div className="app-shell">

      {/* =====================================
          HEADER
      ===================================== */}

      <Header
        onReset={reset}
        showReset={false}
      />


      {/* =====================================
          MAIN
      ===================================== */}

      <main className="app-main">

        <div className="container">

          {/* ===================================
              LANDING PAGE
          =================================== */}

          {status === "idle" && (
            <section className="hero">

              <div className="hero__content">

                <h1 className="hero__title">
                  Understand what's inside your{" "}
                  <span className="hero__title-accent">
                    documents.
                  </span>
                </h1>

                <p className="hero__subtitle">
                  Extract important information, get a clear summary, and ask
                  questions about your document with answers grounded in the
                  document itself.
                </p>

              </div>


              <UploadZone
                onFileSelected={handleFileSelected}
                error={selectionError}
              />

            </section>
          )}


          {/* ===================================
              FILE SELECTED
          =================================== */}

          {status === "selected" && file && (
            <section className="hero hero--compact">

              <h2 className="hero__title hero__title--small">
                Ready to analyze
              </h2>

              <FileCard
                file={file}
                onRemove={handleRemove}
                onConfirm={startAnalysis}
              />

            </section>
          )}


          {/* ===================================
              PROCESSING
          =================================== */}

          {status === "processing" && (
            <section className="processing-view">

              <p className="processing-view__subtitle">
                DocLens is extracting and understanding your document.
              </p>

              <ProcessingSteps
                stages={PROCESSING_STAGES}
                currentIndex={stageIndex}
              />

            </section>
          )}


          {/* ===================================
              ERROR
          =================================== */}

          {status === "error" && (
            <section className="processing-view">

              <ErrorMessage
                message={errorMessage}
                onRetry={reset}
              />

            </section>
          )}

        </div>


        {/* ===================================
            ANALYSIS / DASHBOARD
            Deliberately OUTSIDE .container so
            the sidebar can span the full width
            without being inset by container
            padding/max-width.
        =================================== */}

        {isDashboard && (
          <section className="analysis-layout">

            {/* =================================
                LEFT SIDEBAR
            ================================= */}

            <aside className="analysis-nav">

              <div className="analysis-nav__heading">

                <span>
                  DOCUMENT
                </span>

                <strong>
                  Analysis
                </strong>

              </div>


              <nav
                className="analysis-nav__items"
                aria-label="Document analysis sections"
              >

                {ANALYSIS_TABS.map((tab) => {

                  const isActive = activeTab === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      className={`analysis-nav__item ${
                        isActive
                          ? "analysis-nav__item--active"
                          : ""
                      }`}
                      onClick={() => handleTabChange(tab.key)}
                      aria-current={
                        isActive
                          ? "page"
                          : undefined
                      }
                    >
                      {tab.label}
                    </button>
                  );

                })}

              </nav>


              <button
                type="button"
                className="analysis-nav__reset"
                onClick={handleRemove}
              >
                Analyze another document
              </button>

            </aside>


            {/* =================================
                RIGHT CONTENT
            ================================= */}

            <div className="analysis-content">

              {/* =================================
                  DOCUMENT INFORMATION
              ================================= */}

              <DocumentStats
                filename={result.filename}
                fileType={result.file_type}
                stats={result.stats}
              />


              {/* =================================
                  MOCK AI NOTICE
              ================================= */}

              {result.ai_mode === "mock" && (
                <div
                  className="mock-banner"
                  role="status"
                >
                  Development mode: no Gemini API key is configured,
                  so this analysis uses deterministic mock content.
                  Set <code>GEMINI_API_KEY</code> to see real AI output.
                </div>
              )}


              {/* =================================
                  SUMMARY
              ================================= */}

              {activeTab === "summary" && (
                <SummaryPanel
                  analysis={result.analysis}
                />
              )}


              {/* =================================
                  OVERVIEW
              ================================= */}

              {activeTab === "overview" && (
                <div className="analysis-placeholder">

                  <p className="analysis-placeholder__eyebrow">
                    Overview
                  </p>

                  <h2>
                    Your document at a glance
                  </h2>

                  <p>
                    Choose a section from the navigation to explore
                    what DocLens found in your document.
                  </p>

                </div>
              )}


              {/* =================================
                  INSIGHTS
              ================================= */}

              {activeTab === "insights" && (
                <InsightsPanel
                  keyInsights={result.analysis.key_insights}
                  keyPoints={result.analysis.key_points}
                />
              )}


              {/* =================================
                  KEY POINTS
              ================================= */}

              {activeTab === "key-points" && (
                <div className="analysis-placeholder">

                  <p className="analysis-placeholder__eyebrow">
                    Key Points
                  </p>

                  <h2>
                    Important points
                  </h2>

                  {result.analysis.key_points?.length > 0 ? (
                    <ul className="analysis-placeholder__list">

                      {result.analysis.key_points.map(
                        (point, index) => (
                          <li key={index}>
                            {point}
                          </li>
                        )
                      )}

                    </ul>
                  ) : (
                    <p>
                      No key points were found.
                    </p>
                  )}

                </div>
              )}


              {/* =================================
                  TOPICS & ENTITIES
              ================================= */}

              {activeTab === "topics" && (
                <TopicsPanel
                  topics={result.analysis.topics}
                  entities={result.analysis.important_entities}
                />
              )}


              {/* =================================
                  ASK DOCUMENT
              ================================= */}

              {activeTab === "ask" && (
                <AskDocument
                  documentId={result.document_id}
                />
              )}


              {/* =================================
                  EXPLAIN SIMPLY
              ================================= */}

              {activeTab === "explain" && (
                <ELI5Panel
                  documentId={result.document_id}
                />
              )}


              {/* =================================
                  IMPROVEMENTS
              ================================= */}

              {activeTab === "improvements" && (
                <ImprovementPanel
                  suggestions={
                    result.analysis.improvement_suggestions
                  }
                />
              )}

            </div>

          </section>
        )}

      </main>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="app-footer">

        <div className="container app-footer__inner">

          <nav
            className="app-footer__nav"
            aria-label="Footer navigation"
          >

            <a href="#extract">
              Extract
            </a>

            <a href="#understand">
              Understand
            </a>

            <a href="#ask">
              Ask
            </a>

          </nav>


          <p className="app-footer__copyright">
            © 2026 DocLens
          </p>

        </div>

      </footer>

    </div>
  );
}
