import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ResearchGap.css";

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

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function Dots() {
  return (
    <span className="rg-dots">
      <span className="rg-dot" />
      <span className="rg-dot" />
      <span className="rg-dot" />
    </span>
  );
}

function GapCard({ gap, index }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = gap.length > 200;

  return (
    <div className="rg-card">
      <div className="rg-card-header">
        <div className="rg-card-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="rg-card-label">Research Gap</div>
      </div>
      <div className={`rg-card-text ${!expanded && isLong ? "truncated" : ""}`}>
        {gap}
      </div>
      {isLong && (
        <button className="rg-expand-btn" onClick={() => setExpanded((p) => !p)}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

const tabStyle = (active) => ({
  padding: "8px 18px",
  borderRadius: "8px 8px 0 0",
  border: "1px solid",
  borderColor: active ? "#e6a43c" : "#20203a",
  borderBottom: active ? "2px solid #e6a43c" : "1px solid #20203a",
  background: active ? "rgba(230,164,60,0.1)" : "#0f0f22",
  color: active ? "#e6a43c" : "#50506a",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "12.5px",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  transition: "all 0.15s",
  whiteSpace: "nowrap",
});

export default function ResearchGaps() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const sessionId = location.state?.session_id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function fetchGaps() {
      setLoading(true);
      setError(null);
      try {
        const body = {};
        if (sessionId) body.session_id = sessionId;

        const res = await fetch(`${API_BASE}/gaps`, {
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

    fetchGaps();
    return () => { cancelled = true; };
  }, [sessionId]);

  const parseGaps = (raw) => {
    if (Array.isArray(raw.gaps))   return raw.gaps;
    if (Array.isArray(raw.items))  return raw.items;
    if (Array.isArray(raw.result)) return raw.result;

    const text = raw.gaps ?? raw.answer ?? raw.text ?? JSON.stringify(raw);
    return String(text).split(/\n+/).filter((l) => l.trim().length > 0);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="rg-loading-state">
          <div className="rg-loading-icon"><LogoIcon /></div>
          <div className="rg-loading-text">Auditing research gaps<Dots /></div>
          <div className="rg-loading-sub">Scanning for missing links, unanswered questions, and blind spots across your documents</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rg-error-state">
          <div className="rg-error-icon">⚠</div>
          <div className="rg-error-title">Unable to identify gaps</div>
          <div className="rg-error-msg">{error}</div>
          <div className="rg-error-hint">Make sure your FastAPI backend is running at {API_BASE}</div>
        </div>
      );
    }

    if (!data) return null;

    const gaps = parseGaps(data);

    return (
      <div className="rg-content">
        <div className="rg-meta-row">
          <span className="rg-meta-badge"><AlertIcon /> Audit Report</span>
          <span className="rg-meta-count">{gaps.length} gap{gaps.length !== 1 ? "s" : ""} identified</span>
          {sessionId && <span className="rg-meta-session">Session: {sessionId.slice(0, 8)}…</span>}
        </div>
        <div className="rg-intro">
          These are the research gaps and missing links identified across your uploaded documents. Each represents an area where further investigation, data, or methodology is needed.
        </div>
        <div className="rg-cards-grid">
          {gaps.map((gap, i) => (
            <GapCard key={i} gap={gap} index={i} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rg-root">
      <div className="rg-main">

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
          <Link to="/summary" style={tabStyle(false)}>Summary</Link>
          <Link to="/gaps"    style={tabStyle(true)}>Research Gaps</Link>
          <Link to="/contradictions" style={tabStyle(false)}>Contradictions</Link>
        </div>

        {/* Page heading */}
        <div style={{ padding: "24px 48px 0" }}>
          <h1 className="rg-page-title">Research Gaps</h1>
          <p className="rg-page-sub">Structured audit of missing links and open questions</p>
        </div>

        <div className="rg-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}