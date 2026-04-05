import "./Topbar.css";

const Topbar = ({ toggleSidebar }) => {
  return (
    <div className="topbar">
      <button className="hamburger" onClick={toggleSidebar}>
        ☰
      </button>

      <input
        type="text"
        placeholder="Search research..."
        className="search"
      />

      <div className="profile">
        <span>Dr. Elena</span>
      </div>
    </div>
  );
};

export default Topbar;