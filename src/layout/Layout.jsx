import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="main">
        <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;