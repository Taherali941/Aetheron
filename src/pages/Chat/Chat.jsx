import { useState, useRef, useEffect, useCallback } from "react";
import "./Chat.css";

// ══════════════════════════════════════════════════════════
// API CONFIG  — edit to match your FastAPI backend
// ══════════════════════════════════════════════════════════
const API_CONFIG = {
  BASE_URL:        "http://localhost:8000",
  CHAT_ENDPOINT:   "/chat",
  STREAM_ENDPOINT: "/chat/stream",
  headers: { "Content-Type": "application/json" },
};

async function callAPI({ messages, onChunk, onDone, onError, stream }) {
  const body = JSON.stringify({ messages });
  if (stream) {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.STREAM_ENDPOINT}`, {
        method: "POST", headers: API_CONFIG.headers, body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") { onDone(); return; }
          try { onChunk(JSON.parse(raw)); } catch { onChunk(raw); }
        }
      }
      onDone();
    } catch (e) { onError(e.message); }
  } else {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.CHAT_ENDPOINT}`, {
        method: "POST", headers: API_CONFIG.headers, body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      onChunk(data.reply);
      onDone();
    } catch (e) { onError(e.message); }
  }
}

// ── SVG Icons ──────────────────────────────────────────────
const Icons = {
  Send:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Attach:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Mic:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  MicOff:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 10M12 19v3M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Copy:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/></svg>,
  Check:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Retry:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Bell:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevUp:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevDown: <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  File:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>,
  Close:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Logo:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Search:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};

const SUGGESTIONS = [
  "Synthesize two papers",
  "Find contradictions",
  "Identify research gaps",
  "Generate a summary report",
];

// ── Mock notifications (replace with real data source) ─────
const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Analysis Complete",   body: "Your document synthesis finished successfully.", time: "2m ago",  unread: true  },
  { id: 2, title: "New Upload Detected", body: "Paper_2024_v2.pdf was added to your library.",   time: "14m ago", unread: true  },
  { id: 3, title: "Contradiction Found", body: "3 contradictions found across uploaded papers.",  time: "1h ago",  unread: false },
];

// ── Mock uploads (replace with real import from Upload page) ─
// In your project, import this from src/pages/Upload or fetch via API.
const MOCK_UPLOADS = [
  { id: 1, name: "Paper_2024_v2.pdf",           size: "1.2 MB", date: "Apr 6" },
  { id: 2, name: "LiteratureReview_final.pdf",  size: "3.4 MB", date: "Apr 5" },
  { id: 3, name: "Dataset_annotations.csv",     size: "780 KB", date: "Apr 4" },
  { id: 4, name: "Methodology_notes.docx",      size: "210 KB", date: "Apr 3" },
];

function fmtTime(d) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Typing Dots ────────────────────────────────────────────
function Dots() {
  return (
    <span className="cs-dots">
      <span className="cs-dot" />
      <span className="cs-dot" />
      <span className="cs-dot" />
    </span>
  );
}

// ── Message Bubble ─────────────────────────────────────────
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

// ── Error Banner ───────────────────────────────────────────
function ErrBanner({ msg, onClose }) {
  return (
    <div className="cs-error">
      <span>⚠ {msg}</span>
      <button className="cs-error-close" onClick={onClose}>✕</button>
    </div>
  );
}

