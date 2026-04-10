import { useSessionApi, SessionGuard } from "../../hooks/useSessionApi";
import { LoadingState, ErrorState } from "./Summary";
import "./Summary.css";

const CONTRADICTIONS_QUESTION =
  "What are the key contradictions, conflicting findings, and opposing methodologies between the research papers?";

export default function Contradictions() {
  return (
    <SessionGuard>
      <ContradictionsContent />
    </SessionGuard>
  );
}

function ContradictionsContent() {
  const { data, loading, error, session_id } = useSessionApi("/query", {
    question: CONTRADICTIONS_QUESTION,
  });

  const lines = normalizeToArray(data?.answer);

  return (
    <div className="sp-root">
      <div className="sp-header">
        <h1 className="sp-title">Contradictions</h1>
        {session_id && (
          <span className="sp-session">
            Session <code>{session_id.slice(0, 8)}…</code>
          </span>
        )}
      </div>

      {loading && <LoadingState label="Analyzing contradictions…" />}
      {error   && <ErrorState message={error} />}

      {!loading && !error && lines.length > 0 && (
        <div className="sp-card">
          <ul className="sp-list">
            {lines.map((line, i) => (
              <li key={i} className="sp-item">
                <span className="sp-bullet sp-bullet--red" />
                <span>{line.replace(/^[-•*]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>

      )}

      {/* Sources */}
      {data?.sources?.length > 0 && (
        <div className="sp-sources">
          <span className="sp-sources__label">Sources</span>
          {data.sources.map((s, i) => (
            <span key={i} className="sp-sources__pill">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function normalizeToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const lines = value
      .split(/\n+/)
      .map((l) => l.replace(/^\s*\d+[\.\)]\s*/, "").trim())
      .filter(Boolean);
    return lines.length > 1 ? lines : [value];
  }
  return [String(value)];
}
