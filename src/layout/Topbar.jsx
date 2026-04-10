import { useState, useEffect, useRef } from "react";
import "./Topbar.css";

/* Icons (same as yours) */
const BellIcon = () => ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/> <path d="M13.73 21a2 2 0 0 1-3.46 0"/> </svg> ); 
const SettingsIcon = () => ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="3"/> <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/> </svg> ); 
const HelpIcon = () => ( <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10"/> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/> <line x1="12" y1="17" x2="12.01" y2="17"/> </svg> ); 
const ChevronIcon = () => ( <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <polyline points="6 9 12 15 18 9"/> </svg> ); 

const Topbar = ({ toggleSidebar }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const notifRef = useRef();
  const profileRef = useRef();
  const helpRef = useRef();
  const settingsRef = useRef();

  /* ✅ Dynamic Notifications */
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New research result", time: "2 min ago", unread: true },
    { id: 2, title: "Analysis complete", time: "1 hr ago", unread: true },
    { id: 3, title: "Report exported", time: "Yesterday", unread: false },
  ]);

  const notifCount = notifications.filter(n => n.unread).length;

  /* ✅ Close all dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ✅ Notification Logic */
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotifClick = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
  };

  return (
    <div className="topbar">

      <button className="hamburger" onClick={toggleSidebar}>☰</button>

      <div className="topbar-right">

        {/* ✅ HELP (STATIC MODAL) */}
        <div className="topbar-dropdown-wrap" ref={helpRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => {
              setHelpOpen(p => !p);
              setNotifOpen(false);
              setProfileOpen(false);
              setSettingsOpen(false);
            }}
          >
            <HelpIcon />
          </button>

          {helpOpen && (
            <div className="topbar-dropdown">
              <div className="dropdown-header">Help Center</div>

              <div className="dropdown-item">📄 Upload Guide</div>
              <div className="dropdown-item">📊 Analyze Papers</div>
              <div className="dropdown-item">💬 Chat Assistance</div>
              <div className="dropdown-item">⚙️ System Usage</div>

            </div>
          )}
        </div>

        {/* ✅ NOTIFICATIONS (DYNAMIC) */}
        <div className="topbar-dropdown-wrap" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => {
              setNotifOpen(p => !p);
              setProfileOpen(false);
              setHelpOpen(false);
              setSettingsOpen(false);
            }}
          >
            <BellIcon />
            {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
          </button>

          {notifOpen && (
            <div className="topbar-dropdown notif-dropdown">
              <div className="dropdown-header">
                Notifications
                <button className="mark-read" onClick={markAllRead}>
                  Mark all read
                </button>
              </div>

              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleNotifClick(n.id)}
                  className={`notif-item ${n.unread ? "unread" : ""}`}
                >
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

        {/* ✅ SETTINGS (STATIC MODAL) */}
        <div className="topbar-dropdown-wrap" ref={settingsRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => {
              setSettingsOpen(p => !p);
              setNotifOpen(false);
              setProfileOpen(false);
              setHelpOpen(false);
            }}
          >
            <SettingsIcon />
          </button>

          {settingsOpen && (
            <div className="topbar-dropdown">
              <div className="dropdown-header">Settings</div>

              <div className="dropdown-item">🌙 Theme: Dark</div>
              <div className="dropdown-item">🔔 Notifications</div>
              <div className="dropdown-item">🔐 Privacy</div>
              <div className="dropdown-item">🌐 Language</div>

            </div>
          )}
        </div>

        <div className="topbar-divider" />

        {/* ✅ PROFILE */}
        <div className="topbar-dropdown-wrap" ref={profileRef}>
          <button
            className="topbar-profile-btn"
            onClick={() => {
              setProfileOpen(p => !p);
              setNotifOpen(false);
              setHelpOpen(false);
              setSettingsOpen(false);
            }}
          >
            <div className="avatar">U</div>
            <span className="profile-name">Username</span>
            <ChevronIcon />
          </button>

          {profileOpen && (
            <div className="topbar-dropdown profile-dropdown">
              <div className="profile-header">
                <div className="avatar avatar-lg">U</div>
                <div>
                  <p className="profile-fullname">User</p>
                  <p className="profile-role">Research Lead</p>
                </div>
              </div>

              <div className="dropdown-divider" />
              <button className="dropdown-item">My Profile</button>
              <button className="dropdown-item">Preferences</button>
              <button className="dropdown-item">Billing</button>

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