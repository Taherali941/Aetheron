// ─────────────────────────────────────────────────────────────────────────────
// HOW TO FORWARD session_id IN YOUR SIDEBAR / LAYOUT
//
// The session_id lives in React Router's location.state.
// When the user clicks a sidebar link it must carry that state forward,
// otherwise Summary / ResearchGaps / Contradictions will show "no session".
//
// Replace your plain <Link> or <NavLink> elements in Layout.jsx with
// the <SessionLink> component below, or copy the pattern inline.
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, useLocation } from "react-router-dom";

/**
 * SessionLink — a NavLink that always forwards the current session state.
 *
 * Usage (drop-in replacement for your sidebar NavLinks):
 *   <SessionLink to="/summary">Summary</SessionLink>
 *   <SessionLink to="/gaps">Research Gaps</SessionLink>
 *   <SessionLink to="/contradictions">Contradictions</SessionLink>
 *   <SessionLink to="/chat">Chat</SessionLink>
 *   <SessionLink to="/ideas">Ideas</SessionLink>
 */
export function SessionLink({ to, children, className, ...rest }) {
  const location = useLocation();

  return (
    <NavLink
      to={to}
      state={location.state}   // ← forwards session_id + file_names
      className={className}
      {...rest}
    >
      {children}
    </NavLink>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE: how your Layout sidebar might look after the change
//
// import { SessionLink } from "./SessionLink";
//
// function Sidebar() {
//   return (
//     <nav>
//       <SessionLink to="/upload">Upload</SessionLink>
//       <SessionLink to="/summary">Summary</SessionLink>
//       <SessionLink to="/gaps">Research Gaps</SessionLink>
//       <SessionLink to="/contradictions">Contradictions</SessionLink>
//       <SessionLink to="/chat">Chat</SessionLink>
//       <SessionLink to="/ideas">Ideas</SessionLink>
//     </nav>
//   );
// }
// ─────────────────────────────────────────────────────────────────────────────
