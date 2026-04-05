import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">✨</div>
        <div>
          <h2>Cognitive</h2>
          <p>Sanctuary</p>
        </div>
      </div>

      {/* Nav */}
      <nav>
        <NavLink to="/" onClick={() => setIsOpen(false)}>
          Upload
        </NavLink>

        <NavLink to="/chat" onClick={() => setIsOpen(false)}>
          Chat
        </NavLink>

        <NavLink to="/ideas" onClick={() => setIsOpen(false)}>
          Ideas
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="primary-btn">New Analysis</button>
      </div>
    </aside>
  );
};

export default Sidebar;