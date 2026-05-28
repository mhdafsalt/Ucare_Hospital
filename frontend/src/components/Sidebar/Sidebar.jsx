// components/Sidebar.jsx

import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

function Sidebar({ menuItems }) {

  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] = useState(false);

  // LOGOUT
  const handleLogout = () => {

    localStorage.removeItem("user");

    navigate("/");

  };

  return (

    <>

      {/* MOBILE TOPBAR */}

      <div className="mobile-topbar">

        <div className="mobile-logo">
          <img src="../images/logo.png" alt="Ucare Logo" />
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
        >

          {mobileMenu ? <X /> : <Menu />}

        </button>

      </div>

      {/* SIDEBAR */}

      <aside className={`sidebar ${mobileMenu ? "show-sidebar" : ""}`}>

        <div>

          {/* DESKTOP LOGO */}

          <div className="logo-boxx">
            <img src="../images/logo.png" alt="Ucare Logo" />
          </div>

          {/* MENU */}

          <div className="sidebar-sections">

            {menuItems.map((section, index) => (

              <div
                key={index}
                className="sidebar-section"
              >

                <p className="section-title">
                  {section.title}
                </p>

                <div className="menu-list">

                  {section.items.map((item, i) => (

                    <button
                      key={i}
                      className={`menu-item ${item.active ? "active" : ""}`}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenu(false);
                      }}
                    >

                      {item.icon}

                      <span>{item.name}</span>

                    </button>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* SEARCH */}

        <div className="search-section">

          <p className="section-title">
            Search
          </p>

          <div className="search-box">

            <input
              type="text"
              placeholder="Search"
            />

            <span>⌕</span>

          </div>

          {/* LOGOUT */}

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </aside>

    </>

  );
}

export default Sidebar;