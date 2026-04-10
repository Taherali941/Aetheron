import React, { useState } from "react";
import "./Ideas.css";

const API_BASE = "http://localhost:8000";

// ─── Parser ─────────────────────────────────────────────────────────────────

function parseIdeasText(text) {
  const blocks = text.split(/\n{2,}/);
  const ideas = [];

  for (const block of blocks) {
    if (!block.trim()) continue;

    const get = (label) => {
      const regex = new RegExp(`${label}:\\s*(.+)`, "i");
      const match = block.match(regex);
      return match ? match[1].trim() : "";
    };

    const title    = get("Title");
    const problem  = get("Problem");
    const solution = get("Solution");
    const impact   = get("Impact");
    const category = get("Category");

    if (title || problem || solution) {
      ideas.push({ title, problem, solution, impact, category });
    }
  }

  return ideas;
}

// ─── Icon Components ─────────────────────────────────────────────────────────

const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const IconChevronDown = ({ open }) => (
  <svg
    width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconSparkle = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const CategoryIcon = ({ category }) => {
  const icons = {
    INFRASTRUCTURE: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    HEALTHTECH: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    CYBERSECURITY: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    LOGISTICS: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    MOONSHOT: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  };
  return icons[category] || (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
};

// ─── IdeaCard ────────────────────────────────────────────────────────────────

const IdeaCard = ({
  category = "", title = "", problem = "", solution = "",
  impact = "", metadata = null, badge = null, onExpand,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isEmpty = !title && !problem && !solution && !impact;

  const handleExpand = () => {
    setExpanded((prev) => !prev);
    if (!expanded && onExpand) onExpand({ category, title });
  };

  return (
    <article className={`idea-card ${isEmpty ? "idea-card--empty" : ""}`}>
      <div className="idea-card__header">
        <div className="idea-card__icon-wrap">
          <CategoryIcon category={category?.toUpperCase()} />
        </div>
        <div className="idea-card__header-right">
          {badge && <span className="idea-card__badge idea-card__badge--special">{badge}</span>}
          {category && !badge && <span className="idea-card__badge">{category.toUpperCase()}</span>}
        </div>
      </div>

      <div className="idea-card__body">
        {isEmpty ? (
          <div className="idea-card__skeleton">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--short" />
          </div>
        ) : (
          <>
            <h2 className="idea-card__title">{title}</h2>
            <div className="idea-card__section">
              <span className="idea-card__label">PROBLEM</span>
              <p className="idea-card__text">{problem}</p>
            </div>
            <div className="idea-card__section">
              <span className="idea-card__label">SOLUTION</span>
              <p className="idea-card__text">{solution}</p>
            </div>
            <div className={`idea-card__expand-wrap ${expanded ? "idea-card__expand-wrap--open" : ""}`}>
              <div className="idea-card__section idea-card__section--impact">
                <span className="idea-card__label idea-card__label--impact">IMPACT</span>
                <p className="idea-card__text idea-card__text--impact">{impact}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {!isEmpty && (
        <div className="idea-card__footer">
          <div className="idea-card__meta">
            {metadata && Object.entries(metadata).map(([key, val]) => (
              <div key={key} className="idea-card__meta-item">
                <span className="idea-card__meta-key">{key}</span>
                <span className="idea-card__meta-val">{val}</span>
              </div>
            ))}
          </div>
          <button className="idea-card__expand-btn" onClick={handleExpand} aria-expanded={expanded}>
            <span>{expanded ? "Hide Details" : "View Deep Analysis"}</span>
            <IconChevronDown open={expanded} />
          </button>
        </div>
      )}
    </article>
  );
};

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="idea-empty-state">
    <div className="idea-empty-state__icon"><IconSparkle /></div>
    <h3 className="idea-empty-state__title">No ideas synthesized yet</h3>
    <p className="idea-empty-state__desc">
      Upload a dataset or start a chat to generate AI-synthesized startup ideas and research pathways.
    </p>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const IdeaGeneratorPage = () => {
  const [ideas,    setIdeas]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [topic,    setTopic]    = useState("");
  const [pdfFiles, setPdfFiles] = useState([]);

  // ── Generate Handler (calls POST /ideas) ──────────────────────────────────
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setIdeas([]);

    try {
      const body = {};
      if (topic.trim()) body.topic = topic.trim();

      const res = await fetch(`${API_BASE}/ideas`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        // Backend error: expects { "message": "..." }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }

      const json = await res.json();

      // Backend returns { "ideas": "raw text block" }
      const raw = json.ideas ?? json.answer ?? json.text ?? "";
      const parsed = parseIdeasText(raw);
      setIdeas(parsed);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── PDF file picker (UI only — files already in session on backend) ────────
  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files || []);
    setPdfFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="ig-page">

      {/* ── Header ── */}
      <header className="ig-header">
        <div className="ig-header__left">
          <div className="ig-tag">
            <IconSparkle />
            <span>Synthesized Insights</span>
          </div>
          <h1 className="ig-title">Idea Generator</h1>
          <p className="ig-desc">
            Transforming raw research data into actionable innovation clusters.
            Explore AI-synthesized startup concepts and research pathways based on
            your recent datasets.
          </p>
        </div>

        <div className="ig-header__actions">
          {/* Topic input */}
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Optional topic…"
            style={{
              background: "#16162a",
              border: "1px solid #20203a",
              borderRadius: "9px",
              padding: "8px 14px",
              color: "#c4c4de",
              fontSize: "12.5px",
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
              width: "180px",
            }}
          />

          {/* Generate button */}
          <button
            className="ig-btn ig-btn--filter"
            onClick={handleGenerate}
            disabled={loading}
          >
            <IconSparkle />
            <span>{loading ? "Generating…" : "Generate"}</span>
          </button>

          {/* Filter button (existing) */}
          <button className="ig-btn ig-btn--filter">
            <IconFilter />
            <span>Filter</span>
          </button>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          margin: "0 0 16px",
          padding: "10px 16px",
          background: "#1e0e0e",
          border: "1px solid #4a1a1a",
          borderRadius: "10px",
          color: "#d06060",
          fontSize: "12.5px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span>⚠ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background: "none", border: "none", color: "#d06060", cursor: "pointer", fontSize: "15px" }}
          >✕</button>
        </div>
      )}

      {/* ── Grid ── */}
      <main className="ig-grid">
        {loading ? (
          skeletonCards.map((_, i) => <IdeaCard key={`skeleton-${i}`} />)
        ) : ideas.length === 0 ? (
          <div className="ig-grid__empty"><EmptyState /></div>
        ) : (
          ideas.map((idea, i) => (
            <IdeaCard
              key={idea.id || i}
              category={idea.category}
              title={idea.title}
              problem={idea.problem}
              solution={idea.solution}
              impact={idea.impact}
              metadata={idea.metadata}
              badge={idea.badge}
              onExpand={(data) => console.log("Deep analysis requested:", data)}
            />
          ))
        )}
      </main>

      {/* ── Footer ──
      <footer className="ig-footer">
        <span>Algorithm: Neural-Synthesis v4.2</span>
        <span>© 2024 Cognitive Sanctuary</span>
      </footer> */}
    </div>
  );
};

export default IdeaGeneratorPage;
export { IdeaCard };


/**
 * ══════════════════════════════════════════════════════════
 * BACKEND API ENDPOINTS SUMMARY (Idea Generator Integration)
 * ══════════════════════════════════════════════════════════
 * * BASE URL: (Uses relative path or proxy)
 * * 1. IDEAS GENERATION ENDPOINT
 * - Route:  /ideas
 * - Method: POST
 * - Payload Type: application/json
 * - Request Body: 
 * { "topic": "string" } // topic is optional/nullable
 * - Expected Response: 
 * { "ideas": "string" } 
 * - Note: The "ideas" field should be a raw text block containing 
 * multiple startup concepts separated by double newlines.
 * * ══════════════════════════════════════════════════════════
 * IMPLEMENTATION DETAILS FOR BACKEND TEAM
 * ══════════════════════════════════════════════════════════
 * * [Data Parsing Logic]
 * The frontend includes a heuristic parser (parseIdeasText) that 
 * looks for specific labels in your text response. For best 
 * results, the "ideas" string should follow this format:
 * * Title: [Concept Name]
 * Problem: [Description]
 * Solution: [Description]
 * Impact: [Description]
 * Category: [INFRASTRUCTURE | HEALTHTECH | etc.]
 * * * [PDF Handling]
 * Currently, 'pdfFiles' are managed in local state for the UI, 
 * but the handleGenerate function is only sending the "topic". 
 * Ensure the backend is either:
 * a) Already processing previously uploaded files in the session.
 * b) Updated to receive files alongside the topic if state is stateless.
 * * * [Error Handling]
 * The frontend expects a JSON error object on non-200 status:
 * { "message": "Detailed error description" }
 * * ══════════════════════════════════════════════════════════
 */