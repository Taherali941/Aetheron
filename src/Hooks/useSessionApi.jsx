import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

/**
 * useSessionApi
 * Reads session_id from router state, calls the given endpoint on mount.
 *
 * @param {string} endpoint  - e.g. "/summary", "/gaps"
 * @param {object} extraBody - extra fields merged into POST body
 */
export function useSessionApi(endpoint, extraBody = {}) {
  const location   = useLocation();
  const session_id = location.state?.session_id ?? null;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!session_id) return;

    let cancelled = false;
    setLoading(true);
    setError("");
    setData(null);

    fetch(`${API_BASE}${endpoint}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ session_id, ...extraBody }),
    })
      .then((res) => {
        if (!res.ok) return res.text().then((t) => { throw new Error(t || `Error ${res.status}`); });
        return res.json();
      })
      .then((json) => { if (!cancelled) setData(json); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id, endpoint]);

  return { data, loading, error, session_id };
}

/**
 * SessionGuard
 * Renders a "no session" fallback when session_id is missing from router state.
 */
export function SessionGuard({ children }) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const session_id = location.state?.session_id ?? null;

  if (!session_id) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16, minHeight: "50vh",
        color: "var(--color-text-secondary, #888)", fontSize: "1rem",
      }}>
        <p>No active session. Please upload papers first.</p>
        <button
          onClick={() => navigate("/upload")}
          style={{
            padding: "8px 20px", borderRadius: 8,
            border: "1px solid var(--color-border-tertiary, #ddd)",
            background: "transparent", cursor: "pointer", fontSize: "0.9rem",
            color: "var(--color-text-primary, #333)",
          }}
        >
          ← Go to Upload
        </button>
      </div>
    );
  }

  return children;
}
