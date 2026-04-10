import { useSessionApi, SessionGuard } from "../../hooks/useSessionApi";
import { LoadingState, ErrorState } from "./Summary";
import "./Summary.css"; // reuses same card styles

export default function ResearchGaps() {
  return (
    <SessionGuard>
      <ResearchGapsContent />
    </SessionGuard>
  );
}

function ResearchGapsContent() {
  const { data, loading, error, session_id } = useSessionApi("/gaps");

  const lines = normalizeToArray(data?.gaps);

  return (
    <div className="sp-root">
      <div className="sp-header">
        <h1 className="sp-title">Research Gaps</h1>
        {session_id && (
          <span className="sp-session">
            Session <code>{session_id.slice(0, 8)}…</code>
          </span>
        )}
      </div>

      {loading && <LoadingState label="Identifying research gaps…" />}
      {error   && <ErrorState message={error} />}

      {!loading && !error && lines.length > 0 && (
        <div className="sp-card">
          <ul className="sp-list">
            {lines.map((line, i) => (
              <li key={i} className="sp-item">
                <span className="sp-bullet sp-bullet--amber" />
                <span>{line.replace(/^[-•*]\s*/, "")}</span>
              </li>
            ))}
          </ul>
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
