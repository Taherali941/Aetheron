import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ResearchAnalyzer.css";

const API_BASE = "http://127.0.0.1:8000";

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

// ── Main Component ────────────────────────────────────────────────
export default function ResearchAnalyzer() {
  const [files,    setFiles]    = useState([]);
  const [dragging, setDragging] = useState(false);
  const [status,   setStatus]   = useState("idle"); // idle | uploading | error
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef();
  const navigate = useNavigate();

  // ── File handling ─────────────────────────────────────────────
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

  // ── Upload → redirect to /summary with session_id in state ────
  // Every subsequent page (Summary, ResearchGaps, Contradictions,
  // Chat, Ideas) reads location.state.session_id and calls its
  // own endpoint independently. The sidebar links must use
  // <Link to="/summary" state={location.state}> to forward
  // the session_id when navigating between pages.
  const handleAnalyze = async () => {
    if (!files.length) return;

    setStatus("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body:   formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }

      const { session_id, num_files } = await res.json();

      navigate("/summary", {
        state: {
          session_id,
          num_files,
          file_names: files.map((f) => f.name),
        },
      });
    } catch (err) {
      setErrorMsg(err.message || "Could not reach the server. Is FastAPI running?");
      setStatus("error");
    }
  };

  const reset = () => {
    setFiles([]);
    setStatus("idle");
    setErrorMsg("");
  };

  const isUploading = status === "uploading";

  return (
    <div className="ra-root">
      <div className="ra-upload">

        <div
          className={[
            "ra-dropzone",
            dragging     ? "ra-dropzone--over"      : "",
            files.length ? "ra-dropzone--has-files" : "",
          ].filter(Boolean).join(" ")}
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
            <div className="ra-dropzone__icon"><UploadIcon /></div>
            <p className="ra-dropzone__headline">
              {dragging ? "Release to add papers" : "Drop research papers here"}
            </p>
            <p className="ra-dropzone__sub">
              PDF · DOCX · TXT &nbsp;·&nbsp;{" "}
              <span onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                browse files
              </span>
            </p>
          </div>
        </div>

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

        <div className="ra-actions">
          <button
            className={[
              "ra-actions__analyze",
              isUploading ? "ra-actions__analyze--loading" : "",
            ].filter(Boolean).join(" ")}
            onClick={handleAnalyze}
            disabled={!files.length || isUploading}
          >
            {isUploading ? (
              <>
                <span className="ra-spinner" />
                Uploading…
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

          {status === "error" && (
            <button className="ra-actions__reset" onClick={reset}>
              Start over
            </button>
          )}
        </div>

        {status === "error" && (
          <div className="ra-error">
            <span>⚠</span>
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
