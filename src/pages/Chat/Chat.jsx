import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const API_CONFIG = {
  BASE_URL: "http://localhost:8000",
  UPLOAD_ENDPOINT: "/upload",
  QUERY_ENDPOINT: "/query",
};

async function queryRAG(question, sessionId) {
  const body = { question };
  if (sessionId) body.session_id = sessionId;
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.QUERY_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function uploadFiles(files) {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.UPLOAD_ENDPOINT}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const Icons = {
  Send:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Attach:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Mic:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  MicOff:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 10M12 19v3M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Copy:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/></svg>,
  Check:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Retry:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevUp:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevDown: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  File:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>,
  Close:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Logo:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Source:   <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Idea:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.2 6l-.8.5V18H9v-2.5l-.8-.5A7 7 0 0112 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const RESEARCH_ACTIONS = [
  { label: "Synthesize Papers",  query: "...", primary: true,  navigate: null },
  { label: "Generate Summary",    query: null, primary: false, navigate: "/summary" }, 
  { label: "Identify Gaps",       query: null, primary: false, navigate: "/gaps" },   
  { label: "Find Contradictions", query: null, primary: false, navigate: "/contradictions" }, 
  { label: "Generate Idea",       query: "...", primary: false, navigate: "/ideas"  },
];

function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Dots() {
  return (
    <span className="cs-dots">
      <span className="cs-dot" />
      <span className="cs-dot" />
      <span className="cs-dot" />
    </span>
  );
}

function SourcePills({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="cs-sources">
      <span className="cs-sources-label">
        {Icons.Source} Sources
      </span>
      <div className="cs-sources-list">
        {sources.map((src, i) => (
          <span key={i} className="cs-source-pill" title={src}>
            {Icons.File}
            {typeof src === "string"
              ? src.split("/").pop().split("\\").pop()
              : `Source ${i + 1}`}
          </span>
        ))}
      </div>
    </div>
  );
}

function Msg({ msg, onRetry }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`cs-msg ${isUser ? "user" : "assistant"}`}>
      {!isUser && (
        <div className="cs-msg-header">
          <div className="cs-msg-avatar">{Icons.Logo}</div>
          <span className="cs-msg-role-label">Research Assistant</span>
        </div>
      )}

      <div className={`cs-bubble ${isUser ? "user" : "assistant"}`}>
        {msg.typing ? <Dots /> : msg.content}
        <div className="cs-bubble-time">{fmtTime(msg.ts)}</div>
      </div>

      {!isUser && !msg.typing && msg.sources?.length > 0 && (
        <SourcePills sources={msg.sources} />
      )}

      {!isUser && !msg.typing && (
        <div className="cs-msg-actions">
          <button className="cs-action-btn" onClick={copy}>
            {copied ? Icons.Check : Icons.Copy}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button className="cs-action-btn" onClick={onRetry}>
            {Icons.Retry} Retry
          </button>
        </div>
      )}
    </div>
  );
}

function ErrBanner({ msg, onClose }) {
  return (
    <div className="cs-error">
      <span>⚠ {msg}</span>
      <button className="cs-error-close" onClick={onClose}>✕</button>
    </div>
  );
}

