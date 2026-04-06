import { useState, useRef, useEffect, useCallback } from "react";
import "./Chat.css";

// ╔══════════════════════════════════════════════════════════════╗
// ║  🔌  BACKEND INTEGRATION — Only section the backend dev     ║
// ║      needs to touch. Update BASE_URL and endpoints below.   ║
// ╚══════════════════════════════════════════════════════════════╝
const API_CONFIG = {
  BASE_URL:        "http://localhost:8000",
  CHAT_ENDPOINT:   "/chat",         // POST → { reply: string }
  STREAM_ENDPOINT: "/chat/stream",  // POST → SSE stream, end with: data: [DONE]
  headers: {
    "Content-Type": "application/json",
    // "Authorization": "Bearer YOUR_TOKEN",
  },
};
// Request body sent on every call:
// { messages: [{ role: "user"|"assistant", content: string }, ...] }
// ══════════════════════════════════════════════════════════════

async function callAPI({ messages, onChunk, onDone, onError, stream }) {
  const body = JSON.stringify({ messages });

  if (stream) {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.STREAM_ENDPOINT}`, {
        method: "POST", headers: API_CONFIG.headers, body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
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
  Logo:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Send:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Attach: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Mic:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M5 10a7 7 0 0014 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Copy:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/></svg>,
  Check:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Retry:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Bell:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Upload: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Chat:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Zap:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Gap:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Idea:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.3 4.7-3.3 6H8.3C6.3 13.7 5 11.5 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Report: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/></svg>,
  Gear:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/></svg>,
  Help:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};

const NAV_ITEMS = [
  { key: "Upload", label: "Upload" },
  { key: "Chat",   label: "Chat",          active: true },
  { key: "Zap",    label: "Contradictions" },
  { key: "Gap",    label: "Gaps" },
  { key: "Idea",   label: "Ideas" },
  { key: "Report", label: "Reports" },
];

const BOTTOM_ITEMS = [
  { key: "Gear", label: "Settings" },
  { key: "Help", label: "Support" },
];

const SUGGESTIONS = [
  "Synthesize two papers",
  "Find contradictions",
  "Identify research gaps",
  "Generate a summary report",
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

// ── Main App ───────────────────────────────────────────────
export default function CognitiveSanctuary() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [stream,   setStream]   = useState(true);
  const [error,    setError]    = useState(null);

  const bottomRef = useRef(null);
  const taRef     = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    <div className="cs-root">

      {/* ══ SIDEBAR ══ */}
      <aside className="cs-sidebar">

        {/* Brand */}
        <div className="cs-brand">
          <div className="cs-brand-icon">{Icons.Logo}</div>
          <div>
            <div className="cs-brand-name">Cognitive Sanctuary</div>
            <div className="cs-brand-sub">AI Research Environment</div>
          </div>
        </div>

        {/* New Analysis */}
        <div className="cs-new-btn-wrap">
          <button className="cs-new-btn" onClick={() => { setMessages([]); setError(null); }}>
            <span className="cs-new-btn-plus">+</span> New Analysis
          </button>
        </div>

        {/* Nav */}
        <nav className="cs-nav">
          {NAV_ITEMS.map((n) => (
            <div key={n.key} className={`cs-nav-item ${n.active ? "active" : ""}`}>
              <span className="cs-nav-icon">{Icons[n.key]}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="cs-bottom-nav">
          {BOTTOM_ITEMS.map((n) => (
            <div key={n.key} className="cs-nav-item">
              <span className="cs-nav-icon">{Icons[n.key]}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <main className="cs-main">

        {/* Header */}
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

            {/* Bell */}
            <button className="cs-icon-btn">{Icons.Bell}</button>

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

        {/* Input bar */}
        <div className="cs-input-wrap">
          <div className={`cs-input-box ${loading ? "loading" : ""}`}>

            <button className="cs-input-icon-btn">{Icons.Attach}</button>

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
              placeholder="Ask a deep research question…"
              disabled={loading}
              rows={1}
            />

            <div className="cs-input-actions">
              <button className="cs-input-icon-btn">{Icons.Mic}</button>
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
      </main>
    </div>
  );
}