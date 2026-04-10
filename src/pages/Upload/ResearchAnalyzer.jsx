import { useState, useRef, useCallback } from "react";
import "./ResearchAnalyzer.css";

// 🔧 Change this to your Flask backend URL
const FLASK_API_URL = "http://localhost:5000/analyze";

// ── Card config ───────────────────────────────────────────────────
const CARD_META = [
  {
    key:    "differences",
    label:  "Key Differences",
    icon:   "◈",
    accent: "var(--ra-blue)",
    desc:   "What sets each paper apart",
  },
  {
    key:    "gaps",
    label:  "Research Gaps",
    icon:   "◉",
    accent: "var(--ra-amber)",
    desc:   "Unaddressed areas & open questions",
  },
  {
    key:    "summary",
    label:  "Synthesis",
    icon:   "◆",
    accent: "var(--ra-emerald)",
    desc:   "Cross-paper insights & overlaps",
  },
];

// ── Icons ─────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <circle cx="19" cy="19" r="18.5" stroke="currentColor" strokeOpacity="0.15" />
    <path
      d="M19 25V13M19 13L14 18M19 13L24 18"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
    />
    <path d="M12 27h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M10.5 2H5a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 005 16h8a1.5 1.5 0 001.5-1.5V6L10.5 2z"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
    />
    <path d="M10.5 2v4H14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const PdfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 13h1.5a1 1 0 010 2H9v-4h1.5a1 1 0 010 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M14 11v4m0-4h1a1.5 1.5 0 010 3h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M17 11v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M17 13h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

// ── ResultCard ────────────────────────────────────────────────────
function ResultCard({ meta, data, index }) {
  const [expanded, setExpanded] = useState(false);

  const items = Array.isArray(data)
    ? data
    : typeof data === "string"
    ? data.split("\n").filter(Boolean)
    : [String(data)];

  const preview = items.slice(0, 3);
  const rest    = items.slice(3);

  return (
    <div
      className="ra-card"
      style={{
        "--card-delay":  `${index * 0.12}s`,
        "--card-accent": meta.accent,
      }}
    >
      <div className="ra-card__header">
        <span className="ra-card__icon">{meta.icon}</span>
        <div className="ra-card__title-group">
          <h3 className="ra-card__title">{meta.label}</h3>
          <p className="ra-card__desc">{meta.desc}</p>
        </div>
        <span className="ra-card__count">{items.length}</span>
      </div>

      <ul className="ra-card__list">
        {preview.map((item, i) => (
          <li key={i} className="ra-card__item">
            <span className="ra-card__bullet" />
            <span>{item.replace(/^[-•*]\s*/, "")}</span>
          </li>
        ))}
        {expanded &&
          rest.map((item, i) => (
            <li key={`r${i}`} className="ra-card__item ra-card__item--extra">
              <span className="ra-card__bullet" />
              <span>{item.replace(/^[-•*]\s*/, "")}</span>
            </li>
          ))}
      </ul>

      {rest.length > 0 && (
        <button
          className="ra-card__expand"
          onClick={() => setExpanded((p) => !p)}
        >
          {expanded ? "↑ Show less" : `↓ ${rest.length} more`}
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function ResearchAnalyzer() {
  const [files,    setFiles]    = useState([]);
  const [dragging, setDragging] = useState(false);
  const [status,   setStatus]   = useState("idle");
  const [results,  setResults]  = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef();

  // ── File handling ───────────────────────────────────────────────
  const addFiles = useCallback((incoming) => {
    const valid = Array.from(incoming).filter((f) =>
      /\.(pdf|docx|txt)$/i.test(f.name)
    );
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))];
    });
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  // ── Send files to Flask ─────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!files.length) return;

    setStatus("uploading");
    setResults(null);
    setErrorMsg("");

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch(FLASK_API_URL, {
        method: "POST",
        body:   formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error: ${res.status}`);
      }

      const json = await res.json();
      setResults(json);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Could not reach the server. Is Flask running?");
      setStatus("error");
    }
  };

  const reset = () => {
    setFiles([]);
    setResults(null);
    setStatus("idle");
    setErrorMsg("");
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="ra-root">

      {/* ── Page Hero ── */}
      <div className="ra-hero">
        <div className="ra-hero__eyebrow">
          <span className="ra-hero__dot" />
          PDF Research Analysis
        </div>
        <h1 className="ra-hero__title">
          Upload Your<br />
          <span className="ra-hero__title-accent">Research Papers</span>
        </h1>
        <p className="ra-hero__desc">
          Upload up to <strong>10 PDF documents</strong> and let Luminary do the heavy lifting —
          extracting key differences, surfacing research gaps, and synthesizing
          cross-paper insights in seconds.
        </p>

        {/* Feature pills */}
        <div className="ra-hero__pills">
          <span className="ra-pill"><PdfIcon /> PDF only</span>
          <span className="ra-pill">◈ Key differences</span>
          <span className="ra-pill">◉ Research gaps</span>
          <span className="ra-pill">◆ Synthesis</span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="ra-divider" />

      {/* ── Upload Section ── */}
      <div className="ra-upload">

        {/* Drop zone */}
        <div
          className={[
            "ra-dropzone",
            dragging     ? "ra-dropzone--over"      : "",
            files.length ? "ra-dropzone--has-files" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Upload research papers"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            multiple
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="ra-dropzone__inner">
            <div className="ra-dropzone__icon">
              <UploadIcon />
            </div>
            <p className="ra-dropzone__headline">
              {dragging ? "Release to add papers" : "Drop research papers here"}
            </p>
            <p className="ra-dropzone__sub">
              PDF · DOCX · TXT &nbsp;·&nbsp;{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                browse files
              </span>
            </p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <ul className="ra-filelist">
            {files.map((f) => (
              <li key={f.name} className="ra-filelist__item">
                <FileIcon />
                <span className="ra-filelist__name">{f.name}</span>
                <span className="ra-filelist__size">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  className="ra-filelist__remove"
                  onClick={() => removeFile(f.name)}
                  aria-label={`Remove ${f.name}`}
                >
                  <XIcon />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Action row */}
        <div className="ra-actions">
          <button
            className={[
              "ra-actions__analyze",
              status === "uploading" ? "ra-actions__analyze--loading" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleAnalyze}
            disabled={!files.length || status === "uploading"}
          >
            {status === "uploading" ? (
              <>
                <span className="ra-spinner" />
                Analyzing…
              </>
            ) : (
              <>
                <span className={`ra-dot${files.length ? " ra-dot--on" : ""}`} />
                Analyze
                {files.length
                  ? ` ${files.length} paper${files.length > 1 ? "s" : ""}`
                  : " Papers"}
              </>
            )}
          </button>

          {(status === "success" || status === "error") && (
            <button className="ra-actions__reset" onClick={reset}>
              Start over
            </button>
          )}
        </div>

        {/* Error banner */}
        {status === "error" && (
          <div className="ra-error">
            <span>⚠</span>
            {errorMsg}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {status === "success" && results && (
        <div className="ra-results">
          <div className="ra-results__label">
            <span className="ra-results__line" />
            <span>Analysis Complete</span>
            <span className="ra-results__line" />
          </div>

          <div className="ra-grid">
            {CARD_META.map((meta, i) => (
              <ResultCard
                key={meta.key}
                meta={meta}
                data={
                  results[meta.key] ??
                  ["No data returned for this section."]
                }
                index={i}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}