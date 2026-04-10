import { useSessionApi, SessionGuard } from "../../hooks/useSessionApi";
import "./Summary.css";

export default function Summary() {
  return (
    <SessionGuard>
      <SummaryContent />
    </SessionGuard>
  );
}

function SummaryContent() {
  const { data, loading, error, session_id } = useSessionApi("/summary");

  const lines = normalizeToArray(data?.summary);

  return (
    <div className="sp-root">
      <div className="sp-header">
        <h1 className="sp-title">Summary</h1>
        {session_id && (
          <span className="sp-session">
            Session <code>{session_id.slice(0, 8)}…</code>
          </span>
        )}
      </div>

      {loading && <LoadingState label="Generating summary…" />}
      {error   && <ErrorState message={error} />}

      {!loading && !error && lines.length > 0 && (
        <div className="sp-card">
          <ul className="sp-list">
            {lines.map((line, i) => (
              <li key={i} className="sp-item">
                <span className="sp-bullet" />
                <span>{line.replace(/^[-•*]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components (copy to other pages or extract further) ─
export function LoadingState({ label = "Loading…" }) {
  return (
    <div className="sp-state">
      <span className="sp-spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="sp-error">
      <span>⚠</span>
      {message}
    </div>
  );
}

// ── Utility ────────────────────────────────────────────────────────
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
