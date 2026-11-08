import React, { useState, useEffect, useRef } from "react";
import "./AuthDropdown.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginAPI } from "../../api/authApi";
import { X, UserCog, Stethoscope, UserCheck, User, Mail, Pill, Receipt } from "lucide-react";

function AuthDropdown({ isOpen, onClose, placement = "right" }) {
  const [role, setRole] = useState("admin");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ userId: false, email: false });

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
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
  }, [isOpen, onClose]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {
      userId: !userId.trim(),
      email: !email.trim(),
    };

    setErrors(newErrors);

    if (newErrors.userId || newErrors.email) {
      toast.error("Please enter both User ID and Email.");
      return;
    }

    try {
      setLoading(true);

      const res = await loginAPI({ role, userId, email });

      if (res.data.success) {
        toast.success(res.data.message);

        localStorage.setItem("userRole", role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", res.data.user.name);

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        let imageUrl = "https://i.pravatar.cc/150?img=12";
        if (role === "doctor" && res.data.user.image) {
          imageUrl = res.data.user.image;
        } else if (role === "receptionist" && res.data.user.receptionistimage) {
          imageUrl = res.data.user.receptionistimage;
        }

        localStorage.setItem("userImage", imageUrl);

        onClose();

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "doctor") {
          navigate("/doctor/dashboard");
        } else if (role === "receptionist") {
          navigate("/receptionist/dashboard");
        } else if (role === "pharmacy") {
          navigate("/pharmacy/dashboard");
        } else if (role === "billing") {
          navigate("/billing/dashboard");
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

  const idPlaceholder =
    role === "admin"
      ? "e.g. ADM001 or admin"
      : role === "doctor"
      ? "e.g. DOC001"
      : role === "receptionist"
      ? "e.g. REC001"
      : role === "pharmacy"
      ? "e.g. PHARM01"
      : "e.g. BILL01";

  const emailPlaceholder =
    role === "admin"
      ? "e.g. admin@ucare.com"
      : role === "doctor"
      ? "e.g. doctor@ucare.com"
      : role === "receptionist"
      ? "e.g. receptionist@ucare.com"
      : role === "pharmacy"
      ? "e.g. pharmacy@ucare.com"
      : "e.g. billing@ucare.com";

  return (
    <div className={`vital-popover-anchor placement-${placement}`} ref={dropdownRef}>
      {/* POINTER ARROW NOTCH MATCHING SCREENSHOT */}
      <div className={`vital-popover-notch notch-${placement}`} />

      {/* WHITE CARD */}
      <div className="vital-popover-card">
        {/* HEADER */}
        <div className="vital-popover-header">
          <h3 className="vital-popover-title">Log in or register</h3>
          <button
            type="button"
            className="vital-popover-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ROLE SELECTION TABS */}
        <div className="vital-popover-roles">
          <button
            type="button"
            className={`vital-popover-role-pill ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
            disabled={loading}
          >
            <UserCog size={13} />
            <span>Admin</span>
          </button>
          <button
            type="button"
            className={`vital-popover-role-pill ${role === "doctor" ? "active" : ""}`}
            onClick={() => setRole("doctor")}
            disabled={loading}
          >
            <Stethoscope size={13} />
            <span>Doctor</span>
          </button>
          <button
            type="button"
            className={`vital-popover-role-pill ${role === "receptionist" ? "active" : ""}`}
            onClick={() => setRole("receptionist")}
            disabled={loading}
          >
            <UserCheck size={13} />
            <span>Reception</span>
          </button>
          <button
            type="button"
            className={`vital-popover-role-pill ${role === "pharmacy" ? "active" : ""}`}
            onClick={() => setRole("pharmacy")}
            disabled={loading}
          >
            <Pill size={13} />
            <span>Pharmacy</span>
          </button>
          <button
            type="button"
            className={`vital-popover-role-pill ${role === "billing" ? "active" : ""}`}
            onClick={() => setRole("billing")}
            disabled={loading}
          >
            <Receipt size={13} />
            <span>Billing</span>
          </button>
        </div>

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
                placeholder={idPlaceholder}
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
            <label className="vital-popover-label">Email</label>
            <div className="vital-popover-input-wrap">
              <span className="vital-popover-input-icon">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder={emailPlaceholder}
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

          {/* CONTINUE BUTTON MATCHING SCREENSHOT */}
          <button
            type="submit"
            className="vital-popover-continue-btn"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Continue"}
          </button>
        </form>

        {/* FOOTER MATCHING SCREENSHOT */}
        <div className="vital-popover-footer">
          <p className="vital-popover-footer-prompt">Quick credentials helper</p>
          <button
            type="button"
            className="vital-popover-footer-link"
            onClick={() => {
              if (role === "admin") {
                setUserId("ADM001");
                setEmail("admin@ucare.com");
                toast.info("Auto-filled default Admin credentials (ADM001 / admin@ucare.com)");
              } else if (role === "pharmacy") {
                setUserId("PHARM01");
                setEmail("pharmacy@ucare.com");
                toast.info("Auto-filled Pharmacy credentials (PHARM01 / pharmacy@ucare.com)");
              } else if (role === "billing") {
                setUserId("BILL01");
                setEmail("billing@ucare.com");
                toast.info("Auto-filled Billing credentials (BILL01 / billing@ucare.com)");
              } else {
                toast.info(`Please log in as Admin first to add ${role} accounts via dashboard.`);
              }
            }}
          >
            {role === "admin"
              ? "Use default Admin credentials (ADM001)"
              : role === "pharmacy"
              ? "Use Pharmacy demo credentials (PHARM01)"
              : role === "billing"
              ? "Use Billing demo credentials (BILL01)"
              : "How to get credentials?"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthDropdown;

