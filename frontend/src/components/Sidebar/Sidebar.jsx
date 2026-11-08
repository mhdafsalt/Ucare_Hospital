import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";

function Sidebar({ menuItems = [], logo = "Ucare Hospital", panelSubtitle = "" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userName, setUserName] = useState("Administrator");
  const [userRole, setUserRole] = useState("Admin");
  const [userEmail, setUserEmail] = useState("admin@ucare.com");

  useEffect(() => {
    const storedName = localStorage.getItem("userName") || localStorage.getItem("user");
    const storedRole = localStorage.getItem("userRole");
    if (storedName) setUserName(storedName);
    if (storedRole) {
      setUserRole(storedRole);
      setUserEmail(`${storedRole.toLowerCase()}@ucare.com`);
    }
  }, []);

  const getPanelSubtitle = () => {
    if (panelSubtitle) return panelSubtitle;
    if (location.pathname.startsWith("/admin")) return "HOSPITAL ADMIN";
    if (location.pathname.startsWith("/doctor")) return "DOCTOR PORTAL";
    if (location.pathname.startsWith("/receptionist")) return "RECEPTION DESK";
    if (location.pathname.startsWith("/pharmacy")) return "PHARMACY DEPT";
    if (location.pathname.startsWith("/billing")) return "BILLING & ACCOUNTS";
    return `${userRole.toUpperCase()} PANEL`;
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="mobile-topbar">
        <div className="mobile-brand" onClick={() => navigate("/")}>
          <div className="sidebar-logo-symbol" style={{ width: 34, height: 34 }}>
            <img src="./images/favicon.png" alt="Ucare Logo" />
          </div>
          <div className="brand-text-col">
            <span className="mobile-brand-name">Ucare</span>
            <span className="brand-subtitle">{getPanelSubtitle()}</span>
          </div>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenu && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* SIDEBAR WRAPPER (SPARK ADMIN STYLE) */}
      <aside className={`sidebar-wrapper ${mobileMenu ? "show-sidebar" : ""}`}>
        {/* BRAND LOGO / IDENTITY */}
        <div className="sidebar-brand-box" onClick={() => navigate("/")}>
          <div className="sidebar-brand">
            <div className="sidebar-logo-symbol">
              <img src="./images/favicon.png" alt="Ucare Logo" />
            </div>
            <div className="brand-text-col">
              <span className="brand-title">Ucare</span>
              <span className="brand-subtitle">{getPanelSubtitle()}</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <div className="sidebar-menu-scroll">
          {menuItems.map((section, idx) => (
            <div key={idx} className="sidebar-menu-section">
              <div className="sidebar-menu-title">{section.title}</div>
              <ul className="sidebar-menu-list">
                {section.items.map((item, i) => {
                  const isActive = item.active || (item.path && location.pathname === item.path);
                  return (
                    <li key={i} className="sidebar-menu-item">
                      <button
                        className={`sidebar-menu-link ${isActive ? "active" : ""}`}
                        onClick={() => {
                          if (item.path) navigate(item.path);
                          setMobileMenu(false);
                        }}
                      >
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-label">{item.name}</span>
                        {isActive && <span className="active-dot" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* SIDEBAR PROFILE CARD (FOOTER) */}
        <div className="sidebar-profile-wrapper">
          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar">
              <span>{userName?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="sidebar-profile-info">
              <div className="sidebar-profile-name">{userName}</div>
              <div className="sidebar-profile-email">{userEmail}</div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
