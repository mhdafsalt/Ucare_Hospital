import React, { useState, useEffect } from "react";
import "./Navbar.css";
import AuthDropdown from "../AuthDropdown/AuthDropdown";

function Navbar({ isAuthOpen, onToggleAuth, onCloseAuth, onOpenAuth }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuthClick = (e) => {
    e.stopPropagation();
    if (onToggleAuth) {
      onToggleAuth();
    } else if (onOpenAuth) {
      onOpenAuth();
    }
  };

  return (
    <header className={`vital-nav-header ${isScrolled ? "vital-nav-scrolled" : ""}`}>
      <div className="vital-nav-container">
        {/* LOGO */}
        <a href="#Home" className="vital-nav-logo">
          <div className="vital-logo-symbol">
            <img src="./images/favicon.png" alt="Ucare Logo" />
          </div>
          <div className="vital-logo-text-box">
            <span className="vital-logo-title">Ucare</span>
            <span className="vital-logo-subtitle">HOSPITAL</span>
          </div>
        </a>

        {/* RIGHT CTA BUTTON & AUTH DROPDOWN POPOVER */}
        <div className="vital-nav-actions">
          <button
            type="button"
            className={`vital-join-btn ${isAuthOpen ? "active" : ""}`}
            onClick={handleAuthClick}
            aria-expanded={isAuthOpen}
          >
            Join Now
          </button>

          {/* AUTH DROPDOWN POPOVER (MATCHING SCREENSHOT) */}
          <AuthDropdown
            isOpen={isAuthOpen}
            onClose={onCloseAuth || (onToggleAuth ? onToggleAuth : onOpenAuth)}
            placement="right"
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