function UploadsDrawer({ uploads, onClose }) {
  return (
    <div className="cs-uploads-drawer">
      <div className="cs-uploads-header">
        <span className="cs-uploads-title">Recent Uploads</span>
        <button className="cs-icon-btn-sm" onClick={onClose}>{Icons.Close}</button>
      </div>
      <div className="cs-uploads-hint">
        Manage all files in <span className="cs-uploads-link">Uploads</span> page
      </div>
      <div className="cs-uploads-list">
        {uploads.length === 0 ? (
          <div className="cs-uploads-empty">No files uploaded yet.</div>
        ) : (
          uploads.map((f, i) => (
            <div key={f.id ?? i} className="cs-upload-item">
              <div className="cs-upload-icon">{Icons.File}</div>
              <div className="cs-upload-info">
                <div className="cs-upload-name" title={f.name}>{f.name}</div>
                <div className="cs-upload-meta">{f.size} · {f.date}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [listening,   setListening]   = useState(false);
  const [uploadsOpen, setUploadsOpen] = useState(false);
  const [uploads,     setUploads]     = useState([]);
  const [sessionId,   setSessionId]   = useState(null);
  const [uploadMsg,   setUploadMsg]   = useState(null);

  const navigate = useNavigate();
  const bottomRef      = useRef(null);
  const taRef          = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef   = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec          = new SpeechRecognition();
    rec.continuous     = false;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
      if (taRef.current) {
        taRef.current.style.height = "auto";
        taRef.current.style.height =
          Math.min(taRef.current.scrollHeight, 200) + "px";
      }
    };

    rec.onend   = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
  }, []);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      setInput("");
      rec.start();
      setListening(true);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = "";

    setUploadMsg("Uploading...");
    try {
      const result = await uploadFiles(files);

      const newUploads = files.map((f) => ({
        id:   Math.random().toString(36).slice(2),
        name: f.name,
        size: f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(f.size / 1024).toFixed(0)} KB`,
        date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
      }));
      setUploads((prev) => [...prev, ...newUploads]);

      if (result?.session_id) {
        setSessionId(result.session_id);
      }

      setUploadMsg(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
      setTimeout(() => setUploadMsg(null), 2500);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      setUploadMsg(null);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const submit = useCallback(async (override) => {
    const question = (override ?? input).trim();
    if (!question || loading) return;

    setInput("");
    setError(null);
    if (taRef.current) taRef.current.style.height = "auto";

    const userMsg        = { role: "user", content: question, ts: new Date() };
    const asstPlaceholder = {
      role: "assistant", content: "", ts: new Date(),
      typing: true, sources: [],
    };
    setMessages((prev) => [...prev, userMsg, asstPlaceholder]);
    setLoading(true);

    try {
      const { answer, sources } = await queryRAG(question, sessionId);

      setMessages((prev) => {
        const withoutPlaceholder = prev.slice(0, -1);
        return [
          ...withoutPlaceholder,
          {
            role:    "assistant",
            content: answer,
            ts:      new Date(),
            typing:  false,
            sources: sources || [],
          },
        ];
      });
    } catch (e) {
      setError(
        `Backend unreachable: ${e.message} — make sure FastAPI is running at ${API_CONFIG.BASE_URL}`
      );
      setMessages((prev) => prev.filter((m) => !m.typing));
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionId]);

  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const idx = messages.lastIndexOf(lastUser);
    setMessages((prev) => prev.slice(0, idx));
    submit(lastUser.content);
  }, [messages, submit]);

  const handleActionClick = (action) => {
    if (action.navigate) {
      navigate(action.navigate, { state: { session_id: sessionId } });
      return;
    }
    if (action.query) {
      submit(action.query);
    }
  };

  const isEmpty     = messages.length === 0;
  const sessionDate = new Date()
    .toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();

  const ActionButtons = (
    <div className={`cs-action-row ${isEmpty ? "at-center" : "at-bottom"}`}>
      {RESEARCH_ACTIONS.map((action) => (
        <button
          key={action.label}
          className={`cs-chip${action.primary ? " primary" : ""}`}
          onClick={() => handleActionClick(action)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="cs-chat-root">
      <div className="cs-body">

        {!isEmpty && (
          <div className="cs-session-label">
            {sessionDate} • ANALYSIS SESSION
          </div>
        )}

        <div className={`cs-messages ${isEmpty ? "empty" : ""}`}>
          {isEmpty ? (
            <div className="cs-empty-state">
              <div className="cs-empty-icon">{Icons.Logo}</div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <Msg key={i} msg={m} onRetry={retry} />
              ))}
              {error && (
                <ErrBanner msg={error} onClose={() => setError(null)} />
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {isEmpty && ActionButtons}

        {isEmpty && error && (
          <div style={{ padding: "0 36px 8px" }}>
            <ErrBanner msg={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="cs-input-wrap">

          <div className="cs-uploads-toggle-row">
            <button
              className="cs-uploads-toggle-btn"
              onClick={() => setUploadsOpen((p) => !p)}
              title="View uploads"
            >
              {uploadsOpen ? Icons.ChevDown : Icons.ChevUp}
              <span>Uploads</span>
              <span className="cs-uploads-count">{uploads.length}</span>
            </button>

            {uploadMsg && (
              <span className="cs-upload-status-msg">{uploadMsg}</span>
            )}

            {sessionId && (
              <span className="cs-session-badge" title={`Session: ${sessionId}`}>
                Session active
              </span>
            )}

            {!isEmpty && ActionButtons}
          </div>

          {uploadsOpen && (
            <UploadsDrawer
              uploads={uploads}
              onClose={() => setUploadsOpen(false)}
            />
          )}

          <div className={`cs-input-box ${loading ? "loading" : ""}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              className="cs-input-icon-btn"
              title="Attach PDF"
              onClick={handleAttachClick}
            >
              {Icons.Attach}
            </button>

            <textarea
              ref={taRef}
              className="cs-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 200) + "px";
              }}
              placeholder={
                listening
                  ? "Listening… speak now"
                  : "Ask a question about your documents…"
              }
              disabled={loading}
              rows={1}
            />

            <div className="cs-input-actions">
              <button
                className={`cs-input-icon-btn cs-mic-btn ${listening ? "active" : ""}`}
                onClick={toggleMic}
                title={listening ? "Stop listening" : "Start voice input"}
              >
                {listening ? Icons.MicOff : Icons.Mic}
                {listening && <span className="cs-mic-pulse" />}
              </button>

              <button
                className={`cs-send-btn ${input.trim() && !loading ? "active" : ""}`}
                onClick={() => submit()}
                disabled={!input.trim() || loading}
              >
                {loading ? <Dots /> : Icons.Send}
              </button>
            </div>
          </div>

          <div className="cs-input-hint">
            <kbd className="cs-kbd">Enter</kbd> send &nbsp;·&nbsp;
            <kbd className="cs-kbd">Shift+Enter</kbd> new line &nbsp;·&nbsp;
            <span className="cs-mode-label">RAG · PDF Query</span>
          </div>
        </div>
      </div>
    </div>
  );
}
