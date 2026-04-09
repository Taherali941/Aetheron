import { Link, useNavigate } from "react-router-dom";
import "./Contradictions.css";

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

function ScaleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v18M12 3L6 8M12 3l6 5M6 12l-3 6h6L6 12zM18 12l-3 6h6l-3-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const tabStyle = (active) => ({
  padding: "8px 18px",
  borderRadius: "8px 8px 0 0",
  border: "1px solid",
  borderColor: active ? "#c85050" : "#20203a",
  borderBottom: active ? "2px solid #c85050" : "1px solid #20203a",
  background: active ? "rgba(200,80,80,0.1)" : "#0f0f22",
  color: active ? "#e06060" : "#50506a",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "12.5px",
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  transition: "all 0.15s",
  whiteSpace: "nowrap",
});

export default function Contradictions() {
  const navigate = useNavigate();

  return (
    <div className="con-root">
      <div className="con-main">

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
          <Link to="/gaps"    style={tabStyle(false)}>Research Gaps</Link>
          <Link to="/contradictions" style={tabStyle(true)}>Contradictions</Link>
        </div>

        {/* Page heading */}
        <div style={{ padding: "24px 48px 0" }}>
          <h1 className="con-page-title">Contradictions</h1>
          <p className="con-page-sub">Critical variances and conflicting findings across sources</p>
        </div>

        <div className="con-body">
          <div className="con-placeholder-card">
            <div className="con-placeholder-icon">
              <ScaleIcon />
            </div>
            <div className="con-placeholder-text-block">
              <p className="con-definition">
                A contradiction represents a critical variance in methodology or conflicting results between peer-reviewed sources.
              </p>
              <div className="con-notice-card">
                <div className="con-notice-badge">Coming Soon</div>
                <p className="con-notice-text">
                  This feature will be fully generated in the Future Scope of Aetheron.
                </p>
              </div>
            </div>
          </div>

          <div className="con-info-grid">
            <div className="con-info-card">
              <div className="con-info-icon">⚖</div>
              <div className="con-info-title">Methodological Variance</div>
              <div className="con-info-desc">Detects differences in research design, sampling strategy, or analytical frameworks between papers</div>
            </div>
            <div className="con-info-card">
              <div className="con-info-icon">🔬</div>
              <div className="con-info-title">Conflicting Results</div>
              <div className="con-info-desc">Surfaces statistically or directionally opposed findings from peer-reviewed studies</div>
            </div>
            <div className="con-info-card">
              <div className="con-info-icon">🧭</div>
              <div className="con-info-title">Claim Inconsistencies</div>
              <div className="con-info-desc">Identifies when authors make incompatible assertions about the same phenomenon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}