// ── Notifications Modal ────────────────────────────────────
function NotifModal({ notifications, onClose, onMarkAll }) {
  return (
    <div className="cs-notif-backdrop" onClick={onClose}>
      <div className="cs-notif-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cs-notif-header">
          <span className="cs-notif-title">Notifications</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="cs-notif-mark-all" onClick={onMarkAll}>Mark all read</button>
            <button className="cs-icon-btn-sm" onClick={onClose}>{Icons.Close}</button>
          </div>
        </div>
        <div className="cs-notif-list">
          {notifications.length === 0 ? (
            <div className="cs-notif-empty">No notifications yet.</div>
          ) : notifications.map((n) => (
            <div key={n.id} className={`cs-notif-item ${n.unread ? "unread" : ""}`}>
              <div className="cs-notif-dot-wrap">
                {n.unread && <span className="cs-notif-unread-dot" />}
              </div>
              <div className="cs-notif-body">
                <div className="cs-notif-item-title">{n.title}</div>
                <div className="cs-notif-item-body">{n.body}</div>
                <div className="cs-notif-item-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Uploads Drawer ─────────────────────────────────────────
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
        {uploads.map((f) => (
          <div key={f.id} className="cs-upload-item">
            <div className="cs-upload-icon">{Icons.File}</div>
            <div className="cs-upload-info">
              <div className="cs-upload-name" title={f.name}>{f.name}</div>
              <div className="cs-upload-meta">{f.size} · {f.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN CHAT COMPONENT
// ══════════════════════════════════════════════════════════
export default function Chat() {
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [stream,        setStream]        = useState(true);
  const [error,         setError]         = useState(null);

  // Speech-to-text
  const [listening,     setListening]     = useState(false);
  const recognitionRef                    = useRef(null);

  // Notifications
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Uploads drawer
  const [uploadsOpen,   setUploadsOpen]   = useState(false);
  // Replace MOCK_UPLOADS with your real data: import from Upload page or fetch
  const uploads = MOCK_UPLOADS;

  const bottomRef = useRef(null);
  const taRef     = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Speech Recognition setup ───────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.lang            = "en-US";

    rec.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    recognitionRef.current = rec;
  }, []);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      setError("Speech recognition is not supported in this browser.");
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

  // ── Chat logic ─────────────────────────────────────────
  const addChunk = useCallback((chunk) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last?.typing === false && last?.streaming) {
        return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
      }
      if (last?.role === "assistant" && last?.typing) {
        return [...prev.slice(0, -1), { ...last, typing: false, streaming: true, content: chunk }];
      }
      return prev;
    });
  }, []);

  const finalize = useCallback(() => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, streaming: false, typing: false }];
      }
      return prev;
    });
    setLoading(false);
  }, []);

  const onError = useCallback((msg) => {
    setError(`Backend unreachable: ${msg} — make sure FastAPI is running at ${API_CONFIG.BASE_URL}`);
    setMessages((prev) => prev.filter((m) => !m.typing));
    setLoading(false);
  }, []);

  const submit = useCallback(async (override) => {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    if (taRef.current) taRef.current.style.height = "auto";

    const userMsg = { role: "user",      content: text, ts: new Date() };
    const asstMsg = { role: "assistant", content: "",   ts: new Date(), typing: true, streaming: false };
    setMessages((prev) => [...prev, userMsg, asstMsg]);
    setLoading(true);

    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    await callAPI({ messages: history, onChunk: addChunk, onDone: finalize, onError, stream });
  }, [input, loading, messages, stream, addChunk, finalize, onError]);

  const retry = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const idx = messages.lastIndexOf(lastUser);
    setMessages((prev) => prev.slice(0, idx));
    submit(lastUser.content);
  }, [messages, submit]);

  const isEmpty = messages.length === 0;

  const sessionDate = new Date()
    .toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })
    .toUpperCase();

  return (
    <div className="cs-chat-root">

      {/* ══ HEADER ══ */}
      <header className="cs-header">

        {/* Search */}
        <div className="cs-search-box">
          <span className="cs-search-icon">{Icons.Search}</span>
          <input className="cs-search-input" placeholder="Search research notes…" />
        </div>

        {/* Right controls */}
        <div className="cs-header-right">

          {/* Stream / Full toggle */}
          <div className="cs-mode-toggle">
            {[{ label: "Stream", val: true }, { label: "Full", val: false }].map(({ label, val }) => (
              <button
                key={label}
                className={`cs-mode-btn ${stream === val ? "active" : ""}`}
                onClick={() => setStream(val)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="cs-status">
            <span className="cs-status-dot" />
            <span className="cs-status-label">System Active</span>
          </div>

          {/* Bell with badge */}
          <div className="cs-notif-wrap">
            <button
              className="cs-icon-btn"
              onClick={() => { setNotifOpen((p) => !p); setUploadsOpen(false); }}
            >
              {Icons.Bell}
              {unreadCount > 0 && <span className="cs-bell-badge">{unreadCount}</span>}
            </button>

            {notifOpen && (
              <NotifModal
                notifications={notifications}
                onClose={() => setNotifOpen(false)}
                onMarkAll={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
              />
            )}
          </div>

          {/* User */}
          <div className="cs-user">
            <div className="cs-user-info">
              <div className="cs-user-name">User_name</div>
              <div className="cs-user-role">User_role</div>
            </div>
            <div className="cs-user-avatar">U</div>
          </div>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="cs-body">

        {/* Session label */}
        {!isEmpty && (
          <div className="cs-session-label">
            {sessionDate} • ANALYSIS SESSION
          </div>
        )}

        {/* Messages / Empty state */}
        <div className={`cs-messages ${isEmpty ? "empty" : ""}`}>
          {isEmpty ? (
            <div className="cs-empty-state">
              <div className="cs-empty-icon">{Icons.Logo}</div>
              <div>
                <h2 className="cs-empty-title">Start a New Analysis</h2>
                <p className="cs-empty-subtitle">
                  Ask a research question or upload documents to begin cross‑referencing and synthesis.
                </p>
              </div>
              <div className="cs-chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="cs-chip" onClick={() => submit(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => <Msg key={i} msg={m} onRetry={retry} />)}
              {error && <ErrBanner msg={error} onClose={() => setError(null)} />}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Error in empty state */}
        {isEmpty && error && (
          <div style={{ padding: "0 36px 8px" }}>
            <ErrBanner msg={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="cs-input-wrap">

          {/* Uploads drawer toggle arrow */}
          <div className="cs-uploads-toggle-row">
            <button
              className="cs-uploads-toggle-btn"
              onClick={() => { setUploadsOpen((p) => !p); setNotifOpen(false); }}
              title="View uploads"
            >
              {uploadsOpen ? Icons.ChevDown : Icons.ChevUp}
              <span>Uploads</span>
              <span className="cs-uploads-count">{uploads.length}</span>
            </button>
          </div>

          {/* Uploads drawer (slides up above input) */}
          {uploadsOpen && (
            <UploadsDrawer uploads={uploads} onClose={() => setUploadsOpen(false)} />
          )}

          {/* Input box */}
          <div className={`cs-input-box ${loading ? "loading" : ""}`}>
            <button className="cs-input-icon-btn" title="Attach file">{Icons.Attach}</button>

            <textarea
              ref={taRef}
              className="cs-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              placeholder={listening ? "Listening… speak now" : "Ask a deep research question…"}
              disabled={loading}
              rows={1}
            />

            <div className="cs-input-actions">
              {/* Mic button */}
              <button
                className={`cs-input-icon-btn cs-mic-btn ${listening ? "active" : ""}`}
                onClick={toggleMic}
                title={listening ? "Stop listening" : "Start voice input"}
              >
                {listening ? Icons.MicOff : Icons.Mic}
                {listening && <span className="cs-mic-pulse" />}
              </button>

              {/* Send */}
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
            Mode: <span className="cs-mode-label">{stream ? "Streaming (SSE)" : "Full Response"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}