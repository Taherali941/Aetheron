import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Summary.css";

const API_BASE = "http://localhost:8000";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Dots() {
  return (
    <span className="sum-dots">
      <span className="sum-dot" />
      <span className="sum-dot" />
      <span className="sum-dot" />
    </span>
  );
}

function SummaryCard({ title, content }) {
  return (
    <div className="sum-card">
      {title && <div className="sum-card-title">{title}</div>}
      <div className="sum-card-content">{content}</div>
    </div>
  );
}

const tabStyle = (active) => ({
  padding: "8px 18px",
  borderRadius: "8px 8px 0 0",
  border: "1px solid",
  borderColor: active ? "#7c6af7" : "#20203a",
  borderBottom: active ? "2px solid #7c6af7" : "1px solid #20203a",
  background: active ? "rgba(124,106,247,0.12)" : "#0f0f22",
  color: active ? "#9b8ff5" : "#50506a",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "12.5px",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  transition: "all 0.15s",
  whiteSpace: "nowrap",
});

export default function Summary() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const navigate   = useNavigate();
  const location   = useLocation();
  const sessionId  = location.state?.session_id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const body = {};
        if (sessionId) body.session_id = sessionId;

        const res = await fetch(`${API_BASE}/summary`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [sessionId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="sum-loading-state">
          <div className="sum-loading-icon"><LogoIcon /></div>
          <div className="sum-loading-text">Synthesizing your research<Dots /></div>
          <div className="sum-loading-sub">Analysing uploaded documents and generating a comprehensive synthesis</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="sum-error-state">
          <div className="sum-error-icon">⚠</div>
          <div className="sum-error-title">Unable to generate summary</div>
          <div className="sum-error-msg">{error}</div>
          <div className="sum-error-hint">Make sure your FastAPI backend is running at {API_BASE}</div>
        </div>
      );
    }

    if (!data) return null;

    const text = data.summary ?? data.answer ?? data.text ?? JSON.stringify(data);
    const paragraphs = text.split(/\n+/).filter(Boolean);

    return (
      <div className="sum-content">
        <div className="sum-meta-row">
          <span className="sum-meta-badge">Full Synthesis</span>
          {sessionId && <span className="sum-meta-session">Session: {sessionId.slice(0, 8)}…</span>}
        </div>
        <div className="sum-cards-grid">
          {paragraphs.map((para, i) => (
            <SummaryCard key={i} content={para} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="sum-root">
      <div className="sum-main">

        {/* Top tab bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "16px 48px 0",
          borderBottom: "1px solid #1a1a30",
          background: "#0d0d1a",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <button style={tabStyle(false)} onClick={() => navigate(-1)}>
            <BackIcon /> &nbsp;Back
          </button>
          <div style={{ flex: 1 }} />
          <Link to="/summary" style={tabStyle(true)}>Summary</Link>
          <Link to="/gaps"    style={tabStyle(false)}>Research Gaps</Link>
          <Link to="/contradictions" style={tabStyle(false)}>Contradictions</Link>
        </div>

        {/* Page heading */}
        <div style={{ padding: "24px 48px 0" }}>
          <h1 className="sum-page-title">Research Summary</h1>
          <p className="sum-page-sub">Full-page synthesis of your uploaded documents</p>
        </div>

        <div className="sum-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}