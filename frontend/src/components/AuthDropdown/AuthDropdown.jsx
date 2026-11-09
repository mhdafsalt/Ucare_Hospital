import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./AuthDropdown.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginAPI } from "../../api/authApi";
import { X, User, Mail, ShieldCheck } from "lucide-react";

function AuthDropdown({ isOpen, onClose, placement = "right" }) {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ userId: false, email: false });
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Track responsive screen width
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on click outside (desktop fallback)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        !isMobile &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest(".vital-join-btn") &&
        !e.target.closest(".vital-explore-pill-btn")
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile, onClose]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const hasUserId = Boolean(userId.trim());
    const hasEmail = Boolean(email.trim());

    if (!hasUserId || !hasEmail) {
      setErrors({
        userId: !hasUserId,
        email: !hasEmail,
      });
      if (!hasUserId && !hasEmail) {
        toast.error("Please enter both your User ID and Email address.");
      } else if (!hasUserId) {
        toast.error("Please enter your User ID.");
      } else {
        toast.error("Please enter your registered Email address.");
      }
      return;
    }

    if (!email.includes("@")) {
      setErrors({ userId: false, email: true });
      toast.error("Please enter a valid email address.");
      return;
    }

    setErrors({ userId: false, email: false });

    try {
      setLoading(true);

      const res = await loginAPI({
        userId: userId.trim(),
        email: email.trim().toLowerCase(),
      });

      if (res.data.success) {
        toast.success(res.data.message);

        const detectedRole = res.data.role || res.data.user?.role || "admin";

        localStorage.setItem("userRole", detectedRole);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", res.data.user?.userId || res.data.user?.adminId || userId);
        localStorage.setItem("userName", res.data.user?.name || "User");

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        let imageUrl =
          res.data.user?.image ||
          res.data.user?.receptionistimage ||
          "https://i.pravatar.cc/150?img=12";
        localStorage.setItem("userImage", imageUrl);

        onClose();

        // Automatic seamless routing based on user's unified role in database
        if (detectedRole === "admin") {
          navigate("/admin/dashboard");
        } else if (detectedRole === "doctor") {
          navigate("/doctor/dashboard");
        } else if (detectedRole === "receptionist") {
          navigate("/receptionist/dashboard");
        } else if (detectedRole === "pharmacy" || detectedRole === "pharmacist") {
          navigate("/pharmacy/dashboard");
        } else if (detectedRole === "billing") {
          navigate("/billing/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else if (error.message === "Network Error") {
        toast.error("Network Error: Backend server is not reachable on port 5000.");
      } else if (error.message) {
        toast.error(`Login error: ${error.message}`);
      } else {
        toast.error("An error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderCardContent = () => (
    <>
      {/* HEADER */}
      <div className="vital-popover-header">
        <div className="vital-popover-header-title-wrap">
          <ShieldCheck size={18} className="vital-header-shield-icon" />
          <h3 className="vital-popover-title">Staff Portal Sign In</h3>
        </div>
        <button
          type="button"
          className="vital-popover-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* SUBTITLE */}
      <p className="vital-popover-desc">
        Enter your User ID and Email. The unified system automatically verifies your role and opens your designated dashboard.
      </p>

      {/* CREDENTIALS FORM */}
      <form onSubmit={handleLogin} className="vital-popover-form">
        {/* USER ID FIELD */}
        <div className="vital-popover-field">
          <label className="vital-popover-label">User ID</label>
          <div className="vital-popover-input-wrap">
            <span className="vital-popover-input-icon">
              <User size={16} />
            </span>
            <input
              type="text"
              placeholder="e.g. ADM001, DOC101, REC101"
              className={`vital-popover-input ${errors.userId ? "error" : ""}`}
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                setErrors({ ...errors, userId: false });
              }}
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        {/* EMAIL FIELD */}
        <div className="vital-popover-field">
          <label className="vital-popover-label">Email Address</label>
          <div className="vital-popover-input-wrap">
            <span className="vital-popover-input-icon">
              <Mail size={16} />
            </span>
            <input
              type="email"
              placeholder="staff@ucare.com"
              className={`vital-popover-input ${errors.email ? "error" : ""}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: false });
              }}
              disabled={loading}
            />
          </div>
        </div>

        {/* CONTINUE BUTTON */}
        <button
          type="submit"
          className="vital-popover-continue-btn"
          disabled={loading}
        >
          {loading ? "Verifying Credentials..." : "Sign In to Dashboard"}
        </button>
      </form>
    </>
  );

  // RENDER WITH CREATEPORTAL ON MOBILE TO PREVENT ANY OVERLAPPING FROM HOMEPAGE
  if (isMobile) {
    return createPortal(
      <div className="vital-auth-mobile-backdrop" onClick={onClose}>
        <div
          className="vital-popover-card vital-popover-mobile-card"
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
        >
          {renderCardContent()}
        </div>
      </div>,
      document.body
    );
  }

  // DESKTOP POPOVER
  return (
    <>
      <div className="vital-popover-desktop-backdrop" onClick={onClose} />
      <div className={`vital-popover-anchor placement-${placement}`} ref={dropdownRef}>
        {/* POINTER ARROW NOTCH */}
        <div className={`vital-popover-notch notch-${placement}`} />

        {/* WHITE CARD */}
        <div className="vital-popover-card">
          {renderCardContent()}
        </div>
      </div>
    </>
  );
}

export default AuthDropdown;
