import { useState } from "react";
import "./Topbar.css";

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const Topbar = ({ toggleSidebar }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifCount = 3;

  return (
    <div className="topbar">

      {/* ✅ Hamburger — untouched */}
      <button className="hamburger" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Right section */}
      <div className="topbar-right">

        {/* Help */}
        <button className="topbar-icon-btn" title="Help">
          <HelpIcon />
        </button>

        {/* Notifications */}
        <div className="topbar-dropdown-wrap">
          <button
            className="topbar-icon-btn"
            title="Notifications"
            onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
          >
            <BellIcon />
            {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
          </button>

          {notifOpen && (
            <div className="topbar-dropdown notif-dropdown">
              <div className="dropdown-header">
                <span>Notifications</span>
                <button className="mark-read">Mark all read</button>
              </div>
              {[
                { title: "New research result", time: "2 min ago", unread: true },
                { title: "Analysis complete",   time: "1 hr ago",  unread: true },
                { title: "Report exported",     time: "Yesterday", unread: false },
              ].map((n, i) => (
                <div key={i} className={`notif-item ${n.unread ? "unread" : ""}`}>
                  <div className="notif-dot" />
                  <div>
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-time">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="topbar-icon-btn" title="Settings">
          <SettingsIcon />
        </button>

        {/* Divider */}
        <div className="topbar-divider" />

        {/* Profile */}
        <div className="topbar-dropdown-wrap">
          <button
            className="topbar-profile-btn"
            onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}
          >
            <div className="avatar">DE</div>
            <span className="profile-name">Dr. Elena</span>
            <ChevronIcon />
          </button>

          {profileOpen && (
            <div className="topbar-dropdown profile-dropdown">
              <div className="profile-header">
                <div className="avatar avatar-lg">DE</div>
                <div>
                  <p className="profile-fullname">Dr. Elena</p>
                  <p className="profile-role">Research Lead</p>
                </div>
              </div>
              <div className="dropdown-divider" />
              {["My Profile", "Preferences", "API Keys", "Billing"].map(item => (
                <button key={item} className="dropdown-item">{item}</button>
              ))}
              <div className="dropdown-divider" />
              <button className="dropdown-item danger">Sign Out</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Topbar;